import type { DataStore } from "./data-store";
import { DEFAULT_CONTEXT_IDS, routes } from "./routes";
import type {
  Department,
  IconName,
  OfficeWithDetails,
  PanelUserInfo,
  TenantWithDetails,
  WorkspaceId,
} from "./types";

export interface PanelThemeDefinition {
  name: string;
  primaryAccent: string;
  darkAccent: string;
  lightAccent: string;
  hoverAccent: string;
  darkLightAccent: string;
  darkHoverAccent: string;
}

export const PANEL_THEMES: Record<string, PanelThemeDefinition> = {
  platform: {
    name: "Platform Admin Panel",
    primaryAccent: "#2563EB",
    darkAccent: "#60A5FA",
    lightAccent: "#EFF6FF",
    hoverAccent: "#DBEAFE",
    darkLightAccent: "rgba(96, 165, 250, 0.18)",
    darkHoverAccent: "rgba(96, 165, 250, 0.30)",
  },
  "super-admin": {
    name: "Super Admin",
    primaryAccent: "#2563EB",
    darkAccent: "#60A5FA",
    lightAccent: "#EFF6FF",
    hoverAccent: "#DBEAFE",
    darkLightAccent: "rgba(96, 165, 250, 0.18)",
    darkHoverAccent: "rgba(96, 165, 250, 0.30)",
  },
  tenant: {
    name: "Tenant Workspace",
    primaryAccent: "#7C3AED",
    darkAccent: "#A78BFA",
    lightAccent: "#F5F3FF",
    hoverAccent: "#EDE9FE",
    darkLightAccent: "rgba(167, 139, 250, 0.18)",
    darkHoverAccent: "rgba(167, 139, 250, 0.30)",
  },
  "tenant-landing": {
    name: "Tenant Portal",
    primaryAccent: "#7C3AED",
    darkAccent: "#A78BFA",
    lightAccent: "#F5F3FF",
    hoverAccent: "#EDE9FE",
    darkLightAccent: "rgba(167, 139, 250, 0.18)",
    darkHoverAccent: "rgba(167, 139, 250, 0.30)",
  },
  "tenant-super-admin": {
    name: "Tenant Super Admin",
    primaryAccent: "#7C3AED",
    darkAccent: "#A78BFA",
    lightAccent: "#F5F3FF",
    hoverAccent: "#EDE9FE",
    darkLightAccent: "rgba(167, 139, 250, 0.18)",
    darkHoverAccent: "rgba(167, 139, 250, 0.30)",
  },
  office: {
    name: "Office Workspace",
    primaryAccent: "#0F766E",
    darkAccent: "#2DD4BF",
    lightAccent: "#F0FDFA",
    hoverAccent: "#CCFBF1",
    darkLightAccent: "rgba(45, 212, 191, 0.18)",
    darkHoverAccent: "rgba(45, 212, 191, 0.30)",
  },
  "office-admin": {
    name: "Office Admin Panel",
    primaryAccent: "#EA580C",
    darkAccent: "#FB923C",
    lightAccent: "#FFF7ED",
    hoverAccent: "#FFEDD5",
    darkLightAccent: "rgba(251, 146, 60, 0.18)",
    darkHoverAccent: "rgba(251, 146, 60, 0.30)",
  },
  "office-config": {
    name: "Office Config",
    primaryAccent: "#EA580C",
    darkAccent: "#FB923C",
    lightAccent: "#FFF7ED",
    hoverAccent: "#FFEDD5",
    darkLightAccent: "rgba(251, 146, 60, 0.18)",
    darkHoverAccent: "rgba(251, 146, 60, 0.30)",
  },
  department: {
    name: "Department Workspace",
    primaryAccent: "#0F766E",
    darkAccent: "#2DD4BF",
    lightAccent: "#F0FDFA",
    hoverAccent: "#CCFBF1",
    darkLightAccent: "rgba(45, 212, 191, 0.18)",
    darkHoverAccent: "rgba(45, 212, 191, 0.30)",
  },
  member: {
    name: "Member Workspace",
    primaryAccent: "#0F766E",
    darkAccent: "#2DD4BF",
    lightAccent: "#F0FDFA",
    hoverAccent: "#CCFBF1",
    darkLightAccent: "rgba(45, 212, 191, 0.18)",
    darkHoverAccent: "rgba(45, 212, 191, 0.30)",
  },
};

