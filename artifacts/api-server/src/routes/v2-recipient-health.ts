/**
 * Recipient Health Scores
 *
 * GET /api/v2/recipient-health
 *
 * Returns a health score (0–100) for every active recipient belonging to the
 * user, computed from five dimensions:
 *
 *   Profile completeness   0–30 pts
 *   Fresh update recency   0–30 pts
 *   Follow-up status       0–20 pts
 *   Event readiness        0–10 pts
 *   Card activity          0–10 pts
 */

import { Router } from "express";
import {
  db,
  recipientsTable,
  recipientMemoryTable,
  questionAnswersTable,
  followUpQuestionsTable,
  personalCardsTable,
} from "@workspace/db";
import { eq, and, desc, isNull, ne, inArray, lte } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysUntilNextOccurrence(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  let month: number, day: number;
  if (parts.length === 3) {
    month = parseInt(parts[1]!, 10) - 1;
    day   = parseInt(parts[2]!, 10);
  } else if (parts.length === 2) {
    month = parseInt(parts[0]!, 10) - 1;
    day   = parseInt(parts[1]!, 10);
  } else {
    return null;
  }
  if (isNaN(month) || isNaN(day)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yr  = today.getFullYear();
  let next  = new Date(yr, month, day);
  if (next < today) next = new Date(yr + 1, month, day);
  return Math.ceil((next.getTime() - today.getTime()) / 86400000);
}

function recommendedAction(
  profilePct: number,
  lastUpdateDays: number | null,
  hasPendingFollowUp: boolean,
  hasOverdueFollowUp: boolean,
  nextEventDays: number | null,
  nextEventLabel: string | null,
  hasRecentCard: boolean,
): { label: string; type: "profile" | "follow_up" | "fresh_update" | "card" | "review" } {
  if (profilePct < 50)
    return { label: "Fill in the basics so we can write good cards.", type: "profile" };
  if (hasOverdueFollowUp)
    return { label: "You mentioned something earlier — any update?", type: "follow_up" };
  if (nextEventDays !== null && nextEventDays <= 30) {
    const ev = nextEventLabel ?? "Upcoming event";
    const hasUpdate = lastUpdateDays !== null && lastUpdateDays <= 90;
    return { label: hasUpdate ? `${ev} card is ready to draft.` : `${ev} coming up — add one recent memory first.`, type: "card" };
  }
  if (lastUpdateDays === null || lastUpdateDays > 90)
    return { label: "It's been a while — share what's new.", type: "fresh_update" };
  if (hasPendingFollowUp)
    return { label: "You mentioned something earlier — any update?", type: "follow_up" };
  if (nextEventDays !== null && nextEventDays <= 60) {
    const ev = nextEventLabel ?? "Upcoming event";
    const hasUpdate = lastUpdateDays !== null && lastUpdateDays <= 90;
    return { label: hasUpdate ? `${ev} card is ready to draft.` : `${ev} coming up — add one recent memory first.`, type: "card" };
  }
  if (!hasRecentCard)
    return { label: "Everything looks good — review recent activity.", type: "review" };
  return { label: "Everything looks good — review recent activity.", type: "review" };
}

export interface RecipientHealthScore {
  recipientId:        string;
  name:               string;
  relationshipType:   string;
  score:              number;
  status:             "Excellent" | "Healthy" | "NeedsAttention" | "Priority";
  profileScore:       number;
  freshUpdateScore:   number;
  followUpScore:      number;
  eventScore:         number;
  cardScore:          number;
  profilePct:         number;
  lastUpdateDaysAgo:  number | null;
  nextEventLabel:     string | null;
  nextEventDaysAway:  number | null;
  pendingFollowUps:   number;
  recommendedAction:  string;
  actionType:         "profile" | "follow_up" | "fresh_update" | "card" | "review";
}

// ─── Route ────────────────────────────────────────────────────────────────────

function requireUserId(
  req: Parameters<Parameters<typeof router.get>[1]>[0],
  res: Parameters<Parameters<typeof router.get>[1]>[1],
): string | null {
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) { res.status(401).json({ error: "x-user-id header required" }); return null; }
  return userId;
}

