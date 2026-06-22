import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

// Left panel — editable property groups for a detail entity.
//
// Props:
//   groups: [{ title, fields: [{ key, label, type, options?, readOnly? }] }]
//           type ∈ "text" | "number" | "currency" | "select" | "boolean" | "address"
//   values: flat object keyed by field.key (address fields hold { street, city, state, country, zip })
//   onChange(key, value): commit an edit (local state in the parent)
export default function PropertiesPanel({ groups, values, onChange }) {
  return (
    <div className="w-72 border-r border-gray-150 overflow-y-auto bg-white p-5 flex-shrink-0">
      {groups.map((group) => (
        <div key={group.title} className="mb-6">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{group.title}</h3>
          <div className="space-y-3">
            {group.fields.map((field) => (
              <PropertyRow
                key={field.key}
                field={field}
                value={values[field.key]}
                onChange={(v) => onChange?.(field.key, v)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PropertyRow({ field, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const editable = !field.readOnly && field.type !== "boolean";

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };
  const save = () => {
    onChange?.(draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  // Address: compact multi-line block, edited as individual sub-fields.
  if (field.type === "address") {
    return (
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">{field.label}</label>
        {editing ? (
          <div className="space-y-1.5 bg-white border border-indigo-300 rounded-xl p-2 ring-2 ring-indigo-500/10">
            {["street", "city", "state", "country", "zip"].map((part) => (
              <input
                key={part}
                value={draft?.[part] ?? ""}
                placeholder={part[0].toUpperCase() + part.slice(1)}
                onChange={(e) => setDraft({ ...draft, [part]: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            ))}
            <InlineActions onSave={save} onCancel={cancel} />
          </div>
        ) : (
          <div className="group relative text-sm text-gray-900 bg-white border border-gray-200 rounded-xl px-3 py-2 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all duration-200">
            <AddressBlock addr={value} />
            <EditPencil onClick={startEdit} />
          </div>
        )}
      </div>
    );
  }

  // Boolean (read-only here — see conversion flow): show a status pill.
  if (field.type === "boolean") {
    return (
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">{field.label}</label>
        <div className="text-sm">
          {value ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Yes</span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">No</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
      {editing ? (
        <div className="flex items-center gap-1">
          {field.type === "select" ? (
            <select
              value={draft ?? ""}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 text-sm bg-white border border-indigo-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              {field.options?.map((o) => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <input
              type={field.type === "number" ? "number" : "text"}
              value={draft ?? ""}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 text-sm bg-white border border-indigo-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          )}
          <InlineActions onSave={save} onCancel={cancel} compact />
        </div>
      ) : (
        <div className="group relative text-sm text-gray-900 bg-white border border-gray-200 rounded-xl px-3 py-2 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all duration-200">
          {field.type === "currency" ? formatCurrency(value) : (value ?? "—")}
          {editable && <EditPencil onClick={startEdit} />}
        </div>
      )}
    </div>
  );
}

function AddressBlock({ addr }) {
  if (!addr || !addr.street) return <span className="text-gray-400">—</span>;
  return (
    <span className="leading-snug">
      {addr.street}
      <br />
      {[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}
      <br />
      {addr.country}
    </span>
  );
}

function EditPencil({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 transition-opacity"
      title="Edit"
    >
      <Pencil size={12} />
    </button>
  );
}

function InlineActions({ onSave, onCancel, compact }) {
  return (
    <div className={`flex items-center gap-1 ${compact ? "" : "justify-end pt-0.5"}`}>
      <button onClick={onSave} className="p-1 rounded text-emerald-600 hover:bg-emerald-50" title="Save">
        <Check size={14} />
      </button>
      <button onClick={onCancel} className="p-1 rounded text-gray-400 hover:bg-gray-100" title="Cancel">
        <X size={14} />
      </button>
    </div>
  );
}

// Formats a raw value as currency. Accepts "$58,000,000", "58000000", or numbers.
function formatCurrency(v) {
  if (v == null || v === "") return "—";
  const num = Number(String(v).replace(/[^0-9.-]/g, ""));
  if (Number.isNaN(num)) return v;
  return num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