export function hexToRgb(hex: string): string {
  if (!hex || typeof hex !== "string") return "37, 99, 235";
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  if (Number.isNaN(num)) return "37, 99, 235";
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

const ACCENT_HOVER_MAP: Record<string, { light: string; dark: string }> = {
  "#2563EB": { light: "#1D4ED8", dark: "#3B82F6" },
  "#60A5FA": { light: "#2563EB", dark: "#93C5FD" },
  "#7C3AED": { light: "#6D28D9", dark: "#8B5CF6" },
  "#A78BFA": { light: "#7C3AED", dark: "#C4B5FD" },
  "#0F766E": { light: "#115E59", dark: "#14B8A6" },
  "#0D9488": { light: "#0F766E", dark: "#14B8A6" },
  "#2DD4BF": { light: "#0F766E", dark: "#5EEAD4" },
  "#EA580C": { light: "#C2410C", dark: "#FB923C" },
  "#F97316": { light: "#EA580C", dark: "#FB923C" },
  "#FB923C": { light: "#EA580C", dark: "#FDBA74" },
  "#059669": { light: "#047857", dark: "#10B981" },
};

export function getAccentHover(hex: string, isDark: boolean): string {
  if (!hex || typeof hex !== "string") return isDark ? "#3B82F6" : "#1D4ED8";
  const upper = hex.toUpperCase();
  for (const [key, val] of Object.entries(ACCENT_HOVER_MAP)) {
    if (key.toUpperCase() === upper) {
      return isDark ? val.dark : val.light;
    }
  }
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  if (Number.isNaN(num)) return isDark ? "#3B82F6" : "#1D4ED8";
  const factor = isDark ? 28 : -28;
  const r = Math.min(255, Math.max(0, ((num >> 16) & 255) + factor));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 255) + factor));
  const b = Math.min(255, Math.max(0, (num & 255) + factor));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function getTenantDomain(store: DataStore, tenantId?: string | null): string {
  const targetId = !tenantId || tenantId === "ten_ctg" ? DEFAULT_CONTEXT_IDS.tenantId : tenantId;
  const tenant = store.getTenantById(targetId) || store.getTenants()[0];
  if (tenant && tenant.domain) return tenant.domain;
  return "sst.com";
}

export function getOfficeDomain(office?: { id?: string; name?: string } | null): string {
  const isMongla = Boolean(
    office && (office.id === "off_mgl_port" || (office.name && office.name.toLowerCase().includes("mongla")))
  );
  return isMongla ? "sst.mgl.com" : "sst.ctg.com";
}

const TENANT_WORKSPACES: WorkspaceId[] = [
  "tenant",
  "office",
  "tenant-super-admin",
  "office-admin",
  "office-config",
  "department",
  "member",
];

export function isTenantContextWorkspace(workspace: WorkspaceId): boolean {
  return TENANT_WORKSPACES.includes(workspace);
}

export interface WorkspaceRuntimeContext {
  store: DataStore;
  workspace: WorkspaceId;
  view: string;
  tenantId: string;
  officeId: string;
  deptId: string;
  userId: string;
  tenant: TenantWithDetails | null;
  office: OfficeWithDetails | null;
  dept: Department | null;
}

