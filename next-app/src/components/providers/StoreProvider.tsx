"use client";

import React, { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { DataStore, type QrewRepository } from "@/lib/data-store";
import type { PanelUserInfo, WorkspaceId } from "@/lib/types";
import { DEFAULT_DATA, STORAGE_KEY } from "@/lib/seed-data";

const OVERRIDES_KEY = "qrew_panel_user_overrides";

interface StoreSnapshot {
  version: number;
  store: DataStore;
  panelOverrides: Record<string, Partial<PanelUserInfo>>;
}

function readOverridesFromStorage(): Record<string, Partial<PanelUserInfo>> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(OVERRIDES_KEY) || "{}") as Record<
      string,
      Partial<PanelUserInfo>
    >;
  } catch {
    return {};
  }
}

const serverReadonlyRepo: QrewRepository = {
  loadSync: () => DEFAULT_DATA,
  saveSync: () => {},
  resetSync: () => DEFAULT_DATA,
  loadAsync: async () => DEFAULT_DATA,
  saveAsync: async () => {},
};

class StoreController {
  public readonly serverStore: DataStore;
  public readonly clientStore: DataStore;
  private version = 0;
  private hydrated = false;
  private listeners = new Set<() => void>();
  private readonly serverSnapshot: StoreSnapshot;
  private clientSnapshot: StoreSnapshot;

  constructor() {
    this.serverStore = new DataStore(serverReadonlyRepo, DEFAULT_DATA);
    this.clientStore = new DataStore();
    this.serverSnapshot = {
      version: 0,
      store: this.serverStore,
      panelOverrides: {},
    };
    this.clientSnapshot = {
      version: 0,
      store: this.clientStore,
      panelOverrides: {},
    };
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    if (typeof window !== "undefined") {
      const onStorage = (e: StorageEvent) => {
        if (!e.key || e.key === STORAGE_KEY || e.key === OVERRIDES_KEY) {
          this.clientStore.hydrateFromStorage();
          this.bump();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        this.listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    }
    return () => {
      this.listeners.delete(listener);
    };
  };

  getServerSnapshot = (): StoreSnapshot => this.serverSnapshot;

  getSnapshot = (): StoreSnapshot => {
    if (typeof window !== "undefined" && !this.hydrated) {
      this.hydrated = true;
      this.clientStore.hydrateFromStorage();
      this.clientSnapshot = {
        version: ++this.version,
        store: this.clientStore,
        panelOverrides: readOverridesFromStorage(),
      };
    }
    return this.clientSnapshot;
  };

  bump = () => {
    this.clientSnapshot = {
      version: ++this.version,
      store: this.clientStore,
      panelOverrides: readOverridesFromStorage(),
    };
    this.listeners.forEach((l) => l());
  };

  setPanelOverride = (workspace: WorkspaceId, patch: Partial<PanelUserInfo>) => {
    if (typeof window === "undefined") return;
    const current = readOverridesFromStorage();
    current[workspace] = { ...(current[workspace] || {}), ...patch };
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(current));
    this.bump();
  };
}

const sharedController = new StoreController();

interface StoreContextValue {
  controller: StoreController;
  mutate: <T>(fn: (store: DataStore) => T) => T;
  resetDemoData: () => void;
  setPanelUserOverride: (workspace: WorkspaceId, patch: Partial<PanelUserInfo>) => void;
}

export interface QrewStoreHookResult {
  store: DataStore;
  version: number;
  panelOverrides: Record<string, Partial<PanelUserInfo>>;
  mutate: <T>(fn: (store: DataStore) => T) => T;
  resetDemoData: () => void;
  setPanelUserOverride: (workspace: WorkspaceId, patch: Partial<PanelUserInfo>) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const mutate = useCallback(<T,>(fn: (store: DataStore) => T): T => {
    // Ensure client store is hydrated from localStorage before first mutation
    sharedController.getSnapshot();
    const result = fn(sharedController.clientStore);
    sharedController.bump();
    return result;
  }, []);

  const resetDemoData = useCallback(() => {
    sharedController.clientStore.reset();
    sharedController.bump();
  }, []);

  const setPanelUserOverride = useCallback(
    (workspace: WorkspaceId, patch: Partial<PanelUserInfo>) => {
      sharedController.setPanelOverride(workspace, patch);
    },
    []
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      controller: sharedController,
      mutate,
      resetDemoData,
      setPanelUserOverride,
    }),
    [mutate, resetDemoData, setPanelUserOverride]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/**
 * Each consumer subscribes directly via useSyncExternalStore so streamed <Suspense>
 * boundaries always hydrate with immutable serverSnapshot (DEFAULT_DATA) before
 * reconciling with client localStorage state.
 */
export function useQrewStore(): QrewStoreHookResult {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useQrewStore must be used inside StoreProvider.");
  }

  const snapshot = useSyncExternalStore(
    ctx.controller.subscribe,
    ctx.controller.getSnapshot,
    ctx.controller.getServerSnapshot
  );

  return useMemo<QrewStoreHookResult>(
    () => ({
      store: snapshot.store,
      version: snapshot.version,
      panelOverrides: snapshot.panelOverrides,
      mutate: ctx.mutate,
      resetDemoData: ctx.resetDemoData,
      setPanelUserOverride: ctx.setPanelUserOverride,
    }),
    [snapshot, ctx.mutate, ctx.resetDemoData, ctx.setPanelUserOverride]
  );
}
