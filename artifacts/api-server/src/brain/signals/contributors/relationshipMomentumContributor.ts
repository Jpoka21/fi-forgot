/**
 * Relationship momentum signal contributor.
 *
 * Emits Level 2 read-only derived signals describing relationship activity and
 * calendar momentum from already-loaded RelationshipContext. No new reads,
 * no thresholds in label names, no recommendations, no decisions.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";
import {
  RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS,
  RELATIONSHIP_RECENT_ACTIVITY_DAYS,
} from "../../config/relationshipThresholds";

type MomentumState = "new" | "active" | "quiet" | "dormant";

const MS_PER_DAY = 86_400_000;

function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function parseMonthDay(dateStr: string): { month: number; day: number } | null {
  const parts = dateStr.split("-");
  let month: number;
  let day: number;

  if (parts.length === 3) {
    month = parseInt(parts[1]!, 10) - 1;
    day = parseInt(parts[2]!, 10);
  } else if (parts.length === 2) {
    month = parseInt(parts[0]!, 10) - 1;
    day = parseInt(parts[1]!, 10);
  } else {
    return null;
  }

  if (isNaN(month) || isNaN(day)) return null;
  return { month, day };
}

function daysUntilNextOccurrence(
  dateStr: string | null | undefined,
  referenceDate: Date,
): number | null {
  if (!dateStr) return null;

  const monthDay = parseMonthDay(dateStr);
  if (!monthDay) return null;

  const today = startOfDay(referenceDate);
  const year = today.getFullYear();
  let next = new Date(year, monthDay.month, monthDay.day);
  if (next < today) {
    next = new Date(year + 1, monthDay.month, monthDay.day);
  }

  return Math.ceil((next.getTime() - today.getTime()) / MS_PER_DAY);
}

function daysSinceMostRecentCardEvent(
  eventDateStr: string | null | undefined,
  referenceDate: Date,
): number | null {
  if (!eventDateStr) return null;

  const parts = eventDateStr.split("-");
  let parsed: Date | null = null;

  if (parts.length === 3) {
    const year = parseInt(parts[0]!, 10);
    const month = parseInt(parts[1]!, 10) - 1;
    const day = parseInt(parts[2]!, 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      parsed = new Date(year, month, day);
    }
  } else {
    const monthDay = parseMonthDay(eventDateStr);
    if (monthDay) {
      const ref = startOfDay(referenceDate);
      parsed = new Date(ref.getFullYear(), monthDay.month, monthDay.day);
    }
  }

  if (!parsed || isNaN(parsed.getTime())) return null;

  const ref = startOfDay(referenceDate);
  parsed.setHours(0, 0, 0, 0);
  const days = Math.floor((ref.getTime() - parsed.getTime()) / MS_PER_DAY);
  return days >= 0 ? days : null;
}

function lastInteractionDaysAgo(
  freshUpdateDaysAgo: number | undefined,
  followUpDaysAgo: number | undefined,
): number | null {
  const candidates = [freshUpdateDaysAgo, followUpDaysAgo].filter(
    (value): value is number => value != null,
  );
  return candidates.length > 0 ? Math.min(...candidates) : null;
}

function resolveNextEvent(
  birthday: string | null | undefined,
  anniversary: string | null | undefined,
  referenceDate: Date,
): { daysAway: number | null; label: string | null } {
  const birthdayDays = daysUntilNextOccurrence(birthday, referenceDate);
  const anniversaryDays = daysUntilNextOccurrence(anniversary, referenceDate);

  if (
    birthdayDays != null &&
    (anniversaryDays == null || birthdayDays <= anniversaryDays)
  ) {
    return { daysAway: birthdayDays, label: "Birthday" };
  }

  if (anniversaryDays != null) {
    return { daysAway: anniversaryDays, label: "Anniversary" };
  }

  return { daysAway: null, label: null };
}

function computeMomentumState(
  lastInteraction: number | null,
  freshUpdateAgeCategory: "recent" | "mid" | "older" | undefined,
  cardHistoryTotalSent: number,
  freshUpdateCount: number,
  followUpAnswerCount: number,
  briefingAnswerCount: number,
): MomentumState {
  if (
    cardHistoryTotalSent === 0 &&
    freshUpdateCount === 0 &&
    followUpAnswerCount === 0 &&
    briefingAnswerCount === 0
  ) {
    return "new";
  }

  if (freshUpdateAgeCategory === "recent") {
    return "active";
  }

  if (
    lastInteraction != null &&
    lastInteraction <= RELATIONSHIP_RECENT_ACTIVITY_DAYS
  ) {
    return "active";
  }

  if (lastInteraction == null && cardHistoryTotalSent > 0) {
    return "dormant";
  }

  if (
    freshUpdateAgeCategory === "older" ||
    (lastInteraction != null &&
      lastInteraction > RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS)
  ) {
    return "dormant";
  }

  return "quiet";
}

export function contributeRelationshipMomentumSignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  const {
    generatedAt,
    relationship,
    cardHistory,
    freshUpdates,
    followUpAnswers,
    briefingSummary,
  } = context.relationshipContext;

  const referenceDate = new Date(generatedAt);
  const mostRecentFreshUpdate = freshUpdates[0];
  const mostRecentFollowUp = followUpAnswers[0];

  const interactionDaysAgo = lastInteractionDaysAgo(
    mostRecentFreshUpdate?.daysAgo,
    mostRecentFollowUp?.daysAgo,
  );
  const daysSinceCardEvent = daysSinceMostRecentCardEvent(
    cardHistory.mostRecentCard?.eventDate,
    referenceDate,
  );
  const nextEvent = resolveNextEvent(
    relationship?.birthday,
    relationship?.anniversary,
    referenceDate,
  );
  const engagementActivityCount =
    freshUpdates.length +
    followUpAnswers.length +
    briefingSummary.totalAnswers +
    (cardHistory.totalSent > 0 ? 1 : 0);
  const momentumState = computeMomentumState(
    interactionDaysAgo,
    mostRecentFreshUpdate?.ageCategory,
    cardHistory.totalSent,
    freshUpdates.length,
    followUpAnswers.length,
    briefingSummary.totalAnswers,
  );

  return [
    {
      source: "relationship_momentum",
      label: "last_interaction_days_ago",
      value: interactionDaysAgo,
    },
    {
      source: "relationship_momentum",
      label: "days_since_most_recent_card_event",
      value: daysSinceCardEvent,
    },
    {
      source: "relationship_momentum",
      label: "next_event_days_away",
      value: nextEvent.daysAway,
    },
    {
      source: "relationship_momentum",
      label: "next_event_label",
      value: nextEvent.label,
    },
    {
      source: "relationship_momentum",
      label: "engagement_activity_count",
      value: engagementActivityCount,
    },
    {
      source: "relationship_momentum",
      label: "momentum_state",
      value: momentumState,
    },
  ];
}
