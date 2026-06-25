import { useState, useEffect } from "react";
import {
  ArrowLeft, MoreHorizontal, Edit2, CheckCircle, Building2, DollarSign,
  Mail, Calendar, CheckSquare, Send,
} from "lucide-react";
import StageBadge from "../components/shared/StageBadge";
import { PriorityCell, AssigneeCell } from "./TasksPage";
import {
  formatDate, getTaskCompany, isTaskOverdue, isToday,
  taskStatusStyles, taskStatuses, taskPriorities, taskPriorityStyles,
  deals, contacts,
} from "../data/constants";
import { useTask, useTasks, updateTask } from "../data/tasksStore";

// Sample comments seeded per task (session-only additions appended below).
function seedComments(task) {
  return [
    { id: 1, author: task.createdBy, time: formatDate(task.createdAt), text: "Created this task and assigned ownership." },
    { id: 2, author: task.assignee?.repName || "Team", time: formatDate(task.createdAt), text: "Picked this up — will start outreach shortly." },
  ];
}

export default function TaskDetailPage({ taskId, onBack, onCompanyClick, onContactClick, onDealClick, onMeetingClick, onTaskClick }) {
  const all = useTasks();
  const task = useTask(taskId) || all[0];

  const [company, setCompany] = useState(getTaskCompany(task));
  useEffect(() => { setCompany(getTaskCompany(task)); }, [task.id]);

  const [comments, setComments] = useState(seedComments(task));
  const [draft, setDraft] = useState("");
  useEffect(() => { setComments(seedComments(task)); setDraft(""); }, [task.id]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const assoc = task.associations || {};
  const overdue = isTaskOverdue(task);
  const dueToday = isToday(task.dueDate) && task.status !== "Completed" && task.status !== "Cancelled";
  const done = task.status === "Completed" || task.status === "Cancelled";

  const linkedDeal = assoc.dealId ? deals.find((d) => d.id === assoc.dealId) : null;
  const relatedTasks = all.filter(
    (t) => t.id !== task.id && (
      (assoc.companyId && t.associations?.companyId === assoc.companyId) ||
      (assoc.dealId && t.associations?.dealId === assoc.dealId)
    )
  ).slice(0, 3);

  const log = buildActivityLog(task);

  const handleStatus = (status) => {
    const patch = { status };
    if (status === "Completed") patch.completedAt = new Date().toISOString().slice(0, 10);
    updateTask(task.id, patch);
    showToast(`Status changed to ${status}`);
  };

  const handlePostComment = () => {
    if (!draft.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: Math.max(0, ...prev.map((c) => c.id)) + 1, author: "You", time: "Just now", text: draft.trim() },
    ]);
    setDraft("");
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── Header ─── */}
      <div className="px-8 py-4 border-b border-divider bg-surface">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-3">
          <ArrowLeft size={15} /> Back to Tasks
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={`text-lg font-semibold truncate ${done ? "text-disabled" : "text-ink"}`}>{task.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${taskStatusStyles[task.status] || "bg-default text-muted"}`}>
                {task.status}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${taskPriorityStyles[task.priority] || "bg-default text-muted"}`}>
                {task.priority}
              </span>
            </div>
            <div className="mt-1.5 text-sm">
              <span className={overdue ? "text-danger-dark font-medium" : dueToday ? "text-warning-dark" : "text-muted"}>
                Due {formatDate(task.dueDate)}{overdue ? " · Overdue" : dueToday ? " · Today" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!done && (
              <button onClick={() => handleStatus("Completed")} className="wiz-btn flex items-center gap-1.5 bg-success text-white hover:bg-success-dark border-success">
                <CheckCircle size={14} /> Mark Complete
              </button>
            )}
            <button onClick={() => showToast("Edit — coming soon")} className="wiz-btn wiz-btn--secondary flex items-center gap-1.5">
              <Edit2 size={14} /> Edit
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen((o) => !o)} className="p-2 rounded-xl border border-border hover:bg-action-hover text-muted">
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-11 z-30 bg-surface border border-border rounded-xl shadow-3 py-1 w-40">
                    <button onClick={() => { setMenuOpen(false); showToast("Reassign — coming soon"); }} className="w-full text-left px-3 py-1.5 text-sm text-muted hover:bg-action-hover">Reassign</button>
                    <button onClick={() => { setMenuOpen(false); handleStatus("Cancelled"); }} className="w-full text-left px-3 py-1.5 text-sm text-muted hover:bg-action-hover">Cancel Task</button>
                    <button onClick={() => { setMenuOpen(false); showToast("Delete — coming soon"); }} className="w-full text-left px-3 py-1.5 text-sm text-danger-dark hover:bg-danger-bg">Delete</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Body: 2-column ─── */}
      <div className="flex-1 overflow-auto bg-default p-8">
        <div className="flex gap-6 max-w-6xl">
          {/* Left column (~60%) */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Description */}
            <Card title="Description">
              {task.description ? (
                <p className="text-sm text-ink leading-relaxed">{task.description}</p>
              ) : (
                <p className="text-sm text-disabled py-1">No description provided.</p>
              )}
            </Card>

            {/* Activity Log */}
            <Card title="Activity Log">
              <div className="space-y-3">
                {log.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-ink">{entry.text}</div>
                      <div className="text-xs text-disabled mt-0.5">{entry.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Comments */}
            <Card title="Comments">
              <div className="space-y-3 mb-4">
                {comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0">
                      {initials(c.author)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink">{c.author}</span>
                        <span className="text-xs text-disabled">{c.time}</span>
                      </div>
                      <p className="text-sm text-muted mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-divider pt-3">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="Add a comment…"
                  className="wiz-input w-full resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handlePostComment}
                    disabled={!draft.trim()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      draft.trim() ? "bg-primary text-white hover:bg-primary-dark" : "bg-default text-disabled cursor-not-allowed"
                    }`}
                  >
                    <Send size={13} /> Post
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column (~40%) */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Details */}
            <Card title="Details">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-disabled">Status</dt>
                  <dd>
                    <select value={task.status} onChange={(e) => handleStatus(e.target.value)} className="wiz-input text-xs">
                      {taskStatuses.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-disabled">Priority</dt>
                  <dd>
                    <select value={task.priority} onChange={(e) => { updateTask(task.id, { priority: e.target.value }); showToast(`Priority set to ${e.target.value}`); }} className="wiz-input text-xs">
                      {taskPriorities.map((p) => <option key={p.value}>{p.value}</option>)}
                    </select>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-disabled">Assignee</dt>
                  <dd className="flex items-center gap-2">
                    <AssigneeCell assignees={task.assignees} assignee={task.assignee} />
                    <button onClick={() => showToast("Reassign — coming soon")} className="text-xs font-semibold text-primary hover:text-primary-dark">Reassign</button>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-disabled">Due Date</dt>
                  <dd className="flex items-center gap-2">
                    <span className={overdue ? "text-danger-dark font-medium" : "text-ink"}>{formatDate(task.dueDate)}</span>
                    <button onClick={() => showToast("Change due date — coming soon")} className="text-xs font-semibold text-primary hover:text-primary-dark">Change</button>
                  </dd>
                </div>
                <Row label="Created By" value={task.createdBy} />
                <Row label="Created" value={formatDate(task.createdAt)} />
                <Row label="Completed" value={task.completedAt ? formatDate(task.completedAt) : "—"} />
              </dl>
            </Card>

            {/* Associations */}
            <Card title="Associations">
              <div className="space-y-2">
                {/* Company */}
                {assoc.companyId && (
                  <button onClick={() => onCompanyClick?.(assoc.companyId)} className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-border hover:border-primary hover:bg-action-hover text-left transition-all">
                    <Building2 size={15} className="text-disabled flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-wide text-disabled">Company</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-ink truncate">{assoc.companyName}</span>
                        {company && <StageBadge stage={company.stage} small />}
                      </div>
                    </div>
                  </button>
                )}

                {/* Contacts */}
                {(assoc.contactIds || []).map((ct) => {
                  const full = contactById(ct.contactId);
                  return (
                    <button key={ct.contactId} onClick={() => onContactClick?.(ct.contactId)} className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-border hover:border-primary hover:bg-action-hover text-left transition-all">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0">
                        {initials(ct.contactName)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink truncate">{ct.contactName}</div>
                        {full?.email && <div className="text-xs text-disabled truncate flex items-center gap-1"><Mail size={10} /> {full.email}</div>}
                      </div>
                    </button>
                  );
                })}

                {/* Deal */}
                {assoc.dealId && (
                  <button onClick={() => onDealClick?.(assoc.dealId)} className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-border hover:border-primary hover:bg-action-hover text-left transition-all">
                    <DollarSign size={15} className="text-disabled flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-wide text-disabled">Deal</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-ink truncate">{assoc.dealName}</span>
                        {linkedDeal && <span className="text-xs font-semibold text-muted">{linkedDeal.amount}</span>}
                      </div>
                    </div>
                  </button>
                )}

                {/* Meeting (follow-up source) */}
                {assoc.meetingId && (
                  <button onClick={() => onMeetingClick?.(assoc.meetingId)} className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-border hover:border-primary hover:bg-action-hover text-left transition-all">
                    <Calendar size={15} className="text-disabled flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-disabled">Follow-up from</div>
                      <div className="text-sm text-ink truncate">{assoc.meetingTitle}</div>
                    </div>
                  </button>
                )}

                {!assoc.companyId && !(assoc.contactIds || []).length && !assoc.dealId && !assoc.meetingId && (
                  <p className="text-sm text-disabled py-1">No associations</p>
                )}
              </div>
            </Card>

            {/* Related Tasks */}
            {relatedTasks.length > 0 && (
              <Card title="Related Tasks">
                <div className="space-y-2">
                  {relatedTasks.map((rt) => (
                    <button key={rt.id} onClick={() => onTaskClick?.(rt.id)} className="w-full flex items-start justify-between gap-2 p-2.5 rounded-xl border border-border hover:border-primary hover:bg-action-hover text-left transition-all">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink truncate">{rt.title}</div>
                        <div className="text-xs text-disabled mt-0.5">{rt.assignee?.repName}</div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${taskStatusStyles[rt.status] || "bg-default text-muted"}`}>{rt.status}</span>
                    </button>
                  ))}
                </div>
                {assoc.companyId && (
                  <button onClick={() => onCompanyClick?.(assoc.companyId)} className="mt-3 text-xs font-semibold text-primary hover:text-primary-dark">
                    View all tasks for {assoc.companyName} →
                  </button>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-success flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}

function buildActivityLog(task) {
  const entries = [{ text: `Task created by ${task.createdBy}`, time: formatDate(task.createdAt) }];
  if (task.associations?.meetingId) {
    entries.push({ text: `Linked as follow-up from "${task.associations.meetingTitle}"`, time: formatDate(task.createdAt) });
  }
  if (task.status === "In Progress") entries.push({ text: "Status changed to In Progress", time: formatDate(task.createdAt) });
  if (task.status === "Completed" && task.completedAt) entries.push({ text: `Task completed by ${task.assignee?.repName}`, time: formatDate(task.completedAt) });
  if (task.status === "Cancelled") entries.push({ text: "Task cancelled", time: formatDate(task.createdAt) });
  return entries;
}

function Card({ title, children }) {
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-2 p-5">
      <h3 className="text-xs font-bold text-disabled uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-disabled">{label}</dt>
      <dd className="text-ink text-right truncate">{value}</dd>
    </div>
  );
}

function contactById(id) {
  return contacts.find((c) => c.id === id) || null;
}

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
