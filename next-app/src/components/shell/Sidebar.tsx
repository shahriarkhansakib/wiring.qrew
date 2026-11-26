"use client";

import React, { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QrewIcon } from "@/components/ui/Icons";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { routes } from "@/lib/routes";
import type { SidebarConfig, WorkspaceRuntimeContext } from "@/lib/workspace-config";

const SIDEBAR_COLLAPSED_KEY = "qrew_sidebar_collapsed";
const SIDEBAR_WIDTH_KEY = "qrew_sidebar_width";

class SidebarCollapsedController {
  private listeners = new Set<() => void>();
  private collapsed = false;
  private hydrated = false;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getServerSnapshot = () => false;

  getSnapshot = () => {
    if (typeof window !== "undefined" && !this.hydrated) {
      this.hydrated = true;
      try {
        this.collapsed = window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
      } catch {
        this.collapsed = false;
      }
    }
    return this.collapsed;
  };

  setCollapsed = (next: boolean | ((prev: boolean) => boolean)) => {
    const prev = this.getSnapshot();
    const resolved = typeof next === "function" ? next(prev) : next;
    if (resolved === prev) return;
    this.collapsed = resolved;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(resolved));
      } catch {}
      if (resolved) {
        document.documentElement.setAttribute("data-sidebar-collapsed", "true");
      } else {
        document.documentElement.removeAttribute("data-sidebar-collapsed");
      }
    }
    this.listeners.forEach((l) => l());
  };
}

const sidebarCollapsedController = new SidebarCollapsedController();

