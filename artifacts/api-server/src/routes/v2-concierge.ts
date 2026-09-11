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
import { createPgOpportunityFeedbackRepository, listOpportunityFeedbackService, mutateOpportunityFeedbackService } from "../brain/feedback";

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
      feedbackRepository: createPgOpportunityFeedbackRepository(),
    });

    logger.info({
      userId,
      recipientCount: rows.length,
      opportunityCount: payload.opportunities.length,
      recommendationCount: payload.recommendations.length,
      insightCount: payload.insights.length,
    }, "v2-concierge");

    res.json(payload);
  } catch (err) {
    logger.error({ err, userId }, "v2-concierge failed");
    res.status(500).json({ error: "Failed to load concierge workspace" });
  }
});

router.get("/v2/concierge/opportunity-feedback", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const recipientId = typeof req.query.recipientId === "string" ? req.query.recipientId : null;
  const result = await listOpportunityFeedbackService(userId, recipientId, {
    repository: createPgOpportunityFeedbackRepository(),
    listOwnedRecipientIds: async (ownerId, selectedId) => (await db.select({ id: recipientsTable.id }).from(recipientsTable).where(selectedId ? and(eq(recipientsTable.id, selectedId), eq(recipientsTable.userId, ownerId), isNull(recipientsTable.archivedAt)) : and(eq(recipientsTable.userId, ownerId), isNull(recipientsTable.archivedAt)))).map(row => row.id),
  });
  res.status(result.status).json(result.body);
});

router.post("/v2/concierge/opportunity-feedback", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const repository = createPgOpportunityFeedbackRepository();
  const result = await mutateOpportunityFeedbackService(userId, req.body, {
    repository,
    ownsRecipient: async (ownerId, recipientId) => Boolean((await db.select({ id: recipientsTable.id }).from(recipientsTable).where(and(eq(recipientsTable.id, recipientId), eq(recipientsTable.userId, ownerId), isNull(recipientsTable.archivedAt))))[0]),
    resolveOpportunity: async (ownerId, recipientId, opportunityId) => {
      const rows = await db.select({ id: recipientsTable.id, firstName: recipientsTable.firstName, lastName: recipientsTable.lastName, nickname: recipientsTable.nickname }).from(recipientsTable).where(and(eq(recipientsTable.id, recipientId), eq(recipientsTable.userId, ownerId), isNull(recipientsTable.archivedAt)));
      if (!rows[0]) return null;
      const workspace = await buildConciergeWorkspace({ userId: ownerId, recipients: [{ recipientId, recipientName: formatRecipientName(rows[0]) }], runBrain: executeBrain, feedbackRepository: repository });
      return workspace.opportunities.find(item => item.id === opportunityId) ?? null;
    },
  });
  res.status(result.status).json(result.body);
});

export default router;