export function buildWorkspaceContext(
  store: DataStore,
  workspace: WorkspaceId,
  view: string,
  ids: {
    tenantId?: string;
    officeId?: string;
    deptId?: string;
    userId?: string;
  }
): WorkspaceRuntimeContext {
  let tenantId = ids.tenantId || DEFAULT_CONTEXT_IDS.tenantId;
  let officeId = ids.officeId || DEFAULT_CONTEXT_IDS.officeId;
  let deptId = ids.deptId || DEFAULT_CONTEXT_IDS.deptId;
  const userId = ids.userId || DEFAULT_CONTEXT_IDS.memberId;

  if (workspace === "department" && ids.deptId) {
    const linkedDept = store.getDepartmentById(ids.deptId);
    const linkedOffice = linkedDept ? store.getOfficeById(linkedDept.officeId) : null;
    if (linkedOffice) {
      officeId = linkedOffice.id;
      tenantId = linkedOffice.tenantId;
    }
  } else if (workspace === "member" && ids.userId && !ids.officeId) {
    const staffEntry = (store.data.officeStaff || []).find((os) => os.userId === ids.userId);
    if (staffEntry) {
      officeId = staffEntry.officeId;
      if (!ids.tenantId) tenantId = staffEntry.tenantId;
    }
  }

  const tenants = store.getTenants();
  if (!tenantId && tenants.length > 0) {
    tenantId = tenants[0].id;
  }
  const tenant = store.getTenantById(tenantId) || (tenants[0] ? store.getTenantById(tenants[0].id) : null);
  const resolvedTenantId = tenant ? tenant.id : tenantId;

  const tenantOffices = store.getOfficesByTenant(resolvedTenantId);
  if ((!officeId || !tenantOffices.some((o) => o.id === officeId)) && tenantOffices.length > 0) {
    officeId = tenantOffices[0].id;
  }
  const office = store.getOfficeById(officeId);
  const resolvedOfficeId = office ? office.id : officeId;

  const officeDepts = store.getDepartments(resolvedOfficeId);
  if ((!deptId || !officeDepts.some((d) => d.id === deptId)) && officeDepts.length > 0) {
    deptId = officeDepts[0].id;
  }
  const dept = store.getDepartmentById(deptId);

  return {
    store,
    workspace,
    view,
    tenantId: resolvedTenantId,
    officeId: resolvedOfficeId,
    deptId: dept ? dept.id : deptId,
    userId,
    tenant,
    office,
    dept,
  };
}

export function getPanelUserInfo(
  workspace: WorkspaceId,
  ctx: WorkspaceRuntimeContext,
  overrides: Record<string, Partial<PanelUserInfo>> = {}
): PanelUserInfo {
  const { store, tenant, dept, userId } = ctx;
  let defaultInfo: PanelUserInfo;

  if (workspace === "platform") {
    defaultInfo = {
      name: "Sakib",
      role: "Platform Admin",
      email: "sakib@qrew.io",
      address: "Gulshan-2, Dhaka",
      avatar: "S",
      avatarBg: "var(--panel-accent)",
    };
  } else if (workspace === "super-admin") {
    defaultInfo = {
      name: "Sakib",
      role: "Super Admin",
      email: "sakib@qrew.io",
      address: "Gulshan-2, Dhaka",
      avatar: "S",
      avatarBg: "var(--panel-accent)",
    };
  } else if (workspace === "tenant" || workspace === "tenant-super-admin") {
    const ownerName = tenant?.ownerName || "Rafiqul Islam";
    const ownerEmail = tenant?.ownerEmail || "rafiq@sst.com";
    defaultInfo = {
      name: ownerName,
      role: workspace === "tenant-super-admin" ? "Tenant Super Admin" : "Tenant Admin",
      email: ownerEmail,
      address: tenant?.address || "Port Access Road, Agrabad C/A, Chittagong",
      avatar: ownerName.charAt(0).toUpperCase(),
      avatarBg: "var(--panel-accent)",
    };
  } else if (workspace === "office-admin") {
    defaultInfo = {
      name: "Jack Rahman",
      role: "Office Admin",
      email: "jack@sst.com",
      address: "Port Access Road, Chittagong",
      avatar: "J",
      avatarBg: "var(--panel-accent)",
    };
  } else if (workspace === "office") {
    defaultInfo = {
      name: "Jack Rahman",
      role: "Office Manager",
      email: "jack@sst.com",
      address: "Port Access Road, Chittagong",
      avatar: "J",
      avatarBg: "var(--panel-accent)",
    };
  } else if (workspace === "office-config") {
    defaultInfo = {
      name: "Jack Rahman",
      role: "Office Admin",
      email: "jack@sst.com",
      address: "Port Access Road, Chittagong",
      avatar: "J",
      avatarBg: "var(--panel-accent)",
    };
  } else if (workspace === "department") {
    const leadName = dept?.leadName || "Jack Rahman";
    defaultInfo = {
      name: leadName,
      role: "Department Lead",
      email: "lead@sst.com",
      address: "Port Access Road, Chittagong",
      avatar: leadName.charAt(0).toUpperCase(),
      avatarBg: "var(--color-accent)",
    };
  } else if (workspace === "member") {
    const member = store.getUserById(userId);
    const memName = member?.name || "Nusrat Jahan";
    const memEmail = member?.email || "nusrat@sst.com";
    defaultInfo = {
      name: memName,
      role: "Office Staff",
      email: memEmail,
      address: "Port Access Road, Chittagong",
      avatar: memName.charAt(0).toUpperCase(),
      avatarBg: "var(--color-text-muted)",
    };
  } else {
    defaultInfo = {
      name: "Sakib",
      role: "Platform Admin",
      email: "sakib@qrew.io",
      address: "Gulshan-2, Dhaka",
      avatar: "S",
      avatarBg: "var(--color-dark)",
    };
  }

  const override = overrides[workspace];
  return override ? { ...defaultInfo, ...override } : defaultInfo;
}

