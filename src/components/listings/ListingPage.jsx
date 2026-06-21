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
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <h1 className="text-lg font-semibold text-gray-900">{entityType}</h1>
        <div className="flex items-center gap-2">
          {onViewChange && (
            <div className="flex border border-gray-200 rounded-lg overflow-hidden mr-2">
              <button onClick={() => onViewChange("table")} className={`p-1.5 ${viewMode === "table" ? "bg-gray-100" : "hover:bg-gray-50"}`}>
                <List size={16} />
              </button>
              <button onClick={() => onViewChange("kanban")} className={`p-1.5 ${viewMode === "kanban" ? "bg-gray-100" : "hover:bg-gray-50"}`}>
                <LayoutGrid size={16} />
              </button>
            </div>
          )}
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-2 text-gray-400" />
            <input
              placeholder={`Search ${entityType.toLowerCase()}...`}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg w-56 focus:outline-none focus:ring-1 focus:ring-indigo-300"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter size={14} />Filters
          </button>
          <button onClick={onCreate} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Plus size={14} />Create {singularName}
          </button>
        </div>
      </div>

      {/* Table — add bottom padding so the fixed toolbar doesn't overlap last rows */}
      <div className="flex-1 overflow-auto px-6 pb-24">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-2.5 pr-3 text-left w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => setSelected(allSelected ? [] : data.map((d) => d.id))}
                  className="rounded border-gray-300"
                />
              </th>
              {columns.map((c) => (
                <th key={c.key} className="py-2.5 px-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
                  {c.label}
                </th>
              ))}
              <th className="py-2.5 px-3 text-right w-10"></th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="py-12 text-center">
                  <div className="text-sm text-gray-500">No {entityType.toLowerCase()} found</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Try adjusting your filters or create a new {singularName.toLowerCase()}.
                  </div>
                </td>
              </tr>
            )}
            {data.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors ${
                  selected.includes(row.id) ? "bg-indigo-50/40" : ""
                }`}
                onClick={() => onRowClick?.(row)}
              >
                <td className="py-2.5 pr-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.includes(row.id)}
                    onChange={() => setSelected((s) => s.includes(row.id) ? s.filter((x) => x !== row.id) : [...s, row.id])}
                    className="rounded border-gray-300"
                  />
                </td>
                {columns.map((c) => (
                  <td key={c.key} className="py-2.5 px-3 text-gray-700">
                    {renderCell(c, row)}
                  </td>
                ))}
                <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <RowActions actions={typeof rowActions === "function" ? rowActions(row) : rowActions} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fixed bottom bulk toolbar — always rendered, slides in/out via CSS */}
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
