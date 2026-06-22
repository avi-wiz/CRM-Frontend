import { useState, useMemo } from "react";
import { Search, X, Building2 } from "lucide-react";
import { repNames, companies, getCompanyContacts, visitPurposes } from "../../../data/constants";
import {
  AssociatedWith, Field, TextInput, TextArea, Select, ChipMultiSelect, Footer, Divider,
  Label, todayISO, CURRENT_USER, contactOptions,
} from "./_shared";

const DURATIONS = ["30 min", "45 min", "1 hour", "1.5 hours", "2 hours"];
const LOCATIONS = ["Client Office", "Factory", "Showroom", "Trade Show Booth", "Other"];

const DURATION_MIN = { "30 min": 30, "45 min": 45, "1 hour": 60, "1.5 hours": 90, "2 hours": 120 };

// Resolve a companies[] row from the (possibly nested) entity passed in.
function entityToCompany(entity) {
  if (!entity || (entity.type !== "company" && entity.type !== "customer")) return null;
  return companies.find((c) => c.id === entity.id) || { id: entity.id, name: entity.name };
}

// Log Visit — appends a { type: "visit" } activity. `entity` (from a Company
// detail page) locks the company; otherwise it's searchable. Contacts met are
// scoped to the chosen company. A follow-up checkbox reveals date + notes.
/**
 * FORM SOURCE: Org Settings → Forms → Visit
 * System fields: Visit Date, Rep
 * Follow-up fields (date, notes) appear when "Follow-up Needed" is checked.
 */
export default function LogVisit({ entity, onClose, onSave }) {
  const seedCompany = entityToCompany(entity);
  const lockCompany = !!seedCompany;

  const [visitDate, setVisitDate] = useState(todayISO());
  const [rep, setRep] = useState(CURRENT_USER);
  const [purpose, setPurpose] = useState(visitPurposes[0]);
  const [company, setCompany] = useState(seedCompany);
  const [contactsMet, setContactsMet] = useState([]);
  const [duration, setDuration] = useState("1 hour");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(todayISO());
  const [followUpNotes, setFollowUpNotes] = useState("");

  const contactOpts = useMemo(
    () => contactOptions(company ? getCompanyContacts(company.id) : []),
    [company]
  );

  const canSave = !!visitDate && !!company;

  const selectCompany = (c) => {
    setCompany(c);
    setContactsMet([]); // contact pool changes with the company
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      type: "visit",
      date: visitDate,
      visitDate,
      rep: { repName: rep },
      repName: rep,
      purpose,
      duration: DURATION_MIN[duration] || 60,
      location,
      companyId: company?.id ?? null,
      companyName: company?.name ?? "—",
      contactIds: contactsMet.map((c) => ({ contactId: c.id, contactName: c.label })),
      contactsMetSummary: contactsMet.map((c) => c.label).join(", ") || "—",
      notes: notes.trim(),
      outcome: followUp ? "Follow-up Required" : "Positive",
      followUp,
      followUpNeeded: followUp,
      followUpDate: followUp ? followUpDate : null,
      followUpNotes: followUp ? followUpNotes.trim() : null,
    });
  };

  return (
    <div>
      <AssociatedWith entity={entity} />

      <div className="space-y-4">
        <Field label="Visit Date" required>
          <TextInput type="date" value={visitDate} onChange={setVisitDate} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Rep">
            <Select value={rep} onChange={setRep} options={repNames} />
          </Field>
          <Field label="Purpose">
            <Select value={purpose} onChange={setPurpose} options={visitPurposes} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration">
            <Select value={duration} onChange={setDuration} options={DURATIONS} />
          </Field>
          <Field label="Location">
            <Select value={location} onChange={setLocation} options={LOCATIONS} />
          </Field>
        </div>

        <Divider />

        {/* ── Associate With (company + contacts met) ── */}
        <div>
          <Label>Associate With</Label>
          <div className="space-y-3">
            <div>
              <Label>Company</Label>
              <CompanyPicker company={company} onSelect={selectCompany} onClear={() => selectCompany(null)} locked={lockCompany} />
            </div>
            <div>
              <Label>Contacts Met</Label>
              <ChipMultiSelect
                options={contactOpts}
                selected={contactsMet}
                onAdd={(o) => setContactsMet((p) => [...p, o])}
                onRemove={(id) => setContactsMet((p) => p.filter((c) => c.id !== id))}
                placeholder={company ? "Search contacts…" : "Select a company first"}
                emptyHint={company ? "No contacts at this company" : "Select a company first"}
              />
            </div>
          </div>
        </div>

        <Field label="Notes">
          <TextArea value={notes} onChange={setNotes} rows={4} placeholder="Visit notes…" />
        </Field>

        <Divider />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={followUp}
            onChange={(e) => setFollowUp(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Follow-up Needed</span>
        </label>

        {followUp && (
          <div className="space-y-4 pl-6 border-l-2 border-indigo-100">
            <Field label="Follow-up Date">
              <TextInput type="date" value={followUpDate} onChange={setFollowUpDate} />
            </Field>
            <Field label="Follow-up Notes">
              <TextInput value={followUpNotes} onChange={setFollowUpNotes} placeholder="What needs follow-up?" />
            </Field>
          </div>
        )}
      </div>

      <Footer onCancel={onClose} onSubmit={handleSave} submitLabel="Save Visit" disabled={!canSave} />
    </div>
  );
}

// Searchable company selector. When `locked`, shows the selection without a
// remove control (the host page fixed the association).
function CompanyPicker({ company, onSelect, onClear, locked }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies.slice(0, 8);
    return companies.filter((c) => c.name.toLowerCase().includes(q) || (c.domain || "").toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  if (company) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
        <Building2 size={14} className="text-indigo-400 flex-shrink-0" />
        <span className="text-sm font-medium text-indigo-800 flex-1 truncate">{company.name}</span>
        {!locked && (
          <button type="button" onClick={onClear} className="text-indigo-400 hover:text-indigo-700">
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search companies…"
        className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-300"
      />
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-3 py-3 text-xs text-gray-400 text-center">No companies match “{query}”.</div>
            ) : (
              results.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onSelect(c); setQuery(""); setOpen(false); }}
                  className="w-full flex items-center justify-between gap-2 text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-xs text-gray-400 truncate">{c.domain}</span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
