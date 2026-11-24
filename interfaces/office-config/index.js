/**
 * Interface: Office Configuration Centre (App.Qrew.com/office config)
 */
(() => {
  const Qrew = window.Qrew;

  Qrew.registerInterface({
    id: 'office-config',
    brandHome: 'platform',

    getDomainBadge: ({ view }) => {
      const subPath = view ? `/${view}` : '';
      return {
        text: `app.qrew.com/office-config${subPath}`,
        dotColor: 'var(--panel-accent)'
      };
    },

    getSidebarConfig: ({ state, view, tenant, office }) => {
      const tenantId = tenant ? tenant.id : state.currentTenantId;
      const officeId = office ? office.id : state.currentOfficeId;
      const allOffices = [];
      QrewStore.getTenants().forEach(t => {
        QrewStore.getOfficesByTenant(t.id).forEach(o => {
          allOffices.push({ ...o, tenantName: t.name });
        });
      });

      return {
        logoText: '⚙',
        logoBg: 'var(--panel-accent, var(--color-accent))',
        brandName: office ? office.name : 'Office Config',
        brandBadge: 'Configuration Centre',
        brandTitle: 'Go to Platform Landing Page (qrew.com)',
        picker: {
          label: '',
          optionsHtml: allOffices.map(o => `
            <option value="${o.id}" ${office && o.id === office.id ? 'selected' : ''}>${QrewUI.escapeHtml(o.name)}</option>
          `).join(''),
          onChange: (e) => {
            Qrew.state.currentOfficeId = e.target.value;
            const targetOffice = QrewStore.getOfficeById(Qrew.state.currentOfficeId);
            if (targetOffice) Qrew.state.currentTenantId = targetOffice.tenantId;
            Qrew.navigateTo(`#office-config?tenantId=${Qrew.state.currentTenantId}&officeId=${Qrew.state.currentOfficeId}`);
          }
        },
        navHtml: `
          <div class="nav-section">
            <a class="nav-item ${view === 'overview' ? 'active' : ''}" href="#office-config/overview?tenantId=${tenantId}&officeId=${officeId}">
              <span class="nav-icon">${QrewUI.getIcon('overview')}</span>
              <span class="nav-label">Overview</span>
            </a>

            <div class="nav-divider"></div>

            <a class="nav-item ${view === 'invoice-templates' ? 'active' : ''}" href="#office-config/invoice-templates?tenantId=${tenantId}&officeId=${officeId}">
              <span class="nav-icon">${QrewUI.getIcon('invoice')}</span>
              <span class="nav-label">Invoice Templates</span>
            </a>
            <a class="nav-item ${view === 'roles-permissions' || view === 'roles' ? 'active' : ''}" href="#office-config/roles-permissions?tenantId=${tenantId}&officeId=${officeId}">
              <span class="nav-icon">${QrewUI.getIcon('shield')}</span>
              <span class="nav-label">Roles and Permissions</span>
            </a>

            <div class="nav-divider"></div>

            <a class="nav-item ${view === 'customize-fields' ? 'active' : ''}" href="#office-config/customize-fields?tenantId=${tenantId}&officeId=${officeId}">
              <span class="nav-icon">${QrewUI.getIcon('settings')}</span>
              <span class="nav-label">Customize fields</span>
            </a>
            <a class="nav-item ${view === 'plans-entitlements' || view === 'plans' ? 'active' : ''}" href="#office-config/plans-entitlements?tenantId=${tenantId}&officeId=${officeId}">
              <span class="nav-icon">${QrewUI.getIcon('layers')}</span>
              <span class="nav-label">Plans and Entitlement</span>
            </a>
          </div>
        `,
        footerHtml: `
          <a class="footer-action-link" href="#platform/overview" title="Back to Platform Admin" data-tooltip="Platform Admin">
            <span class="footer-action-icon">${QrewUI.getIcon('chevronLeft')}</span>
            <span class="footer-action-label">&larr; Platform Admin</span>
          </a>
        `
      };
    },

    render: (view, ctx) => {
      const officeId = (ctx && ctx.params && ctx.params.officeId) || (ctx && ctx.office && ctx.office.id) || Qrew.state.currentOfficeId;
      const tenantId = (ctx && ctx.params && ctx.params.tenantId) || (ctx && ctx.tenant && ctx.tenant.id) || Qrew.state.currentTenantId;

      if (view !== 'invoice-templates') {
        if (Qrew.dom && Qrew.dom.mainContent) {
          Qrew.dom.mainContent.classList.remove('studio-mode');
        }
      }

      switch (view) {
        case 'overview':
          return Qrew.renderBlankTitledPage('Overview');
        case 'invoice-templates':
          if (Qrew.views['office-config'] && Qrew.views['office-config'].renderInvoiceTemplates) {
            return Qrew.views['office-config'].renderInvoiceTemplates(officeId, tenantId, ctx);
          }
          return Qrew.renderBlankTitledPage('Invoice Templates');
        case 'roles-permissions':
        case 'roles':
          return Qrew.renderBlankTitledPage('Roles and Permissions');
        case 'customize-fields':
          return Qrew.renderBlankTitledPage('Customize fields');
        case 'plans-entitlements':
        case 'plans':
          return Qrew.renderBlankTitledPage('Plans and Entitlement');
        default:
          return Qrew.renderBlankTitledPage('Overview');
      }
    }
  });
})();
