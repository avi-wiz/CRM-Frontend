import { useState } from "react";
import { CheckCircle } from "lucide-react";
import FullScreenForm, { FormSection } from "../components/shared/FullScreenForm";
import { industries, leadSources, repNames, kanbanStages } from "../data/constants";

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200";
const selectCls = `${inputCls} bg-white`;

// Full-screen Create Company / Customer form.
// `isCustomer` — when launched from the Customers nav, the new record is flagged
// as a customer. `onCreate(company)` / `onBack` owned by the host page.
const SECTIONS = [
  { id: "company-info", label: "Company Info" },
  { id: "crm-status", label: "CRM Status" },
  { id: "billing-address", label: "Billing Address" },
];

export default function CreateCompanyPage({ isCustomer = false, onCreate, onBack }) {
  const [f, setF] = useState({
    name: "",
    domain: "",
    industry: "",
    employeeCount: "",
    annualRevenue: "",
    stage: isCustomer ? "Won" : "New Lead",
    rep: "",
    source: "Manual",
    leadSource: "",
    street: "",
    city: "",
    state: "",
    country: "USA",
  });
  const [created, setCreated] = useState(false);

  const set = (key) => (e) => setF((s) => ({ ...s, [key]: e.target.value }));
  const canSubmit = f.name.trim() && !created;
  const noun = isCustomer ? "Customer" : "Company";

  const handleSubmit = () => {
    if (!canSubmit) return;
    const company = {
      name: f.name.trim(),
      domain: f.domain.trim(),
      industry: f.industry || null,
      employeeCount: f.employeeCount === "" ? null : Number(f.employeeCount),
      annualRevenue: f.annualRevenue.trim() || null,
      stage: f.stage,
      isCustomer,
      rep: f.rep || null,
      source: f.source,
      leadSource: f.leadSource || null,
      contactCount: 0,
      dealCount: 0,
      address: {
        street: f.street.trim(),
        city: f.city.trim(),
        state: f.state.trim(),
        country: f.country.trim(),
      },
    };
    setCreated(true);
    setTimeout(() => {
      setCreated(false);
      onCreate?.(company);
    }, 700);
  };

  const actions = (
    <>
      <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
        Cancel
      </button>
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-all ${
          created ? "bg-emerald-500" : canSubmit ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-300 cursor-not-allowed"
        }`}
      >
        {created ? <><CheckCircle size={15} /> Created</> : `Create ${noun}`}
      </button>
    </>
  );

  return (
    <FullScreenForm title={`Add ${noun}`} onBack={onBack} actions={actions} sections={SECTIONS}>
      {({ registerSection }) => (
        <>
          <FormSection id="company-info" title="Company Info" registerSection={registerSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Company Name" required>
                <input value={f.name} onChange={set("name")} placeholder="Acme Distribution" className={inputCls} />
              </Field>
              <Field label="Domain">
                <input value={f.domain} onChange={set("domain")} placeholder="acme.com" className={inputCls} />
              </Field>
              <Field label="Industry">
                <select value={f.industry} onChange={set("industry")} className={selectCls}>
                  <option value="">Select…</option>
                  {industries.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Employee Count">
                <input type="number" min={0} value={f.employeeCount} onChange={set("employeeCount")} className={inputCls} />
              </Field>
              <Field label="Annual Revenue">
                <input value={f.annualRevenue} onChange={set("annualRevenue")} placeholder="$2.4M" className={inputCls} />
              </Field>
            </div>
          </FormSection>

          <FormSection id="crm-status" title="CRM Status" registerSection={registerSection}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              <Field label="Stage">
                <select value={f.stage} onChange={set("stage")} className={selectCls}>
                  {kanbanStages.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Account Owner">
                <select value={f.rep} onChange={set("rep")} className={selectCls}>
                  <option value="">Unassigned</option>
                  {repNames.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Lead Source">
                <select value={f.leadSource} onChange={set("leadSource")} className={selectCls}>
                  <option value="">Select…</option>
                  {leadSources.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>
          </FormSection>

          <FormSection id="billing-address" title="Billing Address" registerSection={registerSection}>
            <div className="space-y-4">
              <Field label="Street">
                <input value={f.street} onChange={set("street")} className={inputCls} />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">
                <Field label="City"><input value={f.city} onChange={set("city")} className={inputCls} /></Field>
                <Field label="State"><input value={f.state} onChange={set("state")} className={inputCls} /></Field>
                <Field label="Country"><input value={f.country} onChange={set("country")} className={inputCls} /></Field>
              </div>
            </div>
          </FormSection>
        </>
      )}
    </FullScreenForm>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 block mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
