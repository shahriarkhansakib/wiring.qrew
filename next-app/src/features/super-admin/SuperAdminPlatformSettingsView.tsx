"use client";

import React from "react";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { QrewIcon } from "@/components/ui/Icons";

interface SettingField {
  label: string;
  hint: string;
  value: string;
  locked: boolean;
}

const SETTING_SECTIONS: Array<{ title: string; fields: SettingField[] }> = [
  {
    title: "Security & Authentication",
    fields: [
      { label: "MFA Requirement", hint: "Mandatory for all platform admins", value: "Mandatory", locked: true },
      { label: "Reauthentication for sensitive actions", hint: "Step-up auth required", value: "Enabled", locked: true },
      { label: "Failed login lockout threshold", hint: "Attempts before lockout", value: "5 attempts", locked: false },
      { label: "Password policy", hint: "Complexity requirements", value: "Strong (min 12 chars, mixed)", locked: false },
    ],
  },
  {
    title: "Sessions & Access Safety",
    fields: [
      { label: "Admin session lifetime", hint: "Maximum session duration", value: "8 hours", locked: false },
      { label: "Idle timeout", hint: "Inactivity before session ends", value: "30 minutes", locked: false },
      { label: "Revoke sessions on role change", hint: "Force re-login after role changes", value: "Enabled", locked: true },
      { label: "Concurrent session limit", hint: "Per administrator account", value: "1 (enforced)", locked: false },
    ],
  },
  {
    title: "Platform Domains & Custom Domains",
    fields: [
      { label: "Platform root domain", hint: "Read-only", value: "qrew.com", locked: true },
      { label: "Tenant subdomain format", hint: "Naming convention enforced", value: "<tenant>.qrew.com", locked: true },
      { label: "Custom domain verification required", hint: "DNS verification before activation", value: "Yes", locked: true },
      { label: "TLS enforcement", hint: "All traffic must use TLS", value: "Mandatory", locked: true },
    ],
  },
  {
    title: "Audit & Logging",
    fields: [
      { label: "Core security event logging", hint: "Cannot be disabled", value: "Always on", locked: true },
      { label: "Sensitive action logging", hint: "Actor, before/after values, outcome", value: "Enabled", locked: true },
      { label: "Audit log retention", hint: "Default retention period", value: "365 days", locked: false },
      { label: "Admin audit own actions", hint: "Self-actions are always logged", value: "Mandatory", locked: true },
    ],
  },
  {
    title: "Data Retention & Recovery",
    fields: [
      { label: "Account recovery window", hint: "Time to restore after deletion", value: "TBD — pending policy decision", locked: false },
      { label: "Legal hold support", hint: "Prevent purge during active holds", value: "Planned", locked: false },
      { label: "Tenant archive retention", hint: "Post-deletion data window", value: "TBD", locked: false },
    ],
  },
];

export function SuperAdminPlatformSettingsView() {
  const { showToast } = useUiFeedback();

  return (
    <>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div className="page-title-group">
          <h1 className="page-title">Platform Settings</h1>
          <p className="page-subtitle">
            Global Qrew platform policies and security controls — Super Admin only
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => showToast("Changes saved.", "success")}
          >
            <QrewIcon name="check" /> Save Changes
          </button>
        </div>
      </div>

      <div
        style={{
          background: "var(--color-danger-bg)",
          border: "1px solid var(--color-danger-border)",
          borderRadius: "var(--radius-md)",
          padding: "12px 16px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ color: "var(--color-danger)", display: "flex" }}>
          <QrewIcon name="alert" />
        </span>
        <span style={{ fontSize: "13px", color: "var(--color-danger)", fontWeight: 600 }}>
          Changes here affect all tenants and offices platform-wide. High-impact changes require
          re-authentication.
        </span>
      </div>

      {SETTING_SECTIONS.map((section) => (
        <div className="card" key={section.title} style={{ marginBottom: "16px" }}>
          <div className="card-header">
            <h2 className="card-title">{section.title}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {section.fields.map((f, i) => (
              <div
                key={f.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 20px",
                  borderBottom:
                    i < section.fields.length - 1
                      ? "1px solid var(--color-border-subtle)"
                      : undefined,
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    {f.hint}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "13px" }}>{f.value}</span>
                  {f.locked ? (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "3px",
                        background: "var(--color-danger-bg)",
                        color: "var(--color-danger)",
                        border: "1px solid var(--color-danger-border)",
                      }}
                    >
                      LOCKED
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => showToast("Edit coming in full build.", "info")}
                    >
                      <QrewIcon name="edit" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
