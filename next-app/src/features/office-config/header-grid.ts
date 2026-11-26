import type {
  HeaderGrid,
  HeaderGridCell,
  InvoiceTemplate,
  OperationalFile,
  PremadeDeliverable,
} from "@/lib/types";
import { DAGFormulaEngine, sanitizeToken } from "@/lib/dag-formula-engine";

let localIdSeq = 0;

export function nextTemplateItemId(prefix: string): string {
  localIdSeq += 1;
  return `${prefix}_${localIdSeq}_${Date.now().toString(36)}`;
}

const ACRONYMS = new Set(["GRT", "NRT", "IMO", "LOA", "ETA", "ETD", "VAT", "ID"]);

export const MAX_GRID_COLS = 5;

export function cloneTemplate(tpl: InvoiceTemplate): InvoiceTemplate {
  return JSON.parse(JSON.stringify(tpl)) as InvoiceTemplate;
}

export function formatFieldLabel(key: string): string {
  const upper = String(key || "").trim().toUpperCase();
  if (!upper) return "Field";
  if (upper === "CLIENTID") return "Client";
  if (ACRONYMS.has(upper)) return upper;

  return upper
    .split("_")
    .filter(Boolean)
    .map((part) => (ACRONYMS.has(part) ? part : part.charAt(0) + part.slice(1).toLowerCase()))
    .join(" ");
}

export function getCleanFieldValue(val?: string | null): string {
  const raw = val ?? "";
  const trimmed = raw.trim();
  if (trimmed === "—" || trimmed === "-" || trimmed === "–") return "";
  return raw;
}

export function sortAndNormalizeGrid(grid: HeaderGrid): HeaderGrid {
  grid.colsCount = Math.max(1, Math.min(MAX_GRID_COLS, grid.colsCount || 2));
  grid.rowsCount = Math.max(1, grid.rowsCount || 1);

  const occupied: boolean[][] = Array.from({ length: grid.rowsCount }, () =>
    Array.from({ length: grid.colsCount }, () => false)
  );

  const validCells: HeaderGridCell[] = [];
  const sortedCandidates = [...(grid.cells || [])].sort((a, b) =>
    a.row !== b.row ? a.row - b.row : a.col - b.col
  );

  for (const rawCell of sortedCandidates) {
    const r = rawCell.row;
    const c = rawCell.col;
    if (r < 0 || c < 0 || r >= grid.rowsCount || c >= grid.colsCount) continue;
    if (occupied[r][c]) continue;

    let rSpan = Math.max(1, Math.min(rawCell.rowspan || 1, grid.rowsCount - r));
    let cSpan = Math.max(1, Math.min(rawCell.colspan || 1, grid.colsCount - c));

    // Shrink spans if any overlapping cell was already placed
    let validSpan = true;
    for (let rr = r; rr < r + rSpan && validSpan; rr++) {
      for (let cc = c; cc < c + cSpan; cc++) {
        if (occupied[rr][cc]) {
          validSpan = false;
          break;
        }
      }
    }
    if (!validSpan) {
      rSpan = 1;
      cSpan = 1;
    }

    for (let rr = r; rr < r + rSpan; rr++) {
      for (let cc = c; cc < c + cSpan; cc++) {
        occupied[rr][cc] = true;
      }
    }

    validCells.push({
      id: rawCell.id || `cell_${r}_${c}_${Date.now().toString(36)}`,
      row: r,
      col: c,
      rowspan: rSpan,
      colspan: cSpan,
      empty: Boolean(rawCell.empty),
      key: rawCell.empty ? "" : rawCell.key || "",
      label: rawCell.empty ? "" : rawCell.label || "",
      value: rawCell.empty ? "" : getCleanFieldValue(rawCell.value),
    });
  }

  for (let r = 0; r < grid.rowsCount; r++) {
    for (let c = 0; c < grid.colsCount; c++) {
      if (!occupied[r][c]) {
        occupied[r][c] = true;
        validCells.push({
          id: `cell_${r}_${c}_empty_${Math.random().toString(36).slice(2, 6)}`,
          row: r,
          col: c,
          rowspan: 1,
          colspan: 1,
          empty: true,
          key: "",
          label: "",
          value: "",
        });
      }
    }
  }

  validCells.sort((a, b) => (a.row !== b.row ? a.row - b.row : a.col - b.col));
  grid.cells = validCells;
  return grid;
}

