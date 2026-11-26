"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useUiFeedback } from "@/components/providers/UiFeedbackProvider";
import { sanitizeToken } from "@/lib/dag-formula-engine";
import type { HeaderGridCell, InvoiceTemplate } from "@/lib/types";
import {
  autoBalanceGrid,
  clearGridCell,
  cloneTemplate,
  deleteGridCol,
  deleteGridRow,
  ensureHeaderGrid,
  evaluateCenterCrossingCol,
  evaluateCenterCrossingRow,
  formatFieldLabel,
  getCellCapabilities,
  getCleanFieldValue,
  insertGridCol,
  insertGridRow,
  MAX_GRID_COLS,
  mergeGridCell,
  shiftInsertGridCell,
  splitGridCell,
  switchGridCellDirection,
  syncGridToHeaderFields,
  type GridColBound,
  type GridRowBound,
} from "./header-grid";

interface FileDetailsGridProps {
  template: InvoiceTemplate;
  onChangeTemplate: (next: InvoiceTemplate) => void;
  onOpenAddFieldModal: (targetRow?: number, targetCol?: number) => void;
}

interface DividerState {
  hLine?: { top: number; insertRow: number };
  vLine?: { left: number; insertCol: number };
}

interface ContextMenuState {
  cellRow: number;
  cellCol: number;
  x: number;
  y: number;
}

interface PendingFlipAnimation {
  firstRects: Map<string, DOMRect>;
  prevRows: number;
  prevCols: number;
}

interface LiveDragState {
  sourceRow: number;
  sourceCol: number;
  currentRow: number;
  currentCol: number;
  cellId: string;
  startCursorX: number;
  startCursorY: number;
  initialRowCenter: number;
  initialColCenter: number;
  bounds: {
    rowBounds: GridRowBound[];
    colBounds: GridColBound[];
    rowHeight: number;
    colWidth: number;
  };
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  );
}