export function Sidebar({
  config,
  ctx,
  mobileOpen,
  onCloseMobile,
}: {
  config: SidebarConfig;
  ctx: WorkspaceRuntimeContext;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const router = useRouter();
  const { store } = useQrewStore();
  const { confirmDialog } = useUiFeedback();
  const sidebarRef = useRef<HTMLElement | null>(null);
  const resizerRef = useRef<HTMLDivElement | null>(null);

  const collapsed = useSyncExternalStore(
    sidebarCollapsedController.subscribe,
    sidebarCollapsedController.getSnapshot,
    sidebarCollapsedController.getServerSnapshot
  );

  const toggleSidebar = useCallback(() => {
    sidebarCollapsedController.setCollapsed((prev) => !prev);
  }, []);

  // Restore saved sidebar width and handle Ctrl+B / Cmd+B shortcut
  useEffect(() => {
    try {
      const savedWidth = parseInt(window.localStorage.getItem(SIDEBAR_WIDTH_KEY) || "", 10);
      if (savedWidth >= 180 && savedWidth <= 500) {
        document.documentElement.style.setProperty("--sidebar-width", `${savedWidth}px`);
      }
    } catch {}

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar]);

  // Sidebar drag resizer
  useEffect(() => {
    const resizer = resizerRef.current;
    if (!resizer) return;

    let isResizing = false;
    let startX = 0;
    let startWidth = 256;

    const onMouseDown = (e: MouseEvent) => {
      if (sidebarCollapsedController.getSnapshot()) return;
      isResizing = true;
      startX = e.clientX;
      startWidth = sidebarRef.current ? sidebarRef.current.getBoundingClientRect().width : 256;
      document.body.classList.add("is-resizing");
      resizer.classList.add("resizing");
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      let newWidth = startWidth + (e.clientX - startX);
      if (newWidth < 180) newWidth = 180;
      else if (newWidth > 500) newWidth = 500;
      document.documentElement.style.setProperty("--sidebar-width", `${newWidth}px`);
    };

    const onMouseUp = () => {
      if (!isResizing) return;
      isResizing = false;
      document.body.classList.remove("is-resizing");
      resizer.classList.remove("resizing");
      const currentWidth = sidebarRef.current
        ? sidebarRef.current.getBoundingClientRect().width
        : 256;
      if (currentWidth >= 180 && currentWidth <= 500) {
        try {
          window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(Math.round(currentWidth)));
        } catch {}
      }
    };

    const onDblClick = () => {
      document.documentElement.style.setProperty("--sidebar-width", "256px");
      try {
        window.localStorage.setItem(SIDEBAR_WIDTH_KEY, "256");
      } catch {}
    };

    resizer.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    resizer.addEventListener("dblclick", onDblClick);

    return () => {
      resizer.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      resizer.removeEventListener("dblclick", onDblClick);
      document.body.classList.remove("is-resizing");
    };
  }, []);

  const handleBrandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (collapsed) {
      toggleSidebar();
      return;
    }
    onCloseMobile();
    router.push(config.brandHref);
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    onCloseMobile();

    if (ctx.workspace === "office-config") {
      const targetOffice = store.getOfficeById(val);
      const nextTenantId = targetOffice ? targetOffice.tenantId : ctx.tenantId;
      router.push(routes.officeConfig(nextTenantId, val, ctx.view || "overview"));
    } else if (ctx.workspace === "office") {
      router.push(routes.office(ctx.tenantId, val, ctx.view || "dashboard"));
    } else if (ctx.workspace === "office-admin") {
      router.push(routes.officeAdmin(ctx.tenantId, val, ctx.view || "overview"));
    } else if (ctx.workspace === "department") {
      router.push(routes.department(val, ctx.view || "overview"));
    }
  };

  const handleFooterClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const action = config.footerAction;
    if (!action) return;

    if (!action.confirmKind) {
      onCloseMobile();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (action.confirmKind === "super-admin") {
      confirmDialog({
        title: "Switch to Super Admin",
        message: "Are you sure you want to switch to Platform Super Admin?",
        confirmText: "Continue",
        confirmClass: "btn-blue",
        icon: "shield",
        iconColor: "var(--color-secondary, #2563EB)",
        showDoNotAskAgain: true,
        doNotAskAgainKey: "qrew_skip_confirm_switch_super_admin",
        onConfirm: () => {
          onCloseMobile();
          router.push(action.href);
        },
      });
    } else if (action.confirmKind === "tenant-super-admin") {
      confirmDialog({
        title: "Switch to Tenant Super Admin",
        message: "Are you sure you want to switch to Tenant Super Admin?",
        confirmText: "Continue",
        confirmClass: "btn-purple",
        confirmStyle: {
          backgroundColor: "var(--color-supporting-purple, #7C3AED)",
          borderColor: "var(--color-supporting-purple, #7C3AED)",
          color: "#FFFFFF",
        },
        icon: "shield",
        iconColor: "var(--color-supporting-purple, #7C3AED)",
        showDoNotAskAgain: true,
        doNotAskAgainKey: "qrew_skip_confirm_switch_tenant_super_admin",
        onConfirm: () => {
          onCloseMobile();
          router.push(action.href);
        },
      });
    } else if (action.confirmKind === "office-admin") {
      confirmDialog({
        title: "Switch to Office Admin",
        message: "Are you sure you want to switch to Office Admin?",
        confirmText: "Continue",
        confirmClass: "btn-primary",
        icon: "settings",
        iconColor: "var(--color-primary, #0D9488)",
        showDoNotAskAgain: true,
        doNotAskAgainKey: "qrew_skip_confirm_switch_office_admin",
        onConfirm: () => {
          onCloseMobile();
          router.push(action.href);
        },
      });
    }
  };

  const toggleLabel = collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)";

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " mobile-open" : ""}`}
      id="sidebar"
    >
      <div className="sidebar-header" id="sidebar-header">
        <div
          className="brand-wrapper"
          id="brand-wrapper"
          title={collapsed ? "Expand sidebar (Ctrl+B)" : config.brandTitle}
          data-tooltip={collapsed ? "Expand sidebar (Ctrl+B)" : undefined}
          onClick={handleBrandClick}
        >
          <div
            className={`brand-logo${config.logoImg ? " has-img" : ""}`}
            id="sidebar-brand-logo"
            style={{
              backgroundColor: config.logoImg ? "transparent" : config.logoBg,
            }}
          >
            {config.logoImg ? (
              <Image
                src={config.logoImg}
                alt={config.brandName}
                width={32}
                height={32}
                className="brand-logo-img"
                priority
              />
            ) : (
              config.logoText
            )}
          </div>
          <div className="brand-info" id="sidebar-brand-info">
            <span className="brand-name" id="sidebar-brand-name">
              {config.brandName}
            </span>
            <span className="brand-badge" id="sidebar-brand-badge">
              {config.brandBadge}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="sidebar-toggle-btn"
          id="sidebar-toggle-btn"
          title={toggleLabel}
          aria-label={toggleLabel}
          data-tooltip={toggleLabel}
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <line x1="9" x2="9" y1="3" y2="21" />
            <path d="m14 9-3 3 3 3" />
          </svg>
        </button>
      </div>

      {/* Context Selector (Tenant / Office / Department Switcher) */}
      <div
        className="sidebar-context-picker"
        id="sidebar-context-picker"
        style={{ display: config.picker ? "flex" : "none" }}
      >
        {config.picker ? (
          <>
            <span
              className="sidebar-context-label"
              id="sidebar-context-label"
              style={{ display: config.picker.label ? "block" : "none" }}
            >
              {config.picker.label}
            </span>
            <select
              className="sidebar-context-select"
              id="sidebar-context-select"
              aria-label="Switch organization or branch"
              value={config.picker.value}
              onChange={handlePickerChange}
            >
              {config.picker.options.length > 0 ? (
                config.picker.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              ) : (
                <option disabled value="">
                  {config.picker.emptyLabel || "No items available"}
                </option>
              )}
            </select>
          </>
        ) : null}
      </div>

      <nav className="sidebar-nav" id="sidebar-nav">
        <div className="nav-section">
          {config.items.map((item) => (
            <React.Fragment key={item.href}>
              {item.dividerBefore ? <div className="nav-divider" /> : null}
              <Link
                href={item.href}
                prefetch={true}
                className={`nav-item${item.active ? " active" : ""}`}
                title={item.label}
                data-tooltip={item.label}
                aria-label={item.label}
                onClick={onCloseMobile}
              >
                <span className="nav-icon">
                  <QrewIcon name={item.icon} />
                </span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </React.Fragment>
          ))}
        </div>
      </nav>

      <div
        className="sidebar-footer"
        id="sidebar-footer"
        style={{ display: config.footerAction ? "flex" : "none" }}
      >
        {config.footerAction ? (
          <Link
            href={config.footerAction.href}
            prefetch={true}
            className="footer-action-link"
            title={config.footerAction.tooltip}
            data-tooltip={config.footerAction.tooltip}
            onClick={handleFooterClick}
          >
            <span className="footer-action-icon">
              <QrewIcon name={config.footerAction.icon} />
            </span>
            <span className="footer-action-label">{config.footerAction.label}</span>
          </Link>
        ) : null}
      </div>

      <div
        ref={resizerRef}
        className="sidebar-resizer"
        id="sidebar-resizer"
        title="Drag to resize sidebar (double-click to reset)"
      />
    </aside>
  );
}
