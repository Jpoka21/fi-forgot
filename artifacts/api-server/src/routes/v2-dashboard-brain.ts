/**
 * GET /api/v2/dashboard/brain-opportunities
 *
 * Returns ranked Brain opportunities for dashboard surfaces.
 * Internally runs executeBrain per owned recipient — does not expose Brain internals.
 */

import { Router } from "express";
import { db, recipientsTable } from "@workspace/db";
import { and, eq, isNull } from "drizzle-orm";
import { buildDashboardBrainOpportunities } from "../brain/product/buildDashboardBrainOpportunities";
import { executeBrain } from "../brain/orchestrator";
import { logger } from "../lib/logger";

const router = Router();

function requireUserId(req: Parameters<Parameters<typeof router.get>[1]>[0], res: Parameters<Parameters<typeof router.get>[1]>[1]): string | null {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) { res.status(401).json({ error: "x-user-id header required" }); return null; }
  return userId;
}

function formatRecipientName(recipient: {
  firstName: string;
  lastName: string | null;
  nickname: string | null;
}): string {
  if (recipient.nickname?.trim()) return recipient.nickname.trim();
  const last = recipient.lastName?.trim();
  return last ? `${recipient.firstName} ${last}` : recipient.firstName;
}

router.get("/v2/dashboard/brain-opportunities", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const rows = await db
      .select({
        id: recipientsTable.id,
        firstName: recipientsTable.firstName,
        lastName: recipientsTable.lastName,
        nickname: recipientsTable.nickname,
      })
      .from(recipientsTable)
      .where(and(eq(recipientsTable.userId, userId), isNull(recipientsTable.archivedAt)));

    const opportunities = await buildDashboardBrainOpportunities({
      userId,
      recipients: rows.map((row) => ({
        recipientId: row.id,
        recipientName: formatRecipientName(row),
      })),
      runBrain: executeBrain,
    });

    logger.info({
      userId,
      recipientCount: rows.length,
      opportunityCount: opportunities.opportunities.length,
      spotlightRecipientId: opportunities.spotlight?.recipientId ?? null,
    }, "v2-dashboard: brain-opportunities");

    res.json(opportunities);
  } catch (err) {
    logger.error({ err, userId }, "v2-dashboard: brain-opportunities failed");
    res.status(500).json({ error: "Failed to load dashboard brain opportunities" });
  }
});

export default router;
