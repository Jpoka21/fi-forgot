import { Router } from "express";
import { db, personalCardsTable, questionAnswersTable, recipientsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { assertValidBrainSourceRuleIdForCardProvenance } from "../brain/cards/validateBrainSourceRuleId";
import { buildOpportunityKey } from "../brain/attention/buildOpportunityKey";
import { assertValidBrainOutcomeOpportunityIdentity } from "../brain/outcomes/outcomeTypes";
import { recordCardBrainOutcomesForProduction } from "../brain/outcomes/producers/recordCardBrainOutcomesForProduction";
import { logger } from "../lib/logger";

const router = Router();

function requireUserId(req: import("express").Request, res: import("express").Response): string | null {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) {
    res.status(401).json({ error: "x-user-id required" });
    return null;
  }
  return userId;
}

function cardPayloadFromBody(body: Record<string, unknown>): Record<string, unknown> {
  const { brainSourceRuleId: _brainSourceRuleId, ...card } = body;
  return card;
}

// ── Cards ─────────────────────────────────────────────────────────────────────

router.get("/personal/cards", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const rows = await db
      .select()
      .from(personalCardsTable)
      .where(eq(personalCardsTable.userId, userId))
      .orderBy(personalCardsTable.createdAt);

    res.json({ cards: rows.map(r => r.data) });
  } catch (err) {
    logger.error({ err }, "personal/cards GET failed");
    res.status(500).json({ error: "Failed to load cards" });
  }
});

router.post("/personal/cards", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const body = req.body as Record<string, unknown>;
  const brainSourceRuleIdInput =
    typeof body.brainSourceRuleId === "string" ? body.brainSourceRuleId.trim() : undefined;
  const card = cardPayloadFromBody(body) as {
    id: string;
    recipientId?: string;
    recipientName?: string;
    holiday?: string;
    dueDate?: string;
    status?: string;
    approvedMessage?: string;
    deliveryPreference?: string;
    [key: string]: unknown;
  };

  if (!card?.id) {
    res.status(400).json({ error: "card.id required" });
    return;
  }

  const recipientId = (card.recipientId as string) ?? "";
  const now = new Date();
  const statusStr = (card.status as string) ?? "draft";

  try {
    const [existingRow] = await db
      .select({
        id: personalCardsTable.id,
        status: personalCardsTable.status,
        brainSourceRuleId: personalCardsTable.brainSourceRuleId,
      })
      .from(personalCardsTable)
      .where(and(eq(personalCardsTable.id, card.id), eq(personalCardsTable.userId, userId)))
      .limit(1);

    const isInsert = !existingRow;
    let brainSourceRuleIdForInsert: string | null = null;

    if (isInsert && brainSourceRuleIdInput) {
      try {
        assertValidBrainSourceRuleIdForCardProvenance(brainSourceRuleIdInput);
      } catch (validationError) {
        res.status(400).json({
          error: validationError instanceof Error ? validationError.message : "Invalid brainSourceRuleId",
        });
        return;
      }

      if (!recipientId) {
        res.status(400).json({ error: "recipientId required when brainSourceRuleId is provided" });
        return;
      }

      const [recipientRow] = await db
        .select({ id: recipientsTable.id })
        .from(recipientsTable)
        .where(and(eq(recipientsTable.id, recipientId), eq(recipientsTable.userId, userId)))
        .limit(1);

      if (!recipientRow) {
        res.status(404).json({ error: "Recipient not found" });
        return;
      }

      const opportunityKey = buildOpportunityKey(recipientId, brainSourceRuleIdInput);
      assertValidBrainOutcomeOpportunityIdentity({ opportunityKey, recipientId });
      brainSourceRuleIdForInsert = brainSourceRuleIdInput;
    }

    const cardForStorage = cardPayloadFromBody(body);

    await db
      .insert(personalCardsTable)
      .values({
        id: card.id,
        userId,
        recipientId,
        recipientName: (card.recipientName as string) ?? "",
        eventType: (card.holiday as string) ?? "",
        eventDate: (card.dueDate as string) ?? null,
        status: statusStr,
        messageFinal: (card.approvedMessage as string) ?? null,
        brainSourceRuleId: brainSourceRuleIdForInsert,
        data: cardForStorage,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: personalCardsTable.id,
        set: {
          status: statusStr,
          messageFinal: (card.approvedMessage as string) ?? null,
          approvedAt: statusStr === "Approved" ? now : undefined,
          rejectedAt: statusStr === "Rejected" ? now : undefined,
          mailedAt: statusStr === "Mailed to me" || statusStr === "Mailed to her" ? now : undefined,
          data: cardForStorage,
          updatedAt: now,
        },
      });

    const [persistedRow] = await db
      .select({
        id: personalCardsTable.id,
        userId: personalCardsTable.userId,
        recipientId: personalCardsTable.recipientId,
        status: personalCardsTable.status,
        brainSourceRuleId: personalCardsTable.brainSourceRuleId,
      })
      .from(personalCardsTable)
      .where(and(eq(personalCardsTable.id, card.id), eq(personalCardsTable.userId, userId)))
      .limit(1);

    if (persistedRow) {
      try {
        const brainOutcomeResult = await recordCardBrainOutcomesForProduction({
          persistedCard: {
            id: persistedRow.id,
            userId: persistedRow.userId,
            recipientId: persistedRow.recipientId,
            status: persistedRow.status,
            brainSourceRuleId: persistedRow.brainSourceRuleId,
            occurredAt: now,
          },
          authenticatedUserId: userId,
          isInsert,
          previousStatus: existingRow?.status ?? null,
        });

        for (const result of brainOutcomeResult.results) {
          if (result.status === "recorded_projection_failed") {
            logger.error(
              {
                cardId: persistedRow.id,
                outcomeType: result.outcomeType,
                outcomeEventId: result.outcomeEventId,
                err: result.projectionError,
              },
              "personal/cards: brain card outcome projection failed after card saved",
            );
          }
        }
      } catch (err) {
        logger.error(
          { err, cardId: persistedRow.id },
          "personal/cards: brain card outcome append failed after card saved",
        );
      }
    }

    res.json({ ok: true });
  } catch (err) {
    logger.error({ err, cardId: card.id }, "personal/cards POST failed");
    res.status(500).json({ error: "Failed to save card" });
  }
});

