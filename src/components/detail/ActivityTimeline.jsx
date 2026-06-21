import { useState } from "react";
import { Activity, FileText, CalendarCheck, Mail, CheckSquare, Car } from "lucide-react";
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
  { type: "note", label: "+ Note" },
  { type: "meeting", label: "+ Meeting" },
  { type: "task", label: "+ Task" },
  { type: "email", label: "+ Email" },
  { type: "visit", label: "+ Visit" },
];

export default function ActivityTimeline({ activities = [], onAction }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? activities : activities.filter((a) => a.type === filter);
  // Pinned notes float to the top; the rest keep their existing order.
  const visible = [...filtered].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div>
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {ACTIONS.map((a) => (
          <button
            key={a.type}
            onClick={() => onAction?.(a.type)}
            className="px-2.5 py-1 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-2.5 py-1 text-xs rounded-full ${
              filter === f.key ? "bg-indigo-50 text-indigo-700 font-medium" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-2.5">
        {visible.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">No activities</div>
        )}
        {visible.map((a) => (
          <TimelineRow key={a.id} activity={a} />
        ))}
      </div>
    </div>
  );
}

function TimelineRow({ activity: a }) {
  const meta = TYPE_META[a.type] || TYPE_META.system;
  const Icon = meta.icon;
  return (
    <div className={`flex gap-3 p-3 rounded-lg border border-gray-200 border-l-4 ${meta.border} ${a.type === "system" ? "bg-gray-50" : "bg-white"}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${meta.iconBg}`}>
        <Icon size={13} className={meta.iconColor} />
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
          <div className="text-xs text-gray-500 mt-0.5">Attendees: {a.attendees}</div>
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
          <div className="text-xs text-gray-500 mt-0.5">{a.rep}</div>
          {a.notes && <div className="text-sm text-gray-600 mt-0.5">{a.notes}</div>}
        </div>
      );
    default:
      return <div className="text-sm text-gray-700">{a.text}</div>;
  }
}
