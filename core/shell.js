/**
 * Qrew Core — Application Shell (Sidebar, Topbar, User Profile, Global Events, Boot)
 */
(() => {
  const Qrew = window.Qrew;

  Qrew.shell.renderSidebar = () => {
    const DOM = Qrew.dom;
    const ctx = Qrew.buildContext();
    const iface = Qrew.interfaces[Qrew.state.activeWorkspace] || Qrew.interfaces.platform;
    if (!iface || !iface.getSidebarConfig) return;

    const cfg = iface.getSidebarConfig(ctx);
    const brandWrapperEl = document.getElementById('brand-wrapper');

    if (DOM.sidebarBrandLogo) {
      const logoImg = cfg.logoImg || (iface.id === 'platform' || iface.id === 'super-admin' ? 'assets/logo.png' : null);
      if (logoImg) {
        DOM.sidebarBrandLogo.classList.add('has-img');
        DOM.sidebarBrandLogo.innerHTML = `<img src="${logoImg}" alt="${QrewUI.escapeHtml(cfg.brandName || 'Qrew')}" class="brand-logo-img">`;
        DOM.sidebarBrandLogo.style.backgroundColor = 'transparent';
      } else {
        DOM.sidebarBrandLogo.classList.remove('has-img');
        DOM.sidebarBrandLogo.textContent = cfg.logoText || 'Q';
        DOM.sidebarBrandLogo.style.backgroundColor = cfg.logoBg || 'var(--panel-accent, var(--color-accent))';
      }
    }
    if (DOM.sidebarBrandName) DOM.sidebarBrandName.textContent = cfg.brandName || 'Qrew';
    if (DOM.sidebarBrandBadge) DOM.sidebarBrandBadge.textContent = cfg.brandBadge || '';
    if (brandWrapperEl && cfg.brandTitle) brandWrapperEl.title = cfg.brandTitle;

    if (Qrew.shell.updateTopbarProfileBrand) {
      Qrew.shell.updateTopbarProfileBrand();
    }

    if (DOM.sidebarContextPicker) {
      if (cfg.picker) {
        DOM.sidebarContextPicker.style.display = 'flex';
        if (DOM.sidebarContextLabel) {
          if (cfg.picker.label) {
            DOM.sidebarContextLabel.textContent = cfg.picker.label;
            DOM.sidebarContextLabel.style.display = 'block';
          } else {
            DOM.sidebarContextLabel.textContent = '';
            DOM.sidebarContextLabel.style.display = 'none';
          }
        }
        if (DOM.sidebarContextSelect) {
          DOM.sidebarContextSelect.innerHTML = cfg.picker.optionsHtml || '';
          DOM.sidebarContextSelect.onchange = cfg.picker.onChange || null;
        }
      } else {
        DOM.sidebarContextPicker.style.display = 'none';
        if (DOM.sidebarContextSelect) DOM.sidebarContextSelect.onchange = null;
      }
    }

    if (DOM.sidebarNav) {
      DOM.sidebarNav.innerHTML = cfg.navHtml || '';
      // Equip every navigation item with tooltips & accessibility labels (used by collapsed sidebar)
      DOM.sidebarNav.querySelectorAll('.nav-item').forEach(item => {
        const labelEl = item.querySelector('.nav-label');
        if (labelEl) {
          const text = labelEl.textContent.trim().replace(/^[←→\s]+|[←→\s]+$/g, '');
          item.setAttribute('title', text);
          item.setAttribute('data-tooltip', text);
          item.setAttribute('aria-label', text);
        }
      });
    }

    const footerEl = DOM.sidebarFooter || document.getElementById('sidebar-footer');
    if (footerEl) {
      if (cfg.footerHtml) {
        footerEl.innerHTML = cfg.footerHtml;
        footerEl.style.display = 'flex';
      } else {
        footerEl.innerHTML = '';
        footerEl.style.display = 'none';
      }
      footerEl.querySelectorAll('.footer-action-link').forEach(link => {
        const text = link.getAttribute('data-tooltip') || link.getAttribute('title') || 'Super Admin';
        link.setAttribute('data-tooltip', text);
        link.setAttribute('title', text);

        const href = link.getAttribute('href') || '';
        if (href.includes('#super-admin')) {
          link.onclick = (e) => Qrew.actions.confirmSwitchToSuperAdmin(e);
        } else if (href.includes('#tenant-super-admin')) {
          link.onclick = (e) => Qrew.actions.confirmSwitchToTenantSuperAdmin(e, Qrew.state.currentTenantId);
        } else if (href.includes('#office-admin')) {
          link.onclick = (e) => Qrew.actions.confirmSwitchToOfficeAdmin(e, Qrew.state.currentTenantId, Qrew.state.currentOfficeId);
        }
      });
    }
  };

  Qrew.shell.updateTopbarProfileBrand = () => {
    const profileBrandEl = document.getElementById('topbar-profile-brand');
    if (!profileBrandEl) return;

    const ctx = Qrew.buildContext();
    const ws = Qrew.state.activeWorkspace || 'platform';
    const iface = Qrew.interfaces[ws] || Qrew.interfaces.platform;
    const cfg = (iface && iface.getSidebarConfig) ? iface.getSidebarConfig(ctx) : null;

    if (!cfg) return;

    const logoImg = cfg.logoImg || (ws === 'platform' || ws === 'super-admin' ? 'assets/logo.png' : null);

    let logoHtml = '';
    if (logoImg) {
      logoHtml = `<div class="brand-logo has-img" style="width:28px;height:28px;border-radius:6px;overflow:hidden;flex-shrink:0;background:transparent;">
        <img src="${logoImg}" alt="${QrewUI.escapeHtml(cfg.brandName || 'Qrew')}" class="brand-logo-img" style="width:100%;height:100%;object-fit:contain;">
      </div>`;
    } else {
      const logoBg = cfg.logoBg || 'var(--panel-accent, var(--color-accent))';
      const logoText = cfg.logoText || 'Q';
      logoHtml = `<div class="brand-logo" style="width:28px;height:28px;font-size:13px;border-radius:6px;background:${logoBg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">
        ${QrewUI.escapeHtml(logoText)}
      </div>`;
    }

    const brandName = cfg.brandName || 'Qrew';
    const brandBadge = cfg.brandBadge
      ? `<span style="font-size:10px;font-weight:600;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.5px;">${QrewUI.escapeHtml(cfg.brandBadge)}</span>`
      : '';

    let backHref = '#platform/overview';
    if (ws === 'super-admin') backHref = '#super-admin/overview';
    else if (ws === 'tenant') backHref = `#tenant/overview?id=${Qrew.state.currentTenantId || 'ten_sst'}`;
    else if (ws === 'office') backHref = `#office/dashboard?tenantId=${Qrew.state.currentTenantId || 'ten_sst'}&officeId=${Qrew.state.currentOfficeId || 'off_ctg_port'}`;
    else if (ws === 'office-admin') backHref = `#office-admin/overview?tenantId=${Qrew.state.currentTenantId || 'ten_sst'}&officeId=${Qrew.state.currentOfficeId || 'off_ctg_port'}`;
    else if (ws === 'office-config') backHref = '#office-config';
    else if (ws === 'department') backHref = `#department/overview?deptId=${Qrew.state.currentDeptId || 'dept_customs'}`;
    else if (ws === 'member') backHref = `#member/overview?userId=${Qrew.state.currentMemberId || 'usr_nusrat'}`;

    profileBrandEl.innerHTML = `
      <a href="${backHref}" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;" title="Return to ${QrewUI.escapeHtml(brandName)}">
        ${logoHtml}
        <div class="brand-info" style="display:flex;flex-direction:column;line-height:1.2;">
          <span style="font-weight:700;font-size:14px;color:var(--color-text-primary);">${QrewUI.escapeHtml(brandName)}</span>
          ${brandBadge}
        </div>
      </a>
    `;
  };

  Qrew.shell.updateTopbarDomainBadge = () => {
    const domainTextEl = document.getElementById('topbar-domain-text');
    const domainDotEl = document.querySelector('.topbar-domain-dot');
    if (!domainTextEl) return;

    if (Qrew.shell.updateTopbarProfileBrand) {
      Qrew.shell.updateTopbarProfileBrand();
    }

    // Update Topbar Landing Page Button
    const landingBtn = document.getElementById('topbar-landing-btn');
    if (landingBtn) {
      const isProfile = Qrew.state.currentView === 'profile';
      const ws = Qrew.state.activeWorkspace;
      const showLandingBtn = !isProfile && ws !== 'landing' && ws !== 'tenant-landing';
      landingBtn.style.display = showLandingBtn ? 'inline-flex' : 'none';
    }

    if (Qrew.state.currentView === 'profile') {
      const ws = Qrew.state.activeWorkspace || 'platform';
      const activeTab = (Qrew.state.routeParams && Qrew.state.routeParams.tab)
        ? Qrew.state.routeParams.tab
        : (new URLSearchParams(window.location.hash.split('?')[1] || '').get('tab') || 'profile');

      const ctx = Qrew.buildContext();
      let domainText = `app.qrew.com/admin/setting/${activeTab}`;

      if (ws === 'super-admin') {
        domainText = `app.qrew.com/super-admin/setting/${activeTab}`;
      } else if (ws === 'tenant') {
        const tenantName = (ctx.tenant && ctx.tenant.name) ? ctx.tenant.name.toLowerCase() : 'sst';
        domainText = `app.${tenantName}.com/tenants/setting/${activeTab}`;
      } else if (ws === 'office') {
        const officeDomain = Qrew.getOfficeDomain ? Qrew.getOfficeDomain(ctx.office) : 'sst.ctg.com';
        domainText = `${officeDomain}/office/setting/${activeTab}`;
      } else if (ws === 'office-admin') {
        const officeDomain = Qrew.getOfficeDomain ? Qrew.getOfficeDomain(ctx.office) : 'sst.ctg.com';
        domainText = `${officeDomain}/office-admin/setting/${activeTab}`;
      } else if (ws === 'office-config') {
        domainText = `app.qrew.com/office-config/setting/${activeTab}`;
      } else if (ws === 'department') {
        const officeDomain = Qrew.getOfficeDomain ? Qrew.getOfficeDomain(ctx.office) : 'sst.ctg.com';
        domainText = `${officeDomain}/department/setting/${activeTab}`;
      } else if (ws === 'member') {
        const officeDomain = Qrew.getOfficeDomain ? Qrew.getOfficeDomain(ctx.office) : 'sst.ctg.com';
        domainText = `${officeDomain}/member/setting/${activeTab}`;
      }

      const cleanProfileUrl = domainText.replace(/^url:\s*/i, '');
      domainTextEl.textContent = `url: ${cleanProfileUrl}`;
      if (domainDotEl) domainDotEl.style.backgroundColor = 'var(--panel-accent, #0D9488)';
      return;
    }

    const ctx = Qrew.buildContext();
    const iface = Qrew.interfaces[Qrew.state.activeWorkspace] || Qrew.interfaces.platform;
    const badge = (iface && iface.getDomainBadge)
      ? iface.getDomainBadge(ctx)
      : { text: 'app.qrew.com/admin', dotColor: 'var(--panel-accent)' };

    const cleanBadgeText = (badge.text || '').replace(/^url:\s*/i, '');
    domainTextEl.textContent = `url: ${cleanBadgeText}`;
    if (domainDotEl) domainDotEl.style.backgroundColor = badge.dotColor || 'var(--panel-accent)';
  };

  Qrew.shell.applyAppearanceSettings = () => {
    const urlTheme = new URLSearchParams(window.location.search).get('theme');
    const theme = urlTheme || localStorage.getItem('qrew_ui_theme') || 'system';
    const density = localStorage.getItem('qrew_ui_density') || 'comfortable';

    // 1. Theme
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.backgroundColor = '#0B1220';
      document.documentElement.style.colorScheme = 'dark';
    } else if (theme === 'light') {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.style.backgroundColor = '#F8FAFC';
      document.documentElement.style.colorScheme = 'light';
    } else {
      const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.backgroundColor = '#0B1220';
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.style.backgroundColor = '#F8FAFC';
        document.documentElement.style.colorScheme = 'light';
      }
    }

    // 2. Secondary Color & Workspace Theme
    if (Qrew.applyPanelTheme && Qrew.state.activeWorkspace) {
      Qrew.applyPanelTheme(Qrew.state.activeWorkspace);
    } else {
      const secondary = localStorage.getItem('qrew_ui_secondary') || localStorage.getItem('qrew_ui_accent');
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (secondary && secondary !== 'default') {
        const hoverColor = Qrew.getAccentHover ? Qrew.getAccentHover(secondary, isDark) : secondary;
        document.documentElement.style.setProperty('--color-secondary', secondary);
        document.documentElement.style.setProperty('--panel-accent', secondary);
        document.documentElement.style.setProperty('--color-accent', secondary);
        document.documentElement.style.setProperty('--color-accent-hover', hoverColor);
      } else {
        document.documentElement.style.removeProperty('--color-secondary');
        document.documentElement.style.removeProperty('--color-accent');
        document.documentElement.style.removeProperty('--color-accent-hover');
      }
    }

    // 3. Density
    if (density === 'compact') {
      if (document.body) document.body.classList.add('density-compact');
    } else {
      if (document.body) document.body.classList.remove('density-compact');
    }

    // 4. Update Theme Toggle Tooltips & Accessibility
    const isDarkNow = document.documentElement.getAttribute('data-theme') === 'dark';
    const toggleLabel = isDarkNow ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    document.querySelectorAll('#topbar-theme-toggle, #landing-theme-toggle, .topbar-theme-toggle, .landing-theme-toggle').forEach(el => {
      el.setAttribute('title', toggleLabel);
      el.setAttribute('aria-label', toggleLabel);
    });
  };

  Qrew.shell.toggleTheme = () => {
    const currentStored = localStorage.getItem('qrew_ui_theme');
    let isDark = false;
    if (currentStored === 'dark') {
      isDark = true;
    } else if (currentStored === 'light') {
      isDark = false;
    } else {
      isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    const nextTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('qrew_ui_theme', nextTheme);
    Qrew.shell.applyAppearanceSettings();
    const radio = document.querySelector(`input[name="theme-choice"][value="${nextTheme}"]`);
    if (radio) radio.checked = true;
    window.dispatchEvent(new Event('storage'));
  };

  Qrew.shell.getPanelUserInfo = () => {
    const ws = Qrew.state.activeWorkspace;
    const tenant = (typeof QrewStore !== 'undefined' && QrewStore.getTenantById)
      ? (QrewStore.getTenantById(Qrew.state.currentTenantId) || QrewStore.getTenants()[0])
      : null;

    let overrides = {};
    try {
      overrides = JSON.parse(localStorage.getItem('qrew_panel_user_overrides') || '{}');
    } catch (e) { }

    let defaultInfo;
    if (ws === 'platform') {
      defaultInfo = {
        name: 'Sakib',
        role: 'Platform Admin',
        email: 'sakib@qrew.io',
        address: 'Gulshan-2, Dhaka',
        avatar: 'S',
        avatarBg: 'var(--panel-accent)'
      };
    } else if (ws === 'super-admin') {
      defaultInfo = {
        name: 'Sakib',
        role: 'Super Admin',
        email: 'sakib@qrew.io',
        address: 'Gulshan-2, Dhaka',
        avatar: 'S',
        avatarBg: 'var(--panel-accent)'
      };
    } else if (ws === 'tenant') {
      const ownerName = (tenant && tenant.ownerName) ? tenant.ownerName : 'Rafiqul Islam';
      const ownerEmail = (tenant && tenant.ownerEmail) ? tenant.ownerEmail : 'rafiq@sst.com';
      defaultInfo = {
        name: ownerName,
        role: 'Tenant Admin',
        email: ownerEmail,
        address: (tenant && tenant.address) ? tenant.address : 'Port Access Road, Agrabad C/A, Chittagong',
        avatar: ownerName.charAt(0).toUpperCase(),
        avatarBg: 'var(--panel-accent)'
      };
    } else if (ws === 'office-admin') {
      defaultInfo = {
        name: 'Jack Rahman',
        role: 'Office Admin',
        email: 'jack@sst.com',
        address: 'Port Access Road, Chittagong',
        avatar: 'J',
        avatarBg: 'var(--panel-accent)'
      };
    } else if (ws === 'office') {
      defaultInfo = {
        name: 'Jack Rahman',
        role: 'Office Manager',
        email: 'jack@sst.com',
        address: 'Port Access Road, Chittagong',
        avatar: 'J',
        avatarBg: 'var(--panel-accent)'
      };
    } else if (ws === 'office-config') {
      defaultInfo = {
        name: 'Jack Rahman',
        role: 'Office Admin',
        email: 'jack@sst.com',
        address: 'Port Access Road, Chittagong',
        avatar: 'J',
        avatarBg: 'var(--panel-accent)'
      };
    } else if (ws === 'department') {
      const dept = (typeof QrewStore !== 'undefined' && QrewStore.getDepartmentById)
        ? QrewStore.getDepartmentById(Qrew.state.currentDeptId)
        : null;
      const leadName = dept ? (dept.leadName || 'Jack Rahman') : 'Jack Rahman';
      defaultInfo = {
        name: leadName,
        role: 'Department Lead',
        email: 'lead@sst.com',
        address: 'Port Access Road, Chittagong',
        avatar: leadName.charAt(0).toUpperCase(),
        avatarBg: 'var(--color-accent)'
      };
    } else if (ws === 'member') {
      const member = (typeof QrewStore !== 'undefined' && QrewStore.getUserById)
        ? QrewStore.getUserById(Qrew.state.currentMemberId)
        : null;
      const memName = (member && member.name) ? member.name : 'Nusrat Jahan';
      const memEmail = (member && member.email) ? member.email : 'nusrat@sst.com';
      defaultInfo = {
        name: memName,
        role: 'Office Staff',
        email: memEmail,
        address: 'Port Access Road, Chittagong',
        avatar: memName.charAt(0).toUpperCase(),
        avatarBg: 'var(--color-text-muted)'
      };
    } else {
      defaultInfo = {
        name: 'Sakib',
        role: 'Platform Admin',
        email: 'sakib@qrew.io',
        address: 'Gulshan-2, Dhaka',
        avatar: 'S',
        avatarBg: 'var(--color-dark)'
      };
    }

    if (overrides && overrides[ws]) {
      return { ...defaultInfo, ...overrides[ws] };
    }
    return defaultInfo;
  };

  Qrew.shell.syncHeaderUserProfile = () => {
    const user = Qrew.shell.getPanelUserInfo();
    const avatarEl = document.getElementById('topbar-user-avatar');
    const nameEl = document.getElementById('topbar-user-name');
    const roleEl = document.getElementById('topbar-user-role');
    const titleEl = document.getElementById('dropdown-user-title');
    const emailEl = document.getElementById('dropdown-user-email');
    const dropdownRoleEl = document.getElementById('dropdown-user-role');

    if (avatarEl) {
      if (user.photo) {
        avatarEl.innerHTML = `<img src="${user.photo}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block;">`;
        avatarEl.style.backgroundColor = 'transparent';
      } else {
        avatarEl.textContent = user.avatar || user.name.charAt(0).toUpperCase();
        avatarEl.style.backgroundColor = user.avatarBg || 'var(--color-dark)';
      }
    }
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role;
    if (titleEl) titleEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (dropdownRoleEl) dropdownRoleEl.textContent = user.role;
  };

  const openEditProfileModal = () => {
    if (Qrew.dom.userDropdownMenu) {
      Qrew.dom.userDropdownMenu.classList.remove('show');
    }
    const user = Qrew.shell.getPanelUserInfo();

    QrewUI.openModal({
      title: 'Edit Profile Settings',
      bodyHtml: `
        <div style="display:flex;align-items:center;gap:14px;padding-bottom:16px;border-bottom:1px solid var(--color-border-subtle);">
          <div class="user-avatar" style="width:48px;height:48px;font-size:18px;font-weight:700;overflow:hidden;background-color:${user.photo ? 'transparent' : (user.avatarBg || 'var(--color-dark)')};">
            ${user.photo ? `<img src="${user.photo}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover;display:block;">` : QrewUI.escapeHtml(user.avatar || user.name.charAt(0).toUpperCase())}
          </div>
          <div>
            <h3 style="font-size:16px;font-weight:600;color:var(--color-text-primary);margin:0;">${QrewUI.escapeHtml(user.name)}</h3>
            <div style="margin-top:4px;"><span class="badge" style="background:var(--color-surface);color:var(--color-accent);border:1px solid var(--color-border);font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;">${QrewUI.escapeHtml(user.role)}</span></div>
          </div>
        </div>

        <form id="edit-profile-form" style="display:flex;flex-direction:column;gap:14px;margin-top:14px;">
          <div class="form-group">
            <label class="form-label">Full Name <span class="required">*</span></label>
            <input type="text" class="form-input" id="profile-edit-name" value="${QrewUI.escapeHtml(user.name)}" required>
          </div>

          <div class="form-group">
            <label class="form-label">Email Address <span class="required">*</span></label>
            <input type="email" class="form-input" id="profile-edit-email" value="${QrewUI.escapeHtml(user.email)}" required>
          </div>

          <div class="form-row-2col" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:6px;">
            <div class="form-group">
              <label class="form-label">Active Panel Role</label>
              <input type="text" class="form-input" value="${QrewUI.escapeHtml(user.role)}" disabled style="background:var(--color-surface);color:var(--color-text-muted);cursor:not-allowed;">
              <span class="form-hint">Role scoped to active panel</span>
            </div>
            <div class="form-group">
              <label class="form-label">Account Status</label>
              <input type="text" class="form-input" value="Active" disabled style="background:var(--color-surface);color:var(--color-text-muted);cursor:not-allowed;">
              <span class="form-hint">Operational</span>
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="QrewUI.closeModal()">Cancel</button>
        <button class="btn btn-primary" id="btn-save-profile">Save Changes</button>
      `,
      onOpen: (modalEl) => {
        const nameInput = modalEl.querySelector('#profile-edit-name');
        nameInput.focus();

        modalEl.querySelector('#btn-save-profile').onclick = () => {
          const name = modalEl.querySelector('#profile-edit-name').value.trim();
          const email = modalEl.querySelector('#profile-edit-email').value.trim();

          if (!name || !email) {
            alert('Please provide your name and email address.');
            return;
          }

          try {
            const ws = Qrew.state.activeWorkspace;
            let overrides = {};
            try {
              overrides = JSON.parse(localStorage.getItem('qrew_panel_user_overrides') || '{}');
            } catch (e) { }
            overrides[ws] = { name, email, avatar: name.charAt(0).toUpperCase() };
            localStorage.setItem('qrew_panel_user_overrides', JSON.stringify(overrides));

            if (ws === 'platform' || ws === 'super-admin') {
              try { QrewStore.updateCurrentUser({ name, email }); } catch (e) { }
            }

            Qrew.shell.syncHeaderUserProfile();
            QrewUI.closeModal();
            QrewUI.showToast('Profile updated successfully!', 'success');
          } catch (err) {
            alert(err.message);
          }
        };
      }
    });
  };

  function useReactSidebarState(initialState) {
    let state = initialState;
    const subscribers = [];

    const getState = () => state;

    const setState = (action) => {
      const nextState = typeof action === 'function' ? action(state) : action;
      if (nextState !== state) {
        state = nextState;
        subscribers.forEach(callback => callback(state));
      }
    };

    const subscribe = (callback) => {
      subscribers.push(callback);
      return () => {
        const idx = subscribers.indexOf(callback);
        if (idx !== -1) subscribers.splice(idx, 1);
      };
    };

    return [getState, setState, subscribe];
  }

  document.addEventListener('DOMContentLoaded', () => {
    Qrew.initDom();
    const DOM = Qrew.dom;

    // Persisted Sidebar Collapse State
    const initialSidebarCollapsed = (() => {
      try {
        return localStorage.getItem('qrew_sidebar_collapsed') === 'true';
      } catch {
        return false;
      }
    })();

    const [getSidebarCollapsed, setSidebarCollapsed, subscribeSidebar] = useReactSidebarState(initialSidebarCollapsed);

    const brandWrapperEl = document.getElementById('brand-wrapper');

    subscribeSidebar((collapsed) => {
      Qrew.state.sidebarCollapsed = collapsed;
      if (DOM.sidebar) {
        DOM.sidebar.classList.toggle('collapsed', collapsed);
      }
      if (brandWrapperEl) {
        if (collapsed) {
          brandWrapperEl.setAttribute('data-tooltip', 'Expand sidebar (Ctrl+B)');
          brandWrapperEl.setAttribute('title', 'Expand sidebar (Ctrl+B)');
        } else {
          brandWrapperEl.removeAttribute('data-tooltip');
          brandWrapperEl.setAttribute('title', 'Go to Platform Landing Page');
        }
      }
      const label = collapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)';
      if (DOM.sidebarToggle) {
        DOM.sidebarToggle.setAttribute('title', label);
        DOM.sidebarToggle.setAttribute('aria-label', label);
        DOM.sidebarToggle.setAttribute('data-tooltip', label);
      }
      try {
        localStorage.setItem('qrew_sidebar_collapsed', String(collapsed));
      } catch (e) { }
    });

    if (initialSidebarCollapsed) {
      Qrew.state.sidebarCollapsed = true;
      if (DOM.sidebar) DOM.sidebar.classList.add('collapsed');
      if (brandWrapperEl) {
        brandWrapperEl.setAttribute('data-tooltip', 'Expand sidebar (Ctrl+B)');
        brandWrapperEl.setAttribute('title', 'Expand sidebar (Ctrl+B)');
      }
      if (DOM.sidebarToggle) {
        DOM.sidebarToggle.setAttribute('title', 'Expand sidebar (Ctrl+B)');
        DOM.sidebarToggle.setAttribute('aria-label', 'Expand sidebar (Ctrl+B)');
        DOM.sidebarToggle.setAttribute('data-tooltip', 'Expand sidebar (Ctrl+B)');
      }
    }

    const toggleSidebar = () => {
      setSidebarCollapsed(prev => !prev);
    };

    window.useSidebarState = {
      getState: getSidebarCollapsed,
      setState: setSidebarCollapsed,
      toggle: toggleSidebar,
      subscribe: subscribeSidebar
    };

    if (DOM.sidebarToggle) {
      DOM.sidebarToggle.onclick = (e) => {
        e.stopPropagation();
        toggleSidebar();
      };
    }

    // Sidebar Resizer Dragging & Persistence
    const resizer = document.getElementById('sidebar-resizer');
    const savedSidebarWidth = parseInt(localStorage.getItem('qrew_sidebar_width'), 10);
    if (savedSidebarWidth && savedSidebarWidth >= 180 && savedSidebarWidth <= 500) {
      document.documentElement.style.setProperty('--sidebar-width', `${savedSidebarWidth}px`);
    }

    if (resizer) {
      let isResizing = false;
      let startX = 0;
      let startWidth = 256;

      resizer.addEventListener('mousedown', (e) => {
        if (Qrew.state.sidebarCollapsed) return;
        isResizing = true;
        startX = e.clientX;
        startWidth = (DOM.sidebar ? DOM.sidebar.getBoundingClientRect().width : 256);
        document.body.classList.add('is-resizing');
        resizer.classList.add('resizing');
        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const currentX = e.clientX;
        const diff = currentX - startX;
        let newWidth = startWidth + diff;

        if (newWidth < 180) {
          newWidth = 180;
        } else if (newWidth > 500) {
          newWidth = 500;
        }

        document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
      });

      document.addEventListener('mouseup', () => {
        if (!isResizing) return;
        isResizing = false;
        document.body.classList.remove('is-resizing');
        resizer.classList.remove('resizing');

        const currentWidth = DOM.sidebar ? DOM.sidebar.getBoundingClientRect().width : 256;
        if (currentWidth >= 180 && currentWidth <= 500) {
          try {
            localStorage.setItem('qrew_sidebar_width', String(Math.round(currentWidth)));
          } catch (err) { }
        }
      });

      resizer.addEventListener('dblclick', () => {
        document.documentElement.style.setProperty('--sidebar-width', '256px');
        try {
          localStorage.setItem('qrew_sidebar_width', '256');
        } catch (err) { }
      });
    }

    // Brand logo click navigation (expands if collapsed, else goes home)
    const navigateBrandHome = (e) => {
      if (e) e.stopPropagation();
      if (Qrew.state.sidebarCollapsed) {
        toggleSidebar();
        return;
      }
      const iface = Qrew.interfaces[Qrew.state.activeWorkspace];
      if (iface && iface.brandHome === 'platform') {
        Qrew.navigateTo('#landing');
      } else {
        const tenantId = Qrew.state.currentTenantId || (QrewStore.getTenants()[0] ? QrewStore.getTenants()[0].id : 'ten_sst');
        Qrew.navigateTo(`#tenant-landing?id=${tenantId}`);
      }
    };

    const sidebarBrandLogo = document.getElementById('sidebar-brand-logo');
    if (sidebarBrandLogo) {
      sidebarBrandLogo.onclick = navigateBrandHome;
    }

    const brandWrapper = document.getElementById('brand-wrapper');
    if (brandWrapper) {
      brandWrapper.onclick = navigateBrandHome;
    }

    // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar; Escape to close menus
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key === 'Escape') {
        if (DOM.userDropdownMenu) DOM.userDropdownMenu.classList.remove('show');
        if (DOM.notificationsPopover) DOM.notificationsPopover.classList.remove('show');
        document.querySelectorAll('.tree-action-menu.show').forEach(m => m.classList.remove('show'));
      }
    });

    // Mobile Menu & Backdrop Drawer
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    if (DOM.mobileMenuBtn) {
      DOM.mobileMenuBtn.onclick = () => {
        if (DOM.sidebar) {
          const isOpen = DOM.sidebar.classList.toggle('mobile-open');
          if (sidebarBackdrop) sidebarBackdrop.classList.toggle('active', isOpen);
        }
      };
    }
    if (sidebarBackdrop) {
      sidebarBackdrop.onclick = () => {
        if (DOM.sidebar) DOM.sidebar.classList.remove('mobile-open');
        sidebarBackdrop.classList.remove('active');
      };
    }

    // User Profile Dropdown
    if (DOM.userDropdownTrigger) {
      DOM.userDropdownTrigger.onclick = (e) => {
        e.stopPropagation();
        if (DOM.userDropdownMenu) DOM.userDropdownMenu.classList.toggle('show');
        if (DOM.notificationsPopover) DOM.notificationsPopover.classList.remove('show');
      };
    }

    // Notifications Popover
    if (DOM.notificationsTrigger) {
      DOM.notificationsTrigger.onclick = (e) => {
        e.stopPropagation();
        const isShowing = DOM.notificationsPopover && DOM.notificationsPopover.classList.contains('show');
        if (!isShowing) {
          const recentLogs = QrewStore.getAuditLogs().slice(0, 5);
          const listEl = document.getElementById('notifications-list');
          if (listEl) {
            listEl.innerHTML = recentLogs.map(l => `
              <div class="notification-item">
                <div class="notification-desc">
                  <strong>${QrewUI.escapeHtml(l.actor)}</strong>: ${QrewUI.escapeHtml(l.description)}
                </div>
                <div class="notification-time">${l.timestamp}</div>
              </div>
            `).join('');
          }
        }
        if (DOM.notificationsPopover) DOM.notificationsPopover.classList.toggle('show');
        if (DOM.userDropdownMenu) DOM.userDropdownMenu.classList.remove('show');
      };
    }

    // Profile Navigation (Full Page Settings with Profile, Appearance, Security)
    const navigateToProfile = () => {
      if (DOM.userDropdownMenu) DOM.userDropdownMenu.classList.remove('show');
      Qrew.navigateTo('#profile');
    };

    const myProfileBtn = document.getElementById('action-my-profile');
    if (myProfileBtn) myProfileBtn.onclick = navigateToProfile;

    const dropdownHeaderBtn = document.getElementById('dropdown-header-btn');
    if (dropdownHeaderBtn) dropdownHeaderBtn.onclick = navigateToProfile;

    // Logout
    const performLogout = () => {
      const ws = Qrew.state.activeWorkspace;
      const currentRoute = Qrew.state.currentRoute || '';
      const tenantWorkspaces = [
        'tenant',
        'office',
        'tenant-super-admin',
        'office-admin',
        'office-config',
        'department',
        'member'
      ];

      const isTenantContext = tenantWorkspaces.includes(ws) ||
        tenantWorkspaces.some(w => currentRoute.startsWith(w));

      if (isTenantContext) {
        const tenantId = Qrew.state.currentTenantId || 'ten_sst';
        Qrew.navigateTo(`#tenant-landing?id=${tenantId}`);
      } else {
        Qrew.navigateTo('#landing');
      }
    };

    Qrew.shell.performLogout = performLogout;

    const logoutBtn = document.getElementById('action-logout');
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        if (DOM.userDropdownMenu) DOM.userDropdownMenu.classList.remove('show');
        QrewUI.confirmDialog({
          title: 'Log Out',
          message: 'Are you sure you want to log out of your session?',
          confirmText: 'Log Out',
          confirmClass: 'btn-danger',
          onConfirm: () => {
            QrewUI.showToast('You have been logged out successfully.', 'info');
            performLogout();
          }
        });
      };
    }

    // Elevated Admin Panel Switch Confirmation Handlers
    Qrew.actions.confirmSwitchToSuperAdmin = (event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      QrewUI.confirmDialog({
        title: 'Switch to Super Admin',
        message: 'Are you sure you want to switch to Platform Super Admin?',
        confirmText: 'Continue',
        confirmClass: 'btn-blue',
        icon: 'shield',
        iconColor: 'var(--color-secondary, #2563EB)',
        showDoNotAskAgain: true,
        doNotAskAgainKey: 'qrew_skip_confirm_switch_super_admin',
        onConfirm: () => {
          window.location.hash = '#super-admin/overview';
        }
      });
    };

    Qrew.actions.confirmSwitchToTenantSuperAdmin = (event, tenantId) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      const tid = tenantId || Qrew.state.currentTenantId || 'ten_sst';
      QrewUI.confirmDialog({
        title: 'Switch to Tenant Super Admin',
        message: 'Are you sure you want to switch to Tenant Super Admin?',
        confirmText: 'Continue',
        confirmClass: 'btn-purple',
        confirmStyle: 'background-color: var(--color-supporting-purple, #7C3AED); border-color: var(--color-supporting-purple, #7C3AED); color: #FFFFFF;',
        icon: 'shield',
        iconColor: 'var(--color-supporting-purple, #7C3AED)',
        showDoNotAskAgain: true,
        doNotAskAgainKey: 'qrew_skip_confirm_switch_tenant_super_admin',
        onConfirm: () => {
          window.location.hash = `#tenant-super-admin/overview?id=${tid}`;
        }
      });
    };

    Qrew.actions.confirmSwitchToOfficeAdmin = (event, tenantId, officeId) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      const tid = tenantId || Qrew.state.currentTenantId || 'ten_sst';
      const oid = officeId || Qrew.state.currentOfficeId || 'off_ctg_port';
      QrewUI.confirmDialog({
        title: 'Switch to Office Admin',
        message: 'Are you sure you want to switch to Office Admin?',
        confirmText: 'Continue',
        confirmClass: 'btn-primary',
        icon: 'settings',
        iconColor: 'var(--color-primary, #0D9488)',
        showDoNotAskAgain: true,
        doNotAskAgainKey: 'qrew_skip_confirm_switch_office_admin',
        onConfirm: () => {
          window.location.hash = `#office-admin/overview?tenantId=${tid}&officeId=${oid}`;
        }
      });
    };

    // Global Theme Toggle Click Handler
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('#topbar-theme-toggle, #landing-theme-toggle, .topbar-theme-toggle, .landing-theme-toggle');
      if (toggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        Qrew.shell.toggleTheme();
        return;
      }
    });

    // Close dropdowns & tree menus when clicking outside
    document.addEventListener('click', () => {
      if (DOM.userDropdownMenu) DOM.userDropdownMenu.classList.remove('show');
      if (DOM.notificationsPopover) DOM.notificationsPopover.classList.remove('show');
      document.querySelectorAll('.tree-action-menu.show').forEach(m => {
        m.classList.remove('show');
        const card = m.closest('.tree-tenant-card') || m.closest('.tree-office-item');
        if (card) card.style.zIndex = '';
      });
    });

    // Hash Change Listener & Boot
    window.addEventListener('hashchange', Qrew.handleRouteChange);
    Qrew.shell.applyAppearanceSettings();
    if (window.matchMedia) {
      try {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
          const currentTheme = localStorage.getItem('qrew_ui_theme') || 'system';
          if (currentTheme === 'system') {
            Qrew.shell.applyAppearanceSettings();
          }
        });
      } catch (e) { }
    }
    Qrew.shell.syncHeaderUserProfile();
    Qrew.handleRouteChange();
  });
})();