export function ensureHeaderGrid(tpl: InvoiceTemplate): HeaderGrid {
  if (tpl.headerGrid && Array.isArray(tpl.headerGrid.cells) && tpl.headerGrid.cells.length > 0) {
    return sortAndNormalizeGrid(tpl.headerGrid);
  }

  const fields = tpl.headerFields || [];
  const colsCount = 2;
  const rowsCount = Math.max(1, Math.ceil(fields.length / colsCount));
  const cells: HeaderGridCell[] = [];

  for (let i = 0; i < rowsCount * colsCount; i++) {
    const row = Math.floor(i / colsCount);
    const col = i % colsCount;
    const field = fields[i];
    if (field) {
      cells.push({
        id: `cell_${row}_${col}_${field.key || i}`,
        row,
        col,
        rowspan: 1,
        colspan: 1,
        empty: false,
        key: field.key,
        label: field.label || formatFieldLabel(field.key),
        value: getCleanFieldValue(field.value),
      });
    } else {
      cells.push({
        id: `cell_${row}_${col}_empty`,
        row,
        col,
        rowspan: 1,
        colspan: 1,
        empty: true,
        key: "",
        label: "",
        value: "",
      });
    }
  }

  tpl.headerGrid = sortAndNormalizeGrid({ colsCount, rowsCount, cells });
  return tpl.headerGrid;
}

export function syncGridToHeaderFields(tpl: InvoiceTemplate): void {
  const grid = ensureHeaderGrid(tpl);
  const nextFields: Array<{ key: string; label: string; value: string }> = [];
  const seenKeys = new Set<string>();

  const sorted = [...grid.cells].sort((a, b) =>
    a.row !== b.row ? a.row - b.row : a.col - b.col
  );

  for (const cell of sorted) {
    if (cell.empty) continue;
    const key = sanitizeToken(cell.key || cell.label || "", "");
    if (!key) continue;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    nextFields.push({
      key,
      label: (cell.label || "").trim() || formatFieldLabel(key),
      value: getCleanFieldValue(cell.value),
    });
  }

  tpl.headerFields = nextFields;
}

export function buildCellMatrix(grid: HeaderGrid): (HeaderGridCell | null)[][] {
  const matrix: (HeaderGridCell | null)[][] = Array.from({ length: grid.rowsCount }, () =>
    Array.from({ length: grid.colsCount }, () => null)
  );

  for (const cell of grid.cells) {
    const rSpan = cell.rowspan || 1;
    const cSpan = cell.colspan || 1;
    for (let rr = cell.row; rr < cell.row + rSpan && rr < grid.rowsCount; rr++) {
      for (let cc = cell.col; cc < cell.col + cSpan && cc < grid.colsCount; cc++) {
        matrix[rr][cc] = cell;
      }
    }
  }

  return matrix;
}

