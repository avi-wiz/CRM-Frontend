import { useState } from "react";
import { CheckCircle } from "lucide-react";

// Generic edit form driven by the same PROPERTY_GROUPS config used by PropertiesPanel.
// `groups` — array of { title, fields[] } where each field has { key, label, type, options?, required? }
// `values` — current entity state
// `onSave(updatedValues)` — called with merged delta
// `onClose` — cancel handler
export function EditSheet({ groups, values, onSave, onClose, entityLabel = "Record" }) {
  const [draft, setDraft] = useState({ ...values });
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setDraft((d) => ({ ...d, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onSave(draft);
    }, 900);
  };

  // Skip address fields and read-only fields from the inline edit form —
  // addresses have their own dedicated sheets; read-only fields can't be changed.
  const editableGroups = groups.map((g) => ({
    ...g,
    fields: g.fields.filter((f) => f.type !== "address" && !f.readOnly),
  })).filter((g) => g.fields.length > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {editableGroups.map((group) => (
          <section key={group.title}>
            <h3 className="text-[10px] font-bold text-disabled uppercase tracking-widest mb-3">{group.title}</h3>
            <div className="space-y-3">
              {group.fields.map((field) => (
                <FieldInput
                  key={field.key}
                  field={field}
                  value={draft[field.key]}
                  onChange={(val) => set(field.key, val)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="pt-3 border-t border-divider space-y-2">
        {saved ? (
          <div className="w-full py-2.5 bg-success text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle size={15} /> Saved!
          </div>
        ) : (
          <button
            onClick={handleSave}
            className="wiz-btn wiz-btn--primary w-full"
          >
            Save {entityLabel}
          </button>
        )}
        <button
          onClick={onClose}
          className="wiz-btn wiz-btn--text w-full"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  const { label, type, options, required } = field;

  return (
    <div>
      <label className="text-xs font-medium text-muted block mb-1">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {type === "select" ? (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="wiz-input w-full"
        >
          <option value="">Select…</option>
          {(options || []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === "boolean" ? (
        <div className="flex items-center gap-2 py-1">
          <button
            onClick={() => onChange(!value)}
            className={`w-9 h-5 rounded-full transition-colors ${value ? "bg-primary" : "bg-border"}`}
          >
            <span className={`block w-4 h-4 rounded-full bg-surface shadow-1 transition-transform mx-0.5 ${value ? "translate-x-4" : "translate-x-0"}`} />
          </button>
          <span className="text-sm text-muted">{value ? "Yes" : "No"}</span>
        </div>
      ) : type === "number" ? (
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className="wiz-input w-full"
        />
      ) : type === "currency" ? (
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-sm text-disabled">$</span>
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="wiz-input w-full pl-6"
          />
        </div>
      ) : (
        <input
          type={type === "date" ? "date" : "text"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="wiz-input w-full"
        />
      )}
    </div>
  );
}
