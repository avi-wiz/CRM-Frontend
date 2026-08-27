import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MoreHorizontal, CheckCircle, Plus } from "lucide-react";
import StageBadge from "../components/shared/StageBadge";
import SideSheet from "../components/shared/SideSheet";
import ConfirmModal from "../components/shared/ConfirmModal";
import CustomerGateModal from "../components/shared/CustomerGateModal";
import { getMissingFieldsForStage, RequiredFieldsForm } from "../components/shared/stageGate";
import PropertiesPanel from "../components/detail/PropertiesPanel";
import CenterTabs from "../components/detail/CenterTabs";
import AssociationsPanel from "../components/detail/AssociationsPanel";
import { ConvertCustomerContent } from "../components/side-sheets/index";
import { LOG_SHEETS, nowStamp } from "../components/side-sheets/log";
import ComposeEmail from "../components/side-sheets/email/ComposeEmail";
import GrantAccessContent, { normalizeContacts } from "../components/side-sheets/GrantAccess";
import CreateDeal from "../components/side-sheets/CreateDeal";
import CreateContactPage from "./CreateContactPage";
import { EditSheet } from "../components/side-sheets/EditSheet";
import CreateQuote from "../components/side-sheets/CreateQuote";
import { useCompanyQuotes, addQuote } from "../data/quotesStore";
import { logActivityFromEntity } from "../data/logActivity";
import { getCompanyDetail, kanbanStages, industries, leadSources, repNames } from "../data/constants";

// Activity logging action keys handled by the shared log sheets. "email" is
// handled separately below — it opens the real Nylas ComposeEmail sheet
// instead of the manual "log what happened" mock form.
const LOG_ACTIONS = ["note", "meeting", "task", "visit"];

// Property-group config for the Company entity (left panel).
/**
 * FORM SOURCE: Org Settings → Forms → Company
 * All fields from Company form builder, in configured order.
 * When Company is in Customer stage: star-flagged fields show enforced validation.
 * Read-only-when-value-exists fields: show lock icon if value is set.
 * Attribute Sync fields: show sync icon with "Synced from/to [Entity.Field]" tooltip.
 *
 * TODO(form-builder-parity): This panel uses "Billing Address"/"Shipping Address"
 *   and a "Stage"/"Is Customer" field, whereas the builder names them
 *   "Bill-to Address"/"Ship-to Address" and omits Stage/Is Customer from the
 *   Company form. Builder-only fields not shown here: Tax ID, Payment Terms,
 *   Customer Code, Default Price List, Region (Attribute Sync). Reconcile against
 *   Org Settings → Forms → Company sample data.
 */
const PROPERTY_GROUPS = [
  {
    title: "Company Info",
    fields: [
      { key: "name", label: "Company Name", type: "text", required: true },
      { key: "domain", label: "Domain", type: "text" },
      { key: "industry", label: "Industry", type: "select", options: industries },
      { key: "employeeCount", label: "Employee Count", type: "number" },
      { key: "annualRevenue", label: "Annual Revenue", type: "currency" },
    ],
  },
  {
    title: "CRM Status",
    fields: [
      { key: "stage", label: "Stage", type: "select", options: kanbanStages },
      { key: "isCustomer", label: "Is Customer", type: "boolean", readOnly: true },
      { key: "accountOwner", label: "Account Owner", type: "select", options: repNames },
      { key: "leadSource", label: "Lead Source", type: "select", options: leadSources },
    ],
  },
  // Addresses (Billing / Shipping) are managed from the right-side Associations
  // panel, so they're intentionally omitted from this left panel.
];

