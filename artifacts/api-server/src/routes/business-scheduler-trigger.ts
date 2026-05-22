import { Router } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { db, businessCardQueueTable } from "@workspace/db";
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

// List pending queue items for a business — used by dashboard to show "Review" links
router.get("/business-cards/queue", async (req, res) => {
  const businessId = req.query.businessId as string | undefined;
  if (!businessId) { res.status(400).json({ error: "businessId required" }); return; }
  const items = await db
    .select({
      id:            businessCardQueueTable.id,
      clientId:      businessCardQueueTable.clientId,
      eventType:     businessCardQueueTable.eventType,
      occasionDate:  businessCardQueueTable.occasionDate,
      approvalToken: businessCardQueueTable.approvalToken,
      status:        businessCardQueueTable.status,
    })
    .from(businessCardQueueTable)
    .where(
      and(
        eq(businessCardQueueTable.businessId, businessId),
        inArray(businessCardQueueTable.status, ["pending", "approved"]),
      ),
    );
  res.json({ items });
});

export default router;
