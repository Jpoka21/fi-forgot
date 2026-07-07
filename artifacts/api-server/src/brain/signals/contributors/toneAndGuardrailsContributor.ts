/**
 * Tone and guardrails signal contributor.
 *
 * Emits read-only trust and tone boundary facts from relationshipContext.tone
 * and relationshipContext.personality. Passthrough only — no thresholds,
 * no recommendations, no content analysis.
 */

import type { BrainSignal, RelationshipContextLoadResult } from "../../types";

export function contributeToneAndGuardrailsSignals(
  context: RelationshipContextLoadResult,
): BrainSignal[] {
  const { tone, personality } = context.relationshipContext;

  return [
    {
      source: "risk",
      label: "things_to_avoid",
      value: tone.thingsToAvoid,
    },
    {
      source: "risk",
      label: "things_to_always_include",
      value: tone.thingsToAlwaysInclude,
    },
    {
      source: "risk",
      label: "emotional_openness",
      value: tone.emotionalOpenness,
    },
    {
      source: "risk",
      label: "preferred_tone",
      value: tone.preferred,
    },
    {
      source: "risk",
      label: "personality_traits",
      value: personality.traits,
    },
    {
      source: "risk",
      label: "personality_notes",
      value: personality.notes,
    },
  ];
}
