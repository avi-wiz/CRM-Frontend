import { useState } from "react";
import { ArrowLeft, MoreHorizontal, CheckCircle, Building2, Users, GitBranch, ChevronDown } from "lucide-react";
import StageBadge from "../components/shared/StageBadge";
import SideSheet from "../components/shared/SideSheet";
import ConfirmModal from "../components/shared/ConfirmModal";
import { getMissingFieldsForStage, RequiredFieldsForm } from "../components/shared/stageGate";
import PropertiesPanel from "../components/detail/PropertiesPanel";
import ActivityTimeline from "../components/detail/ActivityTimeline";
import { LOG_SHEETS, nowStamp } from "../components/side-sheets/log";
import { EditSheet } from "../components/side-sheets/EditSheet";
import { getDealDetail, repNames, formatDate, stageColors, dealKanbanStages } from "../data/constants";
import { useEntityActivities } from "../data/activitiesStore";
import { logActivityFromEntity } from "../data/logActivity";

// ─── PIPELINE CONFIG ───
// Default pipeline uses the canonical deal vocabulary (dealKanbanStages) so the
// detail page, the listing Kanban, and the mandatory-field gate
// (dealStageMandatoryFields) all speak the same stage names.
const PIPELINE_STAGES = {
  "Default Sales Pipeline": {
    stages: dealKanbanStages,
    endStages: ["Closed Won", "Closed Lost"],
  },
  "Enterprise Pipeline": {
    stages: ["Discovery", "Technical Review", "Pilot", "Procurement", "Contract", "Closed Won", "Closed Lost"],
    endStages: ["Closed Won", "Closed Lost"],
  },
};

const FORECAST_CATEGORIES = ["Pipeline", "Best Case", "Commit", "Closed"];

const CONTACT_ROLES = ["Decision Maker", "Influencer", "Evaluator", "Champion", "End User"];

// Color for a stage dot — falls back to gray if not in the global map.
function stageColor(stage) {
  return stageColors[stage] || "#9ca3af";
}

// ─── PROPERTY GROUPS CONFIG ───
function buildPropertyGroups(deal) {
  const pipelineConfig = PIPELINE_STAGES[deal.pipeline] ?? PIPELINE_STAGES["Default Sales Pipeline"];
  return [
    {
      title: "Deal Info",
      fields: [
        { key: "name", label: "Deal Name", type: "text", required: true },
        { key: "amount", label: "Amount", type: "currency" },
        { key: "pipeline", label: "Pipeline", type: "text", readOnly: true },
        { key: "stage", label: "Stage", type: "select", options: pipelineConfig.stages },
        { key: "closeDate", label: "Close Date", type: "text" },
        { key: "forecastCategory", label: "Forecast Category", type: "select", options: FORECAST_CATEGORIES },
      ],
    },
    {
      title: "Ownership",
      fields: [
        { key: "owner", label: "Deal Owner", type: "select", options: repNames },
        { key: "createdBy", label: "Created By", type: "text", readOnly: true },
        { key: "createdAt", label: "Created Date", type: "text", readOnly: true },
      ],
    },
  ];
}

// ─── CENTER TABS ───
const TABS = ["Meetings", "Tasks", "Activities"];

const PRIORITY_COLOR = {
  High: "bg-danger-bg text-danger-dark",
  Medium: "bg-warning-bg text-warning-dark",
  Low: "bg-default text-muted",
};
const TASK_STATUS_COLOR = {
  Done: "bg-success-bg text-success-dark",
  Open: "bg-warning-bg text-warning-dark",
};

