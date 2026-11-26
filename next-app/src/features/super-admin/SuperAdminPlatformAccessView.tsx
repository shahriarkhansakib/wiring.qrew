"use client";

import React, { useMemo, useState } from "react";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { RoleBadge, StatusBadge } from "@/components/ui/Badges";
import { QrewIcon } from "@/components/ui/Icons";

const SAFETY_CONSTRAINTS: Array<[string, string]> = [
  ["Platform Owner is the highest authority — no second-administrator approval needed", "Enforced"],
  ["No invitation workflow — only existing Super Admin creates accounts directly", "Enforced"],
  ["MFA is mandatory — temporary bypass is prohibited", "Enforced"],
  ["Platform roles are separate from tenant/office roles", "Enforced"],
  ["Last usable Super Admin is protected from deletion/suspension", "Enforced"],
];

export function SuperAdminPlatformAccessView() {
  const { store } = useQrewStore();
  const { showToast } = useUiFeedback();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const users = store.getPlatformUsers();

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = !roleFilter || u.platformRole === roleFilter;
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.platformRole.toLowerCase().includes(q) ||
        u.status.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [users, searchQuery, roleFilter]);

  return (
    <>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div className="page-title-group">
          <h1 className="page-title">Platform Access</h1>
          <p className="page-subtitle">
            Create and manage platform administrator accounts, roles, and authentication security
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => showToast("Account creation flow coming in full build.", "info")}
          >
            <QrewIcon name="plus" /> Create Administrator
          </button>
        </div>
      </div>

      <div className="metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Administrators</span>
            <div className="metric-icon-wrap">
              <QrewIcon name="users" />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-value">{users.length}</div>
            <div className="metric-subtext">Platform accounts</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Super Admins</span>
            <div className="metric-icon-wrap" style={{ color: "var(--panel-accent)" }}>
              <QrewIcon name="shield" />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-value">
              {users.filter((u) => u.platformRole === "Platform Owner").length}
            </div>
            <div className="metric-subtext">Highest authority</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">MFA Enrolled</span>
            <div className="metric-icon-wrap" style={{ color: "#22c55e" }}>
              <QrewIcon name="check" />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-value">{users.length}</div>
            <div className="metric-subtext">100% — mandatory</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Active Accounts</span>
            <div className="metric-icon-wrap">
              <QrewIcon name="activity" />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-value">
              {users.filter((u) => u.status === "Active").length}
            </div>
            <div className="metric-subtext">No suspensions</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 className="card-title">Administrator Accounts</h2>
            <p className="card-subtitle">Direct-creation only — no invitations</p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search by name or email…"
                style={{ paddingLeft: "30px", width: "220px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span
                style={{
                  position: "absolute",
                  left: "9px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-muted)",
                  display: "flex",
                }}
              >
                <QrewIcon name="search" />
              </span>
            </div>
            <select
              className="form-input"
              style={{ width: "150px", fontSize: "13px" }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Platform Owner">Platform Owner</option>
              <option value="Platform Admin">Platform Admin</option>
              <option value="Platform User">Platform User</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper" style={{ border: "none", boxShadow: "none" }}>
          <table className="data-table" id="sa-pa-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Assigned Role</th>
                <th>MFA</th>
                <th>Account Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} data-role={u.platformRole}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        className="user-avatar"
                        style={{
                          width: "30px",
                          height: "30px",
                          fontSize: "12px",
                          background: "var(--panel-accent)",
                        }}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <strong>{u.name}</strong>
                    </div>
                  </td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>{u.email}</td>
                  <td>
                    <RoleBadge roleName={u.platformRole} level="platform" />
                  </td>
                  <td>
                    <span className="badge badge-active">
                      <span className="badge-dot" />
                      Enrolled
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={u.status} />
                  </td>
                  <td style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>
                    {u.createdAt}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        title="Edit roles"
                        onClick={() => showToast("Role editor coming in full build.", "info")}
                      >
                        <QrewIcon name="edit" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        title="More actions"
                        onClick={() => showToast("Account actions coming in full build.", "info")}
                      >
                        <QrewIcon name="moreVertical" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: "20px" }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Safety Constraints</h2>
            <p className="card-subtitle">Non-negotiable platform rules</p>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {SAFETY_CONSTRAINTS.map(([rule, status], i) => (
            <div
              key={rule}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 20px",
                borderBottom:
                  i < SAFETY_CONSTRAINTS.length - 1
                    ? "1px solid var(--color-border-subtle)"
                    : undefined,
              }}
            >
              <span style={{ fontSize: "13px" }}>{rule}</span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "3px",
                  background: "var(--color-danger-bg)",
                  color: "var(--color-danger)",
                  border: "1px solid var(--color-danger-border)",
                }}
              >
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
