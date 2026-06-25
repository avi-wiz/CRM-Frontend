import { useMemo, useState } from "react";
import {
  CheckSquare, Plus, SlidersHorizontal, Search, CheckCircle,
  ArrowDown, Minus, ArrowUp, ChevronsUp,
} from "lucide-react";
import SideSheet from "../components/shared/SideSheet";
import RowActions from "../components/shared/RowActions";
import CreateTask from "../components/side-sheets/log/CreateTask";
import BulkCreateTask from "../components/side-sheets/BulkCreateTask";
import {
  formatDate, formatRelativeTime, isTaskOverdue, isToday,
  taskStatusStyles, taskPriorities, repNames,
} from "../data/constants";
import { useTasks, addTask, updateTask } from "../data/tasksStore";

const HEAD = ["Title", "Status", "Priority", "Assignee", "Company", "Due Date", "Created", ""];
const TABS = ["All", "Overdue", "Completed"];

const PRIORITY_ICONS = { ArrowDown, Minus, ArrowUp, ChevronsUp };

// Shows first rep name; if more reps exist, appends "+Y more" with a hover tooltip.
export function AssigneeCell({ assignees, assignee }) {
  const names = assignees?.length > 0 ? assignees : assignee?.repName ? [assignee.repName] : [];
  if (names.length === 0) return <span className="text-disabled">—</span>;
  const first = names[0];
  const extra = names.length - 1;
  return (
    <span className="inline-flex items-center gap-1">
      <span>{first}</span>
      {extra > 0 && (
        <span className="relative group cursor-default">
          <span className="text-xs font-medium text-primary bg-tonal px-1.5 py-0.5 rounded-full">
            +{extra} more
          </span>
          {/* Hover tooltip listing all names */}
          <span className="absolute left-0 top-6 z-30 hidden group-hover:flex flex-col gap-0.5 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap min-w-max">
            {names.map((n) => <span key={n}>{n}</span>)}
          </span>
        </span>
      )}
    </span>
  );
}

export function PriorityCell({ priority }) {
  const cfg = taskPriorities.find((p) => p.value === priority) || taskPriorities[0];
  const Icon = PRIORITY_ICONS[cfg.icon] || Minus;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: cfg.color }}>
      <Icon size={14} /> <span className="text-ink">{priority}</span>
    </span>
  );
}

// Tasks listing — table only, with filter tabs.
export default function TasksPage({ onTaskClick, onCompanyClick }) {
  const tasks = useTasks();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkCreateOpen, setBulkCreateOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      // Tab filter
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
      <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-ink tracking-tight">Tasks</h1>
          <span className="text-sm text-disabled">{tasks.length} tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkCreateOpen(true)}
            className="wiz-btn wiz-btn--secondary flex items-center gap-1.5 px-3.5 py-2"
          >
            <Plus size={15} /> Bulk Create
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="wiz-btn wiz-btn--primary flex items-center gap-1.5 px-3.5 py-2"
          >
            <Plus size={15} /> Create Task
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-8 border-b border-border bg-surface">
        {TABS.map((name) => (
          <button
            key={name}
            onClick={() => setTab(name)}
            className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === name
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {name}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === name ? "bg-tonal text-primary" : "bg-default text-muted"}`}>
              {tabCount(name)}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-8 py-3 border-b border-border bg-surface">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-disabled" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, company, or assignee…"
            className="wiz-input w-full pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <button className="wiz-btn wiz-btn--secondary flex items-center gap-1.5 px-3 py-2">
          <SlidersHorizontal size={14} /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-8 bg-default">
        <div className="bg-surface rounded-2xl border border-border shadow-2 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider bg-default">
                {HEAD.map((h, i) => (
                  <th key={i} className="py-3 px-4 text-left font-bold text-muted text-[10px] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={HEAD.length} className="py-12 text-center">
                    <div className="text-sm text-muted">No tasks found</div>
                    <div className="text-xs text-disabled mt-1">Try a different filter or create a task.</div>
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
                    className="hover:bg-action-hover cursor-pointer transition-colors duration-150"
                    onClick={() => onTaskClick?.(t.id)}
                  >
                    <td className="py-3 px-4">
                      <span className={`flex items-center gap-2 font-medium ${done ? "text-disabled" : "text-ink"}`}>
                        <CheckSquare size={14} className="text-primary flex-shrink-0" />
                        {t.title}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${taskStatusStyles[t.status] || "bg-default text-muted"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4"><PriorityCell priority={t.priority} /></td>
                    <td className="py-3 px-4 text-muted">
                      <AssigneeCell assignees={t.assignees} assignee={t.assignee} />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); onCompanyClick?.(t.associations?.companyId); }}
                        className="text-ink hover:text-primary hover:underline disabled:hover:no-underline disabled:hover:text-ink"
                        disabled={!t.associations?.companyId}
                      >
                        {t.associations?.companyName || "—"}
                      </button>
                    </td>
                    <td className={`py-3 px-4 ${overdue ? "text-danger font-medium" : dueToday ? "text-warning-dark" : "text-ink"}`}>
                      {formatDate(t.dueDate)}
                    </td>
                    <td className="py-3 px-4 text-muted">{formatRelativeTime(t.createdAt)}</td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <RowActions
                        actions={[
                          { label: "View Detail", onClick: () => onTaskClick?.(t.id) },
                          ...(done ? [] : [{ label: "Mark Complete", onClick: () => handleComplete(t) }]),
                          { label: "Reassign", onClick: () => setReassignTarget(t) },
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

      {/* ─── BULK CREATE TASK SIDE SHEET ─── */}
      <SideSheet open={bulkCreateOpen} onClose={() => setBulkCreateOpen(false)} title="Create Tasks" width="max-w-lg">
        {bulkCreateOpen && (
          <BulkCreateTask
            initialEntities={[]}
            onClose={() => setBulkCreateOpen(false)}
            onSave={(tasks) => {
              tasks.forEach((payload) => addTask(payload));
              setBulkCreateOpen(false);
              showToast(`${tasks.length} task${tasks.length === 1 ? "" : "s"} created`);
            }}
          />
        )}
      </SideSheet>

      {/* ─── REASSIGN SIDE SHEET ─── */}
      <SideSheet open={!!reassignTarget} onClose={() => setReassignTarget(null)} title="Reassign Task">
        {reassignTarget && (
          <div className="flex flex-col h-full">
            <p className="text-sm text-muted mb-1">Assign <span className="font-medium text-ink">{reassignTarget.title}</span> to:</p>
            <div className="flex-1 overflow-y-auto -mx-1 mt-2">
              {repNames.map((rep) => {
                const current = reassignTarget.assignee?.repName === rep;
                return (
                  <button
                    key={rep}
                    onClick={() => {
                      updateTask(reassignTarget.id, { assignee: { repName: rep } });
                      const title = reassignTarget.title;
                      setReassignTarget(null);
                      showToast(`"${title}" reassigned to ${rep}`);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${current ? "bg-action-selected text-primary-dark font-medium" : "text-ink hover:bg-action-hover"}`}
                  >
                    {rep}
                    {current && <span className="text-xs text-primary">Current</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </SideSheet>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-success flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
