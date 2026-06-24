import { useState, useCallback } from "react";
import { Search, CheckCircle } from "lucide-react";
import { contacts, reps } from "../../data/constants";

// ─── CONVERT TO CUSTOMER ─── (multi-step)
export function ConvertCustomerContent({ entity, onDone }) {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // Step 1 form state
  const [fields, setFields] = useState({
    customerType: "",
    accountTier: "",
    paymentTerms: "",
    creditLimit: "",
    taxId: "",
    billingStreet: entity?.billingAddress?.street || "",
    billingCity: entity?.billingAddress?.city || "",
    billingState: entity?.billingAddress?.state || "",
    billingZip: entity?.billingAddress?.zip || "",
    billingCountry: entity?.billingAddress?.country || "",
  });

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const hasBilling =
    fields.billingStreet.trim() &&
    fields.billingCity.trim() &&
    fields.billingState.trim();

  const step1Valid =
    fields.customerType &&
    fields.accountTier &&
    fields.paymentTerms &&
    fields.creditLimit.trim() &&
    hasBilling;

  // Step 2 contact movement state
  const companyContacts = entity?.contacts || contacts.slice(0, 4);
  const [movement, setMovement] = useState("all"); // all | selected | none
  const [checked, setChecked] = useState(() => Object.fromEntries(companyContacts.map((c) => [c.id, true])));

  const toggleCheck = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const effectiveChecked = (id) => {
    if (movement === "all") return true;
    if (movement === "none") return false;
    return checked[id];
  };

  const handleStep1Submit = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setStep(2);
    }, 1200);
  };

  const handleComplete = () => onDone?.();

  const stepLabel = `Step ${step} of 2`;

  return (
    <div className="flex flex-col h-full">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-5">
        {[1, 2].map((n) => (
          <div key={n} className="flex items-center gap-1.5">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                n < step ? "bg-emerald-500 text-white" : n === step ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
              }`}
            >
              {n < step ? "✓" : n}
            </div>
            <span className={`text-xs ${n === step ? "text-gray-800 font-medium" : "text-gray-400"}`}>
              {n === 1 ? "Customer Info" : "Move Contacts"}
            </span>
            {n < 2 && <div className="w-6 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <Step1
          entity={entity}
          fields={fields}
          set={set}
          step1Valid={step1Valid}
          showSuccess={showSuccess}
          onSubmit={handleStep1Submit}
        />
      ) : (
        <Step2
          companyContacts={companyContacts}
          movement={movement}
          setMovement={setMovement}
          effectiveChecked={effectiveChecked}
          toggleCheck={toggleCheck}
          onComplete={handleComplete}
          companyName={entity?.name}
        />
      )}
    </div>
  );
}

function Step1({ entity, fields, set, step1Valid, showSuccess, onSubmit }) {
  const hasBillingPrefilled =
    entity?.billingAddress?.street &&
    entity?.billingAddress?.city &&
    entity?.billingAddress?.state;

  return (
    <div className="flex-1 overflow-y-auto space-y-5">
      {/* Pre-filled read-only block */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pre-filled Company Info</h3>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <ReadOnlyRow label="Company Name" value={entity?.name} />
          <ReadOnlyRow label="Domain" value={entity?.domain} />
          <ReadOnlyRow label="Industry" value={entity?.industry} />
          <ReadOnlyRow label="Current Stage" value={entity?.stage} />
        </div>
      </section>

      {/* Required editable fields */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Required Customer Fields</h3>
        <div className="space-y-3">
          <SelectField
            label="Customer Type"
            required
            value={fields.customerType}
            onChange={set("customerType")}
            options={["", "Distributor", "Retailer", "Wholesaler", "Direct", "Other"]}
          />
          <SelectField
            label="Account Tier"
            required
            value={fields.accountTier}
            onChange={set("accountTier")}
            options={["", "Enterprise", "Mid-Market", "SMB", "Startup"]}
          />
          <SelectField
            label="Payment Terms"
            required
            value={fields.paymentTerms}
            onChange={set("paymentTerms")}
            options={["", "Net 15", "Net 30", "Net 45", "Net 60", "Prepaid"]}
          />
          <CurrencyField
            label="Credit Limit"
            required
            value={fields.creditLimit}
            onChange={set("creditLimit")}
          />

          {/* Billing address — only show if not pre-filled */}
          {!hasBillingPrefilled ? (
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Primary Billing Address <span className="text-red-500">*</span>
              </label>
              <div className="space-y-1.5">
                <TextInput placeholder="Street" value={fields.billingStreet} onChange={set("billingStreet")} required />
                <div className="grid grid-cols-2 gap-1.5">
                  <TextInput placeholder="City" value={fields.billingCity} onChange={set("billingCity")} required />
                  <TextInput placeholder="State" value={fields.billingState} onChange={set("billingState")} required />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <TextInput placeholder="ZIP" value={fields.billingZip} onChange={set("billingZip")} />
                  <TextInput placeholder="Country" value={fields.billingCountry} onChange={set("billingCountry")} />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs text-gray-500 block mb-1">Primary Billing Address</label>
              <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-700">
                {entity.billingAddress.street}, {entity.billingAddress.city}, {entity.billingAddress.state}
                {entity.billingAddress.zip ? ` ${entity.billingAddress.zip}` : ""}
                {entity.billingAddress.country ? `, ${entity.billingAddress.country}` : ""}
                <span className="ml-2 text-emerald-600 font-medium">✓ Pre-filled</span>
              </div>
            </div>
          )}

          <TextInput
            label="Tax ID"
            placeholder="Optional"
            value={fields.taxId}
            onChange={set("taxId")}
          />
        </div>
      </section>

      {/* Footer */}
      <div className="pt-2 pb-1 space-y-2">
        {showSuccess ? (
          <div className="w-full py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
            <CheckCircle size={15} />
            Customer info saved!
          </div>
        ) : (
          <button
            onClick={onSubmit}
            disabled={!step1Valid}
            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
              step1Valid
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Convert to Customer →
          </button>
        )}
      </div>
    </div>
  );
}

function Step2({ companyContacts, movement, setMovement, effectiveChecked, toggleCheck, onComplete, companyName }) {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-4">
      {/* Radio options */}
      <div className="space-y-2">
        {[
          { value: "all", label: "Move all contacts" },
          { value: "selected", label: "Move selected contacts" },
          { value: "none", label: "Leave contacts as-is" },
        ].map((opt) => (
          <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="movement"
              value={opt.value}
              checked={movement === opt.value}
              onChange={() => setMovement(opt.value)}
              className="accent-indigo-600"
            />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Contact list */}
      <div className="space-y-2">
        {companyContacts.map((c) => {
          const isChecked = effectiveChecked(c.id);
          const isDisabled = movement === "all" || movement === "none";
          return (
            <div
              key={c.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isChecked ? "border-indigo-200 bg-indigo-50/40" : "border-gray-200 bg-white"
              } ${movement === "none" ? "opacity-50" : ""}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                disabled={isDisabled}
                onChange={() => toggleCheck(c.id)}
                className="accent-indigo-600 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-400">{c.email} · {c.role}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-1 pb-1 space-y-2">
        <button
          onClick={onComplete}
          className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          Complete Conversion
        </button>
        <button
          onClick={onComplete}
          className="w-full py-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          Skip — Convert Without Moving
        </button>
      </div>
    </div>
  );
}

// ─── SHARED FIELD HELPERS ───
function ReadOnlyRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-700 font-medium">{value || "—"}</span>
    </div>
  );
}

function SelectField({ label, required, value, onChange, options }) {
  const isEmpty = !value;
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full border rounded-xl px-3 py-2 text-sm bg-white transition-all duration-200 ${
          isEmpty && required ? "border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/10" : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        } focus:outline-none`}
      >
        {options.map((o) => <option key={o} value={o}>{o || `Select ${label}`}</option>)}
      </select>
    </div>
  );
}

