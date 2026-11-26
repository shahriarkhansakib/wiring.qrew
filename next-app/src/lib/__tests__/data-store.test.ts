import { describe, expect, it } from "vitest";
import { DataStore, type QrewRepository } from "../data-store";
import { DEFAULT_DATA } from "../seed-data";
import type { PlatformStateData } from "../types";

class MemoryQrewRepository implements QrewRepository {
  private state: PlatformStateData;

  constructor(initial: PlatformStateData = DEFAULT_DATA) {
    this.state = JSON.parse(JSON.stringify(initial)) as PlatformStateData;
  }

  loadSync(): PlatformStateData {
    return JSON.parse(JSON.stringify(this.state)) as PlatformStateData;
  }

  saveSync(data: PlatformStateData): void {
    this.state = JSON.parse(JSON.stringify(data)) as PlatformStateData;
  }

  resetSync(): PlatformStateData {
    this.state = JSON.parse(JSON.stringify(DEFAULT_DATA)) as PlatformStateData;
    return this.loadSync();
  }

  async loadAsync(): Promise<PlatformStateData> {
    return this.loadSync();
  }

  async saveAsync(data: PlatformStateData): Promise<void> {
    this.saveSync(data);
  }
}

function createTestStore(): DataStore {
  return new DataStore(new MemoryQrewRepository(), DEFAULT_DATA);
}

describe("DataStore RBAC and cascade invariants", () => {
  it("prevents Platform Owner from becoming Tenant Admin and vice versa", () => {
    const store = createTestStore();
    const owner = store.getUsers().find((u) => u.platformRole === "Platform Owner");
    expect(owner).toBeDefined();

    // Platform Owner cannot be added directly as Tenant Admin
    expect(() =>
      store.addTenantMember("ten_apex", {
        userId: owner!.id,
        tenantRole: "Tenant Admin",
      })
    ).toThrow(/Business Rule Violation/);

    // Existing Tenant Admin cannot be promoted to Platform Owner
    const tenantAdminMember = store
      .getTenantMembers("ten_sst")
      .find((tm) => tm.tenantRole === "Tenant Admin");
    expect(tenantAdminMember).toBeDefined();

    expect(() =>
      store.updatePlatformUser(tenantAdminMember!.userId, { platformRole: "Platform Owner" })
    ).toThrow(/Business Rule Violation/);
  });

  it("enforces office-within-tenant scope and prerequisite tenant membership for office staff", () => {
    const store = createTestStore();

    expect(() => store.createOffice("", { name: "Orphan Branch", location: "Dhaka" })).toThrow(
      /Scope Violation/
    );

    const createdUser = store.createPlatformUser({
      name: "Test Maritime Officer",
      email: "officer.test@qrew.io",
      platformRole: "Platform User",
    });

    // Assigning to an office automatically creates prerequisite Tenant Member row
    store.addOfficeStaff("off_ctg_port", {
      userId: createdUser.id,
      officeRole: "Office Staff",
    });
    expect(
      store.getTenantMembers("ten_sst").some((tm) => tm.userId === createdUser.id)
    ).toBe(true);
    expect(
      store.getOfficeStaff("off_ctg_port").some((os) => os.userId === createdUser.id)
    ).toBe(true);

    // Removing from tenant cascades to remove office staff records inside that tenant
    store.removeTenantMember("ten_sst", createdUser.id);
    expect(
      store.getOfficeStaff("off_ctg_port").some((os) => os.userId === createdUser.id)
    ).toBe(false);
  });

  it("cascades tenant deletion across offices, memberships, and audit logs", () => {
    const store = createTestStore();
    const beforeAuditCount = store.getAuditLogs().length;

    const deleted = store.deleteTenant("ten_sst");
    expect(deleted).toBe(true);
    expect(store.getTenants().some((t) => t.id === "ten_sst")).toBe(false);
    expect(store.getOfficesByTenant("ten_sst")).toHaveLength(0);
    expect(store.getTenantMembers("ten_sst")).toHaveLength(0);
    expect(store.getAuditLogs().length).toBe(beforeAuditCount + 1);
  });

  it("supports full Invoice Template lifecycle including headerGrid & archival", () => {
    const store = createTestStore();
    const created = store.createInvoiceTemplate("off_ctg_port", {
      name: "Test Berth Invoice",
      type: "custom",
      code: "INV-TEST-01",
      headerGrid: {
        colsCount: 2,
        rowsCount: 1,
        cells: [
          {
            id: "c_0_0",
            row: 0,
            col: 0,
            colspan: 1,
            rowspan: 1,
            empty: false,
            key: "GRT",
            label: "GRT",
            value: "4200",
          },
          { id: "c_0_1", row: 0, col: 1, colspan: 1, rowspan: 1, empty: true },
        ],
      },
    });

    expect(created.type).toBe("custom");
    expect(created.headerGrid?.cells[0]?.value).toBe("4200");

    store.archiveInvoiceTemplate(created.id);
    expect(store.getInvoiceTemplateById(created.id)?.status).toBe("Archived");

    store.unarchiveInvoiceTemplate(created.id);
    expect(store.getInvoiceTemplateById(created.id)?.status).toBe("Active");

    const duplicated = store.duplicateInvoiceTemplate(created.id);
    expect(duplicated.id).not.toBe(created.id);
    expect(duplicated.name).toContain("(Copy)");

    expect(store.deleteInvoiceTemplate(created.id)).toBe(true);
    expect(store.getInvoiceTemplateById(created.id)).toBeNull();
  });
});
