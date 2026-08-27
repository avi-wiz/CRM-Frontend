import { Router } from "express";
import { getAccount, clearAccount } from "../store.js";

const router = Router();

router.get("/account", (req, res) => {
  const account = getAccount();
  res.json(account ? { connected: true, email: account.email } : { connected: false });
});

router.post("/disconnect", (req, res) => {
  clearAccount();
  res.json({ connected: false });
});

export default router;
