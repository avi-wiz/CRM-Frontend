import { Router } from "express";
import { nylas } from "../nylas.js";
import { getAccount, upsertMessages } from "../store.js";

const router = Router();

// Manual "Sync now" — pulls the 20 most recent messages. Poll-based only in
// this build; no webhook/ngrok wiring.
router.post("/sync", async (req, res) => {
  const account = getAccount();
  if (!account) return res.status(409).json({ error: "No mailbox connected" });

  try {
    const { data } = await nylas.messages.list({
      identifier: account.grantId,
      queryParams: { limit: 20 },
    });
    const messages = upsertMessages(data);
    res.json({ messages });
  } catch (err) {
    console.error("Nylas sync failed:", err);
    res.status(502).json({ error: "Sync failed" });
  }
});

export default router;
