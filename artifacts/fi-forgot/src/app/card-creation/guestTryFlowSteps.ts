/**
 * Sprint 8C.1 — compressed guest /try step order.
 *
 * Guests skip relationship-profile questions (REL_QUESTIONS).
 * Authenticated /try continues to use the full wizard in card-flow-v2.
 *
 * Birthday / holidayName remain as occasion conditionals only.
 */

export const GUEST_TRY_STEP_IDS = [
  "occasion",
  "birthday",
  "holidayName",
  "primaryOccasionContext",
  "details",
  "tone",
  "emotionalOpenness",
  "avoidMentioning",
] as const;

export type GuestTryStepId = (typeof GUEST_TRY_STEP_IDS)[number];

/** Step ids guests must never see (profile onboarding + deferred soft prefs). */
export const GUEST_TRY_EXCLUDED_STEP_IDS = [
  // Relationship profile (REL_QUESTIONS)
  "friendType",
  "commStyle",
  "roastingLevel",
  "olderYounger",
  "siblingCloseness",
  "siblingFact",
  "parentPersonality",
  "parentFact",
  "timeTogether",
  "spouseSmile",
  "childAge",
  "proudOf",
  "proStrength",
  "recognizingFor",
  "grandFact",
  // Soft / deferred guest prefs (still available to authenticated UNIVERSAL flow)
  "avoidList",
  "interests",
  "signOff",
] as const;

type StepLike = { id: string };

/**
 * Build the guest /try step list from the shared universal question definitions.
 * Preserves each step's copy/options/conditions; only filters and reorders.
 */
export function buildGuestTrySteps<T extends StepLike>(universalQuestions: readonly T[]): T[] {
  const byId = new Map(universalQuestions.map((q) => [q.id, q]));
  const steps: T[] = [];
  for (const id of GUEST_TRY_STEP_IDS) {
    const step = byId.get(id);
    if (step) steps.push(step);
  }
  return steps;
}

export function isGuestTryExcludedStepId(id: string): boolean {
  return (GUEST_TRY_EXCLUDED_STEP_IDS as readonly string[]).includes(id);
}
