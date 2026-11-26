"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { StatusBadge } from "@/components/ui/Badges";
import { QrewIcon } from "@/components/ui/Icons";
import { CreateOfficeModalContent } from "@/features/platform/TenantModals";
import { routes } from "@/lib/routes";
import { EditOfficeModalContent } from "./TenantMemberOfficeModals";
import { TenantNotFoundCard } from "./TenantNotFoundCard";

export function TenantOfficesView({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const { store, mutate } = useQrewStore();
  const { openModal, closeModal, confirmDialog, showToast } = useUiFeedback();

  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const close = () => setOpenDropdownId(null);
    const onDocumentClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target || !target.closest(".tree-action-dropdown-wrap")) {
        close();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const tenant = store.getTenantById(tenantId) || store.getTenants()[0];
  const resolvedTenantId = tenant ? tenant.id : tenantId;
  const tenantOffices = useMemo(
    () => (tenant ? store.getOfficesByTenant(tenant.id) : []),
    [tenant, store]
  );

  const filter = searchTerm.toLowerCase().trim();
  const filteredOffices = useMemo(() => {
    if (!filter) return tenantOffices;
    return tenantOffices.filter(
      (o) =>
        o.name.toLowerCase().includes(filter) ||
        o.id.toLowerCase().includes(filter) ||
        (o.location && o.location.toLowerCase().includes(filter))
    );
  }, [tenantOffices, filter]);

  if (!tenant) {
    return <TenantNotFoundCard tenantId={tenantId} />;
  }

  const handleOpenCreate = () => {
    openModal({
      title: `Create Office for ${tenant.name}`,
      content: <CreateOfficeModalContent tenantId={resolvedTenantId} onCancel={closeModal} />,
    });
  };

  const handleOpenEdit = (officeId: string, officeName: string) => {
    setOpenDropdownId(null);
    openModal({
      title: `Edit Office: ${officeName}`,
      content: <EditOfficeModalContent officeId={officeId} onCancel={closeModal} />,
    });
  };

  const handleToggleStatus = (officeId: string, currentStatus: string) => {
    setOpenDropdownId(null);
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    confirmDialog({
      title: `${newStatus === "Active" ? "Activate" : "Suspend"} Office`,
      message: `Change office status to "${newStatus}"?`,
      confirmText: newStatus === "Active" ? "Activate" : "Suspend",
      confirmClass: newStatus === "Active" ? "btn-primary" : "btn-danger",
      onConfirm: () => {
        mutate((s) => s.updateOffice(officeId, { status: newStatus }, resolvedTenantId));
        showToast(`Office marked as ${newStatus}.`, "success");
      },
    });
  };

  const handleDeleteOffice = (officeId: string, officeName: string) => {
    setOpenDropdownId(null);
    confirmDialog({
      title: "Delete Office Branch",
      message: `Permanently delete branch office "${officeName}"? All staff assignments for this office will be revoked.`,
      confirmText: "Delete Office",
      confirmClass: "btn-danger",
      onConfirm: () => {
        try {
          mutate((s) => s.deleteOffice(officeId, resolvedTenantId));
          showToast(`Office "${officeName}" deleted.`, "success");
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Delete failed", "danger");
        }
      },
    });
  };

  const handleSwitchToOfficeAdmin = (e: React.MouseEvent, officeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenDropdownId(null);
    confirmDialog({
      title: "Switch to Office Admin",
      message: "Are you sure you want to switch to Office Admin?",
      confirmText: "Continue",
      confirmClass: "btn-primary",
      icon: "settings",
      iconColor: "var(--color-primary, #0D9488)",
      showDoNotAskAgain: true,
      doNotAskAgainKey: "qrew_skip_confirm_switch_office_admin",
      onConfirm: () => {
        router.push(routes.officeAdmin(resolvedTenantId, officeId, "overview"));
      },
    });
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div className="page-title-group">
          <h1 className="page-title">Branch &amp; Facility Offices</h1>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            id="btn-create-office"
            onClick={handleOpenCreate}
          >
            <QrewIcon name="plus" /> Create Office
          </button>
        </div>
      </div>

      <div className="tree-view-wrapper">
        <div className="tree-toolbar">
          <div className="tree-search-wrap">
            <span className="tree-search-icon">
              <QrewIcon name="search" />
            </span>
            <input
              type="text"
              className="tree-search-input"
              id="tree-search-input"
              placeholder="Search offices, IDs, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="tree-toolbar-actions">
            <span
              className="tree-meta-badge"
              id="offices-count-badge"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border)",
                fontSize: "12px",
                padding: "5px 10px",
              }}
            >
              {tenantOffices.length} Office{tenantOffices.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="tree-root-list" id="tree-root-list">
          {filteredOffices.length === 0 ? (
            <div
              style={{
                padding: "40px 24px",
                textAlign: "center",
                background: "var(--color-surface-white)",
                border: "1px dashed var(--color-border)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <p style={{ color: "var(--color-text-muted)", fontSize: "13.5px", margin: "0 0 14px" }}>
                {filter
                  ? `No offices match "${filter}"`
                  : "No offices created yet under this organization."}
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleOpenCreate}
              >
                <QrewIcon name="plus" /> Create Office
              </button>
            </div>
          ) : (
            <>
              <div className="offices-list-header">
                <div className="offices-th-identity">Office</div>
                <div className="offices-th-location">Location</div>
                <div className="offices-th-staff">Staff</div>
                <div className="offices-th-status">Status</div>
                <div className="offices-th-actions">Actions</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredOffices.map((off) => {
                  const isMenuOpen = openDropdownId === off.id;
                  return (
                    <div
                      className="tree-office-item"
                      key={off.id}
                      style={isMenuOpen ? { zIndex: 50 } : undefined}
                    >
                      <div className="office-col-identity">
                        <div
                          className="tree-office-icon-wrap"
                          aria-hidden="true"
                          title="Facility Branch"
                        >
                          <QrewIcon name="building2" />
                        </div>
                        <div className="office-title-wrap">
                          <Link
                            href={routes.office(resolvedTenantId, off.id, "overview")}
                            className="office-name-link"
                            title="Open Branch Facility Workspace"
                          >
                            {off.name}
                          </Link>
                          <span className="tree-id-badge" title="Branch Office Identifier">
                            {off.id}
                          </span>
                        </div>
                      </div>

                      <div className="office-col-location">
                        <span className="office-meta-icon">
                          <QrewIcon name="mapPin" />
                        </span>
                        <span
                          className="office-meta-text"
                          title={off.location || "Location Not Specified"}
                        >
                          {off.location || "Location Not Specified"}
                        </span>
                      </div>

                      <div className="office-col-staff">
                        <span className="office-meta-icon">
                          <QrewIcon name="users" />
                        </span>
                        <span>
                          {off.staffCount} staff member{off.staffCount === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div className="office-col-status">
                        <StatusBadge status={off.status} />
                      </div>

                      <div className="office-col-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="action-icon-btn edit-office-btn"
                          title="Edit Office Details"
                          aria-label="Edit Office"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(off.id, off.name);
                          }}
                        >
                          <QrewIcon name="edit" />
                        </button>

                        <div className="tree-action-dropdown-wrap">
                          <button
                            type="button"
                            className="action-icon-btn tree-dropdown-trigger"
                            title="More Office Actions"
                            aria-label="More Office Actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId((prev) => (prev === off.id ? null : off.id));
                            }}
                          >
                            <QrewIcon name="moreHorizontal" />
                          </button>
                          <div className={`tree-action-menu${isMenuOpen ? " show" : ""}`}>
                            <Link
                              href={routes.office(resolvedTenantId, off.id, "overview")}
                              className="tree-action-item"
                              title="Open Branch Hub"
                              onClick={() => setOpenDropdownId(null)}
                            >
                              <QrewIcon name="building" /> <span>Open Branch Hub</span>
                            </Link>
                            <Link
                              href={routes.officeAdmin(resolvedTenantId, off.id, "overview")}
                              className="tree-action-item"
                              title="Open Office Administration"
                              onClick={(e) => handleSwitchToOfficeAdmin(e, off.id)}
                            >
                              <QrewIcon name="shield" /> <span>Office Admin</span>
                            </Link>
                            <Link
                              href={routes.officeConfig(resolvedTenantId, off.id, "overview")}
                              className="tree-action-item"
                              title="Configure Facility Specs, Shift Templates & Custom Fields"
                              onClick={() => setOpenDropdownId(null)}
                            >
                              <QrewIcon name="settings" /> <span>Configure Facility Specs</span>
                            </Link>
                            <button
                              type="button"
                              className="tree-action-item"
                              onClick={() => handleOpenEdit(off.id, off.name)}
                            >
                              <QrewIcon name="edit" /> <span>Edit Office Details</span>
                            </button>
                            <button
                              type="button"
                              className="tree-action-item"
                              onClick={() => handleToggleStatus(off.id, off.status)}
                            >
                              <QrewIcon name="power" />{" "}
                              <span>
                                {off.status === "Active" ? "Suspend Office" : "Activate Office"}
                              </span>
                            </button>
                            <div className="tree-action-divider" />
                            <button
                              type="button"
                              className="tree-action-item danger"
                              onClick={() => handleDeleteOffice(off.id, off.name)}
                            >
                              <QrewIcon name="trash" /> <span>Delete Office Branch</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
