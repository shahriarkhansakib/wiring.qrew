import { describe, expect, it } from "vitest";
import { mapHashToPath, parseRouteFromPathname, routes } from "../routes";

describe("App Router paths & legacy hash mapping", () => {
  it("parses workspace, context IDs, and view names from Next.js pathnames", () => {
    expect(parseRouteFromPathname("/")).toMatchObject({
      workspace: "landing",
      isLanding: true,
    });

    expect(parseRouteFromPathname("/tenant-landing/ten_apex")).toMatchObject({
      workspace: "tenant-landing",
      tenantId: "ten_apex",
      isLanding: true,
    });

    expect(parseRouteFromPathname("/office-config/ten_sst/off_ctg_port/invoice-templates")).toMatchObject({
      workspace: "office-config",
      tenantId: "ten_sst",
      officeId: "off_ctg_port",
      view: "invoice-templates",
    });

    expect(parseRouteFromPathname("/department/dept_ctg_ops/members")).toMatchObject({
      workspace: "department",
      deptId: "dept_ctg_ops",
      view: "members",
    });
  });

  it("maps legacy hash URLs to idiomatic App Router routes", () => {
    expect(mapHashToPath("#landing")).toBe(routes.landing());
    expect(mapHashToPath("#platform/tenants")).toBe(routes.platform("tenants"));
    expect(mapHashToPath("#permission-catalog")).toBe(
      routes.superAdmin("permission-catalog")
    );
    expect(mapHashToPath("#office-config/invoice-templates")).toBe(
      routes.officeConfig("ten_sst", "off_ctg_port", "invoice-templates")
    );
    expect(mapHashToPath("#profile?tab=security&ws=tenant")).toBe(
      routes.profile("security", "tenant")
    );
    expect(mapHashToPath("#profile?tab=profile&ws=office&tenantId=ten_apex&officeId=off_mgl_port")).toBe(
      routes.profile("profile", "office", {
        tenantId: "ten_apex",
        officeId: "off_mgl_port",
      })
    );
  });

  it("preserves entity context parameters on profile routes", () => {
    const url = routes.profile("security", "office-config", {
      tenantId: "ten_apex",
      officeId: "off_mgl_port",
      deptId: "dept_mgl",
      userId: "usr_karim",
    });
    const parsed = parseRouteFromPathname("/profile", new URLSearchParams(url.split("?")[1]));

    expect(parsed).toMatchObject({
      workspace: "office-config",
      isProfile: true,
      profileTab: "security",
      tenantId: "ten_apex",
      officeId: "off_mgl_port",
      deptId: "dept_mgl",
      userId: "usr_karim",
    });
  });
});