function CurrencyField({ label, required, value, onChange }) {
  const isEmpty = !value.trim();
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-2 text-sm text-gray-400">$</span>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="0"
          className={`w-full border rounded-xl pl-6 pr-3 py-2 text-sm transition-all duration-200 ${
            isEmpty && required ? "border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/10" : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          } focus:outline-none`}
        />
      </div>
    </div>
  );
}

function TextInput({ label, placeholder, value, onChange, required }) {
  const isEmpty = required && !value.trim();
  return (
    <div className={label ? "" : ""}>
      {label && (
        <label className="text-xs text-gray-500 block mb-1">{label}</label>
      )}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
          isEmpty ? "border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/10" : "border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        } focus:outline-none`}
      />
    </div>
  );
}

// ─── CREATE WIZSHOP USER (from Contact detail "Create WizShop User") ───
export function CreateWizShopUserContent({ contact, onDone, onClose, mode = "create" }) {
  const isChange = mode === "change";
  const [role, setRole] = useState(isChange ? (contact?.wizShopRole || "Buyer") : "Buyer");
  const [sendInvite, setSendInvite] = useState(!isChange);
  const [done, setDone] = useState(false);

  const handleCreate = () => {
    setDone(true);
    setTimeout(() => {
      onDone?.({ role, sendInvite });
    }, 900);
  };

  const fullName = contact ? `${contact.firstName} ${contact.lastName}` : "this contact";

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-indigo-50/60 rounded-xl p-3 border border-indigo-100">
        <div className="text-xs font-semibold text-indigo-700 mb-0.5">{isChange ? "WizShop account" : "Creating account for"}</div>
        <div className="text-sm font-bold text-gray-900">{fullName}</div>
        <div className="text-xs text-gray-500">{contact?.email}</div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">WizShop Role <span className="text-red-500">*</span></label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        >
          {["Admin", "Buyer", "Viewer"].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <p className="text-xs text-gray-400 mt-1">
          {role === "Admin" && "Full access — can manage products, orders, and users."}
          {role === "Buyer" && "Can browse catalog, place orders, and view order history."}
          {role === "Viewer" && "Read-only access to catalog and order history."}
        </p>
      </div>

      {!isChange && (
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            onClick={() => setSendInvite((v) => !v)}
            className={`w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${sendInvite ? "bg-indigo-600" : "bg-gray-200"}`}
          >
            <span className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 mx-0.5 ${sendInvite ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-sm text-gray-700">Send invite email to {contact?.email}</span>
        </label>
      )}

      <div className="pt-2 border-t border-gray-100 space-y-2">
        {done ? (
          <div className="w-full py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle size={15} /> {isChange ? "Role updated!" : "WizShop user created!"}
          </div>
        ) : (
          <button
            onClick={handleCreate}
            className="w-full py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:opacity-90 transition-all"
          >
            {isChange ? "Update Role" : "Create WizShop User"}
          </button>
        )}
        <button onClick={onClose} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
      </div>
    </div>
  );
}

// ─── MERGE / CONVERT ───
export function MergeConvertContent() {
  const recommendations = [
    { name: "ABC Corp", type: "Customer", match: 92 },
    { name: "AB Trading", type: "Company", match: 71 },
  ];
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">Search for an existing Company or Customer to merge with.</p>
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
        <input placeholder="Search companies or customers..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
      </div>
      <div className="mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase">KAI Recommendations</span>
      </div>
      {recommendations.map((r, i) => (
        <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2 hover:border-indigo-300 cursor-pointer">
          <div>
            <div className="text-sm font-medium text-gray-800">{r.name}</div>
            <div className="text-xs text-gray-400">{r.type}</div>
          </div>
          <div
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ color: r.match > 80 ? "#059669" : "#d97706", backgroundColor: r.match > 80 ? "#d1fae5" : "#fef3c7" }}
          >
            {r.match}%
          </div>
        </div>
      ))}
      <div className="border-t border-gray-100 mt-4 pt-4">
        <button className="w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          + Create as New Company
        </button>
      </div>
    </div>
  );
}

