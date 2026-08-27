import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.js";
import accountRoutes from "./routes/account.js";
import messageRoutes from "./routes/messages.js";
import syncRoutes from "./routes/sync.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
// Nylas caps a whole send (message + attachments, base64-encoded) at ~3MB
// combined (see MAX_TOTAL_ATTACHMENT_BYTES in routes/messages.js); 6mb gives
// headroom for JSON overhead without silently accepting oversized requests
// Nylas would reject anyway.
app.use(express.json({ limit: "6mb" }));

app.use("/api/nylas", authRoutes);
app.use("/api/nylas", accountRoutes);
app.use("/api", messageRoutes);
app.use("/api", syncRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Email server listening on http://localhost:${port}`);
});