export function getCellCapabilities(grid: HeaderGrid, row: number, col: number) {
  const cell = grid.cells.find((c) => c.row === row && c.col === col);
  if (!cell) {
    return {
      canMergeLeft: false,
      canMergeRight: false,
      canMergeUp: false,
      canMergeDown: false,
      canSplit: false,
      canInsertCol: grid.colsCount < MAX_GRID_COLS,
      canSwitchRowLeft: false,
      canSwitchRowRight: false,
      canSwitchColAbove: false,
      canSwitchColBelow: false,
      canDeleteRow: grid.rowsCount > 1,
      canDeleteCol: grid.colsCount > 1,
    };
  }

  const rSpan = cell.rowspan || 1;
  const cSpan = cell.colspan || 1;
  const matrix = buildCellMatrix(grid);

  const rightNeighbor =
    cell.col + cSpan < grid.colsCount ? matrix[cell.row]?.[cell.col + cSpan] ?? null : null;
  const leftNeighbor = cell.col > 0 ? matrix[cell.row]?.[cell.col - 1] ?? null : null;
  const downNeighbor =
    cell.row + rSpan < grid.rowsCount ? matrix[cell.row + rSpan]?.[cell.col] ?? null : null;
  const upNeighbor = cell.row > 0 ? matrix[cell.row - 1]?.[cell.col] ?? null : null;

  const canMergeRight = Boolean(
    rightNeighbor &&
      rightNeighbor !== cell &&
      rightNeighbor.row === cell.row &&
      rightNeighbor.col === cell.col + cSpan &&
      (rightNeighbor.rowspan || 1) === rSpan
  );

  const canMergeLeft = Boolean(
    leftNeighbor &&
      leftNeighbor !== cell &&
      leftNeighbor.row === cell.row &&
      leftNeighbor.col + (leftNeighbor.colspan || 1) === cell.col &&
      (leftNeighbor.rowspan || 1) === rSpan
  );

  const canMergeDown = Boolean(
    downNeighbor &&
      downNeighbor !== cell &&
      downNeighbor.col === cell.col &&
      downNeighbor.row === cell.row + rSpan &&
      (downNeighbor.colspan || 1) === cSpan
  );

  const canMergeUp = Boolean(
    upNeighbor &&
      upNeighbor !== cell &&
      upNeighbor.col === cell.col &&
      upNeighbor.row + (upNeighbor.rowspan || 1) === cell.row &&
      (upNeighbor.colspan || 1) === cSpan
  );

  const canSwitchRowLeft = Boolean(leftNeighbor && leftNeighbor !== cell);
  const canSwitchRowRight = Boolean(rightNeighbor && rightNeighbor !== cell);
  const canSwitchColAbove = Boolean(upNeighbor && upNeighbor !== cell);
  const canSwitchColBelow = Boolean(downNeighbor && downNeighbor !== cell);

  return {
    canMergeLeft,
    canMergeRight,
    canMergeUp,
    canMergeDown,
    canSplit: rSpan > 1 || cSpan > 1,
    canInsertCol: grid.colsCount < MAX_GRID_COLS,
    canSwitchRowLeft,
    canSwitchRowRight,
    canSwitchColAbove,
    canSwitchColBelow,
    canDeleteRow: grid.rowsCount > 1,
    canDeleteCol: grid.colsCount > 1,
  };
}

export function insertGridRow(tpl: InvoiceTemplate, insertAtRow: number): InvoiceTemplate {
  const next = cloneTemplate(tpl);
  const grid = ensureHeaderGrid(next);
  const target = Math.max(0, Math.min(grid.rowsCount, insertAtRow));

  for (const cell of grid.cells) {
    if (cell.row >= target) {
      cell.row += 1;
    } else if (cell.row + (cell.rowspan || 1) > target) {
      cell.rowspan = (cell.rowspan || 1) + 1;
    }
  }
  grid.rowsCount += 1;
  sortAndNormalizeGrid(grid);
  syncGridToHeaderFields(next);
  return next;
}

export function insertGridCol(
  tpl: InvoiceTemplate,
  insertAtCol: number
): { template: InvoiceTemplate; error?: string } {
  const next = cloneTemplate(tpl);
  const grid = ensureHeaderGrid(next);
  if (grid.colsCount >= MAX_GRID_COLS) {
    return {
      template: tpl,
      error: `Maximum ${MAX_GRID_COLS} columns reached for File Details grid.`,
    };
  }

  const target = Math.max(0, Math.min(grid.colsCount, insertAtCol));
  for (const cell of grid.cells) {
    if (cell.col >= target) {
      cell.col += 1;
    } else if (cell.col + (cell.colspan || 1) > target) {
      cell.colspan = (cell.colspan || 1) + 1;
    }
  }
  grid.colsCount += 1;
  sortAndNormalizeGrid(grid);
  syncGridToHeaderFields(next);
  return { template: next };
}

export function deleteGridRow(
  tpl: InvoiceTemplate,
  targetRow: number
): { template: InvoiceTemplate; removedFieldsCount: number; error?: string } {
  const next = cloneTemplate(tpl);
  const grid = ensureHeaderGrid(next);
  if (grid.rowsCount <= 1) {
    return { template: tpl, removedFieldsCount: 0, error: "At least one row is required." };
  }

  let removedFieldsCount = 0;
  const remaining: HeaderGridCell[] = [];

  for (const cell of grid.cells) {
    const rSpan = cell.rowspan || 1;
    if (cell.row === targetRow) {
      if (rSpan > 1) {
        remaining.push({ ...cell, rowspan: rSpan - 1 });
      } else if (!cell.empty && (cell.key || "").trim()) {
        removedFieldsCount++;
      }
    } else if (cell.row < targetRow && cell.row + rSpan > targetRow) {
      remaining.push({ ...cell, rowspan: rSpan - 1 });
    } else if (cell.row > targetRow) {
      remaining.push({ ...cell, row: cell.row - 1 });
    } else {
      remaining.push(cell);
    }
  }

  grid.cells = remaining;
  grid.rowsCount -= 1;
  sortAndNormalizeGrid(grid);
  syncGridToHeaderFields(next);
  return { template: next, removedFieldsCount };
}

