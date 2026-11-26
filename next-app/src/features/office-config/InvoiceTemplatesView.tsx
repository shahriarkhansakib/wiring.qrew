"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQrewStore } from "@/components/providers/StoreProvider";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { useAppShell } from "@/components/shell/AppShell";
import { QrewIcon } from "@/components/ui/Icons";
import { DAGFormulaEngine, formatCurrency } from "@/lib/dag-formula-engine";
import type { InvoiceTemplate, PremadeDeliverable } from "@/lib/types";
import { FileDetailsGrid } from "./FileDetailsGrid";
import {
  cloneTemplate,
  ensureHeaderGrid,
  getCleanFieldValue,
  insertPremadeDeliverableIntoSection,
} from "./header-grid";
import {
  AddChargeModalContent,
  AddHeaderFieldModalContent,
  AddRowModalContent,
  AddSectionModalContent,
  EditFormulaModalContent,
  PreviewTemplateModalContent,
  RenameTokenModalContent,
} from "./StudioModals";
import { TemplateDirectory } from "./TemplateDirectory";
import { TokenPoolSidebar } from "./TokenPoolSidebar";

interface SelectedCell {
  type: "row" | "charge" | "subtotal" | "grandTotal";
  sectionId?: string;
  rowId?: string;
  chargeId?: string;
}

interface InvoiceTemplatesViewProps {
  officeId: string;
  tenantId: string;
}

