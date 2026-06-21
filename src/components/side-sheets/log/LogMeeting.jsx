import { useState, useMemo } from "react";
import { repNames } from "../../../data/constants";
import {
  AssociatedWith, Field, TextInput, TextArea, Select, ChipMultiSelect, Footer,
  Divider, todayISO, contactOptions,
} from "./_shared";

const DURATIONS = ["15 min", "30 min", "45 min", "1 hour", "1.5 hours", "2 hours"];
const OUTCOMES = ["Interested", "Follow-up Needed", "Not Interested", "Rescheduled", "No Show"];

// Log Meeting — appends a { type: "meeting" } activity.
export default function LogMeeting({ entity, contacts = [], onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("30 min");
  const [location, setLocation] = useState("");
  const [externalAttendees, setExternalAttendees] = useState([]);
  const [internalAttendees, setInternalAttendees] = useState([]);
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState(OUTCOMES[0]);

  const contactOpts = useMemo(() => contactOptions(contacts), [contacts]);
  const repOpts = useMemo(() => repNames.map((r) => ({ id: r, label: r })), []);

  const canSave = title.trim() && date && startTime;

  const handleSave = () => {
    if (!canSave) return;
    const attendeeNames = [
      ...externalAttendees.map((a) => a.label),
      ...internalAttendees.map((a) => a.label),
    ];
    onSave({
      type: "meeting",
      title: title.trim(),
      date,
      startTime,
      duration,
      location: location.trim(),
      attendees: attendeeNames.join(", ") || "—",
      outcome,
      notes: notes.trim(),
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
