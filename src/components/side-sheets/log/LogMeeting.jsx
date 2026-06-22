import { useState, useMemo } from "react";
import { Search, X, Building2 } from "lucide-react";
import { repNames, companies, getCompanyContacts, getCompanyDeals } from "../../../data/constants";
import {
  AssociatedWith, Field, TextInput, TextArea, Select, ChipMultiSelect, Footer,
  Divider, Label, todayISO, contactOptions,
} from "./_shared";

const DURATIONS = ["15 min", "30 min", "45 min", "1 hour", "1.5 hours", "2 hours"];
const OUTCOMES = ["Interested", "Follow-up Needed", "Not Interested", "Rescheduled", "No Show"];

// Resolve a companies[] row from the (possibly nested) entity passed in.
function entityToCompany(entity) {
  if (!entity || (entity.type !== "company" && entity.type !== "customer")) return null;
  return companies.find((c) => c.id === entity.id) || { id: entity.id, name: entity.name };
}

// Log Meeting — appends a { type: "meeting" } activity.
// `entity` (from a Company detail page) locks the company association; otherwise
// the company is searchable. A deal can be linked, scoped to the chosen company.
export default function LogMeeting({ entity, contacts = [], onClose, onSave }) {
  const seedCompany = entityToCompany(entity);
  const lockCompany = !!seedCompany;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("30 min");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState(seedCompany);
  const [dealId, setDealId] = useState("");
  const [externalAttendees, setExternalAttendees] = useState([]);
  const [internalAttendees, setInternalAttendees] = useState([]);
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState(OUTCOMES[0]);

  // When the company comes from the host entity, its nested contacts are passed
  // in; otherwise look them up from the selected company.
  const scopedContacts = useMemo(() => {
    if (contacts.length > 0) return contacts;
    return company ? getCompanyContacts(company.id) : [];
  }, [contacts, company]);
  const contactOpts = useMemo(() => contactOptions(scopedContacts), [scopedContacts]);
  const repOpts = useMemo(() => repNames.map((r) => ({ id: r, label: r })), []);
  const dealOpts = useMemo(() => (company ? getCompanyDeals(company.name) : []), [company]);

  const canSave = title.trim() && date && startTime;

  const selectCompany = (c) => {
    setCompany(c);
    setDealId("");
    setExternalAttendees([]); // contact pool changes with the company
  };

  const handleSave = () => {
    if (!canSave) return;
    const deal = dealOpts.find((d) => String(d.id) === String(dealId)) || null;
    onSave({
      type: "meeting",
      title: title.trim(),
      date,
      startTime,
      duration,
      location: location.trim(),
      attendees: externalAttendees.map((a) => ({ contactId: a.id, contactName: a.label, email: a.sublabel || "" })),
      internalAttendees: internalAttendees.map((a) => ({ repName: a.label })),
      // Human-readable summary for the activity timeline (which renders a string).
      attendeeSummary: [...externalAttendees.map((a) => a.label), ...internalAttendees.map((a) => a.label)].join(", ") || "—",
      outcome,
      notes: notes.trim(),
      companyId: company?.id ?? null,
      companyName: company?.name ?? "—",
      dealId: deal?.id ?? null,
      dealName: deal?.name ?? null,
    });
  };

  return (
    <div>
      <AssociatedWith entity={entity} />

      <div className="space-y-4">
        <Field label="Title" required>
          <TextInput value={title} onChange={setTitle} placeholder="Meeting title" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" required>
            <TextInput type="date" value={date} onChange={setDate} />
          </Field>
          <Field label="Start Time" required>
            <TextInput type="time" value={startTime} onChange={setStartTime} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration">
            <Select value={duration} onChange={setDuration} options={DURATIONS} />
          </Field>
          <Field label="Location">
            <TextInput value={location} onChange={setLocation} placeholder="Office, Zoom link, or address" />
          </Field>
        </div>

        <Divider />

        {/* ── Associate With (company + optional deal) ── */}
        <div>
          <Label>Associate With</Label>
          <div className="space-y-3">
            <div>
              <Label>Company</Label>
              <CompanyPicker company={company} onSelect={selectCompany} onClear={() => selectCompany(null)} locked={lockCompany} />
            </div>
            <div>
              <Label>Deal</Label>
              <Select
                value={dealId}
                onChange={setDealId}
                options={[{ value: "", label: company ? "No deal linked" : "Select a company first" }, ...dealOpts.map((d) => ({ value: String(d.id), label: `${d.name} — ${d.amount}` }))]}
              />
            </div>
          </div>
        </div>

        <Divider />

        <Field label="External Attendees">
          <ChipMultiSelect
            options={contactOpts}
            selected={externalAttendees}
            onAdd={(o) => setExternalAttendees((p) => [...p, o])}
            onRemove={(id) => setExternalAttendees((p) => p.filter((a) => a.id !== id))}
            placeholder="Search contacts…"
            emptyHint="No associated contacts"
          />
        </Field>

        <Field label="Internal Attendees">
          <ChipMultiSelect
            options={repOpts}
            selected={internalAttendees}
            onAdd={(o) => setInternalAttendees((p) => [...p, o])}
            onRemove={(id) => setInternalAttendees((p) => p.filter((a) => a.id !== id))}
            placeholder="Search reps…"
          />
        </Field>

        <Divider />

        <Field label="Notes / Summary">
          <TextArea value={notes} onChange={setNotes} rows={4} placeholder="Meeting notes…" />
        </Field>

        <Field label="Outcome">
          <Select value={outcome} onChange={setOutcome} options={OUTCOMES} />
        </Field>
      </div>

      <Footer onCancel={onClose} onSubmit={handleSave} submitLabel="Save Meeting" disabled={!canSave} />
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
