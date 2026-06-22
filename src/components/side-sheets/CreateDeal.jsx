import { useState, useMemo } from "react";
import { X, Search, ChevronDown } from "lucide-react";
import { companies, contacts, repNames } from "../../data/constants";

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
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 pr-8"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
    />
  );
}

function SectionHeader({ children }) {
  return (
    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{children}</h3>
  );
}

// ─── COMPANY SEARCH ───
function CompanySearch({ selected, onSelect, locked }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return companies.slice(0, 8);
    const q = query.toLowerCase();
    return companies.filter(
      (c) => c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const handleSelect = (company) => {
    onSelect(company);
    setQuery("");
    setOpen(false);
  };

  if (selected) {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
        <div>
          <div className="text-sm font-medium text-gray-900">{selected.name}</div>
          <div className="text-xs text-gray-500">{selected.domain}</div>
        </div>
        {!locked && (
          <button
            onClick={() => onSelect(null)}
            className="p-1 rounded hover:bg-indigo-100 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
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
          placeholder="Search company…"
          className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
        />
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">No results</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.domain}</div>
                  </div>
                  {c.isCustomer && (
                    <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">Customer</span>
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

// ─── CONTACT CHIPS ───
function ContactChips({ chips, onRemove, onAdd, companyId }) {
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState("");

  const available = useMemo(() => {
    const chipIds = new Set(chips.map((c) => c.id));
    const pool = contacts.filter((c) => !chipIds.has(c.id));
    if (!query.trim()) return pool.slice(0, 6);
    const q = query.toLowerCase();
    return pool.filter((c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [chips, query]);

  const handleAdd = (contact) => {
    onAdd(contact);
    setQuery("");
    setAddOpen(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {chips.map((c) => (
          <span
            key={c.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
          >
            {c.firstName} {c.lastName}
            <button
              onClick={() => onRemove(c.id)}
              className="hover:text-red-500 transition-colors"
            >
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setAddOpen((o) => !o)}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          + Add Contact
        </button>
        {addOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setAddOpen(false)} />
            <div className="absolute z-20 top-6 left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search contacts…"
                    className="w-full pl-6 pr-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  />
                </div>
              </div>
              {available.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleAdd(c)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs"
                >
                  <div className="font-medium text-gray-800">{c.firstName} {c.lastName}</div>
                  <div className="text-gray-400">{c.companyName}</div>
                </button>
              ))}
              {available.length === 0 && (
                <div className="px-3 py-3 text-xs text-gray-400 text-center">No contacts found</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Resolve a companies[] row from an arbitrary company-like object (the company
// detail record carries extra nested data we don't want in the picker).
function toPickerCompany(c) {
  if (!c) return null;
  const match = companies.find((co) => co.id === c.id) || companies.find((co) => co.name === c.name);
  return match || { id: c.id, name: c.name, domain: c.domain || "", isCustomer: !!c.isCustomer };
}

// ─── MAIN COMPONENT ───
// `initialCompany` — when launched from a Company detail page, pre-selects + locks
// the company and auto-populates its contacts.
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
  const [company, setCompany] = useState(seedCompany);
  const [contactChips, setContactChips] = useState(
    seedCompany ? contacts.filter((ct) => ct.companyId === seedCompany.id) : []
  );

  const handlePipelineChange = (pipelineName) => {
    const p = PIPELINES.find((pl) => pl.name === pipelineName) ?? null;
    setPipeline(p);
    setStage(p ? firstActiveStage(p) : "");
  };

  const handleCompanySelect = (c) => {
    setCompany(c);
    if (c) {
      const companyContacts = contacts.filter((ct) => ct.companyId === c.id);
      setContactChips(companyContacts);
    } else {
      setContactChips([]);
    }
  };

  const removeChip = (id) => setContactChips((prev) => prev.filter((c) => c.id !== id));
  const addChip = (contact) => setContactChips((prev) => [...prev, contact]);

  const canSubmit = pipeline && name.trim() && amount.trim() && closeDate && company;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onDone?.({
      name: name.trim(),
      pipeline: pipeline.name,
      stage,
      amount,
      closeDate,
      owner,
      forecastCategory,
      company: company.name,
      companyId: company.id,
      contacts: contactChips.map((c) => `${c.firstName} ${c.lastName}`),
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
              <p className="text-xs text-gray-400 mt-1">
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
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

        {/* ASSOCIATIONS */}
        <div>
          <SectionHeader>Associations</SectionHeader>
          <div className="space-y-3">
            <div>
              <Label required>Company / Customer</Label>
              <CompanySearch selected={company} onSelect={handleCompanySelect} locked={lockCompany} />
            </div>
            <div>
              <Label>Contacts</Label>
              <ContactChips
                chips={contactChips}
                onRemove={removeChip}
                onAdd={addChip}
                companyId={company?.id}
              />
              {contactChips.length === 0 && !company && (
                <p className="text-xs text-gray-400">Select a company to auto-populate contacts</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between bg-white">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
            canSubmit
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-indigo-200 cursor-not-allowed"
          }`}
        >
          Create Deal
        </button>
      </div>
    </div>
  );
}
