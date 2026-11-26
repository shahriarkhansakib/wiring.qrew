import { describe, expect, it } from "vitest";
import { DEFAULT_DATA } from "@/lib/seed-data";
import { getWorkspacePageTitle } from "@/lib/routes";
import type { InvoiceTemplate } from "@/lib/types";
import {
  autoBalanceGrid,
  deleteGridCol,
  deleteGridRow,
  ensureHeaderGrid,
  evaluateCenterCrossingCol,
  evaluateCenterCrossingRow,
  getCellCapabilities,
  insertGridCol,
  insertGridRow,
  MAX_GRID_COLS,
  mergeGridCell,
  shiftInsertGridCell,
  splitGridCell,
} from "../header-grid";

function clonePda(): InvoiceTemplate {
  return JSON.parse(JSON.stringify(DEFAULT_DATA.invoiceTemplates[0])) as InvoiceTemplate;
}

describe("HeaderGrid layout helpers", () => {
  it("initializes a 2-column matrix from headerFields", () => {
    const tpl = clonePda();
    const grid = ensureHeaderGrid(tpl);

    expect(grid.colsCount).toBe(2);
    expect(grid.rowsCount).toBe(6);
    expect(grid.cells).toHaveLength(12);
    expect(grid.cells[0]?.key).toBe("NAME");
  });

  it("inserts and deletes rows and enforces the MAX_GRID_COLS cap", () => {
    let tpl = clonePda();
    ensureHeaderGrid(tpl);

    tpl = insertGridRow(tpl, 1);
    expect(tpl.headerGrid?.rowsCount).toBe(7);

    const rowDel = deleteGridRow(tpl, 1);
    expect(rowDel.error).toBeUndefined();
    expect(rowDel.template.headerGrid?.rowsCount).toBe(6);
    tpl = rowDel.template;

    for (let i = 2; i < MAX_GRID_COLS; i++) {
      const colRes = insertGridCol(tpl, i);
      expect(colRes.error).toBeUndefined();
      tpl = colRes.template;
    }
    expect(tpl.headerGrid?.colsCount).toBe(MAX_GRID_COLS);

    const overflow = insertGridCol(tpl, 0);
    expect(overflow.error).toBeDefined();

    const colDel = deleteGridCol(tpl, 2);
    expect(colDel.error).toBeUndefined();
    expect(colDel.template.headerGrid?.colsCount).toBe(MAX_GRID_COLS - 1);
  });

  it("allows merging non-empty adjacent cells, splits back, and preserves minimal-movement autoBalanceGrid", () => {
    let tpl = clonePda();
    ensureHeaderGrid(tpl);
    tpl = insertGridCol(tpl, 2).template;

    // Non-empty adjacent cells in row 0 col 0 and col 1 can merge cleanly
    const caps = getCellCapabilities(tpl.headerGrid!, 0, 0);
    expect(caps.canMergeRight).toBe(true);
    expect(caps.canMergeDown).toBe(true);

    // Cell at (0, 2) is empty; merge cell (0, 1) right into (0, 2)
    tpl = mergeGridCell(tpl, 0, 1, "right");
    const mergedCell = tpl.headerGrid?.cells.find((c) => c.row === 0 && c.col === 1);
    expect(mergedCell?.colspan).toBe(2);

    tpl = splitGridCell(tpl, 0, 1);
    const splitCell = tpl.headerGrid?.cells.find((c) => c.row === 0 && c.col === 1);
    expect(splitCell?.colspan).toBe(1);
    expect(tpl.headerGrid?.cells.some((c) => c.row === 0 && c.col === 2 && c.empty)).toBe(true);

    // Unused empty column 2 is pruned when auto-balancing
    const pruned = autoBalanceGrid(tpl);
    expect(pruned.headerGrid?.colsCount).toBe(2);
    expect(pruned.headerGrid?.rowsCount).toBe(6);
    expect(pruned.headerFields).toHaveLength(12);

    // Active 3rd column preserves 3 columns and distributes 4 rows x 3 cols while keeping cell IDs
    const beforeIds = new Set(tpl.headerGrid!.cells.filter((c) => !c.empty).map((c) => c.id));
    tpl = shiftInsertGridCell(tpl, 0, 0, 0, 2);
    const balanced3 = autoBalanceGrid(tpl);
    expect(balanced3.headerGrid?.colsCount).toBe(3);
    expect(balanced3.headerGrid?.rowsCount).toBe(4);
    expect(balanced3.headerFields).toHaveLength(12);
    const afterIds = new Set(balanced3.headerGrid!.cells.filter((c) => !c.empty).map((c) => c.id));
    expect(afterIds).toEqual(beforeIds);
  });

  it("supports shiftInsertGridCell same-column and cross-column with auto-row expansion", () => {
    const tpl = clonePda();
    ensureHeaderGrid(tpl);

    const firstId = tpl.headerGrid!.cells.find((c) => c.row === 0 && c.col === 0)!.id;
    const sameColMoved = shiftInsertGridCell(tpl, 0, 0, 2, 0);
    expect(sameColMoved.headerGrid?.cells.find((c) => c.row === 2 && c.col === 0)?.id).toBe(
      firstId
    );
    expect(sameColMoved.headerGrid?.rowsCount).toBe(6);

    // Cross-column into full column 1 expands rowsCount to 7 without dropping any fields
    const crossColMoved = shiftInsertGridCell(tpl, 0, 0, 1, 1);
    expect(crossColMoved.headerGrid?.rowsCount).toBe(7);
    expect(crossColMoved.headerGrid?.cells.find((c) => c.row === 1 && c.col === 1)?.id).toBe(
      firstId
    );
    expect(crossColMoved.headerFields).toHaveLength(12);
  });

  it("evaluates center-crossing bounds with deadband and resolves workspace route titles", () => {
    const rowBounds = [
      { row: 0, top: 0, bottom: 40, height: 40, mid: 20 },
      { row: 1, top: 40, bottom: 80, height: 40, mid: 60 },
      { row: 2, top: 80, bottom: 120, height: 40, mid: 100 },
    ];
    expect(evaluateCenterCrossingRow(62, rowBounds, 0)).toBe(0);
    expect(evaluateCenterCrossingRow(65, rowBounds, 0)).toBe(1);
    expect(evaluateCenterCrossingRow(16, rowBounds, 1)).toBe(0);

    const colBounds = [
      { col: 0, left: 0, right: 200, mid: 100 },
      { col: 1, left: 200, right: 400, mid: 300 },
    ];
    expect(evaluateCenterCrossingCol(205, colBounds, 0)).toBe(1);
    expect(evaluateCenterCrossingCol(195, colBounds, 1)).toBe(0);

    expect(getWorkspacePageTitle("office", "clients")).toBe("Clients");
    expect(getWorkspacePageTitle("office", "files")).toBe("Files");
    expect(getWorkspacePageTitle("office-config", "roles-permissions")).toBe(
      "Roles and Permissions"
    );
    expect(getWorkspacePageTitle("platform", "tenants")).toBeNull();
  });
});
