// Reply/forward request-body construction.
//
// THE TRAP (do not "fix" this back in): passing reply_to_message_id on a
// forward nests it into the original Gmail/Outlook conversation, when a
// forward to a new recipient should start its own thread. Nylas has no
// forward endpoint or field — a forward is an ordinary send with the
// original quoted in the body. Reply/forward is a single field:
//
//   reply     -> reply_to_message_id: SET      -> Nylas writes In-Reply-To
//                                                  + References -> same thread
//   forward   -> reply_to_message_id: OMITTED  -> starts a new thread
//
// Field casing: REST is reply_to_message_id, the Node SDK is replyToMessageId.

// attachments: [{ filename, contentType, content }] — content is a base64
// string (frontend reads the file as a data URL and strips the prefix).
// to/cc/bcc: string[] of email addresses.
export function buildSendRequest({ to, cc, bcc, subject, body, mode, originalMessage, attachments }) {
  const requestBody = {
    to: to.map((email) => ({ email })),
    subject,
    body,
  };

  if (cc && cc.length > 0) requestBody.cc = cc.map((email) => ({ email }));
  if (bcc && bcc.length > 0) requestBody.bcc = bcc.map((email) => ({ email }));

  if (mode === "reply" && originalMessage) {
    requestBody.replyToMessageId = originalMessage.id;
  }
  // mode === "forward": deliberately no replyToMessageId — new thread.

  if (attachments && attachments.length > 0) {
    requestBody.attachments = attachments.map((a) => ({
      filename: a.filename,
      contentType: a.contentType,
      content: a.content,
    }));
  }

  return requestBody;
}