router.get("/v2/recipient-health", async (req, res) => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    // 1. Load all active recipients
    const recipients = await db
      .select()
      .from(recipientsTable)
      .where(and(
        eq(recipientsTable.userId, userId),
        isNull(recipientsTable.archivedAt),
      ));

    if (recipients.length === 0) {
      res.json({ scores: [] });
      return;
    }

    const recipientIds = recipients.map(r => r.id);

    // 2. Bulk-load supporting data (all in parallel)
    const [memories, freshUpdates, followUps, recentCards] = await Promise.all([
      // Profile completeness
      db.select({ recipientId: recipientMemoryTable.recipientId, completeness: recipientMemoryTable.profileCompleteness })
        .from(recipientMemoryTable)
        .where(inArray(recipientMemoryTable.recipientId, recipientIds)),

      // Most recent fresh_update per recipient
      db.select({
          recipientId: questionAnswersTable.recipientId,
          createdAt:   questionAnswersTable.createdAt,
        })
        .from(questionAnswersTable)
        .where(and(
          eq(questionAnswersTable.userId, userId),
          inArray(questionAnswersTable.recipientId, recipientIds),
          eq(questionAnswersTable.triggerType, "fresh_update"),
          eq(questionAnswersTable.wasSkipped, false),
        ))
        .orderBy(desc(questionAnswersTable.createdAt)),

      // Pending follow-ups
      db.select({
          recipientId: followUpQuestionsTable.recipientId,
          status:      followUpQuestionsTable.status,
          triggerDate: followUpQuestionsTable.triggerDate,
        })
        .from(followUpQuestionsTable)
        .where(and(
          eq(followUpQuestionsTable.userId, userId),
          inArray(followUpQuestionsTable.recipientId, recipientIds),
          eq(followUpQuestionsTable.status, "pending"),
        )),

      // Most recent non-draft card per recipient
      db.select({
          recipientId: personalCardsTable.recipientId,
          eventType:   personalCardsTable.eventType,
          createdAt:   personalCardsTable.createdAt,
        })
        .from(personalCardsTable)
        .where(and(
          eq(personalCardsTable.userId, userId),
          inArray(personalCardsTable.recipientId, recipientIds),
          ne(personalCardsTable.status, "draft"),
        ))
        .orderBy(desc(personalCardsTable.createdAt)),
    ]);

    // Build lookup maps
    const memMap    = new Map(memories.map(m => [m.recipientId, m.completeness ?? 0]));
    const updateMap = new Map<string, Date>();
    for (const u of freshUpdates) {
      if (!updateMap.has(u.recipientId)) updateMap.set(u.recipientId, new Date(u.createdAt));
    }
    const fuMap = new Map<string, { hasPending: boolean; hasOverdue: boolean; count: number }>();
    const now   = new Date();
    const overdueThreshold = new Date(now.getTime() - 30 * 86400000);
    for (const fu of followUps) {
      const existing = fuMap.get(fu.recipientId) ?? { hasPending: false, hasOverdue: false, count: 0 };
      existing.hasPending = true;
      existing.count++;
      if (fu.triggerDate < overdueThreshold) existing.hasOverdue = true;
      fuMap.set(fu.recipientId, existing);
    }
    const cardMap = new Map<string, Date>();
    for (const c of recentCards) {
      if (!cardMap.has(c.recipientId)) cardMap.set(c.recipientId, new Date(c.createdAt));
    }

    const oneYearAgo = new Date(now.getTime() - 365 * 86400000);

    // 3. Compute scores
    const scores: RecipientHealthScore[] = recipients.map(r => {
      const profilePct = memMap.get(r.id) ?? 0;
      const profileScore = Math.round((profilePct / 100) * 30);

      const lastUpdate    = updateMap.get(r.id) ?? null;
      const lastUpdateDaysAgo = lastUpdate
        ? Math.floor((now.getTime() - lastUpdate.getTime()) / 86400000)
        : null;
      const freshUpdateScore =
        lastUpdateDaysAgo === null ? 0 :
        lastUpdateDaysAgo <= 30   ? 30 :
        lastUpdateDaysAgo <= 90   ? 20 :
        lastUpdateDaysAgo <= 180  ? 10 : 0;

      const fu = fuMap.get(r.id);
      const hasPendingFollowUp = fu?.hasPending ?? false;
      const hasOverdueFollowUp = fu?.hasOverdue ?? false;
      const pendingFollowUps   = fu?.count ?? 0;
      const followUpScore =
        hasOverdueFollowUp ? 0 :
        hasPendingFollowUp ? 10 : 20;

      // Next upcoming event
      const bdayDays  = daysUntilNextOccurrence(r.birthday);
      const annivDays = daysUntilNextOccurrence(r.anniversary);
      let nextEventDays: number | null  = null;
      let nextEventLabel: string | null = null;
      if (bdayDays !== null && (annivDays === null || bdayDays <= annivDays)) {
        nextEventDays  = bdayDays;
        nextEventLabel = "Birthday";
      } else if (annivDays !== null) {
        nextEventDays  = annivDays;
        nextEventLabel = "Anniversary";
      }
      const hasRecentUpdate30 = lastUpdateDaysAgo !== null && lastUpdateDaysAgo <= 30;
      const eventScore =
        nextEventDays === null          ? 10 :
        nextEventDays > 60              ? 10 :
        hasRecentUpdate30               ? 10 : 0;

      const lastCard    = cardMap.get(r.id) ?? null;
      const hasRecentCard = lastCard !== null && lastCard >= oneYearAgo;
      const cardScore   = hasRecentCard ? 10 : 0;

      const score = profileScore + freshUpdateScore + followUpScore + eventScore + cardScore;

      const status: RecipientHealthScore["status"] =
        score >= 90 ? "Excellent"       :
        score >= 70 ? "Healthy"         :
        score >= 50 ? "NeedsAttention"  : "Priority";

      const action = recommendedAction(
        profilePct,
        lastUpdateDaysAgo,
        hasPendingFollowUp,
        hasOverdueFollowUp,
        nextEventDays,
        nextEventLabel,
        hasRecentCard,
      );

      return {
        recipientId:       r.id,
        name:              [r.firstName, r.lastName].filter(Boolean).join(" "),
        relationshipType:  r.relationshipType,
        score,
        status,
        profileScore,
        freshUpdateScore,
        followUpScore,
        eventScore,
        cardScore,
        profilePct,
        lastUpdateDaysAgo,
        nextEventLabel,
        nextEventDaysAway: nextEventDays,
        pendingFollowUps,
        recommendedAction: action.label,
        actionType:        action.type,
      };
    });

    // Sort by score ascending (worst first) within each status group
    scores.sort((a, b) => a.score - b.score);

    logger.info({ userId, count: scores.length }, "v2-recipient-health: computed");
    res.json({ scores });
  } catch (err) {
    logger.error({ err, userId }, "v2-recipient-health: failed");
    res.status(500).json({ error: "Failed to compute health scores" });
  }
});

export default router;
