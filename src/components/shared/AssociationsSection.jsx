import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import AssociationCard from "./AssociationCard";
import AssociationPicker from "./AssociationPicker";
import { getAssociationObject, DEAL_ASSOCIATION_ORDER } from "../../data/associationRegistry";

// ─── ASSOCIATIONS SECTION ───
// A SINGLE entry point — "+ Add association" — opens one picker that handles
// every object type: choose a type, then a record (or type a query and search
// across all types at once). The per-type cards below are display only; they
// group what has been associated and let you label or remove each edge.
//
// `value` is the typed-edge model, keyed by object type:
//   { company: [{ record, label }], contact: [...], deal: [...], meeting: [...] }
export default function AssociationsSection({
  value,
  order = DEAL_ASSOCIATION_ORDER,
  requiredTypes = [],
  onAdd,
  onRemove,
  onLabelChange,
  onCreateNew,
  lockedTypes = [],
  errors = {},
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const triggerRef = useRef(null);

  // Only show a card for a type that has entries, is required, or is in error —
  // empty optional types live behind the single Add button instead of taking
  // up permanent space.
  const visible = order.filter((type) => {
    const config = getAssociationObject(type);
    if (!config) return false;
    return (value[type] ?? []).length > 0 || requiredTypes.includes(type) || errors[type];
  });

  const total = order.reduce((n, t) => n + (value[t] ?? []).length, 0);

  return (
    <div className="space-y-2">
      {visible.map((type) => (
        <AssociationCard
          key={type}
          config={getAssociationObject(type)}
          entries={value[type] ?? []}
          required={requiredTypes.includes(type)}
          locked={lockedTypes.includes(type)}
          error={!!errors[type]}
          onRemove={(id) => onRemove(type, id)}
          onLabelChange={(id, label) => onLabelChange(type, id, label)}
        />
      ))}

      {/* Single entry point for every object type */}
      <div className="relative" ref={triggerRef}>
        <button
          type="button"
          onClick={() => setPickerOpen((o) => !o)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-border text-primary hover:border-primary hover:bg-action-hover text-xs font-semibold transition-colors duration-150"
        >
          <Plus size={13} />
          Add association
        </button>
        {pickerOpen && (
          <AssociationPicker
            order={order}
            value={value}
            lockedTypes={lockedTypes}
            onAdd={onAdd}
            onCreateNew={onCreateNew}
            onClose={() => setPickerOpen(false)}
            anchorRef={triggerRef}
          />
        )}
      </div>

      {total === 0 && (
        <p className="text-[11px] text-disabled px-0.5">
          Associate with {order.map((t) => getAssociationObject(t)?.label.toLowerCase()).filter(Boolean).join(", ")}.
        </p>
      )}
    </div>
  );
}
