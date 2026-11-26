import type { WorkspaceId } from "./types";

export const DEFAULT_CONTEXT_IDS = {
  tenantId: "ten_sst",
  officeId: "off_ctg_port",
  deptId: "dept_ctg_ops",
  memberId: "usr_nusrat",
} as const;

export const WORKSPACE_BLANK_TITLES: Record<string, Record<string, string>> = {
  platform: {
    overview: "Platform Dashboard",
    "platform-access": "Platform Access",
    "permission-access": "Permission Access",
    "template-defaults": "Template & Defaults",
    "templates-defaults": "Template & Defaults",
    "plans-entitlements": "Plans and Entitlements",
    "usage-analytics": "Usage & Analytics",
    "audit-log": "Audit log",
    "audit-logs": "Audit log",
    "support-access": "Support Access",
    "system-health": "System Health and Incidents",
  },
  "super-admin": {
    overview: "Overview",
  },
  "tenant-super-admin": {
    overview: "Overview",
    "plan-and-entitlement": "Plan and Entitlement",
    "qrew-profile": "Qrew Profile",
    setting: "Setting",
    settings: "Setting",
    "domain-config": "Domain Config",
    "company-profile": "Company Profile",
  },
  "office-config": {
    overview: "Overview",
    "roles-permissions": "Roles and Permissions",
    roles: "Roles and Permissions",
    "customize-fields": "Customize fields",
    "plans-entitlements": "Plans and Entitlement",
    plans: "Plans and Entitlement",
  },
  office: {
    dashboard: "Dashboard",
    overview: "Dashboard",
    clients: "Clients",
    files: "Files",
    financials: "Financials",
    staffs: "Staffs",
    staff: "Staffs",
  },
  "office-admin": {
    overview: "Overview",
    invoice: "Invoice",
    "staffs-management": "Staffs Management",
    staff: "Staffs Management",
  },
};

/**
 * Returns the exact page heading for placeholder routes across workspaces,
 * or null when the route renders a rich custom feature component.
 */
export function getWorkspacePageTitle(workspace: WorkspaceId, view: string): string | null {
  const map = WORKSPACE_BLANK_TITLES[workspace];
  if (!map) return null;
  if (view in map) return map[view];
  if (workspace === "platform" && view !== "tenants" && view !== "archive") {
    return "Platform Dashboard";
  }
  if (workspace === "office") {
    return "Dashboard";
  }
  if (workspace === "office-admin") {
    return "Overview";
  }
  if (workspace === "office-config" && view !== "invoice-templates") {
    return "Overview";
  }
  if (workspace === "tenant-super-admin") {
    return "Overview";
  }
  if (
    workspace === "super-admin" &&
    view !== "platform-access" &&
    view !== "permission-catalog" &&
    view !== "platform-settings" &&
    view !== "platform-setting"
  ) {
    return "Overview";
  }
  return null;
}

export interface ProfileRouteContext {
  tenantId?: string;
  officeId?: string;
  deptId?: string;
  userId?: string;
}

