/**
 * Profile completeness signal contributor.
 *
 * Emits read-only facts from relationshipContext.profileCompleteness.
 * No thresholds, no recommendations, no decisions.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";

export function contributeProfileCompletenessSignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  const { profileCompleteness } = context.relationshipContext;

  return [
    {
      source: "profile_completeness",
      label: "score",
      value: profileCompleteness.score,
    },
    {
      source: "profile_completeness",
      label: "filled_fields",
      value: profileCompleteness.filled,
    },
    {
      source: "profile_completeness",
      label: "missing_fields",
      value: profileCompleteness.missing,
    },
  ];
}
