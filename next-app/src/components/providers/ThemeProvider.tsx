"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import { parseRouteFromPathname } from "@/lib/routes";
import type { DensityMode, ThemeMode, WorkspaceId } from "@/lib/types";
import { getAccentHover, hexToRgb, PANEL_THEMES } from "@/lib/workspace-config";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const THEME_STORAGE_KEY = "qrew_ui_theme";
const SECONDARY_STORAGE_KEY = "qrew_ui_secondary";
const ACCENT_LEGACY_KEY = "qrew_ui_accent";
const DENSITY_STORAGE_KEY = "qrew_ui_density";

interface AppearanceSnapshot {
  theme: ThemeMode;
  secondaryColor: string;
  density: DensityMode;
  systemDark: boolean;
}

const DEFAULT_SNAPSHOT: AppearanceSnapshot = {
  theme: "system",
  secondaryColor: "default",
  density: "comfortable",
  systemDark: false,
};

function readClientSnapshot(): AppearanceSnapshot {
  if (typeof window === "undefined") return DEFAULT_SNAPSHOT;
  try {
    const urlTheme = new URLSearchParams(window.location.search).get("theme") as ThemeMode | null;
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    const theme: ThemeMode = urlTheme || storedTheme || "system";
    const secondaryColor =
      window.localStorage.getItem(SECONDARY_STORAGE_KEY) ||
      window.localStorage.getItem(ACCENT_LEGACY_KEY) ||
      "default";
    const density = (window.localStorage.getItem(DENSITY_STORAGE_KEY) as DensityMode | null) || "comfortable";
    const systemDark = Boolean(
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    );
    return { theme, secondaryColor, density, systemDark };
  } catch {
    return DEFAULT_SNAPSHOT;
  }
}

class AppearanceController {
  private listeners = new Set<() => void>();
  private snapshot: AppearanceSnapshot = DEFAULT_SNAPSHOT;
  private hydrated = false;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    if (typeof window !== "undefined") {
      const refresh = () => {
        this.snapshot = readClientSnapshot();
        this.listeners.forEach((l) => l());
      };
      const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
      window.addEventListener("storage", refresh);
      mq?.addEventListener("change", refresh);
      return () => {
        this.listeners.delete(listener);
        window.removeEventListener("storage", refresh);
        mq?.removeEventListener("change", refresh);
      };
    }
    return () => {
      this.listeners.delete(listener);
    };
  };

  getServerSnapshot = (): AppearanceSnapshot => DEFAULT_SNAPSHOT;

  getSnapshot = (): AppearanceSnapshot => {
    if (typeof window !== "undefined" && !this.hydrated) {
      this.hydrated = true;
      this.snapshot = readClientSnapshot();
    }
    return this.snapshot;
  };

  update = () => {
    this.snapshot = readClientSnapshot();
    this.listeners.forEach((l) => l());
  };
}

