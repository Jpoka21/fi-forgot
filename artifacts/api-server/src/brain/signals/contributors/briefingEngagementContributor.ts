/**
 * Briefing engagement signal contributor.
 *
 * Emits derived read-only engagement facts from relationshipContext.briefingSummary.
 * Counts only — no answer text, no thresholds, no recommendations.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";

export function contributeBriefingEngagementSignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  const { briefingSummary } = context.relationshipContext;

  return [
    {
      source: "engagement",
      label: "briefing_answer_count",
      value: briefingSummary.totalAnswers,
    },
    {
      source: "engagement",
      label: "profile_questions_answered",
      value: briefingSummary.allAnswers.filter((a) => a.eventType === "Profile").length,
    },
  ];
}
