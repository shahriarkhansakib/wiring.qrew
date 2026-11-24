/**
 * Qrew Core — Hash Router, Route Normalization, and Context Builder
 */
(() => {
  const Qrew = window.Qrew;

  Qrew.parseHash = () => {
    const rawHash = window.location.hash.slice(1) || 'landing';
    const [pathPart, queryString] = rawHash.split('?');
    const params = {};

    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }
    }

    if (pathPart === 'landing' || pathPart === '') {
      return { workspace: 'landing', view: 'landing', path: 'landing', params };
    }

    if (pathPart === 'tenant-landing' || pathPart.startsWith('tenant-landing/')) {
      return { workspace: 'tenant-landing', view: 'landing', path: 'tenant-landing', params };
    }

    if (pathPart === 'profile' || pathPart.startsWith('profile/')) {
      const paramWs = params.ws || params.workspace || params.from;
      const activeWs = paramWs || ((Qrew.state && Qrew.state.activeWorkspace)
        ? Qrew.state.activeWorkspace
        : (sessionStorage.getItem('qrew_active_workspace') || 'platform'));
      return { workspace: activeWs, view: 'profile', path: pathPart, params };
    }

    let workspace = 'platform';
    let view = 'overview';

    // Normalize legacy & new paths
    if (
      pathPart === 'super-admin' ||
      pathPart.startsWith('super-admin/') ||
      pathPart === 'permission-catalog' ||
      pathPart === 'platform-settings' ||
      pathPart === 'platform-access'
    ) {
      workspace = 'super-admin';
      if (pathPart.startsWith('super-admin/')) {
        view = pathPart.replace('super-admin/', '') || 'overview';
      } else if (pathPart === 'platform-settings') {
        view = 'platform-settings';
      } else if (pathPart === 'platform-access') {
        view = 'platform-access';
      } else if (pathPart === 'permission-catalog') {
        view = 'permission-catalog';
      } else {
        view = 'overview';
      }
    } else if (pathPart === 'office-config' || pathPart.startsWith('office-config/')) {
      workspace = 'office-config';
      if (pathPart.startsWith('office-config/')) {
        view = pathPart.replace('office-config/', '') || 'overview';
      } else {
        view = 'overview';
      }
    } else if (pathPart === 'department' || pathPart.startsWith('department/')) {
      workspace = 'department';
      if (pathPart.startsWith('department/')) {
        view = pathPart.replace('department/', '') || 'overview';
      } else {
        view = 'overview';
      }
    } else if (pathPart === 'member' || pathPart.startsWith('member/')) {
      workspace = 'member';
      if (pathPart.startsWith('member/')) {
        view = pathPart.replace('member/', '') || 'overview';
      } else {
        view = 'overview';
      }
    } else if (
      pathPart === 'tenant-super-admin' ||
      pathPart.startsWith('tenant-super-admin/')
    ) {
      workspace = 'tenant-super-admin';
      if (pathPart.startsWith('tenant-super-admin/')) {
        view = pathPart.replace('tenant-super-admin/', '') || 'overview';
      } else {
        view = 'overview';
      }
    } else if (
      pathPart.startsWith('tenant/') ||
      pathPart === 'tenant-details' ||
      pathPart === 'tenant-overview' ||
      pathPart === 'tenant-offices' ||
      pathPart === 'tenant-members' ||
      pathPart === 'tenant-roles' ||
      pathPart === 'tenant-settings' ||
      pathPart === 'tenant'
    ) {
      workspace = 'tenant';
      if (pathPart.startsWith('tenant/')) {
        view = pathPart.replace('tenant/', '') || 'overview';
      } else if (pathPart === 'tenant-details' || pathPart === 'tenant-overview') {
        view = 'overview';
      } else if (pathPart === 'tenant-offices') {
        view = 'offices';
      } else if (pathPart === 'tenant-members') {
        view = 'members';
      } else if (pathPart === 'tenant-roles') {
        view = 'roles';
      } else if (pathPart === 'tenant-settings') {
        view = 'settings';
      } else {
        view = 'overview';
      }
    } else if (
      pathPart.startsWith('office-admin/') ||
      pathPart === 'office-admin' ||
      pathPart === 'office-admin-overview' ||
      pathPart === 'office-admin-staff' ||
      pathPart === 'office-admin-departments' ||
      pathPart === 'office-admin-roles' ||
      pathPart === 'office-admin-activity' ||
      pathPart === 'office-admin-invoice' ||
      pathPart === 'office-admin-staffs-management'
    ) {
      workspace = 'office-admin';
      if (pathPart.startsWith('office-admin/')) {
        view = pathPart.replace('office-admin/', '') || 'overview';
      } else if (pathPart === 'office-admin-staff' || pathPart === 'office-admin-staffs-management') {
        view = 'staffs-management';
      } else if (pathPart === 'office-admin-invoice') {
        view = 'invoice';
      } else {
        view = 'overview';
      }
    } else if (
      pathPart.startsWith('office/') ||
      pathPart === 'office-details' ||
      pathPart === 'office-overview' ||
      pathPart === 'office-staff' ||
      pathPart === 'office-roles' ||
      pathPart === 'office-activity' ||
      pathPart === 'office-departments' ||
      pathPart === 'office' ||
      pathPart === 'office-dashboard' ||
      pathPart === 'office-clients' ||
      pathPart === 'office-files' ||
      pathPart === 'office-financials' ||
      pathPart === 'office-staffs'
    ) {
      workspace = 'office';
      if (pathPart.startsWith('office/')) {
        view = pathPart.replace('office/', '') || 'dashboard';
      } else if (pathPart === 'office-clients') {
        view = 'clients';
      } else if (pathPart === 'office-files') {
        view = 'files';
      } else if (pathPart === 'office-financials') {
        view = 'financials';
      } else if (pathPart === 'office-staffs' || pathPart === 'office-staff') {
        view = 'staffs';
      } else {
        view = 'dashboard';
      }
    } else {
      workspace = 'platform';
      if (pathPart.startsWith('platform/')) {
        view = pathPart.replace('platform/', '') || 'overview';
      } else if (pathPart === 'tenants') {
        view = 'tenants';
      } else if (pathPart === 'archive') {
        view = 'archive';
      } else if (pathPart === 'platform-users' || pathPart === 'platform-access') {
        view = 'platform-access';
      } else if (pathPart === 'roles-permissions' || pathPart === 'platform-roles' || pathPart === 'permission-access') {
        view = 'permission-access';
      } else if (pathPart === 'template-defaults' || pathPart === 'templates-defaults') {
        view = 'template-defaults';
      } else if (pathPart === 'plans-entitlements') {
        view = 'plans-entitlements';
      } else if (pathPart === 'usage-analytics') {
        view = 'usage-analytics';
      } else if (pathPart === 'audit-logs' || pathPart === 'audit-log') {
        view = 'audit-log';
      } else if (pathPart === 'support-access') {
        view = 'support-access';
      } else if (pathPart === 'system-health') {
        view = 'system-health';
      } else {
        view = 'overview';
      }
    }

    return { workspace, view, path: pathPart, params };
  };

  Qrew.navigateTo = (hash) => {
    window.location.hash = hash.startsWith('#') ? hash : '#' + hash;
  };

  Qrew.buildContext = () => {
    const state = Qrew.state;
    const tenant = QrewStore.getTenantById(state.currentTenantId) || QrewStore.getTenants()[0] || null;
    const office = QrewStore.getOfficeById(state.currentOfficeId) || (tenant ? QrewStore.getOfficesByTenant(tenant.id)[0] : null) || null;
    const dept = QrewStore.getDepartmentById(state.currentDeptId) || (office ? QrewStore.getDepartments(office.id)[0] : null) || null;

    return {
      state,
      view: state.currentView,
      params: state.routeParams,
      tenant,
      office,
      dept
    };
  };

  Qrew.handleRouteChange = () => {
    const state = Qrew.state;
    const route = Qrew.parseHash();
    state.activeWorkspace = route.workspace;
    if (route.workspace && route.workspace !== 'landing' && route.workspace !== 'tenant-landing') {
      try { sessionStorage.setItem('qrew_active_workspace', route.workspace); } catch(e) {}
    }
    state.currentView = route.view;
    state.currentRoute = route.path;
    state.routeParams = route.params;

    // Apply dashboard-specific color identity
    Qrew.applyPanelTheme(route.workspace);

    const iface = Qrew.interfaces[route.workspace] || Qrew.interfaces.platform;

    if (iface && iface.landingMode) {
      document.body.classList.add('landing-mode');
      document.body.classList.remove('profile-mode');
      if (route.params.id) {
        state.currentTenantId = route.params.id;
      }
      iface.render(route.view, Qrew.buildContext());
      return;
    } else {
      document.body.classList.remove('landing-mode');
    }

    if (route.view === 'profile') {
      document.body.classList.add('profile-mode');
    } else {
      document.body.classList.remove('profile-mode');
    }

    // Update active IDs if present in params
    if (route.params.id) {
      state.currentTenantId = route.params.id;
    }
    if (route.params.tenantId) {
      state.currentTenantId = route.params.tenantId;
    }
    if (route.params.officeId) {
      state.currentOfficeId = route.params.officeId;
    }
    if (route.params.deptId) {
      state.currentDeptId = route.params.deptId;
      // A department deep link implies its office and tenant
      const linkedDept = QrewStore.getDepartmentById(route.params.deptId);
      const linkedOffice = linkedDept ? QrewStore.getOfficeById(linkedDept.officeId) : null;
      if (linkedOffice) {
        state.currentOfficeId = linkedOffice.id;
        state.currentTenantId = linkedOffice.tenantId;
      }
    }
    if (route.params.userId || route.params.memberId) {
      state.currentMemberId = route.params.userId || route.params.memberId;
      if (!route.params.officeId) {
        const staffEntry = (QrewStore.data.officeStaff || []).find(os => os.userId === state.currentMemberId);
        if (staffEntry) {
          state.currentOfficeId = staffEntry.officeId;
          if (!route.params.tenantId) state.currentTenantId = staffEntry.tenantId;
        }
      }
    }

    // Ensure fallback valid IDs
    const tenants = QrewStore.getTenants();
    if (!state.currentTenantId && tenants.length > 0) {
      state.currentTenantId = tenants[0].id;
    }
    const currentTenantOffices = QrewStore.getOfficesByTenant(state.currentTenantId);
    if ((!state.currentOfficeId || !currentTenantOffices.some(o => o.id === state.currentOfficeId)) && currentTenantOffices.length > 0) {
      state.currentOfficeId = currentTenantOffices[0].id;
    }
    const currentDepts = QrewStore.getDepartments(state.currentOfficeId);
    if ((!state.currentDeptId || !currentDepts.some(d => d.id === state.currentDeptId)) && currentDepts.length > 0) {
      state.currentDeptId = currentDepts[0].id;
    }
    if (!state.currentMemberId) {
      state.currentMemberId = 'usr_nusrat';
    }

    Qrew.shell.updateTopbarDomainBadge();
    Qrew.shell.syncHeaderUserProfile();
    Qrew.shell.renderSidebar();

    // Close mobile drawer on route change
    if (Qrew.dom.sidebar && Qrew.dom.sidebar.classList.contains('mobile-open')) {
      Qrew.dom.sidebar.classList.remove('mobile-open');
      const sidebarBackdrop = document.getElementById('sidebar-backdrop');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
    }

    if (route.view === 'profile') {
      if (Qrew.views.profile && Qrew.views.profile.render) {
        Qrew.views.profile.render(route.params.tab || 'profile', Qrew.buildContext());
        return;
      }
    }

    if (iface && iface.render) {
      iface.render(route.view, Qrew.buildContext());
    }
  };
})();
