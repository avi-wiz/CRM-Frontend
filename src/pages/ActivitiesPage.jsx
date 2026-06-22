import { useMemo, useState } from "react";
import {
  Activity, FileText, Mail, CalendarCheck, CheckSquare, Car, GitBranch,
  ArrowRightLeft, Merge, FileSignature, ShoppingCart, Globe, Building2, User,
  DollarSign, X, ChevronRight,
} from "lucide-react";
import {
  activitiesAggregate, activityTypeMeta, historyActionStyles, formatRelativeTime, formatDate,
} from "../data/constants";

// Type → icon component (colors come from activityTypeMeta in constants).
const TYPE_ICON = {
  note: FileText, email: Mail, meeting: CalendarCheck, task: CheckSquare,
  visit: Car, stage_change: GitBranch, conversion: ArrowRightLeft, merge: Merge,
  quote: FileSignature, order: ShoppingCart, wizshop_event: Globe,
};

const ENTITY_ICON = { company: Building2, customer: Building2, contact: User, deal: DollarSign };

// Filter pills → which activity types they match.
const FILTERS = [
  { key: "all", label: "All", types: null },
  { key: "note", label: "Notes", types: ["note"] },
  { key: "email", label: "Emails", types: ["email"] },
  { key: "meeting", label: "Meetings", types: ["meeting"] },
  { key: "task", label: "Tasks", types: ["task"] },
  { key: "visit", label: "Visits", types: ["visit"] },
  { key: "stage_change", label: "Stage Changes", types: ["stage_change"] },
  { key: "system", label: "System Events", types: ["conversion", "merge", "order", "wizshop_event", "quote"] },
];

const TIME_RANGES = [
  { key: "7", label: "Last 7 days", days: 7 },
  { key: "30", label: "Last 30 days", days: 30 },
  { key: "90", label: "Last 90 days", days: 90 },
  { key: "all", label: "All time", days: null },
];

const NOW = new Date("2026-06-22T23:59:59Z").getTime();

