"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { DEMO_PERSONAS_ENABLED } from "@/components/shell/PersonaModal";
import { QrewIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/routes";
import { CreateMemberTaskModalContent } from "./MemberModals";

export function MemberView({ userId }: { userId: string }) {
  const router = useRouter();
  const { store, mutate } = useQrewStore();
  const { openModal, closeModal, showToast } = useUiFeedback();

  const user =
    store.getUserById(userId) || store.getUserById(store.getCurrentUser().id) || store.getUsers()[0];

  if (!user) return null;

  const officeStaffEntry = (store.data.officeStaff || []).find((os) => os.userId === user.id) || {
    officeId: "off_ctg_port",
    tenantId: "ten_sst",
    officeRole: "Office Staff",
  };
  const office = store.getOfficeById(officeStaffEntry.officeId) || {
    id: "off_ctg_port",
    name: "Chittagong Port Office",
  };
  const tenant = store.getTenantById(officeStaffEntry.tenantId) || {
    id: "ten_sst",
    name: "SST",
  };

  const deptMemberEntry = (store.data.departmentMembers || []).find((dm) => dm.userId === user.id);
  const dept = deptMemberEntry
    ? store.getDepartmentById(deptMemberEntry.deptId)
    : store.getDepartments(office.id)[0] || {
        id: "dept_ctg_ops",
        name: "Port Operations",
        code: "OPS",
        leadName: "Rafiqul Islam",
      };

  const resolvedDept = dept || {
    id: "dept_ctg_ops",
    name: "Port Operations",
    code: "OPS",
    leadName: "Rafiqul Islam",
  };

  const tasks = store.getMemberTasks(user.id);
  const activities = store.getMemberActivities(user.id);
  const completedTasksCount = tasks.filter((t) => t.status === "Completed").length;

  const handleAddDuty = () => {
    openModal({
      title: "Add Duty to My Daily Checklist",
      content: (
        <CreateMemberTaskModalContent
          userId={user.id}
          deptId={resolvedDept.id}
          onCancel={closeModal}
        />
      ),
    });
  };

  const handleToggleTask = (taskId: string) => {
    const updated = mutate((s) => s.toggleTaskStatus(taskId));
    if (updated) {
      showToast(`Task "${updated.title}" marked as ${updated.status}.`, "success");
    }
  };

  return (
    <div className="member-workspace-layout">
      <div className="member-hero-card">
        <div className="member-identity">
          <div className="member-large-avatar">{user.name.charAt(0)}</div>
          <div className="member-identity-info">
            <div
              style={{
                fontSize: "12px",
                color: "var(--color-text-muted)",
                marginBottom: "3px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
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
              <Link
                href={routes.department(resolvedDept.id, "overview")}
                style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
              >
                {resolvedDept.name}
              </Link>
            </div>
            <h2>{user.name}</h2>
            <div className="member-identity-tags">
              <span className="badge badge-role office">
                {deptMemberEntry ? deptMemberEntry.deptRole : officeStaffEntry.officeRole}
              </span>
              <span
                className="badge"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  fontSize: "11.5px",
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {resolvedDept.code} Division
              </span>
              <span style={{ fontSize: "12.5px", color: "var(--color-text-muted)" }}>
                {user.email}
              </span>
            </div>
          </div>
        </div>
        <div className="member-shift-indicator">
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--color-text-muted)",
                fontWeight: 600,
              }}
            >
              Today&apos;s Assigned Shift
            </span>
            <strong style={{ fontSize: "13.5px", color: "var(--color-text-primary)" }}>
              {deptMemberEntry ? deptMemberEntry.shift : "Morning (08:00 - 16:00)"}
            </strong>
          </div>
          <div
            style={{
              borderLeft: "1px solid var(--color-border)",
              paddingLeft: "12px",
              marginLeft: "6px",
            }}
          >
            <span className="badge badge-active" style={{ fontSize: "11px" }}>
              <span className="badge-dot" />
              Checked In
            </span>
          </div>
        </div>
      </div>

      <div
        className="config-banner-card"
        style={{
          padding: "12px 18px",
          justifyContent: DEMO_PERSONAS_ENABLED ? undefined : "flex-end",
        }}
      >
        {DEMO_PERSONAS_ENABLED ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 700,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginRight: "4px",
              }}
            >
              Switch Member:
            </span>
            {store
              .getUsers()
              .slice(0, 5)
              .map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className={`btn btn-sm ${
                    u.id === user.id ? "btn-primary" : "btn-secondary"
                  } switch-member-btn`}
                  onClick={() => router.push(routes.member(u.id, "overview"))}
                >
                  {u.name}
                </button>
              ))}
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href={routes.tenantLanding(tenant.id)} className="btn btn-secondary btn-sm">
            &larr; {tenant.name} Landing
          </Link>
          <Link
            href={routes.department(resolvedDept.id, "overview")}
            className="btn btn-secondary btn-sm"
          >
            &larr; Return to Department Hub
          </Link>
        </div>
      </div>

      <div
        className="member-workspace-grid"
        style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}
      >
        <div className="card">
          <div
            className="card-header"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <div>
              <h2 className="card-title">My Today&apos;s Assigned Duties</h2>
              <p className="card-subtitle">
                {completedTasksCount} of {tasks.length} duties completed today
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              id="btn-add-member-task"
              onClick={handleAddDuty}
            >
              <QrewIcon name="plus" /> Add Task
            </button>
          </div>

          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tasks.length === 0 ? (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                    fontSize: "13px",
                  }}
                >
                  No duties currently assigned for this shift. Add one above.
                </div>
              ) : (
                tasks.map((t) => {
                  const isDone = t.status === "Completed";
                  return (
                    <div
                      key={t.id}
                      className={`member-checklist-item${isDone ? " completed" : ""}`}
                    >
                      <button
                        type="button"
                        className="member-checklist-checkbox member-toggle-task"
                        title="Toggle completion"
                        onClick={() => handleToggleTask(t.id)}
                      >
                        {isDone ? <QrewIcon name="check" /> : null}
                      </button>
                      <div className="member-checklist-content">
                        <div className="member-checklist-title">{t.title}</div>
                        <div className="member-checklist-sub">
                          <span>
                            Category: <strong>{t.category}</strong>
                          </span>
                          <span style={{ margin: "0 5px" }}>•</span>
                          <span>
                            Due: <strong>{t.dueTime}</strong>
                          </span>
                        </div>
                      </div>
                      <span
                        className={`badge ${
                          t.priority === "High" ? "badge-role platform" : "badge-role tenant"
                        }`}
                        style={{ fontSize: "10px" }}
                      >
                        {t.priority}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: "14.5px" }}>
                My Department &amp; Team
              </h2>
              <p className="card-subtitle">{resolvedDept.name} Division</p>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="member-contact-card">
                  <div className="member-contact-avatar">L</div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {resolvedDept.leadName}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      Department Supervisor
                    </div>
                  </div>
                </div>
                <div className="member-contact-card">
                  <div className="member-contact-avatar">M</div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {office.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      Dispatch Desk ({officeStaffEntry.officeRole})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title" style={{ fontSize: "14.5px" }}>
                Activity &amp; Timeclock
              </h2>
              <p className="card-subtitle">Recent shift events</p>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {activities.length === 0 ? (
                  <div
                    style={{
                      fontSize: "12.5px",
                      color: "var(--color-text-muted)",
                      textAlign: "center",
                      padding: "12px",
                    }}
                  >
                    No shift activity recorded yet.
                  </div>
                ) : (
                  activities.slice(0, 4).map((a) => (
                    <div key={a.id} style={{ display: "flex", gap: "10px", fontSize: "12.5px" }}>
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "var(--color-accent)",
                          marginTop: "6px",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
                          {a.title}
                        </div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: "11.5px" }}>
                          {a.description}
                        </div>
                        <div
                          style={{
                            fontSize: "10.5px",
                            color: "var(--color-text-muted)",
                            marginTop: "2px",
                          }}
                        >
                          {a.timestamp}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