export function InvoiceTemplatesView({ officeId, tenantId }: InvoiceTemplatesViewProps) {
  const { store, mutate } = useQrewStore();
  const { showToast, openModal, closeModal, confirmDialog } = useUiFeedback();
  const { setStudioMode } = useAppShell();

  const [activeTemplate, setActiveTemplate] = useState<InvoiceTemplate | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [formulaDraft, setFormulaDraft] = useState("");
  const [draggedRow, setDraggedRow] = useState<{ rowId: string; sectionId: string } | null>(null);
  const [draggedPremade, setDraggedPremade] = useState<PremadeDeliverable | null>(null);
  const [dropTargetRowId, setDropTargetRowId] = useState<string | null>(null);
  const [dropTargetSecId, setDropTargetSecId] = useState<string | null>(null);

  const formulaInputRef = useRef<HTMLInputElement | null>(null);

  const isStudio = activeTemplate !== null;

  useEffect(() => {
    setStudioMode(isStudio);
    return () => {
      setStudioMode(false);
    };
  }, [isStudio, setStudioMode]);

  const evaluatedTokens = useMemo(() => {
    if (!activeTemplate) return new Map();
    const engine = new DAGFormulaEngine(activeTemplate);
    return engine.evaluateAll();
  }, [activeTemplate]);

  const selectedCellMeta = useMemo(() => {
    if (!activeTemplate || !selectedCell) {
      return { tokenLabel: "no cell selected", equation: "" };
    }
    const sec = (activeTemplate.sections || []).find((s) => s.id === selectedCell.sectionId);
    if (selectedCell.type === "row" && sec) {
      const row = (sec.rows || []).find((r) => r.id === selectedCell.rowId);
      if (row) return { tokenLabel: row.token || "ROW_TOKEN", equation: row.equation || "" };
    } else if (selectedCell.type === "charge" && sec) {
      const charge = (sec.charges || []).find((c) => c.id === selectedCell.chargeId);
      if (charge) {
        return { tokenLabel: charge.token || "CHARGE_TOKEN", equation: charge.equation || "" };
      }
    } else if (selectedCell.type === "subtotal" && sec?.subtotal) {
      return {
        tokenLabel: sec.subtotal.token || "SECTION_TOTAL",
        equation: sec.subtotal.equation || "",
      };
    } else if (selectedCell.type === "grandTotal" && activeTemplate.grandTotal) {
      return {
        tokenLabel: activeTemplate.grandTotal.token || "TOTAL",
        equation: activeTemplate.grandTotal.equation || "",
      };
    }
    return { tokenLabel: "no cell selected", equation: "" };
  }, [activeTemplate, selectedCell]);

  const handleOpenStudio = (tpl: InvoiceTemplate) => {
    const cloned = cloneTemplate(tpl);
    ensureHeaderGrid(cloned);
    setActiveTemplate(cloned);
    setSelectedCell(null);
    setFormulaDraft("");
  };

  const handleSelectCell = (nextSelected: SelectedCell) => {
    if (!activeTemplate) return;
    setSelectedCell(nextSelected);

    const sec = (activeTemplate.sections || []).find((s) => s.id === nextSelected.sectionId);
    let eq = "";
    if (nextSelected.type === "row" && sec) {
      eq = (sec.rows || []).find((r) => r.id === nextSelected.rowId)?.equation || "";
    } else if (nextSelected.type === "charge" && sec) {
      eq = (sec.charges || []).find((c) => c.id === nextSelected.chargeId)?.equation || "";
    } else if (nextSelected.type === "subtotal" && sec?.subtotal) {
      eq = sec.subtotal.equation || "";
    } else if (nextSelected.type === "grandTotal" && activeTemplate.grandTotal) {
      eq = activeTemplate.grandTotal.equation || "";
    }

    setFormulaDraft(eq);
    window.setTimeout(() => {
      formulaInputRef.current?.focus();
      formulaInputRef.current?.select();
    }, 0);
  };

  const commitFormula = (newEq: string): string | null => {
    if (!activeTemplate || !selectedCell) return null;

    const next = cloneTemplate(activeTemplate);
    const sec = (next.sections || []).find((s) => s.id === selectedCell.sectionId);
    const engine = new DAGFormulaEngine(next);
    engine.buildGraph();

    let targetToken = "";
    if (selectedCell.type === "row" && sec) {
      const row = (sec.rows || []).find((r) => r.id === selectedCell.rowId);
      if (row) {
        targetToken = row.token;
        const cycle = engine.detectCycle(targetToken, newEq);
        if (cycle) return cycle;
        row.equation = newEq;
      }
    } else if (selectedCell.type === "charge" && sec) {
      const charge = (sec.charges || []).find((c) => c.id === selectedCell.chargeId);
      if (charge) {
        targetToken = charge.token;
        const cycle = engine.detectCycle(targetToken, newEq);
        if (cycle) return cycle;
        charge.equation = newEq;
      }
    } else if (selectedCell.type === "subtotal" && sec?.subtotal) {
      targetToken = sec.subtotal.token;
      const cycle = engine.detectCycle(targetToken, newEq);
      if (cycle) return cycle;
      sec.subtotal.equation = newEq;
    } else if (selectedCell.type === "grandTotal" && next.grandTotal) {
      targetToken = next.grandTotal.token;
      const cycle = engine.detectCycle(targetToken, newEq);
      if (cycle) return cycle;
      next.grandTotal.equation = newEq;
    }

    setActiveTemplate(next);
    setFormulaDraft(newEq);
    return null;
  };

  const handleSaveTemplate = () => {
    if (!activeTemplate) return;
    const toSave = cloneTemplate(activeTemplate);
    if (toSave.id && store.getInvoiceTemplateById(toSave.id)) {
      mutate((s) => s.updateInvoiceTemplate(toSave.id, toSave));
      showToast(`Template "${toSave.name}" saved successfully!`, "success");
    } else {
      const created = mutate((s) => s.createInvoiceTemplate(officeId, toSave));
      setActiveTemplate(cloneTemplate(created));
      showToast(`Template "${created.name}" created!`, "success");
    }
  };

  const handleOpenAddFieldModal = (targetRow?: number, targetCol?: number) => {
    if (!activeTemplate) return;
    openModal({
      title: "Add File Details Field",
      content: (
        <AddHeaderFieldModalContent
          template={activeTemplate}
          targetRow={targetRow}
          targetCol={targetCol}
          onCancel={closeModal}
          onAdd={(nextTpl, label) => {
            setActiveTemplate(nextTpl);
            closeModal();
            showToast(`Header field "${label}" added.`, "success");
          }}
        />
      ),
    });
  };

  const handleOpenAddSectionModal = (insertBeforeId: string | null = null) => {
    if (!activeTemplate) return;
    openModal({
      title: "Add New Calculation Section",
      content: (
        <AddSectionModalContent
          template={activeTemplate}
          insertBeforeId={insertBeforeId}
          onCancel={closeModal}
          onAdd={(nextTpl, title) => {
            setActiveTemplate(nextTpl);
            closeModal();
            showToast(`Section "${title}" added.`, "success");
          }}
        />
      ),
    });
  };

  const handleOpenAddRowModal = (sectionId: string, sectionTitle: string) => {
    if (!activeTemplate) return;
    openModal({
      title: `Add Deliverable Row to ${sectionTitle}`,
      content: (
        <AddRowModalContent
          template={activeTemplate}
          sectionId={sectionId}
          sectionTitle={sectionTitle}
          onCancel={closeModal}
          onAdd={(nextTpl, newRow) => {
            setActiveTemplate(nextTpl);
            setSelectedCell({ type: "row", sectionId, rowId: newRow.id });
            setFormulaDraft(newRow.equation);
            closeModal();
            showToast(`Row "${newRow.name}" [${newRow.token}] added.`, "success");
          }}
        />
      ),
    });
  };

  const handleOpenAddChargeModal = (sectionId: string, sectionTitle: string) => {
    if (!activeTemplate) return;
    openModal({
      title: `Add Section Charge to ${sectionTitle}`,
      content: (
        <AddChargeModalContent
          template={activeTemplate}
          sectionId={sectionId}
          onCancel={closeModal}
          onAdd={(nextTpl, chargeName) => {
            setActiveTemplate(nextTpl);
            closeModal();
            showToast(`Charge "${chargeName}" added.`, "success");
          }}
        />
      ),
    });
  };

  const handleRenameToken = (sectionId: string, rowId: string, currentToken: string) => {
    if (!activeTemplate) return;
    openModal({
      title: `Rename Token: ${currentToken}`,
      content: (
        <RenameTokenModalContent
          currentToken={currentToken}
          onCancel={closeModal}
          onRename={(newToken) => {
            if (newToken === currentToken) {
              closeModal();
              return null;
            }
            const engine = new DAGFormulaEngine(activeTemplate);
            engine.buildGraph();
            if (engine.tokens.has(newToken)) {
              return `Token "${newToken}" is already defined in this template.`;
            }

            const next = cloneTemplate(activeTemplate);
            const escaped = currentToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const tokenReg = new RegExp(`\\b${escaped}\\b`, "g");
            const replaceToken = (eq?: string) => (eq ? eq.replace(tokenReg, newToken) : eq);

            for (const s of next.sections || []) {
              for (const r of s.rows || []) {
                if (s.id === sectionId && r.id === rowId) {
                  r.token = newToken;
                } else if (r.equation) {
                  r.equation = replaceToken(r.equation) || r.equation;
                }
              }
              for (const c of s.charges || []) {
                if (c.equation) {
                  c.equation = replaceToken(c.equation) || c.equation;
                }
              }
              if (s.subtotal?.equation) {
                s.subtotal.equation = replaceToken(s.subtotal.equation) || s.subtotal.equation;
              }
            }
            if (next.grandTotal?.equation) {
              next.grandTotal.equation =
                replaceToken(next.grandTotal.equation) || next.grandTotal.equation;
            }
            setActiveTemplate(next);
            closeModal();
            showToast(`Renamed token ${currentToken} -> ${newToken}.`, "info");
            return null;
          }}
        />
      ),
    });
  };

  const handleOpenFormulaModal = (target: SelectedCell, tokenLabel: string, currentEquation: string) => {
    setSelectedCell(target);
    setFormulaDraft(currentEquation);
    openModal({
      title: `Edit Value / Formula`,
      content: (
        <EditFormulaModalContent
          tokenLabel={tokenLabel}
          initialEquation={currentEquation}
          onCancel={closeModal}
          onSave={(eq) => {
            if (!activeTemplate) return null;
            const next = cloneTemplate(activeTemplate);
            const sec = (next.sections || []).find((s) => s.id === target.sectionId);
            const engine = new DAGFormulaEngine(next);
            engine.buildGraph();

            let checkToken = tokenLabel;
            if (target.type === "row" && sec) {
              const row = (sec.rows || []).find((r) => r.id === target.rowId);
              if (row) {
                checkToken = row.token;
                const cycle = engine.detectCycle(checkToken, eq);
                if (cycle) return cycle;
                row.equation = eq;
              }
            } else if (target.type === "charge" && sec) {
              const charge = (sec.charges || []).find((c) => c.id === target.chargeId);
              if (charge) {
                checkToken = charge.token;
                const cycle = engine.detectCycle(checkToken, eq);
                if (cycle) return cycle;
                charge.equation = eq;
              }
            } else if (target.type === "subtotal" && sec?.subtotal) {
              checkToken = sec.subtotal.token;
              const cycle = engine.detectCycle(checkToken, eq);
              if (cycle) return cycle;
              sec.subtotal.equation = eq;
            } else if (target.type === "grandTotal" && next.grandTotal) {
              checkToken = next.grandTotal.token;
              const cycle = engine.detectCycle(checkToken, eq);
              if (cycle) return cycle;
              next.grandTotal.equation = eq;
            }

            setActiveTemplate(next);
            setFormulaDraft(eq);
            closeModal();
            return null;
          }}
        />
      ),
    });
  };

  const insertPremadeItemIntoSection = (item: PremadeDeliverable, targetSectionId: string) => {
    if (!activeTemplate) return;
    const result = insertPremadeDeliverableIntoSection(activeTemplate, item, targetSectionId);
    if (!result) return;
    setActiveTemplate(result.template);
    showToast(`Added premade row "${item.name}" to ${result.sectionTitle}!`, "success");
  };

  const moveRowAcrossSections = (targetSectionId: string, targetRowId: string) => {
    if (!activeTemplate || !draggedRow || draggedRow.rowId === targetRowId) return;

    const next = cloneTemplate(activeTemplate);
    const srcSec = (next.sections || []).find((s) => s.id === draggedRow.sectionId);
    const tgtSec = (next.sections || []).find((s) => s.id === targetSectionId);
    if (!srcSec || !tgtSec) return;

    const srcIdx = (srcSec.rows || []).findIndex((r) => r.id === draggedRow.rowId);
    if (srcIdx === -1) return;

    const [moved] = srcSec.rows.splice(srcIdx, 1);
    const tgtIdx = (tgtSec.rows || []).findIndex((r) => r.id === targetRowId);
    if (tgtIdx === -1) tgtSec.rows.push(moved);
    else tgtSec.rows.splice(tgtIdx, 0, moved);

    if (srcSec.subtotal?.equation?.startsWith("=")) {
      srcSec.subtotal.equation =
        srcSec.rows.length > 0 ? `= ${srcSec.rows.map((r) => r.token).join(" + ")}` : "= 0";
    }
    if (tgtSec !== srcSec && tgtSec.subtotal?.equation?.startsWith("=")) {
      tgtSec.subtotal.equation =
        tgtSec.rows.length > 0 ? `= ${tgtSec.rows.map((r) => r.token).join(" + ")}` : "= 0";
    }

    setActiveTemplate(next);
  };

  const handleInsertPoolToken = (token: string) => {
    if (!selectedCell) {
      showToast(`Select a cell to apply token "${token}" to its formula.`, "info");
      return;
    }
    const nextEq = formulaDraft.trim() ? `${formulaDraft.trim()} + ${token}` : `= ${token}`;
    const cycleErr = commitFormula(nextEq);
    if (cycleErr) {
      showToast(cycleErr, "danger");
      return;
    }
    showToast(`Inserted token "${token}" into formula.`, "info");
  };

  if (!activeTemplate) {
    return (
      <TemplateDirectory
        officeId={officeId}
        tenantId={tenantId}
        onOpenStudio={handleOpenStudio}
      />
    );
  }

  const grandTotalToken = activeTemplate.grandTotal?.token || "GRAND_TOTAL";
  const grandTotalVal =
    evaluatedTokens.get(grandTotalToken.toUpperCase())?.value || 0;

  let globalRowIndex = 1;

  return (
    <div className="studio-shell designer-shell">
      {/* ROW 1: COMPACT SINGLE-LINE HEADER */}
      <header className="studio-header">
        <div className="studio-header-left">
          <button
            type="button"
            className="designer-back-arrow"
            id="btn-studio-back"
            title="Back to Invoice Templates"
            aria-label="Back to Invoice Templates"
            onClick={() => {
              setActiveTemplate(null);
              setSelectedCell(null);
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          <input
            type="text"
            className="designer-title-input"
            id="designer-title-input"
            value={activeTemplate.name}
            placeholder="Template Name"
            title="Click to edit template name"
            onChange={(e) => {
              const val = e.target.value;
              setActiveTemplate((prev) => (prev ? { ...prev, name: val } : prev));
            }}
            onBlur={(e) => {
              const trimmed = e.target.value.trim() || "Untitled Template";
              setActiveTemplate((prev) => (prev ? { ...prev, name: trimmed } : prev));
            }}
          />
        </div>

        <div className="studio-header-right">
          <button
            type="button"
            className={`btn btn-secondary btn-sm ${sidebarOpen ? "active" : ""}`}
            id="btn-toggle-sidebar"
            title={sidebarOpen ? "Hide Token Pool Sidebar" : "Show Token Pool Sidebar"}
            aria-label="Toggle Token Pool Sidebar"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <span className="sidebar-toggle-icon">#</span>
            <span className="sidebar-toggle-label">
              {sidebarOpen ? "Hide Tokens" : "Show Tokens"}
            </span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            id="btn-preview-template"
            onClick={() =>
              openModal({
                title: `Generated Invoice: ${activeTemplate.name} (${activeTemplate.code})`,
                content: (
                  <PreviewTemplateModalContent
                    template={activeTemplate}
                    onClose={closeModal}
                  />
                ),
              })
            }
          >
            Preview
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            id="btn-save-template"
            onClick={handleSaveTemplate}
          >
            <QrewIcon name="check" size={14} />
            <span>Save</span>
          </button>
        </div>
      </header>

      {/* ROW 2: WORKSPACE BODY */}
      <div className="studio-body">
        <main className="studio-main-section designer-main-canvas">
          <FileDetailsGrid
            template={activeTemplate}
            onChangeTemplate={setActiveTemplate}
            onOpenAddFieldModal={handleOpenAddFieldModal}
          />

          {/* Formula Bar [fx] */}
          <div className="formula-bar-container">
            <div className="formula-bar">
              <div className="formula-prefix">
                <span className="formula-fx-symbol">fx</span>
                <span
                  className={`formula-target-token ${
                    selectedCellMeta.tokenLabel !== "no cell selected" ? "active-token" : ""
                  }`}
                  id="designer-active-token-badge"
                >
                  {selectedCellMeta.tokenLabel}
                </span>
              </div>
              <input
                ref={formulaInputRef}
                type="text"
                className="formula-input"
                id="designer-formula-input"
                value={formulaDraft}
                onChange={(e) => setFormulaDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const err = commitFormula(formulaDraft.trim() || "0");
                    if (err) showToast(err, "danger");
                  } else if (e.key === "Escape") {
                    setSelectedCell(null);
                    setFormulaDraft("");
                  }
                }}
                onBlur={() => {
                  if (!selectedCell) return;
                  const clean = formulaDraft.trim();
                  if (clean !== (selectedCellMeta.equation || "")) {
                    const err = commitFormula(clean || "0");
                    if (err) showToast(err, "danger");
                  }
                }}
                placeholder={selectedCell ? "Enter number or = FORMULA..." : ""}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Spreadsheet Table Canvas */}
          <div className="designer-table-wrap">
            <table className="sheet-table-integrated" id="designer-main-table">
              <thead>
                <tr>
                  <th className="col-token" />
                  <th className="col-sl" style={{ width: 44 }}>
                    SL
                  </th>
                  <th className="col-item" style={{ width: "58%" }}>
                    Item Name / Deliverable (text displayed in PDF)
                  </th>
                  <th className="col-type" style={{ width: 110 }}>
                    Type
                  </th>
                  <th className="col-value" style={{ width: 140 }}>
                    {activeTemplate.currency || "USD"}
                  </th>
                  <th className="col-actions" style={{ width: 44 }} />
                </tr>
              </thead>
              <tbody>
                {(activeTemplate.sections || []).map((sec, secIdx) => {
                  const color =
                    sec.color || (secIdx === 0 ? "green" : secIdx === 1 ? "blue" : "orange");
                  const subTotalToken = sec.subtotal?.token || `SEC${secIdx + 1}_TOTAL`;
                  const subTotalVal =
                    evaluatedTokens.get(subTotalToken.toUpperCase())?.value || 0;
                  const isSubtotalSelected =
                    selectedCell?.type === "subtotal" && selectedCell.sectionId === sec.id;

                  return (
                    <React.Fragment key={sec.id}>
                      {/* Section Divider */}
                      <tr className="section-divider-row">
                        <td className="col-token" />
                        <td className="col-divider-cell" colSpan={5}>
                          <button
                            type="button"
                            className="btn-add-section-here"
                            onClick={() => handleOpenAddSectionModal(sec.id)}
                          >
                            + Add section here
                          </button>
                        </td>
                      </tr>

                      {/* Section Header */}
                      <tr className="section-row-header" data-sectionid={sec.id}>
                        <td className="col-token" />
                        <td className="col-section-title" colSpan={5}>
                          <div className="section-rail-bar">
                            <div className="section-rail-left">
                              <span className={`section-color-strip strip-${color}`} />
                              <input
                                type="text"
                                className={`section-title-input title-${color}`}
                                value={sec.title}
                                title="Click to rename section"
                                onChange={(e) => {
                                  const nextTitle = e.target.value;
                                  const next = cloneTemplate(activeTemplate);
                                  const found = next.sections.find((s) => s.id === sec.id);
                                  if (found) found.title = nextTitle;
                                  setActiveTemplate(next);
                                }}
                                onBlur={(e) => {
                                  const nextTitle = e.target.value.trim().toUpperCase() || "SECTION";
                                  const next = cloneTemplate(activeTemplate);
                                  const found = next.sections.find((s) => s.id === sec.id);
                                  if (found) found.title = nextTitle;
                                  setActiveTemplate(next);
                                }}
                              />
                            </div>

                            <div className="section-rail-actions">
                              {activeTemplate.sections.length > 1 ? (
                                <button
                                  type="button"
                                  className="icon-btn btn-delete-section"
                                  title="Delete Section"
                                  aria-label={`Delete ${sec.title}`}
                                  style={{
                                    color: "var(--color-danger)",
                                    padding: 2,
                                    opacity: 0.7,
                                  }}
                                  onClick={() => {
                                    confirmDialog({
                                      title: "Delete Section",
                                      message: `Delete "${sec.title}" and its deliverables?`,
                                      confirmText: "Delete Section",
                                      confirmClass: "btn-danger",
                                      onConfirm: () => {
                                        const next = cloneTemplate(activeTemplate);
                                        const deletedSubToken = sec.subtotal?.token;
                                        next.sections = next.sections.filter(
                                          (s) => s.id !== sec.id
                                        );
                                        if (deletedSubToken && next.grandTotal?.equation) {
                                          const eq = next.grandTotal.equation.trim();
                                          if (eq.startsWith("=")) {
                                            const terms = eq
                                              .slice(1)
                                              .split("+")
                                              .map((p) => p.trim())
                                              .filter(Boolean);
                                            if (
                                              terms.length > 0 &&
                                              terms.every((t) => /^[A-Z0-9_]+$/i.test(t))
                                            ) {
                                              const remaining = terms.filter(
                                                (t) => t.toUpperCase() !== deletedSubToken.toUpperCase()
                                              );
                                              next.grandTotal.equation =
                                                remaining.length > 0
                                                  ? `= ${remaining.join(" + ")}`
                                                  : "= 0";
                                            }
                                          }
                                        }
                                        setActiveTemplate(next);
                                      },
                                    });
                                  }}
                                >
                                  <QrewIcon name="trash" size={14} />
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Deliverable Line Item Rows */}
                      {(sec.rows || []).map((row) => {
                        const val = evaluatedTokens.get(row.token.toUpperCase())?.value || 0;
                        const isSelected =
                          selectedCell?.type === "row" && selectedCell.rowId === row.id;
                        const sl = row.sl || globalRowIndex++;
                        const isEditable =
                          row.editable === "EDITABLE" || row.editable === "editable";
                        const isBeingDragged = draggedRow?.rowId === row.id;
                        const isRowDragOver = dropTargetRowId === row.id;

                        return (
                          <tr
                            key={row.id}
                            className={`designer-row sheet-row ${isSelected ? "row-selected" : ""} ${
                              isRowDragOver ? "row-drag-over" : ""
                            }`.trim()}
                            style={isBeingDragged ? { opacity: 0.5 } : undefined}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (dropTargetRowId !== row.id) setDropTargetRowId(row.id);
                            }}
                            onDragLeave={() => {
                              if (dropTargetRowId === row.id) setDropTargetRowId(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDropTargetRowId(null);
                              if (draggedPremade) {
                                insertPremadeItemIntoSection(draggedPremade, sec.id);
                                setDraggedPremade(null);
                                return;
                              }
                              moveRowAcrossSections(sec.id, row.id);
                              setDraggedRow(null);
                            }}
                          >
                            <td className="col-token">
                              <button
                                type="button"
                                className="badge-token badge-row btn-rename-token"
                                title="Click to rename token variable"
                                style={{ border: "none", cursor: "pointer" }}
                                onClick={() => handleRenameToken(sec.id, row.id, row.token)}
                              >
                                {row.token}
                              </button>
                            </td>

                            <td className="col-sl">{sl}</td>

                            <td className="col-item">
                              <div className="item-name-wrap">
                                <span
                                  className="row-drag-handle"
                                  draggable
                                  title="Drag to reorder row"
                                  onDragStart={(e) => {
                                    setDraggedRow({ rowId: row.id, sectionId: sec.id });
                                    e.dataTransfer.setData("text/plain", row.id);
                                  }}
                                  onDragEnd={() => {
                                    setDraggedRow(null);
                                    setDropTargetRowId(null);
                                  }}
                                >
                                  &#x22EE;&#x22EE;
                                </span>
                                <input
                                  type="text"
                                  className="row-name-input"
                                  value={row.name}
                                  placeholder="Item / deliverable description"
                                  onFocus={(e) => {
                                    const v = e.target.value.trim();
                                    if (v === "—" || v === "-" || v === "–") {
                                      const next = cloneTemplate(activeTemplate);
                                      const targetSec = next.sections.find((s) => s.id === sec.id);
                                      const targetRow = targetSec?.rows.find((r) => r.id === row.id);
                                      if (targetRow) targetRow.name = "";
                                      setActiveTemplate(next);
                                    }
                                  }}
                                  onChange={(e) => {
                                    const next = cloneTemplate(activeTemplate);
                                    const targetSec = next.sections.find((s) => s.id === sec.id);
                                    const targetRow = targetSec?.rows.find((r) => r.id === row.id);
                                    if (targetRow) targetRow.name = e.target.value;
                                    setActiveTemplate(next);
                                  }}
                                  onBlur={(e) => {
                                    const clean = getCleanFieldValue(e.target.value.trim());
                                    const next = cloneTemplate(activeTemplate);
                                    const targetSec = next.sections.find((s) => s.id === sec.id);
                                    const targetRow = targetSec?.rows.find((r) => r.id === row.id);
                                    if (targetRow) targetRow.name = clean;
                                    setActiveTemplate(next);
                                  }}
                                />
                              </div>
                            </td>

                            <td className="col-type">
                              <button
                                type="button"
                                className={`btn-type-toggle ${
                                  isEditable ? "type-editable" : "type-fixed"
                                }`}
                                title="Click to toggle: Editable by billing clerk vs Fixed formula"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const next = cloneTemplate(activeTemplate);
                                  const targetSec = next.sections.find((s) => s.id === sec.id);
                                  const targetRow = targetSec?.rows.find((r) => r.id === row.id);
                                  if (!targetRow) return;
                                  const nextEditable = !isEditable;
                                  targetRow.editable = nextEditable ? "EDITABLE" : "FIXED";
                                  setActiveTemplate(next);
                                  showToast(
                                    `Row "${targetRow.name}" set to ${
                                      nextEditable ? "Editable" : "Not Editable"
                                    }.`,
                                    "info"
                                  );
                                }}
                              >
                                {isEditable ? "EDITABLE" : "NOT EDITABLE"}
                              </button>
                            </td>

                            <td
                              className={`col-value cell-selectable ${
                                isSelected ? "cell-selected" : ""
                              }`}
                              onClick={() =>
                                handleSelectCell({ type: "row", sectionId: sec.id, rowId: row.id })
                              }
                              onDoubleClick={() =>
                                handleOpenFormulaModal(
                                  { type: "row", sectionId: sec.id, rowId: row.id },
                                  row.token,
                                  row.equation || "0"
                                )
                              }
                            >
                              <div className="val-cell-content">
                                <span className="cell-val-text">{formatCurrency(val)}</span>
                              </div>
                            </td>

                            <td className="col-actions">
                              <button
                                type="button"
                                className="row-delete-btn"
                                title="Delete row"
                                aria-label={`Delete row ${row.name}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const next = cloneTemplate(activeTemplate);
                                  const targetSec = next.sections.find((s) => s.id === sec.id);
                                  if (targetSec) {
                                    targetSec.rows = (targetSec.rows || []).filter(
                                      (r) => r.id !== row.id
                                    );
                                    if (targetSec.subtotal) {
                                      targetSec.subtotal.equation =
                                        targetSec.rows.length > 0
                                          ? `= ${targetSec.rows.map((r) => r.token).join(" + ")}`
                                          : "= 0";
                                    }
                                  }
                                  setActiveTemplate(next);
                                }}
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Section Charges */}
                      {(sec.charges || []).map((charge) => {
                        const val = evaluatedTokens.get(charge.token.toUpperCase())?.value || 0;
                        const isSelected =
                          selectedCell?.type === "charge" &&
                          selectedCell.chargeId === charge.id;

                        return (
                          <tr
                            key={charge.id}
                            className={`section-charge-row ${isSelected ? "row-selected" : ""}`}
                          >
                            <td className="col-token">
                              <span className="badge-token badge-local">{charge.token}</span>
                            </td>
                            <td className="col-sl" />
                            <td
                              className="col-item"
                              style={{
                                textAlign: "right",
                                paddingRight: 24,
                                fontStyle: "italic",
                                color: "var(--color-text-muted)",
                              }}
                            >
                              {charge.name}
                            </td>
                            <td className="col-type">
                              <span className="btn-type-toggle type-fixed" style={{ cursor: "default" }}>
                                NOT EDITABLE
                              </span>
                            </td>
                            <td
                              className={`col-value cell-selectable ${
                                isSelected ? "cell-selected" : ""
                              }`}
                              onClick={() =>
                                handleSelectCell({
                                  type: "charge",
                                  sectionId: sec.id,
                                  chargeId: charge.id,
                                })
                              }
                              onDoubleClick={() =>
                                handleOpenFormulaModal(
                                  { type: "charge", sectionId: sec.id, chargeId: charge.id },
                                  charge.token,
                                  charge.equation || "0"
                                )
                              }
                            >
                              <div className="val-cell-content">
                                <span>{val > 0 ? formatCurrency(val) : "—"}</span>
                              </div>
                            </td>
                            <td className="col-actions">
                              <button
                                type="button"
                                className="charge-delete-btn"
                                title="Delete charge"
                                aria-label={`Delete charge ${charge.name}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const next = cloneTemplate(activeTemplate);
                                  const targetSec = next.sections.find((s) => s.id === sec.id);
                                  if (targetSec) {
                                    targetSec.charges = (targetSec.charges || []).filter(
                                      (c) => c.id !== charge.id
                                    );
                                  }
                                  setActiveTemplate(next);
                                }}
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {/* Section Action Row */}
                      <tr
                        className={`section-actions-row section-drop-target ${
                          dropTargetSecId === sec.id ? "drop-target-active" : ""
                        }`.trim()}
                        onDragOver={(e) => {
                          if (!draggedPremade) return;
                          e.preventDefault();
                          if (dropTargetSecId !== sec.id) setDropTargetSecId(sec.id);
                        }}
                        onDragLeave={() => {
                          if (dropTargetSecId === sec.id) setDropTargetSecId(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDropTargetSecId(null);
                          if (draggedPremade) {
                            insertPremadeItemIntoSection(draggedPremade, sec.id);
                            setDraggedPremade(null);
                          }
                        }}
                      >
                        <td className="col-token" />
                        <td className="col-add-row-cell" colSpan={2}>
                          <button
                            type="button"
                            className="btn-action-add btn-add-row-trigger"
                            onClick={() => handleOpenAddRowModal(sec.id, sec.title)}
                          >
                            + Add row
                          </button>
                        </td>
                        <td className="col-add-charge-cell" colSpan={3}>
                          <button
                            type="button"
                            className="btn-action-add btn-add-charge-trigger"
                            onClick={() => handleOpenAddChargeModal(sec.id, sec.title)}
                          >
                            + Add section charge
                          </button>
                        </td>
                      </tr>

                      {/* Section Subtotal Row */}
                      <tr className={`subtotal-row ${isSubtotalSelected ? "row-selected" : ""}`}>
                        <td className="col-token">
                          <span className="badge-token badge-local">{subTotalToken}</span>
                        </td>
                        <td className="col-subtotal-label" colSpan={3}>
                          <strong>&lowast; Section Total</strong>
                        </td>
                        <td
                          className={`col-value cell-selectable ${
                            isSubtotalSelected ? "cell-selected" : ""
                          }`}
                          onClick={() =>
                            handleSelectCell({ type: "subtotal", sectionId: sec.id })
                          }
                          onDoubleClick={() =>
                            handleOpenFormulaModal(
                              { type: "subtotal", sectionId: sec.id },
                              subTotalToken,
                              sec.subtotal?.equation || "0"
                            )
                          }
                        >
                          <div className="val-cell-content">
                            <strong>{formatCurrency(subTotalVal)}</strong>
                          </div>
                        </td>
                        <td className="col-actions" />
                      </tr>
                    </React.Fragment>
                  );
                })}

                {/* Add section before Grand Total */}
                <tr className="section-divider-row">
                  <td className="col-token" />
                  <td className="col-divider-cell" colSpan={5}>
                    <button
                      type="button"
                      className="btn-add-section-here"
                      id="btn-add-section-bottom"
                      onClick={() => handleOpenAddSectionModal(null)}
                    >
                      + Add section here
                    </button>
                  </td>
                </tr>

                {/* Terminal Grand Total Row */}
                <tr
                  className={`grandtotal-row ${
                    selectedCell?.type === "grandTotal" ? "row-selected" : ""
                  }`}
                >
                  <td className="col-token">
                    <span className="badge-token badge-global">{grandTotalToken}</span>
                  </td>
                  <td className="col-sl" />
                  <td className="col-item">
                    <strong>TOTAL</strong>
                  </td>
                  <td className="col-type" />
                  <td
                    className={`col-value cell-selectable ${
                      selectedCell?.type === "grandTotal" ? "cell-selected" : ""
                    }`}
                    style={{ fontSize: "1.05rem" }}
                    onClick={() => handleSelectCell({ type: "grandTotal" })}
                    onDoubleClick={() =>
                      handleOpenFormulaModal(
                        { type: "grandTotal" },
                        grandTotalToken,
                        activeTemplate.grandTotal?.equation || "0"
                      )
                    }
                  >
                    <div className="val-cell-content">
                      <strong>{formatCurrency(grandTotalVal)}</strong>
                    </div>
                  </td>
                  <td className="col-actions" />
                </tr>
              </tbody>
            </table>
          </div>
        </main>

        <TokenPoolSidebar
          officeId={officeId}
          tenantId={tenantId}
          template={activeTemplate}
          evaluatedTokens={evaluatedTokens}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onInsertToken={handleInsertPoolToken}
          onChangeTemplate={setActiveTemplate}
          onDragPremadeStart={setDraggedPremade}
        />
      </div>
    </div>
  );
}