export function getDomainBadge(
  ctx: WorkspaceRuntimeContext,
  options: { isProfile?: boolean; profileTab?: string } = {}
): { text: string; dotColor: string } {
  const { workspace, view, tenant, office } = ctx;
  const tenantName = tenant?.name ? tenant.name.toLowerCase() : "sst";
  const officeDomain = getOfficeDomain(office);

  if (options.isProfile) {
    const activeTab = options.profileTab || "profile";
    let domainText = `app.qrew.com/admin/setting/${activeTab}`;
    if (workspace === "super-admin") {
      domainText = `app.qrew.com/super-admin/setting/${activeTab}`;
    } else if (workspace === "tenant" || workspace === "tenant-super-admin") {
      domainText = `app.${tenantName}.com/tenants/setting/${activeTab}`;
    } else if (workspace === "office") {
      domainText = `${officeDomain}/office/setting/${activeTab}`;
    } else if (workspace === "office-admin") {
      domainText = `${officeDomain}/office-admin/setting/${activeTab}`;
    } else if (workspace === "office-config") {
      domainText = `app.qrew.com/office-config/setting/${activeTab}`;
    } else if (workspace === "department") {
      domainText = `${officeDomain}/department/setting/${activeTab}`;
    } else if (workspace === "member") {
      domainText = `${officeDomain}/member/setting/${activeTab}`;
    }
    return { text: `url: ${domainText}`, dotColor: "var(--panel-accent, #0D9488)" };
  }

  let badgePath = "app.qrew.com/admin";
  if (workspace === "platform") {
    const subPath = view && view !== "overview" ? `/${view}` : "";
    badgePath = `app.qrew.com/admin${subPath}`;
  } else if (workspace === "super-admin") {
    const subPath = view ? `/${view}` : "/overview";
    badgePath = `app.qrew.com/super-admin${subPath}`;
  } else if (workspace === "tenant") {
    const subPath = view && view !== "overview" ? `/${view}` : "";
    badgePath = `app.${tenantName}.com${subPath}`;
  } else if (workspace === "tenant-super-admin") {
    const subPath = view ? `/${view}` : "/overview";
    badgePath = `app.${tenantName}.com/super-admin${subPath}`;
  } else if (workspace === "office-config") {
    const subPath = view ? `/${view}` : "";
    badgePath = `app.qrew.com/office-config${subPath}`;
  } else if (workspace === "office") {
    const subPath = view && view !== "dashboard" && view !== "overview" ? `/${view}` : "";
    badgePath = `${officeDomain}${subPath}`;
  } else if (workspace === "office-admin") {
    const subPath = view && view !== "overview" ? `/${view}` : "";
    badgePath = `${officeDomain}/admin${subPath}`;
  } else if (workspace === "department") {
    const subPath = view && view !== "overview" ? `/${view}` : "";
    badgePath = `${officeDomain}/department${subPath}`;
  } else if (workspace === "member") {
    const subPath = view && view !== "overview" ? `/${view}` : "";
    badgePath = `${officeDomain}/member${subPath}`;
  }

  return { text: `url: ${badgePath}`, dotColor: "var(--panel-accent)" };
}

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: IconName;
  active: boolean;
  dividerBefore?: boolean;
}

