import { conciergePhilosophyDefaults } from "@/app/concierge/conciergeDomain";
import type { OccasionReadinessSnapshot } from "@/app/concierge/conciergeDomain";

const HIGH_PRIORITY_OCCASIONS = new Set([
  "Birthday",
  "Anniversary",
  "Mother's Day",
  "Father's Day",
  "Christmas",
  "Hanukkah",
  "Valentine's Day",
  "Wedding",
  "Graduation",
]);

export interface OccasionReadinessInput {
  eventLabel: string;
  daysAway: number | null;
  relationshipConfidence: number;
  hasRecentUpdate: boolean;
}

/**
 * Occasion Readiness — ask one question only if it materially improves the card.
 */
export function evaluateOccasionReadiness(
  input: OccasionReadinessInput,
): OccasionReadinessSnapshot | null {
  if (input.daysAway === null || input.daysAway < 0 || input.daysAway > 60) {
    return null;
  }

  const isHighPriority = HIGH_PRIORITY_OCCASIONS.has(input.eventLabel);
  const imminent = input.daysAway <= 45;
  const verySoon = input.daysAway <= 14;

  const confidenceHigh = input.relationshipConfidence >= 85;
  const confidenceModerate = input.relationshipConfidence >= 65;

  if (confidenceHigh && input.hasRecentUpdate) {
    return {
      eventLabel: input.eventLabel,
      daysAway: input.daysAway,
      shouldAskOneQuestion: false,
      shouldAutoPrepare: true,
      reason: conciergePhilosophyDefaults.matureOccasionReady,
    };
  }

  if (verySoon && !confidenceModerate) {
    return {
      eventLabel: input.eventLabel,
      daysAway: input.daysAway,
      shouldAskOneQuestion: true,
      shouldAutoPrepare: false,
      reason: conciergePhilosophyDefaults.oneQuickUpdate,
    };
  }

  if (imminent && isHighPriority && !confidenceHigh) {
    return {
      eventLabel: input.eventLabel,
      daysAway: input.daysAway,
      shouldAskOneQuestion: true,
      shouldAutoPrepare: false,
      reason: `Before I write this year's ${input.eventLabel} card, one recent detail would make it unmistakably personal.`,
    };
  }

  if (imminent && confidenceHigh) {
    return {
      eventLabel: input.eventLabel,
      daysAway: input.daysAway,
      shouldAskOneQuestion: false,
      shouldAutoPrepare: true,
      reason: conciergePhilosophyDefaults.matureOccasionReady,
    };
  }

  return {
    eventLabel: input.eventLabel,
    daysAway: input.daysAway,
    shouldAskOneQuestion: false,
    shouldAutoPrepare: false,
    reason: "",
  };
}
