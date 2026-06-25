import { useState, useEffect } from "react";
import {
  ArrowLeft, MapPin, MoreHorizontal, Edit2, FileText, CheckSquare,
  Calendar, Clock, Building2, DollarSign, User, CheckCircle, Mail,
} from "lucide-react";
import SideSheet from "../components/shared/SideSheet";
import CreateTask from "../components/side-sheets/log/CreateTask";
import {
  formatDate, formatDuration, getMeetingCompany,
  meetingOutcomeStyles, meetingOutcomes, repNames,
} from "../data/constants";
import { useMeeting, useMeetings, updateMeeting } from "../data/meetingsStore";

const PRIORITY_STYLES = {
  Low: "bg-default text-muted",
  Medium: "bg-info-bg text-info-dark",
  High: "bg-warning-bg text-warning-dark",
  Urgent: "bg-danger-bg text-danger-dark",
};

// Meeting detail — 2-column layout (not the standard 3-panel).
export default function MeetingDetailPage({ meetingId, onBack, onCompanyClick, onContactClick, onDealClick }) {
  const all = useMeetings();
  const meeting = useMeeting(meetingId) || all[0];

  const [company, setCompany] = useState(getMeetingCompany(meeting));
  useEffect(() => { setCompany(getMeetingCompany(meeting)); }, [meeting.id]);

  const [tasks, setTasks] = useState([]); // session follow-up tasks for this meeting
  const [taskOpen, setTaskOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Seed an activity log from the meeting record (sample entries).
  const log = buildActivityLog(meeting);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOutcomeChange = (outcome) => {
    updateMeeting(meeting.id, { outcome });
    showToast(`Outcome set to ${outcome}`);
  };

  const externalAttendees = meeting.attendees || [];
  const internalAttendees = meeting.internalAttendees || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── Header ─── */}
      <div className="px-8 py-4 border-b border-divider bg-surface">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-3">
          <ArrowLeft size={15} /> Back to Meetings
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-ink truncate">{meeting.title}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${meetingOutcomeStyles[meeting.outcome] || "bg-default text-muted"}`}>
                {meeting.outcome}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-muted">
              <span className="flex items-center gap-1.5"><Calendar size={13} className="text-disabled" /> {formatDate(meeting.date)}</span>
              <span className="flex items-center gap-1.5"><Clock size={13} className="text-disabled" /> {meeting.startTime} · {formatDuration(meeting.duration)}</span>
              <span className="flex items-center gap-1.5"><MapPin size={13} className="text-disabled" /> {meeting.location || "—"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => showToast("Edit — coming soon")} className="wiz-btn wiz-btn--secondary flex items-center gap-1.5">
              <Edit2 size={14} /> Edit
            </button>
            <button onClick={() => showToast("Log note — coming soon")} className="wiz-btn wiz-btn--secondary flex items-center gap-1.5">
              <FileText size={14} /> Log Note
            </button>
            <button onClick={() => setTaskOpen(true)} className="wiz-btn wiz-btn--primary flex items-center gap-1.5">
              <CheckSquare size={14} /> Create Follow-up Task
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen((o) => !o)} className="p-2 rounded-xl border border-border hover:bg-action-hover text-muted">
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-11 z-30 bg-surface border border-border rounded-xl shadow-3 py-1 w-44">
                    <button onClick={() => { setMenuOpen(false); handleOutcomeChange("Cancelled"); }} className="w-full text-left px-3 py-1.5 text-sm text-muted hover:bg-action-hover">Cancel Meeting</button>
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
            {/* Summary */}
            <Card title="Summary">
              {meeting.notes ? (
                <div className="space-y-3 text-sm text-ink leading-relaxed">
                  {meeting.notes.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                </div>
              ) : (
                <EmptyState text="No meeting notes recorded. Add notes to capture key points." />
              )}
            </Card>

            {/* Follow-up Tasks */}
            <Card
              title="Follow-up Tasks"
              action={tasks.length > 0 ? { label: "+ Create Task", onClick: () => setTaskOpen(true) } : null}
            >
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <p className="text-sm text-disabled">No follow-up tasks created</p>
                  <button onClick={() => setTaskOpen(true)} className="wiz-btn wiz-btn--secondary flex items-center gap-1.5">
                    <CheckSquare size={14} /> Create Task
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <div key={t.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-border hover:border-primary transition-colors">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink">{t.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                          <span>{t.assignee}</span>
                          <span>·</span>
                          <span>Due {formatDate(t.due)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[t.priority] || "bg-default text-muted"}`}>{t.priority}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-default text-muted">{t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
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
          </div>

          {/* Right column (~40%) */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Details */}
            <Card title="Details">
              <dl className="space-y-2.5 text-sm">
                <Row label="Date" value={formatDate(meeting.date)} />
                <Row label="Time" value={meeting.startTime} />
                <Row label="Duration" value={formatDuration(meeting.duration)} />
                <Row label="Location" value={meeting.location || "—"} />
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-disabled">Outcome</dt>
                  <dd>
                    <select
                      value={meeting.outcome}
                      onChange={(e) => handleOutcomeChange(e.target.value)}
                      className="wiz-input text-xs"
                    >
                      {meetingOutcomes.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </dd>
                </div>
                <Row label="Created By" value={meeting.createdBy} />
                <Row label="Created" value={formatDate(meeting.createdAt)} />
              </dl>
            </Card>

            {/* Attendees */}
            <Card title="Attendees">
              <h4 className="text-[10px] font-bold text-disabled uppercase tracking-widest mb-2">External</h4>
              {externalAttendees.length === 0 ? (
                <p className="text-xs text-disabled mb-3">No external attendees</p>
              ) : (
                <div className="space-y-1.5 mb-4">
                  {externalAttendees.map((a) => (
                    <button
                      key={a.contactId}
                      onClick={() => onContactClick?.(a.contactId)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-action-hover text-left transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0">
                        {initials(a.contactName)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink truncate">{a.contactName}</div>
                        <div className="text-xs text-disabled truncate flex items-center gap-1"><Mail size={10} /> {a.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <h4 className="text-[10px] font-bold text-disabled uppercase tracking-widest mb-2">Internal</h4>
              {internalAttendees.length === 0 ? (
                <p className="text-xs text-disabled">No internal attendees</p>
              ) : (
                <div className="space-y-1.5">
                  {internalAttendees.map((a, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-default flex items-center justify-center text-[10px] font-bold text-muted flex-shrink-0">
                        {initials(a.repName)}
                      </div>
                      <span className="text-sm text-ink">{a.repName}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Associations */}
            <Card title="Associations">
              <div className="space-y-2">
                <button
                  onClick={() => onCompanyClick?.(meeting.companyId)}
                  disabled={!meeting.companyId}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-border hover:border-primary hover:bg-action-hover text-left transition-all disabled:opacity-60 disabled:hover:bg-transparent"
                >
                  <Building2 size={15} className="text-disabled flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-disabled">Company</div>
                    <div className="text-sm text-ink truncate">{meeting.companyName || "—"}</div>
                  </div>
                </button>

                {meeting.dealId ? (
                  <button
                    onClick={() => onDealClick?.(meeting.dealId)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-border hover:border-primary hover:bg-action-hover text-left transition-all"
                  >
                    <DollarSign size={15} className="text-disabled flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wide text-disabled">Deal</div>
                      <div className="text-sm text-ink truncate">{meeting.dealName}</div>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-dashed border-border">
                    <span className="text-sm text-disabled">No deal linked</span>
                    <button onClick={() => showToast("Link deal — coming soon")} className="text-xs font-semibold text-primary hover:text-primary-dark">Link Deal</button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ─── CREATE FOLLOW-UP TASK SIDE SHEET ─── */}
      <SideSheet open={taskOpen} onClose={() => setTaskOpen(false)} title="Create Follow-up Task" width="max-w-lg">
        {taskOpen && (
          <CreateTask
            entity={company ? { type: "company", id: company.id, name: company.name } : null}
            onClose={() => setTaskOpen(false)}
            onSave={(task) => {
              setTasks((prev) => [
                ...prev,
                { id: Math.max(0, ...prev.map((t) => t.id || 0)) + 1, meetingId: meeting.id, ...task },
              ]);
            }}
          />
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

// Build a small sample activity timeline from the meeting record.
function buildActivityLog(meeting) {
  const entries = [
    { text: `Meeting created by ${meeting.createdBy}`, time: formatDate(meeting.createdAt) },
    { text: `Invites sent to ${(meeting.attendees || []).length + (meeting.internalAttendees || []).length} attendees`, time: formatDate(meeting.createdAt) },
  ];
  if (meeting.notes) entries.push({ text: "Notes updated", time: formatDate(meeting.date) });
  if (meeting.outcome && meeting.outcome !== "Scheduled") {
    entries.push({ text: `Outcome set to ${meeting.outcome}`, time: formatDate(meeting.date) });
  }
  return entries;
}

function Card({ title, action, children }) {
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-2 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-disabled uppercase tracking-widest">{title}</h3>
        {action && (
          <button onClick={action.onClick} className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">{action.label}</button>
        )}
      </div>
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

function EmptyState({ text }) {
  return <p className="text-sm text-disabled py-2">{text}</p>;
}

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
