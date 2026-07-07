/**
 * Fresh update recency signal contributor.
 *
 * Emits derived read-only recency facts from relationshipContext.freshUpdates.
 * Selects and counts only — no answer text, no thresholds, no recommendations.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";

export function contributeFreshUpdateRecencySignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  const { freshUpdates } = context.relationshipContext;
  const mostRecent = freshUpdates[0] ?? null;

  return [
    {
      source: "memory_freshness",
      label: "fresh_update_count",
      value: freshUpdates.length,
    },
    {
      source: "memory_freshness",
      label: "most_recent_update_days_ago",
      value: mostRecent?.daysAgo ?? null,
    },
    {
      source: "memory_freshness",
      label: "most_recent_update_age_category",
      value: mostRecent?.ageCategory ?? null,
    },
  ];
}
