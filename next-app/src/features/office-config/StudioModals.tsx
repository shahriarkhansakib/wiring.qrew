"use client";

import React, { useMemo, useState } from "react";
import { DAGFormulaEngine, formatCurrency, sanitizeToken } from "@/lib/dag-formula-engine";
import type { InvoiceTemplate, OperationalFile, TemplateCharge, TemplateRow, TemplateSection } from "@/lib/types";
import {
  applyOperationalFileToTemplate,
  cloneTemplate,
  ensureHeaderGrid,
  getCleanFieldValue,
  syncGridToHeaderFields,
} from "./header-grid";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  BDT: "৳",
  EUR: "€",
  GBP: "£",
  SGD: "S$",
  AED: "AED",
};

interface CreateTemplateModalProps {
  defaultName: string;
  defaultCode: string;
  onCancel: () => void;
  onCreate: (draftTemplate: Partial<InvoiceTemplate>) => void;
}

export function CreateTemplateModalContent({
  defaultName,
  defaultCode,
  onCancel,
  onCreate,
}: CreateTemplateModalProps) {
  const [name, setName] = useState(defaultName);
  const [type, setType] = useState("custom");
  const [code, setCode] = useState(defaultCode);
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedName = name.trim() || defaultName;
    const resolvedCode = code.trim() || defaultCode;
    const currencySymbol = CURRENCY_SYMBOLS[currency] || "$";

    const headerFields = [
      { key: "NAME", label: "Name", value: `${resolvedName} Operation` },
      { key: "STATUS", label: "Status", value: "Active" },
      { key: "CLIENTID", label: "Client", value: "" },
      { key: "TERMINAL", label: "Terminal", value: "" },
      { key: "VOYAGE_NO", label: "Voyage No", value: "" },
      { key: "PORT", label: "Port", value: "" },
      { key: "ARRIVAL", label: "Arrival", value: "" },
      { key: "NRT", label: "NRT", value: "" },
      { key: "BERTHING", label: "Berthing", value: "" },
      { key: "GRT", label: "GRT", value: "" },
      { key: "DEPARTURE", label: "Departure", value: "" },
      { key: "NAME_OF_VESSEL", label: "Name Of Vessel", value: "" },
    ];

    const sections: TemplateSection[] = [
      {
        id: "sec_1",
        title: "Section 1: Service Operations",
        color: "green",
        rows: [
          {
            id: `r1_${Date.now().toString(36)}`,
            token: "SERVICE_BASE",
            name: "Base Operational Service",
            equation: "1000",
            sl: 1,
            editable: "NOT EDITABLE",
          },
        ],
        charges: [],
        subtotal: { token: "SEC1_TOTAL", label: "Section Total", equation: "= SERVICE_BASE" },
      },
    ];

    onCreate({
      name: resolvedName,
      type,
      tag: type.toUpperCase(),
      code: resolvedCode,
      description: description.trim() || "Custom invoice template",
      status: "Active",
      currency,
      currencySymbol,
      headerFields,
      globalConstants: {
        DOLLAR_RATE: 121,
        PORT_DUES_PER_GRT: 0.31,
        SOURCE_TAX_RATE: 0.08,
      },
      localConstants: {},
      sections,
      grandTotal: {
        token: "GRAND_TOTAL",
        label: "TOTAL",
        equation: "= SEC1_TOTAL",
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label" htmlFor="new-tpl-name">
            Template Name <span className="required" style={{ color: "var(--color-danger)" }}>*</span>
          </label>
          <input
            type="text"
            id="new-tpl-name"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chittagong Port PDA"
            required
            autoFocus
          />
        </div>

        <div
          className="form-row form-row-responsive"
          style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}
        >
          <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label" htmlFor="new-tpl-type">
              Type <span className="required" style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <select
              id="new-tpl-type"
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="custom">Custom</option>
              <option value="standard">Standard</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1.5, minWidth: 180 }}>
            <label className="form-label" htmlFor="new-tpl-code">
              Index (Document Indexing) <span className="required" style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <input
              type="text"
              id="new-tpl-code"
              className="form-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ fontFamily: "var(--font-mono)" }}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor="new-tpl-currency">
            Default Currency <span className="required" style={{ color: "var(--color-danger)" }}>*</span>
          </label>
          <select
            id="new-tpl-currency"
            className="form-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="BDT">BDT (৳)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="SGD">SGD (S$)</option>
            <option value="AED">AED (AED)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor="new-tpl-desc">
            Description
          </label>
          <textarea
            id="new-tpl-desc"
            className="form-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose, scope, or usage of this template..."
          />
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          id="btn-submit-create-tpl"
          style={{ background: "#235F42", borderColor: "#1B4B34" }}
        >
          Create &amp; Open Builder
        </button>
      </div>
    </form>
  );
}

