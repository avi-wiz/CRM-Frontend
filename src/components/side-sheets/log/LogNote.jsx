import { useState } from "react";
import { AssociatedWith, Field, TextArea, Toggle, Footer, CURRENT_USER } from "./_shared";

// Log Note — appends a { type: "note" } activity to the current entity.
export default function LogNote({ entity, onClose, onSave }) {
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);

  const canSave = body.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      type: "note",
      author: CURRENT_USER,
      body: body.trim(),
      pinned,
    });
  };

  return (
    <div>
      <AssociatedWith entity={entity} />

      <div className="space-y-4">
        <Field label="Note" required>
          <TextArea value={body} onChange={setBody} rows={6} placeholder="Write your note…" />
          <p className="text-xs text-gray-400 mt-1">Supports plain text</p>
        </Field>

        <Toggle checked={pinned} onChange={setPinned} label="Pin to top" />
      </div>

      <Footer onCancel={onClose} onSubmit={handleSave} submitLabel="Save Note" disabled={!canSave} />
    </div>
  );
}
