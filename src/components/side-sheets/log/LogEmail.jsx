import { useState, useMemo } from "react";
import {
  AssociatedWith, Field, TextInput, TextArea, ChipMultiSelect, Footer, Label,
  Divider, todayISO, contactOptions, CURRENT_USER,
} from "./_shared";

// Log Email — appends a { type: "email" } activity. Direction drives the
// From/To layout: Sent → From is current user; Received → To is current user.
export default function LogEmail({ entity, contacts = [], onClose, onSave }) {
  const [subject, setSubject] = useState("");
  const [direction, setDirection] = useState("sent"); // "sent" | "received"
  const [date, setDate] = useState(todayISO());
  const [body, setBody] = useState("");
  const [toContacts, setToContacts] = useState([]); // when Sent
  const [fromContact, setFromContact] = useState(null); // when Received

  const contactOpts = useMemo(() => contactOptions(contacts), [contacts]);
  const fromOpts = useMemo(
    () => contactOpts.filter((o) => o.id !== fromContact?.id),
    [contactOpts, fromContact]
  );

  const isSent = direction === "sent";
  const canSave =
    subject.trim() &&
    (isSent ? toContacts.length > 0 : !!fromContact);

  const handleSave = () => {
    if (!canSave) return;
    const counterparty = isSent
      ? toContacts.map((c) => c.label).join(", ")
      : fromContact.label;
    onSave({
      type: "email",
      subject: subject.trim(),
      direction,
      from: isSent ? CURRENT_USER : counterparty,
      to: isSent ? counterparty : CURRENT_USER,
      snippet: body.trim().slice(0, 140) || "—",
      date,
    });
  };

  return (
    <div>
      <AssociatedWith entity={entity} />

      <div className="space-y-4">
        <Field label="Subject" required>
          <TextInput value={subject} onChange={setSubject} placeholder="Email subject" />
        </Field>

        {/* Direction segmented control */}
        <div>
          <Label>Direction</Label>
          <div className="inline-flex border border-gray-200 rounded-lg overflow-hidden w-full">
            {[
              { v: "sent", l: "Sent" },
              { v: "received", l: "Received" },
            ].map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setDirection(opt.v)}
                className={`flex-1 px-3 py-2 text-sm transition-colors ${
                  direction === opt.v
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* From / To — layout flips on direction */}
        {isSent ? (
          <>
            <Field label="From">
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                {CURRENT_USER} <span className="text-gray-400">(you)</span>
              </div>
            </Field>
            <Field label="To" required>
              <ChipMultiSelect
                options={contactOpts}
                selected={toContacts}
                onAdd={(o) => setToContacts((p) => [...p, o])}
                onRemove={(id) => setToContacts((p) => p.filter((c) => c.id !== id))}
                placeholder="Search contacts…"
                emptyHint="No associated contacts"
              />
            </Field>
          </>
        ) : (
          <>
            <Field label="From" required>
              {fromContact ? (
                <div className="flex items-center justify-between px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <span className="text-sm text-gray-800">{fromContact.label}</span>
                  <button
                    type="button"
                    onClick={() => setFromContact(null)}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <ChipMultiSelect
                  options={fromOpts}
                  selected={[]}
                  onAdd={(o) => setFromContact(o)}
                  onRemove={() => {}}
                  placeholder="Search contacts…"
                  emptyHint="No associated contacts"
                />
              )}
            </Field>
            <Field label="To">
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                {CURRENT_USER} <span className="text-gray-400">(you)</span>
              </div>
            </Field>
          </>
        )}

        <Field label="Body">
          <TextArea value={body} onChange={setBody} rows={6} placeholder="Email content…" />
        </Field>

        <Field label="Date">
          <TextInput type="date" value={date} onChange={setDate} />
        </Field>
      </div>

      <Footer onCancel={onClose} onSubmit={handleSave} submitLabel="Save Email" disabled={!canSave} />
    </div>
  );
}
