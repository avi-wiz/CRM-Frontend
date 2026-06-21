import { useState } from "react";
import { Star, Check, ArrowRight } from "lucide-react";
import { repNames } from "../../data/constants";

const TERMS = ["Net 15", "Net 30", "Net 60", "Due on Receipt", "Prepaid"];

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300";
const LABEL = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1";

/**
 * ConvertCustomer — focused "Company → Customer" conversion form (Flow 1-D).
 * Hosted inside a SideSheet by the caller. On submit, calls onDone(values).
 *
 * Props:
 *   company  – the company record being converted
 *   onClose  – dismiss without converting
 *   onDone   – (values) => void  after a successful convert
 */
export default function ConvertCustomer({ company, onClose, onDone }) {
  const [customerType, setCustomerType] = useState("Wholesale");
  const [terms, setTerms] = useState("Net 30");
  const [creditLimit, setCreditLimit] = useState("");
  const [accountOwner, setAccountOwner] = useState(company?.rep || repNames?.[0] || "");
  const [grantAccess, setGrantAccess] = useState(true);

  const handleSubmit = () => {
    onDone?.({
      isCustomer: true,
      customerType,
      paymentTerms: terms,
      creditLimit,
      accountOwner,
      grantAccess,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Intro */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Star size={16} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-sm text-gray-700">
            Convert <strong className="text-gray-900">{company?.name}</strong> from a{" "}
            <strong>Company</strong> to a <strong>Customer</strong>.
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Customers can place orders and unlock billing fields.
          </p>
        </div>
      </div>

      {/* Customer fields */}
      <div className="flex-1 space-y-4">
        <div>
          <label className={LABEL}>Customer Type</label>
          <select className={INPUT} value={customerType} onChange={(e) => setCustomerType(e.target.value)}>
            {["Wholesale", "Retail", "Distributor", "Reseller"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Payment Terms</label>
            <select className={INPUT} value={terms} onChange={(e) => setTerms(e.target.value)}>
              {TERMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Credit Limit</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-gray-400">$</span>
              <input
                className={INPUT + " pl-6"}
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div>
          <label className={LABEL}>Account Owner</label>
          <select className={INPUT} value={accountOwner} onChange={(e) => setAccountOwner(e.target.value)}>
            {(repNames || [accountOwner]).map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={grantAccess}
            onChange={(e) => setGrantAccess(e.target.checked)}
            className="rounded accent-indigo-600"
          />
          <span className="text-sm text-gray-700">Grant WizShop access to primary contacts</span>
        </label>
      </div>

      {/* Footer */}
      <div className="pt-4 mt-4 border-t border-gray-100 flex items-center gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          <Check size={15} /> Convert to Customer
        </button>
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>
    </div>
  );
}