export function deleteGridCol(
  tpl: InvoiceTemplate,
  targetCol: number
): { template: InvoiceTemplate; removedFieldsCount: number; error?: string } {
  const next = cloneTemplate(tpl);
  const grid = ensureHeaderGrid(next);
  if (grid.colsCount <= 1) {
    return { template: tpl, removedFieldsCount: 0, error: "At least one column is required." };
  }

  let removedFieldsCount = 0;
  const remaining: HeaderGridCell[] = [];

  for (const cell of grid.cells) {
    const cSpan = cell.colspan || 1;
    if (cell.col === targetCol) {
      if (cSpan > 1) {
        remaining.push({ ...cell, colspan: cSpan - 1 });
      } else if (!cell.empty && (cell.key || "").trim()) {
        removedFieldsCount++;
      }
    } else if (cell.col < targetCol && cell.col + cSpan > targetCol) {
      remaining.push({ ...cell, colspan: cSpan - 1 });
    } else if (cell.col > targetCol) {
      remaining.push({ ...cell, col: cell.col - 1 });
    } else {
      remaining.push(cell);
    }
  }

  grid.cells = remaining;
  grid.colsCount -= 1;
  sortAndNormalizeGrid(grid);
  syncGridToHeaderFields(next);
  return { template: next, removedFieldsCount };
}

function combineMergedCellContent(primary: HeaderGridCell, absorbed: HeaderGridCell): void {
  if (primary.empty && !absorbed.empty) {
    primary.empty = false;
    primary.key = absorbed.key || "";
    primary.label = absorbed.label || "";
    primary.value = absorbed.value || "";
  }
}

export function mergeGridCell(
  tpl: InvoiceTemplate,
  row: number,
  col: number,
  direction: "left" | "right" | "up" | "down"
): InvoiceTemplate {
  const next = cloneTemplate(tpl);
  const grid = ensureHeaderGrid(next);
  const matrix = buildCellMatrix(grid);
  const cell = grid.cells.find((c) => c.row === row && c.col === col);
  if (!cell) return tpl;

  const rSpan = cell.rowspan || 1;
  const cSpan = cell.colspan || 1;

  if (direction === "right") {
    const target = cell.col + cSpan < grid.colsCount ? matrix[cell.row]?.[cell.col + cSpan] : null;
    if (!target || target === cell || target.row !== cell.row || (target.rowspan || 1) !== rSpan) {
      return tpl;
    }
    combineMergedCellContent(cell, target);
    cell.colspan = cSpan + (target.colspan || 1);
    grid.cells = grid.cells.filter((c) => c !== target);
  } else if (direction === "left") {
    const left = cell.col > 0 ? matrix[cell.row]?.[cell.col - 1] : null;
    if (!left || left === cell || left.row !== cell.row || (left.rowspan || 1) !== rSpan) {
      return tpl;
    }
    combineMergedCellContent(left, cell);
    left.colspan = (left.colspan || 1) + cSpan;
    grid.cells = grid.cells.filter((c) => c !== cell);
  } else if (direction === "down") {
    const down = cell.row + rSpan < grid.rowsCount ? matrix[cell.row + rSpan]?.[cell.col] : null;
    if (!down || down === cell || down.col !== cell.col || (down.colspan || 1) !== cSpan) {
      return tpl;
    }
    combineMergedCellContent(cell, down);
    cell.rowspan = rSpan + (down.rowspan || 1);
    grid.cells = grid.cells.filter((c) => c !== down);
  } else if (direction === "up") {
    const up = cell.row > 0 ? matrix[cell.row - 1]?.[cell.col] : null;
    if (!up || up === cell || up.col !== cell.col || (up.colspan || 1) !== cSpan) {
      return tpl;
    }
    combineMergedCellContent(up, cell);
    up.rowspan = (up.rowspan || 1) + rSpan;
    grid.cells = grid.cells.filter((c) => c !== cell);
  }

  sortAndNormalizeGrid(grid);
  syncGridToHeaderFields(next);
  return next;
}

