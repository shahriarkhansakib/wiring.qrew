"use client";

import React, {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { parseRouteFromPathname, type ProfileRouteContext } from "@/lib/routes";
import type { WorkspaceId } from "@/lib/types";
import { buildWorkspaceContext, getSidebarConfig } from "@/lib/workspace-config";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const ACTIVE_WORKSPACE_SESSION_KEY = "qrew_active_workspace";
const ACTIVE_CONTEXT_SESSION_KEY = "qrew_active_context";
const EMPTY_CONTEXT_JSON = "{}";

function subscribeNoop() {
  return () => {};
}

function getSessionWorkspaceClient(): WorkspaceId {
  try {
    return (window.sessionStorage.getItem(ACTIVE_WORKSPACE_SESSION_KEY) as WorkspaceId | null) || "platform";
  } catch {
    return "platform";
  }
}

function getSessionWorkspaceServer(): WorkspaceId {
  return "platform";
}

function getSessionContextJsonClient(): string {
  try {
    return window.sessionStorage.getItem(ACTIVE_CONTEXT_SESSION_KEY) || EMPTY_CONTEXT_JSON;
  } catch {
    return EMPTY_CONTEXT_JSON;
  }
}

function getSessionContextJsonServer(): string {
  return EMPTY_CONTEXT_JSON;
}

interface ShellContextValue {
  studioMode: boolean;
  setStudioMode: (enabled: boolean) => void;
}

const ShellContext = createContext<ShellContextValue>({
  studioMode: false,
  setStudioMode: () => {},
});

export function useAppShell() {
  return useContext(ShellContext);
}

interface ProfileQueryState extends ProfileRouteContext {
  ws: string | null;
  tab: string | null;
}

function ProfileQueryReader({
  onQuery,
}: {
  onQuery: (query: ProfileQueryState) => void;
}) {
  const searchParams = useSearchParams();
  const ws = searchParams.get("ws") || searchParams.get("workspace") || searchParams.get("from");
  const tab = searchParams.get("tab");
  const tenantId = searchParams.get("tenantId") || undefined;
  const officeId = searchParams.get("officeId") || undefined;
  const deptId = searchParams.get("deptId") || undefined;
  const userId = searchParams.get("userId") || searchParams.get("memberId") || undefined;

  useEffect(() => {
    onQuery({ ws, tab, tenantId, officeId, deptId, userId });
  }, [ws, tab, tenantId, officeId, deptId, userId, onQuery]);

  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const { store, version } = useQrewStore();
  const { setShellFlags } = useTheme();

  const [mobileOpenedPath, setMobileOpenedPath] = useState<string | null>(null);
  const [studioMode, setStudioMode] = useState(false);
  const [profileQuery, setProfileQuery] = useState<ProfileQueryState>({
    ws: null,
    tab: null,
  });

  const mobileOpen = mobileOpenedPath === pathname;

  const fallbackWs = useSyncExternalStore(
    subscribeNoop,
    getSessionWorkspaceClient,
    getSessionWorkspaceServer
  );

  const fallbackContextJson = useSyncExternalStore(
    subscribeNoop,
    getSessionContextJsonClient,
    getSessionContextJsonServer
  );

  const fallbackContext = useMemo<ProfileRouteContext>(() => {
    try {
      return JSON.parse(fallbackContextJson) as ProfileRouteContext;
    } catch {
      return {};
    }
  }, [fallbackContextJson]);

  const syntheticParams = useMemo(() => {
    if (
      !profileQuery.ws &&
      !profileQuery.tab &&
      !profileQuery.tenantId &&
      !profileQuery.officeId &&
      !profileQuery.deptId &&
      !profileQuery.userId
    ) {
      return null;
    }
    const sp = new URLSearchParams();
    if (profileQuery.ws) sp.set("ws", profileQuery.ws);
    if (profileQuery.tab) sp.set("tab", profileQuery.tab);
    if (profileQuery.tenantId) sp.set("tenantId", profileQuery.tenantId);
    if (profileQuery.officeId) sp.set("officeId", profileQuery.officeId);
    if (profileQuery.deptId) sp.set("deptId", profileQuery.deptId);
    if (profileQuery.userId) sp.set("userId", profileQuery.userId);
    return sp;
  }, [profileQuery]);

  const parsed = useMemo(
    () => parseRouteFromPathname(pathname, syntheticParams, fallbackWs),
    [pathname, syntheticParams, fallbackWs]
  );

  const ctx = useMemo(() => {
    void version;
    return buildWorkspaceContext(store, parsed.workspace, parsed.view, {
      tenantId: parsed.tenantId ?? (parsed.isProfile ? fallbackContext.tenantId : undefined),
      officeId: parsed.officeId ?? (parsed.isProfile ? fallbackContext.officeId : undefined),
      deptId: parsed.deptId ?? (parsed.isProfile ? fallbackContext.deptId : undefined),
      userId: parsed.userId ?? (parsed.isProfile ? fallbackContext.userId : undefined),
    });
  }, [store, version, parsed, fallbackContext]);

  const sidebarConfig = useMemo(() => getSidebarConfig(ctx), [ctx]);

  useEffect(() => {
    setShellFlags({
      workspace: parsed.workspace,
      isLandingMode: false,
      isProfileMode: parsed.isProfile,
    });
    if (
      parsed.workspace &&
      parsed.workspace !== "landing" &&
      parsed.workspace !== "tenant-landing" &&
      !parsed.isProfile
    ) {
      try {
        window.sessionStorage.setItem(ACTIVE_WORKSPACE_SESSION_KEY, parsed.workspace);
        window.sessionStorage.setItem(
          ACTIVE_CONTEXT_SESSION_KEY,
          JSON.stringify({
            tenantId: ctx.tenantId,
            officeId: ctx.officeId,
            deptId: ctx.deptId,
            userId: ctx.userId,
          })
        );
      } catch {}
    }
  }, [
    parsed.workspace,
    parsed.isProfile,
    ctx.tenantId,
    ctx.officeId,
    ctx.deptId,
    ctx.userId,
    setShellFlags,
  ]);

  const handleProfileQuery = useCallback(
    (next: ProfileQueryState) => {
      setProfileQuery((prev) =>
        prev.ws === next.ws &&
        prev.tab === next.tab &&
        prev.tenantId === next.tenantId &&
        prev.officeId === next.officeId &&
        prev.deptId === next.deptId &&
        prev.userId === next.userId
          ? prev
          : next
      );
    },
    []
  );

  const shellCtxValue = useMemo(
    () => ({ studioMode, setStudioMode }),
    [studioMode]
  );

  const closeMobile = useCallback(() => setMobileOpenedPath(null), []);
  const toggleMobile = useCallback(
    () => setMobileOpenedPath((prev) => (prev === pathname ? null : pathname)),
    [pathname]
  );

  return (
    <ShellContext.Provider value={shellCtxValue}>
      <Suspense fallback={null}>
        <ProfileQueryReader onQuery={handleProfileQuery} />
      </Suspense>
      <div className="app-shell">
        <Sidebar
          config={sidebarConfig}
          ctx={ctx}
          mobileOpen={mobileOpen}
          onCloseMobile={closeMobile}
        />

        <div
          className={`sidebar-backdrop${mobileOpen ? " active" : ""}`}
          id="sidebar-backdrop"
          aria-hidden="true"
          onClick={closeMobile}
        />

        <div className="main-wrapper">
          <Topbar
            sidebarConfig={sidebarConfig}
            ctx={ctx}
            isProfile={parsed.isProfile}
            profileTab={parsed.profileTab}
            onOpenMobileMenu={toggleMobile}
          />

          <main
            className={`content-area${studioMode ? " studio-mode" : ""}`}
            id="main-content"
            role="main"
          >
            {children}
          </main>
        </div>
      </div>
    </ShellContext.Provider>
  );
}
