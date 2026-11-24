/**
 * Interface: Office Workspace — Financials Dashboard
 * Matches Reference UI (qrew-six.vercel.app/dashboard/financials)
 * - Expenses Tab Columns: 'File / Project' -> 'Spent By' -> 'Category' -> 'Description' -> 'Date' -> 'Amount'
 * - Requisitions Tab Columns: 'Requested By' -> 'Amount' -> 'Date' -> 'File / Project' -> 'Status' -> 'Actions'
 * - Actions Column: 'Action' & 'Action & Disburse' (with Overwrite Amount, Live Preview, and Final Approve)
 */
(() => {
  const Qrew = window.Qrew;

  if (!Qrew.views.office) {
    Qrew.views.office = {};
  }

  // Module state
  const state = {
    activeTab: 'requisitions', // Default to requisitions or maintain current tab
    searchTerm: '',
    currentOfficeId: null,
    currentTenantId: null
  };

  /**
   * Currency formatter helper
   */
  const formatMoney = (amount, symbol = '$') => {
    return `${symbol}${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  /**
   * Status badge helper for requisitions
   */
  const getRequisitionBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'disbursed') {
      return `<span class="badge badge-active" style="color:var(--color-success);font-weight:700;"><span class="badge-dot"></span>Disbursed</span>`;
    } else if (s === 'approved') {
      return `<span class="badge badge-active"><span class="badge-dot"></span>Approved</span>`;
    } else if (s === 'pending') {
      return `<span class="badge badge-pending"><span class="badge-dot"></span>Pending</span>`;
    } else if (s === 'rejected') {
      return `<span class="badge badge-expired"><span class="badge-dot"></span>Rejected</span>`;
    }
    return `<span class="badge badge-pending">${QrewUI.escapeHtml(status)}</span>`;
  };

  /**
   * Main Financials View Renderer
   */
  Qrew.views.office.renderFinancials = (officeId, tenantId) => {
    state.currentOfficeId = officeId || Qrew.state.currentOfficeId || 'off_ctg_port';
    state.currentTenantId = tenantId || Qrew.state.currentTenantId || 'ten_sst';

    const office = QrewStore.getOfficeById(state.currentOfficeId);
    const expenses = QrewStore.getOfficeExpenses(state.currentOfficeId);
    const requisitions = QrewStore.getOfficeRequisitions(state.currentOfficeId);
    const wallets = QrewStore.getOfficeWallets(state.currentOfficeId);

    // Filter expenses by search if present
    const filteredExpenses = expenses.filter(exp => {
      if (!state.searchTerm) return true;
      const q = state.searchTerm.toLowerCase();
      return (exp.fileProject && exp.fileProject.toLowerCase().includes(q)) ||
        (exp.spentBy && exp.spentBy.toLowerCase().includes(q)) ||
        (exp.category && exp.category.toLowerCase().includes(q)) ||
        (exp.description && exp.description.toLowerCase().includes(q));
    });

    // Render HTML shell matching the reference image layout
    Qrew.dom.mainContent.innerHTML = `
      <div class="financials-dashboard" style="max-width: 1200px; margin: 0 auto; padding: 4px 0 32px 0;">
        
        <!-- Header Section -->
        <div class="financials-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 class="page-title" style="font-size: 26px; font-weight: 700; color: var(--color-text-primary); margin: 0 0 6px 0;">
              Financials Dashboard
            </h1>
            <p style="font-size: 14px; color: var(--color-text-muted); margin: 0;">
              Manage organizational expenses and fund requisitions.
            </p>
          </div>

          <!-- Top-right Action Buttons -->
          <div class="header-actions" style="display: flex; align-items: center; gap: 12px;">
            <button class="btn btn-secondary" id="btn-request-funds" style="padding: 8px 16px; font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Request Funds
            </button>
            <button class="btn" id="btn-log-expense" style="background-color: #059669; color: #FFFFFF; border: 1px solid #059669; padding: 8px 16px; font-size: 13px; font-weight: 600; border-radius: var(--radius-sm); display: inline-flex; align-items: center; gap: 6px; box-shadow: var(--shadow-xs);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Log Expense
            </button>
          </div>
        </div>

        <!-- Sub-navigation Tabs (Pill style matching reference image) -->
        <div class="tabs-container" style="display: inline-flex; background: var(--color-surface, #F1F5F9); padding: 4px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--color-border-subtle, #E2E8F0);">
          <button class="tab-pill ${state.activeTab === 'expenses' ? 'active' : ''}" id="tab-expenses" style="padding: 6px 16px; font-size: 13px; font-weight: 500; border: none; cursor: pointer; border-radius: 6px; transition: all 0.15s ease; ${state.activeTab === 'expenses' ? 'background: #FFFFFF; color: var(--color-text-primary); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08);' : 'background: transparent; color: var(--color-text-muted);'}">
            Expenses
          </button>
          <button class="tab-pill ${state.activeTab === 'requisitions' ? 'active' : ''}" id="tab-requisitions" style="padding: 6px 16px; font-size: 13px; font-weight: 500; border: none; cursor: pointer; border-radius: 6px; transition: all 0.15s ease; ${state.activeTab === 'requisitions' ? 'background: #FFFFFF; color: var(--color-text-primary); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08);' : 'background: transparent; color: var(--color-text-muted);'}">
            Requisitions
          </button>
          <button class="tab-pill ${state.activeTab === 'wallets' ? 'active' : ''}" id="tab-wallets" style="padding: 6px 16px; font-size: 13px; font-weight: 500; border: none; cursor: pointer; border-radius: 6px; transition: all 0.15s ease; ${state.activeTab === 'wallets' ? 'background: #FFFFFF; color: var(--color-text-primary); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08);' : 'background: transparent; color: var(--color-text-muted);'}">
            Wallets
          </button>
        </div>

        <!-- TAB 1: EXPENSES TABLE -->
        <!-- Titles order: 'File / Project' -> 'Spent By' -> 'Category' -> 'Description' -> 'Date' -> 'Amount' -->
        <div id="content-expenses" style="${state.activeTab === 'expenses' ? 'display:block;' : 'display:none;'}">
          <div class="card" style="background: var(--color-surface-white, #FFFFFF); border: 1px solid var(--color-border, #E2E8F0); border-radius: var(--radius-md, 8px); overflow: hidden; box-shadow: var(--shadow-xs);">
            ${filteredExpenses.length === 0 ? `
              <div style="padding: 80px 20px; text-align: center; color: var(--color-text-muted);">
                <p style="font-size: 14px; margin: 0; color: var(--color-text-muted);">No expenses found.</p>
              </div>
            ` : `
              <div class="table-responsive" style="overflow-x: auto; width: 100%;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed; min-width: 980px;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--color-border, #E2E8F0); background: var(--color-surface, #F8FAFC); font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: var(--color-text-muted);">
                      <th style="padding: 12px 16px; width: 24%; text-align: center;">File / Project</th>
                      <th style="padding: 12px 16px; width: 15%; text-align: center;">Spent By</th>
                      <th style="padding: 12px 16px; width: 19%; text-align: center;">Category</th>
                      <th style="padding: 12px 16px; width: 22%; text-align: center;">Description</th>
                      <th style="padding: 12px 16px; width: 10%; text-align: center;">Date</th>
                      <th style="padding: 12px 16px; width: 6%; text-align: center;">Amount</th>
                      <th style="padding: 12px 10px; width: 4%; text-align: center;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredExpenses.map(exp => `
                      <tr style="border-bottom: 1px solid var(--color-border-subtle, #F1F5F9); transition: background 0.15s ease;" onmouseover="this.style.backgroundColor='var(--color-surface)'" onmouseout="this.style.backgroundColor='transparent'">
                        
                        <!-- 1. File / Project -->
                        <td style="padding: 14px 16px; vertical-align: middle; overflow: hidden; text-align: center;">
                          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; overflow: hidden;">
                            <span style="color: var(--panel-accent, var(--color-accent)); flex-shrink: 0;">${QrewUI.getIcon('folder')}</span>
                            <span style="font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${QrewUI.escapeHtml(exp.fileProject)}">
                              ${QrewUI.escapeHtml(exp.fileProject)}
                            </span>
                          </div>
                        </td>

                        <!-- 2. Spent By -->
                        <td style="padding: 14px 16px; vertical-align: middle; white-space: nowrap; text-align: center;">
                          <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <div style="width: 26px; height: 26px; border-radius: 50%; background: var(--color-surface); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--color-text-primary); flex-shrink: 0;">
                              ${exp.spentBy ? exp.spentBy.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span style="font-weight: 500; color: var(--color-text-primary);">${QrewUI.escapeHtml(exp.spentBy)}</span>
                          </div>
                        </td>

                        <!-- 3. Category -->
                        <td style="padding: 14px 16px; vertical-align: middle; white-space: nowrap; text-align: center;">
                          <span class="badge-role office" style="font-size: 11px; padding: 4px 10px; border-radius: 4px; background: var(--color-surface); border: 1px solid var(--color-border); white-space: nowrap; display: inline-block;">
                            ${QrewUI.escapeHtml(exp.category)}
                          </span>
                        </td>

                        <!-- 4. Description -->
                        <td style="padding: 14px 16px; vertical-align: middle; color: var(--color-text-secondary); line-height: 1.4; overflow: hidden; text-align: center;">
                          <div style="overflow: hidden; text-overflow: ellipsis; white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; text-align: center;" title="${QrewUI.escapeHtml(exp.description)}">
                            ${QrewUI.escapeHtml(exp.description)}
                          </div>
                        </td>

                        <!-- 5. Date -->
                        <td style="padding: 14px 16px; vertical-align: middle; color: var(--color-text-muted); font-size: 12px; white-space: nowrap; text-align: center;">
                          ${exp.date}
                        </td>

                        <!-- 6. Amount -->
                        <td style="padding: 14px 16px; vertical-align: middle; text-align: center; font-weight: 700; color: var(--color-text-primary); font-size: 13px; white-space: nowrap;">
                          ${formatMoney(exp.amount, '$')}
                        </td>

                        <!-- 7. Action / Delete -->
                        <td style="padding: 14px 10px; vertical-align: middle; text-align: center;">
                          <button class="btn btn-secondary btn-icon btn-danger-light" style="padding: 5px 7px; font-size: 11px; border: none; cursor: pointer; border-radius: 4px;" onclick="Qrew.views.office.deleteExpensePrompt('${exp.id}')" title="Delete Expense">
                            ${QrewUI.getIcon('trash')}
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>

        <!-- TAB 2: REQUISITIONS TABLE -->
        <!-- Titles order matching screenshot: 'Requested By' -> 'Amount' -> 'Date' -> 'File / Project' -> 'Status' -> 'Actions' -->
        <div id="content-requisitions" style="${state.activeTab === 'requisitions' ? 'display:block;' : 'display:none;'}">
          <div class="card" style="background: var(--color-surface-white, #FFFFFF); border: 1px solid var(--color-border, #E2E8F0); border-radius: var(--radius-md, 8px); overflow: hidden; box-shadow: var(--shadow-xs);">
            ${requisitions.length === 0 ? `
              <div style="padding: 80px 20px; text-align: center; color: var(--color-text-muted);">
                <p style="font-size: 14px; margin: 0; color: var(--color-text-muted);">No requisitions found.</p>
              </div>
            ` : `
              <div class="table-responsive" style="overflow-x: auto; width: 100%;">
                <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed; min-width: 980px;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--color-border, #E2E8F0); background: var(--color-surface, #F8FAFC); font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: var(--color-text-muted);">
                      <th style="padding: 12px 16px; width: 18%; text-align: center;">Requested By</th>
                      <th style="padding: 12px 16px; width: 11%; text-align: center;">Amount</th>
                      <th style="padding: 12px 16px; width: 10%; text-align: center;">Date</th>
                      <th style="padding: 12px 16px; width: 26%; text-align: center;">File / Project</th>
                      <th style="padding: 12px 16px; width: 11%; text-align: center;">Status</th>
                      <th style="padding: 12px 16px; width: 24%; text-align: center;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${requisitions.map(req => `
                      <tr style="border-bottom: 1px solid var(--color-border-subtle, #F1F5F9); transition: background 0.15s ease;" onmouseover="this.style.backgroundColor='var(--color-surface)'" onmouseout="this.style.backgroundColor='transparent'">
                        
                        <!-- 1. Requested By -->
                        <td style="padding: 14px 16px; vertical-align: middle; white-space: nowrap; text-align: center;">
                          <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                            <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--color-surface); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--color-text-primary); flex-shrink: 0;">
                              ${req.requestedBy ? req.requestedBy.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div style="text-align: left;">
                              <div style="font-weight: 600; color: var(--color-text-primary); font-size: 13px;">${QrewUI.escapeHtml(req.requestedBy)}</div>
                              <div style="font-size: 11px; color: var(--color-text-muted); font-family: monospace;">${QrewUI.escapeHtml(req.requisitionNo)}</div>
                            </div>
                          </div>
                        </td>

                        <!-- 2. Amount -->
                        <td style="padding: 14px 16px; vertical-align: middle; font-weight: 700; color: var(--color-text-primary); font-size: 14px; white-space: nowrap; text-align: center;">
                          ${formatMoney(req.amount)}
                          ${req.originalAmount && req.originalAmount !== req.amount ? `
                            <div style="font-size: 10px; color: var(--color-text-muted); text-decoration: line-through; font-weight: 400; text-align: center;">
                              orig: ${formatMoney(req.originalAmount)}
                            </div>
                          ` : ''}
                        </td>

                        <!-- 3. Date -->
                        <td style="padding: 14px 16px; vertical-align: middle; color: var(--color-text-muted); font-size: 12px; white-space: nowrap; text-align: center;">
                          ${req.date}
                        </td>

                        <!-- 4. File / Project -->
                        <td style="padding: 14px 16px; vertical-align: middle; overflow: hidden; text-align: center;">
                          <div style="font-weight: 600; color: var(--color-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center;" title="${QrewUI.escapeHtml(req.fileProject || 'General Operations')}">
                            ${QrewUI.escapeHtml(req.fileProject || 'General Operations')}
                          </div>
                          <div style="font-size: 11px; color: var(--color-text-muted); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center;" title="${QrewUI.escapeHtml(req.purpose || req.category)}">
                            ${QrewUI.escapeHtml(req.purpose || req.category)}
                          </div>
                        </td>

                        <!-- 5. Status -->
                        <td style="padding: 14px 16px; vertical-align: middle; text-align: center; white-space: nowrap;">
                          ${getRequisitionBadge(req.status)}
                        </td>

                        <!-- 6. Actions (Two Sections: 'Action' and 'Action & Disburse') -->
                        <td style="padding: 14px 16px; vertical-align: middle; text-align: center; white-space: nowrap;">
                          <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                            
                            <!-- Section 1: Standard Action Button / Menu -->
                            <button class="btn btn-secondary btn-action-preview" style="padding: 6px 12px; font-size: 12px; font-weight: 500;" onclick="Qrew.views.office.openActionModal('${req.id}')" title="Preview Requisition Details">
                              Action
                            </button>

                            <!-- Section 2: Action & Disburse Button (with amount override & approval) -->
                            ${req.status !== 'Disbursed' ? `
                              <button class="btn btn-action-disburse" style="background-color: #059669; color: #FFFFFF; border: 1px solid #059669; padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: var(--radius-sm); display: inline-flex; align-items: center; gap: 4px; box-shadow: var(--shadow-xs); white-space: nowrap;" onclick="Qrew.views.office.openActionDisburseModal('${req.id}')" title="Review, Overwrite Amount, Preview, and Final Approve">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                                Action & Disburse
                              </button>
                            ` : `
                              <button class="btn btn-secondary" style="padding: 6px 10px; font-size: 11px; color: var(--color-success); font-weight: 600; white-space: nowrap;" onclick="Qrew.views.office.openActionModal('${req.id}')">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                Disbursed
                              </button>
                            `}

                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>

        <!-- TAB 3: WALLETS -->
        <div id="content-wallets" style="${state.activeTab === 'wallets' ? 'display:block;' : 'display:none;'}">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px;">
            ${wallets.map(w => {
              const percent = w.monthlyLimit > 0 ? Math.min(100, Math.round((w.spentThisMonth / w.monthlyLimit) * 100)) : 0;
              return `
                <div class="card" style="background: var(--color-surface-white, #FFFFFF); border: 1px solid var(--color-border, #E2E8F0); border-radius: var(--radius-md, 8px); padding: 20px; box-shadow: var(--shadow-xs);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                    <div style="font-weight: 700; font-size: 15px; color: var(--color-text-primary);">${QrewUI.escapeHtml(w.name)}</div>
                    <div style="width: 32px; height: 32px; border-radius: 8px; background: ${w.color}15; color: ${w.color}; display: flex; align-items: center; justify-content: center;">
                      ${QrewUI.getIcon(w.icon || 'dollar')}
                    </div>
                  </div>

                  <div style="margin-bottom: 16px;">
                    <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-text-muted); font-weight: 600;">Available Balance</span>
                    <div style="font-size: 26px; font-weight: 800; color: var(--color-text-primary); margin-top: 2px;">
                      ${formatMoney(w.balance)}
                    </div>
                  </div>

                  <div style="border-top: 1px solid var(--color-border-subtle); padding-top: 14px; margin-bottom: 14px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                      <span style="color: var(--color-text-muted);">Monthly Spent</span>
                      <span style="font-weight: 600;">${formatMoney(w.spentThisMonth)} / ${formatMoney(w.monthlyLimit)}</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: var(--color-border); border-radius: 3px; overflow: hidden;">
                      <div style="width: ${percent}%; height: 100%; background: ${w.color}; border-radius: 3px;"></div>
                    </div>
                  </div>

                  <button class="btn btn-secondary" style="width: 100%; font-size: 12px; padding: 7px 12px;" onclick="Qrew.views.office.topUpWalletPrompt('${w.id}', '${QrewUI.escapeHtml(w.name)}')">
                    ${QrewUI.getIcon('plus')} Top Up Balance
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;

    // Attach Event Handlers
    attachHandlers();
  };

  /**
   * DOM Event Listeners
   */
  const attachHandlers = () => {
    // Tab switching
    const tabExpenses = document.getElementById('tab-expenses');
    const tabRequisitions = document.getElementById('tab-requisitions');
    const tabWallets = document.getElementById('tab-wallets');

    if (tabExpenses) {
      tabExpenses.onclick = () => {
        state.activeTab = 'expenses';
        Qrew.views.office.renderFinancials(state.currentOfficeId, state.currentTenantId);
      };
    }
    if (tabRequisitions) {
      tabRequisitions.onclick = () => {
        state.activeTab = 'requisitions';
        Qrew.views.office.renderFinancials(state.currentOfficeId, state.currentTenantId);
      };
    }
    if (tabWallets) {
      tabWallets.onclick = () => {
        state.activeTab = 'wallets';
        Qrew.views.office.renderFinancials(state.currentOfficeId, state.currentTenantId);
      };
    }

    // Top action buttons
    const logExpenseBtn = document.getElementById('btn-log-expense');
    if (logExpenseBtn) {
      logExpenseBtn.onclick = () => openLogExpenseModal();
    }

    const requestFundsBtn = document.getElementById('btn-request-funds');
    if (requestFundsBtn) {
      requestFundsBtn.onclick = () => openRequestFundsModal();
    }
  };

  /**
   * Action Section 1: Standard "Action" Modal
   * Displays full Requisition particulars, audit log, and reject/cancel option.
   */
  Qrew.views.office.openActionModal = (reqId) => {
    const requisitions = QrewStore.getOfficeRequisitions(state.currentOfficeId);
    const req = requisitions.find(r => r.id === reqId);
    if (!req) return;

    QrewUI.openModal({
      title: `Requisition Action — ${req.requisitionNo}`,
      bodyHtml: `
        <div style="font-size: 13px;">
          <!-- Meta Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: var(--color-surface); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); margin-bottom: 16px;">
            <div>
              <span style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Requested By</span>
              <div style="font-weight: 700; font-size: 14px; margin-top: 2px;">${QrewUI.escapeHtml(req.requestedBy)}</div>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Status</span>
              <div style="margin-top: 2px;">${getRequisitionBadge(req.status)}</div>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">File / Project</span>
              <div style="font-weight: 600; margin-top: 2px;">${QrewUI.escapeHtml(req.fileProject || 'General Operations')}</div>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Requisition Date</span>
              <div style="font-weight: 600; margin-top: 2px;">${req.date}</div>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Amount</span>
              <div style="font-size: 18px; font-weight: 800; color: var(--color-text-primary); margin-top: 2px;">${formatMoney(req.amount)}</div>
            </div>
            <div>
              <span style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Assigned Wallet</span>
              <div style="font-weight: 600; margin-top: 2px;">${QrewUI.escapeHtml(req.wallet || 'Operations Petty Cash')}</div>
            </div>
          </div>

          <!-- Purpose / Notes -->
          <div style="margin-bottom: 16px;">
            <label class="form-label">Purpose & Justification</label>
            <div style="background: var(--color-surface-white); border: 1px solid var(--color-border); padding: 12px; border-radius: var(--radius-sm); color: var(--color-text-secondary); line-height: 1.5;">
              ${QrewUI.escapeHtml(req.purpose || 'No description provided.')}
            </div>
          </div>

          ${req.disbursementRemarks ? `
            <div style="margin-bottom: 16px;">
              <label class="form-label">Disbursement Remarks</label>
              <div style="background: #ECFDF5; border: 1px solid #A7F3D0; padding: 10px; border-radius: var(--radius-sm); color: #065F46; font-size: 12px;">
                ${QrewUI.escapeHtml(req.disbursementRemarks)}
              </div>
            </div>
          ` : ''}
        </div>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="QrewUI.closeModal()">Close</button>
        ${req.status === 'Pending' ? `
          <button class="btn btn-danger-light" onclick="Qrew.views.office.rejectRequisitionPrompt('${req.id}')">
            Reject Requisition
          </button>
          <button class="btn" style="background-color: #059669; color: #FFFFFF; font-weight: 600;" onclick="QrewUI.closeModal(); Qrew.views.office.openActionDisburseModal('${req.id}')">
            Proceed to Action & Disburse &rarr;
          </button>
        ` : ''}
      `
    });
  };

  /**
   * Action Section 2: "Action & Disburse" Modal
   * Contains the two options requested:
   * 1. Overwrite the Amount (Admin can edit / overwrite the disbursement amount)
   * 2. Live Preview then Final Approve (Shows preview voucher, wallet impact, and triggers final approval)
   */
  Qrew.views.office.openActionDisburseModal = (reqId) => {
    const requisitions = QrewStore.getOfficeRequisitions(state.currentOfficeId);
    const req = requisitions.find(r => r.id === reqId);
    if (!req) return;

    const wallets = QrewStore.getOfficeWallets(state.currentOfficeId);
    let selectedWalletName = req.wallet || (wallets.length ? wallets[0].name : 'Operations Petty Cash');
    let currentDisburseAmount = req.amount;

    QrewUI.openModal({
      title: `Action & Disburse — ${req.requisitionNo}`,
      bodyHtml: `
        <div class="action-disburse-container" style="font-size: 13px; display: flex; flex-direction: column; gap: 16px;">
          
          <!-- Banner: Requisition Details summary -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--color-surface); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
            <div>
              <span style="font-size: 11px; text-transform: uppercase; color: var(--color-text-muted); font-weight: 600;">Requisition For</span>
              <div style="font-weight: 700; font-size: 14px;">${QrewUI.escapeHtml(req.requestedBy)}</div>
              <div style="font-size: 12px; color: var(--color-text-muted);">${QrewUI.escapeHtml(req.fileProject || 'General Operations')}</div>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 11px; text-transform: uppercase; color: var(--color-text-muted); font-weight: 600;">Original Requested</span>
              <div style="font-size: 16px; font-weight: 700; color: var(--color-text-primary);">${formatMoney(req.amount)}</div>
              <div style="font-size: 11px; color: var(--color-text-muted);">${req.date}</div>
            </div>
          </div>

          <!-- OPTION 1: ADMIN AMOUNT OVERWRITE SECTION -->
          <div class="option-card" style="border: 1px solid #CBD5E1; border-radius: var(--radius-md); padding: 16px; background: #F8FAFC;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <label class="form-label" style="font-weight: 700; margin: 0; color: #0F172A; display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Option 1: Overwrite Disbursed Amount
              </label>
              <span class="badge" style="background: #E0E7FF; color: #3730A3; font-weight: 600; font-size: 11px;">Admin Control</span>
            </div>
            <p style="font-size: 12px; color: var(--color-text-muted); margin: 0 0 12px 0;">
              You can adjust or overwrite the approved amount to be disbursed from the budget.
            </p>

            <div class="form-row" style="margin-bottom: 0;">
              <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label class="form-label" for="disburse-amount-input">Approved Disbursement Amount ($ USD) *</label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-weight: 700; color: var(--color-text-muted);">$</span>
                  <input type="number" step="0.01" min="0.01" id="disburse-amount-input" class="form-input" style="padding-left: 24px; font-size: 15px; font-weight: 700; color: var(--color-text-primary);" value="${req.amount}" required>
                </div>
                <div id="overwrite-notice" style="font-size: 11px; color: var(--color-text-muted); margin-top: 4px;">
                  Original requested: ${formatMoney(req.amount)} (Unchanged)
                </div>
              </div>

              <div class="form-group" style="flex: 1; margin-bottom: 0;">
                <label class="form-label" for="disburse-wallet-select">Source Wallet</label>
                <select id="disburse-wallet-select" class="form-input" style="font-size: 13px;">
                  ${wallets.map(w => `
                    <option value="${w.name}" data-balance="${w.balance}" ${w.name === selectedWalletName ? 'selected' : ''}>
                      ${w.name} ($${w.balance.toLocaleString()} available)
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- OPTION 2: LIVE PREVIEW & FINAL APPROVAL VOUCHER -->
          <div class="option-card" style="border: 1px solid #A7F3D0; border-radius: var(--radius-md); padding: 16px; background: #F0FDF4;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <label class="form-label" style="font-weight: 700; margin: 0; color: #065F46; display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16l3-1.5 3 1.5 3-1.5 3 1.5 3-1.5 3 1.5V4a2 2 0 0 0-2-2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/></svg>
                Option 2: Live Disbursement Preview & Final Approve
              </label>
              <span class="badge badge-active" style="font-weight: 700; font-size: 11px;">Preview Ready</span>
            </div>

            <!-- Preview Card -->
            <div id="disburse-voucher-preview" style="background: #FFFFFF; border: 1px solid #D1FAE5; border-radius: 6px; padding: 14px; font-size: 12px;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px; margin-bottom: 10px;">
                <div>
                  <div style="font-weight: 700; color: #0F172A; font-size: 13px;">DISBURSEMENT VOUCHER</div>
                  <div style="color: var(--color-text-muted);">Ref: ${req.requisitionNo}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 11px; color: var(--color-text-muted);">Authorization Date</div>
                  <div style="font-weight: 600;">${new Date().toISOString().split('T')[0]}</div>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                <div><strong>Payee:</strong> ${QrewUI.escapeHtml(req.requestedBy)}</div>
                <div><strong>File/Project:</strong> ${QrewUI.escapeHtml(req.fileProject || 'General')}</div>
                <div><strong>Source Wallet:</strong> <span id="preview-wallet-name">${selectedWalletName}</span></div>
                <div><strong>Purpose:</strong> ${QrewUI.escapeHtml(req.purpose || req.category || 'General Operations')}</div>
              </div>

              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; color: #1E293B;">Final Payable Amount:</span>
                <span id="preview-final-amount" style="font-size: 16px; font-weight: 800; color: #059669;">${formatMoney(req.amount)}</span>
              </div>
            </div>

            <!-- Remarks input -->
            <div style="margin-top: 12px;">
              <label class="form-label" for="disburse-remarks" style="font-size: 12px;">Approval & Disbursal Remarks (Optional)</label>
              <input type="text" id="disburse-remarks" class="form-input" style="font-size: 12px;" placeholder="e.g. Approved and authorized by Office Administration" value="Authorized for immediate disbursement.">
            </div>
          </div>

        </div>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="QrewUI.closeModal()">Cancel</button>
        <button class="btn" id="btn-final-approve-disburse" style="background-color: #059669; color: #FFFFFF; border: 1px solid #059669; font-weight: 700; padding: 8px 18px; box-shadow: var(--shadow-sm); display: inline-flex; align-items: center; gap: 6px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          Final Approve & Disburse
        </button>
      `,
      onOpen: (modalEl) => {
        const amountInput = modalEl.querySelector('#disburse-amount-input');
        const walletSelect = modalEl.querySelector('#disburse-wallet-select');
        const previewWalletName = modalEl.querySelector('#preview-wallet-name');
        const previewFinalAmount = modalEl.querySelector('#preview-final-amount');
        const overwriteNotice = modalEl.querySelector('#overwrite-notice');
        const finalApproveBtn = modalEl.querySelector('#btn-final-approve-disburse');

        // Dynamic update as admin overwrites amount
        amountInput.oninput = () => {
          const val = parseFloat(amountInput.value) || 0;
          currentDisburseAmount = val;
          previewFinalAmount.textContent = formatMoney(val);

          if (val !== req.amount) {
            overwriteNotice.innerHTML = `<span style="color:#D97706;font-weight:600;">Overwritten!</span> Original: ${formatMoney(req.amount)} &rarr; New: ${formatMoney(val)}`;
          } else {
            overwriteNotice.innerHTML = `Original requested: ${formatMoney(req.amount)} (Unchanged)`;
          }
        };

        // Dynamic update as admin changes wallet
        walletSelect.onchange = () => {
          selectedWalletName = walletSelect.value;
          previewWalletName.textContent = selectedWalletName;
        };

        // Final Approve & Disburse Trigger
        finalApproveBtn.onclick = () => {
          const finalVal = parseFloat(amountInput.value);
          if (isNaN(finalVal) || finalVal <= 0) {
            alert('Please enter a valid disbursement amount greater than 0.');
            return;
          }

          const remarks = modalEl.querySelector('#disburse-remarks').value.trim();

          // Execute Disburse in DataStore
          QrewStore.disburseOfficeRequisition(req.id, finalVal, selectedWalletName, remarks);

          QrewUI.closeModal();
          QrewUI.showToast(`Requisition ${req.requisitionNo} disbursed ($${finalVal.toLocaleString()}) via ${selectedWalletName}`, 'success');
          state.activeTab = 'requisitions';
          Qrew.views.office.renderFinancials(state.currentOfficeId, state.currentTenantId);
        };
      }
    });
  };

  /**
   * Action: Reject Prompt
   */
  Qrew.views.office.rejectRequisitionPrompt = (reqId) => {
    QrewUI.openModal({
      title: 'Reject Requisition',
      bodyHtml: `
        <div style="font-size: 13px; margin-bottom: 14px;">
          Please state the reason for rejecting this fund requisition.
        </div>
        <div class="form-group">
          <label class="form-label" for="reject-reason">Rejection Reason *</label>
          <input type="text" id="reject-reason" class="form-input" placeholder="e.g. Budget ceiling reached / insufficient documentation" required>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="QrewUI.closeModal()">Cancel</button>
        <button class="btn btn-danger" id="btn-confirm-reject">Reject Request</button>
      `,
      onOpen: (modalEl) => {
        const confirmBtn = modalEl.querySelector('#btn-confirm-reject');
        confirmBtn.onclick = () => {
          const reason = modalEl.querySelector('#reject-reason').value.trim();
          if (!reason) return;
          QrewStore.rejectOfficeRequisition(reqId, reason);
          QrewUI.closeModal();
          QrewUI.showToast('Requisition rejected.', 'info');
          Qrew.views.office.renderFinancials(state.currentOfficeId, state.currentTenantId);
        };
      }
    });
  };

  /**
   * Modal: Log Expense
   */
  const openLogExpenseModal = () => {
    const operationalFiles = QrewStore.getOperationalFiles(state.currentOfficeId);
    const officeStaff = QrewStore.getOfficeStaff(state.currentOfficeId);
    const wallets = QrewStore.getOfficeWallets(state.currentOfficeId);

    const categories = [
      'Port Authority Tariffs',
      'Towage & Harbor Pilotage',
      'Logistics & Transport',
      'Customs & Regulatory',
      'Stevedoring & Heavy Lift',
      'Office & Facilities',
      'Fuel & Bunker',
      'Meals & Operations Welfare'
    ];

    QrewUI.openModal({
      title: 'Log New Expense',
      bodyHtml: `
        <form id="log-expense-form" style="display: flex; flex-direction: column; gap: 14px;">
          
          <!-- File / Project -->
          <div class="form-group">
            <label class="form-label" for="exp-file-project">File / Project *</label>
            <input list="projects-list" id="exp-file-project" class="form-input" placeholder="Select or type file / project (e.g. PRJ-CTG-0042)" required>
            <datalist id="projects-list">
              ${operationalFiles.map(f => `<option value="${f.fileCode} (${f.title})">`).join('')}
              <option value="General Operations">
              <option value="PRJ-CTG-0042 (MV Meghna Harmony)">
              <option value="PRJ-CTG-0041 (MV Northern Diamond)">
              <option value="PRJ-CTG-0039 (MV Ocean Voyager)">
              <option value="PRJ-CTG-0038 (MV Banglar Samriddhi)">
            </datalist>
          </div>

          <div class="form-row">
            <!-- Spent By -->
            <div class="form-group" style="flex: 1;">
              <label class="form-label" for="exp-spent-by">Spent By *</label>
              <input list="staff-list" id="exp-spent-by" class="form-input" placeholder="Person who spent" required>
              <datalist id="staff-list">
                ${officeStaff.map(s => `<option value="${s.user.name}">`).join('')}
                <option value="Rafiqul Islam">
                <option value="Jack Rahman">
                <option value="Nusrat Jahan">
              </datalist>
            </div>

            <!-- Category -->
            <div class="form-group" style="flex: 1;">
              <label class="form-label" for="exp-category">Category *</label>
              <select id="exp-category" class="form-input" required>
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label" for="exp-desc">Description *</label>
            <input type="text" id="exp-desc" class="form-input" placeholder="What was the expenditure for?" required>
          </div>

          <div class="form-row">
            <!-- Date -->
            <div class="form-group" style="flex: 1;">
              <label class="form-label" for="exp-date">Date *</label>
              <input type="date" id="exp-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
            </div>

            <!-- Amount -->
            <div class="form-group" style="flex: 1;">
              <label class="form-label" for="exp-amount">Amount ($ USD) *</label>
              <input type="number" step="0.01" min="0.01" id="exp-amount" class="form-input" placeholder="0.00" required>
            </div>
          </div>

          <!-- Wallet Source -->
          <div class="form-group">
            <label class="form-label" for="exp-wallet">Deduct From Wallet</label>
            <select id="exp-wallet" class="form-input">
              ${wallets.map(w => `<option value="${w.name}">${w.name} (Balance: $${w.balance.toLocaleString()})</option>`).join('')}
            </select>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="QrewUI.closeModal()">Cancel</button>
        <button class="btn" id="btn-submit-log-expense" style="background-color: #059669; color: #FFFFFF; border: 1px solid #059669; font-weight: 600;">Save Expense</button>
      `,
      onOpen: (modalEl) => {
        const form = modalEl.querySelector('#log-expense-form');
        const submitBtn = modalEl.querySelector('#btn-submit-log-expense');

        submitBtn.onclick = () => {
          if (!form.checkValidity()) {
            form.reportValidity();
            return;
          }

          const fileProject = document.getElementById('exp-file-project').value.trim();
          const spentBy = document.getElementById('exp-spent-by').value.trim();
          const category = document.getElementById('exp-category').value;
          const description = document.getElementById('exp-desc').value.trim();
          const date = document.getElementById('exp-date').value;
          const amount = parseFloat(document.getElementById('exp-amount').value);
          const wallet = document.getElementById('exp-wallet').value;

          QrewStore.createOfficeExpense(state.currentOfficeId, {
            fileProject,
            spentBy,
            category,
            description,
            date,
            amount,
            wallet
          });

          QrewUI.closeModal();
          QrewUI.showToast(`Expense of $${amount.toFixed(2)} recorded for "${fileProject}"`, 'success');
          state.activeTab = 'expenses';
          Qrew.views.office.renderFinancials(state.currentOfficeId, state.currentTenantId);
        };
      }
    });
  };

  /**
   * Modal: Request Funds
   */
  const openRequestFundsModal = () => {
    const operationalFiles = QrewStore.getOperationalFiles(state.currentOfficeId);
    const officeStaff = QrewStore.getOfficeStaff(state.currentOfficeId);

    const purposeCategories = [
      'Harbor Tugboat & Towage Advance',
      'Port Authority Berth & Pilotage Tariff',
      'Customs Regulatory Clearance & Manifest Stamp Duty',
      'Container Yard Equipment & Stevedoring Disbursal',
      'Vessel Fresh Water & Bunker Supply Logistics',
      'Emergency Port Security & Line Handlers Advance',
      'Operational Petty Cash Replenishment',
      'Berth Hire & Quay Access Fee'
    ];

    QrewUI.openModal({
      title: 'Request Operational Funds',
      bodyHtml: `
        <form id="request-funds-form" style="display: flex; flex-direction: column; gap: 14px;">
          
          <!-- File / Project -->
          <div class="form-group">
            <label class="form-label" for="req-file-project">File / Project *</label>
            <input list="req-projects-list" id="req-file-project" class="form-input" placeholder="Select or type file / project (e.g. PRJ-CTG-0042)" required>
            <datalist id="req-projects-list">
              ${operationalFiles.map(f => `<option value="${f.fileCode} (${f.title})">`).join('')}
              <option value="General Operations">
              <option value="PRJ-CTG-0042 (MV Meghna Harmony)">
              <option value="PRJ-CTG-0041 (MV Northern Diamond)">
              <option value="PRJ-CTG-0039 (MV Ocean Voyager)">
              <option value="PRJ-CTG-0038 (MV Banglar Samriddhi)">
            </datalist>
          </div>

          <!-- Purpose / Requisition Reason with Preset Categories + None Option -->
          <div class="form-group">
            <label class="form-label" for="req-purpose-select">Purpose / Requisition Reason *</label>
            <select id="req-purpose-select" class="form-input" required>
              <option value="" disabled selected>Select Purpose / Reason</option>
              ${purposeCategories.map(p => `<option value="${p}">${p}</option>`).join('')}
              <option value="none">None (Personalized Reason)</option>
            </select>
          </div>

          <!-- Dynamic Personalized Reason (Appears only when 'None' is selected) -->
          <div class="form-group" id="custom-purpose-group" style="display: none; background: var(--color-surface); padding: 12px; border-radius: var(--radius-sm); border: 1px dashed var(--color-border-strong);">
            <label class="form-label" for="req-purpose-custom" style="color: var(--panel-accent, var(--color-accent)); font-weight: 600;">Personalized Purpose / Reason *</label>
            <input type="text" id="req-purpose-custom" class="form-input" placeholder="Enter personalized purpose or reason for requisition...">
          </div>

          <div class="form-row">
            <div class="form-group" style="flex: 1;">
              <label class="form-label" for="req-amount">Amount Requested ($ USD) *</label>
              <input type="number" step="0.01" min="1" id="req-amount" class="form-input" placeholder="0.00" required>
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label" for="req-by">Requested By *</label>
              <input list="req-staff-list" id="req-by" class="form-input" placeholder="Enter or select staff name" required>
              <datalist id="req-staff-list">
                ${officeStaff.map(s => `<option value="${s.user.name}">`).join('')}
                <option value="Jack Rahman">
                <option value="Rafiqul Islam">
                <option value="Nusrat Jahan">
              </datalist>
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="QrewUI.closeModal()">Cancel</button>
        <button class="btn btn-primary" id="btn-submit-req-funds">Submit Requisition</button>
      `,
      onOpen: (modalEl) => {
        const form = modalEl.querySelector('#request-funds-form');
        const submitBtn = modalEl.querySelector('#btn-submit-req-funds');
        const purposeSelect = modalEl.querySelector('#req-purpose-select');
        const customPurposeGroup = modalEl.querySelector('#custom-purpose-group');
        const customPurposeInput = modalEl.querySelector('#req-purpose-custom');

        // Toggle personalized input on 'none' selection
        purposeSelect.onchange = () => {
          if (purposeSelect.value === 'none') {
            customPurposeGroup.style.display = 'block';
            customPurposeInput.setAttribute('required', 'required');
            customPurposeInput.focus();
          } else {
            customPurposeGroup.style.display = 'none';
            customPurposeInput.removeAttribute('required');
            customPurposeInput.value = '';
          }
        };

        submitBtn.onclick = () => {
          if (!form.checkValidity()) {
            form.reportValidity();
            return;
          }

          const fileProject = document.getElementById('req-file-project').value.trim();
          let purpose = purposeSelect.value;
          if (purpose === 'none') {
            purpose = customPurposeInput.value.trim();
            if (!purpose) {
              customPurposeInput.focus();
              alert('Please enter your personalized purpose / reason.');
              return;
            }
          }

          const amount = parseFloat(document.getElementById('req-amount').value);
          const requestedBy = document.getElementById('req-by').value.trim();

          const req = QrewStore.createOfficeRequisition(state.currentOfficeId, {
            fileProject,
            purpose,
            amount,
            category: purpose,
            requestedBy,
            wallet: 'Operations Petty Cash'
          });

          QrewUI.closeModal();
          QrewUI.showToast(`Fund requisition ${req.requisitionNo} submitted for approval`, 'success');
          state.activeTab = 'requisitions';
          Qrew.views.office.renderFinancials(state.currentOfficeId, state.currentTenantId);
        };
      }
    });
  };

  /**
   * Action: Delete Expense Prompt
   */
  Qrew.views.office.deleteExpensePrompt = (id) => {
    QrewUI.confirmDialog({
      title: 'Delete Expense Record?',
      message: 'Are you sure you want to delete this expense record? This will remove the voucher from the financial records.',
      confirmLabel: 'Delete Expense',
      confirmVariant: 'danger',
      onConfirm: () => {
        QrewStore.deleteOfficeExpense(id);
        QrewUI.showToast('Expense record deleted.', 'info');
        Qrew.views.office.renderFinancials(state.currentOfficeId, state.currentTenantId);
      }
    });
  };

  /**
   * Action: Top Up Wallet
   */
  Qrew.views.office.topUpWalletPrompt = (id, name) => {
    QrewUI.openModal({
      title: `Top Up ${name}`,
      bodyHtml: `
        <div style="margin-bottom: 12px; font-size: 13px; color: var(--color-text-muted);">
          Allocate additional operating budget to this wallet.
        </div>
        <div class="form-group">
          <label class="form-label" for="topup-amount">Top Up Amount ($ USD) *</label>
          <input type="number" step="100" min="50" id="topup-amount" class="form-input" value="1000" required>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-secondary" onclick="QrewUI.closeModal()">Cancel</button>
        <button class="btn btn-primary" id="btn-confirm-topup">Add Funds</button>
      `,
      onOpen: (modalEl) => {
        const confirmBtn = modalEl.querySelector('#btn-confirm-topup');
        confirmBtn.onclick = () => {
          const amt = parseFloat(document.getElementById('topup-amount').value);
          if (!amt || amt <= 0) return;
          QrewStore.topUpOfficeWallet(id, amt);
          QrewUI.closeModal();
          QrewUI.showToast(`$${amt.toLocaleString()} added to ${name}`, 'success');
          Qrew.views.office.renderFinancials(state.currentOfficeId, state.currentTenantId);
        };
      }
    });
  };
})();
