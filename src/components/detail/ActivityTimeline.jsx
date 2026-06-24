import { useState } from "react";
import { Activity, FileText, CalendarCheck, Mail, CheckSquare, Car, Plus, ChevronDown } from "lucide-react";
import { formatRelativeTime } from "../../data/constants";

// Per-type visual config: left-border color, icon, accent. Drives both the
// timeline rows and the filter-pill grouping.
const TYPE_META = {
  system: { label: "System", border: "border-l-gray-300", icon: Activity, iconBg: "bg-gray-200", iconColor: "text-gray-500" },
  note: { label: "Notes", border: "border-l-blue-400", icon: FileText, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  meeting: { label: "Meetings", border: "border-l-purple-400", icon: CalendarCheck, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  email: { label: "Emails", border: "border-l-amber-400", icon: Mail, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  task: { label: "Tasks", border: "border-l-emerald-400", icon: CheckSquare, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  visit: { label: "Visits", border: "border-l-rose-400", icon: Car, iconBg: "bg-rose-100", iconColor: "text-rose-600" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "note", label: "Notes" },
  { key: "meeting", label: "Meetings" },
  { key: "email", label: "Emails" },
  { key: "task", label: "Tasks" },
  { key: "visit", label: "Visits" },
  { key: "system", label: "System" },
];

const ACTIONS = [
  { type: "note", label: "Log Note", icon: FileText },
  { type: "meeting", label: "Log Meeting", icon: CalendarCheck },
  { type: "task", label: "Create Task", icon: CheckSquare },
  { type: "email", label: "Log Email", icon: Mail },
  { type: "visit", label: "Log Visit", icon: Car },
];

// Strict-association timeline. `activities` is ALREADY filtered to the records
// explicitly associated with this entity (see useEntityActivities) and sorted
// newest-first. The component only does type-filtering + rendering — there is
// no cross-entity inference or "show history" roll-up.
export default function ActivityTimeline({ activities = [], onAction, onVisitClick, onTaskClick, onMeetingClick }) {
  const [filter, setFilter] = useState("all");
  const [logOpen, setLogOpen] = useState(false);

  const visible = filter === "all" ? activities : activities.filter((a) => a.type === filter);

  return (
    <div>
      {/* Filter chips (left) + single Log Activity dropdown (right) */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                filter === f.key ? "bg-indigo-600 text-white font-semibold shadow-[0_2px_8px_rgba(99,102,241,0.25)]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={() => setLogOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all duration-200"
          >
            <Plus size={13} /> Log Activity <ChevronDown size={13} className={`transition-transform ${logOpen ? "rotate-180" : ""}`} />
          </button>
          {logOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setLogOpen(false)} />
              <div className="absolute right-0 top-9 z-30 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-44 overflow-hidden">
                {ACTIONS.map((a) => (
                  <button
                    key={a.type}
                    onClick={() => { setLogOpen(false); onAction?.(a.type); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50/60 hover:text-indigo-700 transition-colors"
                  >
                    <a.icon size={14} className="text-gray-400" /> {a.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2.5">
        {visible.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">No activities</div>
        )}
        {visible.map((a) => (
          <TimelineRow key={a.id} activity={a} onVisitClick={onVisitClick} onTaskClick={onTaskClick} onMeetingClick={onMeetingClick} />
        ))}
      </div>
    </div>
  );
}

function TimelineRow({ activity: a, onVisitClick, onTaskClick, onMeetingClick }) {
  const meta = TYPE_META[a.type] || TYPE_META.system;
  const Icon = meta.icon;
  const onClick =
    a.type === "visit" && a.visitId != null && onVisitClick ? () => onVisitClick(a.visitId)
    : a.type === "task" && a.taskId != null && onTaskClick ? () => onTaskClick(a.taskId)
    : a.type === "meeting" && a.meetingId != null && onMeetingClick ? () => onMeetingClick(a.meetingId)
    : undefined;
  return (
    <div
      onClick={onClick}
      className={`flex gap-3 p-3.5 rounded-xl border border-gray-150 border-l-4 ${meta.border} ${
        a.type === "system" ? "bg-gray-50/70" : "bg-white"
      } shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-200 ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${meta.iconBg} shadow-sm`}>
        <Icon size={14} className={meta.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <ActivityBody activity={a} />
        <div className="text-xs text-gray-400 mt-1">{formatRelativeTime(a.time)}</div>
      </div>
    </div>
  );
}

function ActivityBody({ activity: a }) {
  switch (a.type) {
    case "system":
      return <div className="text-sm text-gray-600">{a.text}</div>;
    case "note":
      return (
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-gray-500">{a.author}</span>
            {a.pinned && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">Pinned</span>
            )}
          </div>
          <div className="text-sm text-gray-800">{a.body}</div>
        </div>
      );
    case "meeting":
      return (
        <div>
          <div className="text-sm font-medium text-gray-900">{a.title}</div>
          <div className="text-xs text-gray-500 mt-0.5">Attendees: {a.attendeeSummary || a.attendees}</div>
          <div className="text-xs text-gray-500">Outcome: <span className="text-gray-700">{a.outcome}</span></div>
        </div>
      );
    case "email":
      return (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{a.subject}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${a.direction === "sent" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
              {a.direction === "sent" ? "Sent" : "Received"}
            </span>
          </div>
          <div className="text-sm text-gray-600 mt-0.5 truncate">{a.snippet}</div>
        </div>
      );
    case "task":
      return (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{a.title}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${a.status === "Done" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
              {a.status}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{a.assignee} · Due {a.due}</div>
        </div>
      );
    case "visit":
      return (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{a.purpose} Visit</span>
            {a.followUp && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600">Follow-up</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{a.repName || (typeof a.rep === "string" ? a.rep : a.rep?.repName)}</div>
          {a.notes && <div className="text-sm text-gray-600 mt-0.5">{a.notes}</div>}
        </div>
      );
    default:
      return <div className="text-sm text-gray-700">{a.text}</div>;
  }
}
