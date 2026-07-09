/**
 * GET /api/v2/concierge
 *
 * Returns ranked relationship recommendations and insights for the Concierge workspace.
 * Internally runs executeBrain per owned recipient — does not expose Brain internals.
 */

import { Router } from "express";
import { db, recipientsTable } from "@workspace/db";
import { and, eq, isNull } from "drizzle-orm";
import { buildConciergeWorkspace } from "../brain/product/buildConciergeWorkspace";
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

router.get("/v2/concierge", async (req, res) => {
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

    const payload = await buildConciergeWorkspace({
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
      recommendationCount: payload.recommendations.length,
      insightCount: payload.insights.length,
    }, "v2-concierge");

    res.json(payload);
  } catch (err) {
    logger.error({ err, userId }, "v2-concierge failed");
    res.status(500).json({ error: "Failed to load concierge workspace" });
  }
});

export default router;
