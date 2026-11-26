import type { InvoiceTemplate } from "./types";

export type FormulaTokenKind =
  | "global"
  | "local"
  | "header"
  | "row"
  | "charge"
  | "subtotal"
  | "grandTotal";

export interface FormulaNode {
  token: string;
  kind: FormulaTokenKind;
  equation: string;
  deps: string[];
}

export interface EvaluatedToken {
  token: string;
  kind: FormulaTokenKind;
  equation: string;
  value: number;
  error?: string;
}

const RESERVED_IDENTIFIERS = new Set(["MIN", "MAX", "ABS", "ROUND", "SUM", "FLOOR", "CEIL"]);

export function sanitizeToken(raw: string, fallback = "TOKEN"): string {
  const cleaned = String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!cleaned) return fallback;
  if (/^[0-9]/.test(cleaned)) return `F_${cleaned}`;
  return cleaned;
}

export function formatCurrency(value: number, symbol = ""): string {
  const numeric = Number.isFinite(value) ? value : 0;
  const formatted = numeric.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return symbol ? `${symbol}${formatted}` : formatted;
}

type ExprToken =
  | { type: "number"; value: number }
  | { type: "ident"; value: string }
  | { type: "op"; value: string }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "comma" };

function tokenizeExpression(expr: string): ExprToken[] {
  const tokens: ExprToken[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      let numStr = "";
      let dotCount = 0;
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        if (expr[i] === ".") {
          dotCount++;
          if (dotCount > 1) break;
        }
        numStr += expr[i++];
      }
      const parsed = Number.parseFloat(numStr);
      tokens.push({ type: "number", value: Number.isFinite(parsed) ? parsed : 0 });
      continue;
    }

    if (/[A-Za-z_]/.test(ch)) {
      let ident = "";
      while (i < expr.length && /[A-Za-z0-9_]/.test(expr[i])) {
        ident += expr[i++];
      }
      tokens.push({ type: "ident", value: ident.toUpperCase() });
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "lparen" });
      i++;
      continue;
    }

    if (ch === ")") {
      tokens.push({ type: "rparen" });
      i++;
      continue;
    }

    if (ch === ",") {
      tokens.push({ type: "comma" });
      i++;
      continue;
    }

    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "%") {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }

    // Skip unrecognized characters gracefully
    i++;
  }

  return tokens;
}

/**
 * Evaluates an arithmetic formula safely using recursive descent (no eval/Function).
 */
export function evaluateSafeExpression(
  equation: string,
  resolveToken: (token: string) => number
): number {
  const raw = String(equation ?? "").trim();
  if (!raw || raw === "—" || raw === "-") return 0;

  const isFormula = raw.startsWith("=");
  const expr = isFormula ? raw.slice(1).trim() : raw;
  if (!expr) return 0;

  if (!isFormula) {
    const stripped = expr.replace(/,/g, "");
    const direct = Number.parseFloat(stripped);
    if (Number.isFinite(direct) && /^[+-]?\d+(\.\d+)?$/.test(stripped)) {
      return direct;
    }
  }

  const tokens = tokenizeExpression(expr);
  if (tokens.length === 0) return 0;

  let pos = 0;
  const peek = (): ExprToken | undefined => tokens[pos];
  const consume = (): ExprToken | undefined => tokens[pos++];

  const parseAddSub = (): number => {
    let left = parseMulDiv();
    while (true) {
      const next = peek();
      if (next?.type === "op" && (next.value === "+" || next.value === "-")) {
        consume();
        const right = parseMulDiv();
        left = next.value === "+" ? left + right : left - right;
      } else {
        break;
      }
    }
    return left;
  };

  const parseMulDiv = (): number => {
    let left = parseUnary();
    while (true) {
      const next = peek();
      if (next?.type === "op" && (next.value === "*" || next.value === "/")) {
        consume();
        const right = parseUnary();
        if (next.value === "*") {
          left = left * right;
        } else {
          left = right === 0 ? 0 : left / right;
        }
      } else {
        break;
      }
    }
    return left;
  };

  const parseUnary = (): number => {
    const next = peek();
    if (next?.type === "op" && (next.value === "+" || next.value === "-")) {
      consume();
      const val = parseUnary();
      return next.value === "-" ? -val : val;
    }
    return parsePostfix();
  };

  const parsePostfix = (): number => {
    let val = parsePrimary();
    while (true) {
      const next = peek();
      if (next?.type === "op" && next.value === "%") {
        consume();
        val = val / 100;
      } else {
        break;
      }
    }
    return val;
  };

  const parsePrimary = (): number => {
    const tok = peek();
    if (!tok) return 0;

    if (tok.type === "number") {
      consume();
      return tok.value;
    }

    if (tok.type === "lparen") {
      consume();
      const inner = parseAddSub();
      if (peek()?.type === "rparen") consume();
      return inner;
    }

    if (tok.type === "ident") {
      consume();
      if (peek()?.type === "lparen") {
        consume();
        const args: number[] = [];
        if (peek()?.type !== "rparen") {
          args.push(parseAddSub());
          while (peek()?.type === "comma") {
            consume();
            args.push(parseAddSub());
          }
        }
        if (peek()?.type === "rparen") consume();

        switch (tok.value) {
          case "SUM":
            return args.reduce((sum, n) => sum + n, 0);
          case "MIN":
            return args.length > 0 ? Math.min(...args) : 0;
          case "MAX":
            return args.length > 0 ? Math.max(...args) : 0;
          case "ABS":
            return args.length > 0 ? Math.abs(args[0]) : 0;
          case "ROUND":
            return args.length > 0 ? Math.round(args[0]) : 0;
          case "FLOOR":
            return args.length > 0 ? Math.floor(args[0]) : 0;
          case "CEIL":
            return args.length > 0 ? Math.ceil(args[0]) : 0;
          default:
            return resolveToken(tok.value);
        }
      }
      return resolveToken(tok.value);
    }

    consume();
    return 0;
  };

  const result = parseAddSub();
  return Number.isFinite(result) ? result : 0;
}