// Maps an action key → side sheet { title, content }. The 5 activity-logging
// actions render the shared log sheets; the rest use the real or placeholder forms.
function sheetFor(action, company, handlers) {
  const { onConversionDone, onGrantDone, onClose, onLogSave, onDealCreated, onContactCreated } = handlers;

  // Activity logging sheets (note/meeting/task/email/visit).
  if (LOG_ACTIONS.includes(action)) {
    const { title, Component } = LOG_SHEETS[action];
    const entity = { id: company.id, type: company.isCustomer ? "customer" : "company", name: company.name };
    return {
      title,
      content: (
        <Component
          entity={entity}
          contacts={normalizeContacts(company.contacts)}
          onClose={onClose}
          onSave={onLogSave}
        />
      ),
    };
  }

  switch (action) {
    case "email": {
      const entity = { id: company.id, type: company.isCustomer ? "customer" : "company", name: company.name };
      return {
        title: "Create Email",
        content: (
          <ComposeEmail
            mode="new"
            entity={entity}
            contacts={normalizeContacts(company.contacts)}
            onClose={onClose}
            onSent={onClose}
          />
        ),
      };
    }
    case "convert": return { title: `Convert ${company.name} to Customer`, content: <ConvertCustomerContent entity={company} onDone={onConversionDone} /> };
    case "grantAccess": return {
      title: `Grant WizShop Access — ${company.name}`,
      content: <GrantAccessContent contacts={normalizeContacts(company.contacts)} onClose={onClose} onDone={onGrantDone} />,
    };
    case "addDeal": return {
      title: "Create Deal",
      width: "max-w-lg",
      content: <CreateDeal initialCompany={company} onClose={onClose} onDone={onDealCreated} />,
    };
    case "editBilling": return { title: "Edit Billing Address", content: <Placeholder /> };
    case "editShipping": return { title: "Edit Shipping Address", content: <Placeholder /> };
    case "editPayment": return { title: "Edit Payment Terms", content: <Placeholder /> };
    case "linkCompany": return { title: "Link Company", content: <Placeholder /> };
    default: return null;
  }
}

function Placeholder({ flow }) {
  return <div className="text-sm text-muted">Form coming{flow ? ` in ${flow}` : " soon"}.</div>;
}

