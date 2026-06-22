import { useState, useMemo } from "react";
import { Star, Check, ArrowRight, Users, Info } from "lucide-react";
import { repNames, contacts as allContacts, contactStages, orgSettings } from "../../data/constants";

const TERMS = ["Net 15", "Net 30", "Net 60", "Due on Receipt", "Prepaid"];

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300";
const LABEL = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1";

// Resolve a company's contacts (handles either nested `company.contacts`
// or the global contacts list keyed by companyId).
function resolveContacts(company) {
  if (Array.isArray(company?.contacts) && company.contacts.length) return company.contacts;
  if (company?.id != null) return allContacts.filter((c) => c.companyId === company.id);
  return [];
}

function contactName(c) {
  return c.name || `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim();
}

/**
 * FORM SOURCE: Org Settings → Forms → Company (filtered to star-flagged fields)
 * Only fields marked "Required for Customer conversion" appear here.
 * Contact movement behavior controlled by: Org Settings → Pipeline → contact_stage_follow_company
 * Pre-filled fields come from existing Company record.
 *
 * TODO(form-builder-parity): Fields rendered here (Customer Type, Payment Terms,
 *   Credit Limit, Account Owner) do not match the builder's star-flagged Company
 *   fields (Bill-to Address, Ship-to Address, Payment Terms, Customer Code,
 *   Default Price List). Customer Type and Credit Limit are not in the Company
 *   form sample data at all. Reconcile against Org Settings → Forms → Company
 *   (fields with "Required for Customer conversion").
 */
/**
 * ConvertCustomer — "Company → Customer" conversion (Flow 1-D).
 *
 * Respects orgSettings.customerConversion.contactMovement:
 *   - "auto_move_all" → skip contact step; move all contacts automatically.
 *   - "prompt"        → show Step 2 so the user picks contacts to move.
 *   - "do_not_move"   → skip contact step; contacts stay on the company.
 *
 * onDone is called with the customer field values PLUS a `conversion` summary
 * { contactsMoved, wizShopCreated, contactMovement } so the caller can toast.
 */
export default function ConvertCustomer({ company, onClose, onDone }) {
  const cc = orgSettings.customerConversion;
  const companyContacts = useMemo(() => resolveContacts(company), [company]);

  const [step, setStep] = useState(1);

  // Step 1 — customer fields
  const [customerType, setCustomerType] = useState("Wholesale");
  const [terms, setTerms] = useState("Net 30");
  const [creditLimit, setCreditLimit] = useState("");
  const [accountOwner, setAccountOwner] = useState(company?.rep || repNames?.[0] || "");
  const [grantAccess, setGrantAccess] = useState(cc.autoCreateWizShopUsers);

  // Step 2 — contact selection (only used in "prompt" mode)
  const [selectedIds, setSelectedIds] = useState(() => new Set(companyContacts.map((c) => c.id)));

  const baseValues = () => ({
    isCustomer: true,
    customerType,
    paymentTerms: terms,
    creditLimit,
    accountOwner,
    grantAccess,
  });

  // How many WizShop users get created for N moved contacts, given settings/grant.
  const wizShopCreatedFor = (movedContacts) => {
    const shouldCreate = cc.autoCreateWizShopUsers || grantAccess;
    if (!shouldCreate) return 0;
    // Only contacts that aren't already WizShop users get a new account.
    return movedContacts.filter((c) => !c.isWizShopUser).length;
  };

  const finish = (movedContacts) => {
    onDone?.({
      ...baseValues(),
      conversion: {
        contactMovement: cc.contactMovement,
        contactsMoved: movedContacts.length,
        wizShopCreated: wizShopCreatedFor(movedContacts),
        defaultContactStage: cc.defaultContactStage,
      },
    });
  };

  // Step 1 submit → branch on the org contact-movement setting.
  const handleStep1Submit = () => {
    if (cc.contactMovement === "prompt") {
      setStep(2);
      return;
    }
    // auto_move_all → move everyone; do_not_move → move nobody.
    const moved = cc.contactMovement === "auto_move_all" ? companyContacts : [];
    finish(moved);
  };

  const toggleContact = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const movementHint = {
    auto_move_all: "All contacts will be moved automatically (org setting).",
    do_not_move: "Contacts will remain on the company (org setting).",
    prompt: "You'll choose which contacts to move on the next step.",
  }[cc.contactMovement];

  return (
    <div className="flex flex-col h-full">
      {step === 1 ? (
        <>
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
              <span className="text-sm text-gray-700">Grant WizShop access to moved contacts</span>
            </label>

            {/* Contact-movement behavior hint (driven by org setting) */}
            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
              <Info size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <span>{movementHint}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center gap-2">
            <button
              onClick={handleStep1Submit}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              {cc.contactMovement === "prompt" ? (
                <>Next: Move Contacts <ArrowRight size={15} /></>
              ) : (
                <><Check size={15} /> Convert to Customer</>
              )}
            </button>
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        </>
      ) : (
        // ─── STEP 2: contact selection (prompt mode only) ───
        <>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Users size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700">
                Select which contacts to move to <strong className="text-gray-900">{company?.name}</strong> (Customer).
              </p>
              {cc.defaultContactStage && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Moved contacts will be set to stage <strong>{cc.defaultContactStage}</strong>.
                </p>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {companyContacts.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-6">This company has no contacts.</div>
            )}
            {companyContacts.map((c) => {
              const checked = selectedIds.has(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    checked ? "border-indigo-200 bg-indigo-50/40" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleContact(c.id)}
                    className="rounded accent-indigo-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{contactName(c)}</div>
                    <div className="text-xs text-gray-400 truncate">{c.email}</div>
                  </div>
                  {c.isWizShopUser && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 flex-shrink-0">WizShop</span>
                  )}
                </label>
              );
            })}
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center gap-2">
            <button
              onClick={() => finish(companyContacts.filter((c) => selectedIds.has(c.id)))}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              <Check size={15} /> Convert &amp; Move {selectedIds.size} Contact{selectedIds.size === 1 ? "" : "s"}
            </button>
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
