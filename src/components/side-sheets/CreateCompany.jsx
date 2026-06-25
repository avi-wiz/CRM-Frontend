import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { industries, leadSources, repNames, kanbanStages } from "../../data/constants";

const inputCls = "wiz-input w-full";
const selectCls = inputCls;

// Create Company side-sheet content. Render inside a <SideSheet title="Create Company">.
// `onCreate(company)` — called with the assembled company row.
// `onClose` — cancel handler.
export default function CreateCompany({ onCreate, onClose }) {
  const [f, setF] = useState({
    name: "",
    domain: "",
    industry: "",
    employeeCount: "",
    annualRevenue: "",
    stage: "New Lead",
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

  const handleSubmit = () => {
    const company = {
      name: f.name.trim(),
      domain: f.domain.trim(),
      industry: f.industry || null,
      employeeCount: f.employeeCount === "" ? null : Number(f.employeeCount),
      annualRevenue: f.annualRevenue.trim() || null,
      stage: f.stage,
      isCustomer: false,
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
    }, 900);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        <Section title="Company Info">
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
          <div className="grid grid-cols-2 gap-3">
            <Field label="Employee Count">
              <input type="number" min={0} value={f.employeeCount} onChange={set("employeeCount")} className={inputCls} />
            </Field>
            <Field label="Annual Revenue">
              <input value={f.annualRevenue} onChange={set("annualRevenue")} placeholder="$2.4M" className={inputCls} />
            </Field>
          </div>
        </Section>

        <Section title="CRM Status">
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
        </Section>

        <Section title="Billing Address">
          <Field label="Street">
            <input value={f.street} onChange={set("street")} className={inputCls} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="City"><input value={f.city} onChange={set("city")} className={inputCls} /></Field>
            <Field label="State"><input value={f.state} onChange={set("state")} className={inputCls} /></Field>
            <Field label="Country"><input value={f.country} onChange={set("country")} className={inputCls} /></Field>
          </div>
        </Section>
      </div>

      <div className="pt-3 border-t border-divider space-y-2">
        {created ? (
          <div className="w-full py-2.5 bg-success text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle size={15} /> Company created!
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="wiz-btn wiz-btn--primary w-full"
          >
            Create Company
          </button>
        )}
        <button onClick={onClose} className="wiz-btn wiz-btn--text w-full">
          Cancel
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="text-[10px] font-bold text-disabled uppercase tracking-widest mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted block mb-1">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
