import { describe, expect, it } from "vitest";
import {
  DAGFormulaEngine,
  evaluateSafeExpression,
  formatCurrency,
  sanitizeToken,
} from "../dag-formula-engine";
import { DEFAULT_DATA } from "../seed-data";
import type { InvoiceTemplate } from "../types";

function clonePda(): InvoiceTemplate {
  return JSON.parse(JSON.stringify(DEFAULT_DATA.invoiceTemplates[0])) as InvoiceTemplate;
}

describe("sanitizeToken & formatCurrency", () => {
  it("normalizes arbitrary labels into valid formula tokens", () => {
    expect(sanitizeToken("Port Tug Hire (1 Unit)")).toBe("PORT_TUG_HIRE_1_UNIT");
    expect(sanitizeToken("123_fee")).toBe("F_123_FEE");
    expect(sanitizeToken("   ")).toBe("TOKEN");
  });

  it("formats currency values with optional symbols", () => {
    expect(formatCurrency(2030)).toBe("2,030.00");
    expect(formatCurrency(2030.5, "$")).toBe("$2,030.50");
    expect(formatCurrency(Number.NaN, "$")).toBe("$0.00");
  });
});

describe("evaluateSafeExpression", () => {
  it("evaluates arithmetic precedence, parentheses, functions, and tokens", () => {
    const vars: Record<string, number> = { GRT: 3500, RATE: 0.31, TAX: 0.1 };
    const resolve = (k: string) => vars[k] ?? 0;

    expect(evaluateSafeExpression("= (GRT * RATE) + 100", resolve)).toBeCloseTo(1185, 5);
    expect(evaluateSafeExpression("= SUM(10, 20, MIN(30, 5)) * 2", resolve)).toBe(70);
    expect(evaluateSafeExpression("= 100 / 0", resolve)).toBe(0);
    expect(evaluateSafeExpression("1250.75", resolve)).toBe(1250.75);
    expect(evaluateSafeExpression("= 100 * 15%", resolve)).toBeCloseTo(15, 5);
    expect(evaluateSafeExpression("= 15% + 20%", resolve)).toBeCloseTo(0.35, 5);
    expect(evaluateSafeExpression("= (200 + 300) * TAX%", resolve)).toBeCloseTo(0.5, 5);
    expect(evaluateSafeExpression("15%", resolve)).toBeCloseTo(0.15, 5);
  });
});

describe("DAGFormulaEngine", () => {
  it("evaluates the seeded PDA template graph accurately", () => {
    const pda = clonePda();
    const engine = new DAGFormulaEngine(pda);
    const evaluated = engine.evaluateAll();

    expect(evaluated.get("GRT")?.value).toBe(3500);
    expect(evaluated.get("PILOT")?.value).toBe(1230);
    expect(evaluated.get("TUGBOAT")?.value).toBe(800);
    expect(evaluated.get("SEC_PORT_TARIFF_TOTAL")?.value).toBe(2030);
  });

  it("supports chaining header fields and global constants dynamically", () => {
    const pda = clonePda();
    pda.sections[0].rows[0].equation = "= GRT * PORT_DUES_PER_GRT";
    const engine = new DAGFormulaEngine(pda);
    const evaluated = engine.evaluateAll();

    expect(evaluated.get("PORT_DUES")?.value).toBeCloseTo(3500 * 0.31, 5);
    expect(evaluated.get("SEC_PORT_TARIFF_TOTAL")?.value).toBeCloseTo(3500 * 0.31 + 1230 + 800, 5);
  });

  it("detects direct and indirect circular dependencies before committing", () => {
    const pda = clonePda();
    pda.sections[0].rows[0].equation = "= PILOT * 0.5";
    const engine = new DAGFormulaEngine(pda);
    engine.buildGraph();

    expect(engine.detectCycle("PILOT", "= PILOT + 10")).toContain("Circular dependency");
    expect(engine.detectCycle("PILOT", "= PORT_DUES + 50")).toContain("Circular dependency");
    expect(engine.detectCycle("PILOT", "= GRT * 0.25")).toBeNull();
  });
});