router.delete("/personal/cards/:id", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;
  const { id } = req.params;
  try {
    await db
      .delete(personalCardsTable)
      .where(and(eq(personalCardsTable.id, id), eq(personalCardsTable.userId, userId)));
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err, id }, "personal/cards DELETE failed");
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// ── Briefings ────────────────────────────────────────────────────────────────

router.get("/personal/briefings", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const recipientId = req.query.recipientId as string | undefined;

  try {
    const rows = await db
      .select()
      .from(questionAnswersTable)
      .where(
        recipientId
          ? and(
              eq(questionAnswersTable.userId, userId),
              eq(questionAnswersTable.recipientId, recipientId),
            )
          : eq(questionAnswersTable.userId, userId),
      )
      .orderBy(questionAnswersTable.createdAt);

    res.json({ answers: rows });
  } catch (err) {
    logger.error({ err }, "personal/briefings GET failed");
    res.status(500).json({ error: "Failed to load briefings" });
  }
});

router.post("/personal/briefings", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const briefing = req.body as {
    id: string;
    recipientId: string;
    event: string;
    year: number;
    answers: { questionKey: string; question: string; answer: string }[];
  };

  if (!briefing?.id || !briefing.recipientId || !briefing.answers) {
    res.status(400).json({ error: "id, recipientId, and answers required" });
    return;
  }

  try {
    const now = new Date();
    // A briefing can contain several answers that share a questionKey (e.g. multiple
    // "dad_moment" notes). The previous code derived each row id solely from the
    // questionKey, so those collided into a single id and Postgres rejected the whole
    // batch ("ON CONFLICT DO UPDATE command cannot affect row a second time"),
    // silently dropping every answer in the briefing. We now:
    //   1. skip exact-duplicate answers to the same question, and
    //   2. give each remaining distinct answer a unique, stable id — the first
    //      occurrence keeps the original `${id}_${questionKey}` id for backward
    //      compatibility, and subsequent ones get a `_${n}` suffix.
    const seen = new Set<string>();
    const occurrences = new Map<string, number>();
    const rows: (typeof questionAnswersTable.$inferInsert)[] = [];
    for (const a of briefing.answers) {
      if (!a.answer?.trim()) continue;
      const dedupeKey = `${a.questionKey}|${a.answer.trim()}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      const n = occurrences.get(a.questionKey) ?? 0;
      occurrences.set(a.questionKey, n + 1);
      const id = n === 0
        ? `${briefing.id}_${a.questionKey}`
        : `${briefing.id}_${a.questionKey}_${n}`;
      rows.push({
        id,
        userId,
        recipientId: briefing.recipientId,
        eventType: briefing.event,
        eventYear: briefing.year,
        questionKey: a.questionKey,
        questionText: a.question,
        answerText: a.answer,
        wasSkipped: false,
        triggerType: "event_briefing" as const,
        createdAt: now,
      });
    }

    if (rows.length > 0) {
      await db
        .insert(questionAnswersTable)
        .values(rows)
        .onConflictDoUpdate({
          target: questionAnswersTable.id,
          set: {
            answerText: sql`excluded.answer_text`,
            questionText: sql`excluded.question_text`,
          },
        });
    }

    res.json({ ok: true, saved: rows.length });
  } catch (err) {
    logger.error({ err, briefingId: briefing.id }, "personal/briefings POST failed");
    res.status(500).json({ error: "Failed to save briefing" });
  }
});

export default router;