export const routes = {
  landing: () => "/",
  tenantLanding: (tenantId: string = DEFAULT_CONTEXT_IDS.tenantId) =>
    `/tenant-landing/${encodeURIComponent(tenantId)}`,
  platform: (view: string = "overview") => `/platform/${encodeURIComponent(view)}`,
  superAdmin: (view: string = "overview") => `/super-admin/${encodeURIComponent(view)}`,
  tenant: (tenantId: string = DEFAULT_CONTEXT_IDS.tenantId, view: string = "overview") =>
    `/tenant/${encodeURIComponent(tenantId)}/${encodeURIComponent(view)}`,
  tenantSuperAdmin: (
    tenantId: string = DEFAULT_CONTEXT_IDS.tenantId,
    view: string = "overview"
  ) => `/tenant-super-admin/${encodeURIComponent(tenantId)}/${encodeURIComponent(view)}`,
  officeConfig: (
    tenantId: string = DEFAULT_CONTEXT_IDS.tenantId,
    officeId: string = DEFAULT_CONTEXT_IDS.officeId,
    view: string = "overview"
  ) =>
    `/office-config/${encodeURIComponent(tenantId)}/${encodeURIComponent(
      officeId
    )}/${encodeURIComponent(view)}`,
  office: (
    tenantId: string = DEFAULT_CONTEXT_IDS.tenantId,
    officeId: string = DEFAULT_CONTEXT_IDS.officeId,
    view: string = "dashboard"
  ) =>
    `/office/${encodeURIComponent(tenantId)}/${encodeURIComponent(
      officeId
    )}/${encodeURIComponent(view)}`,
  officeAdmin: (
    tenantId: string = DEFAULT_CONTEXT_IDS.tenantId,
    officeId: string = DEFAULT_CONTEXT_IDS.officeId,
    view: string = "overview"
  ) =>
    `/office-admin/${encodeURIComponent(tenantId)}/${encodeURIComponent(
      officeId
    )}/${encodeURIComponent(view)}`,
  department: (deptId: string = DEFAULT_CONTEXT_IDS.deptId, view: string = "overview") =>
    `/department/${encodeURIComponent(deptId)}/${encodeURIComponent(view)}`,
  member: (userId: string = DEFAULT_CONTEXT_IDS.memberId, view: string = "overview") =>
    `/member/${encodeURIComponent(userId)}/${encodeURIComponent(view)}`,
  profile: (tab?: string, ws?: string, context?: ProfileRouteContext) => {
    const params = new URLSearchParams();
    if (tab) params.set("tab", tab);
    if (ws) params.set("ws", ws);
    if (context?.tenantId) params.set("tenantId", context.tenantId);
    if (context?.officeId) params.set("officeId", context.officeId);
    if (context?.deptId) params.set("deptId", context.deptId);
    if (context?.userId) params.set("userId", context.userId);
    const qs = params.toString();
    return qs ? `/profile?${qs}` : "/profile";
  },
};

export interface ParsedAppRoute {
  workspace: WorkspaceId;
  view: string;
  tenantId?: string;
  officeId?: string;
  deptId?: string;
  userId?: string;
  profileTab?: string;
  isLanding: boolean;
  isProfile: boolean;
}

export function parseRouteFromPathname(
  pathname: string,
  searchParams?: URLSearchParams | null,
  fallbackWorkspace: WorkspaceId = "platform"
): ParsedAppRoute {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  const segments = cleanPath === "/" ? [] : cleanPath.slice(1).split("/").map(decodeURIComponent);

  if (segments.length === 0) {
    return {
      workspace: "landing",
      view: "landing",
      isLanding: true,
      isProfile: false,
    };
  }

  const root = segments[0];

  if (root === "tenant-landing") {
    return {
      workspace: "tenant-landing",
      view: "landing",
      tenantId: segments[1] || searchParams?.get("id") || DEFAULT_CONTEXT_IDS.tenantId,
      isLanding: true,
      isProfile: false,
    };
  }

  if (root === "profile") {
    const paramWs =
      (searchParams?.get("ws") ||
        searchParams?.get("workspace") ||
        searchParams?.get("from")) as WorkspaceId | null;
    const profileTab = searchParams?.get("tab") || "profile";
    return {
      workspace: paramWs || fallbackWorkspace,
      view: "profile",
      tenantId: searchParams?.get("tenantId") || undefined,
      officeId: searchParams?.get("officeId") || undefined,
      deptId: searchParams?.get("deptId") || undefined,
      userId: searchParams?.get("userId") || searchParams?.get("memberId") || undefined,
      profileTab,
      isLanding: false,
      isProfile: true,
    };
  }

  if (root === "platform") {
    return {
      workspace: "platform",
      view: segments[1] || "overview",
      isLanding: false,
      isProfile: false,
    };
  }

  if (root === "super-admin") {
    return {
      workspace: "super-admin",
      view: segments[1] || "overview",
      isLanding: false,
      isProfile: false,
    };
  }

  if (root === "tenant") {
    return {
      workspace: "tenant",
      tenantId: segments[1] || DEFAULT_CONTEXT_IDS.tenantId,
      view: segments[2] || "overview",
      isLanding: false,
      isProfile: false,
    };
  }

  if (root === "tenant-super-admin") {
    return {
      workspace: "tenant-super-admin",
      tenantId: segments[1] || DEFAULT_CONTEXT_IDS.tenantId,
      view: segments[2] || "overview",
      isLanding: false,
      isProfile: false,
    };
  }

  if (root === "office-config") {
    return {
      workspace: "office-config",
      tenantId: segments[1] || DEFAULT_CONTEXT_IDS.tenantId,
      officeId: segments[2] || DEFAULT_CONTEXT_IDS.officeId,
      view: segments[3] || "overview",
      isLanding: false,
      isProfile: false,
    };
  }

  if (root === "office") {
    return {
      workspace: "office",
      tenantId: segments[1] || DEFAULT_CONTEXT_IDS.tenantId,
      officeId: segments[2] || DEFAULT_CONTEXT_IDS.officeId,
      view: segments[3] || "dashboard",
      isLanding: false,
      isProfile: false,
    };
  }

  if (root === "office-admin") {
    return {
      workspace: "office-admin",
      tenantId: segments[1] || DEFAULT_CONTEXT_IDS.tenantId,
      officeId: segments[2] || DEFAULT_CONTEXT_IDS.officeId,
      view: segments[3] || "overview",
      isLanding: false,
      isProfile: false,
    };
  }

  if (root === "department") {
    return {
      workspace: "department",
      deptId: segments[1] || DEFAULT_CONTEXT_IDS.deptId,
      view: segments[2] || "overview",
      isLanding: false,
      isProfile: false,
    };
  }

  if (root === "member") {
    return {
      workspace: "member",
      userId: segments[1] || DEFAULT_CONTEXT_IDS.memberId,
      view: segments[2] || "overview",
      isLanding: false,
      isProfile: false,
    };
  }

  return {
    workspace: "platform",
    view: "overview",
    isLanding: false,
    isProfile: false,
  };
}

