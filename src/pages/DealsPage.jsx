import { useState, useRef, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import ListingPage from "../components/listings/ListingPage";
import SideSheet from "../components/shared/SideSheet";
import ConfirmModal from "../components/shared/ConfirmModal";
import CreateDeal from "../components/side-sheets/CreateDeal";
import { CreateTask } from "../components/side-sheets/log/index.jsx";
import { deals as initialDeals, dealColumns, repNames } from "../data/constants";

const DEAL_STAGES = ["Qualification", "Proposal", "Negotiation", "Contract Sent", "Closed Won", "Closed Lost"];
const PIPELINES = ["Default Sales Pipeline", "Enterprise Pipeline", "Renewal Pipeline"];

export default function DealsPage({ onDealClick }) {
  const [dealData, setDealData] = useState(initialDeals);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Bulk action state
  const [bulkTask, setBulkTask] = useState(false);
  const [confirmState, setConfirmState] = useState(null);
  const [stagePickerOpen, setStagePickerOpen] = useState(false);
  const [ownerPickerOpen, setOwnerPickerOpen] = useState(false);
  const [pipelinePickerOpen, setPipelinePickerOpen] = useState(false);
  const [exportPickerOpen, setExportPickerOpen] = useState(false);
  const stageRef = useRef(null);
  const ownerRef = useRef(null);
  const pipelineRef = useRef(null);
  const exportRef = useRef(null);

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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreate = (deal) => {
    setCreateOpen(false);
    const id = Math.max(0, ...dealData.map((d) => d.id)) + 1;
    const formatted = Number(deal.amount).toLocaleString("en-US", {
      style: "currency", currency: "USD", maximumFractionDigits: 0,
    });
    const record = {
      id,
      name: deal.name,
      amount: formatted,
      stage: deal.stage,
      company: deal.company,
      contact: deal.contacts?.[0] ?? "—",
      owner: deal.owner,
      closeDate: new Date(deal.closeDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    setDealData((prev) => [record, ...prev]);
    showToast(`Deal created: ${deal.name}`);
  };

  const bulkActions = [
    {
      label: "Change Stage",
      onClick: () => setStagePickerOpen((o) => !o),
    },
    {
      label: "Export",
      onClick: () => setExportPickerOpen((o) => !o),
    },
    {
      label: "Archive",
      danger: true,
      onClick: (count) => setConfirmState({ type: "archive", count }),
    },
    {
      label: "Create Task",
      onClick: () => setBulkTask(true),
    },
    {
      label: "Change Owner",
      overflow: true,
      onClick: () => setOwnerPickerOpen((o) => !o),
    },
    {
      label: "Change Pipeline",
      overflow: true,
      onClick: () => setPipelinePickerOpen((o) => !o),
    },
  ];

  const buildRowActions = (row) => [
    { label: "View Detail", onClick: () => onDealClick?.(row) },
    { label: "Edit", onClick: () => console.log("Edit deal", row.id) },
    { label: "Archive", onClick: () => console.log("Archive deal", row.id), danger: true },
  ];

  // Picker dropdowns anchored above bulk toolbar
  const BulkPickers = () => (
    <>
      {stagePickerOpen && (
        <div ref={stageRef} className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-52">
          {DEAL_STAGES.map((s) => (
            <button key={s} onClick={() => { setStagePickerOpen(false); setConfirmState({ type: "stage", count: null, extra: s }); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{s}</button>
          ))}
        </div>
      )}
      {ownerPickerOpen && (
        <div ref={ownerRef} className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-52">
          {repNames.map((r) => (
            <button key={r} onClick={() => { setOwnerPickerOpen(false); setConfirmState({ type: "owner", count: null, extra: r }); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{r}</button>
          ))}
        </div>
      )}
      {pipelinePickerOpen && (
        <div ref={pipelineRef} className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-60">
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
        <div ref={exportRef} className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-40">
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
      <ListingPage
        entityType="Deals"
        data={dealData}
        columns={dealColumns}
        onRowClick={onDealClick}
        rowActions={buildRowActions}
        onCreate={() => setCreateOpen(true)}
        bulkActions={bulkActions}
      />

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
          const { type, extra, count } = confirmState;
          if (type === "archive") showToast(`Archived ${count} ${count === 1 ? "deal" : "deals"}`);
          else if (type === "stage") showToast(`Changed stage to "${extra}"`);
          else if (type === "owner") showToast(`Changed owner to ${extra}`);
          else if (type === "pipeline") showToast(`Moved deals to "${extra}"`);
        }}
      />

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
