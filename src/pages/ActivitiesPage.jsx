import { useMemo, useState } from "react";
import {
  Activity, FileText, Mail, CalendarCheck, CheckSquare, Car, GitBranch,
  ArrowRightLeft, Merge, FileSignature, ShoppingCart, Globe, Building2, User,
  DollarSign, ChevronRight,
} from "lucide-react";
import SideSheet from "../components/shared/SideSheet";
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

const HEAD = ["Type", "Summary", "Associated With", "Latest Update", "Updated", ""];

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

      {/* Table */}
      <div className="flex-1 overflow-auto p-8 bg-[#f8fafc]">
        <div className="bg-white rounded-2xl border border-gray-150 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-50/70">
                {HEAD.map((h, i) => (
                  <th key={i} className="py-3 px-4 text-left font-bold text-gray-400 text-[10px] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={HEAD.length} className="py-12 text-center">
                    <div className="text-sm text-gray-500">No activities found</div>
                    <div className="text-xs text-gray-400 mt-1">{emptyMessage}</div>
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
                <ActivityRow key={a.id} activity={a} onEntityClick={onEntityClick} onShowHistory={() => setHistoryOf(a)} />
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="pt-4 text-center">
            <button disabled className="px-4 py-2 text-xs font-medium text-gray-400 border border-gray-200 rounded-xl bg-white cursor-not-allowed">
              Showing all activities
            </button>
          </div>
        )}
      </div>

      <HistorySheet activity={historyOf} onClose={() => setHistoryOf(null)} onEntityClick={onEntityClick} />
    </div>
  );
}

function ActivityRow({ activity: a, onEntityClick, onShowHistory }) {
  const meta = activityTypeMeta[a.type] || activityTypeMeta.note;
  const Icon = TYPE_ICON[a.type] || Activity;

  // Primary entity in its own column; show up to 2 cross-entity badges + overflow.
  const cross = a.associatedEntities.slice(1, 3);
  const extra = a.associatedEntities.length - 1 - cross.length;

  return (
    <tr className="hover:bg-slate-50/50 transition-colors duration-150">
      {/* Type */}
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${meta.iconBg}`}>
            <Icon size={14} className={meta.iconColor} />
          </span>
          <span className="text-xs font-medium text-gray-600">{meta.label}</span>
        </span>
      </td>

      {/* Summary */}
      <td className="py-3 px-4">
        <span className="font-medium text-gray-900">{a.summary}</span>
      </td>

      {/* Associated With — primary entity + cross-entity badges */}
      <td className="py-3 px-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <EntityBadge entity={a.entity} primary onClick={() => onEntityClick?.(a.entity)} />
          {cross.map((e) => (
            <EntityBadge key={`${e.type}-${e.id}`} entity={e} onClick={() => onEntityClick?.(e)} />
          ))}
          {extra > 0 && <span className="text-[11px] text-gray-400 px-1">+{extra} more</span>}
        </div>
      </td>

      {/* Latest update */}
      <td className="py-3 px-4">
        <span className="text-gray-700">{a.latestUpdate.action}</span>
        <span className="text-gray-400"> · {a.latestUpdate.by}</span>
      </td>

      {/* Updated (relative) */}
      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{formatRelativeTime(a.latestUpdate.timestamp)}</td>

      {/* Show History */}
      <td className="py-3 px-4 text-right">
        <button
          onClick={onShowHistory}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
        >
          Show History
        </button>
      </td>
    </tr>
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

function HistorySheet({ activity, onClose, onEntityClick }) {
  const a = activity;
  const meta = a ? (activityTypeMeta[a.type] || activityTypeMeta.note) : null;
  // Reverse chronological.
  const entries = a ? [...a.history].sort((x, y) => y.timestamp.localeCompare(x.timestamp)) : [];

  return (
    <SideSheet open={!!a} onClose={onClose} title="Change History" width="max-w-md">
      {a && (
        <div className="flex flex-col h-full">
          {/* Activity summary header */}
          <div className="pb-4 border-b border-gray-100">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${meta.iconBg} ${meta.iconColor}`}>{meta.label}</span>
            <p className="text-sm font-semibold text-gray-900 mt-1.5">{a.summary}</p>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto py-5">
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
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Close</button>
            <button
              onClick={() => { onClose(); onEntityClick?.(a.entity); }}
              className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Go to {a.entity.name} <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </SideSheet>
  );
}

// "11:35 AM" from an ISO timestamp.
function formatTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
