import { Router } from "express";
import { nylas, NYLAS_CLIENT_ID, NYLAS_CALLBACK_URI } from "../nylas.js";
import { setAccount } from "../store.js";

const router = Router();

// Frontend navigates straight to this URL (no custom auth UI needed).
router.get("/auth-url", (req, res) => {
  const authUrl = nylas.auth.urlForOAuth2({
    clientId: NYLAS_CLIENT_ID,
    redirectUri: NYLAS_CALLBACK_URI,
  });
  res.json({ url: authUrl });
});

// Provider redirects back here after the user authenticates on Google/Microsoft's own screen.
router.get("/callback", async (req, res) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  if (!code) {
    return res.redirect(`${frontendUrl}/?email_connect=failed`);
  }

  try {
    const { grantId } = await nylas.auth.exchangeCodeForToken({
      clientId: NYLAS_CLIENT_ID,
      redirectUri: NYLAS_CALLBACK_URI,
      code,
    });

    const grant = await nylas.grants.find({ grantId });
    setAccount({ grantId, email: grant.data.email });

    res.redirect(`${frontendUrl}/?email_connect=success`);
  } catch (err) {
    console.error("Nylas OAuth callback failed:", err);
    res.redirect(`${frontendUrl}/?email_connect=failed`);
  }
});

export default router;
