"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { QrewIcon } from "@/components/ui/Icons";

export function CreateTenantModalContent({
  onCreated,
  onCancel,
}: {
  onCreated?: (tenantId: string) => void;
  onCancel: () => void;
}) {
  const { mutate } = useQrewStore();
  const { showToast, closeModal } = useUiFeedback();

  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [plan, setPlan] = useState("Enterprise");
  const [status, setStatus] = useState("Active");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanName = name.trim();
    const cleanOwner = ownerName.trim();
    const cleanEmail = ownerEmail.trim();

    if (!cleanName || !cleanOwner || !cleanEmail) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    try {
      const created = mutate((s) =>
        s.createTenant({
          name: cleanName,
          ownerName: cleanOwner,
          ownerEmail: cleanEmail,
          plan,
          status,
        })
      );
      closeModal();
      showToast(`Tenant "${created.name}" successfully created!`, "success");
      onCreated?.(created.id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create tenant.");
    }
  };

  return (
    <>
      <div className="modal-body" id="modal-body">
        <div className="notice-box" style={{ marginBottom: "12px" }}>
          <QrewIcon name="info" />
          <div>
            <strong>Separation of Duties:</strong> The tenant owner is automatically provisioned as
            Tenant Admin. A Platform Owner (such as Sakib) cannot be assigned as a Tenant Owner or
            Tenant Admin.
          </div>
        </div>

        {errorMsg ? (
          <div
            style={{
              background: "var(--color-danger-bg)",
              border: "1px solid var(--color-danger-border)",
              color: "var(--color-danger)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 12px",
              fontSize: "12.5px",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <QrewIcon name="alert" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        <form id="create-tenant-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Tenant / Organization Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Acme Corporation"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg(null);
              }}
              required
            />
            <span className="form-hint">A unique namespace will be established for this tenant.</span>
          </div>
          <div className="form-group" style={{ marginTop: "14px" }}>
            <label className="form-label">
              Owner Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sarah Jenkins"
              value={ownerName}
              onChange={(e) => {
                setOwnerName(e.target.value);
                setErrorMsg(null);
              }}
              required
            />
          </div>
          <div className="form-group" style={{ marginTop: "14px" }}>
            <label className="form-label">
              Owner Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. sarah@acme.com"
              value={ownerEmail}
              onChange={(e) => {
                setOwnerEmail(e.target.value);
                setErrorMsg(null);
              }}
              required
            />
            <span className="form-hint">
              Owner will automatically be assigned as Tenant Admin. Must not be a Platform Owner.
            </span>
          </div>
          <div className="form-group" style={{ marginTop: "14px" }}>
            <label className="form-label">Subscription Plan</label>
            <select
              className="form-select"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="Starter">Starter (Small Teams)</option>
              <option value="Standard">Standard (Growing Teams)</option>
              <option value="Professional">Professional (Advanced Operations)</option>
              <option value="Enterprise">Enterprise (Large Organizations)</option>
            </select>
          </div>
          <div className="form-group" style={{ marginTop: "14px" }}>
            <label className="form-label">Tenant Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={() => handleSubmit()}>
          Create Tenant
        </button>
      </div>
    </>
  );
}

export function EditTenantModalContent({
  tenantId,
  onCancel,
}: {
  tenantId: string;
  onCancel: () => void;
}) {
  const { store, mutate } = useQrewStore();
  const { showToast, closeModal } = useUiFeedback();
  const tenant = store.getTenantById(tenantId);

  const normalizePlan = (rawPlan?: string) => {
    const p = (rawPlan || "Enterprise").toLowerCase();
    if (p.includes("starter") || p.includes("01")) return "Starter";
    if (p.includes("standard") || p.includes("02")) return "Standard";
    if (p.includes("professional") || p.includes("03")) return "Professional";
    return "Enterprise";
  };

  const [plan, setPlan] = useState(normalizePlan(tenant?.plan));
  const [status, setStatus] = useState(tenant?.status || "Active");

  if (!tenant) return null;

  const handleSave = () => {
    mutate((s) => s.updateTenant(tenantId, { status, plan }));
    closeModal();
    showToast(`Tenant "${tenant.name}" updated successfully.`, "success");
  };

  return (
    <>
      <div className="modal-body" id="modal-body">
        <form>
          <div className="form-group">
            <label className="form-label">Tenant Name</label>
            <input
              type="text"
              className="form-input"
              value={tenant.name}
              readOnly
              disabled
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-muted)",
                cursor: "not-allowed",
                opacity: 0.9,
              }}
            />
            <span className="form-hint">Tenant organization name cannot be edited.</span>
          </div>
          <div className="form-group" style={{ marginTop: "14px" }}>
            <label className="form-label">Subscription Plan</label>
            <select
              className="form-select"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="Starter">Starter (Small Teams)</option>
              <option value="Standard">Standard (Growing Teams)</option>
              <option value="Professional">Professional (Advanced Operations)</option>
              <option value="Enterprise">Enterprise (Large Organizations)</option>
            </select>
            <span className="form-hint">Selected subscription tier and operational entitlements.</span>
          </div>
          <div className="form-group" style={{ marginTop: "14px" }}>
            <label className="form-label">Tenant Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </>
  );
}

