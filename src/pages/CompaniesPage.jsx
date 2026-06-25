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
import CreateCompanyPage from "./CreateCompanyPage";
import { getMissingFieldsForStage, RequiredFieldsForm } from "../components/shared/stageGate";
import {
  companies, companyColumns, kanbanStages, formatRelativeTime,
  contacts as allContacts, repNames, orgSettings,
} from "../data/constants";

const COMPANY_STAGES = ["New Lead", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"];

// Above this many companies, "prompt" mode falls back to auto-move (avoid N prompts).
const BULK_PROMPT_LIMIT = 5;

// Build the post-conversion summary toast from a { contactsMoved, wizShopCreated } summary.
function conversionSummary(conv, companyLabel) {
  const moved = conv?.contactsMoved ?? 0;
  const wiz = conv?.wizShopCreated ?? 0;
  if (conv?.contactMovement === "do_not_move") {
    return `${companyLabel} converted to Customer. Contacts remain unchanged.`;
  }
  let msg = `${companyLabel} converted to Customer. ${moved} contact${moved === 1 ? "" : "s"} moved`;
  msg += conv?.contactMovement === "auto_move_all" ? " automatically" : "";
  if (wiz > 0) msg += `. ${wiz} WizShop user${wiz === 1 ? "" : "s"} created`;
  return msg + ".";
}

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
  // Convert-to-Customer launched from the Merge/Convert sheet header CTA.
  const [convertSource, setConvertSource] = useState(null);

  // Bulk action state
  const [bulkTask, setBulkTask] = useState(false);
  const [bulkGrant, setBulkGrant] = useState(false);
  const [confirmState, setConfirmState] = useState(null); // { type, count, extra? }
  // Bulk conversion progress: { current, total } while iterating, else null.
  const [bulkConvertProgress, setBulkConvertProgress] = useState(null);
  const [stagePickerOpen, setStagePickerOpen] = useState(false);
  const [ownerPickerOpen, setOwnerPickerOpen] = useState(false);
  const [exportPickerOpen, setExportPickerOpen] = useState(false);
  const stageRef = useRef(null);
  const ownerRef = useRef(null);
  const exportRef = useRef(null);

  const data = customerFilter ? companyData.filter((c) => c.isCustomer) : companyData;
  const entityType = customerFilter ? "Customers" : "Companies";

  const onTitleChange = useCallback((t) => setMergeTitle(t), []);
  // Header back handler reported up by the merge flow (null on its first step).
  const [mergeHeaderBack, setMergeHeaderBack] = useState(null);
  const onMergeHeaderBackChange = useCallback((fn) => setMergeHeaderBack(() => fn), []);

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

  const handleMergeComplete = ({ source, target, primary, grantAccess, granted }) => {
    setMergeSource(null);
    const primaryRecord = primary === "source" ? source : target;
    const secondaryRecord = primary === "source" ? target : source;
    const grantNote =
      grantAccess && granted?.length
        ? ` · WizShop access granted to ${granted.length} contact${granted.length === 1 ? "" : "s"}`
        : "";
    showToast(`Merged ${secondaryRecord?.name} into ${primaryRecord?.name}${grantNote}`);
  };

  // Merge/Convert header CTA → switch from merge sheet to the Convert flow.
  const handleConvertFromMerge = () => {
    setConvertSource(mergeSource);
    setMergeSource(null);
  };

  const handleConverted = (values) => {
    const company = convertSource;
    setConvertSource(null);
    setCompanyData((prev) => prev.map((c) => (c.id === company.id ? { ...c, ...values, isCustomer: true } : c)));
    showToast(conversionSummary(values.conversion, company.name));
  };

  const moveCompany = (id, stage, extraFields = {}) => {
    setCompanyData((prev) => prev.map((c) => (c.id === id ? { ...c, ...extraFields, stage } : c)));
    showToast(`Moved to ${stage}`);
  };

  const handleDrop = (company, stage) => {
    const missing = getMissingFieldsForStage(company, stage, "company");
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
    showToast(conversionSummary(values.conversion, company.name));
    setTimeout(() => moveCompany(company.id, stage), 1400);
  };

  // Bulk convert: iterate selected companies, applying contact movement per org setting.
  // The BulkToolbar passes a count (not ids), so we approximate the selection as the
  // first `count` non-customer companies from the current filtered view.
  const runBulkConvert = (count) => {
    const cc = orgSettings.customerConversion;
    const targets = data.filter((c) => !c.isCustomer).slice(0, count);
    const total = targets.length;
    if (total === 0) {
      showToast("No companies to convert.");
      return;
    }

    // >5 prompt → fall back to auto-move (no per-company prompts in bulk).
    const effectiveMovement =
      cc.contactMovement === "prompt" && total > BULK_PROMPT_LIMIT ? "auto_move_all" : cc.contactMovement;

    let contactsMoved = 0;
    let wizShopCreated = 0;

    setBulkConvertProgress({ current: 0, total });

    targets.forEach((company, i) => {
      // Stagger so the "Converting… [n/total]" indicator is visible in the prototype.
      setTimeout(() => {
        const companyContacts = allContacts.filter((c) => c.companyId === company.id);
        if (effectiveMovement === "auto_move_all") {
          contactsMoved += companyContacts.length;
          if (cc.autoCreateWizShopUsers) {
            wizShopCreated += companyContacts.filter((c) => !c.isWizShopUser).length;
          }
        }
        // "do_not_move" → contactsMoved stays 0; "prompt" (≤5) → also auto in bulk simplification.

        setCompanyData((prev) => prev.map((c) => (c.id === company.id ? { ...c, isCustomer: true } : c)));
        setBulkConvertProgress({ current: i + 1, total });

        if (i === total - 1) {
          setTimeout(() => {
            setBulkConvertProgress(null);
            const movedClause =
              effectiveMovement === "do_not_move"
                ? "Contacts unchanged"
                : `${contactsMoved} contact${contactsMoved === 1 ? "" : "s"} moved`;
            const wizClause = wizShopCreated > 0 ? ` ${wizShopCreated} WizShop user${wizShopCreated === 1 ? "" : "s"} created.` : "";
            showToast(`Converted ${total} ${total === 1 ? "company" : "companies"}. ${movedClause}.${wizClause}`);
          }, 350);
        }
      }, i * 260);
    });
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
      <div className="font-semibold text-sm text-ink mb-1.5">{item.name}</div>
      <div className="flex items-center gap-3 text-xs text-muted mb-1.5">
        <span className="flex items-center gap-1"><User size={11} />{item.rep}</span>
        <span className="flex items-center gap-1"><Clock size={11} />{formatRelativeTime(item.lastActivity)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-disabled">{item.contactCount} contacts</span>
        {item.isCustomer ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success-bg text-success-dark">Customer</span>
        ) : (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-default text-muted">Company</span>
        )}
      </div>
    </>
  );

  const buildRowActions = (row) => [
    { label: "View Detail", onClick: () => onRowClick?.(row) },
    { label: "Merge / Convert", onClick: () => { setMergeTitle("Merge / Convert"); setMergeSource(row); } },
    { label: "Grant Web Access", onClick: () => setGrantTarget(row) },
    { label: "Archive", onClick: () => setConfirmState({ type: "archive", count: 1, row }), danger: true },
  ];

  // Bulk picker dropdowns (stage / owner / export) rendered absolutely relative to toolbar area.
  // We place them as portal-like fixed elements so they clear the table scroll.
  const BulkPickers = () => (
    <>
      {/* Stage picker */}
      {stagePickerOpen && (
        <div ref={stageRef} className="fixed top-24 right-8 bg-surface border border-border rounded-xl shadow-4 py-1 z-50 w-52">
          {COMPANY_STAGES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStagePickerOpen(false);
                setConfirmState({ type: "stage", count: null, extra: s });
              }}
              className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-action-hover"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Owner picker */}
      {ownerPickerOpen && (
        <div ref={ownerRef} className="fixed top-24 right-8 bg-surface border border-border rounded-xl shadow-4 py-1 z-50 w-52">
          {repNames.map((r) => (
            <button
              key={r}
              onClick={() => {
                setOwnerPickerOpen(false);
                setConfirmState({ type: "owner", count: null, extra: r });
              }}
              className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-action-hover"
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Export picker */}
      {exportPickerOpen && (
        <div ref={exportRef} className="fixed top-24 right-8 bg-surface border border-border rounded-xl shadow-4 py-1 z-50 w-40">
          {["CSV", "Excel"].map((fmt) => (
            <button
              key={fmt}
              onClick={() => {
                setExportPickerOpen(false);
                showToast(`Exporting records as ${fmt}…`);
              }}
              className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-action-hover"
            >
              {fmt}
            </button>
          ))}
        </div>
      )}
    </>
  );

  // Full-screen create flow replaces the listing while open.
  if (createOpen) {
    return (
      <CreateCompanyPage
        isCustomer={customerFilter}
        onBack={() => setCreateOpen(false)}
        onCreate={(company) => {
          const today = new Date().toISOString().slice(0, 10);
          setCompanyData((rows) => {
            const nextId = Math.max(0, ...rows.map((r) => r.id || 0)) + 1;
            return [{ id: nextId, createdAt: today, lastActivity: today, ...company }, ...rows];
          });
          setCreateOpen(false);
          showToast(`${company.name} created`);
        }}
      />
    );
  }

  return (
    <>
      {viewMode === "kanban" ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
            <h1 className="text-lg font-semibold text-ink">{entityType}</h1>
            <div className="flex items-center gap-2">
              <ViewToggle mode={viewMode} onChange={setViewMode} />
              <button
                onClick={() => setCreateOpen(true)}
                className="wiz-btn wiz-btn--primary flex items-center gap-1.5 px-3 py-1.5"
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
            ? <BulkConvertMessage count={confirmState.count} />
            : ""
        }
        confirmLabel={
          confirmState?.type === "archive" ? "Archive" :
          confirmState?.type === "convert" ? `Convert ${confirmState.count} ${confirmState.count === 1 ? "Company" : "Companies"}` : "Apply"
        }
        onConfirm={() => {
          const type = confirmState?.type;
          const extra = confirmState?.extra;
          const count = confirmState?.count;
          if (type === "archive") {
            const row = confirmState?.row;
            if (row) {
              setCompanyData((prev) => prev.filter((c) => c.id !== row.id));
              showToast(`Archived ${row.name}`);
            } else {
              showToast(`Archived ${count} ${count === 1 ? "company" : "companies"}`);
            }
          }
          else if (type === "stage") showToast(`Changed stage to "${extra}"`);
          else if (type === "owner") showToast(`Assigned ${extra} as owner`);
          else if (type === "convert") runBulkConvert(count);
        }}
      />

      {/* Create company */}
      {/* Merge / Convert */}
      <SideSheet
        open={!!mergeSource}
        onClose={() => setMergeSource(null)}
        title={mergeTitle}
        width="max-w-lg"
        onHeaderBack={mergeHeaderBack || undefined}
        headerAction={
          mergeSource && !mergeSource.isCustomer ? (
            <button
              onClick={handleConvertFromMerge}
              className="wiz-btn wiz-btn--secondary wiz-btn--sm whitespace-nowrap"
            >
              Convert to Customer
            </button>
          ) : null
        }
      >
        {mergeSource && (
          <MergeConvertContent
            source={mergeSource}
            onTitleChange={onTitleChange}
            onHeaderBackChange={onMergeHeaderBackChange}
            onClose={() => setMergeSource(null)}
            onComplete={handleMergeComplete}
          />
        )}
      </SideSheet>

      {/* Convert to Customer — launched from the Merge/Convert header CTA */}
      <SideSheet open={!!convertSource} onClose={() => setConvertSource(null)} title="Convert to Customer">
        {convertSource && (
          <ConvertCustomer
            company={convertSource}
            onClose={() => setConvertSource(null)}
            onDone={handleConverted}
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
            record={pendingMove.company}
            entityName={pendingMove.company.name}
            entityType="company"
            stage={pendingMove.stage}
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
            <strong className="text-ink">{customerGate?.company?.name}</strong> is a{" "}
            <strong className="text-ink">Company</strong>, not yet a{" "}
            <strong className="text-ink">Customer</strong>. Convert it before moving the deal to{" "}
            <strong className="text-ink">{customerGate?.stage}</strong>.
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

      {/* Bulk conversion progress indicator */}
      {bulkConvertProgress && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
          Converting… [{bulkConvertProgress.current}/{bulkConvertProgress.total}]
        </div>
      )}

      {toast && !bulkConvertProgress && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-success flex-shrink-0" />
          {toast}
        </div>
      )}
    </>
  );
}

// Bulk "Convert to Customer" confirmation body — shows the current org behavior,
// the >5 prompt-fallback warning, and a settings link. Reads orgSettings live.
function BulkConvertMessage({ count }) {
  const mode = orgSettings.customerConversion.contactMovement;
  const isBulkPromptFallback = mode === "prompt" && count > BULK_PROMPT_LIMIT;

  return (
    <span className="block">
      <span className="block text-muted">
        Convert {count} {count === 1 ? "company" : "companies"} to Customers? This updates their type and unlocks customer-specific fields.
      </span>

      <span className="block mt-3 text-xs">
        {mode === "auto_move_all" && (
          <span className="text-muted">All associated contacts will be moved automatically (org setting).</span>
        )}
        {mode === "do_not_move" && (
          <span className="text-muted">Contacts will not be moved (org setting).</span>
        )}
        {mode === "prompt" && !isBulkPromptFallback && (
          <span className="text-muted">You will be prompted to select contacts for each company.</span>
        )}
        {isBulkPromptFallback && (
          <span className="block px-2.5 py-2 rounded-lg bg-warning-bg border border-border text-warning-dark">
            For bulk conversions of more than {BULK_PROMPT_LIMIT} companies, contacts will be moved automatically to
            avoid {count} prompts. Change this in Org Settings.
          </span>
        )}
      </span>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); console.log("Navigate to Org Settings → Customer Conversion"); }}
        className="inline-block mt-3 text-xs text-primary hover:text-primary-dark"
      >
        Change behavior in Org Settings →
      </button>
    </span>
  );
}

function ViewToggle({ mode, onChange }) {
  return (
    <div className="flex border border-border rounded-lg overflow-hidden mr-2">
      <button onClick={() => onChange("table")} className={`p-1.5 ${mode === "table" ? "bg-action-selected" : "hover:bg-action-hover"}`}><List size={16} /></button>
      <button onClick={() => onChange("kanban")} className={`p-1.5 ${mode === "kanban" ? "bg-action-selected" : "hover:bg-action-hover"}`}><LayoutGrid size={16} /></button>
    </div>
  );
}
