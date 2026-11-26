"use client";

import React, { useState } from "react";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { getTenantDomain } from "@/lib/workspace-config";

function TenantSettingsForms({
  tenantId,
  initialName,
  initialDomain,
  ownerName,
  ownerEmail,
  planName,
  planBroughtDate,
}: {
  tenantId: string;
  initialName: string;
  initialDomain: string;
  ownerName: string;
  ownerEmail: string;
  planName: string;
  planBroughtDate: string;
}) {
  const { mutate } = useQrewStore();
  const { showToast } = useUiFeedback();

  const [companyName, setCompanyName] = useState(initialName);
  const [domainInput, setDomainInput] = useState(initialDomain);

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = companyName.trim();
    if (!clean) return;
    mutate((s) => s.updateTenant(tenantId, { name: clean }));
    showToast("Company name updated successfully", "success");
  };

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = domainInput.trim();
    if (!clean) return;
    mutate((s) => s.updateTenant(tenantId, { domain: clean }));
    showToast("Custom domain updated successfully", "success");
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div className="page-title-group">
          <h1
            className="page-title"
            style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}
          >
            Settings
          </h1>
          <p
            className="page-subtitle"
            style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "4px" }}
          >
            Manage organization profile, primary domain routing, and active subscription plan.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "760px" }}>
        <div
          className="card"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: "0 0 16px 0",
            }}
          >
            Company Profile
          </h2>
          <form
            id="tenant-company-form"
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            onSubmit={handleCompanySubmit}
          >
            <div>
              <label
                htmlFor="tenant-name-input"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  marginBottom: "6px",
                }}
              >
                Company Name
              </label>
              <input
                type="text"
                id="tenant-name-input"
                className="form-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  background: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>
            <div>
              <label
                htmlFor="tenant-owner-name"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  marginBottom: "6px",
                }}
              >
                Account Owner
              </label>
              <input
                type="text"
                id="tenant-owner-name"
                className="form-input"
                value={ownerName}
                readOnly
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  background: "var(--color-surface)",
                  color: "var(--color-text-muted)",
                  fontSize: "14px",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div>
              <label
                htmlFor="tenant-owner-email"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  marginBottom: "6px",
                }}
              >
                Owner Email
              </label>
              <input
                type="email"
                id="tenant-owner-email"
                className="form-input"
                value={ownerEmail}
                readOnly
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "6px",
                  background: "var(--color-surface)",
                  color: "var(--color-text-muted)",
                  fontSize: "14px",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  background: "var(--color-accent)",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save Company Changes
              </button>
            </div>
          </form>
        </div>

        <div
          className="card"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: "0 0 16px 0",
            }}
          >
            Domain Configuration
          </h2>
          <form
            id="tenant-domain-form"
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            onSubmit={handleDomainSubmit}
          >
            <div>
              <label
                htmlFor="tenant-domain-input"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  marginBottom: "6px",
                }}
              >
                Custom Domain
              </label>
              <div
                className="form-domain-input-group"
                style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}
              >
                <input
                  type="text"
                  id="tenant-domain-input"
                  className="form-input"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  required
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    background: "var(--color-bg)",
                    color: "var(--color-text-primary)",
                    fontSize: "14px",
                  }}
                />
                <span
                  className="badge badge-active"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  <span className="badge-dot" />
                  SSL Active
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                Tenant landing and workspace traffic will resolve to this domain.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  background: "var(--color-accent)",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save Domain Settings
              </button>
            </div>
          </form>
        </div>

        <div
          className="card"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  margin: "0 0 4px 0",
                }}
              >
                Plan Brought
              </h2>
              <p style={{ fontSize: "13px", color: "var(--color-text-muted)", margin: 0 }}>
                Subscription license and tier entitlement tier
              </p>
            </div>
            <span
              className="badge badge-active"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 12px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              <span className="badge-dot" />
              Active Subscription
            </span>
          </div>

          <div
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "6px",
              padding: "16px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "2px" }}>
                Plan Name
              </div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                {planName}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "2px" }}>
                Billing Frequency
              </div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                Annual ($1,200/mo)
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "2px" }}>
                Provisioned On
              </div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                {planBroughtDate}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "2px" }}>
                Offices Entitlement
              </div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)" }}>
                Unlimited Branches
              </div>
            </div>
          </div>

          <div style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "4px" }}>
              Included Entitlements:
            </div>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              <li>Unlimited Branch Facilities &amp; Department Hierarchies</li>
              <li>Multi-tiered Role-Based Access Control (RBAC)</li>
              <li>Real-time Operations Mesh &amp; Facility Shift Handover</li>
              <li>Complete Audit Trail Log Retention (365 Days)</li>
              <li>Enterprise Priority Support &amp; 99.99% Uptime Guarantee</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export function TenantSettingsView({ tenantId }: { tenantId: string }) {
  const { store } = useQrewStore();
  const tenant = store.getTenantById(tenantId) || store.getTenants()[0];
  if (!tenant) return null;

  const currentDomain = getTenantDomain(store, tenant.id);
  return (
    <TenantSettingsForms
      key={`${tenant.id}-${tenant.name}-${currentDomain}`}
      tenantId={tenant.id}
      initialName={tenant.name}
      initialDomain={currentDomain}
      ownerName={tenant.ownerName || "Rafiqul Islam"}
      ownerEmail={tenant.ownerEmail || "rafiq@sst.com"}
      planName={tenant.plan || "Enterprise"}
      planBroughtDate={tenant.createdAt || "2026-09-12"}
    />
  );
}
