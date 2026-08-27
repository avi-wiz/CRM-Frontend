# Email POC — Nylas v3

**Location:** `poc/nylas-email/` (standalone; nothing in `src/` was touched)
**Status:** working — auth, send, inbound sync, and threading all verified against a live mailbox
**Date:** 2026-08-27

---

## 1. Objective

We're planning an email integration inside the CRM, surfaced as **Activities on a Customer's detail page**. Before designing that, we wanted to answer one question:

> **Can we authenticate a mailbox, send a message, receive inbound mail, and make a reply land in the same email thread — via Nylas?**

Threading was the specific worry. Everything else is a normal API integration; getting a reply to nest correctly inside Gmail/Outlook is the part that quietly breaks and is expensive to discover late.

**This POC is a feasibility test, not a feature.** It intentionally has no status enum, no failed/retry UI, no cc/bcc, no attachments, no identity matching, no thread grouping, and no persistence. Those are real product decisions; none of them were needed to answer the question.

### Verdict

All four things work. The threading mechanic is simpler than expected — see §4, which is the part worth reading before you write any code.

---

## 2. Running it

Two manual steps first, both requiring a browser:

1. **Nylas Sandbox app** — at `dashboard.nylas.com`, copy the **API key**.
   Use **Sandbox**, not Production: it ships with pre-configured Google/Microsoft OAuth connectors, so you can connect a mailbox immediately. Production requires your own Google Cloud project, OAuth consent screen, and client credentials. Sandbox caps at **10 grants** (can't be raised) and doesn't expose the `client_secret` — neither matters for a POC.
2. **Connect a mailbox** — on the **Grants** page, connect a Gmail/Outlook account and copy the **grant ID**.

Then:

```bash
cd poc/nylas-email
npm install
cp .env.example .env      # paste API key + grant ID
npm start                 # http://localhost:4000
```

Set `CONTACT_EMAIL` to **an address you control and can reply from** — a Gmail `+alias` is ideal. Without that you can't complete the threading test.

**Inbound, two options:**

- `npm run poll` — polls every 15s. No public URL, no ngrok. Fastest way to see mail arrive.
- **Webhooks** — `ngrok http 4000`, then register `<public-url>/webhooks/nylas` for `message.created`. Use this to validate the real production path.

Both feed the same normaliser, so the rest of the app can't tell them apart.

---

## 3. What's built

| File | Responsibility |
|---|---|
| `nylas_client.js` | **The only file that talks to Nylas.** Send, list, find, grant lookup. |
| `compose.js` | Reply/forward construction — where the threading rule lives. |
| `store.js` | In-memory message log + the Nylas→row normaliser. |
| `server.js` | Routes: compose/send, webhook receiver, poll sync. |
| `ui.js` | Server-rendered HTML. No build step, no framework. |

~560 lines total. Dependencies: `express`, `nylas` (8.4.0), `dotenv`.

**Routes**

| Route | Purpose |
|---|---|
| `GET /` | Everything: compose form, message table, body view, reply/forward panel |
| `POST /send` | Send — handles new messages, replies, and forwards |
| `GET /webhooks/nylas` | Echoes Nylas' `challenge` param. **Required** — without it the webhook can't be created. |
| `POST /webhooks/nylas` | Receives `message.created`, verifies signature, stores raw payload + message |
| `POST /sync` | Manual "Sync now" — pulls the 20 most recent messages |

**UI**

Flat table of all messages (direction / subject+snippet / from / date), click a row for the full body in a sandboxed iframe, per-row **Reply** and **Forward**, and a raw-webhook-payload panel for debugging what Nylas actually sends.

---

## 4. The threading mechanic — read this first

**The single most important finding.** Our original plan was to read the inbound message's `Message-ID` and hand-set `In-Reply-To` and `References`. **That is wrong on Nylas v3.**

You pass **`reply_to_message_id`** and Nylas writes those headers itself. Setting them yourself *as well* produces duplicate headers and Gmail breaks the thread.

```js
// Reply — threads correctly
await nylas.messages.send({
  identifier: grant_id,
  requestBody: { to, subject, body, replyToMessageId: original.id },
});
```

Field casing differs by layer: REST is `reply_to_message_id`, the Node SDK is `replyToMessageId`.

### Forward is not a Nylas feature

**Nylas has no forward endpoint or forward field.** A forward is an ordinary send with the original quoted in the body. So the entire reply/forward distinction is one field:

| | `reply_to_message_id` | Result |
|---|---|---|
| **Reply** | sent | Nylas writes `In-Reply-To` + `References` → nests in the same thread |
| **Forward** | **deliberately omitted** | starts a new thread |

**The trap:** passing `reply_to_message_id` on a forward nests it into the original conversation, when a forward to a new recipient should start its own. The code documents this at the top of `compose.js` so it doesn't get "fixed" back in.

### Verifying it

1. Send to your `+alias`, reply from the alias in Gmail, **Sync now**
2. **Reply** on that row → should collapse into the same Gmail conversation
3. **Forward** the same row to a third address → should appear as a *separate* conversation

Step 3 is the more informative test. If a forward also threads, something is passing `reply_to_message_id` when it shouldn't.

---

## 5. Caveats

Things that are deliberate shortcuts, and things that will bite in production.

### Will not survive contact with production

- **In-memory storage.** Restart loses everything. No DB, by design.
- **Signature verification is skippable.** With `NYLAS_WEBHOOK_SECRET` blank, any POST to the webhook is trusted. Fine locally; **must** be enforced in production.
- **Single hardcoded grant + contact.** No OAuth UI, no multi-user, no per-user mailbox resolution.
- **Sandbox app.** 10-grant ceiling, no `client_secret`, can't change scopes. Grant IDs do **not** carry across Nylas apps — the mailbox must be reconnected per environment, and Nylas recommends a separate app per env (dev/staging/prod).
- **Message bodies render in a sandboxed iframe.** Adequate here; real inbound HTML email needs deliberate sanitisation.

### Behaviours worth knowing

- **Direction is inferred, not given.** Nylas has no inbound/outbound field. We compare the sender against the connected mailbox's own address. The alternative — the `folders` field — is provider-specific (`SENT` vs `\\Sent`), so sender comparison is the portable choice. Consequence: **self-addressed mail is labelled outbound.**
- **`date` is Unix *seconds*.** Multiply by 1000 for JS. Off-by-1000× here means dates in 1970.
- **Webhook enrichment degrades independently.** If the mailbox lookup or body re-fetch fails, the message is still recorded. An earlier version aborted the whole recording when Nylas was unreachable — payloads printed but never appeared in the UI. Keep this property.
- **Webhooks are ack'd immediately (200) before processing.** Nylas retries on non-2xx and doesn't wait for our work.
- **Messages upsert by id**, so webhook and poll can both deliver the same message harmlessly.
- **`Re:`/`Fwd:` prefixes are applied once** — no `Re: Re: Re:` stacking.
- **Quoted originals travel in a hidden form field**, so the textarea holds only what the user typed.

### Not answered by this POC — the actual product work

These are the open questions for the real feature, in rough order of difficulty:

1. **Identity matching.** Given a message, which Customer does it belong to? Sender/recipient email matching is the obvious approach and is lossy: personal addresses, multi-contact threads, shared inboxes. **This is where the feature succeeds or fails.** Note the Associations work (contacts hanging off a buyer/lead) is exactly the lookup table this needs.
2. **Visibility.** If Rep A emails a customer, does Rep B see it on the customer page? A privacy and product decision that must be settled *before* schema.
3. **Sync strategy.** Store message metadata (fast, filterable, works offline, sortable alongside other activities) vs. proxy Nylas live per page-load (less to build, slow, unpageable). Since `get_activity` already returns a merged paginated feed, storing metadata is likely right.
4. **Unmatched mail.** What happens to messages that match no customer?

---

## 6. How this maps onto our CRM

Relevant if you're doing the real integration:

- **Nylas is already partly integrated.** `@nylas/nylas-react` is a dependency, and there's a working connect/disconnect flow: `src/utils/api_requests/email_config.ts` (`nylas/v1/generate-auth-url`, `get-connected-account`, `exchange-mailbox-token`, `disconnect-account`), UI in `src/screens/Home/EmailSetting/ConfigureEmailDrawer.tsx`, grant state in Redux at `state.nylas` (`status === 'published'`, `meta.email_address`).
- **Our backend proxies Nylas.** The frontend never calls `api.us.nylas.com` directly, so the API key stays server-side. **The real integration is backend-first**, and `nylas_client.js` is the seam that gets replaced by our `nylas/v1/*` proxy.
- **The Activity feed is nearly ready.** `src/utils/api_requests/activity.ts` already fetches per-customer *and* per-deal (`?buyer_id=` / `?deal_id=`), and `helper.tsx` already maps `'email'` → `IconMail`.
- **One known gap:** `ACTIVITY_TYPES` in `src/common/BuyerLeadDetailsDashboard/BuyerLeadDetails/helper.tsx` contains only `task`, `note`, `comment`, `manual`, `auto` — there's no `email` entry, so an email activity would render with a blank label. That's the seam to extend.

---

## 7. References

- [Sending messages with Nylas](https://developer.nylas.com/docs/v3/email/send-email/) — send + `reply_to_message_id`
- [Reply to a thread](https://developer.nylas.com/docs/cookbook/email/threads/reply-to-a-thread/)
- [Threading behaviour in API V3](https://support.nylas.com/hc/en-us/articles/20295511843997-Threading-behaviour-in-API-V3)
- [Sandbox vs Production limitations](https://support.nylas.com/hc/en-us/articles/28841692494877-Nylas-Sandbox-vs-Production-Applications-Understanding-Limitations)
- [Using the Threads API](https://developer.nylas.com/docs/v3/email/threads/)
