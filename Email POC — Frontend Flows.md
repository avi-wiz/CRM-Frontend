# Email POC — Frontend Flows

**Scope:** This is the trimmed-down POC scope only (not the full product). Goal is to prove: OAuth connect works, send works, inbound sync works, and reply-on-same-thread actually threads correctly in Gmail/Outlook. Everything else (multi-contact CRM, Bcc handling, Failed/Retry states, unmatched-contact routing, per-user Inbox scoping) is explicitly out of scope for this build — see "Not in POC scope" at the bottom.

---

## 1. Connect Mailbox (one-time setup)

**Screen:** Simple settings/connect page.

- Single button: **"Connect Email"**.
- Clicking it redirects the user to Nylas' hosted OAuth flow (backend gives you the redirect URL — frontend just navigates to it, no custom auth UI needed).
- User authenticates with their real Gmail/Outlook on the provider's own screen (not ours).
- On success, provider redirects back to a callback URL in our app.
- Frontend shows a simple confirmation state: **"Connected as [email address]"**.
- If the OAuth flow fails or is cancelled, show: **"Connection failed — try again"** with the same Connect button.
- No need to build multi-account switching — one connected mailbox for the whole POC.

---

## 2. Compose & Send

**Screen:** Basic compose form (modal or inline panel — dev's choice).

- Fields: **To**, **Subject**, **Body** (plain text or basic rich text — no Cc/Bcc/attachments for POC).
- One **Send** button.
- On click:
  - Disable the form / show a sending indicator.
  - Call backend send endpoint.
  - On success: clear the form, show a simple confirmation toast ("Sent"), and add the message to the flat list (see Section 3) immediately so the user sees it without a refresh.
  - On failure: show an inline error message and re-enable the form. No retry queue needed — user can just hit Send again manually.
- No draft-saving behavior needed — if the user navigates away, the compose content can just be lost for POC purposes.

---

## 3. Message List (flat, no folders)

**Screen:** Single list/table view — this is the whole "inbox" for the POC.

- One flat list combining both sent and received messages, newest first.
- Each row shows: direction (in/out — a simple icon or label is fine), From/To, Subject, a short clipped preview of the body, timestamp.
- No filtering, no folders, no status badges needed for POC — just the raw list.
- New inbound messages should appear here automatically when the backend webhook fires — either via a live update (websocket/poll) or a manual "Refresh" button if you want to keep it simple for v0.

---

## 4. Open a Message (detail view)

**Screen:** Detail panel — can be a simple page, modal, or side panel, whichever is fastest to build.

- Clicking any row in the list opens this view.
- Shows: full From/To, Subject, full body (not clipped), timestamp.
- Two buttons at the top: **Reply** and **Forward**.
- No attachment rendering needed unless you want to stretch — not required for POC.

---

## 5. Reply (same thread)

**Screen:** Reuse the compose form from Section 2, but pre-filled.

- Triggered from the Reply button on the list row or the detail view.
- Pre-fill: **To** = original sender, **Subject** = original subject (frontend doesn't need to add "Re:" — backend/Nylas handles correct header formatting), **Body** = empty (or optionally pre-fill quoted original text below the cursor if there's time).
- On Send, this must call the backend with a reference to the **original message being replied to** (backend will use this to set Nylas' `reply_to_message_id` so the reply lands in the same thread — frontend just needs to pass the ID of the message the user clicked Reply from).
- Same send/success/failure UI behavior as Section 2.
- **This is the most important flow to get right in the POC** — the whole point is verifying that when this reply lands in the recipient's actual Gmail/Outlook, it nests under the original message instead of appearing as a new, disconnected email.

---

## 6. Forward

**Screen:** Same compose form, pre-filled differently.

- Triggered from the Forward button.
- Pre-fill: **To** = empty (user must type a new recipient), **Subject** = original subject, **Body** = pre-filled with the original message's content quoted below (frontend can just dump the original body text in, prefixed with something like "---- Forwarded message ----").
- Same backend contract as Reply: pass the ID of the original message so the backend can keep it on the same `thread_id` (per our architecture decision, forwards stay linked to the thread rather than forking).
- Same send/success/failure UI behavior as Section 2.

---

## What the backend needs from the frontend on every send/reply/forward call

- `to` (string, email)
- `subject` (string)
- `body` (string)
- `original_message_id` (only for Reply/Forward — omit for a fresh Compose)

Frontend doesn't need to touch Nylas directly — all Nylas calls (`send`, `reply_to_message_id`, `thread_id` handling) happen on the backend. Frontend's job is just to collect the form fields and pass `original_message_id` when it's a Reply or Forward.

---

## Not in POC scope (explicitly deferred — don't build these yet)

- Multiple contacts/companies — one hardcoded contact/context is fine.
- Cc/Bcc fields.
- Attachments.
- Draft state / saved drafts.
- Failed/Retry UI — a failed send just shows an inline error, no persistent Failed list.
- Per-user Inbox scoping (multi-rep visibility rules) — POC is single-user.
- Unmatched-sender review queue.
- Status badges (Draft/Sending/Received/Failed) — not needed until the real product build.