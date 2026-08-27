import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { companies, repNames } from "../../data/constants";
import AssociationsSection from "../shared/AssociationsSection";
import { useAssociations } from "../../data/useAssociations";
import {
  suggestedContactsFor,
  DEAL_ASSOCIATION_ORDER,
  REQUIRED_BY_HOST,
} from "../../data/associationRegistry";

// ─── PIPELINE DEFINITIONS ───
const PIPELINES = [
  {
    id: "default",
    name: "Default Sales Pipeline",
    stages: ["New Lead", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"],
    endStages: ["Won", "Lost"],
  },
  {
    id: "enterprise",
    name: "Enterprise Pipeline",
    stages: ["Discovery", "Technical Review", "Pilot", "Procurement", "Contract", "Closed - Won", "Closed - Lost"],
    endStages: ["Closed - Won", "Closed - Lost"],
  },
];

const FORECAST_CATEGORIES = ["Pipeline", "Best Case", "Commit", "Closed"];

function firstActiveStage(pipeline) {
  return pipeline.stages.find((s) => !pipeline.endStages.includes(s)) ?? pipeline.stages[0];
}

// ─── FIELD COMPONENTS ───
function Label({ children, required }) {
  return (
    <label className="block text-xs font-medium text-muted mb-1">
      {children}
      {required && <span className="text-danger ml-0.5">*</span>}
    </label>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="wiz-input w-full appearance-none pr-8"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-disabled pointer-events-none" />
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="wiz-input w-full"
    />
  );
}

function SectionHeader({ children }) {
  return (
    <h3 className="text-xs font-semibold text-disabled uppercase tracking-wider mb-3">{children}</h3>
  );
}

// Resolve a companies[] row from an arbitrary company-like object (the company
// detail record carries extra nested data we don't want in the picker).
function toPickerCompany(c) {
  if (!c) return null;
  const match = companies.find((co) => co.id === c.id) || companies.find((co) => co.name === c.name);
  return match || { id: c.id, name: c.name, domain: c.domain || "", isCustomer: !!c.isCustomer };
}

// Shape a companies[] row into the registry's association-record form.
function toAssociationRecord(c) {
  return {
    id: c.id,
    primary: c.name,
    secondary: c.domain,
    badge: c.isCustomer ? "Customer" : null,
    meta: [
      ["Industry", c.industry],
      ["Stage", c.stage],
      ["Employees", c.employeeCount],
      ["Owner", c.rep],
    ],
    raw: c,
  };
}

// ─── MAIN COMPONENT ───
// `initialCompany` — when launched from a Company detail page, pre-selects + locks
// the company and auto-populates its contacts.
/**
 * FORM SOURCE: Org Settings → Forms → Deal
 * Fields rendered here are configured in the Deal form builder.
 * System fields: Deal Name, Pipeline, Stage, Deal Owner
 * Pipeline selector populates from: Org Settings → Pipeline
 * Stage auto-sets from pipeline config.
 * Contacts auto-inherited from Company when "Auto-associate Company contacts" is ON.
 *
 * TODO(form-builder-parity): This form omits builder fields Source, Competitor,
 *   and Next Steps. Also the Enterprise Pipeline stages here
 *   (Discovery → Technical Review → Pilot → Procurement → Contract → Closed-Won/Lost)
 *   differ from the builder's Deal "Stage" options
 *   (Discovery → Evaluation → Proposal → Negotiation → Closed Won/Lost).
 *   Reconcile against Org Settings → Forms → Deal sample data.
 */
export default function CreateDeal({ onClose, onDone, initialCompany = null }) {
  const seedCompany = toPickerCompany(initialCompany);
  const lockCompany = !!seedCompany;

  const [pipeline, setPipeline] = useState(null);
  const [stage, setStage] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [owner, setOwner] = useState(repNames[0]);
  const [forecastCategory, setForecastCategory] = useState("Pipeline");

  // Typed association edges, keyed by object type. Seeded from `initialCompany`
  // when launched from a Company detail page.
  const associations = useAssociations(
    seedCompany
      ? {
          company: [{ record: toAssociationRecord(seedCompany), label: null }],
          contact: suggestedContactsFor(seedCompany.id).map((r) => ({ record: r, label: null })),
        }
      : {}
  );
  const company = associations.company;

  const handlePipelineChange = (pipelineName) => {
    const p = PIPELINES.find((pl) => pl.name === pipelineName) ?? null;
    setPipeline(p);
    setStage(p ? firstActiveStage(p) : "");
  };

  // Picking a company prefills its contacts as a convenience default; clearing
  // it clears them. The contact picker still searches every contact.
  const handleAdd = (type, record) => {
    associations.add(type, record);
    if (type === "company") {
      associations.setType("contact", suggestedContactsFor(record.id));
    }
  };

  const handleRemove = (type, id) => {
    associations.remove(type, id);
    if (type === "company") associations.setType("contact", []);
  };

  const canSubmit = pipeline && name.trim() && amount.trim() && closeDate && company;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const { companyIds, contactIds, dealIds, meetingIds, associationLabels } = associations.toPayload();
    onDone?.({
      name: name.trim(),
      pipeline: pipeline.name,
      stage,
      amount,
      closeDate,
      owner,
      forecastCategory,
      company: company.primary,
      companyId: company.id,
      // Display strings kept for the existing DealsPage row builder.
      contacts: (associations.value.contact ?? []).map((e) => e.record.primary),
      // Typed association edges — ids preserved, labels included.
      associations: { companyIds, contactIds, dealIds, meetingIds },
      associationLabels,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        {/* PIPELINE */}
        <div>
          <SectionHeader>Pipeline</SectionHeader>
          <div className="space-y-3">
            <div>
              <Label required>Pipeline</Label>
              <Select
                value={pipeline?.name ?? ""}
                onChange={handlePipelineChange}
                options={PIPELINES.map((p) => p.name)}
                placeholder="Select pipeline…"
              />
              <p className="text-xs text-disabled mt-1">
                The deal will enter at the first stage of the selected pipeline
              </p>
            </div>
            <div>
              <Label>Stage</Label>
              <Select
                value={stage}
                onChange={setStage}
                options={pipeline?.stages ?? []}
                placeholder={pipeline ? undefined : "Select a pipeline first"}
              />
            </div>
          </div>
        </div>

        {/* DEAL INFORMATION */}
        <div>
          <SectionHeader>Deal Information</SectionHeader>
          <div className="space-y-3">
            <div>
              <Label required>Deal Name</Label>
              <TextInput value={name} onChange={setName} placeholder="e.g. Q3 Bulk Reorder" />
            </div>
            <div>
              <Label required>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-disabled text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="wiz-input w-full pl-6"
                />
              </div>
            </div>
            <div>
              <Label required>Close Date</Label>
              <TextInput type="date" value={closeDate} onChange={setCloseDate} />
            </div>
            <div>
              <Label>Owner</Label>
              <Select value={owner} onChange={setOwner} options={repNames} />
            </div>
            <div>
              <Label>Forecast Category</Label>
              <Select value={forecastCategory} onChange={setForecastCategory} options={FORECAST_CATEGORIES} />
            </div>
          </div>
        </div>

        {/* ASSOCIATE WITH */}
        <div>
          <SectionHeader>Associate with</SectionHeader>
          <AssociationsSection
            value={associations.value}
            order={DEAL_ASSOCIATION_ORDER}
            requiredTypes={REQUIRED_BY_HOST.deal}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onLabelChange={associations.setLabel}
            lockedTypes={lockCompany ? ["company"] : []}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-divider px-5 py-4 flex items-center justify-between bg-surface">
        <button
          onClick={onClose}
          className="wiz-btn wiz-btn--text"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="wiz-btn wiz-btn--primary"
        >
          Create Deal
        </button>
      </div>
    </div>
  );
}
