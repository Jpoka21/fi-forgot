import { Router } from "express";
import {recipientsTable,questionAnswersTable} from "@workspace/db/schema";
import {eq,and,desc,isNull} from "drizzle-orm";
import {logger} from "../lib/logger";
import {assembleRecipientContext} from "../services/recipient-context";
import {getNextQuestion,getNextFreshUpdateQuestion,type FreshUpdateRecord} from "../services/question-engine";
import {getDueFollowUpQuestion} from "../services/due-follow-up-questions";

/** Production selection preserves context materialization and overdue follow-up expiry. */
export function createRecipientQuestionRouter(db:typeof import("@workspace/db").db,services={assembleRecipientContext,getNextQuestion,getNextFreshUpdateQuestion,getDueFollowUpQuestion}) {
const router=Router();
const {assembleRecipientContext,getNextQuestion,getNextFreshUpdateQuestion,getDueFollowUpQuestion}=services;
function requireUserId(
  req: Parameters<Parameters<typeof router.get>[1]>[0],
  res: Parameters<Parameters<typeof router.get>[1]>[1],
): string | null {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) {
    res.status(401).json({ error: "x-user-id header required" });
    return null;
  }
  return userId;
}
router.get("/v2/recipients/:id/next-question", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;

  const [row] = await db
    .select({ id: recipientsTable.id })
    .from(recipientsTable)
    .where(and(eq(recipientsTable.id, id), eq(recipientsTable.userId, userId)))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Recipient not found" });
    return;
  }

  try {
    const context = await assembleRecipientContext(id, userId);
    const profileQuestion = getNextQuestion(context);
    const profileComplete = profileQuestion === null;

    let nextQuestion;
    if (!profileComplete) {
      nextQuestion = profileQuestion;
    } else {
      // Priority: follow-up questions (due) → fresh updates
      const dueFollowUp = await getDueFollowUpQuestion(userId, id);
      if (dueFollowUp) {
        nextQuestion = {
          fieldKey: "follow_up_answer",
          fieldLabel: "Follow Up",
          category: "update" as const,
          priority: "high" as const,
          question: dueFollowUp.question,
          reason: "You mentioned this previously. Any updates?",
          mode: "follow_up" as const,
          followUp: {
            id: dueFollowUp.id,
            originalAnswer: dueFollowUp.originalAnswer,
            category: dueFollowUp.category,
          },
        };
      } else {
        const freshUpdateHistory: FreshUpdateRecord[] =
          context.freshUpdates.map((u) => ({
            questionKey: u.questionKey,
            createdAt: new Date(u.createdAt),
          }));
        nextQuestion = getNextFreshUpdateQuestion(context, freshUpdateHistory);
      }
    }

    logger.info(
      {
        recipientId: id,
        profileScore: context.profileCompleteness.score,
        profileComplete,
        nextMode: nextQuestion?.mode ?? null,
        nextPriority: nextQuestion?.priority ?? null,
        nextFieldKey: nextQuestion?.fieldKey ?? null,
      },
      "v2-recipients: next-question",
    );

    res.json({
      nextQuestion,
      profileComplete,
      profileScore: context.profileCompleteness.score,
    });
  } catch (err) {
    logger.error(
      { err, recipientId: id },
      "v2-recipients: next-question failed",
    );
    res.status(500).json({ error: "Failed to determine next question" });
  }
});
router.get("/v2/recipients/:id/fresh-updates", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { id } = req.params;

  const [row] = await db
    .select({ id: recipientsTable.id })
    .from(recipientsTable)
    .where(and(eq(recipientsTable.id, id), eq(recipientsTable.userId, userId)))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Recipient not found" });
    return;
  }

  // All answered fresh updates, newest first
  const answered = await db
    .select()
    .from(questionAnswersTable)
    .where(
      and(
        eq(questionAnswersTable.recipientId, id),
        eq(questionAnswersTable.userId, userId),
        eq(questionAnswersTable.triggerType, "fresh_update"),
        eq(questionAnswersTable.wasSkipped, false),
        isNull(questionAnswersTable.archivedAt),
      ),
    )
    .orderBy(desc(questionAnswersTable.createdAt));

  // Skipped fresh updates — for skip stats tracking only
  const skippedRows = await db
    .select({ questionKey: questionAnswersTable.questionKey })
    .from(questionAnswersTable)
    .where(
      and(
        eq(questionAnswersTable.recipientId, id),
        eq(questionAnswersTable.userId, userId),
        eq(questionAnswersTable.triggerType, "fresh_update"),
        eq(questionAnswersTable.wasSkipped, true),
        isNull(questionAnswersTable.archivedAt),
      ),
    );

  const now = Date.now();

  // Initialise skip stats for all known bank keys
  const FRESH_UPDATE_FIELD_KEYS = [
    "recent_memory",
    "current_excitement",
    "current_challenge",
    "recent_accomplishment",
    "family_news",
    "new_hobby",
    "anything_to_remember",
  ] as const;

  const skipStats: Record<
    string,
    { timesAnswered: number; timesSkipped: number; timesAsked: number }
  > = {};
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

  const freshUpdates = answered.map((r) => {
    const daysAgo = Math.floor(
      (now - new Date(r.createdAt).getTime()) / 86400000,
    );
    const ageCategory: "recent" | "mid" | "older" =
      daysAgo < 90 ? "recent" : daysAgo < 180 ? "mid" : "older";
    return {
      id: r.id,
      questionKey: r.questionKey,
      questionText: r.questionText,
      answerText: r.answerText,
      importanceScore: r.importanceScore ?? null,
      createdAt: r.createdAt,
      daysAgo,
      ageCategory,
    };
  });

  res.json({ freshUpdates, skipStats });
});
return router;
}