/**
 * Directed Acyclic Graph formula evaluation and cycle detection engine for Invoice Templates.
 */
export class DAGFormulaEngine {
  private readonly template: InvoiceTemplate;
  public readonly tokens = new Map<string, FormulaNode>();

  constructor(template: InvoiceTemplate) {
    this.template = template;
  }

  public extractReferences(equation: string): string[] {
    const raw = String(equation || "").trim();
    if (!raw) return [];

    // Literal numbers have no dependencies; formulas (or bare token references) do
    if (!raw.startsWith("=") && /^[+-]?\d+(\.\d+)?$/.test(raw.replace(/,/g, ""))) {
      return [];
    }

    const expr = raw.startsWith("=") ? raw.slice(1) : raw;
    const matches = expr.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g) || [];
    const seen = new Set<string>();
    const refs: string[] = [];

    for (const match of matches) {
      const upper = match.toUpperCase();
      if (!RESERVED_IDENTIFIERS.has(upper) && !seen.has(upper)) {
        seen.add(upper);
        refs.push(upper);
      }
    }
    return refs;
  }

  public buildGraph(): Map<string, FormulaNode> {
    this.tokens.clear();

    for (const [k, v] of Object.entries(this.template.globalConstants || {})) {
      const key = k.toUpperCase();
      const eq = String(v ?? 0);
      this.tokens.set(key, { token: key, kind: "global", equation: eq, deps: [] });
    }

    for (const [k, v] of Object.entries(this.template.localConstants || {})) {
      const key = k.toUpperCase();
      const eq = String(v ?? 0);
      this.tokens.set(key, { token: key, kind: "local", equation: eq, deps: [] });
    }

    for (const field of this.template.headerFields || []) {
      const key = (field.key || "").trim().toUpperCase();
      if (!key) continue;
      const numeric = Number.parseFloat(String(field.value || "").replace(/,/g, ""));
      const eq = Number.isFinite(numeric) ? String(numeric) : "0";
      this.tokens.set(key, { token: key, kind: "header", equation: eq, deps: [] });
    }

    for (const sec of this.template.sections || []) {
      for (const row of sec.rows || []) {
        const key = (row.token || "").trim().toUpperCase();
        if (!key) continue;
        const eq = String(row.equation ?? "0");
        this.tokens.set(key, {
          token: key,
          kind: "row",
          equation: eq,
          deps: this.extractReferences(eq),
        });
      }

      for (const charge of sec.charges || []) {
        const key = (charge.token || "").trim().toUpperCase();
        if (!key) continue;
        const eq = String(charge.equation ?? "0");
        this.tokens.set(key, {
          token: key,
          kind: "charge",
          equation: eq,
          deps: this.extractReferences(eq),
        });
      }

      if (sec.subtotal?.token) {
        const key = sec.subtotal.token.trim().toUpperCase();
        const eq = String(sec.subtotal.equation ?? "0");
        this.tokens.set(key, {
          token: key,
          kind: "subtotal",
          equation: eq,
          deps: this.extractReferences(eq),
        });
      }
    }

    if (this.template.grandTotal?.token) {
      const key = this.template.grandTotal.token.trim().toUpperCase();
      const eq = String(this.template.grandTotal.equation ?? "0");
      this.tokens.set(key, {
        token: key,
        kind: "grandTotal",
        equation: eq,
        deps: this.extractReferences(eq),
      });
    }

    return this.tokens;
  }

  public detectCycle(targetToken: string, candidateEquation: string): string | null {
    if (this.tokens.size === 0) {
      this.buildGraph();
    }

    const normalizedTarget = targetToken.trim().toUpperCase();
    const initialDeps = this.extractReferences(candidateEquation);

    if (initialDeps.includes(normalizedTarget)) {
      return `Circular dependency detected: ${normalizedTarget} -> ${normalizedTarget}`;
    }

    const visited = new Set<string>();

    const dfs = (current: string, trail: string[]): string | null => {
      if (current === normalizedTarget) {
        return `Circular dependency detected: ${[...trail, current].join(" -> ")}`;
      }
      if (visited.has(current)) return null;
      visited.add(current);

      const node = this.tokens.get(current);
      if (!node) return null;

      for (const dep of node.deps) {
        const cycle = dfs(dep, [...trail, current]);
        if (cycle) return cycle;
      }
      return null;
    };

    for (const dep of initialDeps) {
      const cycle = dfs(dep, [normalizedTarget]);
      if (cycle) return cycle;
    }

    return null;
  }

  public evaluateAll(): Map<string, EvaluatedToken> {
    this.buildGraph();
    const results = new Map<string, EvaluatedToken>();
    const visiting = new Set<string>();

    const evalToken = (tokenKey: string): number => {
      const upper = tokenKey.trim().toUpperCase();
      const existing = results.get(upper);
      if (existing) return existing.value;

      const node = this.tokens.get(upper);
      if (!node) return 0;

      if (visiting.has(upper)) {
        return 0;
      }

      visiting.add(upper);
      const val = evaluateSafeExpression(node.equation, (ref) => evalToken(ref));
      visiting.delete(upper);

      results.set(upper, {
        token: upper,
        kind: node.kind,
        equation: node.equation,
        value: val,
      });
      return val;
    };

    for (const key of this.tokens.keys()) {
      evalToken(key);
    }

    return results;
  }
}
