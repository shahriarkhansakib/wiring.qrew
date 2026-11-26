"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { formatCurrency, type EvaluatedToken } from "@/lib/dag-formula-engine";
import { routes } from "@/lib/routes";
import type { InvoiceTemplate, PremadeDeliverable } from "@/lib/types";
import { applyOperationalFileToTemplate, cloneTemplate } from "./header-grid";
import { AddConstantModalContent } from "./StudioModals";

export type SidebarTabId = "tokens" | "catalog" | "files";

interface TokenPoolSidebarProps {
  officeId: string;
  tenantId: string;
  template: InvoiceTemplate;
  evaluatedTokens: Map<string, EvaluatedToken>;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  onInsertToken: (token: string) => void;
  onChangeTemplate: (next: InvoiceTemplate) => void;
  onDragPremadeStart: (item: PremadeDeliverable | null) => void;
}

const EXPENSE_CATEGORY_TOKENS = [
  { token: "LEVY_FUND", label: "Levy Fund 16.53" },
  { token: "MMD", label: "MMD 0" },
  { token: "TRANSPORTATION", label: "Transportation 0" },
  { token: "OFFICE", label: "Office 0" },
  { token: "OTHERS", label: "Others 0" },
];

export function TokenPoolSidebar({
  officeId,
  tenantId,
  template,
  evaluatedTokens,
  sidebarOpen,
  onCloseSidebar,
  onInsertToken,
  onChangeTemplate,
  onDragPremadeStart,
}: TokenPoolSidebarProps) {
  const { store } = useQrewStore();
  const { showToast, openModal, closeModal } = useUiFeedback();

  const [activeTab, setActiveTab] = useState<SidebarTabId>("tokens");
  const [sectionTokenViews, setSectionTokenViews] = useState<Record<string, "rows" | "sections">>({});

  const catalog = store.getPremadeDeliverables();
  const operationalFiles = store.getOperationalFiles(officeId);

  const handleOpenAddConstant = (scope: "Global" | "Template") => {
    openModal({
      title: `Add ${scope} Constant`,
      content: (
        <AddConstantModalContent
          scopeLabel={scope}
          defaultValue={scope === "Global" ? "100" : "50"}
          onCancel={closeModal}
          onSave={(token, value) => {
            const next = cloneTemplate(template);
            if (scope === "Global") {
              if (!next.globalConstants) next.globalConstants = {};
              next.globalConstants[token] = value;
            } else {
              if (!next.localConstants) next.localConstants = {};
              next.localConstants[token] = value;
            }
            onChangeTemplate(next);
            closeModal();
            showToast(`${scope} Constant "${token} = ${value}" added.`, "success");
          }}
        />
      ),
    });
  };

  return (
    <aside
      className={`studio-sidebar docked-token-pool ${sidebarOpen ? "" : "collapsed"}`}
      id="docked-token-pool"
    >
      <div className="token-pool-header">
        <div className="token-pool-title">
          <span># Token Pool</span>
          <button
            type="button"
            className="sidebar-close-btn"
            id="btn-close-sidebar"
            title="Close Sidebar"
            aria-label="Close Sidebar"
            onClick={onCloseSidebar}
          >
            &times;
          </button>
        </div>

        <div className="token-pool-tabs">
          <button
            type="button"
            className={`token-tab-btn ${activeTab === "tokens" ? "active" : ""}`}
            onClick={() => setActiveTab("tokens")}
          >
            Tokens
          </button>
          <button
            type="button"
            className={`token-tab-btn ${activeTab === "catalog" ? "active" : ""}`}
            onClick={() => setActiveTab("catalog")}
          >
            📦 Catalog
          </button>
          <button
            type="button"
            className={`token-tab-btn ${activeTab === "files" ? "active" : ""}`}
            onClick={() => setActiveTab("files")}
          >
            ⚡ Projects
          </button>
        </div>
      </div>

      <div className="token-pool-body">
        {activeTab === "tokens" ? (
          <>
            {/* 1. GLOBAL CONSTANTS */}
            <div className="token-group-card">
              <div className="token-group-header">
                <span className="token-group-title">
                  <span>GLOBAL CONSTANTS</span>
                  <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>&#x24D8;</span>
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  id="btn-add-global-const"
                  style={{ fontSize: 10, padding: "1px 6px", height: "auto" }}
                  onClick={() => handleOpenAddConstant("Global")}
                >
                  +
                </button>
              </div>
              <div className="token-items-list">
                {Object.entries(template.globalConstants || {}).map(([key, val]) => (
                  <button
                    key={key}
                    type="button"
                    className="token-pill-item pool-insertable-token"
                    title={`Click to insert ${key} into active formula`}
                    onClick={() => onInsertToken(key)}
                    style={{ width: "100%", textAlign: "left", background: "transparent", border: "none" }}
                  >
                    <span className="token-pill-name">
                      <span className="token-pill-dot" />
                      {key}
                    </span>
                    <span className="token-pill-val">{val}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. TEMPLATE CONSTANTS */}
            <div className="token-group-card">
              <div className="token-group-header">
                <span className="token-group-title">
                  <span>TEMPLATE CONSTANTS</span>
                  <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>&#x24D8;</span>
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  id="btn-add-local-const"
                  style={{ fontSize: 10, padding: "1px 6px", height: "auto" }}
                  onClick={() => handleOpenAddConstant("Template")}
                >
                  +
                </button>
              </div>
              <div className="token-items-list">
                {Object.keys(template.localConstants || {}).length === 0 ? (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-muted)",
                      fontStyle: "italic",
                      padding: 4,
                    }}
                  >
                    No template constants
                  </div>
                ) : (
                  Object.entries(template.localConstants || {}).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      className="token-pill-item pool-insertable-token"
                      title={`Click to insert ${key} into active formula`}
                      onClick={() => onInsertToken(key)}
                      style={{ width: "100%", textAlign: "left", background: "transparent", border: "none" }}
                    >
                      <span className="token-pill-name">
                        <span className="token-pill-dot" style={{ background: "#78618A" }} />
                        {key}
                      </span>
                      <span className="token-pill-val">{val}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* 3. FILE DETAILS TOKENS */}
            <div className="token-group-card">
              <div className="token-group-header">
                <span className="token-group-title">
                  <span>FILE DETAILS</span>
                  <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>&#x24D8;</span>
                </span>
              </div>
              <div className="token-items-list">
                {(template.headerFields || []).map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    className="token-pill-item pool-insertable-token"
                    title={`Click to insert ${f.key} into active formula`}
                    onClick={() => onInsertToken(f.key)}
                    style={{ width: "100%", textAlign: "left", background: "transparent", border: "none" }}
                  >
                    <span className="token-pill-name">
                      <span className="token-pill-dot" style={{ background: "#355C7D" }} />
                      {f.key}
                    </span>
                    <span className="token-pill-val">{f.value || "0"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. EXPENSE CATEGORIES */}
            <div className="token-group-card">
              <div className="token-group-header">
                <span className="token-group-title">
                  <span>EXPENSE CATEGORIES</span>
                  <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>&#x24D8;</span>
                </span>
                <span className="token-cat-pill">EXP_TOTAL &#x25BE;</span>
              </div>
              <div className="token-items-list">
                {EXPENSE_CATEGORY_TOKENS.map((cat) => (
                  <button
                    key={cat.token}
                    type="button"
                    className="token-pill-item pool-insertable-token"
                    onClick={() => onInsertToken(cat.token)}
                    style={{ width: "100%", textAlign: "left", background: "transparent", border: "none" }}
                  >
                    <span className="token-pill-name">
                      <span className="token-pill-dot" style={{ background: "#9E5334" }} />
                      {cat.token}
                    </span>
                    <span className="token-pill-val">{cat.label}</span>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: "var(--color-text-muted)" }}>
                <Link
                  href={routes.officeConfig(tenantId, officeId, "customize-fields")}
                  style={{ color: "var(--panel-accent)", textDecoration: "none" }}
                >
                  Manage categories in Customize Fields &nearr;
                </Link>
              </div>
            </div>

            {/* 5. SECTIONS & LIVE TOTALS TREE */}
            <div className="token-group-card">
              <div className="token-group-header">
                <span className="token-group-title">
                  <span>SECTIONS</span>
                  <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>&#x24D8;</span>
                </span>
              </div>
              <div className="token-items-list">
                {(template.sections || []).map((sec) => {
                  const subToken = sec.subtotal?.token || "";
                  const subVal = evaluatedTokens.get(subToken.toUpperCase())?.value || 0;
                  const subView = sectionTokenViews[sec.id] || "rows";
                  return (
                    <div key={sec.id} className="pool-section-block">
                      <div className="pool-sec-header">
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span
                            className={`section-color-strip strip-${sec.color || "purple"}`}
                            style={{ height: 12, width: 3 }}
                          />
                          <strong style={{ fontSize: 11.5 }}>{sec.title}</strong>
                        </span>
                        <span className="pool-sec-total">{formatCurrency(subVal)}</span>
                      </div>

                      <div className="pool-sec-subtoggles">
                        <button
                          type="button"
                          className={`pool-toggle-pill ${subView === "rows" ? "active" : ""}`}
                          onClick={() =>
                            setSectionTokenViews((prev) => ({ ...prev, [sec.id]: "rows" }))
                          }
                        >
                          Row Tokens ({(sec.rows || []).length})
                        </button>
                        <button
                          type="button"
                          className={`pool-toggle-pill ${subView === "sections" ? "active" : ""}`}
                          onClick={() =>
                            setSectionTokenViews((prev) => ({ ...prev, [sec.id]: "sections" }))
                          }
                        >
                          Section Tokens
                        </button>
                      </div>

                      <div className="pool-tokens-sublist">
                        {subView === "rows" ? (
                          (sec.rows || []).map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              className="token-pill-item pool-insertable-token"
                              style={{
                                fontSize: 11,
                                padding: "2px 6px",
                                width: "100%",
                                textAlign: "left",
                                background: "transparent",
                                border: "none",
                              }}
                              onClick={() => onInsertToken(r.token)}
                            >
                              <span>&bull; {r.token} &rsaquo;</span>
                              <span style={{ color: "var(--color-text-muted)" }}>
                                {formatCurrency(
                                  evaluatedTokens.get(r.token.toUpperCase())?.value || 0
                                )}
                              </span>
                            </button>
                          ))
                        ) : (
                          <>
                            {subToken ? (
                              <button
                                type="button"
                                className="token-pill-item pool-insertable-token"
                                style={{
                                  fontSize: 11,
                                  padding: "2px 6px",
                                  width: "100%",
                                  textAlign: "left",
                                  background: "transparent",
                                  border: "none",
                                }}
                                onClick={() => onInsertToken(subToken)}
                              >
                                <span>&Sigma; {subToken}</span>
                                <span style={{ fontWeight: 600, color: "var(--panel-accent)" }}>
                                  {formatCurrency(subVal)}
                                </span>
                              </button>
                            ) : null}
                            {(sec.charges || []).map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                className="token-pill-item pool-insertable-token"
                                style={{
                                  fontSize: 11,
                                  padding: "2px 6px",
                                  width: "100%",
                                  textAlign: "left",
                                  background: "transparent",
                                  border: "none",
                                }}
                                onClick={() => onInsertToken(c.token)}
                              >
                                <span>% {c.token}</span>
                                <span style={{ color: "var(--color-text-muted)" }}>
                                  {formatCurrency(
                                    evaluatedTokens.get(c.token.toUpperCase())?.value || 0
                                  )}
                                </span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : activeTab === "catalog" ? (
          <div className="catalog-shelf-wrap">
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginBottom: 10 }}>
              Drag and drop any premade deliverable row directly into a section on the canvas.
            </div>
            <div className="catalog-items-list">
              {catalog.map((item) => (
                <div
                  key={item.token}
                  className="catalog-draggable-card"
                  draggable
                  onDragStart={() => onDragPremadeStart(item)}
                  onDragEnd={() => onDragPremadeStart(null)}
                >
                  <div className="catalog-card-header">
                    <span className="catalog-card-token">{item.token}</span>
                    <span className="catalog-card-price">
                      {item.equation.startsWith("=") ? "Formula" : `$${item.equation}`}
                    </span>
                  </div>
                  <div className="catalog-card-title">{item.name}</div>
                  <div className="catalog-card-footer">
                    <span className="catalog-card-cat">{item.category || "General"}</span>
                    <span className="catalog-card-drag-hint">&varr; Drag to section</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="files-shelf-wrap">
            <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginBottom: 10 }}>
              Select an operational project to prepopulate header fields and live values into this
              invoice template.
            </div>
            <div className="files-items-list">
              {operationalFiles.map((f) => (
                <div key={f.id} className="file-select-card">
                  <div className="file-card-title">{f.title}</div>
                  <div className="file-card-meta">
                    <span>
                      Code: <strong>{f.fileCode}</strong>
                    </span>
                    <span>Client: {f.clientName}</span>
                  </div>
                  {f.vesselName ? (
                    <div className="file-card-vessel">
                      <span>
                        Vessel: <strong>{f.vesselName}</strong>
                      </span>{" "}
                      | <span>GRT: {f.grt || 0}</span> |{" "}
                      <span>Port: {f.portCall || "Chittagong"}</span>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm btn-apply-file-details"
                    style={{ width: "100%", marginTop: 8, fontSize: 11.5 }}
                    onClick={() => {
                      onChangeTemplate(applyOperationalFileToTemplate(template, f));
                      showToast(`Applied header details from ${f.title}!`, "success");
                    }}
                  >
                    Apply to Header Fields
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
