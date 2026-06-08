import { Router } from "express";
import { db, usersTable, recipientsV2Table, recipientMemoryTable, recipientsTable, questionAnswersTable, personalCardsTable } from "@workspace/db";
import { eq, and, ilike, sql, desc, isNull, ne } from "drizzle-orm";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger";
import { assembleRecipientContext } from "../services/recipient-context";
import { getNextQuestion, getNextFreshUpdateQuestion } from "../services/question-engine";
import type { FreshUpdateRecord } from "../services/question-engine";

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
    const profileQuestion = getNextQuestion(context);
    const profileComplete = profileQuestion === null;

    let nextQuestion;
    if (!profileComplete) {
      nextQuestion = profileQuestion;
    } else {
      const freshUpdateHistory: FreshUpdateRecord[] = context.freshUpdates.map(u => ({
        questionKey: u.questionKey,
        createdAt:   new Date(u.createdAt),
      }));
      nextQuestion = getNextFreshUpdateQuestion(context, freshUpdateHistory);
    }

    logger.info({
      recipientId: id,
      profileScore:    context.profileCompleteness.score,
      profileComplete,
      nextMode:        nextQuestion?.mode     ?? null,
      nextPriority:    nextQuestion?.priority ?? null,
      nextFieldKey:    nextQuestion?.fieldKey  ?? null,
    }, "v2-recipients: next-question");

    res.json({ nextQuestion, profileComplete, profileScore: context.profileCompleteness.score });
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

  const { fieldKey, questionText, answerText, triggerType } = req.body as {
    fieldKey?:    string;
    questionText?: string;
    answerText?:  string;
    triggerType?: string;
  };

  if (!fieldKey?.trim() || !questionText?.trim() || !answerText?.trim()) {
    res.status(400).json({ error: "fieldKey, questionText, and answerText required" });
    return;
  }

  const isFreshUpdate = triggerType === "fresh_update";

  const [row] = await db
    .select({ id: recipientsTable.id })
    .from(recipientsTable)
    .where(and(eq(recipientsTable.id, id), eq(recipientsTable.userId, userId)))
    .limit(1);

  if (!row) { res.status(404).json({ error: "Recipient not found" }); return; }

  try {
    const now = new Date();

    if (isFreshUpdate) {
      // Fresh updates are always new dated entries — never upserted.
      // Each answer is an independent memory with its own timestamp.
      const answerId = `fresh_update_${id}_${fieldKey.trim()}_${now.getTime()}`;
      await db
        .insert(questionAnswersTable)
        .values({
          id: answerId,
          userId,
          recipientId: id,
          eventType:    "FreshUpdate",
          eventYear:    now.getFullYear(),
          questionKey:  fieldKey.trim(),
          questionText: questionText.trim(),
          answerText:   answerText.trim(),
          wasSkipped:   false,
          triggerType:  "fresh_update",
          createdAt:    now,
        });

      logger.info({ recipientId: id, fieldKey: fieldKey.trim() }, "v2-recipients: fresh-update saved");
    } else {
      // Profile-gap answers upsert — one canonical answer per field.
      const answerId = `profile_gap_${id}_${fieldKey.trim()}`;
      await db
        .insert(questionAnswersTable)
        .values({
          id: answerId,
          userId,
          recipientId: id,
          eventType:    "Profile",
          eventYear:    now.getFullYear(),
          questionKey:  fieldKey.trim(),
          questionText: questionText.trim(),
          answerText:   answerText.trim(),
          wasSkipped:   false,
          triggerType:  "profile_gap",
          createdAt:    now,
        })
        .onConflictDoUpdate({
          target: questionAnswersTable.id,
          set: {
            answerText:   sql`excluded.answer_text`,
            questionText: sql`excluded.question_text`,
          },
        });

      logger.info({ recipientId: id, fieldKey: fieldKey.trim() }, "v2-recipients: profile-gap saved");
    }

    res.json({ ok: true });
  } catch (err) {
    logger.error({ err, recipientId: id }, "v2-recipients: answer-question failed");
    res.status(500).json({ error: "Failed to save answer" });
  }
});

// ── Relationship Timeline ─────────────────────────────────────────────────────
// Aggregates all 5 knowledge sources for a recipient, sorted newest-first.