export function splitGridCell(tpl: InvoiceTemplate, row: number, col: number): InvoiceTemplate {
  const next = cloneTemplate(tpl);
  const grid = ensureHeaderGrid(next);
  const cell = grid.cells.find((c) => c.row === row && c.col === col);
  if (!cell || ((cell.colspan || 1) <= 1 && (cell.rowspan || 1) <= 1)) return tpl;

  cell.colspan = 1;
  cell.rowspan = 1;
  sortAndNormalizeGrid(grid);
  syncGridToHeaderFields(next);
  return next;
}

export function swapCellPayloads(a: HeaderGridCell, b: HeaderGridCell): void {
  const tmpId = a.id;
  const tmpEmpty = Boolean(a.empty);
  const tmpKey = a.key || "";
  const tmpLabel = a.label || "";
  const tmpValue = a.value || "";

  a.id = b.id;
  a.empty = Boolean(b.empty);
  a.key = b.key || "";
  a.label = b.label || "";
  a.value = b.value || "";

  b.id = tmpId;
  b.empty = tmpEmpty;
  b.key = tmpKey;
  b.label = tmpLabel;
  b.value = tmpValue;
}

export function switchGridCellDirection(
  tpl: InvoiceTemplate,
  row: number,
  col: number,
  dir: "left" | "right" | "above" | "below"
): InvoiceTemplate {
  const next = cloneTemplate(tpl);
  const grid = ensureHeaderGrid(next);
  const matrix = buildCellMatrix(grid);
  const cell = grid.cells.find((c) => c.row === row && c.col === col);
  if (!cell) return tpl;

  const rSpan = cell.rowspan || 1;
  const cSpan = cell.colspan || 1;

  let neighbor: HeaderGridCell | null = null;
  if (dir === "left" && cell.col > 0) neighbor = matrix[cell.row]?.[cell.col - 1] ?? null;
  if (dir === "right" && cell.col + cSpan < grid.colsCount) {
    neighbor = matrix[cell.row]?.[cell.col + cSpan] ?? null;
  }
  if (dir === "above" && cell.row > 0) neighbor = matrix[cell.row - 1]?.[cell.col] ?? null;
  if (dir === "below" && cell.row + rSpan < grid.rowsCount) {
    neighbor = matrix[cell.row + rSpan]?.[cell.col] ?? null;
  }

  if (!neighbor || neighbor === cell) return tpl;
  swapCellPayloads(cell, neighbor);
  syncGridToHeaderFields(next);
  return next;
}

export function swapGridCellsById(
  tpl: InvoiceTemplate,
  fromCellId: string,
  toCellId: string
): InvoiceTemplate {
  if (!fromCellId || !toCellId || fromCellId === toCellId) return tpl;
  const next = cloneTemplate(tpl);
  const grid = ensureHeaderGrid(next);
  const source = grid.cells.find((c) => c.id === fromCellId);
  const target = grid.cells.find((c) => c.id === toCellId);
  if (!source || !target) return tpl;

  swapCellPayloads(source, target);
  syncGridToHeaderFields(next);
  return next;
}

export function clearGridCell(tpl: InvoiceTemplate, row: number, col: number): InvoiceTemplate {
  const next = cloneTemplate(tpl);
  const grid = ensureHeaderGrid(next);
  const cell = grid.cells.find((c) => c.row === row && c.col === col);
  if (!cell) return tpl;

  cell.empty = true;
  cell.key = "";
  cell.label = "";
  cell.value = "";
  syncGridToHeaderFields(next);
  return next;
}

export interface GridRowBound {
  row: number;
  top: number;
  bottom: number;
  height: number;
  mid: number;
}

export interface GridColBound {
  col: number;
  left: number;
  right: number;
  mid: number;
}

/**
 * Evaluates row target during live drag using legacy midpoint center-crossing (+/-3px deadband).
 */
