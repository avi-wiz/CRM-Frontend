import { useState, useCallback, useRef, useEffect } from "react";
import { List, LayoutGrid, Plus, CheckCircle, User, Clock } from "lucide-react";
import ListingPage from "../components/listings/ListingPage";
import KanbanBoard from "../components/listings/KanbanBoard";
import SideSheet from "../components/shared/SideSheet";
import ConfirmModal from "../components/shared/ConfirmModal";
import CustomerGateModal from "../components/shared/CustomerGateModal";
import MergeConvertContent from "../components/side-sheets/MergeConvert";
import ConvertCustomer from "../components/side-sheets/ConvertCustomer";
import GrantAccessContent, { normalizeContacts } from "../components/side-sheets/GrantAccess";
import { CreateTask } from "../components/side-sheets/log/index.jsx";
import {
  companies, companyColumns, kanbanStages, formatRelativeTime,
  stageMandatoryFields, companyFieldMeta, contacts as allContacts, repNames,
} from "../data/constants";

function isMissing(value) {
  return value === undefined || value === null || value === "" || value === false;
}

function getMissingFields(record, stage) {
  const required = stageMandatoryFields[stage] || [];
  return required.filter((key) => isMissing(record[key]));
}

const COMPANY_STAGES = ["New Lead", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"];

export default function CompaniesPage({ customerFilter = false, onRowClick }) {
  const [viewMode, setViewMode] = useState("table");
  const [createOpen, setCreateOpen] = useState(false);
  const [mergeSource, setMergeSource] = useState(null);
  const [mergeTitle, setMergeTitle] = useState("Merge / Convert");
  const [toast, setToast] = useState(null);
  const [companyData, setCompanyData] = useState(companies);
  const [pendingMove, setPendingMove] = useState(null);
  const [grantTarget, setGrantTarget] = useState(null);
  // Customer gate triggered by a Kanban "Won" drop: { company, stage }
  const [customerGate, setCustomerGate] = useState(null);
  // Convert-to-Customer side sheet driven by the gate.
  const [gateConvert, setGateConvert] = useState(null);

  // Bulk action state
  const [bulkTask, setBulkTask] = useState(false);
  const [bulkGrant, setBulkGrant] = useState(false);
  const [confirmState, setConfirmState] = useState(null); // { type, count, extra? }
  const [stagePickerOpen, setStagePickerOpen] = useState(false);
  const [ownerPickerOpen, setOwnerPickerOpen] = useState(false);
  const [exportPickerOpen, setExportPickerOpen] = useState(false);
  const stageRef = useRef(null);
  const ownerRef = useRef(null);
  const exportRef = useRef(null);

  const data = customerFilter ? companyData.filter((c) => c.isCustomer) : companyData;
  const entityType = customerFilter ? "Customers" : "Companies";

  const onTitleChange = useCallback((t) => setMergeTitle(t), []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Close pickers on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!stageRef.current?.contains(e.target)) setStagePickerOpen(false);
      if (!ownerRef.current?.contains(e.target)) setOwnerPickerOpen(false);
      if (!exportRef.current?.contains(e.target)) setExportPickerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMergeComplete = ({ source, target }) => {
    setMergeSource(null);
    showToast(`Merged ${source?.name} into ${target?.name}`);
  };

  const moveCompany = (id, stage, extraFields = {}) => {
    setCompanyData((prev) => prev.map((c) => (c.id === id ? { ...c, ...extraFields, stage } : c)));
    showToast(`Moved to ${stage}`);
  };

  const handleDrop = (company, stage) => {
    const missing = getMissingFields(company, stage);
    if (missing.length === 0) {
      moveCompany(company.id, stage);
    } else if (missing.length === 1 && missing[0] === "isCustomer") {
      // The "Won" gate: company must be a Customer first → show the Customer Gate
      // modal instead of the generic mandatory-field sheet.
      setCustomerGate({ company, stage });
    } else {
      setPendingMove({ company, stage, missing });
    }
  };

  // Gate → "Convert to Customer Now": close gate, open the convert side sheet.
  const handleGateConvert = () => {
    const ctx = customerGate;
    setCustomerGate(null);
    setGateConvert(ctx); // { company, stage }
  };

  // Convert completed → mark customer, then proceed with the original stage move.
  const handleGateConverted = (values) => {
    const { company, stage } = gateConvert;
    setGateConvert(null);
    setCompanyData((prev) => prev.map((c) => (c.id === company.id ? { ...c, ...values, isCustomer: true } : c)));
    showToast(`${company.name} converted to Customer`);
    setTimeout(() => moveCompany(company.id, stage), 1200);
  };

  // Bulk action handlers — receive (count, scope) from BulkToolbar
  const bulkActions = [
    {
      label: "Change Stage",
      onClick: (_count, _scope) => setStagePickerOpen((o) => !o),
    },
    {
      label: "Export",
      onClick: (_count, _scope) => setExportPickerOpen((o) => !o),
    },
    {
      label: "Archive",
      danger: true,
      onClick: (count, _scope) => setConfirmState({ type: "archive", count }),
    },
    {
      label: "Create Task",
      onClick: () => setBulkTask(true),
    },
    {
      label: "Assign Owner",
      overflow: true,
      onClick: (_count, _scope) => setOwnerPickerOpen((o) => !o),
    },
    {
      label: "Convert to Customer",
      overflow: true,
      onClick: (count, _scope) => setConfirmState({ type: "convert", count }),
    },
    {
      label: "Grant Web Access",
      overflow: true,
      onClick: () => setBulkGrant(true),
    },
  ];

  const renderCompanyCard = (item) => (
    <>
      <div className="font-semibold text-sm text-gray-900 mb-1.5">{item.name}</div>
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-1.5">
        <span className="flex items-center gap-1"><User size={11} />{item.rep}</span>
        <span className="flex items-center gap-1"><Clock size={11} />{formatRelativeTime(item.lastActivity)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{item.contactCount} contacts</span>
        {item.isCustomer ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Customer</span>
        ) : (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Company</span>
        )}
      </div>
    </>
  );

  const buildRowActions = (row) => [
    { label: "View Detail", onClick: () => onRowClick?.(row) },
    { label: "Merge / Convert", onClick: () => { setMergeTitle("Merge / Convert"); setMergeSource(row); } },
    { label: "Grant Web Access", onClick: () => setGrantTarget(row) },
    { label: "Archive", onClick: () => console.log("Archive", row.name), danger: true },
  ];

  // Bulk picker dropdowns (stage / owner / export) rendered absolutely relative to toolbar area.
  // We place them as portal-like fixed elements so they clear the table scroll.
  const BulkPickers = () => (
    <>
      {/* Stage picker */}
      {stagePickerOpen && (
        <div ref={stageRef} className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-52">
          {COMPANY_STAGES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStagePickerOpen(false);
                setConfirmState({ type: "stage", count: null, extra: s });
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Owner picker */}
      {ownerPickerOpen && (
        <div ref={ownerRef} className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-52">
          {repNames.map((r) => (
            <button
              key={r}
              onClick={() => {
                setOwnerPickerOpen(false);
                setConfirmState({ type: "owner", count: null, extra: r });
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Export picker */}
      {exportPickerOpen && (
        <div ref={exportRef} className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 w-40">
          {["CSV", "Excel"].map((fmt) => (
            <button
              key={fmt}
              onClick={() => {
                setExportPickerOpen(false);
                showToast(`Exporting records as ${fmt}…`);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {fmt}
            </button>
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
            <h1 className="text-lg font-semibold text-gray-900">{entityType}</h1>
            <div className="flex items-center gap-2">
              <ViewToggle mode={viewMode} onChange={setViewMode} />
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus size={14} />Create Company
              </button>
            </div>
          </div>
          <KanbanBoard
            stages={kanbanStages}
            data={data}
            onCardClick={onRowClick}
            onDrop={handleDrop}
            renderCard={renderCompanyCard}
          />
        </div>
      ) : (
        <ListingPage
          entityType={entityType}
          data={data}
          columns={companyColumns}
          onRowClick={onRowClick}
          onViewChange={setViewMode}
          viewMode={viewMode}
          rowActions={buildRowActions}
          onCreate={() => setCreateOpen(true)}
          bulkActions={bulkActions}
        />
      )}

      <BulkPickers />

      {/* Confirmation modal */}
      <ConfirmModal
        open={!!confirmState}
        onClose={() => setConfirmState(null)}
        count={confirmState?.count ?? undefined}
        destructive={confirmState?.type === "archive"}
        undoable={confirmState?.type === "archive" ? true : undefined}
        title={
          confirmState?.type === "archive" ? "Archive Companies" :
          confirmState?.type === "stage" ? `Change Stage to "${confirmState.extra}"` :
          confirmState?.type === "owner" ? `Assign Owner: ${confirmState.extra}` :
          confirmState?.type === "convert" ? "Convert to Customer" : "Confirm"
        }
        message={
          confirmState?.type === "archive"
            ? `Archive ${confirmState.count} ${confirmState.count === 1 ? "company" : "companies"}? They will be hidden from the active list but can be restored.`
            : confirmState?.type === "stage"
            ? `Move companies to stage "${confirmState.extra}"?`
            : confirmState?.type === "owner"
            ? `Assign ${confirmState.extra} as owner of selected companies?`
            : confirmState?.type === "convert"
            ? `Convert selected companies to Customers? This updates their type and unlocks customer-specific fields.`
            : ""
        }
        confirmLabel={
          confirmState?.type === "archive" ? "Archive" :
          confirmState?.type === "convert" ? "Convert" : "Apply"
        }
        onConfirm={() => {
          const type = confirmState?.type;
          const extra = confirmState?.extra;
          const count = confirmState?.count;
          if (type === "archive") showToast(`Archived ${count} ${count === 1 ? "company" : "companies"}`);
          else if (type === "stage") showToast(`Changed stage to "${extra}"`);
          else if (type === "owner") showToast(`Assigned ${extra} as owner`);
          else if (type === "convert") showToast("Converted to Customers");
        }}
      />

      {/* Create company placeholder */}
      <SideSheet open={createOpen} onClose={() => setCreateOpen(false)} title="Create Company">
        <div className="text-sm text-gray-500">Form coming in Flow 5</div>
      </SideSheet>

      {/* Merge / Convert */}
      <SideSheet open={!!mergeSource} onClose={() => setMergeSource(null)} title={mergeTitle} width="max-w-lg">
        {mergeSource && (
          <MergeConvertContent
            source={mergeSource}
            onTitleChange={onTitleChange}
            onClose={() => setMergeSource(null)}
            onComplete={handleMergeComplete}
          />
        )}
      </SideSheet>

      {/* Grant Web Access (single company) */}
      <SideSheet
        open={!!grantTarget && !bulkGrant}
        onClose={() => setGrantTarget(null)}
        title={grantTarget ? `Grant WizShop Access — ${grantTarget.name}` : ""}
      >
        {grantTarget && !bulkGrant && (
          <GrantAccessContent
            contacts={normalizeContacts(allContacts.filter((c) => c.companyId === grantTarget.id))}
            onClose={() => setGrantTarget(null)}
            onDone={(count) => {
              setGrantTarget(null);
              showToast(`Created WizShop access for ${count} contact${count === 1 ? "" : "s"}`);
            }}
          />
        )}
      </SideSheet>

      {/* Grant Web Access — bulk (all contacts of selected companies) */}
      <SideSheet
        open={bulkGrant}
        onClose={() => setBulkGrant(false)}
        title="Grant WizShop Access — Selected Companies"
      >
        {bulkGrant && (
          <GrantAccessContent
            contacts={normalizeContacts(allContacts)}
            onClose={() => setBulkGrant(false)}
            onDone={(count) => {
              setBulkGrant(false);
              showToast(`Created WizShop access for ${count} contact${count === 1 ? "" : "s"}`);
            }}
          />
        )}
      </SideSheet>

      {/* Create Task — bulk */}
      <SideSheet open={bulkTask} onClose={() => setBulkTask(false)} title="Create Task">
        {bulkTask && (
          <CreateTask
            entity={{ id: 0, type: "company", name: "Selected Companies" }}
            contacts={normalizeContacts(allContacts)}
            onClose={() => setBulkTask(false)}
            onSave={() => {
              setBulkTask(false);
              showToast("Task(s) created for selected companies");
            }}
          />
        )}
      </SideSheet>

      {/* Mandatory-fields gate */}
      <SideSheet open={!!pendingMove} onClose={() => setPendingMove(null)} title="Complete Required Fields">
        {pendingMove && (
          <RequiredFieldsForm
            company={pendingMove.company}
            stage={pendingMove.stage}
            missing={pendingMove.missing}
            onCancel={() => setPendingMove(null)}
            onSave={(values) => {
              moveCompany(pendingMove.company.id, pendingMove.stage, values);
              setPendingMove(null);
            }}
          />
        )}
      </SideSheet>

      {/* Customer Gate (Kanban "Won" drop on a non-Customer company) */}
      <CustomerGateModal
        open={!!customerGate}
        onClose={() => setCustomerGate(null)}
        companyName={customerGate?.company?.name}
        context="stage_movement"
        title="Customer Required to Win"
        message={
          <>
            <strong className="text-gray-900">{customerGate?.company?.name}</strong> is a{" "}
            <strong className="text-gray-900">Company</strong>, not yet a{" "}
            <strong className="text-gray-900">Customer</strong>. Convert it before moving the deal to{" "}
            <strong className="text-gray-900">{customerGate?.stage}</strong>.
          </>
        }
        onConvert={handleGateConvert}
      />

      {/* Convert-to-Customer side sheet launched by the gate */}
      <SideSheet open={!!gateConvert} onClose={() => setGateConvert(null)} title="Convert to Customer">
        {gateConvert && (
          <ConvertCustomer
            company={gateConvert.company}
            onClose={() => setGateConvert(null)}
            onDone={handleGateConverted}
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

function RequiredFieldsForm({ company, stage, missing, onCancel, onSave }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(missing.map((key) => [key, companyFieldMeta[key]?.type === "boolean" ? false : ""]))
  );
  const set = (key, v) => setValues((prev) => ({ ...prev, [key]: v }));
  const allFilled = missing.every((key) => !isMissing(values[key]));

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        To move <strong className="text-gray-900">{company.name}</strong> to{" "}
        <strong className="text-gray-900">{stage}</strong>, please fill in these fields:
      </p>
      <div className="space-y-3">
        {missing.map((key) => {
          const meta = companyFieldMeta[key] || { label: key, type: "text" };
          return (
            <div key={key}>
              <label className="text-xs text-gray-500 block mb-1">
                {meta.label} <span className="text-red-500">*</span>
              </label>
              {meta.type === "select" ? (
                <select
                  value={values[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300"
                >
                  <option value="">Select {meta.label}…</option>
                  {meta.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : meta.type === "boolean" ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!values[key]} onChange={(e) => set(key, e.target.checked)} className="rounded accent-indigo-600" />
                  <span className="text-sm text-gray-700">Mark as Customer</span>
                </label>
              ) : meta.type === "currency" ? (
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-gray-400">$</span>
                  <input type="text" value={values[key]} onChange={(e) => set(key, e.target.value)} placeholder="0"
                    className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                </div>
              ) : (
                <input type={meta.type === "number" ? "number" : "text"} value={values[key]} onChange={(e) => set(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300" />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-5">
        <button
          onClick={() => onSave(values)}
          disabled={!allFilled}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${allFilled ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        >
          Save &amp; Move
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
      </div>
    </div>
  );
}

function ViewToggle({ mode, onChange }) {
  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden mr-2">
      <button onClick={() => onChange("table")} className={`p-1.5 ${mode === "table" ? "bg-gray-100" : "hover:bg-gray-50"}`}><List size={16} /></button>
      <button onClick={() => onChange("kanban")} className={`p-1.5 ${mode === "kanban" ? "bg-gray-100" : "hover:bg-gray-50"}`}><LayoutGrid size={16} /></button>
    </div>
  );
}
