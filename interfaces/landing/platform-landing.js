/**
 * Interface: Platform Landing Page (App.Qrew.com)
 */
(() => {
  const Qrew = window.Qrew;

  const renderLandingPage = () => {
    Qrew.dom.mainContent.innerHTML = `
      <div class="landing-page">
        <!-- Sticky Header -->
        <header class="landing-navbar">
          <div class="landing-container landing-navbar-inner">
            <div class="landing-navbar-left">
              <a href="#landing" class="landing-brand">
                <div class="landing-brand-logo has-img"><img src="assets/logo.png" alt="Qrew" class="brand-logo-img"></div>
                <span class="landing-brand-title">Qrew</span>
              </a>
            </div>

            <!-- Central Platform Domain -->
            <div class="landing-domain-badge">
              <span class="landing-domain-dot"></span>
              <span>url: qrew.com</span>
            </div>

            <!-- Header Right: Quick tabs + Auth Buttons -->
            <div class="landing-navbar-right">
              <!-- Workspace Context Tabs on Main Landing Header (wireframe-only quick links) -->
              <div class="workspace-tabs" role="tablist" aria-label="Workspaces">
                <a href="#platform/overview" class="workspace-tab" role="tab" title="Platform Admin">
                  <span class="ws-tab-indicator platform"></span>
                  <span class="ws-tab-text">Platform Admin</span>
                </a>
                <a href="#tenant/overview?id=ten_sst" class="workspace-tab" role="tab" title="Tenant Admin Panel">
                  <span class="ws-tab-indicator tenant"></span>
                  <span class="ws-tab-text">Tenant</span>
                </a>
                <a href="#office/overview?tenantId=ten_sst&officeId=off_ctg_port" class="workspace-tab" role="tab" title="Office Workspace">
                  <span class="ws-tab-indicator office"></span>
                  <span class="ws-tab-text">Office</span>
                </a>
                <a href="#office-config?tenantId=ten_sst&officeId=off_ctg_port" class="workspace-tab" role="tab" title="Office Configuration Centre">
                  <span class="ws-tab-indicator config"></span>
                  <span class="ws-tab-text">Office Config</span>
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

        <!-- Hero Section -->
        <section class="landing-hero">
          <div class="landing-container">
            <h1 class="landing-hero-title">
              Hierarchical Multi-Tenant Access Control &amp; Operations Mesh
            </h1>

            <div class="landing-cta-group">
              <a href="#platform/overview" class="btn btn-primary landing-btn-lg">
                <span>Launch Demo Platform</span>
                ${QrewUI.getIcon('arrowRight')}
              </a>
              <button class="btn btn-secondary landing-btn-lg" onclick="window.showPersonasModal()">
                <span>Explore Personas</span>
              </button>
            </div>

            <!-- Quick Stats Ribbon -->
            <div class="hero-ribbon">
              <div class="hero-ribbon-item">
                <div class="hero-ribbon-val">4 Isolated Tiers</div>
                <div class="hero-ribbon-label">Platform → Tenant → Office → Dept</div>
              </div>
              <div class="hero-ribbon-item">
                <div class="hero-ribbon-val">Zero Frameworks</div>
                <div class="hero-ribbon-label">Semantic HTML5, CSS3 &amp; Vanilla JS</div>
              </div>
              <div class="hero-ribbon-item">
                <div class="hero-ribbon-val">Tamper-Evident</div>
                <div class="hero-ribbon-label">Chronological audit activity trail</div>
              </div>
              <div class="hero-ribbon-item">
                <div class="hero-ribbon-val">Contextual RBAC</div>
                <div class="hero-ribbon-label">Strict tier permission isolation</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  };

  Qrew.registerInterface({
    id: 'landing',
    landingMode: true,
    render: () => renderLandingPage()
  });
})();