const QUESTION_KEY_LABELS: Record<string, string> = {
  things_to_avoid:      "Things to avoid",
  interests:            "Interests",
  favorite_memories:    "Favorite memories",
  inside_jokes:         "Inside jokes",
  personality_notes:    "Personality notes",
  personality_traits:   "Personality traits",
  preferred_tone:       "Preferred tone",
  emotional_openness:   "Emotional openness",
  always_include:       "Always include",
  birthday:             "Birthday",
  anniversary:          "Anniversary",
  delivery_preference:  "Delivery preference",
  briefing_answers:     "General notes",
  recent_memory:        "Recent memory",
  current_excitement:   "Current excitement",
  current_challenge:    "Current challenge",
  recent_accomplishment:"Recent accomplishment",
  family_news:          "Family & home life",
  new_hobby:            "New hobby or interest",
  anything_to_remember: "Anything to remember",
};

type TimelineItemType = "profile_gap" | "fresh_update" | "event_briefing" | "card" | "important_date";

interface TimelineItem {
  id:         string;
  date:       string;
  type:       TimelineItemType;
  label:      string;
  summary:    string;
  source:     string;
  canArchive: boolean;
  isArchived: boolean;
}

router.get("/v2/recipients/:id/timeline", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;

  const [row] = await db
    .select({ id: recipientsTable.id, birthday: recipientsTable.birthday, anniversary: recipientsTable.anniversary })
    .from(recipientsTable)
    .where(and(eq(recipientsTable.id, id), eq(recipientsTable.userId, userId)))
    .limit(1);

  if (!row) { res.status(404).json({ error: "Recipient not found" }); return; }

  const [answers, cards] = await Promise.all([
    db
      .select()
      .from(questionAnswersTable)
      .where(and(
        eq(questionAnswersTable.recipientId, id),
        eq(questionAnswersTable.userId, userId),
        eq(questionAnswersTable.wasSkipped, false),
      ))
      .orderBy(desc(questionAnswersTable.createdAt)),
    db
      .select()
      .from(personalCardsTable)
      .where(and(
        eq(personalCardsTable.recipientId, id),
        eq(personalCardsTable.userId, userId),
        ne(personalCardsTable.status, "draft"),
      ))
      .orderBy(desc(personalCardsTable.createdAt)),
  ]);

  const items: TimelineItem[] = [];

  // Group event_briefing by (eventType, eventYear); individual for all others
  const briefingGroups = new Map<string, typeof answers>();

  for (const answer of answers) {
    if (answer.triggerType === "event_briefing") {
      // Skip archived briefing answers from groups (groups can't be archived via UI)
      if (answer.archivedAt !== null) continue;
      const key = `${answer.eventType}_${answer.eventYear}`;
      if (!briefingGroups.has(key)) briefingGroups.set(key, []);
      briefingGroups.get(key)!.push(answer);
    } else {
      const type: TimelineItemType = answer.triggerType === "fresh_update" ? "fresh_update" : "profile_gap";
      items.push({
        id:         answer.id,
        date:       answer.createdAt.toISOString(),
        type,
        label:      QUESTION_KEY_LABELS[answer.questionKey] ?? answer.questionKey,
        summary:    answer.answerText,
        source:     type === "fresh_update" ? "Fresh update" : "Profile",
        canArchive: true,
        isArchived: answer.archivedAt !== null,
      });
    }
  }

  for (const [groupKey, group] of briefingGroups) {
    const first      = group[0]!;
    const latestDate = group.reduce((max, r) => r.createdAt > max ? r.createdAt : max, group[0]!.createdAt);
    const snippet    = first.answerText.slice(0, 60) + (first.answerText.length > 60 ? "…" : "");
    const summary    = group.length === 1 ? first.answerText : `${group.length} answers — "${snippet}"`;
    items.push({
      id:         `briefing_${id}_${groupKey}`,
      date:       latestDate.toISOString(),
      type:       "event_briefing",
      label:      `${first.eventType} ${first.eventYear}`,
      summary,
      source:     `${first.eventType} ${first.eventYear} briefing`,
      canArchive: false,
      isArchived: false,
    });
  }

  // Cards (non-draft)
  for (const card of cards) {
    const message   = card.messageFinal ?? card.messageOriginal ?? "";
    const eventDate = card.mailedAt ?? card.approvedAt ?? card.createdAt;
    items.push({
      id:         `card_${card.id}`,
      date:       eventDate.toISOString(),
      type:       "card",
      label:      `${card.eventType} card`,
      summary:    message.length > 0 ? message.slice(0, 120) + (message.length > 120 ? "…" : "") : "",
      source:     card.status === "mailed" ? "Card mailed" : "Card generated",
      canArchive: false,
      isArchived: false,
    });
  }

  // Important dates from recipient profile
  if (row.birthday) {
    items.push({ id: `birthday_${id}`,    date: row.birthday,    type: "important_date", label: "Birthday",    summary: row.birthday,    source: "Profile", canArchive: false, isArchived: false });
  }
  if (row.anniversary) {
    items.push({ id: `anniversary_${id}`, date: row.anniversary, type: "important_date", label: "Anniversary", summary: row.anniversary, source: "Profile", canArchive: false, isArchived: false });
  }

  // Sort newest first
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({ items });
});

