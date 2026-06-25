import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, CheckSquare } from "lucide-react";

/**
 * BulkToolbar — fixed bottom bar that slides up when rows are selected.
 *
 * Props:
 *   count        – number of selected rows
 *   totalCount   – total records matching current filters
 *   actions      – array of action configs (see shape below)
 *   onClear      – clears the selection
 *   scope        – "selected" | "all"
 *   onScopeChange
 *
 * Action config shape:
 *   { label, icon?, onClick, danger?, overflow? }
 *   overflow: true  → goes into the "More ▾" dropdown
 */
export default function BulkToolbar({ count, totalCount, actions = [], onClear, scope = "selected", onScopeChange }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const effectiveCount = scope === "all" ? totalCount : count;

  // Close "More" dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e) => { if (!moreRef.current?.contains(e.target)) setMoreOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  const primaryActions = actions.filter((a) => !a.overflow);
  const overflowActions = actions.filter((a) => a.overflow);

  const visible = count > 0;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border shadow-3 transition-transform duration-200 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 py-3 flex flex-col gap-2">
        {/* Row 1: count + actions + clear */}
        <div className="flex items-center justify-between">
          {/* Left: checkbox icon + count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
              <CheckSquare size={15} className="text-primary" />
              <span>
                <span className="font-semibold text-primary-dark">{effectiveCount}</span>{" "}
                {effectiveCount === 1 ? "record" : "records"} selected
              </span>
            </div>

            {/* Divider */}
            <span className="w-px h-4 bg-divider" />

            {/* Primary action buttons */}
            <div className="flex items-center gap-1.5">
              {primaryActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => action.onClick(effectiveCount, scope)}
                  className={`wiz-btn wiz-btn--sm ${action.danger ? "wiz-btn--danger" : "wiz-btn--secondary"}`}
                >
                  {action.icon && <action.icon size={12} />}
                  {action.label}
                </button>
              ))}

              {/* Overflow "More" dropdown */}
              {overflowActions.length > 0 && (
                <div className="relative" ref={moreRef}>
                  <button
                    onClick={() => setMoreOpen((o) => !o)}
                    className="wiz-btn wiz-btn--sm wiz-btn--secondary"
                  >
                    More <ChevronDown size={11} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
                  </button>
                  {moreOpen && (
                    <div className="absolute bottom-full mb-1.5 left-0 w-52 bg-surface rounded-xl border border-border shadow-2 py-1 z-50">
                      {overflowActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => { setMoreOpen(false); action.onClick(effectiveCount, scope); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-action-hover transition-colors ${
                            action.danger ? "text-red-600" : "text-muted"
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: clear */}
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-disabled hover:text-muted transition-colors"
          >
            <X size={13} /> Clear selection
          </button>
        </div>

        {/* Row 2: scope radio */}
        {onScopeChange && (
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="font-medium text-muted">Apply to:</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="bulk-scope"
                checked={scope === "selected"}
                onChange={() => onScopeChange("selected")}
                className="accent-primary"
              />
              <span className={scope === "selected" ? "text-primary-dark font-medium" : ""}>
                Selected ({count})
              </span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="bulk-scope"
                checked={scope === "all"}
                onChange={() => onScopeChange("all")}
                className="accent-primary"
              />
              <span className={scope === "all" ? "text-primary-dark font-medium" : ""}>
                All matching ({totalCount})
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
