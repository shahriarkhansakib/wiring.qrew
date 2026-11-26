"use client";

import React from "react";
import Link from "next/link";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { EmptyState, RoleBadge, StatusBadge } from "@/components/ui/Badges";
import { QrewIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/routes";
import {
  AssignDeptMemberModalContent,
  CreateDeptTaskModalContent,
} from "./DepartmentModals";

export function DepartmentView({ deptId }: { deptId: string }) {
  const { store, mutate } = useQrewStore();
  const { openModal, closeModal, showToast } = useUiFeedback();

  const dept = store.getDepartmentById(deptId) || store.getDepartments()[0];
  if (!dept) {
    return (
      <div className="empty-state">
        <div className="empty-title">Department Not Found</div>
        <div className="empty-desc">
          Provision a department in the Office Configuration Centre first.
        </div>
      </div>
    );
  }

  const office = store.getOfficeById(dept.officeId) || {
    id: dept.officeId,
    name: "Office Branch",
    tenantId: "ten_sst",
  };
  const tenant = store.getTenantById(office.tenantId) || {
    id: office.tenantId,
    name: "Tenant Organization",
  };
  const deptMembers = store.getDepartmentMembers(dept.id);
  const tasks = store.getTasksByDepartment(dept.id);
  const onDutyCount = deptMembers.filter((m) => m.status === "On Duty").length;
  const pendingTasksCount = tasks.filter((t) => t.status !== "Completed").length;

  const handleOpenAddTask = () => {
    openModal({
      title: `Add Operational Task to ${dept.name}`,
      content: <CreateDeptTaskModalContent deptId={dept.id} onCancel={closeModal} />,
    });
  };

  const handleOpenAssignStaff = () => {
    openModal({
      title: `Assign Staff to ${dept.name}`,
      content: <AssignDeptMemberModalContent deptId={dept.id} onCancel={closeModal} />,
    });
  };

  const handleToggleTask = (taskId: string) => {
    const updated = mutate((s) => s.toggleTaskStatus(taskId));
    if (updated) {
      showToast(`Task status updated to ${updated.status}.`, "success");
    }
  };

  return (
    <>
      <div className="dept-header-card">
        <div className="dept-header-left">
          <div className="dept-badge-icon">{dept.code}</div>
          <div className="dept-title-group">
            <div className="dept-breadcrumb">
              <Link
                href={routes.tenantLanding(tenant.id)}
                style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
              >
                {tenant.name}
              </Link>
              <span>/</span>
              <Link
                href={routes.office(tenant.id, office.id, "overview")}
                style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
              >
                {office.name}
              </Link>
              <span>/</span>
              <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
                Department Hub
              </span>
            </div>
            <h2>{dept.name}</h2>
            <div
              style={{
                fontSize: "12.5px",
                color: "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginTop: "2px",
              }}
            >
              <span>
                Supervisor: <strong style={{ color: "var(--color-text-primary)" }}>{dept.leadName}</strong>
              </span>
              <span>
                Status: <StatusBadge status={dept.status} />
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href={routes.tenantLanding(tenant.id)} className="btn btn-secondary btn-sm">
            &larr; {tenant.name} Landing
          </Link>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            id="btn-add-dept-task"
            onClick={handleOpenAddTask}
          >
            <QrewIcon name="plus" /> Add Task to Queue
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            id="btn-assign-dept-member"
            onClick={handleOpenAssignStaff}
          >
            <QrewIcon name="users" /> Assign Staff
          </button>
        </div>
      </div>

      <div className="dept-kpi-row" style={{ margin: "20px 0" }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Assigned Personnel</span>
            <div className="metric-icon-wrap">
              <QrewIcon name="users" />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-value">{deptMembers.length}</div>
            <div className="metric-subtext">Capacity: {dept.capacity} staff</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Active On Duty</span>
            <div className="metric-icon-wrap" style={{ color: "var(--color-success)" }}>
              <QrewIcon name="check" />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-value">{onDutyCount}</div>
            <div className="metric-subtext">Currently on shift</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Queue Backlog</span>
            <div className="metric-icon-wrap" style={{ color: "var(--color-accent)" }}>
              <QrewIcon name="audit" />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-value">{pendingTasksCount}</div>
            <div className="metric-subtext">Tasks pending execution</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Shift Coverage</span>
            <div className="metric-icon-wrap">
              <QrewIcon name="overview" />
            </div>
          </div>
          <div className="metric-value-row">
            <div className="metric-value">100%</div>
            <div className="metric-subtext">Rotations active</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
        <div
          className="card-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <h2 className="card-title">Department Personnel Roster</h2>
            <p className="card-subtitle">
              Staff assigned to this department with specialized operational roles
            </p>
          </div>
          <span
            className="badge"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              fontSize: "11.5px",
            }}
          >
            {deptMembers.length} Active Staff
          </span>
        </div>

        <div className="table-wrapper" style={{ border: "none" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Personnel Name</th>
                <th>Email</th>
                <th>Department Role</th>
                <th>Assigned Shift</th>
                <th>Duty Status</th>
                <th style={{ textAlign: "right" }}>Member Workspace</th>
              </tr>
            </thead>
            <tbody>
              {deptMembers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No Personnel Assigned"
                      description="Assign staff members to this department to build the operational team."
                    />
                  </td>
                </tr>
              ) : (
                deptMembers.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          className="user-avatar"
                          style={{ width: "28px", height: "28px", fontSize: "11px" }}
                        >
                          {m.user.name.charAt(0)}
                        </div>
                        <strong>{m.user.name}</strong>
                      </div>
                    </td>
                    <td>{m.user.email}</td>
                    <td>
                      <RoleBadge roleName={m.deptRole} level="office" />
                    </td>
                    <td>{m.shift}</td>
                    <td>
                      <StatusBadge status={m.status === "On Duty" ? "Active" : "Suspended"} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={routes.member(m.userId, "overview")}
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: "11.5px",
                          padding: "3px 8px",
                          gap: "5px",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        title={`Launch Personal Workspace for ${m.user.name}`}
                      >
                        <span>Personal Workspace</span>
                        <span style={{ fontSize: "10px" }}>&rarr;</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div
          className="card-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <h2 className="card-title">Daily Operational Task Queue</h2>
            <p className="card-subtitle">
              Assigned tasks and field duties running across the current operational window
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            id="btn-quick-add-task"
            onClick={handleOpenAddTask}
          >
            <QrewIcon name="plus" /> New Task
          </button>
        </div>

        <div className="card-body">
          <div className="dept-queue-grid">
            {tasks.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                  fontSize: "13px",
                }}
              >
                No operational tasks currently in queue. Add the first task above.
              </div>
            ) : (
              tasks.map((t) => {
                const isDone = t.status === "Completed";
                return (
                  <div className="dept-task-card" key={t.id}>
                    <div className="dept-task-left">
                      <button
                        type="button"
                        className="member-checklist-checkbox toggle-task-btn"
                        title="Toggle status"
                        style={
                          isDone
                            ? {
                                background: "var(--color-accent)",
                                borderColor: "var(--color-accent)",
                                color: "#fff",
                              }
                            : undefined
                        }
                        onClick={() => handleToggleTask(t.id)}
                      >
                        {isDone ? <QrewIcon name="check" /> : null}
                      </button>
                      <div>
                        <div
                          className="dept-task-title"
                          style={
                            isDone ? { textDecoration: "line-through", opacity: 0.7 } : undefined
                          }
                        >
                          {t.title}
                        </div>
                        <div className="dept-task-meta">
                          <span>
                            Category: <strong>{t.category}</strong>
                          </span>
                          <span style={{ margin: "0 6px" }}>•</span>
                          <span>
                            Due: <strong>{t.dueTime}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="dept-task-actions">
                      <span
                        className={`badge ${
                          t.priority === "High" ? "badge-role platform" : "badge-role tenant"
                        }`}
                        style={{ fontSize: "10.5px" }}
                      >
                        {t.priority}
                      </span>
                      <StatusBadge status={isDone ? "Active" : "Suspended"} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
