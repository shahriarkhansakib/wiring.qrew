import { DEFAULT_DATA, STORAGE_KEY } from "./seed-data";
import type {
  AuditLogEntry,
  CurrentUser,
  Department,
  DepartmentMember,
  DepartmentMemberWithUser,
  InvoiceTemplate,
  MemberActivity,
  MemberTask,
  Office,
  OfficeConfig,
  OfficeStaff,
  OfficeStaffWithUser,
  OfficeWithCounts,
  OfficeWithDetails,
  OperationalFile,
  PlatformStateData,
  PremadeDeliverable,
  RoleDefinition,
  RolesByLevel,
  Tenant,
  TenantMember,
  TenantMemberWithUser,
  TenantWithCounts,
  TenantWithDetails,
  User,
  UserDetails,
  UserWithCounts,
} from "./types";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export interface QrewRepository {
  loadSync(): PlatformStateData;
  saveSync(data: PlatformStateData): void;
  resetSync(): PlatformStateData;
  loadAsync(): Promise<PlatformStateData>;
  saveAsync(data: PlatformStateData): Promise<void>;
}

export class LocalStorageQrewRepository implements QrewRepository {
  loadSync(): PlatformStateData {
    if (typeof window === "undefined") {
      return clone(DEFAULT_DATA);
    }

    try {
      window.localStorage.removeItem("qrew_platform_state");
      window.localStorage.removeItem("qrew_platform_state_v2");
      window.localStorage.removeItem("qrew_platform_state_v3");

      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<PlatformStateData>;
        if (!Array.isArray(parsed.tenants) || !Array.isArray(parsed.offices) || !Array.isArray(parsed.users)) {
          return this.resetSync();
        }
        const merged: PlatformStateData = {
          ...(clone(DEFAULT_DATA) as PlatformStateData),
          ...parsed,
          departments:
            parsed.departments && parsed.departments.length > 0
              ? parsed.departments
              : clone(DEFAULT_DATA.departments),
          departmentMembers:
            parsed.departmentMembers && parsed.departmentMembers.length > 0
              ? parsed.departmentMembers
              : clone(DEFAULT_DATA.departmentMembers),
          officeConfigs:
            parsed.officeConfigs && Object.keys(parsed.officeConfigs).length > 0
              ? parsed.officeConfigs
              : clone(DEFAULT_DATA.officeConfigs),
          memberTasks:
            parsed.memberTasks && parsed.memberTasks.length > 0
              ? parsed.memberTasks
              : clone(DEFAULT_DATA.memberTasks),
          memberActivity:
            parsed.memberActivity && parsed.memberActivity.length > 0
              ? parsed.memberActivity
              : clone(DEFAULT_DATA.memberActivity),
          operationalFiles:
            parsed.operationalFiles && parsed.operationalFiles.length > 0
              ? parsed.operationalFiles
              : clone(DEFAULT_DATA.operationalFiles),
          premadeDeliverables:
            parsed.premadeDeliverables && parsed.premadeDeliverables.length > 0
              ? parsed.premadeDeliverables
              : clone(DEFAULT_DATA.premadeDeliverables),
          invoiceTemplates:
            parsed.invoiceTemplates && parsed.invoiceTemplates.length > 0
              ? parsed.invoiceTemplates
              : clone(DEFAULT_DATA.invoiceTemplates),
        };
        return merged;
      }
    } catch (e) {
      console.warn("Could not read from localStorage, using initial dataset.", e);
    }

    const fresh = clone(DEFAULT_DATA);
    this.saveSync(fresh);
    return fresh;
  }

  saveSync(data: PlatformStateData): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to write to localStorage", e);
    }
  }

  resetSync(): PlatformStateData {
    const fresh = clone(DEFAULT_DATA);
    this.saveSync(fresh);
    return fresh;
  }

  async loadAsync(): Promise<PlatformStateData> {
    return this.loadSync();
  }

  async saveAsync(data: PlatformStateData): Promise<void> {
    this.saveSync(data);
  }
}

export class DataStore {
  public data: PlatformStateData;
  private readonly repo: QrewRepository;

  constructor(repo: QrewRepository = new LocalStorageQrewRepository(), initialData?: PlatformStateData) {
    this.repo = repo;
    this.data = initialData ? clone(initialData) : clone(DEFAULT_DATA);
  }

  hydrateFromStorage(): PlatformStateData {
    this.data = this.repo.loadSync();
    return this.data;
  }

  save(): void {
    this.repo.saveSync(this.data);
  }

  reset(): PlatformStateData {
    this.data = this.repo.resetSync();
    return this.data;
  }

  // --- Current User ---
  getCurrentUser(): CurrentUser {
    return this.data.currentUser;
  }

