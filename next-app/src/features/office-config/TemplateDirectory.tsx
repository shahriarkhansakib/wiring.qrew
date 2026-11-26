"use client";

import React, { useMemo, useState } from "react";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { QrewIcon } from "@/components/ui/Icons";
import { SegmentedPills } from "@/components/ui/SegmentedPills";
import type { InvoiceTemplate } from "@/lib/types";
import { CreateTemplateModalContent } from "./StudioModals";

interface TemplateDirectoryProps {
  officeId: string;
  tenantId: string;
  onOpenStudio: (template: InvoiceTemplate) => void;
}

export function TemplateDirectory({ officeId, onOpenStudio }: TemplateDirectoryProps) {
  const { store, mutate } = useQrewStore();
  const { showToast, openModal, closeModal, confirmDialog } = useUiFeedback();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived">("active");

  const templates = store.getInvoiceTemplates(officeId);

  const { activeCount, archivedCount, filtered } = useMemo(() => {
    const active = templates.filter((t) => t.status !== "Archived");
    const archived = templates.filter((t) => t.status === "Archived");

    const q = searchTerm.trim().toLowerCase();
    const list = (statusFilter === "archived" ? archived : active).filter((t) => {
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q)
      );
    });

    return {
      activeCount: active.length,
      archivedCount: archived.length,
      filtered: list,
    };
  }, [templates, searchTerm, statusFilter]);

  const handleOpenCreateModal = () => {
    const count = templates.length + 1;
    openModal({
      title: "Create New Invoice Template",
      content: (
        <CreateTemplateModalContent
          defaultName={`Custom Template ${count}`}
          defaultCode={`INV-26-${String(count).padStart(3, "0")}`}
          onCancel={closeModal}
          onCreate={(draftTemplate) => {
            const created = mutate((s) => s.createInvoiceTemplate(officeId, draftTemplate));
            closeModal();
            showToast(`Template "${created.name}" created!`, "success");
            onOpenStudio(created);
          }}
        />
      ),
    });
  };

  const handleArchive = (tpl: InvoiceTemplate) => {
    mutate((s) => s.archiveInvoiceTemplate(tpl.id));
    showToast(`Template "${tpl.name}" moved to archives.`, "info");
  };

  const handleRestore = (tpl: InvoiceTemplate) => {
    mutate((s) => s.unarchiveInvoiceTemplate(tpl.id));
    showToast(`Template "${tpl.name}" restored to Active.`, "success");
  };

  const handleDelete = (tpl: InvoiceTemplate) => {
    confirmDialog({
      title: "Delete Template Permanently",
      message: `Are you sure you want to permanently delete template "${tpl.name}" (${tpl.code})? This action cannot be undone.`,
      confirmText: "Delete Template",
      confirmClass: "btn-danger",
      onConfirm: () => {
        mutate((s) => s.deleteInvoiceTemplate(tpl.id));
        showToast(`Template "${tpl.name}" deleted.`, "info");
      },
    });
  };

  return (
    <div className="tpl-directory-container">
      <header className="tpl-directory-header">
        <div>
          <h1 className="page-title" style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>
            Invoice Templates
          </h1>
          <p
            className="page-subtitle"
            style={{ margin: "4px 0 0 0", fontSize: "13.5px", color: "var(--color-text-muted)" }}
          >
            Build and manage reusable invoice structures, variable tokens, and formulas.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          id="btn-create-template-trigger"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#235F42",
            borderColor: "#1B4B34",
          }}
          onClick={handleOpenCreateModal}
        >
          <QrewIcon name="plus" size={15} />
          <span>Create Template</span>
        </button>
      </header>

      <div className="tpl-filter-bar">
        <div className="tpl-search-box">
          <QrewIcon name="search" size={15} />
          <input
            type="search"
            id="tpl-search-input"
            className="tpl-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates by name, index, description..."
            aria-label="Search invoice templates"
          />
        </div>

        <SegmentedPills
          id="tpl-status-filter-pills"
          ariaLabel="Filter templates by status"
          activeId={statusFilter}
          options={[
            { id: "active", label: `Active (${activeCount})` },
            { id: "archived", label: `Archived (${archivedCount})` },
          ]}
          onChange={(next) => setStatusFilter(next === "archived" ? "archived" : "active")}
        />
      </div>

      <div className="tpl-table-wrap">
        <table className="tpl-directory-table">
          <thead>
            <tr>
              <th style={{ minWidth: "180px" }}>Template Name</th>
              <th style={{ width: "110px" }}>Type</th>
              <th style={{ width: "150px" }}>Index</th>
              <th style={{ width: "140px" }}>Default Currency</th>
              <th>Description</th>
              <th style={{ width: "130px" }}>Last Updated</th>
              <th style={{ width: "100px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "36px",
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {statusFilter === "archived"
                    ? "No archived templates found."
                    : 'No active templates found. Click "Create Template" to get started.'}
                </td>
              </tr>
            ) : (
              filtered.map((tpl) => {
                const resolvedType = (tpl.type || tpl.tag || (tpl.isDefault ? "standard" : "custom"))
                  .toLowerCase()
                  .includes("standard")
                  ? "standard"
                  : "custom";

                return (
                  <tr
                    key={tpl.id}
                    className="tpl-row-item"
                    data-tplid={tpl.id}
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest("button, a, input, select, textarea, .icon-btn")) return;
                      onOpenStudio(tpl);
                    }}
                  >
                    <td>
                      <div className="tpl-name-cell">
                        <span className="tpl-name-title">{tpl.name}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`cell-type-text ${
                          resolvedType === "standard" ? "type-standard" : "type-custom"
                        }`}
                      >
                        {resolvedType.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="cell-index-text">{tpl.code}</span>
                    </td>
                    <td>
                      <span className="cell-currency-text">
                        {tpl.currency || "USD"} ({tpl.currencySymbol || "$"})
                      </span>
                    </td>
                    <td className="tpl-desc-cell" title={tpl.description || "—"}>
                      {tpl.description || "—"}
                    </td>
                    <td style={{ whiteSpace: "nowrap", color: "var(--color-text-muted)" }}>
                      {tpl.updatedAt || "—"}
                    </td>
                    <td>
                      <div className="tpl-actions-cell">
                        {statusFilter === "archived" ? (
                          <>
                            <button
                              type="button"
                              className="icon-btn btn-action-restore btn-restore-tpl"
                              title="Restore Template"
                              aria-label={`Restore ${tpl.name}`}
                              onClick={() => handleRestore(tpl)}
                            >
                              <QrewIcon name="refresh" size={14} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn btn-action-delete btn-delete-tpl"
                              title="Delete Permanently"
                              aria-label={`Delete ${tpl.name}`}
                              onClick={() => handleDelete(tpl)}
                            >
                              <QrewIcon name="trash" size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="icon-btn btn-action-edit btn-open-builder"
                              title="Open Template Studio"
                              aria-label={`Open Studio for ${tpl.name}`}
                              onClick={() => onOpenStudio(tpl)}
                            >
                              <QrewIcon name="edit" size={14} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn btn-action-archive btn-archive-tpl"
                              title="Archive Template"
                              aria-label={`Archive ${tpl.name}`}
                              onClick={() => handleArchive(tpl)}
                            >
                              <QrewIcon name="archive" size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