// ─── CREATE TASK ───
export function CreateTaskContent() {
  return (
    <div className="space-y-3">
      <FormField label="Title" placeholder="Task title" required />
      <FormField label="Description" placeholder="Details..." type="textarea" />
      <FormField label="Due Date" type="date" />
      <FormField label="Priority" type="select" options={["Medium", "High", "Low"]} />
      <div>
        <label className="text-xs text-gray-500 block mb-1">Assign to (multi-select)</label>
        <CheckboxList items={reps.map((r) => r.name)} />
      </div>
      <button className="mt-2 w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
        Create Task
      </button>
    </div>
  );
}

// ─── LOG NOTE ───
export function LogNoteContent() {
  return (
    <div className="space-y-3">
      <FormField label="Note" type="textarea" rows={6} placeholder="Write your note..." />
      <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
        Save Note
      </button>
    </div>
  );
}

// ─── LOG MEETING ───
export function LogMeetingContent() {
  return (
    <div className="space-y-3">
      <FormField label="Title" placeholder="Meeting title" required />
      <div className="grid grid-cols-2 gap-2">
        <FormField label="Date" type="date" />
        <FormField label="Duration" type="select" options={["30 min", "45 min", "60 min"]} />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Attendees (Contacts)</label>
        <CheckboxList items={contacts.map((c) => c.name)} />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Internal Attendees (Reps)</label>
        <CheckboxList items={reps.map((r) => r.name)} />
      </div>
      <FormField label="Notes" type="textarea" placeholder="Meeting notes..." />
      <FormField label="Outcome" type="select" options={["Completed", "Cancelled", "No-Show"]} />
      <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
        Save Meeting
      </button>
    </div>
  );
}