export function OwnerProfileModalContent({ tenantId }: { tenantId: string }) {
  const { store } = useQrewStore();
  const tenant = store.getTenantById(tenantId) || {
    id: tenantId,
    name: "SST",
    ownerName: "Rafiqul Islam",
    ownerEmail: "rafiq@sst.com",
    phone: "+880 1711-234567",
    address: "Port Access Road, Agrabad C/A, Chittagong",
    plan: "Enterprise",
  };
  const ownerName = tenant.ownerName || "Rafiqul Islam";

  const user = store.data.users.find(
    (u) => u.name === ownerName || u.email === tenant.ownerEmail
  ) || {
    id: "usr_rafiq",
    name: ownerName,
    email: tenant.ownerEmail || "rafiq@sst.com",
    phone: "+880 1711-234567",
    platformRole: "Platform User",
    status: "Active",
    createdAt: "2026-10-02",
  };

  const tenantMember = store.data.tenantMembers.find(
    (m) => m.tenantId === tenant.id && (m.userId === user.id || user.name === ownerName)
  );
  const tenantRole = tenantMember ? tenantMember.tenantRole : "Tenant Admin";

  const phone = tenant.phone || user.phone || "+880 1711-234567";
  const address = tenant.address || "Port Access Road, Agrabad C/A, Chittagong";
  const plan = tenant.plan || "Enterprise";
  const planSubtext =
    plan === "Starter"
      ? "Small Teams"
      : plan === "Standard"
        ? "Growing Teams"
        : plan === "Professional"
          ? "Advanced Operations"
          : "Large Organizations";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "16px 18px",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "var(--radius-md)",
            background: "var(--panel-accent, var(--color-accent))",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: 700,
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(13,148,136,0.25)",
          }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <h3
              style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              {user.name}
            </h3>
            <span className="badge badge-success" style={{ fontSize: "11px" }}>
              {user.status || "Active"}
            </span>
          </div>
          <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "3px" }}>
            {user.email || "rafiq@sst.com"} &bull;{" "}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{user.id}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
        <div
          style={{
            background: "var(--color-surface-white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              color: "var(--color-text-muted)",
              marginBottom: "4px",
            }}
          >
            Organization
          </div>
          <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {tenant.name}
          </div>
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Organization Owner</div>
        </div>

        <div
          style={{
            background: "var(--color-surface-white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              color: "var(--color-text-muted)",
              marginBottom: "4px",
            }}
          >
            Tenant Role
          </div>
          <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-accent)" }}>
            {tenantRole}
          </div>
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            Full Tenant Administration
          </div>
        </div>

        <div
          style={{
            background: "var(--color-surface-white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              color: "var(--color-text-muted)",
              marginBottom: "4px",
            }}
          >
            Phone
          </div>
          <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {phone}
          </div>
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Primary Contact</div>
        </div>

        <div
          style={{
            background: "var(--color-surface-white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              color: "var(--color-text-muted)",
              marginBottom: "4px",
            }}
          >
            Address
          </div>
          <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {address}
          </div>
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            Headquarters / Facility
          </div>
        </div>

        <div
          style={{
            gridColumn: "1 / -1",
            background: "var(--color-surface-white)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              color: "var(--color-text-muted)",
              marginBottom: "4px",
            }}
          >
            Subscription Plan
          </div>
          <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {plan}
          </div>
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{planSubtext}</div>
        </div>
      </div>
    </div>
  );
}