export function evaluateCenterCrossingRow(
  clientY: number,
  rowBounds: GridRowBound[],
  currentRow: number
): number {
  if (!rowBounds || rowBounds.length === 0) return 0;
  const count = rowBounds.length;

  for (let r = count - 1; r > currentRow; r--) {
    if (clientY > rowBounds[r].mid + 3) {
      return r;
    }
  }

  for (let r = 0; r < currentRow; r++) {
    if (clientY < rowBounds[r].mid - 3) {
      return r;
    }
  }

  return currentRow;
}

/**
 * Evaluates column target during live drag using column boundary crossing (+/-3px deadband).
 */
export function evaluateCenterCrossingCol(
  clientX: number,
  colBounds: GridColBound[],
  currentCol: number
): number {
  if (!colBounds || colBounds.length === 0) return 0;
  const count = colBounds.length;

  for (let c = count - 1; c > currentCol; c--) {
    if (clientX > colBounds[c].left + 3) {
      return c;
    }
  }

  for (let c = 0; c < currentCol; c++) {
    if (clientX < colBounds[c].right - 3) {
      return c;
    }
  }

  return currentCol;
}

/**
 * Shift-down drag-and-drop insertion algorithm matching legacy shiftInsertGridCell:
 * - Same column: reorders vertically within the column.
 * - Cross column: inserts at target row shifting cells below down (expanding grid rows if full)
 *   and compacts the source column upward.
 */
export function shiftInsertGridCell(
  tpl: InvoiceTemplate,
  sRow: number,
  sCol: number,
  tRow: number,
  tCol: number
): InvoiceTemplate {
  const next = cloneTemplate(tpl);
  const grid = ensureHeaderGrid(next);
  const sCell = grid.cells.find((c) => c.row === sRow && c.col === sCol);
  if (!sCell || sCell.empty) return tpl;

  if (sCol === tCol && sRow === tRow) return tpl;

  const payload = {
    id: sCell.id || nextTemplateItemId(`cell_${sRow}_${sCol}`),
    key: sCell.key || "",
    label: sCell.label || "",
    value: getCleanFieldValue(sCell.value),
  };

  if (sCol === tCol) {
    const colCells: HeaderGridCell[] = [];
    for (let r = 0; r < grid.rowsCount; r++) {
      let cell = grid.cells.find((c) => c.row === r && c.col === sCol);
      if (!cell) {
        cell = {
          id: nextTemplateItemId(`cell_${r}_${sCol}_empty`),
          row: r,
          col: sCol,
          colspan: 1,
          rowspan: 1,
          empty: true,
          key: "",
          label: "",
          value: "",
        };
        grid.cells.push(cell);
      }
      colCells.push(cell);
    }

    const boundedTarget = Math.max(0, Math.min(colCells.length - 1, tRow));
    const [movedItem] = colCells.splice(sRow, 1);
    if (movedItem) {
      colCells.splice(boundedTarget, 0, movedItem);
    }
    colCells.forEach((c, idx) => {
      c.row = idx;
    });
  } else {
    const tColCells: HeaderGridCell[] = [];
    for (let r = 0; r < grid.rowsCount; r++) {
      let cell = grid.cells.find((c) => c.row === r && c.col === tCol);
      if (!cell) {
        cell = {
          id: nextTemplateItemId(`cell_${r}_${tCol}_empty`),
          row: r,
          col: tCol,
          colspan: 1,
          rowspan: 1,
          empty: true,
          key: "",
          label: "",
          value: "",
        };
        grid.cells.push(cell);
      }
      tColCells.push(cell);
    }

    const boundedTarget = Math.max(0, Math.min(tColCells.length, tRow));
    const hasEmptyBelow = tColCells.slice(boundedTarget).some((c) => c.empty);

    if (!hasEmptyBelow) {
      const newRowIdx = grid.rowsCount;
      grid.rowsCount += 1;
      for (let col = 0; col < grid.colsCount; col++) {
        if (col !== tCol) {
          grid.cells.push({
            id: nextTemplateItemId(`cell_${newRowIdx}_${col}_empty`),
            row: newRowIdx,
            col,
            colspan: 1,
            rowspan: 1,
            empty: true,
            key: "",
            label: "",
            value: "",
          });
        }
      }
    } else {
      for (let r = tColCells.length - 1; r >= boundedTarget; r--) {
        if (tColCells[r].empty) {
          tColCells.splice(r, 1);
          break;
        }
      }
    }

    const insertedCell: HeaderGridCell = {
      id: payload.id,
      row: boundedTarget,
      col: tCol,
      colspan: 1,
      rowspan: 1,
      empty: false,
      key: payload.key,
      label: payload.label,
      value: payload.value,
    };
    tColCells.splice(boundedTarget, 0, insertedCell);
    tColCells.forEach((c, idx) => {
      c.row = idx;
      c.col = tCol;
    });

    const sColCells: HeaderGridCell[] = [];
    for (let r = 0; r < grid.rowsCount; r++) {
      let cell = grid.cells.find((c) => c.row === r && c.col === sCol);
      if (!cell) {
        cell = {
          id: nextTemplateItemId(`cell_${r}_${sCol}_empty`),
          row: r,
          col: sCol,
          colspan: 1,
          rowspan: 1,
          empty: true,
          key: "",
          label: "",
          value: "",
        };
        grid.cells.push(cell);
      }
      sColCells.push(cell);
    }

    sColCells.splice(sRow, 1);
    sColCells.push({
      id: nextTemplateItemId(`cell_${grid.rowsCount - 1}_${sCol}_empty`),
      row: grid.rowsCount - 1,
      col: sCol,
      colspan: 1,
      rowspan: 1,
      empty: true,
      key: "",
      label: "",
      value: "",
    });
    sColCells.forEach((c, idx) => {
      c.row = idx;
      c.col = sCol;
    });

    const otherColsCells = grid.cells.filter((c) => c.col !== sCol && c.col !== tCol);
    grid.cells = [...otherColsCells, ...sColCells, ...tColCells];
  }

  sortAndNormalizeGrid(grid);
  syncGridToHeaderFields(next);
  return next;
}

