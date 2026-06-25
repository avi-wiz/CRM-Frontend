import { useMemo, useState } from "react";
import { Car, Plus, SlidersHorizontal, Search, CheckCircle, Users } from "lucide-react";
import SideSheet from "../components/shared/SideSheet";
import RowActions from "../components/shared/RowActions";
import LogVisit from "../components/side-sheets/log/LogVisit";
import CreateTask from "../components/side-sheets/log/CreateTask";
import {
  formatDate, formatDuration, isPastDate, isToday,
  visitPurposeStyles, visitOutcomeStyles,
} from "../data/constants";
import { useVisits, addVisit } from "../data/visitsStore";
import { logActivityFromEntity } from "../data/logActivity";

const HEAD = ["Date", "Company", "Rep", "Purpose", "Contacts Met", "Outcome", "Follow-up", "Duration", ""];
const TABS = ["All", "Follow-up Needed", "This Week", "This Month"];

// Days between an ISO date and today (negative = past).
function daysFromToday(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return Infinity;
  const today = new Date(new Date().toISOString().slice(0, 10));
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export default function VisitsPage({ onVisitClick, onCompanyClick }) {
  const visits = useVisits();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("All");
  const [logOpen, setLogOpen] = useState(false);
  const [followUpVisit, setFollowUpVisit] = useState(null); // source visit for a follow-up
  const [taskTarget, setTaskTarget] = useState(null); // visit to create a task against
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const matchesTab = (v) => {
    if (tab === "Follow-up Needed") return v.followUpNeeded;
    if (tab === "This Week") { const d = daysFromToday(v.visitDate); return d <= 0 && d >= -7; }
    if (tab === "This Month") { const d = daysFromToday(v.visitDate); return d <= 0 && d >= -30; }
    return true;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visits.filter((v) => {
      if (!matchesTab(v)) return false;
      if (!q) return true;
      return (
        (v.companyName || "").toLowerCase().includes(q) ||
        (v.rep?.repName || "").toLowerCase().includes(q)
      );
    });
  }, [visits, query, tab]);

  const tabCount = (name) => visits.filter((v) => {
    if (name === "Follow-up Needed") return v.followUpNeeded;
    if (name === "This Week") { const d = daysFromToday(v.visitDate); return d <= 0 && d >= -7; }
    if (name === "This Month") { const d = daysFromToday(v.visitDate); return d <= 0 && d >= -30; }
    return true;
  }).length;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-surface">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-ink tracking-tight">Visits</h1>
          <span className="text-sm text-disabled">{visits.length} visits</span>
        </div>
        <button
          onClick={() => setLogOpen(true)}
          className="wiz-btn wiz-btn--primary flex items-center gap-1.5 px-3.5 py-2"
        >
          <Plus size={15} /> Log Visit
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-8 border-b border-border bg-surface">
        {TABS.map((name) => (
          <button
            key={name}
            onClick={() => setTab(name)}
            className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === name ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
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
            placeholder="Search by company or rep…"
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
                  <th key={i} className="py-3 px-4 text-left font-bold text-muted text-[10px] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={HEAD.length} className="py-12 text-center">
                    <div className="text-sm text-muted">No visits found</div>
                    <div className="text-xs text-disabled mt-1">Try a different filter or log a visit.</div>
                  </td>
                </tr>
              )}
              {filtered.map((v) => {
                const fuOverdue = v.followUpNeeded && v.followUpDate && isPastDate(v.followUpDate) && !isToday(v.followUpDate);
                const contactCount = (v.contactIds || []).length;
                const contactNames = (v.contactIds || []).map((c) => c.contactName).join(", ");
                return (
                  <tr
                    key={v.id}
                    className="hover:bg-action-hover cursor-pointer transition-colors duration-150"
                    onClick={() => onVisitClick?.(v.id)}
                  >
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-2 font-medium text-ink">
                        <Car size={14} className="text-primary flex-shrink-0" />
                        {formatDate(v.visitDate)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); onCompanyClick?.(v.companyId); }}
                        className="text-ink hover:text-primary hover:underline disabled:hover:no-underline disabled:hover:text-ink"
                        disabled={!v.companyId}
                      >
                        {v.companyName}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-muted">{v.rep?.repName || "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${visitPurposeStyles[v.purpose] || "bg-default text-muted"}`}>{v.purpose}</span>
                    </td>
                    <td className="py-3 px-4 text-muted">
                      {contactCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5" title={contactNames}>
                          <Users size={13} className="text-disabled" />
                          {contactCount} contact{contactCount === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span className="text-disabled">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${visitOutcomeStyles[v.outcome] || "bg-default text-muted"}`}>{v.outcome}</span>
                    </td>
                    <td className={`py-3 px-4 ${fuOverdue ? "text-warning-dark font-medium" : "text-muted"}`}>
                      {v.followUpNeeded && v.followUpDate ? formatDate(v.followUpDate) : "—"}
                    </td>
                    <td className="py-3 px-4 text-muted">{formatDuration(v.duration)}</td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <RowActions
                        actions={[
                          { label: "View Detail", onClick: () => onVisitClick?.(v.id) },
                          { label: "Log Follow-up Visit", onClick: () => setFollowUpVisit(v) },
                          { label: "Create Task", onClick: () => setTaskTarget(v) },
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

      {/* ─── LOG VISIT SIDE SHEET ─── */}
      <SideSheet open={logOpen} onClose={() => setLogOpen(false)} title="Log Visit" width="max-w-lg">
        {logOpen && (
          <LogVisit
            entity={null}
            onClose={() => setLogOpen(false)}
            onSave={(payload) => {
              const created = addVisit({
                visitDate: payload.visitDate || payload.date,
                rep: payload.rep,
                purpose: payload.purpose,
                duration: payload.duration,
                location: payload.location,
                companyId: payload.companyId,
                companyName: payload.companyName,
                contactIds: payload.contactIds || [],
                notes: payload.notes || "",
                outcome: payload.outcome,
                followUpNeeded: payload.followUpNeeded,
                followUpDate: payload.followUpDate,
                followUpNotes: payload.followUpNotes,
              });
              setLogOpen(false);
              showToast(`Visit to ${created.companyName} logged`);
            }}
          />
        )}
      </SideSheet>

      {/* ─── LOG FOLLOW-UP VISIT (company pre-filled from source visit) ─── */}
      <SideSheet open={!!followUpVisit} onClose={() => setFollowUpVisit(null)} title="Log Follow-up Visit" width="max-w-lg">
        {followUpVisit && (
          <LogVisit
            entity={followUpVisit.companyId ? { id: followUpVisit.companyId, type: "company", name: followUpVisit.companyName } : null}
            onClose={() => setFollowUpVisit(null)}
            onSave={(payload) => {
              const created = addVisit({
                visitDate: payload.visitDate || payload.date,
                rep: payload.rep,
                purpose: payload.purpose,
                duration: payload.duration,
                location: payload.location,
                companyId: payload.companyId,
                companyName: payload.companyName,
                contactIds: payload.contactIds || [],
                notes: payload.notes || "",
                outcome: payload.outcome,
                followUpNeeded: payload.followUpNeeded,
                followUpDate: payload.followUpDate,
                followUpNotes: payload.followUpNotes,
              });
              setFollowUpVisit(null);
              showToast(`Follow-up visit to ${created.companyName} logged`);
            }}
          />
        )}
      </SideSheet>

      {/* ─── CREATE TASK (associated to the visit's company) ─── */}
      <SideSheet open={!!taskTarget} onClose={() => setTaskTarget(null)} title="Create Task" width="max-w-lg">
        {taskTarget && (
          <CreateTask
            entity={taskTarget.companyId ? { id: taskTarget.companyId, type: "company", name: taskTarget.companyName } : null}
            onClose={() => setTaskTarget(null)}
            onSave={(payload) => {
              if (taskTarget.companyId) {
                logActivityFromEntity({ id: taskTarget.companyId, type: "company", name: taskTarget.companyName }, payload);
              }
              setTaskTarget(null);
              showToast(`Task created for ${taskTarget.companyName}`);
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