export function GithubDeleteModalContent({
  tenantId,
  onCancel,
}: {
  tenantId: string;
  onCancel: () => void;
}) {
  const { store, mutate } = useQrewStore();
  const { showToast, closeModal } = useUiFeedback();
  const tenant = store.getTenantById(tenantId);

  const [typedEmail, setTypedEmail] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, []);

  if (!tenant) return null;

  const ownerEmail = (tenant.ownerEmail || "rafiq@sst.com").trim();
  const offices = store.getOfficesByTenant(tenantId) || [];
  const members = store.getTenantMembers(tenantId) || [];
  const isMatched = typedEmail.trim().toLowerCase() === ownerEmail.toLowerCase();

  const handleConfirmDelete = () => {
    if (!isMatched) return;
    try {
      mutate((s) => s.deleteTenant(tenantId));
      closeModal();
      showToast(`Organization "${tenant.name}" permanently deleted.`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", "danger");
    }
  };

  return (
    <>
      <div className="modal-body" id="modal-body">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.28)",
              borderRadius: "var(--radius-sm)",
              padding: "14px 16px",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <div style={{ color: "var(--color-danger)", flexShrink: 0, marginTop: "2px" }}>
              <QrewIcon name="alert" />
            </div>
            <div style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--color-text-primary)" }}>
              <div style={{ fontWeight: 600, color: "var(--color-danger)", marginBottom: "4px" }}>
                Warning: This action cannot be undone
              </div>
              This will permanently delete <strong>{tenant.name}</strong> ({tenant.id}), including{" "}
              <strong>
                {offices.length} branch office{offices.length === 1 ? "" : "s"}
              </strong>{" "}
              and{" "}
              <strong>
                {members.length} member assignment{members.length === 1 ? "" : "s"}
              </strong>
              .
            </div>
          </div>

          <div style={{ fontSize: "13.5px", color: "var(--color-text-primary)", lineHeight: 1.5 }}>
            To confirm deletion, please enter the owner email address below:
            <div
              style={{
                marginTop: "8px",
                padding: "8px 12px",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                fontFamily: "monospace",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                userSelect: "all",
                display: "inline-block",
              }}
            >
              {ownerEmail}
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label
              className="form-label"
              htmlFor="github-delete-email-input"
              style={{ fontSize: "12.5px", fontWeight: 500 }}
            >
              Type the owner&apos;s email to proceed:
            </label>
            <input
              ref={inputRef}
              type="text"
              id="github-delete-email-input"
              className="form-input"
              placeholder={ownerEmail}
              autoComplete="off"
              spellCheck={false}
              style={{ width: "100%", fontFamily: "monospace", fontSize: "13px" }}
              value={typedEmail}
              onChange={(e) => setTypedEmail(e.target.value)}
            />
            <div
              style={{
                fontSize: "11.5px",
                marginTop: "6px",
                minHeight: "16px",
                color: isMatched
                  ? "var(--color-accent)"
                  : typedEmail.trim().length > 0
                    ? "var(--color-danger)"
                    : "var(--color-text-muted)",
              }}
            >
              {isMatched
                ? "✓ Email matches. You may now permanently delete."
                : typedEmail.trim().length > 0
                  ? "Email address does not match."
                  : "Enter exact email address to enable the delete button."}
            </div>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
            width: "100%",
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn-danger${isMatched ? "" : " disabled"}`}
            disabled={!isMatched}
            style={{
              opacity: isMatched ? 1 : 0.45,
              cursor: isMatched ? "pointer" : "not-allowed",
            }}
            onClick={handleConfirmDelete}
          >
            <QrewIcon name="trash" /> I understand, delete this organization
          </button>
        </div>
      </div>
    </>
  );
}

export function CreateOfficeModalContent({
  tenantId,
  onCancel,
}: {
  tenantId: string;
  onCancel: () => void;
}) {
  const { store, mutate } = useQrewStore();
  const { showToast, closeModal } = useUiFeedback();
  const tenant = store.getTenantById(tenantId);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!tenant) return null;

  const handleCreate = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg("Office name is required.");
      return;
    }
    try {
      const office = mutate((s) =>
        s.createOffice(tenantId, { name: cleanName, location: location.trim() })
      );
      closeModal();
      showToast(`Office "${office.name}" created under ${tenant.name}!`, "success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to create office.");
    }
  };

  return (
    <>
      <div className="modal-body" id="modal-body">
        {errorMsg ? (
          <div
            style={{
              background: "var(--color-danger-bg)",
              border: "1px solid var(--color-danger-border)",
              color: "var(--color-danger)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 12px",
              fontSize: "12.5px",
              marginBottom: "12px",
            }}
          >
            {errorMsg}
          </div>
        ) : null}
        <form id="create-office-form" onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">
              Office / Branch Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Downtown Regional Office"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg(null);
              }}
              required
            />
          </div>
          <div className="form-group" style={{ marginTop: "14px" }}>
            <label className="form-label">Location / Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 450 Market Street, Suite 800"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={() => handleCreate()}>
          Create Office
        </button>
      </div>
    </>
  );
}
