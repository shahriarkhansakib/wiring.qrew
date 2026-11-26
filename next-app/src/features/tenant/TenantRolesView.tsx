"use client";

import React, { useState } from "react";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { RoleBadge } from "@/components/ui/Badges";
import { QrewIcon } from "@/components/ui/Icons";
import { TenantNotFoundCard } from "./TenantNotFoundCard";

const TENANT_PERMISSIONS = ["tenant_create", "tenant_read", "tenant_update", "tenant_delete"];
const OFFICE_PERMISSIONS = ["office_create", "office_read", "office_update", "office_delete"];

export function TenantRolesView({ tenantId }: { tenantId: string }) {
  const { store } = useQrewStore();
  const { showToast } = useUiFeedback();
  const [selectedRoleId, setSelectedRoleId] = useState("role_ten_admin");

  const tenant = store.getTenantById(tenantId);
  if (!tenant) {
    return <TenantNotFoundCard tenantId={tenantId} />;
  }

  const tenantRoles = store.getRoles("tenant");
  const currentRole = tenantRoles.find((r) => r.id === selectedRoleId) || tenantRoles[0];

  return (
    <>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Tenant Roles</h1>
        </div>
      </div>

      <div className="roles-grid">
        {tenantRoles.map((role) => {
          const assignedCount = tenant.members.filter((m) => m.tenantRole === role.name).length;
          const isSelected = role.id === currentRole.id;
          return (
            <div
              key={role.id}
              className={`role-card${isSelected ? " selected" : ""}`}
              onClick={() => setSelectedRoleId(role.id)}
            >
              <div className="role-card-header">
                <div>
                  <h3 className="role-card-title">{role.name}</h3>
                  <div style={{ marginTop: "4px" }}>
                    <RoleBadge roleName={role.name} level="tenant" />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--panel-accent, var(--color-accent))",
                  }}
                >
                  {role.permissions.length} perms
                </div>
              </div>
              <p className="role-card-desc">{role.description}</p>
              <div className="role-card-meta">
                <span>In this Tenant:</span>
                <strong>{assignedCount} members</strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className="permissions-matrix-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--color-border-subtle)",
            paddingBottom: "16px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)" }}>
              Permissions for &quot;{currentRole.name}&quot;
            </h3>
            <p style={{ fontSize: "12.5px", color: "var(--color-text-muted)" }}>
              Granular capabilities authorized for this tenant role.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            id="btn-verify-ten-perms"
            onClick={() => showToast(`Capabilities verified for ${currentRole.name}.`, "success")}
          >
            <QrewIcon name="check" /> Verify Permissions
          </button>
        </div>

        <div className="permission-groups-grid">
          <div className="permission-group-card">
            <div className="permission-group-title">
              <span>Tenant Resource</span>
              <span className="id-badge">tenant_*</span>
            </div>
            <div className="permission-list">
              {TENANT_PERMISSIONS.map((perm) => (
                <label className="permission-item" key={perm}>
                  <input
                    type="checkbox"
                    className="permission-checkbox"
                    checked={currentRole.permissions.includes(perm)}
                    disabled
                  />
                  <span>{perm}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="permission-group-card">
            <div className="permission-group-title">
              <span>Office Operations</span>
              <span className="id-badge">office_*</span>
            </div>
            <div className="permission-list">
              {OFFICE_PERMISSIONS.map((perm) => (
                <label className="permission-item" key={perm}>
                  <input
                    type="checkbox"
                    className="permission-checkbox"
                    checked={currentRole.permissions.includes(perm)}
                    disabled
                  />
                  <span>{perm}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