const appearanceController = new AppearanceController();

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedDark: boolean;
  secondaryColor: string;
  density: DensityMode;
  activeWorkspace: WorkspaceId;
  isLandingMode: boolean;
  isProfileMode: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setSecondaryColor: (color: string) => void;
  setDensity: (density: DensityMode) => void;
  setShellFlags: (flags: {
    workspace: WorkspaceId;
    isLandingMode?: boolean;
    isProfileMode?: boolean;
  }) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const snap = useSyncExternalStore(
    appearanceController.subscribe,
    appearanceController.getSnapshot,
    appearanceController.getServerSnapshot
  );

  const routeParsed = useMemo(() => parseRouteFromPathname(pathname), [pathname]);

  const [shellFlags, setShellFlagsState] = useState<{
    workspace: WorkspaceId;
    isLandingMode: boolean;
    isProfileMode: boolean;
  }>(() => ({
    workspace: routeParsed.workspace,
    isLandingMode: routeParsed.isLanding,
    isProfileMode: routeParsed.isProfile,
  }));

  useIsomorphicLayoutEffect(() => {
    let targetWorkspace = routeParsed.workspace;
    if (routeParsed.isProfile && typeof window !== "undefined") {
      try {
        const sp = new URLSearchParams(window.location.search);
        const paramWs = (sp.get("ws") || sp.get("workspace") || sp.get("from")) as WorkspaceId | null;
        const storedWs = window.sessionStorage.getItem("qrew_active_workspace") as WorkspaceId | null;
        targetWorkspace = paramWs || storedWs || "platform";
      } catch {}
    }

    setShellFlagsState((prev) => {
      if (
        prev.workspace === targetWorkspace &&
        prev.isLandingMode === routeParsed.isLanding &&
        prev.isProfileMode === routeParsed.isProfile
      ) {
        return prev;
      }
      return {
        workspace: targetWorkspace,
        isLandingMode: routeParsed.isLanding,
        isProfileMode: routeParsed.isProfile,
      };
    });
  }, [routeParsed.workspace, routeParsed.isLanding, routeParsed.isProfile]);

  const resolvedDark = snap.theme === "dark" || (snap.theme === "system" && snap.systemDark);

  const setShellFlags = useCallback(
    (flags: { workspace: WorkspaceId; isLandingMode?: boolean; isProfileMode?: boolean }) => {
      setShellFlagsState((prev) => {
        const nextLanding = Boolean(flags.isLandingMode);
        const nextProfile = Boolean(flags.isProfileMode);
        if (
          prev.workspace === flags.workspace &&
          prev.isLandingMode === nextLanding &&
          prev.isProfileMode === nextProfile
        ) {
          return prev;
        }
        return {
          workspace: flags.workspace,
          isLandingMode: nextLanding,
          isProfileMode: nextProfile,
        };
      });
    },
    []
  );

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (resolvedDark) {
      root.setAttribute("data-theme", "dark");
      root.style.backgroundColor = "#0B1220";
      root.style.colorScheme = "dark";
    } else {
      root.removeAttribute("data-theme");
      root.style.backgroundColor = "#F8FAFC";
      root.style.colorScheme = "light";
    }

    body.setAttribute("data-workspace", shellFlags.workspace);
    body.classList.remove(
      "ws-platform",
      "ws-super-admin",
      "ws-tenant",
      "ws-tenant-super-admin",
      "ws-office",
      "ws-office-admin",
      "ws-office-config",
      "ws-department",
      "ws-member",
      "ws-landing",
      "ws-tenant-landing"
    );
    body.classList.add(`ws-${shellFlags.workspace}`);
    body.classList.toggle("landing-mode", shellFlags.isLandingMode);
    body.classList.toggle("profile-mode", shellFlags.isProfileMode);
    body.classList.toggle("density-compact", snap.density === "compact");

    const panelTheme = PANEL_THEMES[shellFlags.workspace] || PANEL_THEMES.platform;

    if (snap.secondaryColor && snap.secondaryColor !== "default") {
      const rgb = hexToRgb(snap.secondaryColor);
      const lightTint = resolvedDark ? `rgba(${rgb}, 0.2)` : `rgba(${rgb}, 0.12)`;
      const hoverTint = resolvedDark ? `rgba(${rgb}, 0.32)` : `rgba(${rgb}, 0.2)`;
      const accentHover = getAccentHover(snap.secondaryColor, resolvedDark);

      root.style.setProperty("--color-secondary", snap.secondaryColor);
      root.style.setProperty("--panel-accent", snap.secondaryColor);
      root.style.setProperty("--panel-accent-light", lightTint);
      root.style.setProperty("--panel-accent-hover", hoverTint);
      root.style.setProperty("--color-accent", snap.secondaryColor);
      root.style.setProperty("--color-accent-hover", accentHover);
    } else {
      const effectiveAccent = resolvedDark
        ? panelTheme.darkAccent || panelTheme.primaryAccent
        : panelTheme.primaryAccent;
      const light = resolvedDark ? panelTheme.darkLightAccent : panelTheme.lightAccent;
      const hover = resolvedDark ? panelTheme.darkHoverAccent : panelTheme.hoverAccent;
      const accentHover = getAccentHover(effectiveAccent, resolvedDark);

      root.style.removeProperty("--color-secondary");
      root.style.setProperty("--panel-accent", effectiveAccent);
      root.style.setProperty("--panel-accent-light", light);
      root.style.setProperty("--panel-accent-hover", hover);
      root.style.setProperty("--color-accent", effectiveAccent);
      root.style.setProperty("--color-accent-hover", accentHover);
    }
  }, [resolvedDark, snap.secondaryColor, snap.density, shellFlags]);

  const setTheme = useCallback((next: ThemeMode) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      appearanceController.update();
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = resolvedDark ? "light" : "dark";
    setTheme(next);
  }, [resolvedDark, setTheme]);

  const setSecondaryColor = useCallback((color: string) => {
    try {
      if (!color || color === "default") {
        window.localStorage.removeItem(SECONDARY_STORAGE_KEY);
        window.localStorage.removeItem(ACCENT_LEGACY_KEY);
      } else {
        window.localStorage.setItem(SECONDARY_STORAGE_KEY, color);
      }
      appearanceController.update();
    } catch {}
  }, []);

  const setDensity = useCallback((density: DensityMode) => {
    try {
      window.localStorage.setItem(DENSITY_STORAGE_KEY, density);
      appearanceController.update();
    } catch {}
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: snap.theme,
      resolvedDark,
      secondaryColor: snap.secondaryColor,
      density: snap.density,
      activeWorkspace: shellFlags.workspace,
      isLandingMode: shellFlags.isLandingMode,
      isProfileMode: shellFlags.isProfileMode,
      setTheme,
      toggleTheme,
      setSecondaryColor,
      setDensity,
      setShellFlags,
    }),
    [snap.theme, resolvedDark, snap.secondaryColor, snap.density, shellFlags, setTheme, toggleTheme, setSecondaryColor, setDensity, setShellFlags]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }
  return ctx;
}
