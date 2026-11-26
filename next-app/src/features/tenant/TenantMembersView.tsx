"use client";

import React from "react";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { EmptyState, RoleBadge, StatusBadge } from "@/components/ui/Badges";
import { QrewIcon } from "@/components/ui/Icons";
import {
  AddTenantMemberModalContent,
  ChangeTenantRoleModalContent,
} from "./TenantMemberOfficeModals";
import { TenantNotFoundCard } from "./TenantNotFoundCard";

export function TenantMembersView({ tenantId }: { tenantId: string }) {
  const { store, mutate } = useQrewStore();
  const { openModal, closeModal, confirmDialog, showToast } = useUiFeedback();

  const tenant = store.getTenantById(tenantId);
  if (!tenant) {
    return <TenantNotFoundCard tenantId={tenantId} />;
  }

  const members = store.getTenantMembers(tenant.id);

  const handleOpenAddMember = () => {
    openModal({
      title: `Add Member to ${tenant.name}`,
      content: <AddTenantMemberModalContent tenantId={tenant.id} onCancel={closeModal} />,
    });
  };

  const handleOpenChangeRole = (userId: string, userName: string, currentRole: string) => {
    openModal({
      title: `Change Tenant Role: ${userName}`,
      content: (
        <ChangeTenantRoleModalContent
          tenantId={tenant.id}
          userId={userId}
          currentRole={currentRole}
          onCancel={closeModal}
        />
      ),
    });
  };

  const handleRemoveMember = (userId: string, name: string) => {
    confirmDialog({
      title: "Remove Tenant Member",
      message: `Are you sure you want to remove "${name}" from this tenant? Business rule cascade: They will also be removed from any offices in this tenant!`,
      confirmText: "Remove Member",
      confirmClass: "btn-danger",
      onConfirm: () => {
        mutate((s) => s.removeTenantMember(tenant.id, userId));
        showToast(`Removed "${name}" from tenant and child offices.`, "success");
      },
    });
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Tenant Members</h1>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            id="btn-add-tenant-member"
            onClick={handleOpenAddMember}
          >
            <QrewIcon name="plus" /> Add Member
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email</th>
              <th>Tenant Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No members in this tenant"
                    description="Add members to this organization to allow office assignments and access."
                  />
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id}>
                  <td>
                    <strong>{m.user.name}</strong>
                  </td>
                  <td>{m.user.email}</td>
                  <td>
                    <RoleBadge roleName={m.tenantRole} level="tenant" />
                  </td>
                  <td>
                    <StatusBadge status={m.status} />
                  </td>
                  <td>{m.joinedAt}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          handleOpenChangeRole(m.userId, m.user.name, m.tenantRole)
                        }
                      >
                        Change Role
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn danger"
                        title="Remove Member"
                        onClick={() => handleRemoveMember(m.userId, m.user.name)}
                      >
                        <QrewIcon name="trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
