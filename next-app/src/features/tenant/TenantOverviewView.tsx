"use client";

import React from "react";
import Link from "next/link";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { RoleBadge, StatusBadge } from "@/components/ui/Badges";
import { QrewIcon } from "@/components/ui/Icons";
import { EditTenantModalContent } from "@/features/platform/TenantModals";
import { routes } from "@/lib/routes";
import { TenantNotFoundCard } from "./TenantNotFoundCard";

export function TenantOverviewView({ tenantId }: { tenantId: string }) {
  const { store, mutate } = useQrewStore();
  const { openModal, closeModal, confirmDialog, showToast } = useUiFeedback();

  const tenant = store.getTenantById(tenantId);
  if (!tenant) {
    return <TenantNotFoundCard tenantId={tenantId} />;
  }

  const handleEditTenant = () => {
    openModal({
      title: `Edit Tenant: ${tenant.name}`,
      content: <EditTenantModalContent tenantId={tenant.id} onCancel={closeModal} />,
    });
  };

  const handleToggleStatus = () => {
    const newStatus = tenant.status === "Active" ? "Suspended" : "Active";
    const actionVerb = newStatus === "Active" ? "activate" : "suspend";

    confirmDialog({
      title: `${newStatus === "Active" ? "Activate" : "Suspend"} Tenant`,
      message: `Are you sure you want to ${actionVerb} this tenant? Suspended tenants and their offices cannot access operational endpoints.`,
      confirmText: newStatus === "Active" ? "Activate" : "Suspend",
      confirmClass: newStatus === "Active" ? "btn-primary" : "btn-danger",
      onConfirm: () => {
        mutate((s) => s.updateTenant(tenant.id, { status: newStatus }));
        showToast(`Tenant status updated to ${newStatus}.`, "success");
      },
    });
  };

  return (
    <>
      <div className="detail-header-card">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              {tenant.name}
            </h1>
            <StatusBadge status={tenant.status} />
          </div>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            id="btn-edit-tenant-header"
            onClick={handleEditTenant}
          >
            <QrewIcon name="edit" /> Edit Tenant
          </button>
          <button
            type="button"
            className="btn btn-outline"
            id="btn-toggle-tenant-header"
            onClick={handleToggleStatus}
          >
            {tenant.status === "Active" ? "Suspend Tenant" : "Activate Tenant"}
          </button>
        </div>

        <div className="detail-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Tenant ID</span>
            <span className="meta-value">
              <span className="id-badge">{tenant.id}</span>
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Tenant Owner</span>
            <span className="meta-value">{tenant.ownerName}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Owner Email</span>
            <span className="meta-value">{tenant.ownerEmail}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Total Offices</span>
            <span className="meta-value">{tenant.officeCount}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Total Members</span>
            <span className="meta-value">{tenant.memberCount}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Created Date</span>
            <span className="meta-value">{tenant.createdAt}</span>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Branch Offices</span>
            <div className="metric-icon-wrap">
              <QrewIcon name="offices" />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-value">{tenant.offices.length}</div>
            <div className="metric-subtext">Active locations</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Organization Members</span>
            <div className="metric-icon-wrap">
              <QrewIcon name="users" />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-value">{tenant.members.length}</div>
            <div className="metric-subtext">Verified personnel</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Tenant Admin</span>
            <div className="metric-icon-wrap" style={{ color: "var(--color-warning)" }}>
              <QrewIcon name="roles" />
            </div>
          </div>
          <div className="metric-value-row">
            <div style={{ fontSize: "16px", fontWeight: 700 }}>{tenant.ownerName}</div>
            <div className="metric-subtext">Scoped admin</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Branch Offices</h2>
            </div>
          </div>
          <div className="table-wrapper" style={{ border: "none", boxShadow: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Office Name</th>
                  <th>Location</th>
                  <th>Staff</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tenant.offices.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link
                        href={routes.office(tenant.id, o.id, "overview")}
                        className="table-row-link"
                      >
                        <strong>{o.name}</strong>
                      </Link>
                    </td>
                    <td>{o.location}</td>
                    <td>{o.staffCount} staff</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Tenant Members</h2>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {tenant.members.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    background: "var(--color-surface)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <div>
                    <strong>{m.user.name}</strong>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      {m.user.email}
                    </div>
                  </div>
                  <RoleBadge roleName={m.tenantRole} level="tenant" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
