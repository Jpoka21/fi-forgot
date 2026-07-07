/**
 * Event timing signal contributor.
 *
 * Emits read-only calendar and card event facts from loaded relationship context.
 * No daysUntil computation, no thresholds, no recommendations, no decisions.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";

export function contributeEventTimingSignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  const { relationship, cardHistory } = context.relationshipContext;
  const mostRecentCard = cardHistory.mostRecentCard;

  return [
    {
      source: "event_timing",
      label: "birthday",
      value: relationship?.birthday ?? null,
    },
    {
      source: "event_timing",
      label: "anniversary",
      value: relationship?.anniversary ?? null,
    },
    {
      source: "event_timing",
      label: "most_recent_card_event_type",
      value: mostRecentCard?.eventType ?? null,
    },
    {
      source: "event_timing",
      label: "most_recent_card_event_date",
      value: mostRecentCard?.eventDate ?? null,
    },
  ];
}
