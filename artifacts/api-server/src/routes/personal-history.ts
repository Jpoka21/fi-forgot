import { Router } from "express";
import { db, personalCardsTable, questionAnswersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
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

  const card = req.body as {
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

  const now = new Date();
  const statusStr = (card.status as string) ?? "draft";

  try {
    await db
      .insert(personalCardsTable)
      .values({
        id: card.id,
        userId,
        recipientId: (card.recipientId as string) ?? "",
        recipientName: (card.recipientName as string) ?? "",
        eventType: (card.holiday as string) ?? "",
        eventDate: (card.dueDate as string) ?? null,
        status: statusStr,
        messageFinal: (card.approvedMessage as string) ?? null,
        data: card,
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
          data: card,
          updatedAt: now,
        },
      });

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
    const rows = briefing.answers
      .filter(a => a.answer?.trim())
      .map(a => ({
        id: `${briefing.id}_${a.questionKey}`,
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
      }));

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
