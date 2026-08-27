import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Plus, Check, ChevronLeft } from "lucide-react";
import { getAssociationObject } from "../../data/associationRegistry";

// ─── UNIFIED ASSOCIATION PICKER ───
// One entry point for associating ANY object. Two steps in a single popover:
//
//   Step 1 (type)   — choose the object type: Company, Contact, Deal, Quote…
//   Step 2 (record) — search that type's records and pick one or more.
//
// Typing in step 1 skips straight to a blended search across EVERY object type,
// so a user who knows the record name never has to pick a type at all. That is
// the "single flow" the per-card + Add buttons couldn't offer.

function TypeRow({ config, count, onClick }) {
  const Icon = config.icon;
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 hover:bg-action-hover flex items-center gap-2.5 transition-colors duration-150"
    >
      <Icon size={14} className="text-disabled flex-shrink-0" />
      <span className="text-xs font-medium text-ink flex-1">{config.label}</span>
      {count > 0 && (
        <span className="min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-tonal text-[10px] font-bold text-muted">
          {count}
        </span>
      )}
      <span className="text-[10px] text-disabled">›</span>
    </button>
  );
}

function RecordRow({ record, config, selected, onClick, showType }) {
  const Icon = config.icon;
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 hover:bg-action-hover flex items-center justify-between gap-2 transition-colors duration-150"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {showType && <Icon size={13} className="text-disabled flex-shrink-0" />}
        <div className="min-w-0">
          <div className="text-xs font-medium text-ink truncate">{record.primary}</div>
          {record.secondary && (
            <div className="text-[11px] text-disabled truncate">{record.secondary}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {showType && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-tonal text-muted">
            {config.labelSingular}
          </span>
        )}
        {record.badge && !showType && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-tonal text-muted">{record.badge}</span>
        )}
        {selected && <Check size={13} className="text-primary" />}
      </div>
    </button>
  );
}

export default function AssociationPicker({ order, value, onAdd, onCreateNew, onClose, lockedTypes = [], anchorRef }) {
  const [activeType, setActiveType] = useState(null);
  const [query, setQuery] = useState("");
  // The trigger sits at the bottom of a scrolling sheet, so a downward popover
  // gets clipped by the footer. Flip upward when there isn't room below.
  const [dropUp, setDropUp] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeType]);

  useEffect(() => {
    const el = anchorRef?.current;
    if (!el) return;
    const spaceBelow = window.innerHeight - el.getBoundingClientRect().bottom;
    setDropUp(spaceBelow < 300);
  }, [anchorRef]);

  const selectableTypes = useMemo(
    () => order.filter((t) => !lockedTypes.includes(t)),
    [order, lockedTypes]
  );

  const config = activeType ? getAssociationObject(activeType) : null;

  const selectedIdsFor = (type) => new Set((value[type] ?? []).map((e) => e.record.id));

  // Step 2, or step 1 with a query → blended cross-type results.
  const results = useMemo(() => {
    if (config) {
      return config.search(query).map((r) => ({ record: r, type: activeType }));
    }
    if (!query.trim()) return [];
    return selectableTypes.flatMap((type) =>
      getAssociationObject(type)
        .search(query)
        .slice(0, 4)
        .map((r) => ({ record: r, type }))
    );
  }, [config, activeType, query, selectableTypes]);

  const placeholder = config ? config.searchPlaceholder : "Search across all records…";
  const showingBlended = !config && query.trim().length > 0;

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div
        className={`absolute z-20 left-0 right-0 bg-surface border border-border rounded-lg shadow-3 ${
          dropUp ? "bottom-full mb-1" : "top-full mt-1"
        }`}
      >
        {/* Header: back arrow once a type is chosen */}
        <div className="p-2 border-b border-divider">
          <div className="flex items-center gap-1.5">
            {config && (
              <button
                onClick={() => {
                  setActiveType(null);
                  setQuery("");
                }}
                className="p-1 rounded hover:bg-action-hover text-disabled hover:text-muted flex-shrink-0"
                title="Back to all types"
              >
                <ChevronLeft size={14} />
              </button>
            )}
            <div className="relative flex-1">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-disabled" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="wiz-input w-full pl-6 text-xs"
              />
            </div>
          </div>
          {config && (
            <div className="mt-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-disabled">
              {config.label}
            </div>
          )}
        </div>

        <div className="max-h-56 overflow-y-auto">
          {/* Step 1 — object types */}
          {!config && !showingBlended && (
            <>
              <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-disabled">
                Associate with
              </div>
              {selectableTypes.map((type) => (
                <TypeRow
                  key={type}
                  config={getAssociationObject(type)}
                  count={(value[type] ?? []).length}
                  onClick={() => {
                    setActiveType(type);
                    setQuery("");
                  }}
                />
              ))}
            </>
          )}

          {/* Step 2, or blended search */}
          {(config || showingBlended) && (
            <>
              {showingBlended && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-disabled">
                  All results
                </div>
              )}
              {results.length === 0 ? (
                <div className="px-3 py-4 text-xs text-disabled text-center">No records found</div>
              ) : (
                results.map(({ record, type }) => (
                  <RecordRow
                    key={`${type}:${record.id}`}
                    record={record}
                    config={getAssociationObject(type)}
                    selected={selectedIdsFor(type).has(record.id)}
                    showType={showingBlended}
                    onClick={() => {
                      onAdd(type, record);
                      if (!getAssociationObject(type).multiple) onClose();
                    }}
                  />
                ))
              )}
            </>
          )}
        </div>

        {/* Create new — scoped to the active type once one is chosen */}
        {onCreateNew && config && (
          <button
            onClick={() => {
              onClose();
              onCreateNew(activeType);
            }}
            className="w-full text-left px-3 py-2 border-t border-divider text-xs font-semibold text-primary hover:bg-action-hover flex items-center gap-1.5 transition-colors duration-150"
          >
            <Plus size={12} />
            Create new {config.labelSingular.toLowerCase()}
          </button>
        )}
      </div>
    </>
  );
}
