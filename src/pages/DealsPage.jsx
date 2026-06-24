import { useState, useRef, useEffect, useCallback } from "react";
import { List, LayoutGrid, Plus, CheckCircle, Clock, Calendar } from "lucide-react";
import ListingPage from "../components/listings/ListingPage";
import KanbanBoard from "../components/listings/KanbanBoard";
import SideSheet from "../components/shared/SideSheet";
import ConfirmModal from "../components/shared/ConfirmModal";
import CreateDeal from "../components/side-sheets/CreateDeal";
import { CreateTask } from "../components/side-sheets/log/index.jsx";
import { EditSheet } from "../components/side-sheets/EditSheet";
import {
  deals as initialDeals, dealColumns, dealKanbanStages,
  dealStageMandatoryFields, dealFieldMeta, repNames,
} from "../data/constants";

const DEAL_STAGES = ["Qualification", "Proposal", "Negotiation", "Contract Sent", "Closed Won", "Closed Lost"];
const PIPELINES = ["Default Sales Pipeline", "Enterprise Pipeline", "Renewal Pipeline"];

// Editable fields for the row-level Edit sheet.
const DEAL_EDIT_GROUPS = [
  {
    title: "Deal Info",
    fields: [
      { key: "name", label: "Deal Name", type: "text", required: true },
      { key: "amount", label: "Amount", type: "text" },
      { key: "stage", label: "Stage", type: "select", options: DEAL_STAGES },
      { key: "owner", label: "Owner", type: "select", options: repNames },
      { key: "closeDate", label: "Close Date", type: "text" },
    ],
  },
];

function isMissing(value) {
  return value === undefined || value === null || value === "" || value === false;
}

function getMissingDealFields(record, stage) {
  const required = dealStageMandatoryFields[stage] || [];
  return required.filter((key) => isMissing(record[key]));
}

function formatColTotal(items) {
  const total = items.reduce((sum, d) => sum + (d.amountRaw || 0), 0);
  if (total === 0) return null;
  if (total >= 1_000_000) return `$${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000) return `$${Math.round(total / 1_000)}k`;
  return `$${total}`;
}

function isOverdue(closeDateStr) {
  if (!closeDateStr || closeDateStr === "—") return false;
  // Dates like "Jun 30", "Jul 15" — parse relative to current year
  const parsed = new Date(`${closeDateStr} 2026`);
  return !isNaN(parsed) && parsed < new Date("2026-06-22");
}

function repInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

// ─── MISSING FIELDS FORM (deal) ───────────────────────────────────────────────
function DealRequiredFieldsForm({ deal, stage, missing, onSave, onCancel }) {
  const [values, setValues] = useState({});

  const set = (key, val) => setValues((v) => ({ ...v, [key]: val }));

  return (
    <div className="p-5 space-y-5">
      <p className="text-sm text-gray-500">
        Fill in the required fields to move <strong className="text-gray-800">{deal.name}</strong> to{" "}
        <strong className="text-gray-800">{stage}</strong>.
      </p>
      {missing.map((key) => {
        const meta = dealFieldMeta[key] || { label: key, type: "text" };
        return (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{meta.label}</label>
            {meta.type === "select" ? (
              <select
                value={values[key] || ""}
                onChange={(e) => set(key, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">Select…</option>
                {meta.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={meta.type === "currency" ? "number" : "text"}
                placeholder={meta.type === "currency" ? "0" : ""}
                value={values[key] || ""}
                onChange={(e) => set(key, meta.type === "currency" ? Number(e.target.value) : e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            )}
          </div>
        );
      })}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onSave(values)}
          disabled={missing.some((k) => isMissing(values[k]))}
          className="flex-1 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
        >
          Save &amp; Move
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
      </div>
    </div>
  );
}

// ─── DEAL KANBAN CARD ─────────────────────────────────────────────────────────
function DealCard({ item }) {
  const overdue = isOverdue(item.closeDate);
  return (
    <>
      <div className="font-medium text-sm text-gray-900 mb-2 tracking-tight">{item.name}</div>
      <div className="text-sm font-semibold text-emerald-600 mb-2">{item.amount}</div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        {item.isCustomerCompany && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
        )}
        <span className="truncate">{item.company}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-extrabold flex items-center justify-center flex-shrink-0">
          {repInitials(item.owner)}
        </div>
        <span className="truncate">{item.owner || "Unassigned"}</span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs">
        <span className="flex items-center gap-1 text-gray-400">
          <Clock size={10} />
          {item.daysInStage}d in stage
        </span>
        <span className={`flex items-center gap-1 ${overdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
          <Calendar size={10} />
          {item.closeDate}
        </span>
      </div>
    </>
  );
}

