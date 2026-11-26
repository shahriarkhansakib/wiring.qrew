"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { QrewIcon } from "@/components/ui/Icons";
import { DEFAULT_CONTEXT_IDS, routes } from "@/lib/routes";
import { getTenantDomain } from "@/lib/workspace-config";

export function TenantLandingView({ tenantId }: { tenantId: string }) {
  const { store } = useQrewStore();
  const { setShellFlags, toggleTheme, resolvedDark } = useTheme();

  useEffect(() => {
    setShellFlags({ workspace: "tenant-landing", isLandingMode: true, isProfileMode: false });
  }, [setShellFlags]);

  const tenant = store.getTenantById(tenantId) || store.getTenants()[0];
  const resolvedTenantId = tenant ? tenant.id : tenantId;
  const domain = getTenantDomain(store, resolvedTenantId);
  const offices = store.getOfficesByTenant(resolvedTenantId);
  const members = store.getTenantMembers(resolvedTenantId);
  const themeLabel = resolvedDark ? "Switch to Light Mode" : "Switch to Dark Mode";

  return (
    <div className="landing-page">
      <header className="landing-navbar">
        <div className="landing-container landing-navbar-inner">
          <div className="landing-navbar-left">
            <Link href={routes.tenantLanding(resolvedTenantId)} className="landing-brand">
              <div
                className="landing-brand-logo"
                style={{ backgroundColor: "var(--panel-accent, var(--color-supporting-purple))" }}
              >
                {tenant ? tenant.name.charAt(0) : "T"}
              </div>
              <span className="landing-brand-title">{tenant ? tenant.name : "Tenant"}</span>
            </Link>

            <div
              className="workspace-tabs landing-nav-platform"
              role="tablist"
              aria-label="Platform Switcher"
            >
              <Link
                href={routes.landing()}
                className="workspace-tab"
                role="tab"
                title="Return to Qrew Global SaaS Landing"
              >
                <span className="ws-tab-indicator platform" />
                <span className="ws-tab-text">Qrew Platform</span>
              </Link>
            </div>
          </div>

          <div className="landing-domain-badge">
            <span
              className="landing-domain-dot"
              style={{ backgroundColor: "var(--panel-accent, var(--color-supporting-purple))" }}
            />
            <span>url: {domain}</span>
          </div>

          <div className="landing-navbar-right">
            <div
              className="workspace-tabs tenant-nav-actions"
              role="tablist"
              aria-label="Tenant Navigation"
            >
              <Link
                href={routes.tenant(resolvedTenantId, "overview")}
                className="workspace-tab"
                role="tab"
                title="Open Tenant Admin Panel"
              >
                <span className="ws-tab-indicator tenant" />
                <span className="ws-tab-text">Tenant Admin Panel</span>
              </Link>
            </div>

            <div className="landing-auth-buttons">
              <button
                type="button"
                className="landing-theme-toggle"
                id="landing-theme-toggle"
                title={themeLabel}
                aria-label={themeLabel}
                onClick={toggleTheme}
              >
                <span className="theme-toggle-icon-sun" aria-hidden="true">
                  <QrewIcon name="sun" />
                </span>
                <span className="theme-toggle-icon-moon" aria-hidden="true">
                  <QrewIcon name="moon" />
                </span>
              </button>
              <button type="button" className="btn btn-secondary landing-auth-btn landing-signin-btn">
                Sign In
              </button>
              <button type="button" className="btn btn-primary landing-auth-btn landing-signup-btn">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="tenant-landing-hero">
        <div className="landing-container">
          <h1 className="landing-hero-title">
            {tenant ? tenant.name : "Tenant"} Operations Portal
          </h1>

          <div className="landing-cta-group">
            <Link
              href={routes.tenant(resolvedTenantId, "overview")}
              className="btn btn-primary landing-btn-lg"
            >
              <span>Open Tenant Admin Panel</span>
              <QrewIcon name="arrowRight" />
            </Link>
            <Link
              href={routes.tenant(resolvedTenantId, "offices")}
              className="btn btn-secondary landing-btn-lg"
            >
              <span>Manage Offices Directory</span>
            </Link>
            <Link
              href={routes.member(DEFAULT_CONTEXT_IDS.memberId, "overview")}
              className="btn btn-secondary landing-btn-lg"
            >
              <span>Staff Workspace</span>
            </Link>
          </div>

          <div className="hero-ribbon">
            <div className="hero-ribbon-item">
              <div className="hero-ribbon-val">{offices.length} Branches</div>
              <div className="hero-ribbon-label">Physical Office Facilities</div>
            </div>
            <div className="hero-ribbon-item">
              <div className="hero-ribbon-val">{members.length} Members</div>
              <div className="hero-ribbon-label">Verified Personnel Pool</div>
            </div>
            <div className="hero-ribbon-item">
              <div className="hero-ribbon-val">{tenant ? tenant.status : "Active"}</div>
              <div className="hero-ribbon-label">Organization Lifecycle</div>
            </div>
            <div className="hero-ribbon-item">
              <div className="hero-ribbon-val">Tier-3 Scoping</div>
              <div className="hero-ribbon-label">Strict Multi-Tenant Isolation</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
