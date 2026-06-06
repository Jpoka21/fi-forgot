import { Router } from "express";
import { db, usersTable, recipientsV2Table, recipientMemoryTable, recipientsTable, questionAnswersTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger";
import { assembleRecipientContext } from "../services/recipient-context";
import { getNextQuestion } from "../services/question-engine";

const router = Router();

function requireUserId(req: Parameters<Parameters<typeof router.get>[1]>[0], res: Parameters<Parameters<typeof router.get>[1]>[1]): string | null {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) { res.status(401).json({ error: "x-user-id header required" }); return null; }
  return userId;
}

// ── Check for duplicate name ──────────────────────────────────────────────────

router.post("/v2/recipients/check", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { firstName } = req.body as { firstName?: string };
  if (!firstName?.trim()) { res.status(400).json({ error: "firstName required" }); return; }

  const rows = await db
    .select()
    .from(recipientsV2Table)
    .where(and(
      eq(recipientsV2Table.userId, userId),
      ilike(recipientsV2Table.firstName, firstName.trim()),
    ));

  if (rows.length > 0) {
    res.json({ duplicate: true, existing: rows.map(r => ({ id: r.id, firstName: r.firstName, relationshipType: r.relationshipType })) });
  } else {
    res.json({ duplicate: false });
  }
});

// ── Create recipient ──────────────────────────────────────────────────────────

router.post("/v2/recipients", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { firstName, relationshipType, birthday } = req.body as {
    firstName?: string;
    relationshipType?: string;
    birthday?: string;
  };

  if (!firstName?.trim() || !relationshipType?.trim()) {
    res.status(400).json({ error: "firstName and relationshipType required" });
    return;
  }

  const id = randomUUID();
  const [created] = await db
    .insert(recipientsV2Table)
    .values({
      id,
      userId,
      firstName: firstName.trim(),
      relationshipType: relationshipType.trim(),
      birthday: birthday?.trim() || null,
    })
    .returning();

  logger.info({ id, userId, firstName: created.firstName }, "v2-recipients: created");
  res.json({ recipient: created });
});

// ── List recipients ───────────────────────────────────────────────────────────

router.get("/v2/recipients", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const rows = await db
    .select()
    .from(recipientsV2Table)
    .where(eq(recipientsV2Table.userId, userId))
    .orderBy(recipientsV2Table.createdAt);

  res.json({ recipients: rows });
});

// ── Get single recipient with memory ─────────────────────────────────────────

router.get("/v2/recipients/:id", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;

  const [recipient] = await db
    .select()
    .from(recipientsV2Table)
    .where(and(eq(recipientsV2Table.id, id), eq(recipientsV2Table.userId, userId)))
    .limit(1);

  if (!recipient) { res.status(404).json({ error: "Not found" }); return; }

  const [memory] = await db
    .select()
    .from(recipientMemoryTable)
    .where(eq(recipientMemoryTable.recipientId, id))
    .limit(1);

  res.json({ recipient, memory: memory ?? null });
});

// ── Update recipient memory ───────────────────────────────────────────────────

router.patch("/api/v2/recipients/:id/memory", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;
  const { category, data } = req.body as {
    category: "permanentFacts" | "relationshipDna" | "cardFuel" | "cardPreferences";
    data: Record<string, unknown>;
  };

  const [recipient] = await db
    .select({ id: recipientsV2Table.id })
    .from(recipientsV2Table)
    .where(and(eq(recipientsV2Table.id, id), eq(recipientsV2Table.userId, userId)))
    .limit(1);
  if (!recipient) { res.status(404).json({ error: "Not found" }); return; }

  const [existing] = await db
    .select()
    .from(recipientMemoryTable)
    .where(eq(recipientMemoryTable.recipientId, id))
    .limit(1);

  const colMap = {
    permanentFacts: { permanentFacts: data },
    relationshipDna: { relationshipDna: data },
    cardFuel: { cardFuel: data },
    cardPreferences: { cardPreferences: data },
  };

  if (existing) {
    await db
      .update(recipientMemoryTable)
      .set({ ...colMap[category], updatedAt: new Date() })
      .where(eq(recipientMemoryTable.recipientId, id));
  } else {
    await db.insert(recipientMemoryTable).values({
      id: randomUUID(),
      recipientId: id,
      ...colMap[category],
    });
  }

  res.json({ ok: true });
});

