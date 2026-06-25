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
    <div className="w-72 border-r border-border overflow-y-auto bg-surface p-5 flex-shrink-0">
      {groups.map((group, gi) => (
        <div key={group.title} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-bold text-disabled uppercase tracking-widest">{group.title}</h3>
            {gi === 0 && onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
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
      <div className="text-xs font-medium text-disabled mb-0.5">{field.label}</div>
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
      <span className="text-xs px-2 py-0.5 rounded-full bg-success-bg text-success-dark">Yes</span>
    ) : (
      <span className="text-xs px-2 py-0.5 rounded-full bg-tonal text-muted">No</span>
    );
  }
  const display = field.type === "currency" ? formatCurrency(value) : value;
  return (
    <div className="text-sm text-ink">
      {display == null || display === "" ? <span className="text-disabled">—</span> : display}
    </div>
  );
}

function AddressBlock({ addr }) {
  if (!addr || !addr.street) return <span className="text-sm text-disabled">—</span>;
  return (
    <div className="text-sm text-ink leading-snug">
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
