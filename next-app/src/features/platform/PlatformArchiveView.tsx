"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { QrewIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/routes";
import { GithubDeleteModalContent } from "./TenantModals";

export function PlatformArchiveView() {
  const { store, mutate } = useQrewStore();
  const { openModal, closeModal, confirmDialog, showToast } = useUiFeedback();
  const [searchTerm, setSearchTerm] = useState("");

  const allTenants = store.getTenants();
  const suspendedTenants = allTenants.filter((t) => t.status === "Suspended");
  const term = searchTerm.toLowerCase().trim();

  const filtered = useMemo(() => {
    if (!term) return suspendedTenants;
    return suspendedTenants.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.id.toLowerCase().includes(term) ||
        (t.ownerName && t.ownerName.toLowerCase().includes(term)) ||
        (t.ownerEmail && t.ownerEmail.toLowerCase().includes(term))
    );
  }, [suspendedTenants, term]);

  const handleRestore = (tenantId: string, tenantName: string) => {
    confirmDialog({
      title: "Restore Organization",
      message: `Reactivate organization "${tenantName}"? This will restore active operational access for this tenant and its facilities.`,
      confirmText: "Restore to Active",
      confirmClass: "btn-primary",
      onConfirm: () => {
        mutate((s) => s.updateTenant(tenantId, { status: "Active" }));
        showToast(`Organization "${tenantName}" restored to Active.`, "success");
      },
    });
  };

  const handlePermanentDelete = (tenantId: string) => {
    openModal({
      title: "Permanently Delete Organization",
      content: <GithubDeleteModalContent tenantId={tenantId} onCancel={closeModal} />,
    });
  };

  return (
    <>
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div className="page-title-group">
          <h1 className="page-title">Archived Organizations</h1>
        </div>
        <div className="page-actions">
          <Link
            href={routes.platform("tenants")}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <QrewIcon name="tenants" /> Active Tenants
          </Link>
        </div>
      </div>

      <div className="tree-view-wrapper">
        <div className="tree-toolbar">
          <div
            className="tree-toolbar-left"
            style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, maxWidth: "540px" }}
          >
            <div className="tree-search-wrap" style={{ flex: 1 }}>
              <span className="tree-search-icon">
                <QrewIcon name="search" />
              </span>
              <input
                type="text"
                className="tree-search-input"
                id="archive-search-input"
                placeholder="Search archived organizations by name, ID, or owner email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="tree-toolbar-actions">
            <span
              className="tree-meta-badge"
              id="archive-stats-badge"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border)",
                fontSize: "12px",
                padding: "5px 10px",
              }}
            >
              {filtered.length} Archived Organization{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div id="archive-tenants-list" style={{ padding: "16px 0" }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                background: "var(--color-surface-white)",
                border: "1px dashed var(--color-border)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  margin: "0 auto 14px",
                  borderRadius: "50%",
                  background: "var(--color-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-text-muted)",
                }}
              >
                <QrewIcon name="archive" />
              </div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: "6px",
                }}
              >
                {term
                  ? `No archived organizations match "${term}"`
                  : "No Archived Organizations"}
              </h3>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "13px",
                  maxWidth: "440px",
                  margin: "0 auto 16px",
                }}
              >
                {term
                  ? "Try searching by organization name, ID, or owner email."
                  : "Suspended tenant organizations will be listed here. You can reactivate them or permanently delete them."}
              </p>
              <Link
                href={routes.platform("tenants")}
                className="btn btn-primary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <QrewIcon name="tenants" /> Go to Active Tenants
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map((t) => {
                const offices = store.getOfficesByTenant(t.id) || [];
                const members = store.getTenantMembers(t.id) || [];
                const ownerEmail = t.ownerEmail || "rafiq@sst.com";
                const ownerName = t.ownerName || "Rafiqul Islam";

                return (
                  <div
                    key={t.id}
                    className="archive-tenant-card"
                    style={{
                      background: "var(--color-surface-white)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      transition: "var(--transition-fast)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "var(--radius-sm)",
                          background: "rgba(239,68,68,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--color-danger)",
                          flexShrink: 0,
                        }}
                      >
                        <QrewIcon name="archive" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "4px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "15px",
                              fontWeight: 600,
                              color: "var(--color-text-primary)",
                            }}
                          >
                            {t.name}
                          </span>
                          <span className="tree-id-badge">{t.id}</span>
                          <span className="badge badge-suspended">
                            <span className="badge-dot" />
                            Suspended
                          </span>
                          <span
                            className="badge"
                            style={{
                              background: "var(--color-surface)",
                              color: "var(--color-text-muted)",
                              border: "1px solid var(--color-border)",
                              fontSize: "11px",
                            }}
                          >
                            Plan: {t.plan || "Enterprise"}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                            fontSize: "12.5px",
                            color: "var(--color-text-muted)",
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                            <QrewIcon name="users" /> Owner:{" "}
                            <strong style={{ color: "var(--color-text-primary)" }}>{ownerName}</strong>{" "}
                            ({ownerEmail})
                          </span>
                          <span>•</span>
                          <span>
                            {offices.length} office{offices.length === 1 ? "" : "s"}
                          </span>
                          <span>•</span>
                          <span>
                            {members.length} member{members.length === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm restore-tenant-btn"
                        title="Reactivate this organization"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                        onClick={() => handleRestore(t.id, t.name)}
                      >
                        <QrewIcon name="play" /> <span>Restore</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm archive-delete-btn"
                        title="Permanently delete this organization"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                        onClick={() => handlePermanentDelete(t.id)}
                      >
                        <QrewIcon name="trash" /> <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
