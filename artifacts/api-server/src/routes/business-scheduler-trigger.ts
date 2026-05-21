import { Router } from "express";
import { runBusinessScheduler } from "../services/business-scheduler";

const router = Router();

router.post("/business-scheduler/trigger", async (req, res) => {
  const { businessId } = req.body as { businessId?: string };
  if (!businessId) { res.status(400).json({ error: "businessId required" }); return; }
  const host = process.env["REPLIT_DEV_DOMAIN"]
    ? `https://${process.env["REPLIT_DEV_DOMAIN"]}`
    : `http://localhost:${process.env["PORT"] ?? 8080}`;
  const appBaseUrl = host.replace(/\/api$/, "");
  await runBusinessScheduler(appBaseUrl, { forceBusinessId: businessId });
  res.json({ ok: true });
});

export default router;
