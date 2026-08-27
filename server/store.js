// In-memory account + message log. Restart loses everything, by design —
// this mirrors the POC's store.js. No DB, single mailbox (no multi-user).

let account = null; // { grantId, email }
let messages = []; // normalized rows, newest first

export function setAccount(next) {
  account = next;
}

export function clearAccount() {
  account = null;
  messages = [];
}

export function getAccount() {
  return account;
}

// Nylas has no delivery-failure webhook — an invalid recipient bounces back
// later as an ordinary inbound message from the mail system, not a send-time
// error. We can only detect it heuristically once it's synced: sender looks
// like a mailer daemon, or the subject reads like a bounce notice.
const BOUNCE_SENDER_RE = /mailer-daemon|postmaster|mail delivery subsystem|delivery status notification/i;
const BOUNCE_SUBJECT_RE = /delivery status notification|undelivered mail|mail delivery failed|returned mail/i;

function isBounceMessage(raw) {
  const fromAddress = raw.from?.[0]?.email || "";
  const fromName = raw.from?.[0]?.name || "";
  const subject = raw.subject || "";
  return BOUNCE_SENDER_RE.test(fromAddress) || BOUNCE_SENDER_RE.test(fromName) || BOUNCE_SUBJECT_RE.test(subject);
}

// Best-effort scrape of the original recipient + subject out of the bounce
// body — providers format these differently, so this degrades gracefully.
function parseBounceDetails(body) {
  const plain = (body || "").replace(/<[^>]+>/g, " ");
  const toMatch = plain.match(/(?:failed permanently|couldn't be delivered to|Original-Recipient:|Final-Recipient:)[^\n<]*?([\w.+-]+@[\w.-]+)/i);
  const subjectMatch = plain.match(/Subject:\s*([^\n<]+)/i);
  return {
    originalTo: toMatch?.[1] || null,
    originalSubject: subjectMatch?.[1]?.trim() || null,
  };
}

// Nylas message -> normalized row. `date` from Nylas is Unix seconds.
export function normalizeMessage(raw) {
  const selfAddress = account?.email?.toLowerCase();
  const fromAddress = raw.from?.[0]?.email?.toLowerCase();
  const bounce = isBounceMessage(raw);
  const direction = bounce
    ? "failed"
    : fromAddress && selfAddress && fromAddress === selfAddress
      ? "sent"
      : "received";

  const body = raw.body || raw.snippet || "";

  // Only non-inline attachments (inline ones are embedded images referenced
  // by contentId inside the HTML body, not separate downloadable files).
  const attachments = (raw.attachments || [])
    .filter((a) => !a.isInline)
    .map((a) => ({ id: a.id, filename: a.filename, contentType: a.contentType, size: a.size }));

  return {
    id: raw.id,
    threadId: raw.threadId,
    direction,
    from: raw.from?.[0]?.email || "—",
    fromName: raw.from?.[0]?.name || raw.from?.[0]?.email || "—",
    to: (raw.to || []).map((t) => t.email).join(", ") || "—",
    cc: (raw.cc || []).map((t) => t.email).join(", "),
    bcc: (raw.bcc || []).map((t) => t.email).join(", "),
    subject: raw.subject || "(no subject)",
    snippet: raw.snippet || "",
    body,
    date: (raw.date || 0) * 1000,
    attachments,
    ...(bounce ? { isBounce: true, ...parseBounceDetails(body) } : {}),
  };
}

// Upsert by id so webhook/poll can both deliver the same message harmlessly.
export function upsertMessages(rawList) {
  const normalized = rawList.map(normalizeMessage);
  const byId = new Map(messages.map((m) => [m.id, m]));
  for (const m of normalized) byId.set(m.id, m);
  messages = [...byId.values()].sort((a, b) => b.date - a.date);
  return messages;
}

export function addSentMessage(row) {
  messages = [row, ...messages];
  return row;
}

export function getMessages() {
  return messages;
}

export function getMessageById(id) {
  return messages.find((m) => m.id === id) || null;
}
