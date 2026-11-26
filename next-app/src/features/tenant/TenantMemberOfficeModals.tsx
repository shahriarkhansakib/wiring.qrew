"use client";

import React, { useState } from "react";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { QrewIcon } from "@/components/ui/Icons";

export function EditOfficeModalContent({
  officeId,
  onCancel,
}: {
  officeId: string;
  onCancel: () => void;
}) {
  const { store, mutate } = useQrewStore();
  const { showToast, closeModal } = useUiFeedback();
  const office = store.getOfficeById(officeId);

  const [name, setName] = useState(office?.name || "");
  const [location, setLocation] = useState(office?.location || "");
  const [status, setStatus] = useState(office?.status || "Active");

  if (!office) return null;

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    mutate((s) =>
      s.updateOffice(officeId, { name: cleanName, location: location.trim(), status }, office.tenantId)
    );
    closeModal();
    showToast(`Office "${cleanName}" updated.`, "success");
  };

  return (
    <>
      <div className="modal-body" id="modal-body">
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">
              Office Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginTop: "14px" }}>
            <label className="form-label">Location / Address</label>
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginTop: "14px" }}>
            <label className="form-label">Office Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={() => handleSave()}>
          Save Changes
        </button>
      </div>
    </>
  );
}

export function AddTenantMemberModalContent({
  tenantId,
  onCancel,
}: {
  tenantId: string;
  onCancel: () => void;
}) {
  const { store, mutate } = useQrewStore();
  const { showToast, closeModal } = useUiFeedback();
  const tenant = store.getTenantById(tenantId);

  const allUsers = store.getPlatformUsers();
  const existingIds = tenant ? tenant.members.map((m) => m.userId) : [];
  const nonMemberUsers = allUsers.filter((u) => !existingIds.includes(u.id));

  const [selectedUserId, setSelectedUserId] = useState("");
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [tenantRole, setTenantRole] = useState("Tenant Member");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!tenant) return null;

  const selectedUser = nonMemberUsers.find((u) => u.id === selectedUserId);
  const isPlatformOwner = selectedUser?.platformRole === "Platform Owner";

  const handleUserChange = (nextId: string) => {
    setSelectedUserId(nextId);
    setErrorMsg(null);
    const nextUser = nonMemberUsers.find((u) => u.id === nextId);
    if (nextUser?.platformRole === "Platform Owner" && tenantRole === "Tenant Admin") {
      setTenantRole("Tenant Member");
    }
  };

  const handleSubmit = () => {
    if (!selectedUserId && !customEmail.trim()) {
      setErrorMsg("Please select an existing user or enter a valid email.");
      return;
    }

    try {
      mutate((s) =>
        s.addTenantMember(tenantId, {
          userId: selectedUserId || undefined,
          name: customName.trim() || undefined,
          email: customEmail.trim() || undefined,
          tenantRole,
        })
      );
      closeModal();
      showToast(`Member added to ${tenant.name}!`, "success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to add member.");
    }
  };

  return (
    <>
      <div className="modal-body" id="modal-body">
        <div className="notice-box" style={{ marginBottom: "12px" }}>
          <QrewIcon name="info" />
          <div>
            <strong>Access Rule:</strong> A Platform Owner cannot be assigned as a Tenant Admin.
            Platform governance remains decoupled from tenant administration.
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
            }}
          >
            {errorMsg}
          </div>
        ) : null}

        <div className="form-group">
          <label className="form-label">Select Existing Platform User</label>
          <select
            className="form-select"
            value={selectedUserId}
            onChange={(e) => handleUserChange(e.target.value)}
          >
            <option value="">-- Choose User (or type email below) --</option>
            {nonMemberUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email}) [{u.platformRole}]
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: "var(--color-text-muted)",
            margin: "8px 0",
          }}
        >
          — OR INVITE NEW USER —
        </div>

        <div className="form-group">
          <label className="form-label">New User Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Asif Mahmud"
            value={customName}
            onChange={(e) => {
              setCustomName(e.target.value);
              setErrorMsg(null);
            }}
          />
        </div>

        <div className="form-group" style={{ marginTop: "10px" }}>
          <label className="form-label">New User Email</label>
          <input
            type="email"
            className="form-input"
            placeholder="e.g. asif@company.com"
            value={customEmail}
            onChange={(e) => {
              setCustomEmail(e.target.value);
              setErrorMsg(null);
            }}
          />
        </div>

        <div className="form-group" style={{ marginTop: "14px" }}>
          <label className="form-label">
            Tenant Role <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={tenantRole}
            onChange={(e) => setTenantRole(e.target.value)}
          >
            <option value="Tenant Member">Tenant Member</option>
            <option value="Tenant Manager">Tenant Manager</option>
            <option value="Tenant Admin" disabled={isPlatformOwner}>
              Tenant Admin
            </option>
          </select>
          {isPlatformOwner ? (
            <span className="form-hint" style={{ color: "var(--color-warning)" }}>
              Platform Owners cannot be assigned the Tenant Admin role.
            </span>
          ) : null}
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>
          Add Member
        </button>
      </div>
    </>
  );
}

export function ChangeTenantRoleModalContent({
  tenantId,
  userId,
  currentRole,
  onCancel,
}: {
  tenantId: string;
  userId: string;
  currentRole: string;
  onCancel: () => void;
}) {
  const { store, mutate } = useQrewStore();
  const { showToast, closeModal } = useUiFeedback();

  const user = store.data.users.find((u) => u.id === userId);
  const isPlatformOwner = Boolean(user && user.platformRole === "Platform Owner");

  const [newRole, setNewRole] = useState(currentRole);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = () => {
    try {
      mutate((s) => s.updateTenantMemberRole(tenantId, userId, newRole));
      closeModal();
      showToast(`Tenant role updated to ${newRole}.`, "success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update role.");
    }
  };

  return (
    <>
      <div className="modal-body" id="modal-body">
        {isPlatformOwner && user ? (
          <div className="notice-box" style={{ marginBottom: "12px" }}>
            <QrewIcon name="alert" />
            <div>
              <strong>Role Restriction:</strong> &quot;{user.name}&quot; is a Platform Owner. A
              Platform Owner cannot be assigned the Tenant Admin role.
            </div>
          </div>
        ) : null}

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

        <div className="form-group">
          <label className="form-label">Select New Tenant Role</label>
          <select
            className="form-select"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="Tenant Member">Tenant Member</option>
            <option value="Tenant Manager">Tenant Manager</option>
            <option value="Tenant Admin" disabled={isPlatformOwner}>
              Tenant Admin {isPlatformOwner ? "(Restricted for Platform Owner)" : ""}
            </option>
          </select>
          <span className="form-hint">Applies scoped access control inside this tenant.</span>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleUpdate}>
          Update Role
        </button>
      </div>
    </>
  );
}