export function FileDetailsGrid({
  template,
  onChangeTemplate,
  onOpenAddFieldModal,
}: FileDetailsGridProps) {
  const { showToast } = useUiFeedback();

  const [gridMode, setGridMode] = useState<"normal" | "edit">("normal");
  const [selectedCells, setSelectedCells] = useState<Set<string>>(() => new Set());
  const [anchorCell, setAnchorCell] = useState<{ row: number; col: number } | null>(null);
  const [dividerState, setDividerState] = useState<DividerState | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [hoveredDelRow, setHoveredDelRow] = useState<number | null>(null);
  const [hoveredDelCol, setHoveredDelCol] = useState<number | null>(null);
  const [draggingCellId, setDraggingCellId] = useState<string | null>(null);
  const [recentlyInsertedRow, setRecentlyInsertedRow] = useState<number | null>(null);
  const [recentlyInsertedCol, setRecentlyInsertedCol] = useState<number | null>(null);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isAnimatingRef = useRef(false);
  const pendingFlipRef = useRef<PendingFlipAnimation | null>(null);
  const animTimerRef = useRef<number | null>(null);

  const isHoveringRowInsertRef = useRef(false);
  const isHoveringColInsertRef = useRef(false);
  const hLineActiveRef = useRef(false);
  const vLineActiveRef = useRef(false);
  const liveDragRef = useRef<LiveDragState | null>(null);

  const grid = useMemo(() => {
    const copy = cloneTemplate(template);
    return ensureHeaderGrid(copy);
  }, [template]);

  const rows = useMemo(() => {
    const grouped: HeaderGridCell[][] = Array.from({ length: grid.rowsCount }, () => []);
    for (const cell of grid.cells) {
      if (cell.row >= 0 && cell.row < grid.rowsCount) {
        grouped[cell.row].push(cell);
      }
    }
    return grouped;
  }, [grid]);

  useEffect(() => {
    hLineActiveRef.current = Boolean(dividerState?.hLine);
    vLineActiveRef.current = Boolean(dividerState?.vLine);
  }, [dividerState]);

  useEffect(() => {
    if (!contextMenu) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [contextMenu]);

  useEffect(() => {
    if (selectedCells.size === 0) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCells(new Set());
        setAnchorCell(null);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [selectedCells.size]);

  useEffect(() => {
    if (recentlyInsertedRow === null) return;
    const t = window.setTimeout(() => setRecentlyInsertedRow(null), 280);
    return () => window.clearTimeout(t);
  }, [recentlyInsertedRow]);

  useEffect(() => {
    if (recentlyInsertedCol === null) return;
    const t = window.setTimeout(() => setRecentlyInsertedCol(null), 280);
    return () => window.clearTimeout(t);
  }, [recentlyInsertedCol]);

  const captureFirstRects = (): Map<string, DOMRect> => {
    const firstRects = new Map<string, DOMRect>();
    const wrapEl = wrapRef.current;
    if (!wrapEl) return firstRects;

    wrapEl.querySelectorAll<HTMLElement>(".file-combo-cell[data-cellid]").forEach((el) => {
      const id = el.getAttribute("data-cellid");
      if (id) {
        firstRects.set(id, el.getBoundingClientRect());
      }
    });
    return firstRects;
  };

  const commitWithFLIP = (buildNext: () => InvoiceTemplate) => {
    if (isAnimatingRef.current) return;
    if (prefersReducedMotion()) {
      onChangeTemplate(buildNext());
      return;
    }
    const firstRects = captureFirstRects();
    pendingFlipRef.current = {
      firstRects,
      prevRows: grid.rowsCount,
      prevCols: grid.colsCount,
    };
    isAnimatingRef.current = true;
    const next = buildNext();
    onChangeTemplate(next);
  };

  // FLIP orchestrator executed synchronously right after DOM updates commit
  useIsomorphicLayoutEffect(() => {
    const pending = pendingFlipRef.current;
    if (!pending) return;
    pendingFlipRef.current = null;

    const wrapEl = wrapRef.current;
    const tableEl = tableRef.current;
    if (!wrapEl || !tableEl) {
      isAnimatingRef.current = false;
      return;
    }

    if (animTimerRef.current) {
      window.clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }

    const { firstRects, prevRows } = pending;
    const animatedEls: HTMLElement[] = [];

    wrapEl.querySelectorAll<HTMLElement>(".file-combo-cell[data-cellid]").forEach((el) => {
      const cellId = el.getAttribute("data-cellid");
      if (!cellId) return;
      const first = firstRects.get(cellId);
      if (!first) return;
      const last = el.getBoundingClientRect();
      const dx = (first.left || 0) - (last.left || 0);
      const dy = (first.top || 0) - (last.top || 0);
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        el.style.transition = "none";
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        animatedEls.push(el);
      }
    });

    const addedRows: HTMLElement[] = [];
    if (grid.rowsCount > prevRows) {
      const tbody = tableEl.querySelector("tbody");
      if (tbody) {
        for (let r = prevRows; r < grid.rowsCount; r++) {
          const tr = tbody.children[r] as HTMLElement | undefined;
          if (tr) {
            tr.classList.add("grid-row-entering");
            addedRows.push(tr);
          }
        }
      }
    }

    // Force style recalculation before starting PLAY phase
    void wrapEl.offsetHeight;

    const rafId = window.requestAnimationFrame(() => {
      animatedEls.forEach((el) => {
        el.style.transition = "transform 280ms cubic-bezier(0.16, 1, 0.3, 1)";
        el.style.transform = "";
      });
    });

    animTimerRef.current = window.setTimeout(() => {
      animatedEls.forEach((el) => {
        el.style.transition = "";
        el.style.transform = "";
      });
      addedRows.forEach((tr) => tr.classList.remove("grid-row-entering"));
      isAnimatingRef.current = false;
      animTimerRef.current = null;
    }, 300);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [template, grid.rowsCount]);

  // Drag visuals helpers
  const resetLiveDragVisuals = () => {
    const wrapEl = wrapRef.current;
    const tableEl = tableRef.current;
    if (!wrapEl || !tableEl) return;

    tableEl
      .querySelectorAll<HTMLElement>(".td-cell, .file-combo-cell, .file-empty-slot")
      .forEach((el) => {
        el.style.transform = "";
        el.style.transition = "";
        el.style.zIndex = "";
      });
    wrapEl.querySelectorAll(".is-drag-placeholder").forEach((el) => {
      el.classList.remove("is-drag-placeholder");
    });
    wrapEl.querySelectorAll(".is-dragging").forEach((el) => {
      el.classList.remove("is-dragging");
    });
  };

  const measureGridBounds = (): LiveDragState["bounds"] => {
    const tableEl = tableRef.current;
    if (!tableEl) {
      return { rowBounds: [], colBounds: [], rowHeight: 38, colWidth: 200 };
    }
    const tableRect = tableEl.getBoundingClientRect();
    const tbody = tableEl.querySelector("tbody");
    const trs = tbody
      ? Array.from(tbody.children).filter(
          (tr) => !tr.classList.contains("grid-row-collapsing")
        )
      : [];

    const rowBounds: GridRowBound[] = trs.map((tr, idx) => {
      const rect = tr.getBoundingClientRect();
      return {
        row: idx,
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height || 38,
        mid: (rect.top + rect.bottom) / 2,
      };
    });

    const colsCount = Math.max(grid.colsCount || 1, 1);
    const colWidth = tableRect.width > 0 ? tableRect.width / colsCount : 200;
    const colBounds: GridColBound[] = [];
    for (let c = 0; c < colsCount; c++) {
      const left = tableRect.left + c * colWidth;
      const right = left + colWidth;
      colBounds.push({
        col: c,
        left,
        right,
        mid: (left + right) / 2,
      });
    }

    const rowHeight = rowBounds[0]?.height || 38;
    return { rowBounds, colBounds, rowHeight, colWidth };
  };

  const updateLiveDragDisplacements = (
    sRow: number,
    sCol: number,
    curRow: number,
    curCol: number,
    bounds: LiveDragState["bounds"]
  ) => {
    const wrapEl = wrapRef.current;
    const tableEl = tableRef.current;
    if (!wrapEl || !tableEl) return;

    const rowH = bounds.rowHeight || 38;
    const colW = bounds.colWidth || 200;

    tableEl
      .querySelectorAll<HTMLElement>(".td-cell, .file-combo-cell, .file-empty-slot")
      .forEach((el) => {
        el.style.transform = "";
        el.style.transition = "transform 180ms cubic-bezier(0.16, 1, 0.3, 1)";
        el.style.zIndex = "";
      });
    wrapEl.querySelectorAll(".is-drag-placeholder").forEach((el) => {
      el.classList.remove("is-drag-placeholder");
    });

    const getTd = (r: number, c: number) =>
      tableEl.querySelector<HTMLElement>(`td.td-cell[data-row="${r}"][data-col="${c}"]`);
    const getInner = (r: number, c: number) =>
      getTd(r, c)?.querySelector<HTMLElement>(".file-combo-cell, .file-empty-slot") || null;

    const targetTd = getTd(curRow, curCol);
    if (targetTd) {
      targetTd.classList.add("is-drag-placeholder");
    }

    const srcTd = getTd(sRow, sCol);
    const draggedInner = srcTd?.querySelector<HTMLElement>(".file-combo-cell") || null;

    if (curCol === sCol) {
      if (curRow > sRow) {
        for (let r = sRow + 1; r <= curRow; r++) {
          const inner = getInner(r, sCol);
          const rTd = getTd(r, sCol);
          if (inner && inner !== draggedInner) {
            inner.style.transform = `translateY(-${rowH}px)`;
            const z = 10 + (r - sRow);
            inner.style.zIndex = String(z);
            if (rTd) rTd.style.zIndex = String(z);
          }
        }
        if (draggedInner) {
          draggedInner.style.transform = `translateY(${(curRow - sRow) * rowH}px)`;
          draggedInner.style.zIndex = "35";
        }
        if (srcTd) srcTd.style.zIndex = "35";
      } else if (curRow < sRow) {
        const count = sRow - curRow;
        const baseZ = 20 + count;
        for (let r = curRow; r < sRow; r++) {
          const inner = getInner(r, sCol);
          const rTd = getTd(r, sCol);
          const z = baseZ - (r - curRow);
          if (inner && inner !== draggedInner) {
            inner.style.transform = `translateY(${rowH}px)`;
            inner.style.zIndex = String(z);
          }
          if (rTd) rTd.style.zIndex = String(z);
        }
        if (draggedInner) {
          draggedInner.style.transform = `translateY(-${(sRow - curRow) * rowH}px)`;
          draggedInner.style.zIndex = String(baseZ + 15);
        }
        if (srcTd) srcTd.style.zIndex = String(baseZ + 15);
      } else if (draggedInner) {
        draggedInner.style.transform = "";
      }
    } else {
      for (let r = sRow + 1; r < grid.rowsCount; r++) {
        const inner = getInner(r, sCol);
        const rTd = getTd(r, sCol);
        if (inner && inner !== draggedInner) {
          inner.style.transform = `translateY(-${rowH}px)`;
          const z = 10 + (r - sRow);
          inner.style.zIndex = String(z);
          if (rTd) rTd.style.zIndex = String(z);
        }
      }

      const targetCount = grid.rowsCount - curRow;
      const baseTargetZ = 20 + targetCount;
      for (let r = curRow; r < grid.rowsCount; r++) {
        const inner = getInner(r, curCol);
        const rTd = getTd(r, curCol);
        const z = baseTargetZ - (r - curRow);
        if (inner && inner !== draggedInner) {
          inner.style.transform = `translateY(${rowH}px)`;
          inner.style.zIndex = String(z);
        }
        if (rTd) rTd.style.zIndex = String(z);
      }

      if (draggedInner) {
        const dx = (curCol - sCol) * colW;
        const dy = (curRow - sRow) * rowH;
        draggedInner.style.transform = `translate(${dx}px, ${dy}px)`;
        draggedInner.style.zIndex = String(baseTargetZ + 15);
      }
      if (srcTd) srcTd.style.zIndex = String(baseTargetZ + 15);
    }
  };

  const handleToggleMode = () => {
    setContextMenu(null);
    setGridMode((prev) => {
      const next = prev === "normal" ? "edit" : "normal";
      if (next === "edit") {
        setSelectedCells(new Set());
        showToast("Edit Mode: Click fields to edit", "info");
      } else {
        showToast("Normal Mode: Select, multi-select, or drag cells", "info");
      }
      return next;
    });
  };

  const handleAutoBalance = () => {
    if (isAnimatingRef.current) return;
    setContextMenu(null);
    setSelectedCells(new Set());
    const balanced = autoBalanceGrid(template);
    commitWithFLIP(() => balanced);
    const g = balanced.headerGrid;
    showToast(
      `Sheet auto-balanced (${g?.colsCount || 2} columns, ${g?.rowsCount || 1} rows)`,
      "success"
    );
  };

  const handleInsertRow = (insertRow: number) => {
    if (isAnimatingRef.current) return;
    setDividerState(null);
    setContextMenu(null);
    const next = insertGridRow(template, insertRow);
    setRecentlyInsertedRow(insertRow);
    onChangeTemplate(next);
    showToast(`Row added at position ${insertRow + 1}`, "info");
  };

  const handleInsertCol = (insertCol: number) => {
    if (isAnimatingRef.current) return;
    setDividerState(null);
    setContextMenu(null);
    const res = insertGridCol(template, insertCol);
    if (res.error) {
      showToast(res.error, "warning");
      return;
    }
    setRecentlyInsertedCol(insertCol);
    onChangeTemplate(res.template);
    showToast(`Column added at position ${insertCol + 1}`, "info");
  };

  const handleDeleteRow = (targetRow: number) => {
    if (isAnimatingRef.current) return;
    setContextMenu(null);
    setHoveredDelRow(null);
    setDividerState(null);

    const snapshot = cloneTemplate(template);
    const res = deleteGridRow(template, targetRow);
    if (res.error) {
      showToast(res.error, "warning");
      return;
    }

    const msg =
      res.removedFieldsCount > 0
        ? `Row ${targetRow + 1} deleted (${res.removedFieldsCount} field${
            res.removedFieldsCount > 1 ? "s" : ""
          } removed)`
        : "Empty row deleted";

    const restoreRow = () => {
      commitWithFLIP(() => {
        setRecentlyInsertedRow(targetRow);
        return snapshot;
      });
      showToast(`Row ${targetRow + 1} restored`, "success");
    };

    const tableEl = tableRef.current;
    const tbody = tableEl?.querySelector("tbody");
    const tr = tbody?.children[targetRow] as HTMLElement | undefined;

    if (!tr || prefersReducedMotion()) {
      onChangeTemplate(res.template);
      showToast(msg, "info", res.removedFieldsCount > 0 ? 4500 : 3200, {
        label: "Undo",
        onClick: restoreRow,
      });
      return;
    }

    isAnimatingRef.current = true;
    tr.classList.add("grid-row-collapsing");
    tr.style.transition = "height 220ms cubic-bezier(0.16, 1, 0.3, 1)";
    tr.style.height = "0px";
    tr.style.overflow = "hidden";

    const tdList = Array.from(tr.querySelectorAll<HTMLElement>("td.td-cell"));
    const innerList = Array.from(
      tr.querySelectorAll<HTMLElement>(".file-combo-cell, .file-empty-slot")
    );

    tdList.forEach((td) => {
      td.style.transition = "border-color 180ms ease";
      td.style.borderBottomColor = "transparent";
      td.style.borderRightColor = "transparent";
    });
    innerList.forEach((el) => {
      el.style.transition =
        "max-height 220ms cubic-bezier(0.16, 1, 0.3, 1), min-height 220ms, opacity 180ms ease";
      el.style.maxHeight = "0px";
      el.style.minHeight = "0px";
      el.style.height = "0px";
      el.style.opacity = "0";
      el.style.overflow = "hidden";
    });

    window.setTimeout(() => {
      tr.classList.remove("grid-row-collapsing");
      tr.style.transition = "";
      tr.style.height = "";
      tr.style.overflow = "";
      tdList.forEach((td) => {
        td.style.transition = "";
        td.style.borderBottomColor = "";
        td.style.borderRightColor = "";
      });
      innerList.forEach((el) => {
        el.style.transition = "";
        el.style.maxHeight = "";
        el.style.minHeight = "";
        el.style.height = "";
        el.style.opacity = "";
        el.style.overflow = "";
      });
      isAnimatingRef.current = false;
      onChangeTemplate(res.template);
    }, 220);

    showToast(msg, "info", res.removedFieldsCount > 0 ? 4500 : 3200, {
      label: "Undo",
      onClick: restoreRow,
    });
  };

  const handleDeleteCol = (targetCol: number) => {
    if (isAnimatingRef.current) return;
    setContextMenu(null);
    setHoveredDelCol(null);
    setDividerState(null);

    const snapshot = cloneTemplate(template);
    const res = deleteGridCol(template, targetCol);
    if (res.error) {
      showToast(res.error, "warning");
      return;
    }

    const msg =
      res.removedFieldsCount > 0
        ? `Column ${targetCol + 1} deleted (${res.removedFieldsCount} field${
            res.removedFieldsCount > 1 ? "s" : ""
          } removed)`
        : "Empty column deleted";

    const restoreCol = () => {
      commitWithFLIP(() => {
        setRecentlyInsertedCol(targetCol);
        return snapshot;
      });
      showToast(`Column ${targetCol + 1} restored`, "success");
    };

    const tableEl = tableRef.current;
    const colgroup = tableEl?.querySelector("colgroup");
    const tbody = tableEl?.querySelector("tbody");
    const colEl = colgroup?.children[targetCol] as HTMLElement | undefined;
    const tdsToCollapse = tbody
      ? (Array.from(
          tableEl?.querySelectorAll<HTMLElement>(`td.td-cell[data-col="${targetCol}"]`) || []
        ) as HTMLElement[])
      : [];

    if (!tableEl || tdsToCollapse.length === 0 || prefersReducedMotion()) {
      onChangeTemplate(res.template);
      showToast(msg, "info", res.removedFieldsCount > 0 ? 4500 : 3200, {
        label: "Undo",
        onClick: restoreCol,
      });
      return;
    }

    isAnimatingRef.current = true;
    const newWidthPct = (100 / (grid.colsCount - 1)).toFixed(2);
    if (colgroup) {
      Array.from(colgroup.children).forEach((col, idx) => {
        const cEl = col as HTMLElement;
        cEl.style.transition = "width 220ms cubic-bezier(0.16, 1, 0.3, 1)";
        cEl.style.width = idx === targetCol ? "0%" : `${newWidthPct}%`;
      });
    }

    const innersToCollapse: HTMLElement[] = [];
    tdsToCollapse.forEach((td) => {
      td.classList.add("td-col-collapsing");
      td.style.transition =
        "width 220ms cubic-bezier(0.16, 1, 0.3, 1), max-width 220ms, opacity 180ms ease, border-color 180ms ease";
      td.style.width = "0%";
      td.style.maxWidth = "0px";
      td.style.opacity = "0";
      td.style.overflow = "hidden";
      td.style.borderRightColor = "transparent";
      const inner = td.querySelector<HTMLElement>(".file-combo-cell, .file-empty-slot");
      if (inner) {
        inner.style.transition =
          "width 220ms cubic-bezier(0.16, 1, 0.3, 1), max-width 220ms, opacity 180ms ease";
        inner.style.width = "0px";
        inner.style.maxWidth = "0px";
        inner.style.opacity = "0";
        inner.style.overflow = "hidden";
        innersToCollapse.push(inner);
      }
    });

    window.setTimeout(() => {
      if (colEl) {
        colEl.style.transition = "";
      }
      if (colgroup) {
        Array.from(colgroup.children).forEach((col) => {
          (col as HTMLElement).style.transition = "";
        });
      }
      tdsToCollapse.forEach((td) => {
        td.classList.remove("td-col-collapsing");
        td.style.transition = "";
        td.style.width = "";
        td.style.maxWidth = "";
        td.style.opacity = "";
        td.style.overflow = "";
        td.style.borderRightColor = "";
      });
      innersToCollapse.forEach((inner) => {
        inner.style.transition = "";
        inner.style.width = "";
        inner.style.maxWidth = "";
        inner.style.opacity = "";
        inner.style.overflow = "";
      });
      isAnimatingRef.current = false;
      onChangeTemplate(res.template);
    }, 220);

    showToast(msg, "info", res.removedFieldsCount > 0 ? 4500 : 3200, {
      label: "Undo",
      onClick: restoreCol,
    });
  };

  const updateCellContent = (
    cellRow: number,
    cellCol: number,
    patch: Partial<Pick<HeaderGridCell, "key" | "label" | "value">>,
    sanitizeKeyOnBlur = false
  ) => {
    const next = cloneTemplate(template);
    const nextGrid = ensureHeaderGrid(next);
    const target = nextGrid.cells.find((c) => c.row === cellRow && c.col === cellCol);
    if (!target) return;

    target.empty = false;
    if (patch.key !== undefined) {
      const normalized = sanitizeKeyOnBlur
        ? sanitizeToken(patch.key, target.key || "FIELD")
        : patch.key.toUpperCase();
      target.key = normalized;
      target.label = formatFieldLabel(normalized);
    }
    if (patch.label !== undefined && patch.key === undefined) {
      target.label = patch.label;
      if (patch.label.trim()) {
        target.key = sanitizeToken(patch.label, target.key || "FIELD");
      }
    }
    if (patch.value !== undefined) {
      target.value = getCleanFieldValue(patch.value);
    }

    syncGridToHeaderFields(next);
    onChangeTemplate(next);
  };

  const handleCellClick = (e: React.MouseEvent, cell: HeaderGridCell) => {
    if (gridMode !== "normal") return;
    if ((e.target as HTMLElement).closest("button")) return;

    const coord = `${cell.row},${cell.col}`;
    if (e.shiftKey && anchorCell) {
      const rMin = Math.min(anchorCell.row, cell.row);
      const rMax = Math.max(anchorCell.row, cell.row);
      const cMin = Math.min(anchorCell.col, cell.col);
      const cMax = Math.max(anchorCell.col, cell.col);
      const nextSel = new Set<string>();
      for (const cItem of grid.cells) {
        if (cItem.row >= rMin && cItem.row <= rMax && cItem.col >= cMin && cItem.col <= cMax) {
          nextSel.add(`${cItem.row},${cItem.col}`);
        }
      }
      setSelectedCells(nextSel);
    } else if (e.ctrlKey || e.metaKey) {
      setSelectedCells((prev) => {
        const next = new Set(prev);
        if (next.has(coord)) next.delete(coord);
        else next.add(coord);
        return next;
      });
      setAnchorCell({ row: cell.row, col: cell.col });
    } else {
      setSelectedCells(new Set([coord]));
      setAnchorCell({ row: cell.row, col: cell.col });
    }
  };

  const handleOpenCellMenuAtCoords = (
    clientRight: number,
    clientLeft: number,
    clientBottom: number,
    cell: HeaderGridCell
  ) => {
    const wrapEl = wrapRef.current;
    if (!wrapEl) return;
    const wrapRect = wrapEl.getBoundingClientRect();
    const menuWidth = 236;
    const rightSpaceMenuX = clientRight - wrapRect.left + 4;
    const rawX =
      rightSpaceMenuX + menuWidth > wrapRect.width
        ? clientLeft - wrapRect.left - menuWidth - 4
        : rightSpaceMenuX;
    const rawY = clientBottom - wrapRect.top + 4;

    setContextMenu({
      cellRow: cell.row,
      cellCol: cell.col,
      x: Math.max(4, rawX),
      y: Math.max(4, rawY),
    });
  };

  const handleOpenCellMenu = (e: React.MouseEvent<HTMLButtonElement>, cell: HeaderGridCell) => {
    e.stopPropagation();
    const btnRect = e.currentTarget.getBoundingClientRect();
    handleOpenCellMenuAtCoords(btnRect.right, btnRect.left, btnRect.bottom, cell);
  };

  const handleMouseMoveWrap = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (
      draggingCellId ||
      liveDragRef.current ||
      !wrapRef.current ||
      !tableRef.current ||
      target?.closest(".grid-delete-row-btn, .grid-delete-col-btn")
    ) {
      if (dividerState) setDividerState(null);
      return;
    }
    if (contextMenu) return;

    if (isHoveringRowInsertRef.current || target?.closest("#btn-insert-row")) {
      return;
    }
    if (isHoveringColInsertRef.current || target?.closest("#btn-insert-col")) {
      return;
    }

    const wrapRect = wrapRef.current.getBoundingClientRect();
    const tableRect = tableRef.current.getBoundingClientRect();
    const mX = e.clientX;
    const mY = e.clientY;

    if (
      mX < tableRect.left - 40 ||
      mX > tableRect.right + 40 ||
      mY < tableRect.top - 40 ||
      mY > tableRect.bottom + 40
    ) {
      if (dividerState) setDividerState(null);
      return;
    }

    // 1. Horizontal row divider candidates with latching hysteresis + left (+) button zone gating
    const trs = Array.from(tableRef.current.querySelectorAll("tbody > tr"));
    let nearestRowBoundaryScreenY: number | null = null;
    let minRowDist = Infinity;
    let targetRowIdx = 0;

    if (trs.length > 0) {
      const top0 = trs[0].getBoundingClientRect().top;
      const d0 = Math.abs(mY - top0);
      if (d0 < minRowDist) {
        minRowDist = d0;
        nearestRowBoundaryScreenY = top0;
        targetRowIdx = 0;
      }

      trs.forEach((tr, idx) => {
        const btm = tr.getBoundingClientRect().bottom;
        const dist = Math.abs(mY - btm);
        if (dist < minRowDist) {
          minRowDist = dist;
          nearestRowBoundaryScreenY = btm;
          targetRowIdx = idx + 1;
        }
      });
    }

    const closeThreshold = 10;
    const latchThreshold = 18;

    const isHActive = hLineActiveRef.current;
    const effectiveRowThreshold = isHActive ? latchThreshold : closeThreshold;
    const dxFromLeft = mX - tableRect.left;
    const effectiveRowZoneMax = isHActive ? 64 : 56;
    const isNearRowButtonZone = dxFromLeft >= -32 && dxFromLeft <= effectiveRowZoneMax;
    const canShowH =
      nearestRowBoundaryScreenY !== null &&
      minRowDist <= effectiveRowThreshold &&
      isNearRowButtonZone;

    // 2. Vertical column divider candidates with latching hysteresis + top (+) button zone gating
    let canShowV = false;
    let nearestColBoundaryScreenX: number | null = null;
    let targetColIdx = 0;

    if (grid.colsCount < MAX_GRID_COLS) {
      const colW = tableRect.width / grid.colsCount;
      let minColDist = Infinity;

      for (let c = 0; c <= grid.colsCount; c++) {
        const colX = tableRect.left + colW * c;
        const dist = Math.abs(mX - colX);
        if (dist < minColDist) {
          minColDist = dist;
          nearestColBoundaryScreenX = colX;
          targetColIdx = c;
        }
      }

      const isVActive = vLineActiveRef.current;
      const effectiveColThreshold = isVActive ? latchThreshold : closeThreshold;
      const dyFromTop = mY - tableRect.top;
      const effectiveColZoneMax = isVActive ? 52 : 44;
      const isNearColButtonZone = dyFromTop >= -32 && dyFromTop <= effectiveColZoneMax;
      canShowV =
        nearestColBoundaryScreenX !== null &&
        minColDist <= effectiveColThreshold &&
        isNearColButtonZone;
    }

    // 3. Top-left corner mutual exclusion: pick only the line closer to its (+) button
    let showH = canShowH;
    let showV = canShowV;
    if (
      showH &&
      showV &&
      nearestRowBoundaryScreenY !== null &&
      nearestColBoundaryScreenX !== null
    ) {
      const distToRowBtn = Math.hypot(mX - tableRect.left, mY - nearestRowBoundaryScreenY);
      const distToColBtn = Math.hypot(mX - nearestColBoundaryScreenX, mY - tableRect.top);
      if (distToRowBtn <= distToColBtn) {
        showV = false;
      } else {
        showH = false;
      }
    }

    const hLine =
      showH && nearestRowBoundaryScreenY !== null
        ? { top: nearestRowBoundaryScreenY - wrapRect.top, insertRow: targetRowIdx }
        : undefined;
    const vLine =
      showV && nearestColBoundaryScreenX !== null
        ? { left: nearestColBoundaryScreenX - wrapRect.left, insertCol: targetColIdx }
        : undefined;

    setDividerState((prev) => {
      const prevH = prev?.hLine;
      const prevV = prev?.vLine;
      if (
        prevH?.insertRow === hLine?.insertRow &&
        prevH?.top === hLine?.top &&
        prevV?.insertCol === vLine?.insertCol &&
        prevV?.left === vLine?.left
      ) {
        return prev;
      }
      if (!hLine && !vLine) return null;
      return { hLine, vLine };
    });
  };

  const handleMouseLeaveWrap = (e: React.MouseEvent<HTMLDivElement>) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (related?.closest("#grid-divider-hline, #grid-divider-vline")) {
      return;
    }
    if (!isHoveringRowInsertRef.current && !isHoveringColInsertRef.current) {
      setDividerState(null);
    }
  };

  const handleWrapDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    const live = liveDragRef.current;
    if (!live) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";

    const deltaX = e.clientX - live.startCursorX;
    const deltaY = e.clientY - live.startCursorY;
    const draggingCenterY = live.initialRowCenter + deltaY;
    const draggingCenterX = live.initialColCenter + deltaX;

    const newRow = evaluateCenterCrossingRow(
      draggingCenterY,
      live.bounds.rowBounds,
      live.currentRow
    );
    const newCol = evaluateCenterCrossingCol(
      draggingCenterX,
      live.bounds.colBounds,
      live.currentCol
    );

    if (newRow !== live.currentRow || newCol !== live.currentCol) {
      live.currentRow = newRow;
      live.currentCol = newCol;
      updateLiveDragDisplacements(
        live.sourceRow,
        live.sourceCol,
        newRow,
        newCol,
        live.bounds
      );
    }
  };

  const handleWrapDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const live = liveDragRef.current;
    if (!live || !wrapRef.current) return;
    const related = e.relatedTarget as Node | null;
    if (!related || !wrapRef.current.contains(related)) {
      live.currentRow = live.sourceRow;
      live.currentCol = live.sourceCol;
      updateLiveDragDisplacements(
        live.sourceRow,
        live.sourceCol,
        live.sourceRow,
        live.sourceCol,
        live.bounds
      );
    }
  };

  const handleWrapDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const live = liveDragRef.current;
    resetLiveDragVisuals();
    liveDragRef.current = null;
    setDraggingCellId(null);

    if (!live) return;
    const { sourceRow, sourceCol, currentRow, currentCol } = live;
    if (sourceRow !== currentRow || sourceCol !== currentCol) {
      commitWithFLIP(() =>
        shiftInsertGridCell(template, sourceRow, sourceCol, currentRow, currentCol)
      );
    }
  };

  // Focus & caret handling for inline inputs in Edit Mode
  const handleInputMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    if (gridMode !== "edit") return;
    if (document.activeElement !== e.currentTarget) {
      e.currentTarget.dataset.justFocused = "true";
    }
  };

  const handleInputFocus = (
    e: React.FocusEvent<HTMLInputElement>,
    cell: HeaderGridCell,
    isValueInput: boolean
  ) => {
    if (gridMode !== "edit") return;
    const inp = e.currentTarget;
    const trimmed = inp.value.trim();
    if (trimmed === "—" || trimmed === "-" || trimmed === "–") {
      if (isValueInput) {
        updateCellContent(cell.row, cell.col, { value: "" });
      }
      return;
    }
    const len = inp.value.length;
    if (len > 0) {
      window.requestAnimationFrame(() => {
        try {
          inp.setSelectionRange(len, len);
        } catch {}
      });
    }
  };

  const handleInputMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    if (gridMode !== "edit") return;
    const inp = e.currentTarget;
    if (inp.dataset.justFocused === "true") {
      inp.dataset.justFocused = "false";
      const len = inp.value.length;
      if (len > 0) {
        try {
          inp.setSelectionRange(len, len);
        } catch {}
      }
    }
  };

  const menuCaps = useMemo(() => {
    if (!contextMenu) return null;
    return getCellCapabilities(grid, contextMenu.cellRow, contextMenu.cellCol);
  }, [grid, contextMenu]);

  const menuCell = useMemo(() => {
    if (!contextMenu) return null;
    return (
      grid.cells.find((c) => c.row === contextMenu.cellRow && c.col === contextMenu.cellCol) || null
    );
  }, [grid, contextMenu]);

  const runContextAction = (act: string) => {
    if (!contextMenu) return;
    const { cellRow: r, cellCol: c } = contextMenu;
    const cell = grid.cells.find((item) => item.row === r && item.col === c);
    const rSpan = cell?.rowspan || 1;
    const cSpan = cell?.colspan || 1;
    setContextMenu(null);

    switch (act) {
      case "merge-left":
        commitWithFLIP(() => mergeGridCell(template, r, c, "left"));
        break;
      case "merge-right":
        commitWithFLIP(() => mergeGridCell(template, r, c, "right"));
        break;
      case "merge-up":
        commitWithFLIP(() => mergeGridCell(template, r, c, "up"));
        break;
      case "merge-down":
        commitWithFLIP(() => mergeGridCell(template, r, c, "down"));
        break;
      case "split":
        commitWithFLIP(() => splitGridCell(template, r, c));
        break;
      case "ins-row-above":
        handleInsertRow(r);
        break;
      case "ins-row-below":
        handleInsertRow(r + rSpan);
        break;
      case "ins-col-left":
        handleInsertCol(c);
        break;
      case "ins-col-right":
        handleInsertCol(c + cSpan);
        break;
      case "switch-row-left":
        commitWithFLIP(() => switchGridCellDirection(template, r, c, "left"));
        break;
      case "switch-row-right":
        commitWithFLIP(() => switchGridCellDirection(template, r, c, "right"));
        break;
      case "switch-col-above":
        commitWithFLIP(() => switchGridCellDirection(template, r, c, "above"));
        break;
      case "switch-col-below":
        commitWithFLIP(() => switchGridCellDirection(template, r, c, "below"));
        break;
      case "del-row":
        handleDeleteRow(r);
        break;
      case "del-col":
        handleDeleteCol(c);
        break;
      case "clear-cell":
        onChangeTemplate(clearGridCell(template, r, c));
        break;
      default:
        break;
    }
  };

  return (
    <section className="file-details-card">
      <div className="file-details-header">
        <div className="file-details-heading">
          <span>FILE DETAILS</span>
        </div>
        <div className="file-details-actions">
          <button
            type="button"
            className="btn-file-auto-balance"
            id="btn-auto-balance-grid"
            title="Auto-balance grid layout"
            onClick={handleAutoBalance}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
            </svg>
            <span>Auto</span>
          </button>

          <button
            type="button"
            className={`btn-file-toggle-mode ${gridMode === "edit" ? "active is-edit-mode" : ""}`}
            id="btn-toggle-grid-mode"
            title={gridMode === "edit" ? "Save & Exit Edit Mode" : "Edit Names and Values"}
            onClick={handleToggleMode}
          >
            {gridMode === "edit" ? (
              <>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Done</span>
              </>
            ) : (
              <>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>Edit</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-file-add-field"
            id="btn-add-header-field"
            title="Add Field"
            onClick={() => onOpenAddFieldModal()}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Field</span>
          </button>
        </div>
      </div>

      <div
        className={`file-table-wrap${draggingCellId ? " is-dragging-active" : ""}`}
        id="file-table-wrap"
        ref={wrapRef}
        onMouseMove={handleMouseMoveWrap}
        onMouseLeave={handleMouseLeaveWrap}
        onDragOver={handleWrapDragOver}
        onDragLeave={handleWrapDragLeave}
        onDrop={handleWrapDrop}
      >
        {/* Proximity Divider Overlay Lines & (+) Badges */}
        <div className="grid-proximity-overlay" id="grid-proximity-overlay">
          <div
            className="grid-divider-line h-line"
            id="grid-divider-hline"
            style={
              dividerState?.hLine
                ? {
                    display: "block",
                    top: `${dividerState.hLine.top}px`,
                    left: 0,
                    right: 0,
                  }
                : { display: "none" }
            }
          >
            <button
              type="button"
              className="grid-insert-btn h-badge"
              id="btn-insert-row"
              title="Insert Row"
              onMouseEnter={() => {
                isHoveringRowInsertRef.current = true;
              }}
              onMouseLeave={() => {
                isHoveringRowInsertRef.current = false;
              }}
              onClick={(e) => {
                e.stopPropagation();
                isHoveringRowInsertRef.current = false;
                if (dividerState?.hLine) handleInsertRow(dividerState.hLine.insertRow);
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <div
            className="grid-divider-line v-line"
            id="grid-divider-vline"
            style={
              dividerState?.vLine
                ? {
                    display: "block",
                    left: `${dividerState.vLine.left}px`,
                    top: 0,
                    bottom: 0,
                  }
                : { display: "none" }
            }
          >
            <button
              type="button"
              className="grid-insert-btn v-badge"
              id="btn-insert-col"
              title="Insert Column"
              onMouseEnter={() => {
                isHoveringColInsertRef.current = true;
              }}
              onMouseLeave={() => {
                isHoveringColInsertRef.current = false;
              }}
              onClick={(e) => {
                e.stopPropagation();
                isHoveringColInsertRef.current = false;
                if (dividerState?.vLine) handleInsertCol(dividerState.vLine.insertCol);
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        <table
          ref={tableRef}
          className={`file-details-table ${gridMode === "edit" ? "mode-edit" : "mode-normal"}`}
          id="file-details-table"
        >
          <colgroup>
            {Array.from({ length: grid.colsCount }).map((_, idx) => (
              <col
                key={idx}
                style={{
                  width: `${(100 / grid.colsCount).toFixed(2)}%`,
                  transition: "width 240ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            ))}
          </colgroup>
          <tbody>
            {rows.map((rowCells, rIdx) => {
              const isRowDelHover = hoveredDelRow === rIdx;
              const isRowEntering = recentlyInsertedRow === rIdx;

              return (
                <tr
                  key={`row_${rIdx}`}
                  data-row={rIdx}
                  className={`${isRowDelHover ? "is-row-delete-hover is-delete-hover" : ""} ${
                    isRowEntering ? "grid-row-entering" : ""
                  }`.trim()}
                >
                  {rowCells.map((cell) => {
                    const rSpan = cell.rowspan || 1;
                    const cSpan = cell.colspan || 1;
                    const isLastInRow = cell.col + cSpan >= grid.colsCount;
                    const isBottomInCol = cell.row + rSpan >= grid.rowsCount;
                    const showDelRowBadge = gridMode !== "edit" && grid.rowsCount > 1 && isLastInRow;
                    const showDelColBadge = gridMode !== "edit" && grid.colsCount > 1 && isBottomInCol;
                    const isSelected = selectedCells.has(`${cell.row},${cell.col}`);
                    const isRowSpanHover =
                      hoveredDelRow !== null &&
                      hoveredDelRow >= cell.row &&
                      hoveredDelRow < cell.row + rSpan;
                    const isColDelHover =
                      hoveredDelCol !== null &&
                      hoveredDelCol >= cell.col &&
                      hoveredDelCol < cell.col + cSpan;
                    const isColEntering = recentlyInsertedCol === cell.col;
                    const isDragging = draggingCellId === cell.id;

                    const keyDisplay = (cell.key || "").toUpperCase();
                    const labelDisplay = (cell.label || "").trim() || formatFieldLabel(cell.key || "");
                    const valDisplay = getCleanFieldValue(cell.value);

                    return (
                      <td
                        key={cell.id}
                        data-cellid={cell.id}
                        data-row={cell.row}
                        data-col={cell.col}
                        rowSpan={rSpan > 1 ? rSpan : undefined}
                        colSpan={cSpan > 1 ? cSpan : undefined}
                        className={[
                          "td-cell",
                          cell.empty ? "td-empty-slot" : "",
                          isSelected ? "is-selected" : "",
                          isRowSpanHover ? "is-row-delete-hover is-delete-hover" : "",
                          isColDelHover ? "is-col-delete-hover is-delete-hover" : "",
                          isColEntering ? "td-col-entering" : "",
                          isDragging ? "is-drag-placeholder" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        style={{ position: "relative" }}
                        onClick={(e) => handleCellClick(e, cell)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenCellMenuAtCoords(e.clientX, e.clientX, e.clientY, cell);
                        }}
                      >
                        {cell.empty ? (
                          <div
                            className="file-empty-slot"
                            data-row={cell.row}
                            data-col={cell.col}
                            data-cellid={`cell_empty_${cell.id}`}
                          >
                            <button
                              type="button"
                              className="btn-slot-add-field"
                              data-row={cell.row}
                              data-col={cell.col}
                              title="Add Field to Cell"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenAddFieldModal(cell.row, cell.col);
                              }}
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                              <span>Add Field</span>
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`file-combo-cell${isDragging ? " is-dragging" : ""}`}
                            data-cellid={cell.id}
                            data-row={cell.row}
                            data-col={cell.col}
                            draggable={gridMode === "normal"}
                            onDragStart={(e) => {
                              const bounds = measureGridBounds();
                              const elRect = e.currentTarget.getBoundingClientRect();
                              const initialRowCenter =
                                bounds.rowBounds[cell.row]?.mid ?? (elRect.top + elRect.bottom) / 2;
                              const initialColCenter =
                                bounds.colBounds[cell.col]?.mid ?? (elRect.left + elRect.right) / 2;

                              liveDragRef.current = {
                                sourceRow: cell.row,
                                sourceCol: cell.col,
                                currentRow: cell.row,
                                currentCol: cell.col,
                                cellId: cell.id,
                                startCursorX: e.clientX || initialColCenter,
                                startCursorY: e.clientY || initialRowCenter,
                                initialRowCenter,
                                initialColCenter,
                                bounds,
                              };

                              setDraggingCellId(cell.id);
                              setDividerState(null);
                              if (e.dataTransfer) {
                                e.dataTransfer.effectAllowed = "move";
                                e.dataTransfer.setData("text/plain", cell.id);
                              }
                            }}
                            onDragEnd={() => {
                              resetLiveDragVisuals();
                              liveDragRef.current = null;
                              setDraggingCellId(null);
                            }}
                          >
                            <div className="combo-key-box" title={`Field Token Key: ${cell.key || ""}`}>
                              <input
                                type="text"
                                className="combo-key-input"
                                data-row={cell.row}
                                data-col={cell.col}
                                value={keyDisplay}
                                placeholder="KEY"
                                spellCheck={false}
                                readOnly={gridMode === "normal"}
                                draggable={false}
                                aria-label={`Token key for ${labelDisplay}`}
                                onMouseDown={handleInputMouseDown}
                                onFocus={(e) => handleInputFocus(e, cell, false)}
                                onMouseUp={handleInputMouseUp}
                                onChange={(e) =>
                                  updateCellContent(cell.row, cell.col, { key: e.target.value })
                                }
                                onBlur={(e) =>
                                  updateCellContent(cell.row, cell.col, { key: e.target.value }, true)
                                }
                              />
                            </div>

                            <div className="combo-val-box">
                              <input
                                type="text"
                                className="combo-val-input"
                                data-row={cell.row}
                                data-col={cell.col}
                                value={valDisplay}
                                readOnly={gridMode === "normal"}
                                draggable={false}
                                placeholder="—"
                                aria-label={`Value for ${labelDisplay}`}
                                onMouseDown={handleInputMouseDown}
                                onFocus={(e) => handleInputFocus(e, cell, true)}
                                onMouseUp={handleInputMouseUp}
                                onChange={(e) =>
                                  updateCellContent(cell.row, cell.col, { value: e.target.value })
                                }
                              />
                            </div>

                            <div className="combo-actions">
                              <button
                                type="button"
                                className="btn-cell-options"
                                title="Cell options"
                                aria-label="Cell options"
                                onClick={(e) => handleOpenCellMenu(e, cell)}
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <circle cx="12" cy="5" r="2" />
                                  <circle cx="12" cy="12" r="2" />
                                  <circle cx="12" cy="19" r="2" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}

                        {showDelRowBadge
                          ? Array.from({ length: rSpan }).map((_, sr) => {
                              const actualRow = cell.row + sr;
                              const isBtnHover = hoveredDelRow === actualRow;
                              return (
                                <button
                                  key={`del_r_${actualRow}`}
                                  type="button"
                                  className={`grid-delete-row-btn${isBtnHover ? " is-hovered" : ""}`}
                                  data-row={actualRow}
                                  style={
                                    rSpan > 1
                                      ? {
                                          top: `${((sr / rSpan) * 100).toFixed(1)}%`,
                                          height: `${(100 / rSpan).toFixed(1)}%`,
                                        }
                                      : undefined
                                  }
                                  title={`Delete Row ${actualRow + 1}`}
                                  aria-label={`Delete Row ${actualRow + 1}`}
                                  onMouseEnter={() => {
                                    setDividerState(null);
                                    setHoveredDelRow(actualRow);
                                  }}
                                  onMouseLeave={() => setHoveredDelRow(null)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRow(actualRow);
                                  }}
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              );
                            })
                          : null}

                        {showDelColBadge
                          ? Array.from({ length: cSpan }).map((_, sc) => {
                              const actualCol = cell.col + sc;
                              const isBtnHover = hoveredDelCol === actualCol;
                              return (
                                <button
                                  key={`del_c_${actualCol}`}
                                  type="button"
                                  className={`grid-delete-col-btn${isBtnHover ? " is-hovered" : ""}`}
                                  data-col={actualCol}
                                  style={
                                    cSpan > 1
                                      ? {
                                          left: `${((sc / cSpan) * 100).toFixed(1)}%`,
                                          width: `${(100 / cSpan).toFixed(1)}%`,
                                        }
                                      : undefined
                                  }
                                  title={`Delete Column ${actualCol + 1}`}
                                  aria-label={`Delete Column ${actualCol + 1}`}
                                  onMouseEnter={() => {
                                    setDividerState(null);
                                    setHoveredDelCol(actualCol);
                                  }}
                                  onMouseLeave={() => setHoveredDelCol(null)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCol(actualCol);
                                  }}
                                >
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                  </svg>
                                </button>
                              );
                            })
                          : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {contextMenu && menuCaps ? (
          <div
            ref={menuRef}
            className="cell-context-menu"
            id="cell-context-menu"
            style={{
              display: "flex",
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
          >
            <div className="cell-menu-row">
              <span className="cell-menu-label">Merge</span>
              <div className="cell-menu-actions">
                <button
                  type="button"
                  className={`cell-menu-action ${!menuCaps.canMergeLeft ? "disabled" : ""}`}
                  disabled={!menuCaps.canMergeLeft}
                  onClick={() => runContextAction("merge-left")}
                >
                  Left
                </button>
                <button
                  type="button"
                  className={`cell-menu-action ${!menuCaps.canMergeRight ? "disabled" : ""}`}
                  disabled={!menuCaps.canMergeRight}
                  onClick={() => runContextAction("merge-right")}
                >
                  Right
                </button>
                <button
                  type="button"
                  className={`cell-menu-action ${!menuCaps.canMergeUp ? "disabled" : ""}`}
                  disabled={!menuCaps.canMergeUp}
                  onClick={() => runContextAction("merge-up")}
                >
                  Up
                </button>
                <button
                  type="button"
                  className={`cell-menu-action ${!menuCaps.canMergeDown ? "disabled" : ""}`}
                  disabled={!menuCaps.canMergeDown}
                  onClick={() => runContextAction("merge-down")}
                >
                  Down
                </button>
              </div>
            </div>

            {menuCaps.canSplit ? (
              <div className="cell-menu-row">
                <span className="cell-menu-label">Split Cell</span>
                <div className="cell-menu-actions">
                  <button
                    type="button"
                    className="cell-menu-action"
                    onClick={() => runContextAction("split")}
                  >
                    Unmerge
                  </button>
                </div>
              </div>
            ) : null}

            <div className="cell-menu-divider" />

            <div className="cell-menu-row">
              <span className="cell-menu-label">Insert Row</span>
              <div className="cell-menu-actions">
                <button
                  type="button"
                  className="cell-menu-action"
                  onClick={() => runContextAction("ins-row-above")}
                >
                  Above
                </button>
                <button
                  type="button"
                  className="cell-menu-action"
                  onClick={() => runContextAction("ins-row-below")}
                >
                  Below
                </button>
              </div>
            </div>

            <div className="cell-menu-row">
              <span className="cell-menu-label">Insert Column</span>
              <div className="cell-menu-actions">
                <button
                  type="button"
                  className={`cell-menu-action ${!menuCaps.canInsertCol ? "disabled" : ""}`}
                  disabled={!menuCaps.canInsertCol}
                  onClick={() => runContextAction("ins-col-left")}
                >
                  Left
                </button>
                <button
                  type="button"
                  className={`cell-menu-action ${!menuCaps.canInsertCol ? "disabled" : ""}`}
                  disabled={!menuCaps.canInsertCol}
                  onClick={() => runContextAction("ins-col-right")}
                >
                  Right
                </button>
              </div>
            </div>

            <div className="cell-menu-divider" />

            <div className="cell-menu-row">
              <span className="cell-menu-label">Switch in Row</span>
              <div className="cell-menu-actions">
                <button
                  type="button"
                  className={`cell-menu-action ${!menuCaps.canSwitchRowLeft ? "disabled" : ""}`}
                  disabled={!menuCaps.canSwitchRowLeft}
                  onClick={() => runContextAction("switch-row-left")}
                >
                  Left
                </button>
                <button
                  type="button"
                  className={`cell-menu-action ${!menuCaps.canSwitchRowRight ? "disabled" : ""}`}
                  disabled={!menuCaps.canSwitchRowRight}
                  onClick={() => runContextAction("switch-row-right")}
                >
                  Right
                </button>
              </div>
            </div>

            <div className="cell-menu-row">
              <span className="cell-menu-label">Switch in Col</span>
              <div className="cell-menu-actions">
                <button
                  type="button"
                  className={`cell-menu-action ${!menuCaps.canSwitchColAbove ? "disabled" : ""}`}
                  disabled={!menuCaps.canSwitchColAbove}
                  onClick={() => runContextAction("switch-col-above")}
                >
                  Above
                </button>
                <button
                  type="button"
                  className={`cell-menu-action ${!menuCaps.canSwitchColBelow ? "disabled" : ""}`}
                  disabled={!menuCaps.canSwitchColBelow}
                  onClick={() => runContextAction("switch-col-below")}
                >
                  Below
                </button>
              </div>
            </div>

            <div className="cell-menu-divider" />

            <div className="cell-menu-row">
              <span className="cell-menu-label">Delete</span>
              <div className="cell-menu-actions">
                <button
                  type="button"
                  className={`cell-menu-action danger ${!menuCaps.canDeleteRow ? "disabled" : ""}`}
                  disabled={!menuCaps.canDeleteRow}
                  onClick={() => runContextAction("del-row")}
                >
                  Row
                </button>
                <button
                  type="button"
                  className={`cell-menu-action danger ${!menuCaps.canDeleteCol ? "disabled" : ""}`}
                  disabled={!menuCaps.canDeleteCol}
                  onClick={() => runContextAction("del-col")}
                >
                  Column
                </button>
              </div>
            </div>

            {menuCell && !menuCell.empty ? (
              <div className="cell-menu-row">
                <span className="cell-menu-label">Clear Field</span>
                <div className="cell-menu-actions">
                  <button
                    type="button"
                    className="cell-menu-action danger"
                    onClick={() => runContextAction("clear-cell")}
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
