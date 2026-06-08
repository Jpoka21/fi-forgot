/**
 * Follow-Up Questions Service
 *
 * When a user saves a Fresh Update, we classify it into a category, then
 * schedule a follow-up question to appear after a delay (60–120 days).
 *
 * Priority in question engine:
 *   1. Profile gap questions
 *   2. Due follow-up questions (THIS SERVICE)
 *   3. Fresh updates
 *
 * Answer flow: follow-up answer → stored as fresh_update + follow-up marked answered
 */

import { db, followUpQuestionsTable } from "@workspace/db";
import { eq, and, lte, lt, or } from "drizzle-orm";
import { randomUUID } from "crypto";
import { openai, hasAI } from "../lib/openai";
import { logger } from "../lib/logger";
import type { FollowUpCategory } from "@workspace/db";

// ─── Timing by category (days) ────────────────────────────────────────────────

const CATEGORY_DELAY_DAYS: Record<FollowUpCategory, number> = {
  NEW_HOBBY:     60,
  ACCOMPLISHMENT: 90,
  CAREER:         90,
  CHALLENGE:      60,
  FAMILY:        120,
  HOME_LIFE:     120,
  GENERAL:        90,
};

const EXPIRY_DAYS = 180;

// ─── Classification + question generation ─────────────────────────────────────

interface ClassifyResult {
  category: FollowUpCategory;
  question: string;
}

async function classifyAndGenerate(
  answerText: string,
  recipientName: string,
): Promise<ClassifyResult> {
  const fallback: ClassifyResult = {
    category: "GENERAL",
    question: `Any updates since the last time you mentioned this?`,
  };

  if (!hasAI) return fallback;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 120,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a relationship memory assistant for FiForgot. Your job is to classify a life update and write a natural follow-up question.

Categories: NEW_HOBBY, ACCOMPLISHMENT, CAREER, CHALLENGE, FAMILY, HOME_LIFE, GENERAL

Rules for the follow-up question:
- It should feel like a caring friend who remembers what was shared
- Keep it under 20 words
- Reference the specific situation from the update when possible
- Do not start with "Did"

Respond with JSON only: { "category": "...", "question": "..." }`,
        },
        {
          role: "user",
          content: `Recipient name: ${recipientName}\nUpdate shared: "${answerText}"`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { category?: string; question?: string };

    const validCategories: FollowUpCategory[] = [
      "NEW_HOBBY", "ACCOMPLISHMENT", "CAREER", "CHALLENGE", "FAMILY", "HOME_LIFE", "GENERAL",
    ];

    const category = validCategories.includes(parsed.category as FollowUpCategory)
      ? (parsed.category as FollowUpCategory)
      : "GENERAL";

    const question = (typeof parsed.question === "string" && parsed.question.trim().length > 3)
      ? parsed.question.trim()
      : fallback.question;

    return { category, question };
  } catch (err) {
    logger.warn({ err }, "follow-up: classify failed, using fallback");
    return fallback;
  }
}

// ─── Schedule a follow-up ─────────────────────────────────────────────────────

/**
 * Fire-and-forget: classify a fresh update and create a follow-up question
 * record scheduled to appear after the appropriate delay.
 * Call this after saving a fresh update — non-fatal on any error.
 */
export async function scheduleFollowUp(
  userId: string,
  recipientId: string,
  sourceAnswerId: string,
  answerText: string,
  recipientName: string,
): Promise<void> {
  try {
    const { category, question } = await classifyAndGenerate(answerText, recipientName);
    const delayDays = CATEGORY_DELAY_DAYS[category];

    const triggerDate = new Date();
    triggerDate.setDate(triggerDate.getDate() + delayDays);

    await db.insert(followUpQuestionsTable).values({
      id:             randomUUID(),
      userId,
      recipientId,
      sourceAnswerId,
      category,
      triggerDate,
      question,
      originalAnswer: answerText,
      status:         "pending",
    });

    logger.info({ userId, recipientId, category, delayDays }, "follow-up: scheduled");
  } catch (err) {
    logger.warn({ err, userId, recipientId }, "follow-up: schedule failed (non-fatal)");
  }
}

// ─── Retrieve a due follow-up ─────────────────────────────────────────────────

export interface DueFollowUp {
  id:             string;
  category:       FollowUpCategory;
  question:       string;
  originalAnswer: string;
}

/**
 * Returns the oldest pending follow-up question that is due for this recipient.
 * Also expires overdue questions as a side effect (non-fatal).
 * Returns null if nothing is due.
 */
export async function getDueFollowUpQuestion(
  userId: string,
  recipientId: string,
): Promise<DueFollowUp | null> {
  const now = new Date();

  // Expire overdue records (180 days past triggerDate) — best effort
  const expiryThreshold = new Date();
  expiryThreshold.setDate(expiryThreshold.getDate() - EXPIRY_DAYS);
  try {
    await db
      .update(followUpQuestionsTable)
      .set({ status: "expired" })
      .where(and(
        eq(followUpQuestionsTable.userId, userId),
        eq(followUpQuestionsTable.recipientId, recipientId),
        eq(followUpQuestionsTable.status, "pending"),
        lt(followUpQuestionsTable.triggerDate, expiryThreshold),
      ));
  } catch { /* non-fatal */ }

  // Fetch the oldest due pending follow-up
  const rows = await db
    .select()
    .from(followUpQuestionsTable)
    .where(and(
      eq(followUpQuestionsTable.userId, userId),
      eq(followUpQuestionsTable.recipientId, recipientId),
      eq(followUpQuestionsTable.status, "pending"),
      lte(followUpQuestionsTable.triggerDate, now),
    ))
    .orderBy(followUpQuestionsTable.triggerDate)
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    id:             row.id,
    category:       row.category,
    question:       row.question,
    originalAnswer: row.originalAnswer,
  };
}

// ─── Mark answered ────────────────────────────────────────────────────────────

export async function markFollowUpAnswered(followUpId: string): Promise<void> {
  await db
    .update(followUpQuestionsTable)
    .set({ status: "answered", answeredAt: new Date() })
    .where(and(
      eq(followUpQuestionsTable.id, followUpId),
      or(
        eq(followUpQuestionsTable.status, "pending"),
        eq(followUpQuestionsTable.status, "answered"),
      ),
    ));
}