// ── Archive a timeline answer ─────────────────────────────────────────────────

router.patch("/v2/recipients/:id/answers/:answerId/archive", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id, answerId } = req.params;

  await db
    .update(questionAnswersTable)
    .set({ archivedAt: new Date() })
    .where(and(
      eq(questionAnswersTable.id, answerId),
      eq(questionAnswersTable.userId, userId),
      eq(questionAnswersTable.recipientId, id),
      isNull(questionAnswersTable.archivedAt),
    ));

  res.json({ ok: true });
});

// ── Restore an archived timeline answer ───────────────────────────────────────
// No UI yet — foundation for future restore capability.

router.patch("/v2/recipients/:id/answers/:answerId/restore", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id, answerId } = req.params;

  await db
    .update(questionAnswersTable)
    .set({ archivedAt: null })
    .where(and(
      eq(questionAnswersTable.id, answerId),
      eq(questionAnswersTable.userId, userId),
      eq(questionAnswersTable.recipientId, id),
    ));

  res.json({ ok: true });
});

// ── Get all fresh updates for a recipient ─────────────────────────────────────
// Returns answered fresh updates (newest first) + per-category skip stats.

router.get("/v2/recipients/:id/fresh-updates", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;

  const [row] = await db
    .select({ id: recipientsTable.id })
    .from(recipientsTable)
    .where(and(eq(recipientsTable.id, id), eq(recipientsTable.userId, userId)))
    .limit(1);

  if (!row) { res.status(404).json({ error: "Recipient not found" }); return; }

  // All answered fresh updates, newest first
  const answered = await db
    .select()
    .from(questionAnswersTable)
    .where(and(
      eq(questionAnswersTable.recipientId, id),
      eq(questionAnswersTable.triggerType, "fresh_update"),
      eq(questionAnswersTable.wasSkipped, false),
    ))
    .orderBy(desc(questionAnswersTable.createdAt));

  // Skipped fresh updates — for skip stats tracking only
  const skippedRows = await db
    .select({ questionKey: questionAnswersTable.questionKey })
    .from(questionAnswersTable)
    .where(and(
      eq(questionAnswersTable.recipientId, id),
      eq(questionAnswersTable.triggerType, "fresh_update"),
      eq(questionAnswersTable.wasSkipped, true),
    ));

  const now = Date.now();

  // Initialise skip stats for all known bank keys
  const FRESH_UPDATE_FIELD_KEYS = [
    "recent_memory", "current_excitement", "current_challenge",
    "recent_accomplishment", "family_news", "new_hobby", "anything_to_remember",
  ] as const;

  const skipStats: Record<string, { timesAnswered: number; timesSkipped: number; timesAsked: number }> = {};
  for (const key of FRESH_UPDATE_FIELD_KEYS) {
    skipStats[key] = { timesAnswered: 0, timesSkipped: 0, timesAsked: 0 };
  }
  for (const r of answered) {
    if (skipStats[r.questionKey]) {
      skipStats[r.questionKey]!.timesAnswered++;
      skipStats[r.questionKey]!.timesAsked++;
    }
  }
  for (const r of skippedRows) {
    if (skipStats[r.questionKey]) {
      skipStats[r.questionKey]!.timesSkipped++;
      skipStats[r.questionKey]!.timesAsked++;
    }
  }

  const freshUpdates = answered.map(r => {
    const daysAgo = Math.floor((now - new Date(r.createdAt).getTime()) / 86400000);
    const ageCategory: "recent" | "mid" | "older" = daysAgo < 90 ? "recent" : daysAgo < 180 ? "mid" : "older";
    return {
      id:              r.id,
      questionKey:     r.questionKey,
      questionText:    r.questionText,
      answerText:      r.answerText,
      importanceScore: r.importanceScore ?? null,
      createdAt:       r.createdAt,
      daysAgo,
      ageCategory,
    };
  });

  res.json({ freshUpdates, skipStats });
});

export default router;