export function mapHashToPath(
  rawHash: string,
  defaults: {
    tenantId?: string;
    officeId?: string;
    deptId?: string;
    userId?: string;
  } = {}
): string {
  const trimmed = rawHash.replace(/^#/, "").trim();
  if (!trimmed || trimmed === "landing") {
    return routes.landing();
  }

  const [pathPart, queryString] = trimmed.split("?");
  const params = new URLSearchParams(queryString || "");

  const tenantId = params.get("tenantId") || params.get("id") || defaults.tenantId || DEFAULT_CONTEXT_IDS.tenantId;
  const officeId = params.get("officeId") || defaults.officeId || DEFAULT_CONTEXT_IDS.officeId;
  const deptId = params.get("deptId") || defaults.deptId || DEFAULT_CONTEXT_IDS.deptId;
  const userId =
    params.get("userId") || params.get("memberId") || defaults.userId || DEFAULT_CONTEXT_IDS.memberId;

  if (pathPart === "tenant-landing" || pathPart.startsWith("tenant-landing/")) {
    return routes.tenantLanding(params.get("id") || tenantId);
  }

  if (pathPart === "profile" || pathPart.startsWith("profile/")) {
    const tab = params.get("tab") || undefined;
    const ws = params.get("ws") || params.get("workspace") || params.get("from") || undefined;
    const ctx: ProfileRouteContext = {
      tenantId: params.get("tenantId") || params.get("id") || undefined,
      officeId: params.get("officeId") || undefined,
      deptId: params.get("deptId") || undefined,
      userId: params.get("userId") || params.get("memberId") || undefined,
    };
    return routes.profile(tab, ws, ctx);
  }

  if (
    pathPart === "super-admin" ||
    pathPart.startsWith("super-admin/") ||
    pathPart === "permission-catalog" ||
    pathPart === "platform-settings" ||
    pathPart === "platform-access"
  ) {
    let view = "overview";
    if (pathPart.startsWith("super-admin/")) {
      view = pathPart.replace("super-admin/", "") || "overview";
    } else if (pathPart === "platform-settings") {
      view = "platform-settings";
    } else if (pathPart === "platform-access") {
      view = "platform-access";
    } else if (pathPart === "permission-catalog") {
      view = "permission-catalog";
    }
    return routes.superAdmin(view);
  }

  if (pathPart === "office-config" || pathPart.startsWith("office-config/")) {
    const view = pathPart.startsWith("office-config/")
      ? pathPart.replace("office-config/", "") || "overview"
      : "overview";
    return routes.officeConfig(tenantId, officeId, view);
  }

  if (pathPart === "department" || pathPart.startsWith("department/")) {
    const view = pathPart.startsWith("department/")
      ? pathPart.replace("department/", "") || "overview"
      : "overview";
    return routes.department(deptId, view);
  }

  if (pathPart === "member" || pathPart.startsWith("member/")) {
    const view = pathPart.startsWith("member/")
      ? pathPart.replace("member/", "") || "overview"
      : "overview";
    return routes.member(userId, view);
  }

  if (pathPart === "tenant-super-admin" || pathPart.startsWith("tenant-super-admin/")) {
    const view = pathPart.startsWith("tenant-super-admin/")
      ? pathPart.replace("tenant-super-admin/", "") || "overview"
      : "overview";
    return routes.tenantSuperAdmin(tenantId, view);
  }

  if (
    pathPart.startsWith("tenant/") ||
    pathPart === "tenant-details" ||
    pathPart === "tenant-overview" ||
    pathPart === "tenant-offices" ||
    pathPart === "tenant-members" ||
    pathPart === "tenant-roles" ||
    pathPart === "tenant-settings" ||
    pathPart === "tenant"
  ) {
    let view = "overview";
    if (pathPart.startsWith("tenant/")) {
      view = pathPart.replace("tenant/", "") || "overview";
    } else if (pathPart === "tenant-offices") {
      view = "offices";
    } else if (pathPart === "tenant-members") {
      view = "members";
    } else if (pathPart === "tenant-roles") {
      view = "roles";
    } else if (pathPart === "tenant-settings") {
      view = "settings";
    }
    return routes.tenant(tenantId, view);
  }

  if (
    pathPart.startsWith("office-admin/") ||
    pathPart === "office-admin" ||
    pathPart === "office-admin-overview" ||
    pathPart === "office-admin-staff" ||
    pathPart === "office-admin-departments" ||
    pathPart === "office-admin-roles" ||
    pathPart === "office-admin-activity" ||
    pathPart === "office-admin-invoice" ||
    pathPart === "office-admin-staffs-management"
  ) {
    let view = "overview";
    if (pathPart.startsWith("office-admin/")) {
      view = pathPart.replace("office-admin/", "") || "overview";
    } else if (pathPart === "office-admin-staff" || pathPart === "office-admin-staffs-management") {
      view = "staffs-management";
    } else if (pathPart === "office-admin-invoice") {
      view = "invoice";
    }
    return routes.officeAdmin(tenantId, officeId, view);
  }

  if (
    pathPart.startsWith("office/") ||
    pathPart === "office-details" ||
    pathPart === "office-overview" ||
    pathPart === "office-staff" ||
    pathPart === "office-roles" ||
    pathPart === "office-activity" ||
    pathPart === "office-departments" ||
    pathPart === "office" ||
    pathPart === "office-dashboard" ||
    pathPart === "office-clients" ||
    pathPart === "office-files" ||
    pathPart === "office-financials" ||
    pathPart === "office-staffs"
  ) {
    let view = "dashboard";
    if (pathPart.startsWith("office/")) {
      view = pathPart.replace("office/", "") || "dashboard";
    } else if (pathPart === "office-clients") {
      view = "clients";
    } else if (pathPart === "office-files") {
      view = "files";
    } else if (pathPart === "office-financials") {
      view = "financials";
    } else if (pathPart === "office-staffs" || pathPart === "office-staff") {
      view = "staffs";
    }
    return routes.office(tenantId, officeId, view);
  }

  // Default: platform workspace
  let view = "overview";
  if (pathPart.startsWith("platform/")) {
    view = pathPart.replace("platform/", "") || "overview";
  } else if (pathPart === "tenants") {
    view = "tenants";
  } else if (pathPart === "archive") {
    view = "archive";
  } else if (pathPart === "platform-users") {
    view = "platform-access";
  } else if (
    pathPart === "roles-permissions" ||
    pathPart === "platform-roles" ||
    pathPart === "permission-access"
  ) {
    view = "permission-access";
  } else if (pathPart === "template-defaults" || pathPart === "templates-defaults") {
    view = "template-defaults";
  } else if (pathPart === "plans-entitlements") {
    view = "plans-entitlements";
  } else if (pathPart === "usage-analytics") {
    view = "usage-analytics";
  } else if (pathPart === "audit-logs" || pathPart === "audit-log") {
    view = "audit-log";
  } else if (pathPart === "support-access") {
    view = "support-access";
  } else if (pathPart === "system-health") {
    view = "system-health";
  }

  return routes.platform(view);
}