export interface SidebarFooterAction {
  label: string;
  tooltip: string;
  icon: IconName;
  href: string;
  confirmKind?: "super-admin" | "tenant-super-admin" | "office-admin";
}

export interface SidebarConfig {
  brandHome: "platform" | "tenant";
  brandHref: string;
  logoImg: string | null;
  logoText: string;
  logoBg: string;
  brandName: string;
  brandBadge: string;
  brandTitle: string;
  picker: {
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    emptyLabel?: string;
  } | null;
  items: SidebarNavItem[];
  footerAction: SidebarFooterAction | null;
  backHref: string;
}

export function getSidebarConfig(ctx: WorkspaceRuntimeContext): SidebarConfig {
  const { store, workspace, view, tenantId, officeId, deptId, userId, tenant, office, dept } = ctx;
  const tenantDomain = getTenantDomain(store, tenantId);
  const tenantInitial = tenant ? tenant.name.charAt(0).toUpperCase() : "T";

  if (workspace === "super-admin") {
    return {
      brandHome: "platform",
      brandHref: routes.landing(),
      logoImg: "/assets/logo.png",
      logoText: "Q",
      logoBg: "transparent",
      brandName: "Qrew",
      brandBadge: "Super Admin",
      brandTitle: "Go to Platform Landing Page (qrew.com)",
      picker: null,
      items: [
        { label: "Overview", href: routes.superAdmin("overview"), icon: "overview", active: view === "overview" },
        {
          label: "Platform Access",
          href: routes.superAdmin("platform-access"),
          icon: "users",
          active: view === "platform-access",
          dividerBefore: true,
        },
        {
          label: "Permission Catalog",
          href: routes.superAdmin("permission-catalog"),
          icon: "shield",
          active: view === "permission-catalog",
        },
        {
          label: "Platform Settings",
          href: routes.superAdmin("platform-settings"),
          icon: "settings",
          active: view === "platform-settings" || view === "platform-setting",
        },
      ],
      footerAction: {
        label: "← Platform Admin",
        tooltip: "Platform Admin",
        icon: "chevronLeft",
        href: routes.platform("overview"),
      },
      backHref: routes.superAdmin("overview"),
    };
  }

  if (workspace === "tenant") {
    return {
      brandHome: "tenant",
      brandHref: routes.tenantLanding(tenantId),
      logoImg: null,
      logoText: tenantInitial,
      logoBg: "var(--panel-accent, var(--color-warning))",
      brandName: tenant ? tenant.name : "Tenant",
      brandBadge: "Tenant Workspace",
      brandTitle: `Go to ${tenant ? tenant.name : "Tenant"} Landing Page (${tenantDomain})`,
      picker: null,
      items: [
        { label: "Overview", href: routes.tenant(tenantId, "overview"), icon: "overview", active: view === "overview" },
        {
          label: "Offices",
          href: routes.tenant(tenantId, "offices"),
          icon: "offices",
          active: view === "offices",
          dividerBefore: true,
        },
        {
          label: "Members",
          href: routes.tenant(tenantId, "members"),
          icon: "users",
          active: view === "members",
          dividerBefore: true,
        },
        { label: "Tenant Roles", href: routes.tenant(tenantId, "roles"), icon: "roles", active: view === "roles" },
      ],
      footerAction: {
        label: "Tenant Super Admin →",
        tooltip: "Tenant Super Admin",
        icon: "shield",
        href: routes.tenantSuperAdmin(tenantId, "overview"),
        confirmKind: "tenant-super-admin",
      },
      backHref: routes.tenant(tenantId, "overview"),
    };
  }

  if (workspace === "tenant-super-admin") {
    return {
      brandHome: "tenant",
      brandHref: routes.tenantLanding(tenantId),
      logoImg: null,
      logoText: tenantInitial,
      logoBg: "var(--panel-accent, var(--color-warning))",
      brandName: tenant ? tenant.name : "Tenant",
      brandBadge: "Tenant Super Admin",
      brandTitle: `Go to ${tenant ? tenant.name : "Tenant"} Landing Page (${tenantDomain})`,
      picker: null,
      items: [
        {
          label: "Overview",
          href: routes.tenantSuperAdmin(tenantId, "overview"),
          icon: "overview",
          active: view === "overview",
        },
        {
          label: "Plan and Entitlement",
          href: routes.tenantSuperAdmin(tenantId, "plan-and-entitlement"),
          icon: "layers",
          active: view === "plan-and-entitlement",
          dividerBefore: true,
        },
        {
          label: "Qrew Profile",
          href: routes.tenantSuperAdmin(tenantId, "qrew-profile"),
          icon: "users",
          active: view === "qrew-profile",
        },
        {
          label: "Setting",
          href: routes.tenantSuperAdmin(tenantId, "setting"),
          icon: "settings",
          active: view === "setting" || view === "settings",
        },
        {
          label: "Domain Config",
          href: routes.tenantSuperAdmin(tenantId, "domain-config"),
          icon: "globe",
          active: view === "domain-config",
        },
        {
          label: "Company Profile",
          href: routes.tenantSuperAdmin(tenantId, "company-profile"),
          icon: "building",
          active: view === "company-profile",
        },
      ],
      footerAction: {
        label: "← Tenant Workspace",
        tooltip: "Tenant Workspace",
        icon: "chevronLeft",
        href: routes.tenant(tenantId, "overview"),
      },
      backHref: routes.tenantSuperAdmin(tenantId, "overview"),
    };
  }

  if (workspace === "office-config") {
    const allOffices: Array<{ value: string; label: string }> = [];
    store.getTenants().forEach((t) => {
      store.getOfficesByTenant(t.id).forEach((o) => {
        allOffices.push({ value: o.id, label: o.name });
      });
    });

    return {
      brandHome: "platform",
      brandHref: routes.landing(),
      logoImg: null,
      logoText: "⚙",
      logoBg: "var(--panel-accent, var(--color-accent))",
      brandName: office ? office.name : "Office Config",
      brandBadge: "Configuration Centre",
      brandTitle: "Go to Platform Landing Page (qrew.com)",
      picker: {
        label: "",
        value: officeId,
        options: allOffices,
      },
      items: [
        {
          label: "Overview",
          href: routes.officeConfig(tenantId, officeId, "overview"),
          icon: "overview",
          active: view === "overview",
        },
        {
          label: "Invoice Templates",
          href: routes.officeConfig(tenantId, officeId, "invoice-templates"),
          icon: "invoice",
          active: view === "invoice-templates",
          dividerBefore: true,
        },
        {
          label: "Roles and Permissions",
          href: routes.officeConfig(tenantId, officeId, "roles-permissions"),
          icon: "shield",
          active: view === "roles-permissions" || view === "roles",
        },
        {
          label: "Customize fields",
          href: routes.officeConfig(tenantId, officeId, "customize-fields"),
          icon: "settings",
          active: view === "customize-fields",
          dividerBefore: true,
        },
        {
          label: "Plans and Entitlement",
          href: routes.officeConfig(tenantId, officeId, "plans-entitlements"),
          icon: "layers",
          active: view === "plans-entitlements" || view === "plans",
        },
      ],
      footerAction: {
        label: "← Platform Admin",
        tooltip: "Platform Admin",
        icon: "chevronLeft",
        href: routes.platform("overview"),
      },
      backHref: routes.officeConfig(tenantId, officeId, "overview"),
    };
  }

  if (workspace === "office") {
    const officesInTenant = tenant ? store.getOfficesByTenant(tenant.id) : [];
    return {
      brandHome: "tenant",
      brandHref: routes.tenantLanding(tenantId),
      logoImg: null,
      logoText: tenant ? tenant.name.charAt(0).toUpperCase() : "S",
      logoBg: "var(--panel-accent, var(--color-info))",
      brandName: tenant ? tenant.name : "SST",
      brandBadge: office ? office.name : "Chittagong Port Office",
      brandTitle: `Go to ${tenant ? tenant.name : "Tenant"} Landing Page (${tenantDomain})`,
      picker: {
        label: "",
        value: officeId,
        options: officesInTenant.map((o) => ({ value: o.id, label: o.name })),
        emptyLabel: "No offices created",
      },
      items: [
        {
          label: "Dashboard",
          href: routes.office(tenantId, officeId, "dashboard"),
          icon: "overview",
          active: view === "dashboard" || view === "overview",
        },
        {
          label: "Clients",
          href: routes.office(tenantId, officeId, "clients"),
          icon: "users",
          active: view === "clients",
          dividerBefore: true,
        },
        {
          label: "Files",
          href: routes.office(tenantId, officeId, "files"),
          icon: "file",
          active: view === "files",
        },
        {
          label: "Financials",
          href: routes.office(tenantId, officeId, "financials"),
          icon: "dollar",
          active: view === "financials",
        },
        {
          label: "Staffs",
          href: routes.office(tenantId, officeId, "staffs"),
          icon: "users",
          active: view === "staffs" || view === "staff",
          dividerBefore: true,
        },
      ],
      footerAction: {
        label: "Office Admin Panel →",
        tooltip: "Office Admin",
        icon: "settings",
        href: routes.officeAdmin(tenantId, officeId, "overview"),
        confirmKind: "office-admin",
      },
      backHref: routes.office(tenantId, officeId, "dashboard"),
    };
  }

  if (workspace === "office-admin") {
    const officesInTenant = tenant ? store.getOfficesByTenant(tenant.id) : [];
    const officeName = office ? office.name : "Chittagong Port Office";
    return {
      brandHome: "tenant",
      brandHref: routes.tenantLanding(tenantId),
      logoImg: null,
      logoText: tenant ? tenant.name.charAt(0).toUpperCase() : "S",
      logoBg: "var(--panel-accent, var(--color-accent))",
      brandName: tenant ? tenant.name : "SST",
      brandBadge: `${officeName} Admin`,
      brandTitle: `Go to ${tenant ? tenant.name : "Tenant"} Landing Page (${tenantDomain})`,
      picker: {
        label: "",
        value: officeId,
        options: officesInTenant.map((o) => ({ value: o.id, label: o.name })),
        emptyLabel: "No offices created",
      },
      items: [
        {
          label: "Overview",
          href: routes.officeAdmin(tenantId, officeId, "overview"),
          icon: "overview",
          active: view === "overview",
        },
        {
          label: "Invoice",
          href: routes.officeAdmin(tenantId, officeId, "invoice"),
          icon: "invoice",
          active: view === "invoice",
          dividerBefore: true,
        },
        {
          label: "Staffs Management",
          href: routes.officeAdmin(tenantId, officeId, "staffs-management"),
          icon: "users",
          active: view === "staffs-management" || view === "staff",
          dividerBefore: true,
        },
      ],
      footerAction: {
        label: "← Office Workspace",
        tooltip: "Office Workspace",
        icon: "chevronLeft",
        href: routes.office(tenantId, officeId, "dashboard"),
      },
      backHref: routes.officeAdmin(tenantId, officeId, "overview"),
    };
  }

  if (workspace === "department") {
    const activeDept = dept || { id: deptId, name: "Department", code: "DEP" };
    const deptsInOffice = office ? store.getDepartments(office.id) : [];
    return {
      brandHome: "tenant",
      brandHref: routes.tenantLanding(tenantId),
      logoImg: null,
      logoText: activeDept.code || "D",
      logoBg: "var(--color-accent)",
      brandName: activeDept.name,
      brandBadge: "Department Workspace",
      brandTitle: `Go to ${tenant ? tenant.name : "Tenant"} Landing Page (${tenantDomain})`,
      picker: {
        label: `Departments (${office ? office.name : ""})`,
        value: activeDept.id,
        options: deptsInOffice.map((d) => ({ value: d.id, label: `${d.name} [${d.code}]` })),
      },
      items: [
        {
          label: "Overview & KPIs",
          href: routes.department(deptId, "overview"),
          icon: "overview",
          active: view === "overview",
        },
        {
          label: "Staff Roster",
          href: routes.department(deptId, "members"),
          icon: "users",
          active: view === "members",
          dividerBefore: true,
        },
        {
          label: "Operational Queue",
          href: routes.department(deptId, "queue"),
          icon: "audit",
          active: view === "queue",
        },
      ],
      footerAction: null,
      backHref: routes.department(deptId, "overview"),
    };
  }

  if (workspace === "member") {
    const memberUser = store.getUserById(userId) || { id: userId, name: "Staff Member" };
    return {
      brandHome: "tenant",
      brandHref: routes.tenantLanding(tenantId),
      logoImg: null,
      logoText: memberUser.name ? memberUser.name.charAt(0).toUpperCase() : "M",
      logoBg: "var(--color-accent)",
      brandName: memberUser.name,
      brandBadge: "Member Workspace",
      brandTitle: `Go to ${tenant ? tenant.name : "Tenant"} Landing Page (${tenantDomain})`,
      picker: null,
      items: [
        {
          label: "Schedule & Tasks",
          href: routes.member(memberUser.id, "overview"),
          icon: "users",
          active: true,
        },
      ],
      footerAction: null,
      backHref: routes.member(memberUser.id, "overview"),
    };
  }

  // Default: Platform Admin
  return {
    brandHome: "platform",
    brandHref: routes.landing(),
    logoImg: "/assets/logo.png",
    logoText: "Q",
    logoBg: "transparent",
    brandName: "Qrew",
    brandBadge: "Platform Admin",
    brandTitle: "Go to Platform Landing Page (qrew.com)",
    picker: null,
    items: [
      { label: "Overview", href: routes.platform("overview"), icon: "overview", active: view === "overview" },
      {
        label: "All Tenants",
        href: routes.platform("tenants"),
        icon: "tenants",
        active: view === "tenants",
        dividerBefore: true,
      },
      { label: "Archive", href: routes.platform("archive"), icon: "archive", active: view === "archive" },
      {
        label: "Platform Access",
        href: routes.platform("platform-access"),
        icon: "users",
        active: view === "platform-access",
        dividerBefore: true,
      },
      {
        label: "Permission Access",
        href: routes.platform("permission-access"),
        icon: "shield",
        active: view === "permission-access",
      },
      {
        label: "Template & Defaults",
        href: routes.platform("template-defaults"),
        icon: "layers",
        active: view === "template-defaults" || view === "templates-defaults",
        dividerBefore: true,
      },
      {
        label: "Plans and Entitlements",
        href: routes.platform("plans-entitlements"),
        icon: "dollar",
        active: view === "plans-entitlements",
      },
      {
        label: "Usage & Analytics",
        href: routes.platform("usage-analytics"),
        icon: "activity",
        active: view === "usage-analytics",
        dividerBefore: true,
      },
      {
        label: "Audit log",
        href: routes.platform("audit-log"),
        icon: "audit",
        active: view === "audit-log" || view === "audit-logs",
      },
      {
        label: "Support Access",
        href: routes.platform("support-access"),
        icon: "users",
        active: view === "support-access",
        dividerBefore: true,
      },
      {
        label: "System Health and Incidents",
        href: routes.platform("system-health"),
        icon: "activity",
        active: view === "system-health",
      },
    ],
    footerAction: {
      label: "Super Admin →",
      tooltip: "Super Admin",
      icon: "shield",
      href: routes.superAdmin("overview"),
      confirmKind: "super-admin",
    },
    backHref: routes.platform("overview"),
  };
}