export default function CompanyDetailPage({ companyId, onBack, onContactClick, onDealClick, onQuoteClick, onVisitClick, onTaskClick, onMeetingClick }) {
  // Local, non-persistent edit state seeded from the merged detail record.
  const [company, setCompany] = useState(() => getCompanyDetail(companyId));
  const [sheet, setSheet] = useState(null); // action key or null
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null); // { message }
  const [orderGateOpen, setOrderGateOpen] = useState(false); // Customer gate for "Create Order"
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  // Mandatory-field gate for stage changes: { stage, missing } or null.
  const [pendingStageMove, setPendingStageMove] = useState(null);
  // Stage to advance to after a Won-triggered conversion completes.
  const convertThenStage = useRef(null);
  const quotes = useCompanyQuotes(companyId);

  // "Create Order" entry point — gate inline if this company isn't a Customer.
  const handleCreateOrder = () => {
    setMenuOpen(false);
    if (company.isCustomer) {
      showToast("Opening order form…");
    } else {
      setOrderGateOpen(true);
    }
  };

  const updateField = (key, value) => setCompany((c) => ({ ...c, [key]: value }));

  // Stage change from the pipeline control — gate on mandatory fields the same
  // way the Kanban board does. If fields are missing, prompt before moving.
  const handleStageChange = (nextStage) => {
    if (nextStage === company.stage) return;
    const missing = getMissingFieldsForStage(company, nextStage, "company");
    if (missing.length === 0) {
      updateField("stage", nextStage);
      showToast(`Moved to ${nextStage}`);
    } else if (missing.length === 1 && missing[0] === "isCustomer") {
      // "Won" with only the customer requirement outstanding → run the real
      // Convert-to-Customer flow rather than a bare "Mark as Customer" checkbox.
      // Remember the stage so we can complete the move once converted.
      convertThenStage.current = nextStage;
      setPendingStageMove(null);
      setSheet("convert");
    } else {
      setPendingStageMove({ stage: nextStage, missing });
    }
  };

  const showToast = (message) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleConversionDone = () => {
    const advanceTo = convertThenStage.current;
    convertThenStage.current = null;
    setCompany((c) => ({ ...c, isCustomer: true, ...(advanceTo ? { stage: advanceTo } : {}) }));
    setSheet(null);
    showToast(advanceTo ? `${company.name} is now a Customer · moved to ${advanceTo}` : `${company.name} is now a Customer`);
  };

  const handleGrantDone = (count) => {
    setSheet(null);
    showToast(`Created WizShop access for ${count} contact${count === 1 ? "" : "s"}`);
  };

  // Add a newly-created deal to the company's associated deals list.
  const handleDealCreated = (deal) => {
    const amountRaw = Number(String(deal.amount).replace(/[^0-9.]/g, "")) || 0;
    const formatted = amountRaw.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
    setCompany((c) => {
      const nextId = Math.max(0, ...(c.deals || []).map((d) => d.id || 0)) + 1;
      const row = { id: nextId, name: deal.name, amount: formatted, stage: deal.stage, owner: deal.owner, closeDate: deal.closeDate };
      return { ...c, deals: [row, ...(c.deals || [])] };
    });
    setSheet(null);
    showToast(`Deal "${deal.name}" created`);
  };

  // Add a newly-created contact to the company's associated contacts list.
  const handleContactCreated = (contact) => {
    const name = `${contact.firstName} ${contact.lastName}`.trim();
    setCompany((c) => {
      const nextId = Math.max(0, ...(c.contacts || []).map((ct) => ct.id || 0)) + 1;
      const row = {
        id: nextId,
        name,
        email: contact.email,
        role: "User",
        wizshop: !!contact.isWizShopUser,
        wizshopStatus: contact.isWizShopUser ? "Active" : "Inactive",
      };
      return { ...c, contacts: [...(c.contacts || []), row] };
    });
    setSheet(null);
    showToast(`${name} added to ${company.name}`);
  };

  // Persist a logged activity to the right store, explicitly associated with
  // this company so it shows only on its (and any co-associated) timeline.
  const handleLogSave = (activity) => {
    const title = LOG_SHEETS[sheet]?.title || "Activity";
    const entity = { id: company.id, type: company.isCustomer ? "customer" : "company", name: company.name };
    logActivityFromEntity(entity, activity);
    setSheet(null);
    showToast(`${title} saved`);
  };

  const activeSheet = sheet
    ? sheetFor(sheet, company, {
        onConversionDone: handleConversionDone,
        onGrantDone: handleGrantDone,
        onClose: () => setSheet(null),
        onLogSave: handleLogSave,
        onDealCreated: handleDealCreated,
        onContactCreated: handleContactCreated,
      })
    : null;

  // "Add Contact" opens as a full-screen form with the company pre-locked,
  // replacing the detail page until done/cancelled.
  if (sheet === "addContact") {
    return (
      <CreateContactPage
        initialCompany={company}
        onBack={() => setSheet(null)}
        onDone={handleContactCreated}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-divider bg-surface">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-action-hover text-muted hover:text-ink transition-colors" title="Back to listing">
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[10px] font-bold text-disabled uppercase tracking-widest">Company</span>
            <h1 className="text-xl font-bold text-ink tracking-tight">{company.name}</h1>
          </div>
          <StageBadge stage={company.stage} />
          {company.isCustomer ? (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success-bg text-success-dark">Customer</span>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-default text-muted">Company</span>
          )}
          {company.source && (
            <span className="text-xs text-disabled">Source: {company.source}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!company.isCustomer && (
            <button onClick={() => setSheet("convert")} className="wiz-btn wiz-btn--primary">
              Convert to Customer
            </button>
          )}
          {company.isCustomer && (
            <button
              onClick={handleCreateOrder}
              className="wiz-btn wiz-btn--primary flex items-center gap-1.5"
            >
              <Plus size={15} /> Create Order
            </button>
          )}
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="p-2 border border-border rounded-xl text-muted hover:bg-action-hover hover:text-ink shadow-1 transition-all duration-200">
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-30 bg-surface border border-border rounded-lg shadow-3 py-1 w-44">
                  {["Merge", "Export"].map((item) => (
                    <button
                      key={item}
                      onClick={() => { showToast(`${item} — coming soon`); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-muted hover:bg-action-hover"
                    >
                      {item}
                    </button>
                  ))}
                  <div className="border-t border-divider mt-1 pt-1">
                    <button
                      onClick={() => { setMenuOpen(false); setArchiveOpen(true); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-danger-dark hover:bg-danger-bg"
                    >
                      Archive
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
        <PropertiesPanel groups={PROPERTY_GROUPS} values={company} onEdit={() => setEditOpen(true)} />
        <CenterTabs
          company={company}
          onActivityAction={(type) => setSheet(type)}
          onDealClick={(d) => onDealClick?.(d.id)}
          quotes={quotes}
          onQuoteClick={(id) => onQuoteClick?.(id)}
          onCreateQuote={() => setQuoteOpen(true)}
          onVisitClick={(id) => onVisitClick?.(id)}
          onTaskClick={(id) => onTaskClick?.(id)}
          onMeetingClick={(id) => onMeetingClick?.(id)}
        />
        <AssociationsPanel
          company={company}
          stages={kanbanStages}
          stage={company.stage}
          onStageChange={handleStageChange}
          onContactClick={(c) => onContactClick?.(c.id)}
          onDealClick={(d) => onDealClick?.(d.id)}
          onAction={(action) => setSheet(action)}
        />
      </div>

      {/* ─── SIDE SHEET (single, content varies by action) ─── */}
      <SideSheet open={!!activeSheet} onClose={() => setSheet(null)} title={activeSheet?.title || ""} width={activeSheet?.width || "max-w-md"}>
        {activeSheet?.content}
      </SideSheet>

      {/* ─── STAGE-CHANGE MANDATORY FIELDS GATE ─── */}
      <SideSheet open={!!pendingStageMove} onClose={() => setPendingStageMove(null)} title="Complete Required Fields">
        {pendingStageMove && (
          <RequiredFieldsForm
            record={company}
            entityName={company.name}
            entityType="company"
            stage={pendingStageMove.stage}
            onCancel={() => setPendingStageMove(null)}
            onSave={(values) => {
              setCompany((c) => ({ ...c, ...values, stage: pendingStageMove.stage }));
              showToast(`Moved to ${pendingStageMove.stage}`);
              setPendingStageMove(null);
            }}
          />
        )}
      </SideSheet>

      {/* ─── CUSTOMER GATE (Create Order on a non-Customer company) ─── */}
      <CustomerGateModal
        open={orderGateOpen && !sheet}
        onClose={() => setOrderGateOpen(false)}
        companyName={company.name}
        context="order_creation"
        title="Customer Required for Orders"
        message={
          <>
            <strong className="text-ink">{company.name}</strong> is a{" "}
            <strong className="text-ink">Company</strong>, not yet a{" "}
            <strong className="text-ink">Customer</strong>. Only Customers can have orders created.
          </>
        }
        onConvert={() => { setOrderGateOpen(false); setSheet("convert"); }}
      />

      {/* ─── EDIT SIDE SHEET ─── */}
      <SideSheet open={editOpen} onClose={() => setEditOpen(false)} title={`Edit ${company.name}`}>
        {editOpen && (
          <EditSheet
            groups={PROPERTY_GROUPS}
            values={company}
            entityLabel="Company"
            onClose={() => setEditOpen(false)}
            onSave={(updated) => {
              setCompany((c) => ({ ...c, ...updated }));
              setEditOpen(false);
              showToast("Company updated");
            }}
          />
        )}
      </SideSheet>

      {/* ─── CREATE QUOTE SIDE SHEET ─── */}
      <SideSheet open={quoteOpen} onClose={() => setQuoteOpen(false)} title="Create Quote" width="max-w-lg">
        {quoteOpen && (
          <CreateQuote
            company={company}
            onClose={() => setQuoteOpen(false)}
            onCreate={(quote) => {
              const created = addQuote(quote);
              setQuoteOpen(false);
              showToast(`${created.quoteNumber} created`);
            }}
          />
        )}
      </SideSheet>

      {/* ─── ARCHIVE CONFIRM ─── */}
      <ConfirmModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        title="Archive Company"
        message={`Archive ${company.name}? They will be hidden from the active list but can be restored later.`}
        confirmLabel="Archive"
        destructive
        onConfirm={() => {
          setArchiveOpen(false);
          showToast(`${company.name} archived`);
          setTimeout(() => onBack?.(), 1800);
        }}
      />

      {/* ─── SUCCESS TOAST ─── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-success flex-shrink-0" />
          {toast.message}
        </div>
      )}
    </div>
  );
}