// ─── VIEW TOGGLE ──────────────────────────────────────────────────────────────
function ViewToggle({ mode, onChange }) {
  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden mr-2">
      <button onClick={() => onChange("table")} className={`p-1.5 ${mode === "table" ? "bg-gray-100" : "hover:bg-gray-50"}`}><List size={16} /></button>
      <button onClick={() => onChange("kanban")} className={`p-1.5 ${mode === "kanban" ? "bg-gray-100" : "hover:bg-gray-50"}`}><LayoutGrid size={16} /></button>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function DealsPage({ onDealClick, pendingDuplicate, onDuplicateConsumed }) {
  const [viewMode, setViewMode] = useState("table");
  const [dealData, setDealData] = useState(() => {
    if (pendingDuplicate) {
      const id = Math.max(0, ...initialDeals.map((d) => d.id)) + 1;
      return [{ ...pendingDuplicate, id, daysInStage: 0 }, ...initialDeals];
    }
    return initialDeals;
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [pendingMove, setPendingMove] = useState(null); // { deal, stage, missing }

  // Bulk action state
  const [bulkTask, setBulkTask] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [stagePickerOpen, setStagePickerOpen] = useState(false);
  const [ownerPickerOpen, setOwnerPickerOpen] = useState(false);
  const [pipelinePickerOpen, setPipelinePickerOpen] = useState(false);
  const [exportPickerOpen, setExportPickerOpen] = useState(false);
  const stageRef = useRef(null);
  const ownerRef = useRef(null);
  const pipelineRef = useRef(null);
  const exportRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Consume the pending duplicate (navigated here from DealDetailPage → Duplicate).
  useEffect(() => {
    if (pendingDuplicate) {
      setToast(`Duplicated: ${pendingDuplicate.name}`);
      setTimeout(() => setToast(null), 3500);
      onDuplicateConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!stageRef.current?.contains(e.target)) setStagePickerOpen(false);
      if (!ownerRef.current?.contains(e.target)) setOwnerPickerOpen(false);
      if (!pipelineRef.current?.contains(e.target)) setPipelinePickerOpen(false);
      if (!exportRef.current?.contains(e.target)) setExportPickerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const moveDeal = (id, stage, extraFields = {}) => {
    setDealData((prev) => prev.map((d) => d.id === id ? { ...d, stage, daysInStage: 0, ...extraFields } : d));
    showToast(`Moved to ${stage}`);
  };

  const handleDrop = (deal, stage) => {
    const missing = getMissingDealFields(deal, stage);
    if (missing.length === 0) {
      moveDeal(deal.id, stage);
    } else {
      setPendingMove({ deal, stage, missing });
    }
  };

  // Build columnMeta for the deal kanban (totals + Closed Won/Lost special styling)
  const columnMeta = Object.fromEntries(
    dealKanbanStages.map((stage) => {
      const items = dealData.filter((d) => d.stage === stage);
      const total = formatColTotal(items);
      const meta = { total };
      if (stage === "Closed Won") { meta.bg = "rgb(240 253 244 / 0.6)"; meta.borderColor = "#10b981"; }
      else if (stage === "Closed Lost") { meta.bg = "rgb(254 242 242 / 0.6)"; meta.borderColor = "#ef4444"; }
      return [stage, meta];
    })
  );

  const handleCreate = (deal) => {
    setCreateOpen(false);
    const id = Math.max(0, ...dealData.map((d) => d.id)) + 1;
    const amountRaw = Number(deal.amount) || 0;
    const formatted = amountRaw.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    const record = {
      id,
      name: deal.name,
      amountRaw,
      amount: formatted,
      stage: deal.stage,
      company: deal.company,
      isCustomerCompany: false,
      contact: deal.contacts?.[0] ?? "—",
      owner: deal.owner,
      closeDate: new Date(deal.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      source: deal.source || null,
      daysInStage: 0,
    };
    setDealData((prev) => [record, ...prev]);
    showToast(`Deal created: ${deal.name}`);
  };

  const bulkActions = [
    { label: "Change Stage", onClick: () => setStagePickerOpen((o) => !o) },
    { label: "Export", onClick: () => setExportPickerOpen((o) => !o) },
    { label: "Archive", danger: true, onClick: (count) => setConfirmState({ type: "archive", count }) },
    { label: "Create Task", onClick: () => setBulkTask(true) },
    { label: "Change Owner", overflow: true, onClick: () => setOwnerPickerOpen((o) => !o) },
    { label: "Change Pipeline", overflow: true, onClick: () => setPipelinePickerOpen((o) => !o) },
  ];

  const buildRowActions = (row) => [
    { label: "View Detail", onClick: () => onDealClick?.(row) },
    { label: "Edit", onClick: () => setEditTarget(row) },
    { label: "Archive", onClick: () => setConfirmState({ type: "archive", count: 1, row }), danger: true },
  ];

  const BulkPickers = () => (
    <>
      {stagePickerOpen && (
        <div ref={stageRef} className="fixed top-24 right-8 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-52">
          {DEAL_STAGES.map((s) => (
            <button key={s} onClick={() => { setStagePickerOpen(false); setConfirmState({ type: "stage", count: null, extra: s }); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{s}</button>
          ))}
        </div>
      )}
      {ownerPickerOpen && (
        <div ref={ownerRef} className="fixed top-24 right-8 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-52">
          {repNames.map((r) => (
            <button key={r} onClick={() => { setOwnerPickerOpen(false); setConfirmState({ type: "owner", count: null, extra: r }); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{r}</button>
          ))}
        </div>
      )}
      {pipelinePickerOpen && (
        <div ref={pipelineRef} className="fixed top-24 right-8 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-60">
          <p className="px-4 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Select Pipeline</p>
          {PIPELINES.map((p) => (
            <button key={p} onClick={() => { setPipelinePickerOpen(false); setConfirmState({ type: "pipeline", count: null, extra: p }); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{p}</button>
          ))}
          <p className="px-4 py-1.5 text-[10px] text-gray-400 border-t border-gray-100 mt-1">
            Stage will auto-map to first active stage in the new pipeline.
          </p>
        </div>
      )}
      {exportPickerOpen && (
        <div ref={exportRef} className="fixed top-24 right-8 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-40">
          {["CSV", "Excel"].map((fmt) => (
            <button key={fmt} onClick={() => { setExportPickerOpen(false); showToast(`Exporting records as ${fmt}…`); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{fmt}</button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      {viewMode === "kanban" ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
            <h1 className="text-lg font-semibold text-gray-900">Deals</h1>
            <div className="flex items-center gap-2">
              <ViewToggle mode={viewMode} onChange={setViewMode} />
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus size={14} />Create Deal
              </button>
            </div>
          </div>
          <KanbanBoard
            stages={dealKanbanStages}
            data={dealData}
            onCardClick={onDealClick}
            onDrop={handleDrop}
            renderCard={(item) => <DealCard item={item} />}
            columnMeta={columnMeta}
          />
        </div>
      ) : (
        <ListingPage
          entityType="Deals"
          data={dealData}
          columns={dealColumns}
          onRowClick={onDealClick}
          onViewChange={setViewMode}
          viewMode={viewMode}
          rowActions={buildRowActions}
          onCreate={() => setCreateOpen(true)}
          bulkActions={bulkActions}
        />
      )}

      <BulkPickers />

      <ConfirmModal
        open={!!confirmState}
        onClose={() => setConfirmState(null)}
        count={confirmState?.count ?? undefined}
        destructive={confirmState?.type === "archive"}
        undoable={confirmState?.type === "archive" ? true : undefined}
        title={
          confirmState?.type === "archive" ? "Archive Deals" :
          confirmState?.type === "stage" ? `Change Stage to "${confirmState?.extra}"` :
          confirmState?.type === "owner" ? `Change Owner: ${confirmState?.extra}` :
          confirmState?.type === "pipeline" ? `Move to Pipeline: ${confirmState?.extra}` : "Confirm"
        }
        message={
          confirmState?.type === "archive"
            ? `Archive ${confirmState.count} ${confirmState.count === 1 ? "deal" : "deals"}? They can be restored later.`
            : confirmState?.type === "stage"
            ? `Move deals to stage "${confirmState?.extra}"?`
            : confirmState?.type === "owner"
            ? `Assign ${confirmState?.extra} as owner of selected deals?`
            : confirmState?.type === "pipeline"
            ? `Move selected deals to "${confirmState?.extra}". Each deal's stage will auto-map to the first active stage in the new pipeline.`
            : ""
        }
        confirmLabel={confirmState?.type === "archive" ? "Archive" : "Apply"}
        onConfirm={() => {
          const { type, extra, count, row } = confirmState;
          if (type === "archive") {
            if (row) {
              setDealData((prev) => prev.filter((d) => d.id !== row.id));
              showToast(`Archived ${row.name}`);
            } else {
              showToast(`Archived ${count} ${count === 1 ? "deal" : "deals"}`);
            }
          }
          else if (type === "stage") showToast(`Changed stage to "${extra}"`);
          else if (type === "owner") showToast(`Changed owner to ${extra}`);
          else if (type === "pipeline") showToast(`Moved deals to "${extra}"`);
        }}
      />

      {/* Row Edit */}
      <SideSheet open={!!editTarget} onClose={() => setEditTarget(null)} title={editTarget ? `Edit ${editTarget.name}` : ""}>
        {editTarget && (
          <EditSheet
            groups={DEAL_EDIT_GROUPS}
            values={editTarget}
            entityLabel="Deal"
            onClose={() => setEditTarget(null)}
            onSave={(updated) => {
              setDealData((prev) => prev.map((d) => (d.id === editTarget.id ? { ...d, ...updated } : d)));
              setEditTarget(null);
              showToast(`${updated.name} updated`);
            }}
          />
        )}
      </SideSheet>

      {/* Mandatory-fields gate */}
      <SideSheet open={!!pendingMove} onClose={() => setPendingMove(null)} title="Complete Required Fields">
        {pendingMove && (
          <DealRequiredFieldsForm
            deal={pendingMove.deal}
            stage={pendingMove.stage}
            missing={pendingMove.missing}
            onCancel={() => setPendingMove(null)}
            onSave={(values) => {
              moveDeal(pendingMove.deal.id, pendingMove.stage, values);
              setPendingMove(null);
            }}
          />
        )}
      </SideSheet>

      <SideSheet open={createOpen} onClose={() => setCreateOpen(false)} title="Create Deal">
        {createOpen && (
          <CreateDeal onClose={() => setCreateOpen(false)} onDone={handleCreate} />
        )}
      </SideSheet>

      <SideSheet open={bulkTask} onClose={() => setBulkTask(false)} title="Create Task">
        {bulkTask && (
          <CreateTask
            entity={{ id: 0, type: "deal", name: "Selected Deals" }}
            contacts={[]}
            onClose={() => setBulkTask(false)}
            onSave={() => {
              setBulkTask(false);
              showToast("Task(s) created for selected deals");
            }}
          />
        )}
      </SideSheet>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
          {toast}
        </div>
      )}
    </>
  );
}
