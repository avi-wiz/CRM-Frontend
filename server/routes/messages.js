import { Router } from "express";
import { nylas } from "../nylas.js";
import { buildSendRequest } from "../compose.js";
import { getAccount, getMessages, getMessageById, addSentMessage, normalizeMessage } from "../store.js";

// Nylas caps the ENTIRE send request (message + all attachments, base64-
// encoded) at 3MB combined — not per file. Larger files need the streaming
// upload path, which this build doesn't implement.
const MAX_TOTAL_ATTACHMENT_BYTES = 2.5 * 1024 * 1024;

const router = Router();

function requireAccount(req, res, next) {
  const account = getAccount();
  if (!account) return res.status(409).json({ error: "No mailbox connected" });
  req.account = account;
  next();
}

router.get("/messages", requireAccount, (req, res) => {
  res.json({ messages: getMessages() });
});

router.get("/messages/:id", requireAccount, (req, res) => {
  const message = getMessageById(req.params.id);
  if (!message) return res.status(404).json({ error: "Message not found" });
  res.json({ message });
});

// Streams a received message's attachment back to the client.
router.get("/messages/:id/attachments/:attachmentId", requireAccount, async (req, res) => {
  const { id, attachmentId } = req.params;
  try {
    const stream = await nylas.attachments.download({
      identifier: req.account.grantId,
      attachmentId,
      queryParams: { messageId: id },
    });
    stream.pipe(res);
  } catch (err) {
    console.error("Nylas attachment download failed:", err);
    res.status(502).json({ error: "Download failed" });
  }
});

// Handles new sends, replies, and forwards — see compose.js for the
// reply_to_message_id rule that keeps forwards out of the original thread.
router.post("/messages/send", requireAccount, async (req, res) => {
  const { to, cc, bcc, subject, body, original_message_id, mode = "new", attachments } = req.body || {};

  if (!Array.isArray(to) || to.length === 0 || !subject) {
    return res.status(400).json({ error: "to (at least one recipient) and subject are required" });
  }

  const totalAttachmentBytes = (attachments || []).reduce(
    (sum, a) => sum + Buffer.byteLength(a.content || "", "base64"),
    0
  );
  if (totalAttachmentBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
    return res.status(400).json({ error: "Attachments must total under 2.5MB combined" });
  }

  try {
    let originalMessage = null;
    if (original_message_id) {
      originalMessage = getMessageById(original_message_id);
    }

    const requestBody = buildSendRequest({ to, cc, bcc, subject, body: body || "", mode, originalMessage, attachments });

    const sent = await nylas.messages.send({
      identifier: req.account.grantId,
      requestBody,
    });

    const row = normalizeMessage(sent.data);
    // Sends are always outbound from the connected mailbox.
    row.direction = "sent";
    addSentMessage(row);

    res.json({ message: row });
  } catch (err) {
    console.error("Nylas send failed:", err);
    res.status(502).json({ error: "Send failed" });
  }
});

export default router;
