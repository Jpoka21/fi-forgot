/**
 * Card history signal contributor.
 *
 * Emits read-only card activity aggregates from relationshipContext.cardHistory.
 * Counts and event types only — no mostRecentCard fields (owned by event_timing),
 * no date math, no thresholds, no recommendations.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";

export function contributeCardHistorySignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  const { cardHistory } = context.relationshipContext;

  return [
    {
      source: "card_history",
      label: "total_sent",
      value: cardHistory.totalSent,
    },
    {
      source: "card_history",
      label: "approved_count",
      value: cardHistory.approvedCount,
    },
    {
      source: "card_history",
      label: "rejected_count",
      value: cardHistory.rejectedCount,
    },
    {
      source: "card_history",
      label: "edited_count",
      value: cardHistory.editedCount,
    },
    {
      source: "card_history",
      label: "event_types",
      value: cardHistory.eventTypes,
    },
  ];
}
