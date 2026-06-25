import { useState, useRef, useEffect } from "react";
import { Search, Filter, Plus, List, LayoutGrid, ChevronDown, X } from "lucide-react";
import StageBadge from "../shared/StageBadge";
import RowActions from "../shared/RowActions";

export default function ListingPage({
  entityType,
  data,
  columns,
  onRowClick,
  onViewChange,
  viewMode,
  rowActions,
  onCreate,
  bulkActions = [],
}) {
  const [selected, setSelected] = useState([]);
  const allSelected = selected.length === data.length && data.length > 0;

  const singularName = entityType.endsWith("ies")
    ? entityType.slice(0, -3) + "y"
    : entityType.slice(0, -1);

  const renderCell = (col, row) => {
    const value = row[col.key];
    if (col.render === "stage_badge") return <StageBadge stage={value} small />;
    if (typeof col.render === "function") return col.render(value, row);
    return value;
  };

  const clearSelection = () => setSelected([]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-default">
      {/* Header — entity name + search on the left; actions on the right */}
      <div className="flex items-center justify-between gap-4 px-8 py-5 border-b border-border bg-surface">
        <div className="flex items-center gap-4 min-w-0">
          <h1 className="text-xl font-bold text-ink tracking-tight flex-shrink-0">{entityType}</h1>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-disabled" />
            <input
              placeholder={`Search ${entityType.toLowerCase()}...`}
              className="wiz-input pl-9 pr-3 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {onViewChange && (
            <div className="flex border border-border rounded-xl overflow-hidden mr-1 bg-default p-0.5">
              <button
                onClick={() => onViewChange("table")}
                className={`p-1.5 rounded-lg transition-all duration-200 ${viewMode === "table" ? "bg-surface text-primary shadow-1" : "text-disabled hover:text-muted hover:bg-action-hover"}`}
                title="Table view"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => onViewChange("kanban")}
                className={`p-1.5 rounded-lg transition-all duration-200 ${viewMode === "kanban" ? "bg-surface text-primary shadow-1" : "text-disabled hover:text-muted hover:bg-action-hover"}`}
                title="Kanban board"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          )}
          <button className="wiz-btn wiz-btn--secondary flex items-center gap-1.5">
            <Filter size={14} /> Filters
          </button>
          {selected.length > 1 && bulkActions.length > 0 && (
            <BulkActionsMenu
              count={selected.length}
              actions={bulkActions}
              onClear={clearSelection}
            />
          )}
          <button
            onClick={onCreate}
            className="wiz-btn wiz-btn--primary flex items-center gap-1.5"
          >
            <Plus size={15} /> Create {singularName}
          </button>
        </div>
      </div>

      {/* Table Card wrapper */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-surface rounded-2xl border border-border shadow-2 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider bg-default">
                <th className="py-3.5 pl-5 pr-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? [] : data.map((d) => d.id))}
                    className="rounded border-border accent-primary"
                  />
                </th>
                {columns.map((c) => (
                  <th key={c.key} className="py-3.5 px-3 text-left font-bold text-muted text-[10px] uppercase tracking-wider">
                    {c.label}
                  </th>
                ))}
                <th className="py-3.5 px-5 text-right w-14 min-w-[3.5rem]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 2} className="py-16 text-center">
                    <div className="text-sm font-semibold text-muted">No {entityType.toLowerCase()} found</div>
                    <div className="text-xs text-disabled mt-1">
                      Try adjusting your filters or create a new {singularName.toLowerCase()}.
                    </div>
                  </td>
                </tr>
              )}
              {data.map((row) => (
                <tr
                  key={row.id}
                  className={`group/row hover:bg-action-hover cursor-pointer transition-all duration-200 ${selected.includes(row.id) ? "bg-action-selected" : ""
                    }`}
                  onClick={() => onRowClick?.(row)}
                >
                  <td className="py-3.5 pl-5 pr-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => setSelected((s) => s.includes(row.id) ? s.filter((x) => x !== row.id) : [...s, row.id])}
                      className="rounded border-border accent-primary"
                    />
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className="py-3.5 px-3 text-ink">
                      {renderCell(c, row)}
                    </td>
                  ))}
                  <td className="py-3.5 px-5 w-14 min-w-[3.5rem]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end">
                      <RowActions actions={typeof rowActions === "function" ? rowActions(row) : rowActions} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Bulk Actions dropdown CTA — shown in the header only when rows are selected.
// Each action is called with (count, "selected"); a danger flag styles it red.
function BulkActionsMenu({ count, actions, onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="wiz-btn wiz-btn--secondary flex items-center gap-1.5"
      >
        Bulk Actions
        <span className="text-xs font-bold bg-primary text-white rounded-full px-1.5 py-0.5 leading-none">{count}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-30 bg-surface border border-border rounded-xl shadow-2 py-1 w-52 overflow-hidden">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider border-b border-divider">
            {count} selected
          </div>
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => { setOpen(false); action.onClick?.(count, "selected"); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${action.danger ? "text-red-600 hover:bg-red-50" : "text-ink hover:bg-action-hover"}`}
            >
              {action.label}
            </button>
          ))}
          <button
            onClick={() => { setOpen(false); onClear(); }}
            className="w-full flex items-center gap-1.5 px-3 py-2 text-sm text-disabled hover:bg-action-hover border-t border-divider"
          >
            <X size={13} /> Clear selection
          </button>
        </div>
      )}
    </div>
  );
}
