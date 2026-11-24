/**
 * Interface: Dedicated Tenant Landing Page (e.g. sst.com)
 */
(() => {
  const Qrew = window.Qrew;

  const renderTenantLandingPage = (tenantId) => {
    const tenant = QrewStore.getTenantById(tenantId) || QrewStore.getTenants()[0];
    const domain = Qrew.getTenantDomain(tenant.id);
    const offices = QrewStore.getOfficesByTenant(tenant.id);
    const members = QrewStore.getTenantMembers(tenant.id);

    Qrew.dom.mainContent.innerHTML = `
      <div class="landing-page">
        <!-- Tenant Sticky Header -->
        <header class="landing-navbar">
          <div class="landing-container landing-navbar-inner">
            <!-- Header Left: Brand + Qrew Platform Tab -->
            <div class="landing-navbar-left">
              <a href="#tenant-landing?id=${tenant.id}" class="landing-brand">
                <div class="landing-brand-logo" style="background-color:var(--panel-accent, var(--color-supporting-purple));">${tenant.name.charAt(0)}</div>
                <span class="landing-brand-title">${QrewUI.escapeHtml(tenant.name)}</span>
              </a>

              <div class="workspace-tabs landing-nav-platform" role="tablist" aria-label="Platform Switcher">
                <a href="#landing" class="workspace-tab" role="tab" title="Return to Qrew Global SaaS Landing">
                  <span class="ws-tab-indicator platform"></span>
                  <span class="ws-tab-text">Qrew Platform</span>
                </a>
              </div>
            </div>

            <!-- Central Tenant Domain -->
            <div class="landing-domain-badge">
              <span class="landing-domain-dot" style="background-color:var(--panel-accent, var(--color-supporting-purple));"></span>
              <span>url: ${domain}</span>
            </div>

            <!-- Header Right: Tenant Admin Panel + Auth Buttons -->
            <div class="landing-navbar-right">
              <div class="workspace-tabs tenant-nav-actions" role="tablist" aria-label="Tenant Navigation">
                <a href="#tenant/overview?id=${tenant.id}" class="workspace-tab" role="tab" title="Open Tenant Admin Panel">
                  <span class="ws-tab-indicator tenant"></span>
                  <span class="ws-tab-text">Tenant Admin Panel</span>
                </a>
              </div>

              <!-- Auth Buttons -->
              <div class="landing-auth-buttons">
                <!-- Theme Toggle Button (Full Circle, beside and to the left of Sign In / Sign Up) -->
                <button type="button" class="landing-theme-toggle" id="landing-theme-toggle" title="Toggle Theme (Light / Dark)" aria-label="Toggle Theme">
                  <span class="theme-toggle-icon-sun" aria-hidden="true">${QrewUI.getIcon('sun')}</span>
                  <span class="theme-toggle-icon-moon" aria-hidden="true">${QrewUI.getIcon('moon')}</span>
                </button>
                <button type="button" class="btn btn-secondary landing-auth-btn landing-signin-btn">Sign In</button>
                <button type="button" class="btn btn-primary landing-auth-btn landing-signup-btn">Sign Up</button>
              </div>
            </div>
          </div>
        </header>

        <!-- Tenant Hero Section -->
        <section class="tenant-landing-hero">
          <div class="landing-container">
            <h1 class="landing-hero-title">
              ${QrewUI.escapeHtml(tenant.name)} Operations Portal
            </h1>

            <div class="landing-cta-group">
              <a href="#tenant/overview?id=${tenant.id}" class="btn btn-primary landing-btn-lg">
                <span>Open Tenant Admin Panel</span>
                ${QrewUI.getIcon('arrowRight')}
              </a>
              <a href="#tenant/offices?id=${tenant.id}" class="btn btn-secondary landing-btn-lg">
                <span>Manage Offices Directory</span>
              </a>
              <a href="#member/overview?userId=usr_nusrat" class="btn btn-secondary landing-btn-lg">
                <span>Staff Workspace</span>
              </a>
            </div>

            <!-- Organization Metrics Ribbon -->
            <div class="hero-ribbon">
              <div class="hero-ribbon-item">
                <div class="hero-ribbon-val">${offices.length} Branches</div>
                <div class="hero-ribbon-label">Physical Office Facilities</div>
              </div>
              <div class="hero-ribbon-item">
                <div class="hero-ribbon-val">${members.length} Members</div>
                <div class="hero-ribbon-label">Verified Personnel Pool</div>
              </div>
              <div class="hero-ribbon-item">
                <div class="hero-ribbon-val">${tenant.status}</div>
                <div class="hero-ribbon-label">Organization Lifecycle</div>
              </div>
              <div class="hero-ribbon-item">
                <div class="hero-ribbon-val">Tier-3 Scoping</div>
                <div class="hero-ribbon-label">Strict Multi-Tenant Isolation</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  };

  Qrew.registerInterface({
    id: 'tenant-landing',
    landingMode: true,
    render: (_view, ctx) => renderTenantLandingPage(ctx.state.currentTenantId)
  });
})();
