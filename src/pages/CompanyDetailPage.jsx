import { useState, useEffect } from "react";
import { ArrowLeft, MoreHorizontal, CheckCircle } from "lucide-react";
import StageBadge from "../components/shared/StageBadge";
import SideSheet from "../components/shared/SideSheet";
import CustomerGateModal from "../components/shared/CustomerGateModal";
import PropertiesPanel from "../components/detail/PropertiesPanel";
import CenterTabs from "../components/detail/CenterTabs";
import AssociationsPanel from "../components/detail/AssociationsPanel";
import { ConvertCustomerContent } from "../components/side-sheets/index";
import { LOG_SHEETS, nowStamp } from "../components/side-sheets/log";
import GrantAccessContent, { normalizeContacts } from "../components/side-sheets/GrantAccess";
import { getCompanyDetail, kanbanStages, industries, leadSources, repNames } from "../data/constants";

// Activity logging action keys handled by the shared log sheets.
const LOG_ACTIONS = ["note", "meeting", "task", "email", "visit"];

// Property-group config for the Company entity (left panel).
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
  {
    title: "Addresses",
    fields: [
      { key: "billingAddress", label: "Billing Address", type: "address" },
      { key: "shippingAddress", label: "Shipping Address", type: "address" },
    ],
  },
];

// Maps an action key → side sheet { title, content }. The 5 activity-logging
// actions render the shared log sheets; the rest use the real or placeholder forms.
function sheetFor(action, company, handlers) {
  const { onConversionDone, onGrantDone, onClose, onLogSave } = handlers;

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
    case "convert": return { title: `Convert ${company.name} to Customer`, content: <ConvertCustomerContent entity={company} onDone={onConversionDone} /> };
    case "grantAccess": return {
      title: `Grant WizShop Access — ${company.name}`,
      content: <GrantAccessContent contacts={normalizeContacts(company.contacts)} onClose={onClose} onDone={onGrantDone} />,
    };
    case "addContact": return { title: "Add Contact", content: <Placeholder flow="Flow 5" /> };
    case "addDeal": return { title: "Add Deal", content: <Placeholder flow="Flow 6" /> };
    case "editBilling": return { title: "Edit Billing Address", content: <Placeholder /> };
    case "editShipping": return { title: "Edit Shipping Address", content: <Placeholder /> };
    case "editPayment": return { title: "Edit Payment Terms", content: <Placeholder /> };
    case "linkCompany": return { title: "Link Company", content: <Placeholder /> };
    default: return null;
  }
}

function Placeholder({ flow }) {
  return <div className="text-sm text-gray-500">Form coming{flow ? ` in ${flow}` : " soon"}.</div>;
}

export default function CompanyDetailPage({ companyId, onBack, onContactClick, onDealClick }) {
  // Local, non-persistent edit state seeded from the merged detail record.
  const [company, setCompany] = useState(() => getCompanyDetail(companyId));
  const [sheet, setSheet] = useState(null); // action key or null
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null); // { message }
  const [orderGateOpen, setOrderGateOpen] = useState(false); // Customer gate for "Create Order"

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

  const showToast = (message) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleConversionDone = () => {
    setCompany((c) => ({ ...c, isCustomer: true }));
    setSheet(null);
    showToast(`${company.name} is now a Customer`);
  };

  const handleGrantDone = (count) => {
    setSheet(null);
    showToast(`Created WizShop access for ${count} contact${count === 1 ? "" : "s"}`);
  };

  // Append a logged activity to the company's timeline.
  const handleLogSave = (activity) => {
    const title = LOG_SHEETS[sheet]?.title || "Activity";
    setCompany((c) => {
      const nextId = Math.max(0, ...(c.activities || []).map((a) => a.id || 0)) + 1;
      return { ...c, activities: [{ id: nextId, time: nowStamp(), ...activity }, ...(c.activities || [])] };
    });
    setSheet(null);
    showToast(`${title} saved`);
  };

  const activeSheet = sheet
    ? sheetFor(sheet, company, {
        onConversionDone: handleConversionDone,
        onGrantDone: handleGrantDone,
        onClose: () => setSheet(null),
        onLogSave: handleLogSave,
      })
    : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 rounded hover:bg-gray-100" title="Back to listing">
            <ArrowLeft size={18} className="text-gray-500" />
          </button>
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide">Company</span>
            <h1 className="text-lg font-semibold text-gray-900">{company.name}</h1>
          </div>
          <StageBadge stage={company.stage} />
          {company.isCustomer ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Customer</span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Company</span>
          )}
          {company.source && (
            <span className="text-xs text-gray-500">Source: {company.source}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!company.isCustomer && (
            <button onClick={() => setSheet("convert")} className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Convert to Customer
            </button>
          )}
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-30 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40">
                  <button
                    onClick={handleCreateOrder}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Create Order
                  </button>
                  {["Archive", "Merge", "Export"].map((item) => (
                    <button
                      key={item}
                      onClick={() => { console.log(item, company.name); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── 3-PANEL LAYOUT ─── */}
      <div className="flex-1 flex overflow-hidden">
        <PropertiesPanel groups={PROPERTY_GROUPS} values={company} onChange={updateField} />
        <CenterTabs
          company={company}
          onActivityAction={(type) => setSheet(type)}
          onDealClick={(d) => onDealClick?.(d.id)}
        />
        <AssociationsPanel
          company={company}
          stages={kanbanStages}
          stage={company.stage}
          onStageChange={(s) => updateField("stage", s)}
          onContactClick={(c) => onContactClick?.(c.id)}
          onDealClick={(d) => onDealClick?.(d.id)}
          onAction={(action) => setSheet(action)}
        />
      </div>

      {/* ─── SIDE SHEET (single, content varies by action) ─── */}
      <SideSheet open={!!activeSheet} onClose={() => setSheet(null)} title={activeSheet?.title || ""}>
        {activeSheet?.content}
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
            <strong className="text-gray-900">{company.name}</strong> is a{" "}
            <strong className="text-gray-900">Company</strong>, not yet a{" "}
            <strong className="text-gray-900">Customer</strong>. Only Customers can have orders created.
          </>
        }
        onConvert={() => { setOrderGateOpen(false); setSheet("convert"); }}
      />

      {/* ─── SUCCESS TOAST ─── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
          {toast.message}
        </div>
      )}
    </div>
  );
}
