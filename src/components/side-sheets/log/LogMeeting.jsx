import { useState, useMemo } from "react";
import { repNames, companies, getCompanyContacts } from "../../../data/constants";
import {
  AssociatedWith, Field, TextInput, TextArea, Select, ChipMultiSelect, Footer,
  Divider, Label, todayISO, contactOptions,
} from "./_shared";
import AssociationsSection from "../../shared/AssociationsSection";
import { useAssociations } from "../../../data/useAssociations";
import {
  suggestedContactsFor,
  MEETING_ASSOCIATION_ORDER,
  REQUIRED_BY_HOST,
} from "../../../data/associationRegistry";

const DURATIONS = ["15 min", "30 min", "45 min", "1 hour", "1.5 hours", "2 hours"];
const OUTCOMES = ["Interested", "Follow-up Needed", "Not Interested", "Rescheduled", "No Show"];

// Resolve a companies[] row from the (possibly nested) entity passed in.
function entityToCompany(entity) {
  if (!entity || (entity.type !== "company" && entity.type !== "customer")) return null;
  return companies.find((c) => c.id === entity.id) || { id: entity.id, name: entity.name };
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

// Log Meeting — appends a { type: "meeting" } activity.
// `entity` (from a Company detail page) locks the company association; otherwise
// companies, contacts and deals are all associable through the single
// "Add association" picker, each searching its whole object.
/**
 * FORM SOURCE: Org Settings → Forms → Meeting
 * System fields: Title, Date/Time
 * "Prompt follow-up task after completion" behavior from Meeting form settings.
 * Auto-associates with current entity when opened from a detail page.
 */
export default function LogMeeting({ entity, contacts = [], onClose, onSave }) {
  const seedCompany = entityToCompany(entity);
  const lockCompany = !!seedCompany;

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("30 min");
  const [location, setLocation] = useState("");
  const [externalAttendees, setExternalAttendees] = useState([]);
  const [internalAttendees, setInternalAttendees] = useState([]);
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState(OUTCOMES[0]);

  // Typed association edges, seeded from the host entity when opened from a
  // Company detail page.
  const associations = useAssociations(
    seedCompany
      ? {
          company: [{ record: toAssociationRecord(seedCompany), label: null }],
          contact: suggestedContactsFor(seedCompany.id).map((r) => ({ record: r, label: null })),
        }
      : {}
  );
  const company = associations.company;

  // Picking a company prefills its contacts; clearing it clears them. The
  // pickers still search every record of their type.
  const handleAssociationAdd = (type, record) => {
    associations.add(type, record);
    if (type === "company") associations.setType("contact", suggestedContactsFor(record.id));
  };
  const handleAssociationRemove = (type, id) => {
    associations.remove(type, id);
    if (type === "company") associations.setType("contact", []);
  };

  // Attendee pool follows the associated company, falling back to any contacts
  // handed in by the host page.
  const scopedContacts = useMemo(() => {
    if (contacts.length > 0) return contacts;
    return company ? getCompanyContacts(company.id) : [];
  }, [contacts, company]);
  const contactOpts = useMemo(() => contactOptions(scopedContacts), [scopedContacts]);
  const repOpts = useMemo(() => repNames.map((r) => ({ id: r, label: r })), []);

  const canSave = title.trim() && date && startTime;

  const handleSave = () => {
    if (!canSave) return;
    const { companyIds, contactIds, dealIds, meetingIds, associationLabels } = associations.toPayload();
    // The meetings store still carries a single primary deal; the full typed
    // edge set rides alongside it.
    const primaryDeal = associations.value.deal?.[0]?.record ?? null;
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
      companyName: company?.primary ?? "—",
      dealId: primaryDeal?.id ?? null,
      dealName: primaryDeal?.primary ?? null,
      // Typed association edges — ids preserved, labels included.
      associations: { companyIds, contactIds, dealIds, meetingIds },
      associationLabels,
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

        {/* ── Associate With — one picker for companies, contacts and deals ── */}
        <div>
          <Label>Associate With</Label>
          <AssociationsSection
            value={associations.value}
            order={MEETING_ASSOCIATION_ORDER}
            requiredTypes={REQUIRED_BY_HOST.meeting}
            onAdd={handleAssociationAdd}
            onRemove={handleAssociationRemove}
            onLabelChange={associations.setLabel}
            lockedTypes={lockCompany ? ["company"] : []}
          />
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
