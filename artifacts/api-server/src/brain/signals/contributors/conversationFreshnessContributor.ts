/**
 * Conversation freshness signal contributor.
 *
 * Emits read-only rollup facts about how current conversational knowledge is
 * across fresh updates, follow-up answers, and briefing history. Counts and
 * recency only — no answer text, no recommendations, no scheduling.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";
import {
  RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS,
  RELATIONSHIP_RECENT_ACTIVITY_DAYS,
} from "../../config/relationshipThresholds";

type FreshnessState = "none" | "current" | "aging" | "stale";

function minDefined(values: Array<number | null | undefined>): number | null {
  const defined = values.filter((value): value is number => value != null);
  return defined.length > 0 ? Math.min(...defined) : null;
}

function computeFreshnessState(
  freshUpdatesLength: number,
  followUpAnswersLength: number,
  briefingAnswerCount: number,
  mostRecentFreshUpdateAgeCategory: "recent" | "mid" | "older" | undefined,
  latestConversationDaysAgo: number | null,
): FreshnessState {
  if (
    freshUpdatesLength === 0 &&
    followUpAnswersLength === 0 &&
    briefingAnswerCount === 0
  ) {
    return "none";
  }

  if (
    mostRecentFreshUpdateAgeCategory === "recent" ||
    (latestConversationDaysAgo != null &&
      latestConversationDaysAgo <= RELATIONSHIP_RECENT_ACTIVITY_DAYS)
  ) {
    return "current";
  }

  if (
    mostRecentFreshUpdateAgeCategory === "older" ||
    (latestConversationDaysAgo != null &&
      latestConversationDaysAgo > RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS)
  ) {
    return "stale";
  }

  return "aging";
}

export function contributeConversationFreshnessSignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  const { freshUpdates, followUpAnswers, briefingSummary } =
    context.relationshipContext;

  const mostRecentFreshUpdate = freshUpdates[0];
  const mostRecentFollowUp = followUpAnswers[0];

  const recentUpdateCount = freshUpdates.filter(
    (update) => update.ageCategory === "recent",
  ).length;
  const followUpCount = followUpAnswers.length;
  const briefingAnswerCount = briefingSummary.totalAnswers;

  const latestUpdateDaysAgo = mostRecentFreshUpdate?.daysAgo ?? null;
  const latestFollowUpDaysAgo = mostRecentFollowUp?.daysAgo ?? null;
  const latestConversationDaysAgo = minDefined([
    latestUpdateDaysAgo,
    latestFollowUpDaysAgo,
  ]);

  const hasRecentUpdates =
    recentUpdateCount > 0 ||
    mostRecentFreshUpdate?.ageCategory === "recent" ||
    (latestFollowUpDaysAgo != null &&
      latestFollowUpDaysAgo <= RELATIONSHIP_RECENT_ACTIVITY_DAYS);

  const freshnessState = computeFreshnessState(
    freshUpdates.length,
    followUpAnswers.length,
    briefingAnswerCount,
    mostRecentFreshUpdate?.ageCategory,
    latestConversationDaysAgo,
  );

  return [
    {
      source: "conversation_freshness",
      label: "recent_update_count",
      value: recentUpdateCount,
    },
    {
      source: "conversation_freshness",
      label: "follow_up_count",
      value: followUpCount,
    },
    {
      source: "conversation_freshness",
      label: "briefing_answer_count",
      value: briefingAnswerCount,
    },
    {
      source: "conversation_freshness",
      label: "latest_update_days_ago",
      value: latestUpdateDaysAgo,
    },
    {
      source: "conversation_freshness",
      label: "latest_follow_up_days_ago",
      value: latestFollowUpDaysAgo,
    },
    {
      source: "conversation_freshness",
      label: "latest_conversation_days_ago",
      value: latestConversationDaysAgo,
    },
    {
      source: "conversation_freshness",
      label: "has_recent_updates",
      value: hasRecentUpdates,
    },
    {
      source: "conversation_freshness",
      label: "freshness_state",
      value: freshnessState,
    },
  ];
}