/**
 * Legacy minimal-movement column-preserving grid auto-balance:
 * preserves active column count (up to MAX_GRID_COLS), prunes empty trailing columns/rows,
 * and balances column heights via minimal right-to-left / left-to-right transfers.
 */
export function autoBalanceGrid(tpl: InvoiceTemplate): InvoiceTemplate {
  const next = cloneTemplate(tpl);
  const grid = ensureHeaderGrid(next);

  const populated = grid.cells.filter(
    (c) => !c.empty && ((c.key || "").trim().length > 0 || (c.label || "").trim().length > 0)
  );
  const N = populated.length;
  const activeColIndices = [...new Set(populated.map((c) => c.col))].sort((a, b) => a - b);

  let targetCols = 2;
  if (activeColIndices.length >= 2) {
    targetCols = Math.min(activeColIndices.length, MAX_GRID_COLS);
  } else if (N >= 2) {
    targetCols = 2;
  } else {
    targetCols = Math.max(1, Math.min(2, grid.colsCount || 2));
  }

  const targetRows = Math.max(Math.ceil(N / targetCols), 1);
  const remainder = N % targetCols;
  const highCap = Math.ceil(N / targetCols);
  const lowCap = Math.floor(N / targetCols);
  const targetCapacities: number[] = [];
  for (let c = 0; c < targetCols; c++) {
    if (remainder === 0) {
      targetCapacities.push(highCap);
    } else {
      targetCapacities.push(c < remainder ? highCap : lowCap);
    }
  }

  const existingByCol: HeaderGridCell[][] = Array.from({ length: targetCols }, () => []);
  const overflowPool: HeaderGridCell[] = [];

  populated.sort((a, b) => (a.row !== b.row ? a.row - b.row : a.col - b.col));
  for (const cell of populated) {
    cell.colspan = 1;
    cell.rowspan = 1;
    if (cell.col < targetCols) {
      existingByCol[cell.col].push(cell);
    } else {
      overflowPool.push(cell);
    }
  }

  const colAllocations = Array.from({ length: targetCols }, (_, c) => [...existingByCol[c]]);

  // Pass 1: Right-to-Left transfers (top item of right col -> bottom of left col)
  for (let c = targetCols - 1; c > 0; c--) {
    for (let leftCol = 0; leftCol < c; leftCol++) {
      while (
        colAllocations[c].length > targetCapacities[c] &&
        colAllocations[leftCol].length < targetCapacities[leftCol]
      ) {
        const item = colAllocations[c].shift();
        if (item) colAllocations[leftCol].push(item);
      }
    }
  }

  // Pass 2: Left-to-Right transfers (bottom excess of left col -> right col)
  for (let c = 0; c < targetCols - 1; c++) {
    for (let rightCol = c + 1; rightCol < targetCols; rightCol++) {
      if (
        colAllocations[c].length > targetCapacities[c] &&
        colAllocations[rightCol].length < targetCapacities[rightCol]
      ) {
        const count = Math.min(
          colAllocations[c].length - targetCapacities[c],
          targetCapacities[rightCol] - colAllocations[rightCol].length
        );
        const transferred = colAllocations[c].splice(colAllocations[c].length - count, count);
        colAllocations[rightCol].push(...transferred);
      }
    }
  }

  // Pass 3: Drain overflowPool from pruned columns >= targetCols
  for (let c = 0; c < targetCols; c++) {
    while (colAllocations[c].length < targetCapacities[c] && overflowPool.length > 0) {
      const item = overflowPool.shift();
      if (item) colAllocations[c].push(item);
    }
  }

  const newCells: HeaderGridCell[] = [];
  for (let r = 0; r < targetRows; r++) {
    for (let c = 0; c < targetCols; c++) {
      const item = colAllocations[c][r];
      if (item) {
        newCells.push({
          ...item,
          row: r,
          col: c,
          colspan: 1,
          rowspan: 1,
          empty: false,
          value: getCleanFieldValue(item.value),
        });
      } else {
        newCells.push({
          id: nextTemplateItemId(`cell_${r}_${c}_empty`),
          row: r,
          col: c,
          rowspan: 1,
          colspan: 1,
          empty: true,
          key: "",
          label: "",
          value: "",
        });
      }
    }
  }

  next.headerGrid = sortAndNormalizeGrid({
    colsCount: targetCols,
    rowsCount: targetRows,
    cells: newCells,
  });
  syncGridToHeaderFields(next);
  return next;
}