function MiniTable({ head, rows }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-divider">
          {head.map((h) => (
            <th key={h} className="py-2 px-3 text-left font-medium text-muted text-xs uppercase tracking-wider">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={head.length} className="py-6 text-center text-disabled text-xs">
              No records
            </td>
          </tr>
        )}
        {rows.map((cells, i) => (
          <tr key={i} className="border-b border-divider">
            {cells.map((c, j) => (
              <td key={j} className="py-2.5 px-3 text-ink">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DealCenterTabs({ deal, onActivityAction, onVisitClick, onTaskClick, onMeetingClick }) {
  const [active, setActive] = useState("Activities");
  const activities = useEntityActivities("deal", deal.id);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex border-b border-divider bg-surface px-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              active === t
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {active === "Meetings" && (
          <MiniTable
            head={["Title", "Date", "Duration", "Outcome"]}
            rows={(deal.meetings || []).map((m) => [
              <span className="font-medium text-ink">{m.title}</span>,
              formatDate(m.date),
              m.duration,
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  m.outcome === "Completed"
                    ? "bg-success-bg text-success-dark"
                    : "bg-info-bg text-info-dark"
                }`}
              >
                {m.outcome}
              </span>,
            ])}
          />
        )}

        {active === "Tasks" && (
          <MiniTable
            head={["Title", "Due Date", "Assignee", "Priority", "Status"]}
            rows={(deal.tasks || []).map((t) => [
              <span className="font-medium text-ink">{t.title}</span>,
              formatDate(t.due),
              t.assignee,
              <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLOR[t.priority] || "bg-default text-muted"}`}>
                {t.priority}
              </span>,
              <span className={`text-xs px-2 py-0.5 rounded-full ${TASK_STATUS_COLOR[t.status] || "bg-default text-muted"}`}>
                {t.status}
              </span>,
            ])}
          />
        )}

        {active === "Activities" && (
          <ActivityTimeline activities={activities} onAction={onActivityAction} onVisitClick={onVisitClick} onTaskClick={onTaskClick} onMeetingClick={onMeetingClick} />
        )}
      </div>
    </div>
  );
}

// ─── RIGHT PANEL — ASSOCIATIONS ───
function DealAssociations({ deal, pipelineConfig, onStageChange, onCompanyClick, onContactClick }) {
  const stages = pipelineConfig?.stages ?? [];
  const currentIdx = stages.indexOf(deal.stage);

  return (
    <div className="w-64 border-l border-divider overflow-y-auto bg-surface p-4 flex-shrink-0">
      {/* Company */}
      <Block title="Company / Customer" icon={Building2}>
        {deal.company ? (
          <div
            onClick={() => onCompanyClick?.(deal.company.id)}
            className="p-2.5 rounded-lg border border-border hover:border-primary cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium text-ink truncate">{deal.company.name}</div>
              {deal.company.isCustomer && (
                <span className="text-[10px] px-1.5 py-0.5 bg-success-bg text-success-dark rounded-full ml-1 flex-shrink-0">
                  Customer
                </span>
              )}
            </div>
            <div className="text-xs text-disabled mb-1.5">{deal.company.industry}</div>
            <StageBadge stage={deal.company.stage} small />
          </div>
        ) : (
          <div className="text-xs text-disabled">No associated company</div>
        )}
      </Block>

      {/* Contacts */}
      <Block title="Contacts" icon={Users}>
        {(deal.contacts || []).length === 0 && (
          <div className="text-xs text-disabled">No contacts</div>
        )}
        <div className="space-y-2">
          {(deal.contacts || []).map((c) => (
            <div
              key={c.id}
              onClick={() => onContactClick?.(c.id)}
              className="flex items-start justify-between p-2 rounded-lg border border-border hover:border-primary cursor-pointer"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink truncate">
                  {c.firstName} {c.lastName}
                </div>
                <div className="text-xs text-disabled">{c.role}</div>
              </div>
              {c.isWizShopUser && (
                <span className="text-[10px] px-1.5 py-0.5 bg-tonal text-primary rounded-full ml-1 flex-shrink-0 mt-0.5">
                  WizShop
                </span>
              )}
            </div>
          ))}
        </div>
      </Block>

      {/* Pipeline */}
      <Block title="Pipeline" icon={GitBranch}>
        <div className="mb-3">
          {/* Horizontal stage indicator */}
          <div className="flex items-center mb-3">
            {stages.map((s, i) => {
              const reached = i <= currentIdx;
              const isCurrent = i === currentIdx;
              const color = stageColor(s);
              return (
                <div key={s} className="flex items-center flex-1 last:flex-none" title={s}>
                  <div
                    className={`rounded-full flex-shrink-0 ${isCurrent ? "w-3 h-3" : "w-2 h-2"}`}
                    style={{
                      backgroundColor: reached ? color : "#e5e7eb",
                      ...(isCurrent ? { boxShadow: `0 0 0 2px #fff, 0 0 0 3.5px ${color}` } : {}),
                    }}
                  />
                  {i < stages.length - 1 && (
                    <div
                      className="flex-1 h-0.5 mx-0.5"
                      style={{ backgroundColor: i < currentIdx ? color : "#e5e7eb" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-xs text-muted mb-2">
            Current stage:{" "}
            <span className="text-ink font-medium">{deal.stage}</span>
          </div>
          {/* Move to Stage dropdown */}
          <div className="relative">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  onStageChange(e.target.value);
                  e.target.value = "";
                }
              }}
              className="wiz-input w-full appearance-none text-xs pr-7 cursor-pointer"
            >
              <option value="" disabled>
                Move to stage…
              </option>
              {stages
                .filter((s) => s !== deal.stage)
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-disabled pointer-events-none"
            />
          </div>
        </div>
      </Block>
    </div>
  );
}

function Block({ title, icon: Icon, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-2">
        {Icon && <Icon size={13} className="text-disabled" />}
        <h4 className="text-xs font-semibold text-disabled uppercase tracking-wider">{title}</h4>
      </div>
      {children}
    </div>
  );
}

// ─── CHANGE STAGE DROPDOWN (header CTA) ───
function ChangeStageMenu({ stages, current, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="wiz-btn wiz-btn--secondary flex items-center gap-1"
      >
        Change Stage
        <ChevronDown size={13} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-30 bg-surface border border-border rounded-lg shadow-3 py-1 w-44 overflow-hidden">
            {stages
              .filter((s) => s !== current)
              .map((s) => (
                <button
                  key={s}
                  onClick={() => { onSelect(s); setOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-muted hover:bg-action-hover flex items-center gap-2"
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: stageColor(s) }}
                  />
                  {s}
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN PAGE ───
export default function DealDetailPage({ dealId, onBack, onCompanyClick, onContactClick, onDuplicate, onVisitClick, onTaskClick, onMeetingClick }) {
  const [deal, setDeal] = useState(() => getDealDetail(dealId));
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [logSheet, setLogSheet] = useState(null); // activity action key or null
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  // Mandatory-field gate for stage changes: { stage, missing } or null.
  const [pendingStageMove, setPendingStageMove] = useState(null);

  const pipelineConfig = PIPELINE_STAGES[deal.pipeline] ?? PIPELINE_STAGES["Default Sales Pipeline"];

  const updateField = (key, value) => setDeal((d) => ({ ...d, [key]: value }));

  const handleStageChange = (newStage) => {
    if (newStage === deal.stage) return;
    // Gate on mandatory fields the same way the Kanban board does.
    const missing = getMissingFieldsForStage(deal, newStage, "deal");
    if (missing.length === 0) {
      setDeal((d) => ({ ...d, stage: newStage }));
      showToast(`Stage moved to ${newStage}`);
    } else {
      setPendingStageMove({ stage: newStage, missing });
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Entity descriptor passed to log sheets for the "Associated with" header.
  const entity = { id: deal.id, type: "deal", name: deal.name };

  // Persist a logged activity, explicitly associated with this deal.
  const handleLogSave = (activity) => {
    logActivityFromEntity(entity, activity);
    setLogSheet(null);
    showToast(`${LOG_SHEETS[logSheet]?.title || "Activity"} saved`);
  };

  const ActiveLogSheet = logSheet ? LOG_SHEETS[logSheet].Component : null;
  const propertyGroups = buildPropertyGroups(deal);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-divider bg-surface flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-action-hover text-muted hover:text-ink transition-colors flex-shrink-0"
            title="Back to deals"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-disabled uppercase tracking-widest">Deal</span>
            <h1 className="text-xl font-bold text-ink tracking-tight truncate">{deal.name}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-disabled">{deal.pipeline}</span>
            <StageBadge stage={deal.stage} />
          </div>
          <span className="text-lg font-bold text-success flex-shrink-0 tracking-tight">{deal.amount}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ChangeStageMenu
            stages={pipelineConfig.stages}
            current={deal.stage}
            onSelect={handleStageChange}
          />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-2 border border-border rounded-xl text-muted hover:bg-action-hover hover:text-ink shadow-1 transition-all duration-200"
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-30 bg-surface border border-border rounded-lg shadow-3 py-1 w-44">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      // Flatten company back to a string so ListingPage table cells don't get a nested object
                      const companyName = typeof deal.company === "object" ? deal.company?.name : deal.company;
                      onDuplicate?.({
                        ...deal,
                        id: undefined,
                        name: `${deal.name} (Copy)`,
                        company: companyName,
                        // Strip nested-only fields that don't belong in the listing row
                        contacts: undefined,
                        meetings: undefined,
                        tasks: undefined,
                        activities: undefined,
                      });
                      showToast(`Duplicated: ${deal.name} (Copy)`);
                    }}
                    className="w-full text-left px-3 py-1.5 text-sm text-muted hover:bg-action-hover"
                  >
                    Duplicate Deal
                  </button>
                  <div className="border-t border-divider mt-1 pt-1">
                    <button
                      onClick={() => { setMenuOpen(false); setArchiveOpen(true); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-danger-dark hover:bg-danger-bg"
                    >
                      Archive Deal
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── 3-PANEL LAYOUT ─── */}
      <div className="flex-1 flex overflow-hidden">
        <PropertiesPanel
          groups={propertyGroups}
          values={deal}
          onEdit={() => setEditOpen(true)}
        />
        <DealCenterTabs
          deal={deal}
          onActivityAction={(type) => setLogSheet(type)}
          onVisitClick={onVisitClick}
          onTaskClick={onTaskClick}
          onMeetingClick={onMeetingClick}
        />
        <DealAssociations
          deal={deal}
          pipelineConfig={pipelineConfig}
          onStageChange={handleStageChange}
          onCompanyClick={onCompanyClick}
          onContactClick={onContactClick}
        />
      </div>

      {/* ─── ACTIVITY LOG SIDE SHEET ─── */}
      <SideSheet
        open={!!logSheet}
        onClose={() => setLogSheet(null)}
        title={logSheet ? LOG_SHEETS[logSheet].title : ""}
      >
        {ActiveLogSheet && (
          <ActiveLogSheet
            entity={entity}
            contacts={deal.contacts || []}
            onClose={() => setLogSheet(null)}
            onSave={handleLogSave}
          />
        )}
      </SideSheet>

      {/* ─── EDIT SIDE SHEET ─── */}
      <SideSheet open={editOpen} onClose={() => setEditOpen(false)} title={`Edit ${deal.name}`}>
        {editOpen && (
          <EditSheet
            groups={propertyGroups}
            values={deal}
            entityLabel="Deal"
            onClose={() => setEditOpen(false)}
            onSave={(updated) => {
              setDeal((d) => ({ ...d, ...updated }));
              setEditOpen(false);
              showToast("Deal updated");
            }}
          />
        )}
      </SideSheet>

      {/* ─── STAGE-CHANGE MANDATORY FIELDS GATE ─── */}
      <SideSheet open={!!pendingStageMove} onClose={() => setPendingStageMove(null)} title="Complete Required Fields">
        {pendingStageMove && (
          <RequiredFieldsForm
            record={deal}
            entityName={deal.name}
            entityType="deal"
            stage={pendingStageMove.stage}
            onCancel={() => setPendingStageMove(null)}
            onSave={(values) => {
              setDeal((d) => ({ ...d, ...values, stage: pendingStageMove.stage }));
              showToast(`Stage moved to ${pendingStageMove.stage}`);
              setPendingStageMove(null);
            }}
          />
        )}
      </SideSheet>

      {/* ─── ARCHIVE CONFIRM ─── */}
      <ConfirmModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        title="Archive Deal"
        message={`Archive "${deal.name}"? It will be hidden from the active deals list but can be restored later.`}
        confirmLabel="Archive"
        destructive
        onConfirm={() => {
          setArchiveOpen(false);
          showToast(`"${deal.name}" archived`);
          setTimeout(() => onBack?.(), 1800);
        }}
      />

      {/* ─── SUCCESS TOAST ─── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-success flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
