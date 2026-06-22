import { useState, useEffect } from "react";
import {
  ArrowLeft, MoreHorizontal, Edit2, CheckCircle, Building2, DollarSign,
  Mail, Calendar, CheckSquare, Send,
} from "lucide-react";
import StageBadge from "../components/shared/StageBadge";
import { PriorityCell } from "./TasksPage";
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
      <div className="px-8 py-4 border-b border-gray-150 bg-white">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3">
          <ArrowLeft size={15} /> Back to Tasks
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={`text-lg font-semibold truncate ${done ? "text-gray-400" : "text-gray-900"}`}>{task.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${taskStatusStyles[task.status] || "bg-gray-100 text-gray-600"}`}>
                {task.status}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${taskPriorityStyles[task.priority] || "bg-gray-100 text-gray-600"}`}>
                {task.priority}
              </span>
            </div>
            <div className="mt-1.5 text-sm">
              <span className={overdue ? "text-red-600 font-medium" : dueToday ? "text-amber-600" : "text-gray-500"}>
                Due {formatDate(task.dueDate)}{overdue ? " · Overdue" : dueToday ? " · Today" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!done && (
              <button onClick={() => handleStatus("Completed")} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm transition-all duration-200">
                <CheckCircle size={14} /> Mark Complete
              </button>
            )}
            <button onClick={() => showToast("Edit — coming soon")} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Edit2 size={14} /> Edit
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen((o) => !o)} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500">
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-11 z-30 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-40">
                    <button onClick={() => { setMenuOpen(false); showToast("Reassign — coming soon"); }} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Reassign</button>
                    <button onClick={() => { setMenuOpen(false); handleStatus("Cancelled"); }} className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Cancel Task</button>
                    <button onClick={() => { setMenuOpen(false); showToast("Delete — coming soon"); }} className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Body: 2-column ─── */}
      <div className="flex-1 overflow-auto bg-[#f8fafc] p-8">
        <div className="flex gap-6 max-w-6xl">
          {/* Left column (~60%) */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Description */}
            <Card title="Description">
              {task.description ? (
                <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
              ) : (
                <p className="text-sm text-gray-400 py-1">No description provided.</p>
              )}
            </Card>

            {/* Activity Log */}
            <Card title="Activity Log">
              <div className="space-y-3">
                {log.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-700">{entry.text}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{entry.time}</div>
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
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0">
                      {initials(c.author)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">{c.author}</span>
                        <span className="text-xs text-gray-400">{c.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="Add a comment…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handlePostComment}
                    disabled={!draft.trim()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      draft.trim() ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
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
                  <dt className="text-gray-400">Status</dt>
                  <dd>
                    <select value={task.status} onChange={(e) => handleStatus(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300">
                      {taskStatuses.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-gray-400">Priority</dt>
                  <dd>
                    <select value={task.priority} onChange={(e) => { updateTask(task.id, { priority: e.target.value }); showToast(`Priority set to ${e.target.value}`); }} className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300">
                      {taskPriorities.map((p) => <option key={p.value}>{p.value}</option>)}
                    </select>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-gray-400">Assignee</dt>
                  <dd className="flex items-center gap-2">
                    <span className="text-gray-800">{task.assignee?.repName || "—"}</span>
                    <button onClick={() => showToast("Reassign — coming soon")} className="text-xs font-semibold text-indigo-500 hover:text-indigo-700">Reassign</button>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-gray-400">Due Date</dt>
                  <dd className="flex items-center gap-2">
                    <span className={overdue ? "text-red-600 font-medium" : "text-gray-800"}>{formatDate(task.dueDate)}</span>
                    <button onClick={() => showToast("Change due date — coming soon")} className="text-xs font-semibold text-indigo-500 hover:text-indigo-700">Change</button>
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
                  <button onClick={() => onCompanyClick?.(assoc.companyId)} className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-150 hover:border-indigo-100 hover:bg-indigo-50/40 text-left transition-all">
                    <Building2 size={15} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">Company</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-800 truncate">{assoc.companyName}</span>
                        {company && <StageBadge stage={company.stage} small />}
                      </div>
                    </div>
                  </button>
                )}

                {/* Contacts */}
                {(assoc.contactIds || []).map((ct) => {
                  const full = contactById(ct.contactId);
                  return (
                    <button key={ct.contactId} onClick={() => onContactClick?.(ct.contactId)} className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-150 hover:border-indigo-100 hover:bg-indigo-50/40 text-left transition-all">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0">
                        {initials(ct.contactName)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{ct.contactName}</div>
                        {full?.email && <div className="text-xs text-gray-400 truncate flex items-center gap-1"><Mail size={10} /> {full.email}</div>}
                      </div>
                    </button>
                  );
                })}

                {/* Deal */}
                {assoc.dealId && (
                  <button onClick={() => onDealClick?.(assoc.dealId)} className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-150 hover:border-indigo-100 hover:bg-indigo-50/40 text-left transition-all">
                    <DollarSign size={15} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">Deal</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-800 truncate">{assoc.dealName}</span>
                        {linkedDeal && <span className="text-xs font-semibold text-gray-600">{linkedDeal.amount}</span>}
                      </div>
                    </div>
                  </button>
                )}

                {/* Meeting (follow-up source) */}
                {assoc.meetingId && (
                  <button onClick={() => onMeetingClick?.(assoc.meetingId)} className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-150 hover:border-indigo-100 hover:bg-indigo-50/40 text-left transition-all">
                    <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400">Follow-up from</div>
                      <div className="text-sm text-gray-800 truncate">{assoc.meetingTitle}</div>
                    </div>
                  </button>
                )}

                {!assoc.companyId && !(assoc.contactIds || []).length && !assoc.dealId && !assoc.meetingId && (
                  <p className="text-sm text-gray-400 py-1">No associations</p>
                )}
              </div>
            </Card>

            {/* Related Tasks */}
            {relatedTasks.length > 0 && (
              <Card title="Related Tasks">
                <div className="space-y-2">
                  {relatedTasks.map((rt) => (
                    <button key={rt.id} onClick={() => onTaskClick?.(rt.id)} className="w-full flex items-start justify-between gap-2 p-2.5 rounded-xl border border-gray-150 hover:border-indigo-100 hover:bg-indigo-50/40 text-left transition-all">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{rt.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{rt.assignee?.repName}</div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${taskStatusStyles[rt.status] || "bg-gray-100 text-gray-600"}`}>{rt.status}</span>
                    </button>
                  ))}
                </div>
                {assoc.companyId && (
                  <button onClick={() => onCompanyClick?.(assoc.companyId)} className="mt-3 text-xs font-semibold text-indigo-500 hover:text-indigo-700">
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
          <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
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
    <div className="bg-white rounded-2xl border border-gray-150 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-5">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-gray-800 text-right truncate">{value}</dd>
    </div>
  );
}

function contactById(id) {
  return contacts.find((c) => c.id === id) || null;
}

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