export default function ActivitiesPage({ onEntityClick }) {
  const [filter, setFilter] = useState("all");
  const [range, setRange] = useState("30");
  const [query, setQuery] = useState("");
  const [historyOf, setHistoryOf] = useState(null); // activity whose history modal is open

  const activeFilter = FILTERS.find((f) => f.key === filter);
  const activeRange = TIME_RANGES.find((r) => r.key === range);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activitiesAggregate
      .filter((a) => {
        // Type filter
        if (activeFilter.types && !activeFilter.types.includes(a.type)) return false;
        // Time filter
        if (activeRange.days != null) {
          const ageDays = (NOW - new Date(a.latestUpdate.timestamp).getTime()) / 86400000;
          if (ageDays > activeRange.days) return false;
        }
        // Search
        if (!q) return true;
        return (
          a.summary.toLowerCase().includes(q) ||
          (a.latestUpdate.by || "").toLowerCase().includes(q) ||
          a.associatedEntities.some((e) => e.name.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.latestUpdate.timestamp.localeCompare(a.latestUpdate.timestamp));
  }, [filter, range, query]);

  const emptyMessage = activitiesAggregate.length === 0
    ? "No activities recorded yet. Activities are logged when your team interacts with companies, contacts, and deals."
    : `No ${activeFilter.key === "all" ? "" : activeFilter.label.toLowerCase() + " "}activities in the ${activeRange.label.toLowerCase()}.`;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-150 bg-white">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Activities</h1>
          <span className="text-sm text-gray-400">Latest status across all records</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 py-3 border-b border-gray-150 bg-white space-y-3">
        {/* Filter pills (horizontally scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Time range + search */}
        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          >
            {TIME_RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by entity, rep, or summary…"
            className="flex-1 max-w-md px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          />
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-auto p-8 bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Activity size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 max-w-sm mx-auto">{emptyMessage}</p>
            </div>
          ) : (
            <>
              {filtered.map((a) => (
                <ActivityCard key={a.id} activity={a} onEntityClick={onEntityClick} onShowHistory={() => setHistoryOf(a)} />
              ))}
              <div className="pt-2 text-center">
                <button disabled className="px-4 py-2 text-xs font-medium text-gray-400 border border-gray-200 rounded-xl bg-white cursor-not-allowed">
                  Showing all activities
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {historyOf && (
        <HistoryModal activity={historyOf} onClose={() => setHistoryOf(null)} onEntityClick={onEntityClick} />
      )}
    </div>
  );
}

function ActivityCard({ activity: a, onEntityClick, onShowHistory }) {
  const meta = activityTypeMeta[a.type] || activityTypeMeta.note;
  const Icon = TYPE_ICON[a.type] || Activity;

  // Show up to 3 associated entity badges, "+N more" beyond that.
  const badges = a.associatedEntities.slice(0, 3);
  const extra = a.associatedEntities.length - badges.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-150 shadow-[0_1px_4px_rgba(0,0,0,0.02)] p-4 flex gap-3.5">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${meta.iconBg} shadow-sm`}>
        <Icon size={16} className={meta.iconColor} />
      </div>

      <div className="flex-1 min-w-0">
        {/* Top line: summary + timestamp */}
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-gray-900">{a.summary}</p>
          <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap mt-0.5">{formatRelativeTime(a.latestUpdate.timestamp)}</span>
        </div>

        {/* Entity badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {badges.map((e, i) => (
            <EntityBadge key={`${e.type}-${e.id}`} entity={e} primary={i === 0} onClick={() => onEntityClick?.(e)} />
          ))}
          {extra > 0 && (
            <span className="text-[11px] text-gray-400 px-1.5 py-0.5">+{extra} more</span>
          )}
        </div>

        {/* Latest update line + Show History */}
        <div className="flex items-end justify-between gap-3 mt-2">
          <p className="text-xs text-gray-500">
            Latest: <span className="text-gray-600">{a.latestUpdate.action}</span> by {a.latestUpdate.by}, {formatRelativeTime(a.latestUpdate.timestamp)}
          </p>
          <button
            onClick={onShowHistory}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex-shrink-0"
          >
            Show History
          </button>
        </div>
      </div>
    </div>
  );
}

function EntityBadge({ entity, primary, onClick }) {
  const Icon = ENTITY_ICON[entity.type] || Building2;
  const typeLabel = entity.type.charAt(0).toUpperCase() + entity.type.slice(1);
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full transition-colors ${
        primary ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
      }`}
    >
      <Icon size={11} className="flex-shrink-0" />
      {primary ? `${entity.name} — ${typeLabel}` : `${typeLabel}: ${entity.name}`}
    </button>
  );
}

function HistoryModal({ activity: a, onClose, onEntityClick }) {
  const meta = activityTypeMeta[a.type] || activityTypeMeta.note;
  // Reverse chronological.
  const entries = [...a.history].sort((x, y) => y.timestamp.localeCompare(x.timestamp));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 border border-gray-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${meta.iconBg} ${meta.iconColor}`}>{meta.label}</span>
              <h3 className="text-sm font-bold text-gray-900 truncate">{a.summary}</h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Change History</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Timeline */}
        <div className="px-6 py-5 overflow-y-auto">
          <div className="relative pl-5">
            {/* connector line */}
            <div className="absolute left-1 top-1 bottom-1 w-px bg-gray-200" />
            <div className="space-y-5">
              {entries.map((h, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-400" />
                  <div className="text-xs text-gray-400">{formatDate(h.timestamp)} · {formatTime(h.timestamp)}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${historyActionStyles[h.action] || "bg-gray-100 text-gray-600"}`}>{h.action}</span>
                    <span className="text-xs text-gray-500">by {h.by}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{h.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Close</button>
          <button
            onClick={() => { onClose(); onEntityClick?.(a.entity); }}
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            Go to {a.entity.name} <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// "11:35 AM" from an ISO timestamp.
function formatTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
