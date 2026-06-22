import { useMemo, useState } from "react";
import {
  CheckSquare, Plus, SlidersHorizontal, Search, CheckCircle,
  ArrowDown, Minus, ArrowUp, ChevronsUp,
} from "lucide-react";
import SideSheet from "../components/shared/SideSheet";
import RowActions from "../components/shared/RowActions";
import CreateTask from "../components/side-sheets/log/CreateTask";
import {
  formatDate, formatRelativeTime, isTaskOverdue, isToday,
  taskStatusStyles, taskPriorities,
} from "../data/constants";
import { useTasks, addTask, updateTask } from "../data/tasksStore";

const HEAD = ["Title", "Status", "Priority", "Assignee", "Company", "Due Date", "Created", ""];
const DEFAULT_REP = "Tyler Jones"; // "My Tasks" proxy for the current user
const TABS = ["All", "My Tasks", "Overdue", "Completed"];

const PRIORITY_ICONS = { ArrowDown, Minus, ArrowUp, ChevronsUp };

export function PriorityCell({ priority }) {
  const cfg = taskPriorities.find((p) => p.value === priority) || taskPriorities[0];
  const Icon = PRIORITY_ICONS[cfg.icon] || Minus;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: cfg.color }}>
      <Icon size={14} /> <span className="text-gray-700">{priority}</span>
    </span>
  );
}

// Tasks listing — table only, with filter tabs.
export default function TasksPage({ onTaskClick, onCompanyClick }) {
  const tasks = useTasks();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      // Tab filter
      if (tab === "My Tasks" && t.assignee?.repName !== DEFAULT_REP) return false;
      if (tab === "Overdue" && !isTaskOverdue(t)) return false;
      if (tab === "Completed" && t.status !== "Completed") return false;
      // Search filter
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        (t.associations?.companyName || "").toLowerCase().includes(q) ||
        (t.assignee?.repName || "").toLowerCase().includes(q)
      );
    });
  }, [tasks, query, tab]);

  const tabCount = (name) => {
    if (name === "All") return tasks.length;
    if (name === "My Tasks") return tasks.filter((t) => t.assignee?.repName === DEFAULT_REP).length;
    if (name === "Overdue") return tasks.filter(isTaskOverdue).length;
    if (name === "Completed") return tasks.filter((t) => t.status === "Completed").length;
    return 0;
  };

  const handleComplete = (t) => {
    updateTask(t.id, { status: "Completed", completedAt: new Date().toISOString().slice(0, 10) });
    showToast(`"${t.title}" marked complete`);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-150 bg-white">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Tasks</h1>
          <span className="text-sm text-gray-400">{tasks.length} tasks</span>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-all duration-200"
        >
          <Plus size={15} /> Create Task
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-8 border-b border-gray-150 bg-white">
        {TABS.map((name) => (
          <button
            key={name}
            onClick={() => setTab(name)}
            className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === name
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {name}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === name ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-500"}`}>
              {tabCount(name)}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-8 py-3 border-b border-gray-150 bg-white">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, company, or assignee…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <SlidersHorizontal size={14} /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-8 bg-[#f8fafc]">
        <div className="bg-white rounded-2xl border border-gray-150 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-50/70">
                {HEAD.map((h, i) => (
                  <th key={i} className="py-3 px-4 text-left font-bold text-gray-400 text-[10px] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={HEAD.length} className="py-12 text-center">
                    <div className="text-sm text-gray-500">No tasks found</div>
                    <div className="text-xs text-gray-400 mt-1">Try a different filter or create a task.</div>
                  </td>
                </tr>
              )}
              {filtered.map((t) => {
                const overdue = isTaskOverdue(t);
                const dueToday = isToday(t.dueDate) && t.status !== "Completed" && t.status !== "Cancelled";
                const done = t.status === "Completed" || t.status === "Cancelled";
                return (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors duration-150"
                    onClick={() => onTaskClick?.(t.id)}
                  >
                    <td className="py-3 px-4">
                      <span className={`flex items-center gap-2 font-medium ${done ? "text-gray-400" : "text-gray-900"}`}>
                        <CheckSquare size={14} className="text-indigo-500 flex-shrink-0" />
                        {t.title}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${taskStatusStyles[t.status] || "bg-gray-100 text-gray-600"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4"><PriorityCell priority={t.priority} /></td>
                    <td className="py-3 px-4 text-gray-600">{t.assignee?.repName || "—"}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); onCompanyClick?.(t.associations?.companyId); }}
                        className="text-gray-700 hover:text-indigo-600 hover:underline disabled:hover:no-underline disabled:hover:text-gray-700"
                        disabled={!t.associations?.companyId}
                      >
                        {t.associations?.companyName || "—"}
                      </button>
                    </td>
                    <td className={`py-3 px-4 ${overdue ? "text-red-600 font-medium" : dueToday ? "text-amber-600" : "text-gray-700"}`}>
                      {formatDate(t.dueDate)}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{formatRelativeTime(t.createdAt)}</td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <RowActions
                        actions={[
                          { label: "View Detail", onClick: () => onTaskClick?.(t.id) },
                          ...(done ? [] : [{ label: "Mark Complete", onClick: () => handleComplete(t) }]),
                          { label: "Reassign", onClick: () => showToast("Reassign — coming soon") },
                          ...(done ? [] : [{ label: "Cancel", onClick: () => { updateTask(t.id, { status: "Cancelled" }); showToast(`"${t.title}" cancelled`); } }]),
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── CREATE TASK SIDE SHEET ─── */}
      <SideSheet open={createOpen} onClose={() => setCreateOpen(false)} title="Create Task" width="max-w-lg">
        {createOpen && (
          <CreateTask
            entity={null}
            onClose={() => setCreateOpen(false)}
            onSave={(payload) => {
              // CreateTask emits one payload per assignee — add each.
              const created = addTask(payload);
              setCreateOpen(false);
              showToast(`"${created.title}" created`);
            }}
          />
        )}
      </SideSheet>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
