"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { StatusBadge } from "@/components/ui/Badges";
import { QrewIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/routes";
import {
  CreateOfficeModalContent,
  CreateTenantModalContent,
  EditTenantModalContent,
  OwnerProfileModalContent,
} from "./TenantModals";

export function PlatformTenantsView() {
  const router = useRouter();
  const { store, mutate } = useQrewStore();
  const { openModal, closeModal, confirmDialog, showToast } = useUiFeedback();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [collapsedTenants, setCollapsedTenants] = useState<Set<string>>(() => new Set());

  const allTenants = store.getTenants();
  const suspendedCount = allTenants.filter((t) => t.status === "Suspended").length;
  const totalOfficesCount = allTenants.reduce(
    (sum, t) => sum + (store.getOfficesByTenant(t.id) || []).length,
    0
  );

  const filter = searchTerm.toLowerCase().trim();

  const filteredTenants = useMemo(() => {
    return allTenants.filter((t) => {
      const tenantOffices = store.getOfficesByTenant(t.id) || [];
      const matchesSearch =
        !filter ||
        t.name.toLowerCase().includes(filter) ||
        t.id.toLowerCase().includes(filter) ||
        (t.ownerName && t.ownerName.toLowerCase().includes(filter)) ||
        tenantOffices.some(
          (o) =>
            o.name.toLowerCase().includes(filter) ||
            o.id.toLowerCase().includes(filter) ||
            (o.location && o.location.toLowerCase().includes(filter))
        );
      const matchesStatus =
        statusFilter === "All" ? t.status !== "Suspended" : t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allTenants, store, filter, statusFilter]);

  const toggleTenant = (tenantId: string) => {
    setCollapsedTenants((prev) => {
      const next = new Set(prev);
      if (next.has(tenantId)) next.delete(tenantId);
      else next.add(tenantId);
      return next;
    });
  };

  const handleOpenCreateTenant = () => {
    openModal({
      title: "Create New Tenant Organization",
      content: <CreateTenantModalContent onCancel={closeModal} />,
    });
  };

  const handleOpenEditTenant = (tenantId: string, tenantName: string) => {
    openModal({
      title: `Edit Tenant: ${tenantName}`,
      content: <EditTenantModalContent tenantId={tenantId} onCancel={closeModal} />,
    });
  };

  const handleOpenOwnerProfile = (tenantId: string, tenantName: string) => {
    openModal({
      title: `Organization Information: ${tenantName}`,
      body: <OwnerProfileModalContent tenantId={tenantId} />,
      footer: (
        <button type="button" className="btn btn-secondary" onClick={closeModal}>
          Close
        </button>
      ),
    });
  };

  const handleOpenCreateOffice = (tenantId: string, tenantName: string) => {
    openModal({
      title: `Create Office for ${tenantName}`,
      content: <CreateOfficeModalContent tenantId={tenantId} onCancel={closeModal} />,
    });
  };

  const handleSuspendTenant = (tenantId: string, tenantName: string) => {
    confirmDialog({
      title: "Suspend Organization",
      message: `Are you sure you want to suspend organization "${tenantName}"? Suspended organizations are moved to the Archive and cannot access operational workspaces.`,
      confirmText: "Suspend & Move to Archive",
      confirmClass: "btn-danger",
      onConfirm: () => {
        mutate((s) => s.updateTenant(tenantId, { status: "Suspended" }));
        showToast(`Organization "${tenantName}" suspended and moved to Archive.`, "info");
        router.push(routes.platform("archive"));
      },
    });
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div className="page-title-group">
          <h1 className="page-title">All Tenants</h1>
        </div>
        <div
          className="page-actions"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <Link
            href={routes.platform("archive")}
            className="btn btn-secondary"
            id="btn-view-archive"
            title="View Suspended & Archived Organizations"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <QrewIcon name="archive" />
            <span>Archive</span>
            {suspendedCount > 0 ? (
              <span
                className="badge badge-suspended"
                style={{ padding: "1px 6px", fontSize: "11px", lineHeight: 1.2 }}
              >
                {suspendedCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="btn btn-primary"
            id="btn-create-tenant"
            onClick={handleOpenCreateTenant}
          >
            <QrewIcon name="plus" /> Create Tenant
          </button>
        </div>
      </div>

      <div className="tree-view-wrapper">
        <div className="tree-toolbar">
          <div
            className="tree-toolbar-left"
            style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, maxWidth: "540px" }}
          >
            <div className="tree-search-wrap" style={{ flex: 1 }}>
              <span className="tree-search-icon">
                <QrewIcon name="search" />
              </span>
              <input
                type="text"
                className="tree-search-input"
                id="tenant-tree-search"
                placeholder="Search offices, IDs, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select-filter"
              id="tenant-tree-status-filter"
              style={{
                minWidth: "130px",
                height: "34px",
                padding: "4px 10px",
                fontSize: "12.5px",
              }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="tree-toolbar-actions">
            <span
              className="tree-meta-badge"
              id="tenants-stats-badge"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border)",
                fontSize: "12px",
                padding: "5px 10px",
              }}
            >
              {filteredTenants.length} Tenant{filteredTenants.length === 1 ? "" : "s"} •{" "}
              {totalOfficesCount} Offices
            </span>
          </div>
        </div>

        <div className="tree-root-list" id="tenants-tree-list">
          {filteredTenants.length === 0 ? (
            <div
              style={{
                padding: "32px 24px",
                background: "var(--color-surface-white)",
                border: "1px dashed var(--color-border)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
              }}
            >
              <span style={{ color: "var(--color-text-muted)", fontSize: "13.5px" }}>
                {filter
                  ? `No organizations match "${filter}"`
                  : "No tenant organizations found."}
              </span>
            </div>
          ) : (
            filteredTenants.map((t) => {
              const tenantOffices = store.getOfficesByTenant(t.id) || [];
              const tenantMembers = store.getTenantMembers(t.id) || [];
              const isTenantExpanded = filter ? true : !collapsedTenants.has(t.id);

              const filteredOffices = filter
                ? tenantOffices.filter(
                    (o) =>
                      o.name.toLowerCase().includes(filter) ||
                      o.id.toLowerCase().includes(filter) ||
                      (o.location && o.location.toLowerCase().includes(filter))
                  )
                : tenantOffices;

              return (
                <div className="tree-tenant-card" key={t.id} data-tenant-id={t.id}>
                  <div
                    className={`tree-tenant-row${isTenantExpanded ? " expanded" : ""}`}
                    aria-expanded={isTenantExpanded}
                    aria-label={`Tenant Organization ${t.name}`}
                    onClick={(e) => {
                      if (
                        (e.target as HTMLElement).closest(
                          "button, a, input, select, .tree-col-actions, .tree-owner-link, .tree-tenant-link"
                        )
                      ) {
                        return;
                      }
                      toggleTenant(t.id);
                    }}
                  >
                    <div className="tree-col-identity">
                      <button
                        type="button"
                        className="tree-folder-toggle-btn"
                        title={
                          isTenantExpanded
                            ? "Click to collapse offices"
                            : "Click to expand offices"
                        }
                        aria-label={
                          isTenantExpanded ? "Collapse offices" : "Expand offices"
                        }
                        aria-expanded={isTenantExpanded}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTenant(t.id);
                        }}
                      >
                        <span className="tree-chevron" aria-hidden="true">
                          <QrewIcon name="chevronRight" />
                        </span>
                        <span className="tree-folder-icon" aria-hidden="true">
                          <QrewIcon
                            name={isTenantExpanded ? "folderOpen" : "folderClosed"}
                          />
                        </span>
                      </button>
                      <div className="tree-title-group">
                        <span className="tree-entity-name tree-tenant-text" title={t.name}>
                          {t.name}
                        </span>
                        <span className="tree-id-badge" title="Tenant Organization Identifier">
                          {t.id}
                        </span>
                      </div>
                    </div>

                    <div className="tree-col-detail">
                      <span className="tree-meta-icon">
                        <QrewIcon name="users" />
                      </span>
                      <span className="tree-meta-label">Owner:</span>
                      <button
                        type="button"
                        className="tree-owner-link"
                        title={`View profile details of ${t.ownerName || "Rafiqul Islam"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenOwnerProfile(t.id, t.name);
                        }}
                      >
                        {t.ownerName || "Rafiqul Islam"}
                      </button>
                    </div>

                    <div className="tree-col-stats">
                      <span className="tree-meta-pill" title="Total Offices">
                        <span className="tree-meta-icon">
                          <QrewIcon name="building" />
                        </span>
                        <span>
                          {tenantOffices.length} office{tenantOffices.length === 1 ? "" : "s"}
                        </span>
                      </span>
                      <span className="tree-meta-pill" title="Total Members">
                        <span className="tree-meta-icon">
                          <QrewIcon name="users" />
                        </span>
                        <span>
                          {tenantMembers.length} member{tenantMembers.length === 1 ? "" : "s"}
                        </span>
                      </span>
                    </div>

                    <div className="tree-col-status">
                      <StatusBadge status={t.status} />
                    </div>

                    <div className="tree-col-date" title="Organization Created Date">
                      <span>Est. {t.createdAt || "2026-09-12"}</span>
                    </div>

                    <div className="tree-col-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="action-icon-btn edit-tenant-btn"
                        title="Edit Organization"
                        aria-label="Edit Organization"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditTenant(t.id, t.name);
                        }}
                      >
                        <QrewIcon name="edit" />
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn warning suspend-tenant-btn"
                        title="Suspend Organization"
                        aria-label="Suspend Organization"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSuspendTenant(t.id, t.name);
                        }}
                      >
                        <QrewIcon name="pause" />
                      </button>
                    </div>
                  </div>

                  {isTenantExpanded ? (
                    <div className="tree-branch-container nested-offices-branch">
                      {filteredOffices.length === 0 ? (
                        <div
                          style={{
                            padding: "14px 18px",
                            background: "var(--color-surface-white)",
                            border: "1px dashed var(--color-border)",
                            borderRadius: "var(--radius-sm)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ color: "var(--color-text-muted)", fontSize: "12.5px" }}>
                            {filter
                              ? `No offices match "${filter}"`
                              : "No offices created yet under this organization."}
                          </span>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm create-office-tenant-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCreateOffice(t.id, t.name);
                            }}
                          >
                            <QrewIcon name="plus" /> Add Office
                          </button>
                        </div>
                      ) : (
                        filteredOffices.map((off) => (
                          <div className="tree-office-item" key={off.id}>
                            <div className="tree-col-identity">
                              <span className="tree-branch-connector" aria-hidden="true" />
                              <div
                                className="tree-office-icon-wrap"
                                aria-hidden="true"
                                title="Facility Branch"
                              >
                                <QrewIcon name="building2" />
                              </div>
                              <div className="tree-title-group">
                                <span
                                  className="tree-entity-name tree-office-text"
                                  title="Branch Facility"
                                >
                                  {off.name}
                                </span>
                                <span
                                  className="tree-id-badge"
                                  title="Branch Office Identifier"
                                >
                                  {off.id}
                                </span>
                              </div>
                            </div>

                            <div className="tree-col-detail">
                              <span className="tree-meta-icon">
                                <QrewIcon name="mapPin" />
                              </span>
                              <span
                                className="tree-meta-value"
                                title={off.location || "Location Not Specified"}
                              >
                                {off.location || "Location Not Specified"}
                              </span>
                            </div>

                            <div className="tree-col-stats">
                              <span className="tree-meta-pill" title="Deployed Staff Members">
                                <span className="tree-meta-icon">
                                  <QrewIcon name="users" />
                                </span>
                                <span>
                                  {off.staffCount} staff member{off.staffCount === 1 ? "" : "s"}
                                </span>
                              </span>
                            </div>

                            <div className="tree-col-status">
                              <StatusBadge status={off.status} />
                            </div>

                            <div className="tree-col-date" title="Office Created Date">
                              <span>Est. {off.createdAt || "2026-09-15"}</span>
                            </div>

                            <div
                              className="tree-col-actions"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link
                                href={routes.officeConfig(t.id, off.id, "overview")}
                                className="action-icon-btn office-config-btn"
                                title="Office Config"
                                aria-label="Office Config"
                              >
                                <QrewIcon name="settings" />
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
