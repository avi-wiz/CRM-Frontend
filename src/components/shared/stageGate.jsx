import { useState } from "react";
import {
  stageMandatoryFields, companyFieldMeta, companyGateExcludedKeys,
  dealStageMandatoryFields, dealFieldMeta, dealGateExcludedKeys,
} from "../../data/constants";

// A value is "missing" if empty/null/false — the same rule the listing pages use.
// The "—" placeholder used in deal sample data also counts as empty.
export function isMissing(value) {
  return value === undefined || value === null || value === "" || value === false || value === "—";
}

// Per-entity config bundle.
function configFor(entityType) {
  return entityType === "deal"
    ? { stageMap: dealStageMandatoryFields, meta: dealFieldMeta, excluded: dealGateExcludedKeys }
    : { stageMap: stageMandatoryFields, meta: companyFieldMeta, excluded: companyGateExcludedKeys };
}

// Which mandatory fields a record still lacks for the target stage.
// entityType: "company" | "deal".
export function getMissingFieldsForStage(record, stage, entityType) {
  const { stageMap } = configFor(entityType);
  const required = stageMap[stage] || [];
  return required.filter((key) => isMissing(record[key]));
}

// Build the ordered list of fields to display in the gate form:
//  1. Every mandatory field for the target stage (required, shown first), then
//  2. Every other record field that already has a value and has editable meta.
// Each entry: { key, meta, required }.
function buildGateFields(record, stage, entityType) {
  const { stageMap, meta, excluded } = configFor(entityType);
  const required = stageMap[stage] || [];
  const seen = new Set();
  const fields = [];

  // Required fields first (in their configured order).
  for (const key of required) {
    if (seen.has(key)) continue;
    seen.add(key);
    fields.push({ key, meta: meta[key] || { label: key, type: "text" }, required: true });
  }

  // Then any already-filled, non-excluded, meta-known fields.
  for (const key of Object.keys(record)) {
    if (seen.has(key) || excluded.includes(key)) continue;
    if (isMissing(record[key])) continue;     // only previously-filled values
    if (!meta[key]) continue;                  // only fields we know how to render
    seen.add(key);
    fields.push({ key, meta: meta[key], required: false });
  }

  return fields;
}

// Shared gate form. Shows the full editable picture: required fields for the
// target stage plus every previously-filled field, all pre-filled & editable.
// Returns the complete set of (possibly edited) values on save.
export function RequiredFieldsForm({ record, entityName, entityType, stage, onCancel, onSave }) {
  const fields = buildGateFields(record, stage, entityType);

  const [values, setValues] = useState(() =>
    Object.fromEntries(
      fields.map(({ key, meta }) => {
        const existing = record[key];
        if (meta.type === "boolean") return [key, !!existing && existing !== "—"];
        return [key, isMissing(existing) ? "" : existing];
      })
    )
  );
  const set = (key, v) => setValues((prev) => ({ ...prev, [key]: v }));

  // Only the required fields gate the submit button.
  const requiredKeys = fields.filter((f) => f.required).map((f) => f.key);
  const allFilled = requiredKeys.every((key) => !isMissing(values[key]));

  return (
    <div>
      <p className="text-sm text-muted mb-4">
        Review and complete the details to move <strong className="text-ink">{entityName}</strong> to{" "}
        <strong className="text-ink">{stage}</strong>. Required fields are marked
        with <span className="text-danger">*</span>.
      </p>
      <div className="space-y-3">
        {fields.map(({ key, meta, required }) => (
          <div key={key}>
            <label className="text-xs text-muted block mb-1">
              {meta.label} {required && <span className="text-danger">*</span>}
            </label>
            {meta.type === "select" ? (
              <select
                value={values[key]}
                onChange={(e) => set(key, e.target.value)}
                className="wiz-input w-full px-3 py-2 text-sm"
              >
                <option value="">Select {meta.label}…</option>
                {meta.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : meta.type === "boolean" ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!values[key]} onChange={(e) => set(key, e.target.checked)} className="rounded accent-primary" />
                <span className="text-sm text-ink">{meta.label}</span>
              </label>
            ) : meta.type === "currency" ? (
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-disabled">$</span>
                <input type="text" value={values[key]} onChange={(e) => set(key, e.target.value)} placeholder="0"
                  className="wiz-input pl-6 pr-3 py-2 text-sm" />
              </div>
            ) : (
              <input type={meta.type === "number" ? "number" : "text"} value={values[key]} onChange={(e) => set(key, e.target.value)}
                className="wiz-input px-3 py-2 text-sm" />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-5">
        <button
          onClick={() => onSave(values)}
          disabled={!allFilled}
          className="wiz-btn wiz-btn--primary flex-1 py-2"
        >
          Save &amp; Move
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-sm text-muted hover:text-ink">Cancel</button>
      </div>
    </div>
  );
}
