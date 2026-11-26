"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";
import { HashRedirectShim } from "@/components/shell/HashRedirectShim";
import { DEMO_PERSONAS_ENABLED, useOpenPersonaModal } from "@/components/shell/PersonaModal";
import { QrewIcon } from "@/components/ui/Icons";
import { DEFAULT_CONTEXT_IDS, routes } from "@/lib/routes";

export function PlatformLandingView() {
  const { setShellFlags, toggleTheme, resolvedDark } = useTheme();
  const openPersonaModal = useOpenPersonaModal();

  useEffect(() => {
    setShellFlags({ workspace: "landing", isLandingMode: true, isProfileMode: false });
  }, [setShellFlags]);

  const themeLabel = resolvedDark ? "Switch to Light Mode" : "Switch to Dark Mode";

  return (
    <>
      <HashRedirectShim />
      <div className="landing-page">
        <header className="landing-navbar">
          <div className="landing-container landing-navbar-inner">
            <div className="landing-navbar-left">
              <Link href={routes.landing()} className="landing-brand">
                <div className="landing-brand-logo has-img">
                  <Image
                    src="/assets/logo.png"
                    alt="Qrew"
                    width={32}
                    height={32}
                    className="brand-logo-img"
                    priority
                  />
                </div>
                <span className="landing-brand-title">Qrew</span>
              </Link>
            </div>

            <div className="landing-domain-badge">
              <span className="landing-domain-dot" />
              <span>url: qrew.com</span>
            </div>

            <div className="landing-navbar-right">
              <div className="workspace-tabs" role="tablist" aria-label="Workspaces">
                <Link
                  href={routes.platform("overview")}
                  className="workspace-tab"
                  role="tab"
                  title="Platform Admin"
                >
                  <span className="ws-tab-indicator platform" />
                  <span className="ws-tab-text">Platform Admin</span>
                </Link>
                <Link
                  href={routes.tenant(DEFAULT_CONTEXT_IDS.tenantId, "overview")}
                  className="workspace-tab"
                  role="tab"
                  title="Tenant Admin Panel"
                >
                  <span className="ws-tab-indicator tenant" />
                  <span className="ws-tab-text">Tenant</span>
                </Link>
                <Link
                  href={routes.office(
                    DEFAULT_CONTEXT_IDS.tenantId,
                    DEFAULT_CONTEXT_IDS.officeId,
                    "overview"
                  )}
                  className="workspace-tab"
                  role="tab"
                  title="Office Workspace"
                >
                  <span className="ws-tab-indicator office" />
                  <span className="ws-tab-text">Office</span>
                </Link>
                <Link
                  href={routes.officeConfig(
                    DEFAULT_CONTEXT_IDS.tenantId,
                    DEFAULT_CONTEXT_IDS.officeId,
                    "overview"
                  )}
                  className="workspace-tab"
                  role="tab"
                  title="Office Configuration Centre"
                >
                  <span className="ws-tab-indicator config" />
                  <span className="ws-tab-text">Office Config</span>
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

        <section className="landing-hero">
          <div className="landing-container">
            <h1 className="landing-hero-title">
              Hierarchical Multi-Tenant Access Control &amp; Operations Mesh
            </h1>

            <div className="landing-cta-group">
              <Link href={routes.platform("overview")} className="btn btn-primary landing-btn-lg">
                <span>Launch Demo Platform</span>
                <QrewIcon name="arrowRight" />
              </Link>
              {DEMO_PERSONAS_ENABLED ? (
                <button
                  type="button"
                  className="btn btn-secondary landing-btn-lg"
                  onClick={openPersonaModal}
                >
                  <span>Explore Personas</span>
                </button>
              ) : null}
            </div>

            <div className="hero-ribbon">
              <div className="hero-ribbon-item">
                <div className="hero-ribbon-val">4 Isolated Tiers</div>
                <div className="hero-ribbon-label">Platform → Tenant → Office → Dept</div>
              </div>
              <div className="hero-ribbon-item">
                <div className="hero-ribbon-val">Next.js App Router</div>
                <div className="hero-ribbon-label">TypeScript &amp; Modular Workspaces</div>
              </div>
              <div className="hero-ribbon-item">
                <div className="hero-ribbon-val">Tamper-Evident</div>
                <div className="hero-ribbon-label">Chronological audit activity trail</div>
              </div>
              <div className="hero-ribbon-item">
                <div className="hero-ribbon-val">Contextual RBAC</div>
                <div className="hero-ribbon-label">Strict tier permission isolation</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
