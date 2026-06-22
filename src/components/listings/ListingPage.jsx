import { useState } from "react";
import { Search, Filter, Plus, List, LayoutGrid } from "lucide-react";
import StageBadge from "../shared/StageBadge";
import BulkToolbar from "../shared/BulkToolbar";
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
  const [bulkScope, setBulkScope] = useState("selected");
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

  const clearSelection = () => { setSelected([]); setBulkScope("selected"); };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-150 bg-white">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">{entityType}</h1>
        <div className="flex items-center gap-3">
          {onViewChange && (
            <div className="flex border border-gray-200 rounded-xl overflow-hidden mr-1 bg-gray-50 p-0.5">
              <button
                onClick={() => onViewChange("table")}
                className={`p-1.5 rounded-lg transition-all duration-200 ${viewMode === "table" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"}`}
                title="Table view"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => onViewChange("kanban")}
                className={`p-1.5 rounded-lg transition-all duration-200 ${viewMode === "kanban" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"}`}
                title="Kanban board"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          )}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              placeholder={`Search ${entityType.toLowerCase()}...`}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl w-60 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all duration-200"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 shadow-sm">
            <Filter size={14} /> Filters
          </button>
          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 shadow-sm hover:shadow-[0_4px_12px_rgba(99,102,241,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Plus size={15} /> Create {singularName}
          </button>
        </div>
      </div>

      {/* Table Card wrapper */}
      <div className="flex-1 overflow-auto px-8 py-6 pb-24">
        <div className="bg-white rounded-2xl border border-gray-150 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-50/70">
                <th className="py-3.5 pl-5 pr-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? [] : data.map((d) => d.id))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20"
                  />
                </th>
                {columns.map((c) => (
                  <th key={c.key} className="py-3.5 px-3 text-left font-bold text-gray-400 text-[10px] uppercase tracking-wider">
                    {c.label}
                  </th>
                ))}
                <th className="py-3.5 px-5 text-right w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 2} className="py-16 text-center">
                    <div className="text-sm font-semibold text-gray-500">No {entityType.toLowerCase()} found</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Try adjusting your filters or create a new {singularName.toLowerCase()}.
                    </div>
                  </td>
                </tr>
              )}
              {data.map((row) => (
                <tr
                  key={row.id}
                  className={`group/row hover:bg-slate-50/50 cursor-pointer transition-all duration-200 ${
                    selected.includes(row.id) ? "bg-indigo-50/30 hover:bg-indigo-50/40" : ""
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  <td className="py-3.5 pl-5 pr-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => setSelected((s) => s.includes(row.id) ? s.filter((x) => x !== row.id) : [...s, row.id])}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20"
                    />
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className="py-3.5 px-3 text-gray-700">
                      {renderCell(c, row)}
                    </td>
                  ))}
                  <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <RowActions actions={typeof rowActions === "function" ? rowActions(row) : rowActions} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BulkToolbar
        count={selected.length}
        totalCount={data.length}
        actions={bulkActions}
        onClear={clearSelection}
        scope={bulkScope}
        onScopeChange={setBulkScope}
      />
    </div>
  );
}
