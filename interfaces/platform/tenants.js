/**
 * Interface: Platform Admin — Tenants Tree Explorer & Tenant CRUD Modals
 */
(() => {
  const Qrew = window.Qrew;

  const platformTenantTreeState = {
    isRootExpanded: true,
    expandedTenants: new Set(),
    searchTerm: '',
    statusFilter: 'All'
  };

  const openCreateTenantModal = () => {
    QrewUI.openModal({
      title: 'Create New Tenant Organization',
      bodyHtml: `
        <div class="notice-box" style="margin-bottom:12px;">
          ${QrewUI.getIcon('info')}
          <div>
            <strong>Separation of Duties:</strong> The tenant owner is automatically provisioned as Tenant Admin. A Platform Owner (such as Sakib) cannot be assigned as a Tenant Owner or Tenant Admin.
          </div>
        </div>
        <form id="create-tenant-form">
          <div class="form-group">
            <label class="form-label">Tenant / Organization Name <span class="required">*</span></label>
            <input type="text" class="form-input" id="new-tenant-name" placeholder="e.g. Acme Corporation" required>
            <span class="form-hint">A unique namespace will be established for this tenant.</span>
          </div>
          <div class="form-group" style="margin-top:14px;">
            <label class="form-label">Owner Full Name <span class="required">*</span></label>
            <input type="text" class="form-input" id="new-tenant-owner" placeholder="e.g. Sarah Jenkins" required>
          </div>
          <div class="form-group" style="margin-top:14px;">
            <label class="form-label">Owner Email Address <span class="required">*</span></label>
            <input type="email" class="form-input" id="new-tenant-email" placeholder="e.g. sarah@acme.com" required>
            <span class="form-hint">Owner will automatically be assigned as Tenant Admin. Must not be a Platform Owner.</span>
          </div>
          <div class="form-group" style="margin-top:14px;">
            <label class="form-label">Subscription Plan</label>
            <select class="form-select" id="new-tenant-plan">
              <option value="Starter">Starter (Small Teams)</option>
              <option value="Standard">Standard (Growing Teams)</option>
              <option value="Professional">Professional (Advanced Operations)</option>
              <option value="Enterprise" selected>Enterprise (Large Organizations)</option>
            </select>
          </div>
          <div class="form-group" style="margin-top:14px;">
            <label class="form-label">Tenant Status</label>
            <select class="form-select" id="new-tenant-status">
              <option value="Active" selected>Active</option>
              <option value="Trial">Trial</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="QrewUI.closeModal()">Cancel</button>
        <button class="btn btn-primary" id="btn-submit-create-tenant">Create Tenant</button>
      `,
      onOpen: (modalEl) => {
        const submitBtn = modalEl.querySelector('#btn-submit-create-tenant');
        submitBtn.onclick = () => {
          const name = modalEl.querySelector('#new-tenant-name').value.trim();
          const ownerName = modalEl.querySelector('#new-tenant-owner').value.trim();
          const ownerEmail = modalEl.querySelector('#new-tenant-email').value.trim();

          if (!name || !ownerName || !ownerEmail) {
            alert('Please fill out all required fields.');
            return;
          }

          try {
            const planEl = modalEl.querySelector('#new-tenant-plan');
            const plan = planEl ? planEl.value : 'Enterprise';
            const statusEl = modalEl.querySelector('#new-tenant-status');
            const status = statusEl ? statusEl.value : 'Active';
            const newTenant = QrewStore.createTenant({ name, ownerName, ownerEmail, plan, status });
            Qrew.state.currentTenantId = newTenant.id;
            QrewUI.closeModal();
            QrewUI.showToast(`Tenant "${newTenant.name}" successfully created!`, 'success');
            Qrew.handleRouteChange();
          } catch (err) {
            alert(err.message);
          }
        };
      }
    });
  };

  const openOwnerProfileModal = (tenantId) => {
    try {
      const tenant = QrewStore.getTenantById(tenantId) || { id: tenantId, name: 'SST', ownerName: 'Rafiqul Islam', ownerEmail: 'rafiq@sst.com' };
      const ownerName = tenant.ownerName || 'Rafiqul Islam';

      const user = (QrewStore.data && QrewStore.data.users ? QrewStore.data.users : []).find(u => u.name === ownerName || u.email === tenant.ownerEmail) || {
        id: 'usr_rafiq',
        name: ownerName,
        email: tenant.ownerEmail || 'rafiq@sst.com',
        phone: '+880 1711-234567',
        platformRole: 'Platform User',
        status: 'Active',
        createdAt: '2026-10-02'
      };

      const tenantMembers = (QrewStore.data && QrewStore.data.tenantMembers) ? QrewStore.data.tenantMembers : [];
      const tenantMember = tenantMembers.find(m => m.tenantId === tenant.id && (m.userId === user.id || user.name === ownerName));
      const tenantRole = tenantMember ? tenantMember.tenantRole : 'Tenant Admin';

      const phone = tenant.phone || user.phone || '+880 1711-234567';
      const address = tenant.address || 'Port Access Road, Agrabad C/A, Chittagong';
      const plan = tenant.plan || 'Enterprise';
      const planSubtext = plan === 'Starter' ? 'Small Teams' 
        : plan === 'Standard' ? 'Growing Teams' 
        : plan === 'Professional' ? 'Advanced Operations' 
        : 'Large Organizations';

      QrewUI.openModal({
        title: `Organization Information: ${tenant.name}`,
        bodyHtml: `
          <div style="display:flex;flex-direction:column;gap:16px;">
            <!-- Profile Card -->
            <div style="display:flex;align-items:center;gap:16px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:16px 18px;">
              <div style="width:52px;height:52px;border-radius:var(--radius-md);background:var(--panel-accent, var(--color-accent));color:#FFFFFF;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;flex-shrink:0;box-shadow:0 2px 8px rgba(13,148,136,0.25);">
                ${user.name.charAt(0).toUpperCase()}
              </div>
              <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <h3 style="font-size:17px;font-weight:700;color:var(--color-text-primary);margin:0;">${QrewUI.escapeHtml(user.name)}</h3>
                  <span class="badge badge-success" style="font-size:11px;">${QrewUI.escapeHtml(user.status || 'Active')}</span>
                </div>
                <div style="font-size:13px;color:var(--color-text-muted);margin-top:3px;">
                  ${QrewUI.escapeHtml(user.email || 'rafiq@sst.com')} &bull; <span style="font-family:var(--font-mono);font-size:12px;">${user.id}</span>
                </div>
              </div>
            </div>

            <!-- Attributes Grid -->
            <div style="display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:12px;">
              <div style="background:var(--color-surface-white);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:12px 14px;">
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:var(--color-text-muted);margin-bottom:4px;">Organization</div>
                <div style="font-size:13.5px;font-weight:600;color:var(--color-text-primary);">${QrewUI.escapeHtml(tenant.name)}</div>
                <div style="font-size:12px;color:var(--color-text-muted);">Organization Owner</div>
              </div>

              <div style="background:var(--color-surface-white);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:12px 14px;">
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:var(--color-text-muted);margin-bottom:4px;">Tenant Role</div>
                <div style="font-size:13.5px;font-weight:600;color:var(--color-accent);">${tenantRole}</div>
                <div style="font-size:12px;color:var(--color-text-muted);">Full Tenant Administration</div>
              </div>

              <div style="background:var(--color-surface-white);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:12px 14px;">
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:var(--color-text-muted);margin-bottom:4px;">Phone</div>
                <div style="font-size:13.5px;font-weight:600;color:var(--color-text-primary);">${QrewUI.escapeHtml(phone)}</div>
                <div style="font-size:12px;color:var(--color-text-muted);">Primary Contact</div>
              </div>

              <div style="background:var(--color-surface-white);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:12px 14px;">
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:var(--color-text-muted);margin-bottom:4px;">Address</div>
                <div style="font-size:13.5px;font-weight:600;color:var(--color-text-primary);">${QrewUI.escapeHtml(address)}</div>
                <div style="font-size:12px;color:var(--color-text-muted);">Headquarters / Facility</div>
              </div>

              <div style="grid-column: 1 / -1;background:var(--color-surface-white);border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:12px 14px;">
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;color:var(--color-text-muted);margin-bottom:4px;">Subscription Plan</div>
                <div style="font-size:13.5px;font-weight:600;color:var(--color-text-primary);">${QrewUI.escapeHtml(plan)}</div>
                <div style="font-size:12px;color:var(--color-text-muted);">${planSubtext}</div>
              </div>
            </div>
          </div>
        `,
        footerHtml: `
          <button class="btn btn-secondary" onclick="QrewUI.closeModal()">Close</button>
        `
      });
    } catch (err) {
      console.error('Error opening profile modal:', err);
      QrewUI.openModal({
        title: 'Organization Information: Rafiqul Islam',
        bodyHtml: `
          <div style="padding:16px;">
            <p><strong>Name:</strong> Rafiqul Islam</p>
            <p><strong>Role:</strong> Tenant Admin / Organization Owner</p>
            <p><strong>Organization:</strong> SST</p>
            <p><strong>Email:</strong> rafiq@sst.com</p>
          </div>
        `,
        footerHtml: `<button class="btn btn-secondary" onclick="QrewUI.closeModal()">Close</button>`
      });
    }
  };

  const openEditTenantModal = (tenantId) => {
    const tenant = QrewStore.getTenantById(tenantId);
    if (!tenant) return;

    const currentPlan = (tenant.plan || 'Enterprise').toLowerCase();
    const isStarter = currentPlan.includes('starter') || currentPlan.includes('01');
    const isStandard = currentPlan.includes('standard') || currentPlan.includes('02');
    const isProfessional = currentPlan.includes('professional') || currentPlan.includes('03');
    const isEnterprise = currentPlan.includes('enterprise') || currentPlan.includes('04') || (!isStarter && !isStandard && !isProfessional);

    QrewUI.openModal({
      title: `Edit Tenant: ${tenant.name}`,
      bodyHtml: `
        <form id="edit-tenant-form">
          <div class="form-group">
            <label class="form-label">Tenant Name</label>
            <input type="text" class="form-input" id="edit-tenant-name" value="${QrewUI.escapeHtml(tenant.name)}" readonly disabled style="background-color:var(--color-surface);color:var(--color-text-muted);cursor:not-allowed;opacity:0.9;">
            <span class="form-hint">Tenant organization name cannot be edited.</span>
          </div>
          <div class="form-group" style="margin-top:14px;">
            <label class="form-label">Subscription Plan</label>
            <select class="form-select" id="edit-tenant-plan">
              <option value="Starter" ${isStarter ? 'selected' : ''}>Starter (Small Teams)</option>
              <option value="Standard" ${isStandard ? 'selected' : ''}>Standard (Growing Teams)</option>
              <option value="Professional" ${isProfessional ? 'selected' : ''}>Professional (Advanced Operations)</option>
              <option value="Enterprise" ${isEnterprise ? 'selected' : ''}>Enterprise (Large Organizations)</option>
            </select>
            <span class="form-hint">Selected subscription tier and operational entitlements.</span>
          </div>
          <div class="form-group" style="margin-top:14px;">
            <label class="form-label">Tenant Status</label>
            <select class="form-select" id="edit-tenant-status">
              <option value="Active" ${tenant.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Trial" ${tenant.status === 'Trial' ? 'selected' : ''}>Trial</option>
              <option value="Expired" ${tenant.status === 'Expired' ? 'selected' : ''}>Expired</option>
              <option value="Pending" ${tenant.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Suspended" ${tenant.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
              <option value="Cancelled" ${tenant.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="QrewUI.closeModal()">Cancel</button>
        <button class="btn btn-primary" id="btn-submit-edit-tenant">Save Changes</button>
      `,
      onOpen: (modalEl) => {
        modalEl.querySelector('#btn-submit-edit-tenant').onclick = () => {
          const status = modalEl.querySelector('#edit-tenant-status').value;
          const plan = modalEl.querySelector('#edit-tenant-plan').value;

          QrewStore.updateTenant(tenantId, { status, plan });
          QrewUI.closeModal();
          QrewUI.showToast(`Tenant "${tenant.name}" updated successfully.`, 'success');
          Qrew.handleRouteChange();
        };
      }
    });
  };

  const handleSuspendTenant = (tenantId, tenantName) => {
    const tenant = QrewStore.getTenantById(tenantId) || { name: tenantName };
    QrewUI.confirmDialog({
      title: 'Suspend Organization',
      message: `Are you sure you want to suspend organization "${tenant.name}"? Suspended organizations are moved to the Archive and cannot access operational workspaces.`,
      confirmText: 'Suspend & Move to Archive',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        QrewStore.updateTenant(tenantId, { status: 'Suspended' });
        QrewUI.showToast(`Organization "${tenant.name}" suspended and moved to Archive.`, 'info');
        window.location.hash = '#platform/archive';
      }
    });
  };

  const handleToggleTenantStatus = (tenantId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    const actionVerb = newStatus === 'Active' ? 'activate' : 'suspend';

    QrewUI.confirmDialog({
      title: `${newStatus === 'Active' ? 'Activate' : 'Suspend'} Tenant`,
      message: `Are you sure you want to ${actionVerb} this tenant? Suspended tenants and their offices cannot access operational endpoints.`,
      confirmText: `${newStatus === 'Active' ? 'Activate' : 'Suspend'}`,
      confirmClass: newStatus === 'Active' ? 'btn-primary' : 'btn-danger',
      onConfirm: () => {
        QrewStore.updateTenant(tenantId, { status: newStatus });
        QrewUI.showToast(`Tenant status updated to ${newStatus}.`, 'success');
        Qrew.handleRouteChange();
      }
    });
  };

  const handleDeleteTenant = (tenantId, tenantName) => {
    openGithubDeleteModal(tenantId);
  };

  const renderPlatformTenants = () => {
    const allTenants = QrewStore.getTenants();
    // Default expand all tenants inside root so folder hierarchy is fully visible
    if (platformTenantTreeState.expandedTenants.size === 0 && allTenants.length > 0) {
      allTenants.forEach(t => platformTenantTreeState.expandedTenants.add(t.id));
    }

    const totalOfficesCount = allTenants.reduce((sum, t) => sum + (QrewStore.getOfficesByTenant(t.id) || []).length, 0);
    const totalMembersCount = allTenants.reduce((sum, t) => sum + (QrewStore.getTenantMembers(t.id) || []).length, 0);

    const renderTreeNodes = () => {
      const filter = (platformTenantTreeState.searchTerm || '').toLowerCase().trim();
      const status = platformTenantTreeState.statusFilter || 'All';
      const treeListEl = document.getElementById('tenants-tree-list');
      const statsBadgeEl = document.getElementById('tenants-stats-badge');
      if (!treeListEl) return;

      const filteredTenants = allTenants.filter(t => {
        const tenantOffices = QrewStore.getOfficesByTenant(t.id) || [];
        const matchesSearch = !filter || (
          t.name.toLowerCase().includes(filter) ||
          t.id.toLowerCase().includes(filter) ||
          (t.ownerName && t.ownerName.toLowerCase().includes(filter)) ||
          tenantOffices.some(o =>
            o.name.toLowerCase().includes(filter) ||
            o.id.toLowerCase().includes(filter) ||
            (o.location && o.location.toLowerCase().includes(filter))
          )
        );
        const matchesStatus = status === 'All' ? t.status !== 'Suspended' : t.status === status;
        return matchesSearch && matchesStatus;
      });

      if (statsBadgeEl) {
        statsBadgeEl.textContent = `${filteredTenants.length} Tenant${filteredTenants.length === 1 ? '' : 's'} • ${totalOfficesCount} Offices`;
      }

      // Auto-expand root and matching tenants if searching
      if (filter) {
        platformTenantTreeState.isRootExpanded = true;
        filteredTenants.forEach(t => platformTenantTreeState.expandedTenants.add(t.id));
      }

      const isRootExpanded = platformTenantTreeState.isRootExpanded;

      treeListEl.innerHTML = `
        ${filteredTenants.length === 0 ? `
          <div style="padding:32px 24px;background:var(--color-surface-white);border:1px dashed var(--color-border);border-radius:var(--radius-md);text-align:center;">
            <span style="color:var(--color-text-muted);font-size:13.5px;">
              ${filter ? `No organizations match "${QrewUI.escapeHtml(filter)}"` : 'No tenant organizations found.'}
            </span>
          </div>
        ` : filteredTenants.map(t => {
          const tenantOffices = QrewStore.getOfficesByTenant(t.id) || [];
          const tenantMembers = QrewStore.getTenantMembers(t.id) || [];
          const isTenantExpanded = platformTenantTreeState.expandedTenants.has(t.id);

          const filteredOffices = filter
            ? tenantOffices.filter(o =>
                o.name.toLowerCase().includes(filter) ||
                o.id.toLowerCase().includes(filter) ||
                (o.location && o.location.toLowerCase().includes(filter))
              )
            : tenantOffices;

          return `
            <div class="tree-tenant-card" data-tenant-id="${t.id}">
              <!-- Tenant Header Row (e.g. SST) -->
              <div class="tree-tenant-row ${isTenantExpanded ? 'expanded' : ''}" data-tenant-id="${t.id}" aria-expanded="${isTenantExpanded ? 'true' : 'false'}" aria-label="Tenant Organization ${QrewUI.escapeHtml(t.name)}">
                <!-- Col 1: Identity -->
                <div class="tree-col-identity">
                  <button type="button" class="tree-folder-toggle-btn" data-tenant-id="${t.id}" title="${isTenantExpanded ? 'Click to collapse offices' : 'Click to expand offices'}" aria-label="${isTenantExpanded ? 'Collapse offices' : 'Expand offices'}" aria-expanded="${isTenantExpanded ? 'true' : 'false'}">
                    <span class="tree-chevron" aria-hidden="true">${QrewUI.getIcon('chevronRight')}</span>
                    <span class="tree-folder-icon" aria-hidden="true">
                      ${isTenantExpanded ? QrewUI.getIcon('folderOpen') : QrewUI.getIcon('folderClosed')}
                    </span>
                  </button>
                  <div class="tree-title-group">
                    <span class="tree-entity-name tree-tenant-text" title="${QrewUI.escapeHtml(t.name)}">${QrewUI.escapeHtml(t.name)}</span>
                    <span class="tree-id-badge" title="Tenant Organization Identifier">${t.id}</span>
                  </div>
                </div>

                <!-- Col 2: Owner Detail -->
                <div class="tree-col-detail">
                  <span class="tree-meta-icon">${QrewUI.getIcon('users')}</span>
                  <span class="tree-meta-label">Owner:</span>
                  <button type="button" class="tree-owner-link" data-tenant-id="${t.id}" title="View profile details of ${QrewUI.escapeHtml(t.ownerName || 'Rafiqul Islam')}">
                    ${QrewUI.escapeHtml(t.ownerName || 'Rafiqul Islam')}
                  </button>
                </div>

                <!-- Col 3: Counts -->
                <div class="tree-col-stats">
                  <span class="tree-meta-pill" title="Total Offices">
                    <span class="tree-meta-icon">${QrewUI.getIcon('building')}</span>
                    <span>${tenantOffices.length} office${tenantOffices.length === 1 ? '' : 's'}</span>
                  </span>
                  <span class="tree-meta-pill" title="Total Members">
                    <span class="tree-meta-icon">${QrewUI.getIcon('users')}</span>
                    <span>${tenantMembers.length} member${tenantMembers.length === 1 ? '' : 's'}</span>
                  </span>
                </div>

                <!-- Col 4: Status -->
                <div class="tree-col-status">
                  ${QrewUI.statusBadge(t.status)}
                </div>

                <!-- Col 5: Created Date -->
                <div class="tree-col-date" title="Organization Created Date">
                  <span>Est. ${t.createdAt || '2026-09-12'}</span>
                </div>

                <!-- Col 6: Actions (Edit & Suspend direct action icons) -->
                <div class="tree-col-actions" onclick="event.stopPropagation()">
                  <button class="action-icon-btn edit-tenant-btn" data-id="${t.id}" title="Edit Organization" aria-label="Edit Organization">
                    ${QrewUI.getIcon('edit')}
                  </button>
                  <button class="action-icon-btn warning suspend-tenant-btn" data-id="${t.id}" data-name="${QrewUI.escapeHtml(t.name)}" title="Suspend Organization" aria-label="Suspend Organization">
                    ${QrewUI.getIcon('pause')}
                  </button>
                </div>
              </div>

              <!-- Child Offices Under Tenant -->
              ${isTenantExpanded ? `
                <div class="tree-branch-container nested-offices-branch">
                  ${filteredOffices.length === 0 ? `
                    <div style="padding:14px 18px;background:var(--color-surface-white);border:1px dashed var(--color-border);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:space-between;">
                      <span style="color:var(--color-text-muted);font-size:12.5px;">
                        ${filter ? `No offices match "${QrewUI.escapeHtml(filter)}"` : 'No offices created yet under this organization.'}
                      </span>
                      <button class="btn btn-secondary btn-sm create-office-tenant-btn" data-tenant-id="${t.id}">
                        ${QrewUI.getIcon('plus')} Add Office
                      </button>
                    </div>
                  ` : filteredOffices.map(off => `
                    <div class="tree-office-item" data-id="${off.id}">
                      <!-- Col 1: Identity (Plain text, not linked to any page) -->
                      <div class="tree-col-identity">
                        <span class="tree-branch-connector" aria-hidden="true"></span>
                        <div class="tree-office-icon-wrap" aria-hidden="true" title="Facility Branch">
                          ${QrewUI.getIcon('building2') || QrewUI.getIcon('building')}
                        </div>
                        <div class="tree-title-group">
                          <span class="tree-entity-name tree-office-text" title="Branch Facility">
                            ${QrewUI.escapeHtml(off.name)}
                          </span>
                          <span class="tree-id-badge" title="Branch Office Identifier">${off.id}</span>
                        </div>
                      </div>

                      <!-- Col 2: Location Detail -->
                      <div class="tree-col-detail">
                        <span class="tree-meta-icon">${QrewUI.getIcon('mapPin')}</span>
                        <span class="tree-meta-value" title="${QrewUI.escapeHtml(off.location || 'Location Not Specified')}">${QrewUI.escapeHtml(off.location || 'Location Not Specified')}</span>
                      </div>

                      <!-- Col 3: Staff Count -->
                      <div class="tree-col-stats">
                        <span class="tree-meta-pill" title="Deployed Staff Members">
                          <span class="tree-meta-icon">${QrewUI.getIcon('users')}</span>
                          <span>${off.staffCount} staff member${off.staffCount === 1 ? '' : 's'}</span>
                        </span>
                      </div>

                      <!-- Col 4: Status -->
                      <div class="tree-col-status">
                        ${QrewUI.statusBadge(off.status)}
                      </div>

                      <!-- Col 5: Created Date -->
                      <div class="tree-col-date" title="Office Created Date">
                        <span>Est. ${off.createdAt || '2026-09-15'}</span>
                      </div>

                      <!-- Col 6: Actions (Direct Office Config gear icon) -->
                      <div class="tree-col-actions" onclick="event.stopPropagation()">
                        <a href="#office-config?tenantId=${t.id}&officeId=${off.id}" class="action-icon-btn office-config-btn" title="Office Config" aria-label="Office Config">
                          ${QrewUI.getIcon('settings')}
                        </a>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      `;

      // Wire Event Handlers
      const closeOpenMenus = () => {
        document.querySelectorAll('.tree-action-menu.show').forEach(m => {
          m.classList.remove('show');
          const card = m.closest('.tree-tenant-card') || m.closest('.tree-office-item');
          if (card) card.style.zIndex = '';
        });
      };

      treeListEl.querySelectorAll('.tree-dropdown-trigger').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const targetMenuId = btn.dataset.dropdown;
          const targetMenu = document.getElementById(targetMenuId);
          const wasOpen = targetMenu && targetMenu.classList.contains('show');

          closeOpenMenus();

          if (!wasOpen && targetMenu) {
            targetMenu.classList.add('show');
            const card = targetMenu.closest('.tree-tenant-card') || targetMenu.closest('.tree-office-item');
            if (card) card.style.zIndex = '50';
          }
        };
      });

      // Click on empty space of first layer (.tree-tenant-row) to collapse / expand folder
      treeListEl.querySelectorAll('.tree-tenant-row').forEach(row => {
        row.onclick = (e) => {
          if (e.target.closest('button, a, input, select, .tree-col-actions, .tree-owner-link, .tree-tenant-link')) {
            return;
          }
          const tid = row.dataset.tenantId;
          if (platformTenantTreeState.expandedTenants.has(tid)) {
            platformTenantTreeState.expandedTenants.delete(tid);
          } else {
            platformTenantTreeState.expandedTenants.add(tid);
          }
          renderTreeNodes();
        };
      });

      treeListEl.querySelectorAll('.tree-folder-toggle-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const tid = btn.dataset.tenantId;
          if (platformTenantTreeState.expandedTenants.has(tid)) {
            platformTenantTreeState.expandedTenants.delete(tid);
          } else {
            platformTenantTreeState.expandedTenants.add(tid);
          }
          renderTreeNodes();
        };

        btn.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
          }
        };
      });

      treeListEl.querySelectorAll('.tree-owner-link').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          closeOpenMenus();
          openOwnerProfileModal(btn.dataset.tenantId);
        };
      });

      treeListEl.querySelectorAll('.edit-tenant-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          closeOpenMenus();
          openEditTenantModal(btn.dataset.id);
        };
      });

      treeListEl.querySelectorAll('.suspend-tenant-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          closeOpenMenus();
          handleSuspendTenant(btn.dataset.id, btn.dataset.name);
        };
      });

      treeListEl.querySelectorAll('.edit-office-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          closeOpenMenus();
          Qrew.actions.openEditOfficeModal(btn.dataset.id);
        };
      });

      treeListEl.querySelectorAll('.toggle-office-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          closeOpenMenus();
          Qrew.actions.handleToggleOfficeStatus(btn.dataset.id, btn.dataset.status);
        };
      });

      treeListEl.querySelectorAll('.delete-office-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          closeOpenMenus();
          Qrew.actions.handleDeleteOffice(btn.dataset.id, btn.dataset.name, btn.dataset.tenantId);
        };
      });

      treeListEl.querySelectorAll('.create-office-tenant-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          closeOpenMenus();
          Qrew.actions.openCreateOfficeModal(btn.dataset.tenantId);
        };
      });
    };

    const suspendedCount = allTenants.filter(t => t.status === 'Suspended').length;

    Qrew.dom.mainContent.innerHTML = `
      <div class="page-header" style="margin-bottom:20px;">
        <div class="page-title-group">
          <h1 class="page-title">All Tenants</h1>
        </div>
        <div class="page-actions" style="display:flex;align-items:center;gap:10px;">
          <a href="#platform/archive" class="btn btn-secondary" id="btn-view-archive" title="View Suspended & Archived Organizations" style="display:inline-flex;align-items:center;gap:6px;">
            ${QrewUI.getIcon('archive')}
            <span>Archive</span>
            ${suspendedCount > 0 ? `<span class="badge badge-suspended" style="padding:1px 6px;font-size:11px;line-height:1.2;">${suspendedCount}</span>` : ''}
          </a>
          <button class="btn btn-primary" id="btn-create-tenant">
            ${QrewUI.getIcon('plus')} Create Tenant
          </button>
        </div>
      </div>

      <div class="tree-view-wrapper">
        <!-- Tree Toolbar -->
        <div class="tree-toolbar">
          <div class="tree-toolbar-left" style="display:flex;align-items:center;gap:12px;flex:1;max-width:540px;">
            <div class="tree-search-wrap" style="flex:1;">
              <span class="tree-search-icon">${QrewUI.getIcon('search')}</span>
              <input type="text" class="tree-search-input" id="tenant-tree-search" placeholder="Search offices, IDs, or locations..." value="${QrewUI.escapeHtml(platformTenantTreeState.searchTerm)}">
            </div>
            <select class="select-filter" id="tenant-tree-status-filter" style="min-width:130px;height:34px;padding:4px 10px;font-size:12.5px;">
              <option value="All" ${platformTenantTreeState.statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
              <option value="Active" ${platformTenantTreeState.statusFilter === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Trial" ${platformTenantTreeState.statusFilter === 'Trial' ? 'selected' : ''}>Trial</option>
              <option value="Expired" ${platformTenantTreeState.statusFilter === 'Expired' ? 'selected' : ''}>Expired</option>
              <option value="Pending" ${platformTenantTreeState.statusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Suspended" ${platformTenantTreeState.statusFilter === 'Suspended' ? 'selected' : ''}>Suspended</option>
              <option value="Cancelled" ${platformTenantTreeState.statusFilter === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>

          <div class="tree-toolbar-actions">
            <span class="tree-meta-badge" id="tenants-stats-badge" style="background:var(--color-surface);color:var(--color-text-muted);border:1px solid var(--color-border);font-size:12px;padding:5px 10px;">
              ${allTenants.length} Tenant${allTenants.length === 1 ? '' : 's'} • ${totalOfficesCount} Offices
            </span>
          </div>
        </div>

        <!-- Tree Nodes List -->
        <div class="tree-root-list" id="tenants-tree-list"></div>
      </div>
    `;

    document.getElementById('btn-create-tenant').onclick = openCreateTenantModal;

    const searchInput = document.getElementById('tenant-tree-search');
    const statusFilter = document.getElementById('tenant-tree-status-filter');

    if (searchInput) {
      searchInput.oninput = (e) => {
        platformTenantTreeState.searchTerm = e.target.value;
        renderTreeNodes();
      };
    }

    if (statusFilter) {
      statusFilter.onchange = (e) => {
        platformTenantTreeState.statusFilter = e.target.value;
        renderTreeNodes();
      };
    }

    renderTreeNodes();
  };

  /* ==========================================================================
     GitHub-Style Delete Confirmation Modal (Requires Owner Email Match)
     ========================================================================== */
  const openGithubDeleteModal = (tenantId) => {
    const tenant = QrewStore.getTenantById(tenantId);
    if (!tenant) return;

    const ownerEmail = (tenant.ownerEmail || 'rafiq@sst.com').trim();
    const offices = QrewStore.getOfficesByTenant(tenantId) || [];
    const members = QrewStore.getTenantMembers(tenantId) || [];

    QrewUI.openModal({
      title: 'Permanently Delete Organization',
      bodyHtml: `
        <div style="display:flex;flex-direction:column;gap:16px;">
          <!-- Danger Alert Banner -->
          <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.28);border-radius:var(--radius-sm);padding:14px 16px;display:flex;gap:12px;align-items:flex-start;">
            <div style="color:var(--color-danger);flex-shrink:0;margin-top:2px;">
              ${QrewUI.getIcon('alert')}
            </div>
            <div style="font-size:13px;line-height:1.5;color:var(--color-text-primary);">
              <div style="font-weight:600;color:var(--color-danger);margin-bottom:4px;">
                Warning: This action cannot be undone
              </div>
              This will permanently delete <strong>${QrewUI.escapeHtml(tenant.name)}</strong> (${tenant.id}), including 
              <strong>${offices.length} branch office${offices.length === 1 ? '' : 's'}</strong> and 
              <strong>${members.length} member assignment${members.length === 1 ? '' : 's'}</strong>.
            </div>
          </div>

          <!-- Prompt Text -->
          <div style="font-size:13.5px;color:var(--color-text-primary);line-height:1.5;">
            To confirm deletion, please enter the owner email address below:
            <div style="margin-top:8px;padding:8px 12px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-sm);font-family:monospace;font-size:13px;font-weight:600;color:var(--color-text-primary);user-select:all;display:inline-block;">
              ${QrewUI.escapeHtml(ownerEmail)}
            </div>
          </div>

          <!-- Email Input Field -->
          <div class="form-group" style="margin:0;">
            <label class="form-label" for="github-delete-email-input" style="font-size:12.5px;font-weight:500;">
              Type the owner's email to proceed:
            </label>
            <input 
              type="text" 
              id="github-delete-email-input" 
              class="form-input" 
              placeholder="${QrewUI.escapeHtml(ownerEmail)}" 
              autocomplete="off" 
              spellcheck="false"
              style="width:100%;font-family:monospace;font-size:13px;"
            />
            <div id="github-delete-feedback" style="font-size:11.5px;margin-top:6px;min-height:16px;color:var(--color-text-muted);">
              Enter exact email address to enable the delete button.
            </div>
          </div>
        </div>
      `,
      footerHtml: `
        <div style="display:flex;align-items:center;justify-content:flex-end;gap:10px;width:100%;">
          <button class="btn btn-secondary" id="github-delete-cancel-btn">Cancel</button>
          <button class="btn btn-danger disabled" id="github-delete-confirm-btn" disabled style="opacity:0.45;cursor:not-allowed;">
            ${QrewUI.getIcon('trash')} I understand, delete this organization
          </button>
        </div>
      `
    });

    const inputEl = document.getElementById('github-delete-email-input');
    const confirmBtn = document.getElementById('github-delete-confirm-btn');
    const cancelBtn = document.getElementById('github-delete-cancel-btn');
    const feedbackEl = document.getElementById('github-delete-feedback');

    if (cancelBtn) {
      cancelBtn.onclick = () => QrewUI.closeModal();
    }

    if (inputEl && confirmBtn) {
      setTimeout(() => inputEl.focus(), 60);

      inputEl.oninput = () => {
        const val = inputEl.value.trim().toLowerCase();
        const expected = ownerEmail.toLowerCase();
        if (val === expected) {
          confirmBtn.removeAttribute('disabled');
          confirmBtn.classList.remove('disabled');
          confirmBtn.style.opacity = '1';
          confirmBtn.style.cursor = 'pointer';
          if (feedbackEl) {
            feedbackEl.textContent = '✓ Email matches. You may now permanently delete.';
            feedbackEl.style.color = 'var(--color-accent)';
          }
        } else {
          confirmBtn.setAttribute('disabled', 'true');
          confirmBtn.classList.add('disabled');
          confirmBtn.style.opacity = '0.45';
          confirmBtn.style.cursor = 'not-allowed';
          if (feedbackEl) {
            feedbackEl.textContent = val.length > 0 ? 'Email address does not match.' : 'Enter exact email address to enable the delete button.';
            feedbackEl.style.color = val.length > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)';
          }
        }
      };

      confirmBtn.onclick = () => {
        const val = inputEl.value.trim().toLowerCase();
        if (val !== ownerEmail.toLowerCase()) return;

        try {
          QrewStore.deleteTenant(tenantId);
          QrewUI.closeModal();
          QrewUI.showToast(`Organization "${tenant.name}" permanently deleted.`, 'success');

          // Reset selection if active tenant was deleted
          const remaining = QrewStore.getTenants();
          if (Qrew.state.currentTenantId === tenantId) {
            Qrew.state.currentTenantId = remaining.length > 0 ? remaining[0].id : '';
            const remainingOffices = Qrew.state.currentTenantId ? QrewStore.getOfficesByTenant(Qrew.state.currentTenantId) : [];
            Qrew.state.currentOfficeId = remainingOffices.length > 0 ? remainingOffices[0].id : '';
          }

          // Re-render Archive if on Archive view
          if (Qrew.views.platform && Qrew.views.platform.renderArchive) {
            renderArchive();
          }
        } catch (err) {
          QrewUI.showToast(err.message, 'error');
        }
      };
    }
  };

  /* ==========================================================================
     Archive Page View: Manage Suspended Organizations
     ========================================================================== */
  const renderArchive = () => {
    let archiveSearchTerm = '';

    const renderArchiveList = () => {
      const allTenants = QrewStore.getTenants();
      const suspendedTenants = allTenants.filter(t => t.status === 'Suspended');
      const containerEl = document.getElementById('archive-tenants-list');
      const counterEl = document.getElementById('archive-stats-badge');
      if (!containerEl) return;

      const term = archiveSearchTerm.toLowerCase().trim();
      const filtered = suspendedTenants.filter(t => {
        if (!term) return true;
        return t.name.toLowerCase().includes(term) ||
          t.id.toLowerCase().includes(term) ||
          (t.ownerName && t.ownerName.toLowerCase().includes(term)) ||
          (t.ownerEmail && t.ownerEmail.toLowerCase().includes(term));
      });

      if (counterEl) {
        counterEl.textContent = `${filtered.length} Archived Organization${filtered.length === 1 ? '' : 's'}`;
      }

      if (filtered.length === 0) {
        containerEl.innerHTML = `
          <div style="padding:48px 24px;background:var(--color-surface-white);border:1px dashed var(--color-border);border-radius:var(--radius-md);text-align:center;">
            <div style="width:48px;height:48px;margin:0 auto 14px;border-radius:50%;background:var(--color-surface);display:flex;align-items:center;justify-content:center;color:var(--color-text-muted);">
              ${QrewUI.getIcon('archive')}
            </div>
            <h3 style="font-size:16px;font-weight:600;color:var(--color-text-primary);margin-bottom:6px;">
              ${term ? `No archived organizations match "${QrewUI.escapeHtml(term)}"` : 'No Archived Organizations'}
            </h3>
            <p style="color:var(--color-text-muted);font-size:13px;max-width:440px;margin:0 auto 16px;">
              ${term ? 'Try searching by organization name, ID, or owner email.' : 'Suspended tenant organizations will be listed here. You can reactivate them or permanently delete them.'}
            </p>
            <a href="#platform/tenants" class="btn btn-primary btn-sm" style="display:inline-flex;align-items:center;gap:6px;">
              ${QrewUI.getIcon('tenants')} Go to Active Tenants
            </a>
          </div>
        `;
        return;
      }

      containerEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${filtered.map(t => {
            const offices = QrewStore.getOfficesByTenant(t.id) || [];
            const members = QrewStore.getTenantMembers(t.id) || [];
            const ownerEmail = t.ownerEmail || 'rafiq@sst.com';
            const ownerName = t.ownerName || 'Rafiqul Islam';

            return `
              <div class="archive-tenant-card" style="background:var(--color-surface-white);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;transition:var(--transition-fast);">
                <!-- Left: Identity & Owner Info -->
                <div style="display:flex;align-items:center;gap:16px;min-width:0;flex:1;">
                  <div style="width:40px;height:40px;border-radius:var(--radius-sm);background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;color:var(--color-danger);flex-shrink:0;">
                    ${QrewUI.getIcon('archive')}
                  </div>
                  <div style="min-width:0;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
                      <span style="font-size:15px;font-weight:600;color:var(--color-text-primary);">${QrewUI.escapeHtml(t.name)}</span>
                      <span class="tree-id-badge">${t.id}</span>
                      <span class="badge badge-suspended"><span class="badge-dot"></span>Suspended</span>
                      <span class="badge" style="background:var(--color-surface);color:var(--color-text-muted);border:1px solid var(--color-border);font-size:11px;">Plan: ${t.plan || 'Enterprise'}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:14px;font-size:12.5px;color:var(--color-text-muted);flex-wrap:wrap;">
                      <span style="display:inline-flex;align-items:center;gap:5px;">
                        ${QrewUI.getIcon('users')} Owner: <strong style="color:var(--color-text-primary);">${QrewUI.escapeHtml(ownerName)}</strong> (${QrewUI.escapeHtml(ownerEmail)})
                      </span>
                      <span>•</span>
                      <span>${offices.length} office${offices.length === 1 ? '' : 's'}</span>
                      <span>•</span>
                      <span>${members.length} member${members.length === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                </div>

                <!-- Right: Action Buttons -->
                <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
                  <button class="btn btn-secondary btn-sm restore-tenant-btn" data-id="${t.id}" data-name="${QrewUI.escapeHtml(t.name)}" title="Reactivate this organization" style="display:inline-flex;align-items:center;gap:6px;">
                    ${QrewUI.getIcon('play')} <span>Restore</span>
                  </button>
                  <button class="btn btn-danger btn-sm archive-delete-btn" data-id="${t.id}" data-name="${QrewUI.escapeHtml(t.name)}" title="Permanently delete this organization" style="display:inline-flex;align-items:center;gap:6px;">
                    ${QrewUI.getIcon('trash')} <span>Delete</span>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Wire Restore button
      containerEl.querySelectorAll('.restore-tenant-btn').forEach(btn => {
        btn.onclick = () => {
          const tid = btn.dataset.id;
          const tname = btn.dataset.name;
          QrewUI.confirmDialog({
            title: 'Restore Organization',
            message: `Reactivate organization "${tname}"? This will restore active operational access for this tenant and its facilities.`,
            confirmText: 'Restore to Active',
            confirmClass: 'btn-primary',
            onConfirm: () => {
              QrewStore.updateTenant(tid, { status: 'Active' });
              QrewUI.showToast(`Organization "${tname}" restored to Active.`, 'success');
              renderArchive();
            }
          });
        };
      });

      // Wire Delete button -> GitHub style delete modal
      containerEl.querySelectorAll('.archive-delete-btn').forEach(btn => {
        btn.onclick = () => {
          openGithubDeleteModal(btn.dataset.id);
        };
      });
    };

    const initialSuspended = QrewStore.getTenants().filter(t => t.status === 'Suspended');

    Qrew.dom.mainContent.innerHTML = `
      <div class="page-header" style="margin-bottom:20px;">
        <div class="page-title-group">
          <h1 class="page-title">Archived Organizations</h1>
        </div>
        <div class="page-actions">
          <a href="#platform/tenants" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:6px;">
            ${QrewUI.getIcon('tenants')} Active Tenants
          </a>
        </div>
      </div>

      <div class="tree-view-wrapper">
        <div class="tree-toolbar">
          <div class="tree-toolbar-left" style="display:flex;align-items:center;gap:12px;flex:1;max-width:540px;">
            <div class="tree-search-wrap" style="flex:1;">
              <span class="tree-search-icon">${QrewUI.getIcon('search')}</span>
              <input type="text" class="tree-search-input" id="archive-search-input" placeholder="Search archived organizations by name, ID, or owner email..." />
            </div>
          </div>
          <div class="tree-toolbar-actions">
            <span class="tree-meta-badge" id="archive-stats-badge" style="background:var(--color-surface);color:var(--color-text-muted);border:1px solid var(--color-border);font-size:12px;padding:5px 10px;">
              ${initialSuspended.length} Archived Organization${initialSuspended.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div id="archive-tenants-list" style="padding:16px 0;"></div>
      </div>
    `;

    const searchInput = document.getElementById('archive-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        archiveSearchTerm = e.target.value;
        renderArchiveList();
      };
    }

    renderArchiveList();
  };

  Qrew.views.platform.renderTenants = renderPlatformTenants;
  Qrew.views.platform.renderArchive = renderArchive;
  Qrew.actions.openCreateTenantModal = openCreateTenantModal;
  Qrew.actions.openEditTenantModal = openEditTenantModal;
  Qrew.actions.handleSuspendTenant = handleSuspendTenant;
  Qrew.actions.handleToggleTenantStatus = handleToggleTenantStatus;
  Qrew.actions.handleDeleteTenant = handleDeleteTenant;
  Qrew.actions.openGithubDeleteModal = openGithubDeleteModal;
})();
