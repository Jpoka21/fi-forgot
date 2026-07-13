/** Guest Who-screen subtitle (Sprint 8C.6) — first-card focused, not profile onboarding. */
export const GUEST_WHO_SUBTITLE =
  "We'll use their name and your relationship to personalize this card.";

/**
 * Sprint 8C — compressed guest /try step order and tone+intensity helpers.
 *
 * Guests skip relationship-profile questions (REL_QUESTIONS).
 * Authenticated /try continues to use the full wizard in card-flow-v2.
 *
 * Sprint 8C.2: emotionalOpenness is collected on the Tone screen (not a separate step).
 * Sprint 8C.3: avoidMentioning is an optional control on the Tone screen (not a separate step).
 * Sprint 8C.4: birthday date is deferred for guests; holidayName remains when Occasion is Holiday.
 * Sprint 8C.6: guest Who copy + optional signOff on the Tone screen.
 */

/** Existing API default — keep in sync with v2-generate-card destructuring default. */
export const GUEST_DEFAULT_EMOTIONAL_OPENNESS = "Meaningful But Not Mushy";

/**
 * Compact intensity choices for the guest Tone screen.
 * Labels are UI-only; values are existing emotionalOpenness strings.
 */
export const GUEST_INTENSITY_CHOICES = [
  {
    label: "Light",
    emotionalOpenness: "A Little Appreciation At The End",
  },
  {
    label: "Warm",
    emotionalOpenness: GUEST_DEFAULT_EMOTIONAL_OPENNESS,
  },
  {
    label: "Deep",
    emotionalOpenness: "Deep And Emotional",
  },
] as const;

export const GUEST_TRY_STEP_IDS = [
  "occasion",
  "holidayName",
  "primaryOccasionContext",
  "details",
  "tone",
] as const;

export type GuestTryStepId = (typeof GUEST_TRY_STEP_IDS)[number];

/** Step ids guests must never see as standalone wizard screens. */
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
  // Sprint 8C.2 / 8C.3 — folded into Tone screen for guests only
  "emotionalOpenness",
  "avoidMentioning",
  // Sprint 8C.4 — birthday date deferred until after generation (auth keeps it)
  "birthday",
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

/**
 * Preserve an explicit emotionalOpenness answer; otherwise use the existing default.
 * Does not invent new API values.
 */
export function resolveEmotionalOpennessOrDefault(
  selected: string | undefined | null,
): string {
  const trimmed = typeof selected === "string" ? selected.trim() : "";
  return trimmed.length > 0 ? trimmed : GUEST_DEFAULT_EMOTIONAL_OPENNESS;
}

/** Selected intensity label for UI, or Warm when unset / default. */
export function resolveGuestIntensityLabel(
  emotionalOpenness: string | undefined | null,
): string {
  const value = resolveEmotionalOpennessOrDefault(emotionalOpenness);
  const match = GUEST_INTENSITY_CHOICES.find((c) => c.emotionalOpenness === value);
  return match?.label ?? "Warm";
}
