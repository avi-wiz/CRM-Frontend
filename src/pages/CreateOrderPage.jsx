import { useState, useMemo } from "react";
import { ArrowLeft, Search, X, CheckCircle, ShoppingCart, ChevronDown } from "lucide-react";
import SideSheet from "../components/shared/SideSheet";
import CustomerGateModal from "../components/shared/CustomerGateModal";
import ConvertCustomer from "../components/side-sheets/ConvertCustomer";
import { companies } from "../data/constants";

// ─── COMPANY / CUSTOMER SEARCH ───
// Same selector pattern as Deal creation. Selection is reported to the parent,
// which decides whether to fire the Customer gate (non-Customer) or proceed.
function CompanySearch({ selected, onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return companies.slice(0, 8);
    const q = query.toLowerCase();
    return companies
      .filter((c) => c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  const handleSelect = (company) => {
    onSelect(company);
    setQuery("");
    setOpen(false);
  };

  // Selected + Customer → green confirmation chip. (Non-customers never stay
  // selected: the parent clears them after the gate, so `selected` here is
  // always a valid Customer.)
  if (selected) {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{selected.name}</div>
            <div className="text-xs text-gray-500 truncate">{selected.domain}</div>
          </div>
          <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full flex-shrink-0">Customer</span>
        </div>
        <button
          onClick={() => onSelect(null)}
          className="p-1 rounded hover:bg-emerald-100 text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search company or customer…"
          className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
        />
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">No results</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="text-sm text-gray-900 truncate">{c.name}</div>
                    <div className="text-xs text-gray-400 truncate">{c.domain}</div>
                  </div>
                  {c.isCustomer ? (
                    <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full flex-shrink-0">Customer</span>
                  ) : (
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full flex-shrink-0">Company</span>
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SectionHeader({ children }) {
  return <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{children}</h3>;
}

export default function CreateOrderPage({ onBack }) {
  // The confirmed customer for this order (only ever a Customer — see gate).
  const [customer, setCustomer] = useState(null);
  // The non-Customer company that tripped the gate (held while the modal is open).
  const [gateCompany, setGateCompany] = useState(null);
  const [convertOpen, setConvertOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // THE TRIGGER: the moment a company is picked, gate inline if it's not a Customer.
  const handleSelect = (company) => {
    if (!company) {
      setCustomer(null);
      return;
    }
    if (company.isCustomer) {
      setCustomer(company);
    } else {
      // Don't set as selected — block immediately with the gate.
      setGateCompany(company);
    }
  };

  // Gate → "Convert to Customer Now".
  const handleConvertNow = () => {
    setConvertOpen(true); // keep gateCompany so we know who to promote on done
  };

  // Gate dismissed → clear the pending company, return to the picker.
  const handleGateCancel = () => {
    setGateCompany(null);
  };

  // Conversion completed → the company is now a Customer; select it and continue.
  const handleConverted = (values) => {
    setConvertOpen(false);
    const promoted = { ...gateCompany, ...values, isCustomer: true };
    setGateCompany(null);
    setCustomer(promoted);
    showToast(`${promoted.name} converted to Customer. Continue creating the order.`);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <ShoppingCart size={18} className="text-indigo-600" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Create Order</h1>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-2xl space-y-8">
          {/* CUSTOMER — the gate trigger point */}
          <div>
            <SectionHeader>Customer</SectionHeader>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Company / Customer <span className="text-red-400">*</span>
            </label>
            <CompanySearch selected={customer} onSelect={handleSelect} />
            {!customer && (
              <p className="text-xs text-gray-400 mt-1.5">
                Pick the customer this order is for. Only Customers can have orders.
              </p>
            )}
          </div>

          {/* ORDER DETAILS — placeholder (outside CRM scope) */}
          <div>
            <SectionHeader>Order Details</SectionHeader>
            <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
              <p className="text-xs text-gray-500 mb-4">
                This order form is outside CRM scope — shown here to demonstrate the Customer gate only.
              </p>

              <div className="space-y-3 opacity-60 pointer-events-none select-none">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Order Type</label>
                  <div className="relative">
                    <select disabled className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-white pr-8">
                      <option>Standard Order</option>
                      <option>Sample Order</option>
                      <option>Reorder</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">PO Number</label>
                  <input disabled placeholder="—" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white placeholder-gray-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Requested Ship Date</label>
                  <input disabled type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Line Items</label>
                  <div className="border border-dashed border-gray-200 rounded-lg px-3 py-6 text-center text-xs text-gray-400">
                    Line-item builder lives in WizOrder
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
            <button onClick={onBack} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
            <button
              disabled={!customer}
              onClick={() => showToast("Order draft created (demo).")}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                customer ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-200 cursor-not-allowed"
              }`}
            >
              Create Order
            </button>
          </div>
        </div>
      </div>

      {/* Customer Gate — fires inline the instant a non-Customer is picked */}
      <CustomerGateModal
        open={!!gateCompany && !convertOpen}
        onClose={handleGateCancel}
        companyName={gateCompany?.name}
        context="order_creation"
        title="Customer Required for Orders"
        message={
          <>
            <strong className="text-gray-900">{gateCompany?.name}</strong> is a{" "}
            <strong className="text-gray-900">Company</strong>, not yet a{" "}
            <strong className="text-gray-900">Customer</strong>. Only Customers can have orders created.
          </>
        }
        onConvert={handleConvertNow}
      />

      {/* Convert-to-Customer side sheet launched by the gate */}
      <SideSheet open={convertOpen} onClose={() => setConvertOpen(false)} title="Convert to Customer">
        {convertOpen && gateCompany && (
          <ConvertCustomer
            company={gateCompany}
            onClose={() => setConvertOpen(false)}
            onDone={handleConverted}
          />
        )}
      </SideSheet>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
          <CheckCircle size={15} className="text-emerald-400 flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}