  setCurrentUser(userId: string): CurrentUser | null {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;
    this.data.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      platformRole: user.platformRole,
      avatar: user.name.trim().charAt(0).toUpperCase(),
    };
    this.save();
    return this.data.currentUser;
  }

  updateCurrentUser({ name, email }: { name: string; email: string }): CurrentUser {
    if (!name || !email) throw new Error("Name and email are required.");

    this.data.currentUser.name = name.trim();
    this.data.currentUser.email = email.trim();
    this.data.currentUser.avatar = name.trim().charAt(0).toUpperCase();

    const userInList = this.data.users.find((u) => u.id === this.data.currentUser.id);
    if (userInList) {
      userInList.name = this.data.currentUser.name;
      userInList.email = this.data.currentUser.email;
    }

    this.addAuditLog(
      this.data.currentUser.name,
      "UPDATE",
      "Platform User",
      this.data.currentUser.id,
      `Updated user profile (Name: "${this.data.currentUser.name}", Email: "${this.data.currentUser.email}")`
    );

    this.save();
    return this.data.currentUser;
  }

  // --- Statistics ---
  getStats() {
    return {
      totalTenants: this.data.tenants.length,
      activeTenants: this.data.tenants.filter((t) => t.status === "Active").length,
      totalOffices: this.data.offices.length,
      totalUsers: this.data.users.length,
    };
  }

  // --- Tenants ---
  getTenants(): TenantWithCounts[] {
    return this.data.tenants.map((tenant) => ({
      ...tenant,
      officeCount: this.data.offices.filter((o) => o.tenantId === tenant.id).length,
      memberCount: this.data.tenantMembers.filter((m) => m.tenantId === tenant.id).length,
    }));
  }

  getTenantById(id?: string | null): TenantWithDetails | null {
    let tenant = this.data.tenants.find((t) => t.id === id);
    if (!tenant && (id === "ten_ctg" || !id || this.data.tenants.length === 1)) {
      tenant = this.data.tenants[0];
    }
    if (!tenant) return null;
    const offices = this.getOfficesByTenant(tenant.id);
    const members = this.getTenantMembers(tenant.id);
    return {
      ...tenant,
      offices,
      members,
      officeCount: offices.length,
      memberCount: members.length,
    };
  }

  createTenant({
    name,
    ownerName,
    ownerEmail,
    plan,
    status,
  }: {
    name: string;
    ownerName: string;
    ownerEmail: string;
    plan?: string;
    status?: string;
  }): Tenant {
    const id =
      "ten_" +
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .substring(0, 16) +
      "_" +
      Math.floor(Math.random() * 1000);
    const date = new Date().toISOString().split("T")[0];

    let user = this.data.users.find(
      (u) => u.email.toLowerCase() === ownerEmail.toLowerCase() || u.name.toLowerCase() === ownerName.toLowerCase()
    );

    // BUSINESS RULE: A Platform Owner cannot be assigned as a Tenant Admin or Tenant Owner
    if (user && user.platformRole === "Platform Owner") {
      throw new Error(
        `Business Rule Violation: "${user.name}" is a Platform Owner. A Platform Owner cannot be a Tenant Admin or Tenant Owner.`
      );
    }

    if (!user) {
      user = {
        id: "usr_" + Math.floor(Math.random() * 9000 + 1000),
        name: ownerName,
        email: ownerEmail,
        platformRole: "Platform User",
        status: "Active",
        createdAt: date,
      };
      this.data.users.push(user);
    }

    const newTenant: Tenant = {
      id,
      name,
      ownerName: user.name,
      ownerEmail: user.email,
      status: status || "Active",
      plan: plan || "Enterprise",
      createdAt: date,
    };

    this.data.tenants.unshift(newTenant);

    this.data.tenantMembers.push({
      id: "tm_" + Date.now() + "_" + Math.floor(Math.random() * 100),
      tenantId: id,
      userId: user.id,
      tenantRole: "Tenant Admin",
      status: "Active",
      joinedAt: date,
    });

    this.addAuditLog(
      this.data.currentUser.name,
      "CREATE",
      "Tenant",
      id,
      `Created tenant "${name}" assigned to ${ownerName}`
    );

    this.save();
    return newTenant;
  }

  updateTenant(id: string, updates: Partial<Tenant>): Tenant | null {
    const tenant = this.data.tenants.find((t) => t.id === id);
    if (!tenant) return null;

    const oldStatus = tenant.status;
    Object.assign(tenant, updates);

    let action = "UPDATE";
    let desc = `Updated tenant "${tenant.name}" properties`;
    if (updates.status && updates.status !== oldStatus) {
      action = "STATUS_CHANGE";
      desc = `${updates.status === "Active" ? "Activated" : "Suspended"} tenant "${tenant.name}"`;
    }

    this.addAuditLog(this.data.currentUser.name, action, "Tenant", id, desc);
    this.save();
    return tenant;
  }

  deleteTenant(id: string): boolean {
    const index = this.data.tenants.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Tenant not found");

    const tenant = this.data.tenants[index];

    const tenantOfficeIds = this.data.offices.filter((o) => o.tenantId === id).map((o) => o.id);
    this.data.officeStaff = this.data.officeStaff.filter((os) => !tenantOfficeIds.includes(os.officeId));
    this.data.offices = this.data.offices.filter((o) => o.tenantId !== id);
    this.data.tenantMembers = this.data.tenantMembers.filter((tm) => tm.tenantId !== id);
    this.data.tenants.splice(index, 1);

    this.addAuditLog(
      this.data.currentUser.name,
      "DELETE",
      "Tenant",
      id,
      `Permanently deleted tenant organization "${tenant.name}"`
    );

    this.save();
    return true;
  }

  // --- Offices ---
  getOfficesByTenant(tenantId?: string | null): OfficeWithCounts[] {
    const targetId = tenantId === "ten_ctg" || !tenantId ? "ten_sst" : tenantId;
    return this.data.offices
      .filter((o) => o.tenantId === targetId || o.tenantId === tenantId)
      .map((office) => ({
        ...office,
        staffCount: this.data.officeStaff.filter((s) => s.officeId === office.id).length,
      }));
  }

  getOfficeById(officeId?: string | null): OfficeWithDetails | null {
    if (!officeId) return null;
    let office = this.data.offices.find((o) => o.id === officeId);
    if (!office && officeId === "off_ctg_agr") {
      office = this.data.offices.find((o) => o.id === "off_mgl_port");
    }
    if (!office) return null;
    const tenant = this.data.tenants.find((t) => t.id === office.tenantId);
    const staff = this.getOfficeStaff(office.id);
    return {
      ...office,
      tenant,
      staff,
      staffCount: staff.length,
    };
  }

  createOffice(tenantId: string, { name, location }: { name: string; location?: string }): Office {
    if (!tenantId) {
      throw new Error("Scope Violation: An office can only be created under an explicit tenant organization.");
    }
    const tenant = this.data.tenants.find((t) => t.id === tenantId);
    if (!tenant) throw new Error("Parent tenant not found.");

    const id =
      "off_" +
      name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .substring(0, 14) +
      "_" +
      Math.floor(Math.random() * 1000);
    const date = new Date().toISOString().split("T")[0];

    const newOffice: Office = {
      id,
      tenantId,
      name,
      location: location || "Headquarters",
      status: "Active",
      createdAt: date,
    };

    this.data.offices.push(newOffice);
    this.addAuditLog(
      this.data.currentUser.name,
      "CREATE",
      "Office",
      id,
      `Created office "${name}" under tenant "${tenant.name}"`
    );

    this.save();
    return newOffice;
  }

  updateOffice(officeId: string, updates: Partial<Office>, tenantId?: string): Office {
    const office = this.data.offices.find((o) => o.id === officeId);
    if (!office) throw new Error("Office not found");

    if (tenantId && office.tenantId !== tenantId) {
      throw new Error("Scope Violation: Office does not belong to the specified tenant organization.");
    }

    const oldStatus = office.status;
    const safeUpdates: Partial<Office> = { ...updates };
    delete safeUpdates.tenantId;
    delete safeUpdates.id;

    Object.assign(office, safeUpdates);

    let action = "UPDATE";
    let desc = `Updated office "${office.name}" information`;
    if (updates.status && updates.status !== oldStatus) {
      action = "STATUS_CHANGE";
      desc = `${updates.status === "Active" ? "Activated" : "Suspended"} office "${office.name}"`;
    }

    this.addAuditLog(this.data.currentUser.name, action, "Office", officeId, desc);
    this.save();
    return office;
  }

  deleteOffice(officeId: string, tenantId?: string): boolean {
    const index = this.data.offices.findIndex((o) => o.id === officeId);
    if (index === -1) throw new Error("Office not found");

    const office = this.data.offices[index];
    if (tenantId && office.tenantId !== tenantId) {
      throw new Error("Scope Violation: Office does not belong to the specified tenant organization.");
    }

    this.data.officeStaff = this.data.officeStaff.filter((os) => os.officeId !== officeId);
    this.data.offices.splice(index, 1);

    this.addAuditLog(
      this.data.currentUser.name,
      "DELETE",
      "Office",
      officeId,
      `Deleted office branch "${office.name}"`
    );

    this.save();
    return true;
  }

  // --- Tenant Members ---
  getTenantMembers(tenantId?: string | null): TenantMemberWithUser[] {
    const targetId = tenantId === "ten_ctg" || !tenantId ? "ten_sst" : tenantId;
    return this.data.tenantMembers
      .filter((tm) => tm.tenantId === targetId || tm.tenantId === tenantId)
      .map((tm) => {
        const user = this.data.users.find((u) => u.id === tm.userId);
        return {
          ...tm,
          user: user || { id: tm.userId, name: "Unknown User", email: "unknown@qrew.io" },
        };
      });
  }

  addTenantMember(
    tenantId: string,
    { userId, name, email, tenantRole }: { userId?: string; name?: string; email?: string; tenantRole?: string }
  ): TenantMemberWithUser {
    const tenant = this.data.tenants.find((t) => t.id === tenantId);
    if (!tenant) throw new Error("Tenant not found");

    let user: User | undefined;
    if (userId) {
      user = this.data.users.find((u) => u.id === userId);
    } else if (email) {
      user = this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        user = {
          id: "usr_" + Math.floor(Math.random() * 9000 + 1000),
          name: name || email.split("@")[0],
          email,
          platformRole: "Platform User",
          status: "Active",
          createdAt: new Date().toISOString().split("T")[0],
        };
        this.data.users.push(user);
      }
    }

    if (!user) throw new Error("User selection or valid email is required.");

    if (user.platformRole === "Platform Owner" && (tenantRole === "Tenant Admin" || !tenantRole)) {
      throw new Error(
        `Business Rule Violation: "${user.name}" is a Platform Owner. A Platform Owner cannot be assigned as a Tenant Admin.`
      );
    }

    const existing = this.data.tenantMembers.find((m) => m.tenantId === tenantId && m.userId === user.id);
    if (existing) {
      throw new Error(`"${user.name}" is already a member of this tenant.`);
    }

    const newMember: TenantMember = {
      id: "tm_" + Date.now(),
      tenantId,
      userId: user.id,
      tenantRole: tenantRole || "Tenant Member",
      status: "Active",
      joinedAt: new Date().toISOString().split("T")[0],
    };

    this.data.tenantMembers.push(newMember);

    this.addAuditLog(
      this.data.currentUser.name,
      "ADD_MEMBER",
      "Tenant Member",
      tenantId,
      `Added "${user.name}" as ${newMember.tenantRole} to tenant "${tenant.name}"`
    );

    this.save();
    return { ...newMember, user };
  }

  updateTenantMemberRole(tenantId: string, userId: string, newRole: string): TenantMember {
    const member = this.data.tenantMembers.find((m) => m.tenantId === tenantId && m.userId === userId);
    if (!member) throw new Error("Tenant membership not found.");

    const user = this.data.users.find((u) => u.id === userId);
    if (user && user.platformRole === "Platform Owner" && newRole === "Tenant Admin") {
      throw new Error(
        `Business Rule Violation: "${user.name}" is a Platform Owner and cannot hold the Tenant Admin role.`
      );
    }

    const tenant = this.data.tenants.find((t) => t.id === tenantId);
    const oldRole = member.tenantRole;
    member.tenantRole = newRole;

    this.addAuditLog(
      this.data.currentUser.name,
      "ASSIGN_ROLE",
      "Tenant Member",
      tenantId,
      `Changed role of "${user ? user.name : userId}" from "${oldRole}" to "${newRole}" in tenant "${tenant ? tenant.name : tenantId}"`
    );

    this.save();
    return member;
  }

  removeTenantMember(tenantId: string, userId: string): boolean {
    const memberIndex = this.data.tenantMembers.findIndex((m) => m.tenantId === tenantId && m.userId === userId);
    if (memberIndex === -1) throw new Error("Tenant member not found.");

    const user = this.data.users.find((u) => u.id === userId);
    const tenant = this.data.tenants.find((t) => t.id === tenantId);

    const tenantOffices = this.data.offices.filter((o) => o.tenantId === tenantId).map((o) => o.id);
    this.data.officeStaff = this.data.officeStaff.filter(
      (os) => !(tenantOffices.includes(os.officeId) && os.userId === userId)
    );

    this.data.tenantMembers.splice(memberIndex, 1);

    this.addAuditLog(
      this.data.currentUser.name,
      "DELETE",
      "Tenant Member",
      tenantId,
      `Removed "${user ? user.name : userId}" from tenant "${tenant ? tenant.name : tenantId}" and associated offices`
    );

    this.save();
    return true;
  }

  // --- Office Staff ---
  getOfficeStaff(officeId: string): OfficeStaffWithUser[] {
    return this.data.officeStaff
      .filter((os) => os.officeId === officeId)
      .map((os) => {
        const user = this.data.users.find((u) => u.id === os.userId);
        return {
          ...os,
          user: user || { id: os.userId, name: "Unknown User", email: "unknown@qrew.io" },
        };
      });
  }

  getEligibleUsersForOffice(officeId: string) {
    const office = this.data.offices.find((o) => o.id === officeId);
    if (!office) return [];

    const tenantMembers = this.getTenantMembers(office.tenantId);
    const existingStaffUserIds = this.data.officeStaff
      .filter((os) => os.officeId === officeId)
      .map((os) => os.userId);

    return tenantMembers
      .filter((tm) => !existingStaffUserIds.includes(tm.userId))
      .map((tm) => ({
        userId: tm.userId,
        name: tm.user.name,
        email: tm.user.email,
        tenantRole: tm.tenantRole,
      }));
  }

  addOfficeStaff(
    officeId: string,
    { userId, name, email, officeRole }: { userId?: string; name?: string; email?: string; officeRole?: string }
  ): OfficeStaffWithUser {
    const office = this.data.offices.find((o) => o.id === officeId);
    if (!office) throw new Error("Office not found");

    let user: User | undefined;
    if (userId) {
      user = this.data.users.find((u) => u.id === userId);
    } else if (name && name.trim()) {
      const cleanName = name.trim();
      user = this.data.users.find((u) => u.name.toLowerCase() === cleanName.toLowerCase());
      if (!user) {
        const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, ".");
        const tenant = this.data.tenants.find((t) => t.id === office.tenantId);
        const domain = tenant ? tenant.name.toLowerCase().replace(/[^a-z0-9]/g, "") : "qrew";
        user = {
          id: "usr_" + Math.floor(Math.random() * 9000 + 1000),
          name: cleanName,
          email: email || `${slug}@${domain}.io`,
          platformRole: "Platform User",
          status: "Active",
          createdAt: new Date().toISOString().split("T")[0],
        };
        this.data.users.push(user);
      }
    }

    if (!user) {
      throw new Error("Staff name is required.");
    }

    const isTenantMember = this.data.tenantMembers.some(
      (tm) => tm.tenantId === office.tenantId && tm.userId === user.id
    );

    if (!isTenantMember) {
      this.data.tenantMembers.push({
        id: "tm_" + Date.now(),
        tenantId: office.tenantId,
        userId: user.id,
        tenantRole: "Tenant Member",
        status: "Active",
        joinedAt: new Date().toISOString().split("T")[0],
      });
    }

    const existing = this.data.officeStaff.find((os) => os.officeId === officeId && os.userId === user.id);
    if (existing) {
      throw new Error(`"${user.name}" is already assigned as staff in this office.`);
    }

    const newStaff: OfficeStaff = {
      id: "os_" + Date.now(),
      officeId,
      tenantId: office.tenantId,
      userId: user.id,
      officeRole: officeRole || "Office Staff",
      status: "Active",
      assignedAt: new Date().toISOString().split("T")[0],
    };

    this.data.officeStaff.push(newStaff);

    this.addAuditLog(
      this.data.currentUser.name,
      "ASSIGN_ROLE",
      "Office Staff",
      officeId,
      `Assigned "${user.name}" as ${newStaff.officeRole} in office "${office.name}"`
    );

    this.save();
    return { ...newStaff, user };
  }

  updateOfficeStaffRole(officeId: string, userId: string, newRole: string): OfficeStaff {
    const staff = this.data.officeStaff.find((s) => s.officeId === officeId && s.userId === userId);
    if (!staff) throw new Error("Staff member not found in this office.");

    const user = this.data.users.find((u) => u.id === userId);
    const office = this.data.offices.find((o) => o.id === officeId);
    const oldRole = staff.officeRole;
    staff.officeRole = newRole;

    this.addAuditLog(
      this.data.currentUser.name,
      "ASSIGN_ROLE",
      "Office Staff",
      officeId,
      `Changed office role of "${user ? user.name : userId}" from "${oldRole}" to "${newRole}" at "${office ? office.name : officeId}"`
    );

    this.save();
    return staff;
  }

  removeOfficeStaff(officeId: string, userId: string): boolean {
    const index = this.data.officeStaff.findIndex((s) => s.officeId === officeId && s.userId === userId);
    if (index === -1) throw new Error("Staff record not found.");

    const user = this.data.users.find((u) => u.id === userId);
    const office = this.data.offices.find((o) => o.id === officeId);

    this.data.officeStaff.splice(index, 1);

    this.addAuditLog(
      this.data.currentUser.name,
      "DELETE",
      "Office Staff",
      officeId,
      `Removed "${user ? user.name : userId}" from office "${office ? office.name : officeId}"`
    );

    this.save();
    return true;
  }

  // --- Platform Users ---
  getPlatformUsers(): UserWithCounts[] {
    return this.data.users.map((u) => ({
      ...u,
      tenantCount: this.data.tenantMembers.filter((tm) => tm.userId === u.id).length,
    }));
  }

  getUsers(): UserWithCounts[] {
    return this.getPlatformUsers();
  }

  getUserById(userId?: string | null): UserDetails | null {
    if (!userId) return null;
    return this.getUserDetails(userId);
  }

  getUserDetails(userId: string): UserDetails | null {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;

    const tenantMemberships = this.data.tenantMembers
      .filter((tm) => tm.userId === userId)
      .map((tm) => {
        const tenant = this.data.tenants.find((t) => t.id === tm.tenantId);
        return {
          ...tm,
          tenantName: tenant ? tenant.name : tm.tenantId,
        };
      });

    const officeAssignments = this.data.officeStaff
      .filter((os) => os.userId === userId)
      .map((os) => {
        const office = this.data.offices.find((o) => o.id === os.officeId);
        const tenant = this.data.tenants.find((t) => t.id === os.tenantId);
        return {
          ...os,
          officeName: office ? office.name : os.officeId,
          tenantName: tenant ? tenant.name : os.tenantId,
        };
      });

    return {
      ...user,
      tenantMemberships,
      officeAssignments,
    };
  }

  createPlatformUser({
    name,
    email,
    platformRole,
  }: {
    name: string;
    email: string;
    platformRole?: string;
  }): User {
    const existing = this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error("A user with this email address already exists.");

    const newUser: User = {
      id: "usr_" + Math.floor(Math.random() * 9000 + 1000),
      name,
      email,
      platformRole: platformRole || "Platform User",
      status: "Active",
      createdAt: new Date().toISOString().split("T")[0],
    };

    this.data.users.unshift(newUser);

    this.addAuditLog(
      this.data.currentUser.name,
      "CREATE",
      "Platform User",
      newUser.id,
      `Created platform user "${name}" (${email}) with role ${newUser.platformRole}`
    );

    this.save();
    return newUser;
  }

  updatePlatformUser(userId: string, updates: Partial<User>): User | null {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;

    if (updates.platformRole === "Platform Owner") {
      const isTenantAdmin = this.data.tenantMembers.some(
        (tm) => tm.userId === userId && tm.tenantRole === "Tenant Admin"
      );
      if (isTenantAdmin) {
        throw new Error(
          `Business Rule Violation: "${user.name}" is currently a Tenant Admin in an organization and cannot be assigned the Platform Owner role.`
        );
      }
    }

    const oldRole = user.platformRole;
    const oldStatus = user.status;
    Object.assign(user, updates);

    let action = "UPDATE";
    let desc = `Updated user "${user.name}" profile`;

    if (updates.platformRole && updates.platformRole !== oldRole) {
      action = "ASSIGN_ROLE";
      desc = `Changed platform role of "${user.name}" from "${oldRole}" to "${updates.platformRole}"`;
    } else if (updates.status && updates.status !== oldStatus) {
      action = "STATUS_CHANGE";
      desc = `${updates.status === "Active" ? "Activated" : "Deactivated"} platform user "${user.name}"`;
    }

    this.addAuditLog(this.data.currentUser.name, action, "Platform User", userId, desc);
    this.save();
    return user;
  }

  // --- Roles & Permissions ---
  getRoles(level: "platform" | "tenant" | "office"): RoleDefinition[];
  getRoles(): RolesByLevel;
  getRoles(level?: string): RoleDefinition[] | RolesByLevel {
    if (level && this.data.roles[level]) {
      return this.data.roles[level];
    }
    return this.data.roles;
  }

  getAssignedCountForRole(roleName: string, level: string): number {
    if (level === "platform") {
      return this.data.users.filter((u) => u.platformRole === roleName).length;
    }
    if (level === "tenant") {
      return this.data.tenantMembers.filter((tm) => tm.tenantRole === roleName).length;
    }
    if (level === "office") {
      return this.data.officeStaff.filter((os) => os.officeRole === roleName).length;
    }
    return 0;
  }

  // --- Audit Logs ---
  getAuditLogs(): AuditLogEntry[] {
    return [...this.data.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getAuditLogsByTenant(tenantId?: string | null): AuditLogEntry[] {
    const targetId = tenantId === "ten_ctg" || !tenantId ? "ten_sst" : tenantId;
    const tenantOffices = this.data.offices.filter((o) => o.tenantId === targetId).map((o) => o.id);
    return this.getAuditLogs().filter(
      (log) => log.resourceId === targetId || tenantOffices.includes(log.resourceId)
    );
  }

  getAuditLogsByOffice(officeId: string): AuditLogEntry[] {
    return this.getAuditLogs().filter(
      (log) =>
        log.resourceId === officeId ||
        (log.description && log.description.toLowerCase().includes(officeId.toLowerCase()))
    );
  }

  addAuditLog(
    actor: string | undefined,
    action: string,
    resourceType: string,
    resourceId: string,
    description: string
  ): AuditLogEntry {
    const pad = (n: number) => String(n).padStart(2, "0");
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLog: AuditLogEntry = {
      id: "LOG-" + Math.floor(Math.random() * 90000 + 10000),
      actor: actor || this.data.currentUser.name,
      action,
      resourceType,
      resourceId,
      description,
      timestamp,
    };

    this.data.auditLogs.unshift(newLog);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs.pop();
    }

    this.save();
    return newLog;
  }

  // --- Office Configuration ---
  getOfficeConfig(officeId: string): OfficeConfig {
    if (!this.data.officeConfigs) this.data.officeConfigs = {};
    if (this.data.officeConfigs[officeId]) {
      return { ...this.data.officeConfigs[officeId] };
    }
    const office = this.getOfficeById(officeId);
    const officeName = office ? office.name : "Branch";
    return {
      code: officeName.slice(0, 3).toUpperCase() + "-01",
      tier: "Standard Branch Facility",
      floorArea: "5,000 sq ft",
      maxOccupancy: 50,
      operatingHours: "09:00 - 18:00 (Standard Shift)",
      primaryContact: "+880 31 000000",
      emergencyContact: "+880 31 999999",
      shifts: ["Standard Day (09:00 - 18:00)"],
      checkInGrace: "15 mins",
      accessControlMode: "Smart Card RFID",
    };
  }

  saveOfficeConfig(officeId: string, specs: Partial<OfficeConfig>): OfficeConfig {
    if (!this.data.officeConfigs) this.data.officeConfigs = {};
    this.data.officeConfigs[officeId] = {
      ...this.getOfficeConfig(officeId),
      ...specs,
    };

    const office = this.getOfficeById(officeId);
    const officeName = office ? office.name : officeId;
    this.addAuditLog(
      this.data.currentUser.name,
      "UPDATE_CONFIG",
      "Office Facility",
      officeId,
      `Updated facility specifications and operational parameters for "${officeName}"`
    );

    this.save();
    return this.data.officeConfigs[officeId];
  }

  // --- Departments ---
  getDepartments(officeId: string | null = null): Department[] {
    if (!this.data.departments) this.data.departments = [];
    if (officeId) {
      return this.data.departments.filter((d) => d.officeId === officeId);
    }
    return [...this.data.departments];
  }

  getDepartmentById(deptId?: string | null): Department | null {
    if (!deptId || !this.data.departments) return null;
    return this.data.departments.find((d) => d.id === deptId) || null;
  }

  createDepartment(deptData: {
    officeId: string;
    name: string;
    code?: string;
    leadName?: string;
    capacity?: number | string;
    status?: string;
    description?: string;
  }): Department {
    if (!this.data.departments) this.data.departments = [];
    const id = "dept_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const newDept: Department = {
      id,
      officeId: deptData.officeId,
      name: (deptData.name || "").trim(),
      code: (deptData.code || "GEN").toUpperCase().trim(),
      leadName: (deptData.leadName || "Unassigned").trim(),
      capacity: parseInt(String(deptData.capacity ?? 10), 10) || 10,
      status: deptData.status || "Active",
      description: (deptData.description || "").trim(),
      createdAt: new Date().toISOString().split("T")[0],
    };

    this.data.departments.push(newDept);
    const office = this.getOfficeById(deptData.officeId);
    this.addAuditLog(
      this.data.currentUser.name,
      "CREATE_DEPT",
      "Department",
      id,
      `Provisioned department "${newDept.name}" [${newDept.code}] at ${office ? office.name : deptData.officeId}`
    );

    this.save();
    return newDept;
  }

  updateDepartment(deptId: string, updates: Partial<Department>): Department {
    const dept = this.getDepartmentById(deptId);
    if (!dept) throw new Error("Department not found");

    if (updates.name) dept.name = updates.name.trim();
    if (updates.code) dept.code = updates.code.toUpperCase().trim();
    if (updates.leadName) dept.leadName = updates.leadName.trim();
    if (updates.capacity !== undefined) dept.capacity = parseInt(String(updates.capacity), 10);
    if (updates.status) dept.status = updates.status;
    if (updates.description !== undefined) dept.description = updates.description.trim();

    this.addAuditLog(
      this.data.currentUser.name,
      "UPDATE_DEPT",
      "Department",
      deptId,
      `Updated settings for department "${dept.name}"`
    );

    this.save();
    return dept;
  }

  deleteDepartment(deptId: string): boolean {
    const dept = this.getDepartmentById(deptId);
    if (!dept) throw new Error("Department not found");

    const deptName = dept.name;
    this.data.departments = this.data.departments.filter((d) => d.id !== deptId);
    if (this.data.departmentMembers) {
      this.data.departmentMembers = this.data.departmentMembers.filter((dm) => dm.deptId !== deptId);
    }

    this.addAuditLog(
      this.data.currentUser.name,
      "DELETE_DEPT",
      "Department",
      deptId,
      `Deprovisioned department "${deptName}" and reallocated roster`
    );

    this.save();
    return true;
  }

  // --- Department Members ---
  getDepartmentMembers(deptId: string | null = null): DepartmentMemberWithUser[] {
    if (!this.data.departmentMembers) this.data.departmentMembers = [];
    const list = deptId
      ? this.data.departmentMembers.filter((dm) => dm.deptId === deptId)
      : this.data.departmentMembers;

    return list.map((dm) => {
      const user = this.getUserById(dm.userId) || { name: "Unknown User", email: "", platformRole: "Staff" };
      return { ...dm, user };
    });
  }

  addDepartmentMember(
    deptId: string,
    userId: string,
    deptRole = "Staff Specialist",
    shift = "Standard Day (09:00 - 18:00)"
  ): DepartmentMember {
    if (!this.data.departmentMembers) this.data.departmentMembers = [];
    const existing = this.data.departmentMembers.find((dm) => dm.deptId === deptId && dm.userId === userId);
    if (existing) {
      existing.deptRole = deptRole;
      existing.shift = shift;
      this.save();
      return existing;
    }

    const id = "dm_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const newAssignment: DepartmentMember = {
      id,
      deptId,
      userId,
      deptRole,
      shift,
      status: "On Duty",
    };

    this.data.departmentMembers.push(newAssignment);

    const user = this.getUserById(userId);
    const dept = this.getDepartmentById(deptId);
    this.addAuditLog(
      this.data.currentUser.name,
      "ASSIGN_DEPT_MEMBER",
      "Department Member",
      id,
      `Assigned ${user ? user.name : userId} to ${dept ? dept.name : deptId} as ${deptRole}`
    );

    this.save();
    return newAssignment;
  }

  removeDepartmentMember(memberId: string): boolean {
    if (!this.data.departmentMembers) return false;
    const member = this.data.departmentMembers.find((m) => m.id === memberId);
    if (!member) return false;

    const user = this.getUserById(member.userId);
    const dept = this.getDepartmentById(member.deptId);

    this.data.departmentMembers = this.data.departmentMembers.filter((m) => m.id !== memberId);
    this.addAuditLog(
      this.data.currentUser.name,
      "REMOVE_DEPT_MEMBER",
      "Department Member",
      memberId,
      `Removed ${user ? user.name : "Member"} from ${dept ? dept.name : "Department"}`
    );

    this.save();
    return true;
  }

  // --- Member Workspace Tasks & Activity ---
  getMemberTasks(userId: string | null = null): MemberTask[] {
    if (!this.data.memberTasks) this.data.memberTasks = [];
    if (userId) {
      return this.data.memberTasks.filter((t) => t.userId === userId);
    }
    return [...this.data.memberTasks];
  }

  getTasksByDepartment(deptId: string): MemberTask[] {
    if (!this.data.memberTasks) this.data.memberTasks = [];
    return this.data.memberTasks.filter((t) => t.deptId === deptId);
  }

  toggleTaskStatus(taskId: string): MemberTask | null {
    if (!this.data.memberTasks) return null;
    const task = this.data.memberTasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.status = task.status === "Completed" ? "In Progress" : "Completed";
    this.addMemberActivity(
      task.userId,
      task.status === "Completed" ? "Task Completed" : "Task Reopened",
      `Marked task "${task.title}" as ${task.status}`,
      "task"
    );

    this.save();
    return task;
  }

  createMemberTask(
    userId: string,
    deptId: string,
    title: string,
    priority = "Normal",
    dueTime = "Today",
    category = "Operations"
  ): MemberTask {
    if (!this.data.memberTasks) this.data.memberTasks = [];
    const id = "tsk_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const newTask: MemberTask = {
      id,
      userId,
      deptId,
      title: title.trim(),
      priority,
      dueTime,
      category,
      status: "Pending",
    };
    this.data.memberTasks.unshift(newTask);

    this.addMemberActivity(
      userId,
      "New Task Assigned",
      `Assigned task: "${newTask.title}" [${priority} Priority]`,
      "task"
    );

    this.save();
    return newTask;
  }

  getMemberActivities(userId: string): MemberActivity[] {
    if (!this.data.memberActivity) this.data.memberActivity = [];
    return this.data.memberActivity.filter((a) => a.userId === userId);
  }

  addMemberActivity(userId: string, title: string, description: string, type = "general"): MemberActivity {
    if (!this.data.memberActivity) this.data.memberActivity = [];
    const pad = (n: number) => String(n).padStart(2, "0");
    const now = new Date();
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const newActivity: MemberActivity = {
      id: "act_" + Date.now().toString(36),
      userId,
      title,
      description,
      timestamp: `Today, ${timeStr}`,
      type,
    };
    this.data.memberActivity.unshift(newActivity);
    if (this.data.memberActivity.length > 50) this.data.memberActivity.pop();
    this.save();
    return newActivity;
  }

  // --- Operational Files & Deliverables ---
  getOperationalFiles(officeId: string | null = null, type: string | null = null): OperationalFile[] {
    if (!this.data.operationalFiles) this.data.operationalFiles = [];
    return this.data.operationalFiles.filter((f) => {
      const matchOffice = !officeId || f.officeId === officeId;
      const matchType = !type || type === "all" || f.type === type;
      return matchOffice && matchType;
    });
  }

  getOperationalFileById(fileId: string): OperationalFile | null {
    if (!this.data.operationalFiles) this.data.operationalFiles = [];
    return this.data.operationalFiles.find((f) => f.id === fileId) || null;
  }

  getPremadeDeliverables(): PremadeDeliverable[] {
    if (!this.data.premadeDeliverables) this.data.premadeDeliverables = [];
    return clone(this.data.premadeDeliverables);
  }

  // --- Invoice Templates ---
  getInvoiceTemplates(officeId: string | null = null): InvoiceTemplate[] {
    if (!this.data.invoiceTemplates) this.data.invoiceTemplates = [];
    const list = officeId
      ? this.data.invoiceTemplates.filter((t) => t.officeId === officeId)
      : this.data.invoiceTemplates;
    return clone(list);
  }

  getInvoiceTemplateById(templateId: string): InvoiceTemplate | null {
    if (!this.data.invoiceTemplates) this.data.invoiceTemplates = [];
    const found = this.data.invoiceTemplates.find((t) => t.id === templateId);
    return found ? clone(found) : null;
  }

  createInvoiceTemplate(officeId: string, templateData: Partial<InvoiceTemplate>): InvoiceTemplate {
    if (!this.data.invoiceTemplates) this.data.invoiceTemplates = [];
    const office = this.getOfficeById(officeId);
    const tenantId = office ? office.tenantId : "ten_sst";
    const id = "tpl_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);

    const count = this.data.invoiceTemplates.filter((t) => t.officeId === officeId).length + 1;
    const prefix = office ? office.name.substring(0, 3).toUpperCase() : "OFF";
    const code = templateData.code || `SST-${prefix}-INV-${String(count).padStart(2, "0")}`;

    if (templateData.isDefault) {
      this.data.invoiceTemplates.forEach((t) => {
        if (t.officeId === officeId) t.isDefault = false;
      });
    }

    const newTemplate: InvoiceTemplate = {
      id,
      officeId,
      tenantId,
      name: templateData.name || "Untitled Invoice Template",
      type: templateData.type,
      description: templateData.description,
      code,
      tag: templateData.tag,
      status: templateData.status || "Active",
      isDefault: Boolean(templateData.isDefault),
      currency: templateData.currency || "USD",
      currencySymbol: templateData.currencySymbol || "$",
      clientName: templateData.clientName || "",
      clientCode: templateData.clientCode || "",
      billingTerms: templateData.billingTerms || "Net 30",
      sourceFileId: templateData.sourceFileId ?? null,
      sourceFileType: templateData.sourceFileType ?? null,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      headerFields: templateData.headerFields ? clone(templateData.headerFields) : undefined,
      headerGrid: templateData.headerGrid ? clone(templateData.headerGrid) : undefined,
      globalConstants: templateData.globalConstants || {
        BASE_VAT: 0.15,
        PORT_SURCHARGE: 0.05,
        DOLLAR_RATE: 120.5,
      },
      localConstants: templateData.localConstants || { SETUP_FEE: 250.0 },
      sections: templateData.sections || [
        {
          id: "sec_1",
          title: "Section 1: General Deliverables",
          rows: [{ id: "r1", token: "ITEM_1", name: "Primary Operational Service", equation: "1000.00" }],
          subtotal: { token: "SEC1_TOTAL", label: "Section Total", equation: "= ITEM_1" },
        },
      ],
      grandTotal: templateData.grandTotal || {
        token: "GRAND_TOTAL",
        label: "*** GRAND TOTAL (Balance Due)",
        equation: "= SEC1_TOTAL * (1 + BASE_VAT)",
      },
    };

    this.data.invoiceTemplates.unshift(newTemplate);
    this.addAuditLog(
      this.data.currentUser.name,
      "CREATE_TEMPLATE",
      "Invoice Template",
      newTemplate.id,
      `Created invoice template "${newTemplate.name}" (${newTemplate.code}) for office ${office ? office.name : officeId}`
    );
    this.save();
    return clone(newTemplate);
  }

  updateInvoiceTemplate(id: string, templateData: Partial<InvoiceTemplate>): InvoiceTemplate {
    if (!this.data.invoiceTemplates) this.data.invoiceTemplates = [];
    const idx = this.data.invoiceTemplates.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Invoice template ${id} not found.`);

    const existing = this.data.invoiceTemplates[idx];
    const officeId = existing.officeId;

    if (templateData.isDefault && !existing.isDefault) {
      this.data.invoiceTemplates.forEach((t) => {
        if (t.officeId === officeId && t.id !== id) t.isDefault = false;
      });
    }

    const updated: InvoiceTemplate = {
      ...existing,
      ...templateData,
      id,
      officeId,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    this.data.invoiceTemplates[idx] = updated;
    this.addAuditLog(
      this.data.currentUser.name,
      "UPDATE_TEMPLATE",
      "Invoice Template",
      id,
      `Updated invoice template "${updated.name}" (${updated.code})`
    );
    this.save();
    return clone(updated);
  }

  duplicateInvoiceTemplate(id: string): InvoiceTemplate {
    const original = this.getInvoiceTemplateById(id);
    if (!original) throw new Error(`Invoice template ${id} not found.`);

    const count = this.data.invoiceTemplates.filter((t) => t.officeId === original.officeId).length + 1;
    const clonedData = clone(original);
    clonedData.name = `${original.name} (Copy)`;
    clonedData.code = `${original.code}-CPY${count}`;
    clonedData.isDefault = false;

    return this.createInvoiceTemplate(original.officeId, clonedData);
  }

  deleteInvoiceTemplate(id: string): boolean {
    if (!this.data.invoiceTemplates) return false;
    const idx = this.data.invoiceTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return false;

    const removed = this.data.invoiceTemplates.splice(idx, 1)[0];
    this.addAuditLog(
      this.data.currentUser.name,
      "DELETE_TEMPLATE",
      "Invoice Template",
      id,
      `Deleted invoice template "${removed.name}" (${removed.code})`
    );
    this.save();
    return true;
  }

  archiveInvoiceTemplate(id: string): InvoiceTemplate {
    const updated = this.updateInvoiceTemplate(id, { status: "Archived" });
    this.addAuditLog(
      this.data.currentUser.name,
      "ARCHIVE_TEMPLATE",
      "Invoice Template",
      id,
      `Archived invoice template "${updated.name}" (${updated.code})`
    );
    return updated;
  }

  unarchiveInvoiceTemplate(id: string): InvoiceTemplate {
    const updated = this.updateInvoiceTemplate(id, { status: "Active" });
    this.addAuditLog(
      this.data.currentUser.name,
      "UNARCHIVE_TEMPLATE",
      "Invoice Template",
      id,
      `Restored invoice template "${updated.name}" (${updated.code}) to active status`
    );
    return updated;
  }

  setDefaultInvoiceTemplate(officeId: string, id: string): void {
    if (!this.data.invoiceTemplates) return;
    this.data.invoiceTemplates.forEach((t) => {
      if (t.officeId === officeId) {
        t.isDefault = t.id === id;
      }
    });
    this.addAuditLog(
      this.data.currentUser.name,
      "SET_DEFAULT_TEMPLATE",
      "Invoice Template",
      id,
      `Set invoice template ${id} as default for office ${officeId}`
    );
    this.save();
  }
}