interface AddRowModalProps {
  template: InvoiceTemplate;
  sectionId: string;
  sectionTitle: string;
  onCancel: () => void;
  onAdd: (nextTemplate: InvoiceTemplate, newRow: TemplateRow) => void;
}

export function AddRowModalContent({
  template,
  sectionId,
  sectionTitle,
  onCancel,
  onAdd,
}: AddRowModalProps) {
  const rowCount = (template.sections || []).reduce((acc, s) => acc + (s.rows || []).length, 0) + 1;
  const defaultToken = `ROW_${rowCount}`;

  const [name, setName] = useState("");
  const [token, setToken] = useState(defaultToken);
  const [tokenTouched, setTokenTouched] = useState(false);
  const [editable, setEditable] = useState<"EDITABLE" | "FIXED">("EDITABLE");
  const [equation, setEquation] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanToken = sanitizeToken(token, "");
    if (!cleanName) {
      setError("Please enter a row name.");
      return;
    }
    if (!cleanToken) {
      setError("Please enter a valid token identifier.");
      return;
    }

    const engine = new DAGFormulaEngine(template);
    engine.buildGraph();
    if (engine.tokens.has(cleanToken)) {
      setError(`Token "${cleanToken}" is already in use. Please choose a unique token name.`);
      return;
    }

    const eq = equation.trim() || "0";
    const next = cloneTemplate(template);
    const sec = (next.sections || []).find((s) => s.id === sectionId);
    if (!sec) return;

    const newRow: TemplateRow = {
      id: `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
      token: cleanToken,
      name: cleanName,
      equation: eq,
      editable,
      sl: (sec.rows || []).length + 1,
    };

    if (!sec.rows) sec.rows = [];
    sec.rows.push(newRow);
    if (sec.subtotal?.equation?.startsWith("=")) {
      sec.subtotal.equation = `= ${sec.rows.map((r) => r.token).join(" + ")}`;
    }

    onAdd(next, newRow);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label" htmlFor="modal-row-name">
            Row Name / Label <span className="required">*</span>
          </label>
          <input
            type="text"
            id="modal-row-name"
            className="form-input"
            value={name}
            onChange={(e) => {
              const val = e.target.value;
              setName(val);
              setError(null);
              if (!tokenTouched) {
                const suggested = sanitizeToken(val, "");
                if (suggested) setToken(suggested);
              }
            }}
            placeholder="e.g. PORT TUG HIRE 1 UNIT MANDATORY PAY"
            autoFocus
            required
          />
          <span className="form-hint">Text displayed in client PDF document ({sectionTitle}).</span>
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor="modal-row-token">
            Row Token Variable <span className="required">*</span>
          </label>
          <input
            type="text"
            id="modal-row-token"
            className="form-input"
            value={token}
            onChange={(e) => {
              setTokenTouched(true);
              setError(null);
              setToken(sanitizeToken(e.target.value, ""));
            }}
            style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
            required
          />
          <span className="form-hint">
            Unique token identifier (e.g. <code>{defaultToken}</code>) used in calculation formulas.
          </span>
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor="modal-row-type">
            Billing Mode
          </label>
          <select
            id="modal-row-type"
            className="form-select"
            value={editable}
            onChange={(e) => setEditable(e.target.value === "FIXED" ? "FIXED" : "EDITABLE")}
          >
            <option value="EDITABLE">Editable (Operator can adjust amount during billing)</option>
            <option value="FIXED">Fixed (Standard tariff or calculated by formula)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor="modal-row-eq">
            Amount or Formula
          </label>
          <input
            type="text"
            id="modal-row-eq"
            className="form-input"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            style={{ fontFamily: "var(--font-mono)" }}
          />
          <span className="form-hint">
            Numeric value (e.g. <code>1230</code>) or formula (e.g. <code>= PILOT * 1.5</code>).
          </span>
        </div>

        {error ? (
          <div style={{ marginTop: 10, color: "var(--color-danger)", fontSize: 12.5 }}>
            {error}
          </div>
        ) : null}
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" id="btn-submit-modal-row">
          Add Row
        </button>
      </div>
    </form>
  );
}

interface AddChargeModalProps {
  template: InvoiceTemplate;
  sectionId: string;
  onCancel: () => void;
  onAdd: (nextTemplate: InvoiceTemplate, chargeName: string) => void;
}

export function AddChargeModalContent({
  template,
  sectionId,
  onCancel,
  onAdd,
}: AddChargeModalProps) {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [tokenTouched, setTokenTouched] = useState(false);
  const [equation, setEquation] = useState("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanToken = sanitizeToken(token, "");
    if (!cleanName || !cleanToken) return;

    const next = cloneTemplate(template);
    const sec = (next.sections || []).find((s) => s.id === sectionId);
    if (!sec) return;
    if (!sec.charges) sec.charges = [];

    const newCharge: TemplateCharge = {
      id: `c_${Date.now().toString(36)}`,
      token: cleanToken,
      name: cleanName,
      equation: equation.trim() || "0",
      editable: "FIXED",
    };
    sec.charges.push(newCharge);
    onAdd(next, cleanName);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label" htmlFor="modal-charge-name">
            Charge Name / Label <span className="required">*</span>
          </label>
          <input
            type="text"
            id="modal-charge-name"
            className="form-input"
            value={name}
            onChange={(e) => {
              const val = e.target.value;
              setName(val);
              if (!tokenTouched) {
                setToken(sanitizeToken(val, ""));
              }
            }}
            placeholder="e.g. Vat or Source Tax"
            autoFocus
            required
          />
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor="modal-charge-token">
            Charge Token Variable <span className="required">*</span>
          </label>
          <input
            type="text"
            id="modal-charge-token"
            className="form-input"
            value={token}
            onChange={(e) => {
              setTokenTouched(true);
              setToken(sanitizeToken(e.target.value, ""));
            }}
            placeholder="e.g. SEC_VAT"
            style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
            required
          />
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor="modal-charge-eq">
            Amount or Formula
          </label>
          <input
            type="text"
            id="modal-charge-eq"
            className="form-input"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" id="btn-submit-modal-charge">
          Add Charge
        </button>
      </div>
    </form>
  );
}

interface AddSectionModalProps {
  template: InvoiceTemplate;
  insertBeforeId?: string | null;
  onCancel: () => void;
  onAdd: (nextTemplate: InvoiceTemplate, title: string) => void;
}

export function AddSectionModalContent({
  template,
  insertBeforeId = null,
  onCancel,
  onAdd,
}: AddSectionModalProps) {
  const secCount = (template.sections || []).length + 1;
  const [title, setTitle] = useState(`SECTION ${secCount}`);
  const [color, setColor] = useState("green");
  const [subtotalToken, setSubtotalToken] = useState(`SEC${secCount}_TOTAL`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanToken = sanitizeToken(subtotalToken, `SEC${secCount}_TOTAL`);
    if (!cleanTitle || !cleanToken) return;

    const next = cloneTemplate(template);
    const newSec: TemplateSection = {
      id: `sec_${Date.now().toString(36)}`,
      title: cleanTitle.toUpperCase(),
      color,
      rows: [
        {
          id: `r_${Date.now().toString(36)}`,
          token: `${cleanToken}_ITEM1`,
          name: "Standard Deliverable",
          equation: "0",
          editable: "EDITABLE",
          sl: 1,
        },
      ],
      charges: [],
      subtotal: {
        token: cleanToken,
        label: "Section Total",
        equation: `= ${cleanToken}_ITEM1`,
      },
    };

    if (!next.sections) next.sections = [];
    if (insertBeforeId) {
      const idx = next.sections.findIndex((s) => s.id === insertBeforeId);
      if (idx !== -1) next.sections.splice(idx, 0, newSec);
      else next.sections.push(newSec);
    } else {
      next.sections.push(newSec);
    }

    if (next.grandTotal?.equation?.includes("SEC")) {
      next.grandTotal.equation = `= ${next.sections.map((s) => s.subtotal.token).join(" + ")}`;
    }

    onAdd(next, cleanTitle);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label" htmlFor="modal-sec-title">
            Section Name / Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="modal-sec-title"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AS PER PORT TARIFF"
            autoFocus
            required
          />
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor="modal-sec-color">
            Section Color Accent
          </label>
          <select
            id="modal-sec-color"
            className="form-select"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          >
            <option value="green">Green (Port Tariff)</option>
            <option value="blue">Blue (Tariff)</option>
            <option value="orange">Orange (Private Service)</option>
            <option value="purple">Purple (Standard)</option>
          </select>
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor="modal-sec-token">
            Subtotal Token Variable <span className="required">*</span>
          </label>
          <input
            type="text"
            id="modal-sec-token"
            className="form-input"
            value={subtotalToken}
            onChange={(e) => setSubtotalToken(sanitizeToken(e.target.value, ""))}
            style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
            required
          />
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" id="btn-submit-modal-sec">
          Add Section
        </button>
      </div>
    </form>
  );
}

interface AddHeaderFieldModalProps {
  template: InvoiceTemplate;
  targetRow?: number;
  targetCol?: number;
  onCancel: () => void;
  onAdd: (nextTemplate: InvoiceTemplate, label: string) => void;
}

export function AddHeaderFieldModalContent({
  template,
  targetRow,
  targetCol,
  onCancel,
  onAdd,
}: AddHeaderFieldModalProps) {
  const [label, setLabel] = useState("");
  const [key, setKey] = useState("");
  const [keyTouched, setKeyTouched] = useState(false);
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = label.trim();
    const cleanKey = sanitizeToken(key, "");
    if (!cleanLabel || !cleanKey) return;

    const cleanVal = getCleanFieldValue(value.trim());
    const next = cloneTemplate(template);
    const grid = ensureHeaderGrid(next);

    if (targetRow !== undefined && targetCol !== undefined) {
      const existingCell = grid.cells.find((c) => c.row === targetRow && c.col === targetCol);
      if (existingCell) {
        existingCell.empty = false;
        existingCell.key = cleanKey;
        existingCell.label = cleanLabel;
        existingCell.value = cleanVal;
      } else {
        grid.cells.push({
          id: `cell_${targetRow}_${targetCol}_${Date.now()}`,
          row: targetRow,
          col: targetCol,
          colspan: 1,
          rowspan: 1,
          empty: false,
          key: cleanKey,
          label: cleanLabel,
          value: cleanVal,
        });
      }
    } else {
      const emptyCell = grid.cells.find((c) => c.empty);
      if (emptyCell) {
        emptyCell.empty = false;
        emptyCell.key = cleanKey;
        emptyCell.label = cleanLabel;
        emptyCell.value = cleanVal;
      } else {
        const newRow = grid.rowsCount;
        grid.rowsCount += 1;
        grid.cells.push({
          id: `cell_${newRow}_0_${Date.now()}`,
          row: newRow,
          col: 0,
          colspan: 1,
          rowspan: 1,
          empty: false,
          key: cleanKey,
          label: cleanLabel,
          value: cleanVal,
        });
        for (let c = 1; c < grid.colsCount; c++) {
          grid.cells.push({
            id: `cell_${newRow}_${c}_${Date.now()}`,
            row: newRow,
            col: c,
            colspan: 1,
            rowspan: 1,
            empty: true,
            key: "",
            label: "",
            value: "",
          });
        }
      }
    }

    syncGridToHeaderFields(next);
    onAdd(next, cleanLabel);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label" htmlFor="modal-field-label">
            Field Label <span className="required">*</span>
          </label>
          <input
            type="text"
            id="modal-field-label"
            className="form-input"
            value={label}
            onChange={(e) => {
              const val = e.target.value;
              setLabel(val);
              if (!keyTouched) setKey(sanitizeToken(val, ""));
            }}
            placeholder="e.g. Master's Name or LOA (Length Overall)"
            autoFocus
            required
          />
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor="modal-field-key">
            Field Token Key <span className="required">*</span>
          </label>
          <input
            type="text"
            id="modal-field-key"
            className="form-input"
            value={key}
            onChange={(e) => {
              setKeyTouched(true);
              setKey(sanitizeToken(e.target.value, ""));
            }}
            placeholder="e.g. LOA"
            style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
            required
          />
          <span className="form-hint">
            Used as a token variable in formulas (e.g. <code>LOA</code>).
          </span>
        </div>

        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor="modal-field-val">
            Initial Value
          </label>
          <input
            type="text"
            id="modal-field-val"
            className="form-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="—"
          />
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" id="btn-submit-modal-field">
          Add Field
        </button>
      </div>
    </form>
  );
}

interface RenameTokenModalProps {
  currentToken: string;
  onCancel: () => void;
  onRename: (nextToken: string) => string | null;
}

export function RenameTokenModalContent({
  currentToken,
  onCancel,
  onRename,
}: RenameTokenModalProps) {
  const [token, setToken] = useState(currentToken);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = sanitizeToken(token, "");
    if (!cleaned) {
      setError("Please enter a valid token name.");
      return;
    }
    const err = onRename(cleaned);
    if (err) setError(err);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label" htmlFor="rename-token-input">
            Token Variable Name
          </label>
          <input
            type="text"
            id="rename-token-input"
            className="form-input"
            value={token}
            onChange={(e) => {
              setError(null);
              setToken(sanitizeToken(e.target.value, ""));
            }}
            style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
            autoFocus
            required
          />
          <span className="form-hint">
            Any section subtotal formulas referencing <code>{currentToken}</code> will update automatically.
          </span>
          {error ? (
            <div style={{ marginTop: 8, color: "var(--color-danger)", fontSize: 12.5 }}>{error}</div>
          ) : null}
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Rename Token
        </button>
      </div>
    </form>
  );
}

interface EditFormulaModalProps {
  tokenLabel: string;
  initialEquation: string;
  onCancel: () => void;
  onSave: (equation: string) => string | null;
}

export function EditFormulaModalContent({
  tokenLabel,
  initialEquation,
  onCancel,
  onSave,
}: EditFormulaModalProps) {
  const [equation, setEquation] = useState(initialEquation);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onSave(equation.trim() || "0");
    if (err) setError(err);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label" htmlFor="inline-formula-modal-input">
            Amount or Formula for <code>{tokenLabel}</code>
          </label>
          <input
            type="text"
            id="inline-formula-modal-input"
            className="form-input"
            value={equation}
            onChange={(e) => {
              setError(null);
              setEquation(e.target.value);
            }}
            placeholder="e.g. 1500 or = PILOT * 1.5"
            style={{ fontFamily: "var(--font-mono)" }}
            autoFocus
          />
          {error ? (
            <div style={{ marginTop: 8, color: "var(--color-danger)", fontSize: 12.5 }}>{error}</div>
          ) : null}
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Apply Formula
        </button>
      </div>
    </form>
  );
}

interface AddConstantModalProps {
  scopeLabel: "Global" | "Template";
  defaultValue: string;
  onCancel: () => void;
  onSave: (token: string, value: number) => void;
}

export function AddConstantModalContent({
  scopeLabel,
  defaultValue,
  onCancel,
  onSave,
}: AddConstantModalProps) {
  const [name, setName] = useState("");
  const [valStr, setValStr] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = sanitizeToken(name, "");
    const numeric = Number.parseFloat(valStr);
    if (!token) {
      setError("Please enter a valid constant token name.");
      return;
    }
    if (!Number.isFinite(numeric)) {
      setError("Please enter a numeric constant value.");
      return;
    }
    onSave(token, numeric);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label" htmlFor="modal-const-name">
            {scopeLabel} Constant Token Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="modal-const-name"
            className="form-input"
            value={name}
            onChange={(e) => {
              setError(null);
              setName(sanitizeToken(e.target.value, ""));
            }}
            placeholder="e.g. PORT_TAX"
            style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
            autoFocus
            required
          />
        </div>
        <div className="form-group" style={{ marginTop: 14 }}>
          <label className="form-label" htmlFor="modal-const-val">
            Numeric Value <span className="required">*</span>
          </label>
          <input
            type="number"
            step="any"
            id="modal-const-val"
            className="form-input"
            value={valStr}
            onChange={(e) => {
              setError(null);
              setValStr(e.target.value);
            }}
            style={{ fontFamily: "var(--font-mono)" }}
            required
          />
        </div>
        {error ? (
          <div style={{ marginTop: 8, color: "var(--color-danger)", fontSize: 12.5 }}>{error}</div>
        ) : null}
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Add {scopeLabel} Constant
        </button>
      </div>
    </form>
  );
}

interface PrepopulateModalProps {
  template: InvoiceTemplate;
  operationalFiles: OperationalFile[];
  onCancel: () => void;
  onApply: (nextTemplate: InvoiceTemplate, fileTitle: string) => void;
}

export function PrepopulateFileModalContent({
  template,
  operationalFiles,
  onCancel,
  onApply,
}: PrepopulateModalProps) {
  const [selectedId, setSelectedId] = useState(operationalFiles[0]?.id || "");

  const handleApply = () => {
    const file = operationalFiles.find((f) => f.id === selectedId);
    if (!file) return;
    onApply(applyOperationalFileToTemplate(template, file), file.title);
  };

  return (
    <>
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label" htmlFor="select-prepop-proj">
            Choose Operational Project / Product
          </label>
          <select
            id="select-prepop-proj"
            className="form-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {operationalFiles.map((f) => (
              <option key={f.id} value={f.id}>
                {f.fileCode}: {f.title} ({f.clientName})
              </option>
            ))}
          </select>
          <span className="form-hint">
            Applying an operational file will update header fields and recalculate dependent tokens live.
          </span>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          id="btn-confirm-prepop"
          onClick={handleApply}
        >
          Apply to Header Fields
        </button>
      </div>
    </>
  );
}

interface PreviewTemplateModalProps {
  template: InvoiceTemplate;
  onClose: () => void;
}

export function PreviewTemplateModalContent({ template, onClose }: PreviewTemplateModalProps) {
  const evalTokens = useMemo(() => {
    const engine = new DAGFormulaEngine(template);
    return engine.evaluateAll();
  }, [template]);

  const total =
    evalTokens.get((template.grandTotal?.token || "TOTAL").toUpperCase())?.value || 0;

  return (
    <>
      <div className="modal-body">
        <div className="printable-invoice-canvas">
          <div className="invoice-modal-header">
            <div>
              <h2 style={{ margin: 0, fontSize: 20, color: "#235F42", fontWeight: 600 }}>
                SST SHIPPING &amp; LOGISTICS
              </h2>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                Chittagong Port Marine Terminal
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{template.name}</div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                }}
              >
                Ref: {template.code}
              </div>
            </div>
          </div>

          <div className="invoice-modal-details-grid">
            {(template.headerFields || []).map((f) => (
              <div key={f.key}>
                <strong>{f.label || f.key}:</strong> {f.value || "—"}
              </div>
            ))}
          </div>

          <table className="invoice-modal-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>SL</th>
                <th>Deliverable / Description</th>
                <th style={{ textAlign: "right", width: 140 }}>
                  Amount ({template.currency || "USD"})
                </th>
              </tr>
            </thead>
            <tbody>
              {(template.sections || []).map((sec) => (
                <React.Fragment key={sec.id}>
                  <tr className="invoice-sec-header-row">
                    <td colSpan={3} style={{ color: "#235F42", fontWeight: 600 }}>
                      {sec.title}
                    </td>
                  </tr>
                  {(sec.rows || []).map((r) => (
                    <tr key={r.id}>
                      <td style={{ color: "var(--color-text-muted)" }}>{r.sl || ""}</td>
                      <td>{r.name}</td>
                      <td
                        style={{
                          textAlign: "right",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                        }}
                      >
                        {formatCurrency(evalTokens.get(r.token.toUpperCase())?.value || 0)}
                      </td>
                    </tr>
                  ))}
                  {(sec.charges || []).map((c) => (
                    <tr
                      key={c.id}
                      style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}
                    >
                      <td />
                      <td style={{ textAlign: "right", paddingRight: 16 }}>{c.name}</td>
                      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)" }}>
                        {formatCurrency(evalTokens.get(c.token.toUpperCase())?.value || 0)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div className="invoice-modal-total-banner">
            <span>TOTAL BALANCE DUE</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>
              {formatCurrency(total, template.currencySymbol || "$")}
            </span>
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => window.print()}
          style={{ background: "#235F42", borderColor: "#1B4B34" }}
        >
          Print / Save PDF
        </button>
      </div>
    </>
  );
}