export function applyOperationalFileToTemplate(
  tpl: InvoiceTemplate,
  file: OperationalFile
): InvoiceTemplate {
  const next = cloneTemplate(tpl);
  const fieldValues: Record<string, string> = {
    NAME: `${file.title} Port Call`,
    STATUS: file.status || "Active",
    CLIENTID: file.clientName || "Apex Shipping Lines Ltd.",
    TERMINAL: file.terminal || "NCT Berth 4",
    VOYAGE_NO: file.voyageNo || "V-2026-08",
    PORT: file.portCall || "Chittagong Port",
    ARRIVAL: file.arrivalDate || "2026-11-20",
    NRT: String(file.nrt ?? 0),
    BERTHING: file.berthingDate || "2026-11-21",
    GRT: String(file.grt ?? 0),
    DEPARTURE: file.departureDate || "2026-11-25",
    NAME_OF_VESSEL: file.vesselName || file.title,
  };

  const grid = ensureHeaderGrid(next);
  for (const cell of grid.cells) {
    if (cell.empty) continue;
    const upper = (cell.key || "").trim().toUpperCase();
    if (fieldValues[upper] !== undefined) {
      cell.value = fieldValues[upper];
    }
  }

  next.sourceFileId = file.id;
  next.sourceFileType = file.type;
  syncGridToHeaderFields(next);
  return next;
}

export function insertPremadeDeliverableIntoSection(
  tpl: InvoiceTemplate,
  item: PremadeDeliverable,
  targetSectionId: string
): { template: InvoiceTemplate; sectionTitle: string } | null {
  const next = cloneTemplate(tpl);
  const sec = (next.sections || []).find((s) => s.id === targetSectionId);
  if (!sec) return null;

  const baseToken = sanitizeToken(item.token, "ITEM");
  const engine = new DAGFormulaEngine(next);
  engine.buildGraph();

  let token = baseToken;
  let counter = 1;
  while (engine.tokens.has(token)) {
    token = `${baseToken}_${counter++}`;
  }

  if (!sec.rows) sec.rows = [];
  sec.rows.push({
    id: nextTemplateItemId("r"),
    token,
    name: item.name,
    equation: item.equation || "0",
    editable: "EDITABLE",
    sl: sec.rows.length + 1,
  });

  if (sec.subtotal?.equation?.startsWith("=")) {
    sec.subtotal.equation = `= ${sec.rows.map((r) => r.token).join(" + ")}`;
  }

  return { template: next, sectionTitle: sec.title };
}
