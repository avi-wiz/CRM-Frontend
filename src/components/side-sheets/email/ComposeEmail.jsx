import { useState, useRef, useMemo } from "react";
import { Paperclip, X, Search } from "lucide-react";
import { AssociatedWith, Field, TextInput, TextArea, Footer, INPUT_CLASS, Chip } from "../log/_shared";
import { useEmailActions } from "../../../data/useEmailThread";

// Nylas caps the ENTIRE send request (message + all attachments, base64-
// encoded) at 3MB combined — not per file. Leave headroom for the body/JSON
// overhead around the attachment content itself.
const MAX_TOTAL_ATTACHMENT_BYTES = 2.5 * 1024 * 1024;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Reads a File as base64 (no data: prefix) for Nylas's inline attachment API.
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Multi-recipient search/select over the entity's associated contacts (a
// Company/Contact's contact list), used for To/Cc/Bcc alike. Typing a query
// that matches no contact still lets the user add it directly as a raw email
// address (Enter, or the "Add <query>" row) — contacts are a convenience,
// not a restriction.
function RecipientPicker({ contacts, selected, onAdd, onRemove, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedEmails = useMemo(() => new Set(selected.map((s) => s.email.toLowerCase())), [selected]);

  const filtered = useMemo(() => {
    const pool = contacts.filter((c) => c.email && !selectedEmails.has(c.email.toLowerCase()));
    if (!query.trim()) return pool.slice(0, 8);
    const q = query.toLowerCase();
    return pool.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 8);
  }, [contacts, selectedEmails, query]);

  const trimmedQuery = query.trim();
  const queryIsNewEmail =
    trimmedQuery && EMAIL_RE.test(trimmedQuery) && !selectedEmails.has(trimmedQuery.toLowerCase());

  const addRaw = (email) => {
    onAdd({ id: email, name: email, email });
    setQuery("");
  };

  const addContact = (c) => {
    onAdd(c);
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && queryIsNewEmail) {
      e.preventDefault();
      addRaw(trimmedQuery);
    }
  };

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((s) => (
            <Chip key={s.email} label={s.name !== s.email ? `${s.name} (${s.email})` : s.email} onRemove={() => onRemove(s.email)} />
          ))}
        </div>
      )}
      <div className="relative">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-disabled" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`${INPUT_CLASS} pl-8`}
          />
        </div>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-surface border border-border rounded-lg shadow-3 overflow-hidden max-h-56 overflow-y-auto">
              {queryIsNewEmail && (
                <button
                  type="button"
                  onClick={() => addRaw(trimmedQuery)}
                  className="w-full text-left px-3 py-2 hover:bg-action-hover text-sm text-primary border-b border-divider"
                >
                  Add "{trimmedQuery}"
                </button>
              )}
              {filtered.length === 0 && !queryIsNewEmail ? (
                <div className="px-3 py-3 text-xs text-disabled text-center">
                  {contacts.length === 0 ? "Type an email address" : "No matching contacts"}
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => addContact(c)}
                    className="w-full text-left px-3 py-2 hover:bg-action-hover text-sm text-muted"
                  >
                    {c.name} <span className="text-disabled ml-1.5 text-xs">{c.email}</span>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Shared compose/reply/forward form.
//
// mode: "new" | "reply" | "forward"
// original: the message being replied to / forwarded (required for reply/forward)
// entity: { id, type, name } — shown as "Associated with" when composing from
//   a Company/Contact's Activity tab ("Create Email" action)
// defaultTo: pre-fills To when composing from an entity with a known email
//   (e.g. a Contact's own address)
// contacts: [{ id, name, email }] — the entity's associated contacts, offered
//   in the To/Cc/Bcc search/select dropdowns (normalizeContacts() shape)
//
// Pre-fill rules (per Email POC — Frontend Flows.md §5/§6):
//   reply:   To = original sender, Subject = original subject, Body = empty
//   forward: To = empty,           Subject = original subject, Body = quoted original
export default function ComposeEmail({ mode = "new", original, entity, defaultTo = "", contacts = [], onClose, onSent }) {
  const { send } = useEmailActions();

  const initialTo = mode === "reply" ? original?.from || "" : defaultTo;
  const [to, setTo] = useState(initialTo ? [{ id: initialTo, name: initialTo, email: initialTo }] : []);
  const [cc, setCc] = useState([]);
  const [bcc, setBcc] = useState([]);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState(original?.subject || "");
  const [body, setBody] = useState(
    mode === "forward" && original
      ? `\n\n---- Forwarded message ----\nFrom: ${original.fromName || original.from}\nSubject: ${original.subject}\n\n${original.body || original.snippet || ""}`
      : ""
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]); // File[]
  const fileInputRef = useRef(null);

  const canSend = to.length > 0 && subject.trim() && !sending;

  const addTo = (c) => setTo((prev) => [...prev, c]);
  const removeTo = (email) => setTo((prev) => prev.filter((c) => c.email !== email));
  const addCc = (c) => setCc((prev) => [...prev, c]);
  const removeCc = (email) => setCc((prev) => prev.filter((c) => c.email !== email));
  const addBcc = (c) => setBcc((prev) => [...prev, c]);
  const removeBcc = (email) => setBcc((prev) => prev.filter((c) => c.email !== email));

  const handleFilesPicked = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-picking the same file
    const totalBytes = [...files, ...picked].reduce((sum, f) => sum + f.size, 0);
    if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
      setError(`Attachments total ${formatBytes(totalBytes)} — Nylas allows up to ${formatBytes(MAX_TOTAL_ATTACHMENT_BYTES)} combined per send.`);
      return;
    }
    setError(null);
    setFiles((prev) => [...prev, ...picked]);
  };

  const removeFile = (name) => setFiles((prev) => prev.filter((f) => f.name !== name));

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      const attachments = await Promise.all(
        files.map(async (file) => ({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          content: await fileToBase64(file),
        }))
      );

      await send({
        to: to.map((c) => c.email),
        cc: cc.map((c) => c.email),
        bcc: bcc.map((c) => c.email),
        subject: subject.trim(),
        body,
        original_message_id: mode !== "new" ? original?.id : undefined,
        mode,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      onSent?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Send failed — try again.");
      setSending(false);
    }
  };

  return (
    <div>
      {entity && <AssociatedWith entity={entity} />}
      <div className="space-y-4">
        <Field label="To" required>
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <RecipientPicker contacts={contacts} selected={to} onAdd={addTo} onRemove={removeTo} placeholder="Search contacts or type an email…" />
            </div>
            {!showCcBcc && (
              <button
                type="button"
                onClick={() => setShowCcBcc(true)}
                className="text-xs text-primary hover:underline flex-shrink-0 mt-2.5"
              >
                Cc/Bcc
              </button>
            )}
          </div>
        </Field>

        {showCcBcc && (
          <>
            <Field label="Cc">
              <RecipientPicker contacts={contacts} selected={cc} onAdd={addCc} onRemove={removeCc} placeholder="Search contacts or type an email…" />
            </Field>
            <Field label="Bcc">
              <RecipientPicker contacts={contacts} selected={bcc} onAdd={addBcc} onRemove={removeBcc} placeholder="Search contacts or type an email…" />
            </Field>
          </>
        )}

        <Field label="Subject" required>
          <TextInput value={subject} onChange={setSubject} placeholder="Subject" />
        </Field>
        <Field label="Body">
          <TextArea value={body} onChange={setBody} rows={10} placeholder="Write your message…" />
        </Field>

        <div>
          <input ref={fileInputRef} type="file" multiple hidden onChange={handleFilesPicked} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Paperclip size={14} /> Attach files
          </button>

          {files.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {files.map((f) => (
                <div key={f.name} className="flex items-center justify-between px-3 py-1.5 bg-default border border-border rounded-lg text-sm">
                  <span className="text-ink truncate">{f.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-disabled">{formatBytes(f.size)}</span>
                    <button type="button" onClick={() => removeFile(f.name)} className="text-disabled hover:text-danger">
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-danger bg-danger-bg border border-danger rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>

      <Footer
        onCancel={onClose}
        onSubmit={handleSend}
        submitLabel={sending ? "Sending…" : "Send"}
        disabled={!canSend}
      />
    </div>
  );
}
