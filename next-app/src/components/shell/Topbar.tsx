"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { QrewIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/routes";
import {
  getDomainBadge,
  getPanelUserInfo,
  isTenantContextWorkspace,
  type SidebarConfig,
  type WorkspaceRuntimeContext,
} from "@/lib/workspace-config";

export function Topbar({
  sidebarConfig,
  ctx,
  isProfile,
  profileTab,
  onOpenMobileMenu,
}: {
  sidebarConfig: SidebarConfig;
  ctx: WorkspaceRuntimeContext;
  isProfile: boolean;
  profileTab?: string;
  onOpenMobileMenu: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { store, panelOverrides } = useQrewStore();
  const { resolvedDark, toggleTheme } = useTheme();
  const { confirmDialog, showToast } = useUiFeedback();

  const [openMenu, setOpenMenu] = useState<{
    kind: "notifications" | "profile";
    path: string;
  } | null>(null);
  const notificationsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const notificationsPopoverRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const notificationsOpen = openMenu?.kind === "notifications" && openMenu.path === pathname;
  const profileMenuOpen = openMenu?.kind === "profile" && openMenu.path === pathname;

  useEffect(() => {
    const closeMenus = () => setOpenMenu(null);
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) {
        closeMenus();
        return;
      }
      const insideNotifications =
        Boolean(notificationsTriggerRef.current?.contains(target)) ||
        Boolean(notificationsPopoverRef.current?.contains(target));
      const insideProfile = Boolean(profileMenuRef.current?.contains(target));
      if (!insideNotifications && !insideProfile) {
        closeMenus();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenus();
    };
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const user = getPanelUserInfo(ctx.workspace, ctx, panelOverrides);
  const domainBadge = getDomainBadge(ctx, { isProfile, profileTab });
  const recentLogs = notificationsOpen ? store.getAuditLogs().slice(0, 5) : [];
  const themeToggleLabel = resolvedDark ? "Switch to Light Mode" : "Switch to Dark Mode";

  const handleLogout = () => {
    setOpenMenu(null);
    confirmDialog({
      title: "Log Out",
      message: "Are you sure you want to log out of your session?",
      confirmText: "Log Out",
      confirmClass: "btn-danger",
      onConfirm: () => {
        showToast("You have been logged out successfully.", "info");
        if (isTenantContextWorkspace(ctx.workspace)) {
          router.push(routes.tenantLanding(ctx.tenantId));
        } else {
          router.push(routes.landing());
        }
      },
    });
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          id="mobile-menu-btn"
          aria-label="Open sidebar menu"
          onClick={(e) => {
            e.stopPropagation();
            onOpenMobileMenu();
          }}
        >
          <QrewIcon name="menu" />
        </button>

        <div className="topbar-profile-brand" id="topbar-profile-brand">
          <Link
            href={sidebarConfig.backHref}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "inherit",
            }}
            title={`Return to ${sidebarConfig.brandName}`}
          >
            {sidebarConfig.logoImg ? (
              <div
                className="brand-logo has-img"
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "transparent",
                }}
              >
                <Image
                  src={sidebarConfig.logoImg}
                  alt={sidebarConfig.brandName}
                  width={28}
                  height={28}
                  className="brand-logo-img"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
            ) : (
              <div
                className="brand-logo"
                style={{
                  width: "28px",
                  height: "28px",
                  fontSize: "13px",
                  borderRadius: "6px",
                  background: sidebarConfig.logoBg || "var(--panel-accent, var(--color-accent))",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {sidebarConfig.logoText || "Q"}
              </div>
            )}
            <div
              className="brand-info"
              style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}
            >
              <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary)" }}>
                {sidebarConfig.brandName}
              </span>
              {sidebarConfig.brandBadge ? (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {sidebarConfig.brandBadge}
                </span>
              ) : null}
            </div>
          </Link>
        </div>

        <Link
          href={routes.landing()}
          className="topbar-platform-btn topbar-landing-btn"
          id="topbar-landing-btn"
          title="Go to Qrew Landing Page"
          style={{ display: isProfile ? "none" : "inline-flex" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Qrew Landing</span>
        </Link>
      </div>

      <div className="topbar-center" id="topbar-center">
        <div className="topbar-domain-badge">
          <span
            className="topbar-domain-dot"
            style={{ backgroundColor: domainBadge.dotColor }}
          />
          <span id="topbar-domain-text">{domainBadge.text}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-actions">
          <button
            type="button"
            className="topbar-theme-toggle"
            id="topbar-theme-toggle"
            title={themeToggleLabel}
            aria-label={themeToggleLabel}
            onClick={(e) => {
              e.stopPropagation();
              toggleTheme();
            }}
          >
            <span className="theme-toggle-icon-sun" aria-hidden="true">
              <QrewIcon name="sun" />
            </span>
            <span className="theme-toggle-icon-moon" aria-hidden="true">
              <QrewIcon name="moon" />
            </span>
          </button>

          <button
            ref={notificationsTriggerRef}
            type="button"
            className="icon-btn"
            id="notifications-trigger"
            title="Recent Activity Notifications"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setOpenMenu((prev) =>
                prev?.kind === "notifications" && prev.path === pathname
                  ? null
                  : { kind: "notifications", path: pathname }
              );
            }}
          >
            <QrewIcon name="bell" />
            <span className="notification-badge" />
          </button>

          <div
            ref={notificationsPopoverRef}
            className={`notifications-popover${notificationsOpen ? " show" : ""}`}
            id="notifications-popover"
          >
            <div className="notifications-header">
              <span className="notifications-title">System Activities</span>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Recent Events</span>
            </div>
            <div className="notifications-list" id="notifications-list">
              {recentLogs.map((l) => (
                <div className="notification-item" key={l.id}>
                  <div className="notification-desc">
                    <strong>{l.actor}</strong>: {l.description}
                  </div>
                  <div className="notification-time">{l.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="user-profile-menu" ref={profileMenuRef}>
          <button
            type="button"
            className={`user-profile-trigger${profileMenuOpen ? " active" : ""}`}
            id="user-profile-trigger"
            aria-haspopup="true"
            aria-expanded={profileMenuOpen}
            onClick={() => {
              setOpenMenu((prev) =>
                prev?.kind === "profile" && prev.path === pathname
                  ? null
                  : { kind: "profile", path: pathname }
              );
            }}
          >
            <div
              className="user-avatar"
              id="topbar-user-avatar"
              style={{
                backgroundColor: user.photo ? "transparent" : user.avatarBg || "var(--color-dark)",
              }}
            >
              {user.photo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={user.photo}
                  alt={user.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "inherit",
                    display: "block",
                  }}
                />
              ) : (
                user.avatar || user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="user-meta">
              <span className="user-name" id="topbar-user-name">
                {user.name}
              </span>
              <span className="user-role-tag" id="topbar-user-role">
                {user.role}
              </span>
            </div>
            <QrewIcon name="chevronDown" />
          </button>

          <div
            className={`dropdown-menu${profileMenuOpen ? " show" : ""}`}
            id="user-dropdown-menu"
          >
            <div
              className="dropdown-header"
              id="dropdown-header-btn"
              style={{ cursor: "pointer" }}
              title="Click to edit profile"
              onClick={() => {
                setOpenMenu(null);
                router.push(
                  routes.profile(undefined, ctx.workspace, {
                    tenantId: ctx.tenantId,
                    officeId: ctx.officeId,
                    deptId: ctx.deptId,
                    userId: ctx.userId,
                  })
                );
              }}
            >
              <div className="dropdown-user-title" id="dropdown-user-title">
                {user.name}
              </div>
              <div className="dropdown-user-email" id="dropdown-user-email">
                {user.email}
              </div>
              <div
                className="dropdown-user-role"
                id="dropdown-user-role"
                style={{
                  fontSize: "11px",
                  color: "var(--panel-accent, var(--color-accent))",
                  fontWeight: 600,
                  marginTop: "2px",
                }}
              >
                {user.role}
              </div>
            </div>

            <button
              type="button"
              className="dropdown-item"
              id="action-my-profile"
              style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
              onClick={() => {
                setOpenMenu(null);
                router.push(
                  routes.profile(undefined, ctx.workspace, {
                    tenantId: ctx.tenantId,
                    officeId: ctx.officeId,
                    deptId: ctx.deptId,
                    userId: ctx.userId,
                  })
                );
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              My Profile
            </button>

            <button
              type="button"
              className="dropdown-item danger"
              id="action-logout"
              style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
              onClick={handleLogout}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
