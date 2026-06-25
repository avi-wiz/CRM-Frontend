import { useState, useEffect } from "react";
import {
  ArrowLeft, MoreHorizontal, Edit2, CheckSquare, Car, Building2,
  CheckCircle, Mail, AlertTriangle,
} from "lucide-react";
import SideSheet from "../components/shared/SideSheet";
import CreateTask from "../components/side-sheets/log/CreateTask";
import LogVisit from "../components/side-sheets/log/LogVisit";
import {
  formatDate, formatDuration, getVisitCompany, isPastDate, isToday,
  visitPurposeStyles, visitOutcomeStyles, visitOutcomes, contacts,
} from "../data/constants";
import { useVisit, useVisits, updateVisit, addVisit } from "../data/visitsStore";

export default function VisitDetailPage({ visitId, onBack, onCompanyClick, onContactClick, onVisitClick }) {
  const all = useVisits();
  const visit = useVisit(visitId) || all[0];

  const [company, setCompany] = useState(getVisitCompany(visit));
  useEffect(() => { setCompany(getVisitCompany(visit)); }, [visit.id]);

  const [taskOpen, setTaskOpen] = useState(false);
  const [followVisitOpen, setFollowVisitOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fuOverdue = visit.followUpNeeded && visit.followUpDate && isPastDate(visit.followUpDate) && !isToday(visit.followUpDate);
  const contactsMet = visit.contactIds || [];
  const relatedVisits = all.filter((v) => v.id !== visit.id && v.companyId === visit.companyId).slice(0, 3);
  const log = buildActivityLog(visit);

  const handleOutcome = (outcome) => {
    updateVisit(visit.id, { outcome });
    showToast(`Outcome set to ${outcome}`);
  };

  const entityForCompany = company ? { type: "company", id: company.id, name: company.name } : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── Header ─── */}
      <div className="px-8 py-4 border-b border-divider bg-surface">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-3">
          <ArrowLeft size={15} /> Back to Visits
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-semibold text-ink truncate">Visit — {visit.companyName}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${visitPurposeStyles[visit.purpose] || "bg-default text-muted"}`}>{visit.purpose}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${visitOutcomeStyles[visit.outcome] || "bg-default text-muted"}`}>{visit.outcome}</span>
            </div>
            <div className="mt-1.5 text-sm text-muted">{formatDate(visit.visitDate)} · {formatDuration(visit.duration)} · {visit.location}</div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => showToast("Edit — coming soon")} className="wiz-btn wiz-btn--secondary flex items-center gap-1.5">
              <Edit2 size={14} /> Edit
            </button>
            <button onClick={() => setTaskOpen(true)} className="wiz-btn wiz-btn--secondary flex items-center gap-1.5">
              <CheckSquare size={14} /> Create Follow-up Task
            </button>
            <button onClick={() => setFollowVisitOpen(true)} className="wiz-btn wiz-btn--primary flex items-center gap-1.5">
              <Car size={14} /> Log Follow-up Visit
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen((o) => !o)} className="p-2 rounded-xl border border-border hover:bg-action-hover text-muted">
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-11 z-30 bg-surface border border-border rounded-xl shadow-3 py-1 w-36">
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
          {/* Left (~60%) */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Visit Notes */}
            <Card title="Visit Notes">
              {visit.notes ? (
                <div className="space-y-3 text-sm text-ink leading-relaxed">
                  {visit.notes.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                </div>
              ) : (
                <p className="text-sm text-disabled py-1">No visit notes recorded.</p>
              )}
            </Card>

            {/* Follow-up (only if needed) */}
            {visit.followUpNeeded && (
              <div className="bg-warning-bg border border-warning rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={15} className="text-warning" />
                  <h3 className="text-sm font-semibold text-warning-dark">Follow-up Required</h3>
                </div>
                <div className="text-sm mb-1">
                  <span className="text-warning-dark">Due: </span>
                  <span className={fuOverdue ? "text-danger-dark font-semibold" : "text-warning-dark font-medium"}>
                    {formatDate(visit.followUpDate)}{fuOverdue ? " · Overdue" : ""}
                  </span>
                </div>
                {visit.followUpNotes && <p className="text-sm text-warning-dark mb-3">{visit.followUpNotes}</p>}
                <div className="flex items-center gap-2">
                  <button onClick={() => setTaskOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-surface text-warning-dark border border-warning rounded-lg hover:bg-warning-bg transition-colors">
                    <CheckSquare size={14} /> Create Follow-up Task
                  </button>
                  <button onClick={() => setFollowVisitOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-surface text-warning-dark border border-warning rounded-lg hover:bg-warning-bg transition-colors">
                    <Car size={14} /> Log Follow-up Visit
                  </button>
                </div>
              </div>
            )}

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

          {/* Right (~40%) */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Details */}
            <Card title="Details">
              <dl className="space-y-2.5 text-sm">
                <Row label="Visit Date" value={formatDate(visit.visitDate)} />
                <Row label="Duration" value={formatDuration(visit.duration)} />
                <Row label="Location" value={visit.location || "—"} />
                <Row label="Purpose" value={visit.purpose} />
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-disabled">Outcome</dt>
                  <dd>
                    <select value={visit.outcome} onChange={(e) => handleOutcome(e.target.value)} className="wiz-input text-xs">
                      {visitOutcomes.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </dd>
                </div>
                <Row label="Rep" value={visit.rep?.repName || "—"} />
                <Row label="Created" value={formatDate(visit.createdAt)} />
              </dl>
            </Card>

            {/* Contacts Met */}
            <Card title="Contacts Met">
              {contactsMet.length === 0 ? (
                <p className="text-sm text-disabled py-1">No contacts specified</p>
              ) : (
                <div className="space-y-1.5">
                  {contactsMet.map((ct) => {
                    const full = contacts.find((c) => c.id === ct.contactId);
                    return (
                      <button key={ct.contactId} onClick={() => onContactClick?.(ct.contactId)} className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-action-hover text-left transition-colors">
                        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0">{initials(ct.contactName)}</div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-ink truncate">{ct.contactName}</div>
                          {full && <div className="text-xs text-disabled truncate flex items-center gap-1"><Mail size={10} /> {full.email} · {full.jobTitle}</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Associations */}
            <Card title="Associations">
              <button
                onClick={() => onCompanyClick?.(visit.companyId)}
                disabled={!visit.companyId}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border border-border hover:border-primary hover:bg-action-hover text-left transition-all disabled:opacity-60"
              >
                <Building2 size={15} className="text-disabled flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-disabled">Company</div>
                  <div className="text-sm text-ink truncate">{visit.companyName || "—"}</div>
                </div>
              </button>

              {relatedVisits.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-[10px] font-bold text-disabled uppercase tracking-widest mb-2">Related Visits</h4>
                  <div className="space-y-2">
                    {relatedVisits.map((rv) => (
                      <button key={rv.id} onClick={() => onVisitClick?.(rv.id)} className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border hover:border-primary hover:bg-action-hover text-left transition-all">
                        <div className="min-w-0">
                          <div className="text-sm text-ink">{formatDate(rv.visitDate)}</div>
                          <div className="text-xs text-disabled truncate">{rv.rep?.repName}</div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${visitOutcomeStyles[rv.outcome] || "bg-default text-muted"}`}>{rv.outcome}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => onCompanyClick?.(visit.companyId)} className="mt-3 text-xs font-semibold text-primary hover:text-primary-dark">View all visits →</button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* ─── CREATE FOLLOW-UP TASK ─── */}
      <SideSheet open={taskOpen} onClose={() => setTaskOpen(false)} title="Create Follow-up Task" width="max-w-lg">
        {taskOpen && (
          <CreateTask
            entity={entityForCompany}
            onClose={() => setTaskOpen(false)}
            onSave={() => { setTaskOpen(false); showToast("Follow-up task created"); }}
          />
        )}
      </SideSheet>

      {/* ─── LOG FOLLOW-UP VISIT ─── */}
      <SideSheet open={followVisitOpen} onClose={() => setFollowVisitOpen(false)} title="Log Follow-up Visit" width="max-w-lg">
        {followVisitOpen && (
          <LogVisit
            entity={entityForCompany}
            onClose={() => setFollowVisitOpen(false)}
            onSave={(payload) => {
              const created = addVisit({
                visitDate: payload.visitDate || payload.date,
                rep: payload.rep, purpose: payload.purpose, duration: payload.duration, location: payload.location,
                companyId: payload.companyId, companyName: payload.companyName,
                contactIds: payload.contactIds || [], notes: payload.notes || "", outcome: payload.outcome,
                followUpNeeded: payload.followUpNeeded, followUpDate: payload.followUpDate, followUpNotes: payload.followUpNotes,
              });
              setFollowVisitOpen(false);
              showToast("Follow-up visit logged");
              setTimeout(() => onVisitClick?.(created.id), 600);
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

function buildActivityLog(visit) {
  const entries = [{ text: `Visit logged by ${visit.rep?.repName || "a rep"}`, time: formatDate(visit.createdAt) }];
  if (visit.contactIds?.length) entries.push({ text: `Met with ${visit.contactIds.map((c) => c.contactName).join(", ")}`, time: formatDate(visit.visitDate) });
  if (visit.followUpNeeded) entries.push({ text: `Follow-up scheduled for ${formatDate(visit.followUpDate)}`, time: formatDate(visit.createdAt) });
  if (visit.outcome) entries.push({ text: `Outcome recorded: ${visit.outcome}`, time: formatDate(visit.visitDate) });
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

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
