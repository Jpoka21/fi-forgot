import { Router } from "express";
import { runBusinessScheduler } from "../services/business-scheduler";

const router = Router();

router.post("/business-cards/generate", async (req, res) => {
  const { businessId, clientId } = req.body as { businessId?: string; clientId?: string };
  if (!businessId) { res.status(400).json({ error: "businessId required" }); return; }
  const host = process.env["REPLIT_DEV_DOMAIN"]
    ? `https://${process.env["REPLIT_DEV_DOMAIN"]}`
    : `http://localhost:${process.env["PORT"] ?? 8080}`;
  const appBaseUrl = host.replace(/\/api$/, "");
  const result = await runBusinessScheduler(appBaseUrl, {
    forceBusinessId: businessId,
    force: true,
    forceClientId: clientId,
  });
  res.json({ ok: true, queued: result.queued, skipped: result.skipped });
});

export default router;
