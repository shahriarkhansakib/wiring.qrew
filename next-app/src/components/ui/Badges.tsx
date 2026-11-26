import React from "react";
import { QrewIcon } from "./Icons";

export function StatusBadge({ status }: { status?: string }) {
  const s = (status || "Active").toLowerCase();
  let cls = "badge-suspended";
  if (s === "active") cls = "badge-active";
  else if (s === "trial") cls = "badge-trial";
  else if (s === "pending") cls = "badge-pending";
  else if (s === "expired") cls = "badge-expired";
  else if (s === "suspended") cls = "badge-suspended";
  else if (s === "cancelled") cls = "badge-cancelled";

  return (
    <span className={`badge ${cls}`}>
      <span className="badge-dot" />
      {status || "Active"}
    </span>
  );
}

export function RoleBadge({ roleName, level = "tenant" }: { roleName: string; level?: string }) {
  return <span className={`badge-role ${level}`}>{roleName}</span>;
}

export function ActionBadge({ action }: { action: string }) {
  let cls = "action-update";
  if (action.includes("CREATE") || action.includes("ADD")) cls = "action-create";
  if (action.includes("DELETE") || action.includes("REMOVE")) cls = "action-delete";
  if (action.includes("STATUS")) cls = "action-status";

  return <span className={`badge-action ${cls}`}>{action}</span>;
}

export function EmptyState({
  title = "No records found",
  description = "There are no items matching this criteria.",
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <QrewIcon name="info" />
      </div>
      <div className="empty-title">{title}</div>
      <div className="empty-desc">{description}</div>
      {action ? <div style={{ marginTop: "6px" }}>{action}</div> : null}
    </div>
  );
}

export function BlankTitledPage({ title }: { title: string }) {
  return (
    <div className="page-header" style={{ marginBottom: "24px" }}>
      <div className="page-title-group">
        <h1
          className="page-title"
          style={{ fontSize: "24px", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}
        >
          {title}
        </h1>
      </div>
    </div>
  );
}