// ─── LOG EMAIL ───
export function LogEmailContent() {
  return (
    <div className="space-y-3">
      <FormField label="Subject" placeholder="Email subject" />
      <FormField label="Body" type="textarea" rows={4} placeholder="Email content..." />
      <FormField label="Direction" type="select" options={["Sent", "Received"]} />
      <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
        Save Email
      </button>
    </div>
  );
}

// ─── LOG VISIT ───
export function LogVisitContent() {
  return (
    <div className="space-y-3">
      <FormField label="Visit Date" type="date" />
      <FormField label="Rep" type="select" options={reps.map((r) => r.name)} />
      <FormField label="Notes" type="textarea" placeholder="Visit notes..." />
      <label className="flex items-center gap-2">
        <input type="checkbox" className="rounded" />
        <span className="text-sm text-gray-700">Follow-up needed</span>
      </label>
      <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
        Save Visit
      </button>
    </div>
  );
}

// ─── GRANT WEB ACCESS ───
export function GrantAccessContent({ companyName }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Select contacts to grant WizShop access{companyName ? ` for ${companyName}` : ""}.
      </p>
      <div className="space-y-2 mb-4">
        {contacts.map((c) => (
          <label
            key={c.id}
            className={`flex items-center gap-3 p-2.5 border rounded-lg ${c.wizshop ? "border-gray-100 bg-gray-50 opacity-60" : "border-gray-200 hover:border-indigo-200 cursor-pointer"}`}
          >
            <input type="checkbox" defaultChecked={c.wizshop} disabled={c.wizshop} className="rounded" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">{c.name}</div>
              <div className="text-xs text-gray-400">{c.email}</div>
            </div>
            {c.wizshop && <span className="text-xs bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Active</span>}
          </label>
        ))}
      </div>
      <div className="space-y-3 mb-4">
        <FormField label="Role for new users" type="select" options={["Buyer", "Admin", "Viewer"]} />
        <label className="flex items-center gap-2">
          <input type="checkbox" defaultChecked className="rounded" />
          <span className="text-sm text-gray-700">Send invite on Email</span>
        </label>
      </div>
      <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
        Create Users
      </button>
    </div>
  );
}

// ─── SHARED HELPERS ───
function FormField({ label, value, placeholder, type = "text", options, required, readOnly, rows }) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "select" ? (
        <select className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200">
          {options?.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea rows={rows || 3} placeholder={placeholder} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200" />
      ) : (
        <input
          type={type}
          defaultValue={value}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full border border-gray-200 rounded-xl px-3 py-2 text-sm transition-all duration-200 ${readOnly ? "bg-gray-50" : "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"}`}
        />
      )}
    </div>
  );
}

function CheckboxList({ items }) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <label key={item} className="flex items-center gap-2 px-2 py-1.5 border border-gray-100 rounded hover:bg-gray-50">
          <input type="checkbox" className="rounded" />
          <span className="text-sm">{item}</span>
        </label>
      ))}
    </div>
  );
}
