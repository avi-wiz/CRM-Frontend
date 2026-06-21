import { useState } from "react";
import { repNames } from "../../../data/constants";
import {
  AssociatedWith, Field, TextInput, TextArea, Select, Footer, Divider,
  todayISO, CURRENT_USER,
} from "./_shared";

const PURPOSES = ["Sales Call", "Support", "Onboarding", "Relationship", "Other"];

// Log Visit — appends a { type: "visit" } activity. A follow-up checkbox
// reveals follow-up date + notes when checked.
export default function LogVisit({ entity, onClose, onSave }) {
  const [visitDate, setVisitDate] = useState(todayISO());
  const [rep, setRep] = useState(CURRENT_USER);
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(todayISO());
  const [followUpNotes, setFollowUpNotes] = useState("");

  const canSave = !!visitDate;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      type: "visit",
      date: visitDate,
      rep,
      purpose,
      notes: notes.trim(),
      followUp,
      followUpDate: followUp ? followUpDate : null,
      followUpNotes: followUp ? followUpNotes.trim() : "",
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
            <Select value={purpose} onChange={setPurpose} options={PURPOSES} />
          </Field>
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
