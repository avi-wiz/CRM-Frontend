import { useState } from "react";
import { ArrowLeft, MoreHorizontal, CheckCircle, Building2, Users, GitBranch, ChevronDown } from "lucide-react";
import StageBadge from "../components/shared/StageBadge";
import SideSheet from "../components/shared/SideSheet";
import ConfirmModal from "../components/shared/ConfirmModal";
import PropertiesPanel from "../components/detail/PropertiesPanel";
import ActivityTimeline from "../components/detail/ActivityTimeline";
import { LOG_SHEETS, nowStamp } from "../components/side-sheets/log";
import { EditSheet } from "../components/side-sheets/EditSheet";
import { getDealDetail, repNames, formatDate, stageColors } from "../data/constants";

// ─── PIPELINE CONFIG ───
const PIPELINE_STAGES = {
  "Default Sales Pipeline": {
    stages: ["New Lead", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"],
    endStages: ["Won", "Lost"],
  },
  "Enterprise Pipeline": {
    stages: ["Discovery", "Technical Review", "Pilot", "Procurement", "Contract", "Closed - Won", "Closed - Lost"],
    endStages: ["Closed - Won", "Closed - Lost"],
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
  High: "bg-red-50 text-red-600",
  Medium: "bg-amber-50 text-amber-600",
  Low: "bg-gray-100 text-gray-500",
};
const TASK_STATUS_COLOR = {
  Done: "bg-emerald-50 text-emerald-600",
  Open: "bg-amber-50 text-amber-600",
};

function MiniTable({ head, rows }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          {head.map((h) => (
            <th key={h} className="py-2 px-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={head.length} className="py-6 text-center text-gray-400 text-xs">
              No records
            </td>
          </tr>
        )}
        {rows.map((cells, i) => (
          <tr key={i} className="border-b border-gray-50">
            {cells.map((c, j) => (
              <td key={j} className="py-2.5 px-3 text-gray-700">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DealCenterTabs({ deal, onActivityAction }) {
  const [active, setActive] = useState("Activities");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex border-b border-gray-100 bg-white px-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              active === t
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
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
              <span className="font-medium text-gray-900">{m.title}</span>,
              formatDate(m.date),
              m.duration,
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  m.outcome === "Completed"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-blue-50 text-blue-600"
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
              <span className="font-medium text-gray-900">{t.title}</span>,
              formatDate(t.due),
              t.assignee,
              <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLOR[t.priority] || "bg-gray-100 text-gray-500"}`}>
                {t.priority}
              </span>,
              <span className={`text-xs px-2 py-0.5 rounded-full ${TASK_STATUS_COLOR[t.status] || "bg-gray-100 text-gray-500"}`}>
                {t.status}
              </span>,
            ])}
          />
        )}

        {active === "Activities" && (
          <ActivityTimeline activities={deal.activities} onAction={onActivityAction} />
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
    <div className="w-64 border-l border-gray-100 overflow-y-auto bg-white p-4 flex-shrink-0">
      {/* Company */}
      <Block title="Company / Customer" icon={Building2}>
        {deal.company ? (
          <div
            onClick={() => onCompanyClick?.(deal.company.id)}
            className="p-2.5 rounded-lg border border-gray-200 hover:border-indigo-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium text-gray-900 truncate">{deal.company.name}</div>
              {deal.company.isCustomer && (
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full ml-1 flex-shrink-0">
                  Customer
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 mb-1.5">{deal.company.industry}</div>
            <StageBadge stage={deal.company.stage} small />
          </div>
        ) : (
          <div className="text-xs text-gray-400">No associated company</div>
        )}
      </Block>

      {/* Contacts */}
      <Block title="Contacts" icon={Users}>
        {(deal.contacts || []).length === 0 && (
          <div className="text-xs text-gray-400">No contacts</div>
        )}
        <div className="space-y-2">
          {(deal.contacts || []).map((c) => (
            <div
              key={c.id}
              onClick={() => onContactClick?.(c.id)}
              className="flex items-start justify-between p-2 rounded-lg border border-gray-100 hover:border-indigo-300 cursor-pointer"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {c.firstName} {c.lastName}
                </div>
                <div className="text-xs text-gray-400">{c.role}</div>
              </div>
              {c.isWizShopUser && (
                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full ml-1 flex-shrink-0 mt-0.5">
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
          <div className="text-xs text-gray-500 mb-2">
            Current stage:{" "}
            <span className="text-gray-800 font-medium">{deal.stage}</span>
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
              className="w-full appearance-none text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 pr-7 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
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
        {Icon && <Icon size={13} className="text-gray-400" />}
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h4>
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
        className="flex items-center gap-1 px-3.5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all duration-200"
      >
        Change Stage
        <ChevronDown size={13} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44 overflow-hidden">
            {stages
              .filter((s) => s !== current)
              .map((s) => (
                <button
                  key={s}
                  onClick={() => { onSelect(s); setOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
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
export default function DealDetailPage({ dealId, onBack, onCompanyClick, onContactClick, onDuplicate }) {
  const [deal, setDeal] = useState(() => getDealDetail(dealId));
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [logSheet, setLogSheet] = useState(null); // activity action key or null
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const pipelineConfig = PIPELINE_STAGES[deal.pipeline] ?? PIPELINE_STAGES["Default Sales Pipeline"];

  const updateField = (key, value) => setDeal((d) => ({ ...d, [key]: value }));

  const handleStageChange = (newStage) => {
    setDeal((d) => ({ ...d, stage: newStage }));
    showToast(`Stage moved to ${newStage}`);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Entity descriptor passed to log sheets for the "Associated with" header.
  const entity = { id: deal.id, type: "deal", name: deal.name };

  // Append a logged activity to the deal's timeline.
  const handleLogSave = (activity) => {
    setDeal((d) => {
      const nextId = Math.max(0, ...(d.activities || []).map((a) => a.id || 0)) + 1;
      return { ...d, activities: [{ id: nextId, time: nowStamp(), ...activity }, ...(d.activities || [])] };
    });
    setLogSheet(null);
    showToast(`${LOG_SHEETS[logSheet]?.title || "Activity"} saved`);
  };

  const ActiveLogSheet = logSheet ? LOG_SHEETS[logSheet].Component : null;
  const propertyGroups = buildPropertyGroups(deal);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-gray-150 bg-white flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
            title="Back to deals"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deal</span>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight truncate">{deal.name}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-gray-400">{deal.pipeline}</span>
            <StageBadge stage={deal.stage} />
          </div>
          <span className="text-lg font-bold text-emerald-600 flex-shrink-0 tracking-tight">{deal.amount}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setEditOpen(true)}
            className="px-3.5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all duration-200"
          >
            Edit
          </button>
          <ChangeStageMenu
            stages={pipelineConfig.stages}
            current={deal.stage}
            onSelect={handleStageChange}
          />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 shadow-sm transition-all duration-200"
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44">
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
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Duplicate Deal
                  </button>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => { setMenuOpen(false); setArchiveOpen(true); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
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
          onChange={updateField}
        />
        <DealCenterTabs
          deal={deal}
          onActivityAction={(type) => setLogSheet(type)}
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
          <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
