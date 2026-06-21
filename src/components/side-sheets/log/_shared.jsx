import { useState, useMemo } from "react";
import { Building2, User, DollarSign, Search, X } from "lucide-react";

// ─── SHARED STYLING TOKENS ───
export const INPUT_CLASS =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300";
export const LABEL_CLASS = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1";

// Today as YYYY-MM-DD (for date input defaults).
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ─── LABEL ───
export function Label({ children, required }) {
  return (
    <label className={LABEL_CLASS}>
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

// ─── FIELD WRAPPER ───
export function Field({ label, required, children }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

// ─── TEXT INPUT ───
export function TextInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={INPUT_CLASS}
    />
  );
}

// ─── TEXTAREA ───
export function TextArea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${INPUT_CLASS} resize-y`}
    />
  );
}

// ─── SELECT ───
export function Select({ value, onChange, options }) {
  // options: array of strings OR { value, label }
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS}>
      {opts.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─── SECTION DIVIDER ───
export function Divider() {
  return <div className="border-t border-gray-100 my-4" />;
}

// ─── TOGGLE SWITCH ───
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-gray-300"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </button>
    </label>
  );
}

// ─── ENTITY ICON ───
const ENTITY_ICON = { company: Building2, customer: Building2, contact: User, deal: DollarSign };

export function EntityIcon({ type, size = 14, className = "" }) {
  const Icon = ENTITY_ICON[type] || Building2;
  return <Icon size={size} className={className} />;
}

// ─── "ASSOCIATED WITH" HEADER ───
// entity: { id, type, name }
export function AssociatedWith({ entity }) {
  if (!entity) return null;
  return (
    <div className="mb-4">
      <Label>Associated with</Label>
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
        <EntityIcon type={entity.type} className="text-gray-400" />
        <span className="text-sm font-medium text-gray-800">{entity.name}</span>
        <span className="text-xs text-gray-400 capitalize ml-auto">{entity.type}</span>
      </div>
    </div>
  );
}

// ─── CHIP ───
export function Chip({ label, onRemove, locked }) {
  return (
    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
      {label}
      {locked ? (
        <span className="text-gray-400 ml-0.5">·locked</span>
      ) : (
        <button type="button" onClick={onRemove} className="hover:text-red-500 transition-colors">
          <X size={11} />
        </button>
      )}
    </span>
  );
}

// ─── CHIP MULTI-SELECT ───
// options: [{ id, label }]; selected: [{ id, label }]
export function ChipMultiSelect({ options, selected, onAdd, onRemove, placeholder = "Search…", emptyHint }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.id)), [selected]);
  const filtered = useMemo(() => {
    const pool = options.filter((o) => !selectedIds.has(o.id));
    if (!query.trim()) return pool.slice(0, 8);
    const q = query.toLowerCase();
    return pool.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 8);
  }, [options, selectedIds, query]);

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((s) => (
            <Chip key={s.id} label={s.label} onRemove={() => onRemove(s.id)} />
          ))}
        </div>
      )}
      <div className="relative">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className={`${INPUT_CLASS} pl-8`}
          />
        </div>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-3 text-xs text-gray-400 text-center">
                  {emptyHint || "No results"}
                </div>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => { onAdd(o); setQuery(""); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                  >
                    {o.label}
                    {o.sublabel && <span className="text-gray-400 ml-1.5 text-xs">{o.sublabel}</span>}
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── FOOTER ───
export function Footer({ onCancel, onSubmit, submitLabel, disabled }) {
  return (
    <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
      <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700">
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
          disabled ? "bg-indigo-200 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {submitLabel}
      </button>
    </div>
  );
}

// ─── ENTITY → CONTACT OPTIONS ───
// Normalizes the differing contact shapes across the three detail pages into
// [{ id, label }] for ChipMultiSelect. Pass the entity's nested contacts list.
export function contactOptions(contacts = []) {
  return contacts.map((c) => ({
    id: c.id,
    label: c.name || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
    sublabel: c.email,
  }));
}

// ─── CURRENT USER ───
// Prototype stand-in for the logged-in rep.
export const CURRENT_USER = "John Carmichael";