// ── Update recipient ──────────────────────────────────────────────────────────

router.patch("/api/v2/recipients/:id", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;
  const { firstName, birthday } = req.body as { firstName?: string; birthday?: string };

  await db
    .update(recipientsV2Table)
    .set({
      ...(firstName?.trim() && { firstName: firstName.trim() }),
      ...(birthday !== undefined && { birthday: birthday?.trim() || null }),
      updatedAt: new Date(),
    })
    .where(and(eq(recipientsV2Table.id, id), eq(recipientsV2Table.userId, userId)));

  res.json({ ok: true });
});

// ── Delete recipient ──────────────────────────────────────────────────────────

router.delete("/v2/recipients/:id", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;
  await db
    .delete(recipientsV2Table)
    .where(and(eq(recipientsV2Table.id, id), eq(recipientsV2Table.userId, userId)));

  res.json({ ok: true });
});

// ── Get next profile gap question ─────────────────────────────────────────────

router.get("/v2/recipients/:id/next-question", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;

  const [row] = await db
    .select({ id: recipientsTable.id })
    .from(recipientsTable)
    .where(and(eq(recipientsTable.id, id), eq(recipientsTable.userId, userId)))
    .limit(1);

  if (!row) { res.status(404).json({ error: "Recipient not found" }); return; }

  try {
    const context = await assembleRecipientContext(id, userId);
    const nextQuestion = getNextQuestion(context);

    logger.info({
      recipientId: id,
      profileScore: context.profileCompleteness.score,
      nextPriority: nextQuestion?.priority ?? null,
      nextFieldKey:  nextQuestion?.fieldKey  ?? null,
    }, "v2-recipients: next-question");

    res.json({ nextQuestion });
  } catch (err) {
    logger.error({ err, recipientId: id }, "v2-recipients: next-question failed");
    res.status(500).json({ error: "Failed to determine next question" });
  }
});

// ── Save a profile-gap answer ──────────────────────────────────────────────────

router.post("/v2/recipients/:id/answer-question", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;

  const { fieldKey, questionText, answerText } = req.body as {
    fieldKey?: string;
    questionText?: string;
    answerText?: string;
  };

  if (!fieldKey?.trim() || !questionText?.trim() || !answerText?.trim()) {
    res.status(400).json({ error: "fieldKey, questionText, and answerText required" });
    return;
  }

  const [row] = await db
    .select({ id: recipientsTable.id })
    .from(recipientsTable)
    .where(and(eq(recipientsTable.id, id), eq(recipientsTable.userId, userId)))
    .limit(1);

  if (!row) { res.status(404).json({ error: "Recipient not found" }); return; }

  try {
    const now = new Date();
    const answerId = `profile_gap_${id}_${fieldKey.trim()}`;

    await db
      .insert(questionAnswersTable)
      .values({
        id: answerId,
        userId,
        recipientId: id,
        eventType: "Profile",
        eventYear: now.getFullYear(),
        questionKey: fieldKey.trim(),
        questionText: questionText.trim(),
        answerText: answerText.trim(),
        wasSkipped: false,
        triggerType: "profile_gap",
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: questionAnswersTable.id,
        set: {
          answerText:   sql`excluded.answer_text`,
          questionText: sql`excluded.question_text`,
        },
      });

    logger.info({ recipientId: id, fieldKey: fieldKey.trim() }, "v2-recipients: answer-question saved");
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err, recipientId: id }, "v2-recipients: answer-question failed");
    res.status(500).json({ error: "Failed to save answer" });
  }
});

export default router;
