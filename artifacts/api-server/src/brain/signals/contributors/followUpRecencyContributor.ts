/**
 * Follow-up recency signal contributor.
 *
 * Emits derived read-only recency facts from relationshipContext.followUpAnswers.
 * Selects and counts only — no answer text, no thresholds, no recommendations.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";

export function contributeFollowUpRecencySignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  const { followUpAnswers } = context.relationshipContext;
  const mostRecent = followUpAnswers[0] ?? null;

  return [
    {
      source: "follow_up",
      label: "follow_up_answer_count",
      value: followUpAnswers.length,
    },
    {
      source: "follow_up",
      label: "most_recent_follow_up_days_ago",
      value: mostRecent?.daysAgo ?? null,
    },
  ];
}
