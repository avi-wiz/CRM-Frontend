import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

function initials(text = "") {
  return text
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── LABEL PICKER ───
// The association edge is typed: "Decision Maker", "Billing", etc. Renders as a
// small chip that opens a menu; unset shows a dashed "Set label" affordance.
function LabelPicker({ labels, value, onChange }) {
  const [open, setOpen] = useState(false);
  if (!labels?.length) return null;

  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={
          value
            ? "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-action-selected text-primary-dark text-[10px] font-medium"
            : "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border border-dashed border-border text-disabled text-[10px] hover:text-muted hover:border-tonal transition-colors"
        }
      >
        {value || "Set label"}
        <ChevronDown size={9} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1 right-0 w-40 bg-surface border border-border rounded-lg shadow-3 overflow-hidden">
            <button
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-[11px] text-disabled hover:bg-action-hover"
            >
              No label
            </button>
            {labels.map((l) => (
              <button
                key={l}
                onClick={() => {
                  onChange(l);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-action-hover ${
                  l === value ? "text-primary font-semibold" : "text-ink"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── ASSOCIATION CARD ───
// Display-only grouping for one object type: a collapsible header with a count
// and the associated record rows. Adding is handled by the single
// AssociationPicker in AssociationsSection, not per-card.
export default function AssociationCard({
  config,
  entries,
  required = false,
  onRemove,
  onLabelChange,
  locked = false,
  error = false,
}) {
  const [expanded, setExpanded] = useState(true);
  const Icon = config.icon;

  return (
    <div className={`border rounded-xl ${error ? "border-danger" : "border-border"}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-t-xl cursor-pointer hover:bg-action-hover transition-colors duration-150"
        onClick={() => setExpanded((x) => !x)}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <ChevronDown
            size={13}
            className={`text-disabled transition-transform duration-150 ${expanded ? "" : "-rotate-90"}`}
          />
          <Icon size={13} className="text-disabled" />
          <span className="text-xs font-semibold text-ink">
            {config.label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </span>
          {entries.length > 0 && (
            <span className="ml-0.5 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-tonal text-[10px] font-bold text-muted">
              {entries.length}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-3 pb-3 space-y-1.5">
          {entries.length === 0 ? (
            <div className="px-3 py-2.5 rounded-lg border border-dashed border-border text-disabled text-xs">
              No {config.label.toLowerCase()} associated
            </div>
          ) : (
            entries.map((e) => (
              <div
                key={e.record.id}
                className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border hover:bg-action-hover transition-colors duration-150"
                title={e.record.meta?.map(([k, v]) => `${k}: ${v}`).join("\n")}
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-extrabold text-white shadow-1 flex-shrink-0">
                  {initials(e.record.primary)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-ink truncate">{e.record.primary}</div>
                  {e.record.secondary && (
                    <div className="text-[11px] text-disabled truncate">{e.record.secondary}</div>
                  )}
                </div>
                <LabelPicker
                  labels={config.labels}
                  value={e.label}
                  onChange={(label) => onLabelChange(e.record.id, label)}
                />
                {!locked && (
                  <button
                    type="button"
                    onClick={() => onRemove(e.record.id)}
                    className="p-0.5 rounded text-disabled hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
