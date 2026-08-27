// Thin fetch wrappers around the /api/nylas/* and /api/messages* backend
// routes (server/). Frontend never talks to Nylas directly.

const BASE = "/api";

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function getAuthUrl() {
  return request("/nylas/auth-url");
}

export function getAccount() {
  return request("/nylas/account");
}

export function disconnectAccount() {
  return request("/nylas/disconnect", { method: "POST" });
}

export function listMessages() {
  return request("/messages");
}

export function getMessage(id) {
  return request(`/messages/${id}`);
}

// mode: "new" | "reply" | "forward"; original_message_id required for reply/forward.
// to/cc/bcc: string[] of email addresses (to requires at least one).
// attachments: [{ filename, contentType, content }] — content is base64 (no data: prefix).
export function sendMessage({ to, cc, bcc, subject, body, original_message_id, mode = "new", attachments }) {
  return request("/messages/send", {
    method: "POST",
    body: JSON.stringify({ to, cc, bcc, subject, body, original_message_id, mode, attachments }),
  });
}

export function syncMessages() {
  return request("/sync", { method: "POST" });
}

// Direct browser download link — not run through the request() JSON wrapper.
export function attachmentDownloadUrl(messageId, attachmentId) {
  return `${BASE}/messages/${messageId}/attachments/${attachmentId}`;
}
