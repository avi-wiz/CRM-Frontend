import { Pencil } from "lucide-react";

// Left panel — read-only property groups for a detail entity.
//
// Props:
//   groups: [{ title, fields: [{ key, label, type, options?, readOnly? }] }]
//           type ∈ "text" | "number" | "currency" | "select" | "boolean" | "address"
//   values: flat object keyed by field.key (address fields hold { street, city, state, country, zip })
//   onEdit(): opens the Edit side sheet. The Edit CTA sits inline with the first
//             group's heading (the "<Entity> Info" line).
export default function PropertiesPanel({ groups, values, onEdit }) {
  return (
    <div className="w-72 border-r border-gray-150 overflow-y-auto bg-white p-5 flex-shrink-0">
      {groups.map((group, gi) => (
        <div key={group.title} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{group.title}</h3>
            {gi === 0 && onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Pencil size={12} /> Edit
              </button>
            )}
          </div>
          <div className="space-y-3.5">
            {group.fields.map((field) => (
              <PropertyRow key={field.key} field={field} value={values[field.key]} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PropertyRow({ field, value }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-400 mb-0.5">{field.label}</div>
      <PropertyValue field={field} value={value} />
    </div>
  );
}

function PropertyValue({ field, value }) {
  if (field.type === "address") {
    return <AddressBlock addr={value} />;
  }
  if (field.type === "boolean") {
    return value ? (
      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Yes</span>
    ) : (
      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">No</span>
    );
  }
  const display = field.type === "currency" ? formatCurrency(value) : value;
  return (
    <div className="text-sm text-gray-900">
      {display == null || display === "" ? <span className="text-gray-400">—</span> : display}
    </div>
  );
}

function AddressBlock({ addr }) {
  if (!addr || !addr.street) return <span className="text-sm text-gray-400">—</span>;
  return (
    <div className="text-sm text-gray-900 leading-snug">
      {addr.street}
      <br />
      {[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}
      <br />
      {addr.country}
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
