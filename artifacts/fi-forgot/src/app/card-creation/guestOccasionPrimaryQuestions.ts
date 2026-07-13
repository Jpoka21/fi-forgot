/**
 * Guest /try occasion primary questions.
 *
 * Source of truth for occasion IDs: the production `/try` list (CardFlowV2).
 * Do not import Brain, Unified Event Domain, briefing, or onboarding registries.
 */

export const TRY_OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Thank You",
  "Congratulations",
  "Get Well",
  "Sympathy",
  "Apology",
  "Thinking Of You",
  "Just Because",
  "Holiday",
  "Encouragement",
  "Retirement",
  "New Baby",
  "Wedding",
  "Graduation",
  "Other",
] as const;

export type TryOccasion = (typeof TRY_OCCASIONS)[number];

export type GuestOccasionPrimaryQuestionDefinition = {
  question: string;
  required: true;
};

export const GUEST_OCCASION_PRIMARY_FALLBACK =
  "What is the main thing this card should say?";

/** Minimum trimmed length for a valid primary answer (matches hasRealDetail). */
export const PRIMARY_OCCASION_CONTEXT_MIN_LENGTH = 4;

export const GUEST_OCCASION_PRIMARY_QUESTIONS: {
  [K in TryOccasion]: GuestOccasionPrimaryQuestionDefinition;
} = {
  Birthday: {
    question: "What would you most like to celebrate about {name} this birthday?",
    required: true,
  },
  Anniversary: {
    question: "What about your anniversary with {name} matters most right now?",
    required: true,
  },
  "Thank You": {
    question: "What are you thanking {name} for?",
    required: true,
  },
  Congratulations: {
    question: "What accomplishment are you celebrating?",
    required: true,
  },
  "Get Well": {
    question: "What is {name} going through or recovering from?",
    required: true,
  },
  Sympathy: {
    question: "What happened, or what would you like to acknowledge?",
    required: true,
  },
  Apology: {
    question: "What are you apologizing for?",
    required: true,
  },
  "Thinking Of You": {
    question: "What made you think of {name} right now?",
    required: true,
  },
  "Just Because": {
    question: "What's the main reason you're reaching out to {name}?",
    required: true,
  },
  Holiday: {
    question: "What do you want this {holiday} card to focus on?",
    required: true,
  },
  Encouragement: {
    question: "What does {name} need encouragement about?",
    required: true,
  },
  Retirement: {
    question: "What about {name}'s retirement or career should this card celebrate?",
    required: true,
  },
  "New Baby": {
    question: "What about the new baby or this moment do you want to celebrate?",
    required: true,
  },
  Wedding: {
    question: "What do you most want to celebrate about {name}'s wedding?",
    required: true,
  },
  Graduation: {
    question: "What about this graduation are you celebrating?",
    required: true,
  },
  Other: {
    question: GUEST_OCCASION_PRIMARY_FALLBACK,
    required: true,
  },
};

export function isTryOccasion(value: string): value is TryOccasion {
  return (TRY_OCCASIONS as readonly string[]).includes(value);
}

export function resolveGuestPrimaryOccasionQuestion(
  occasion: string,
  firstName: string,
  holidayName?: string,
): string {
  const name = firstName.trim() || "them";
  const def = isTryOccasion(occasion)
    ? GUEST_OCCASION_PRIMARY_QUESTIONS[occasion]
    : undefined;
  const template = def?.question ?? GUEST_OCCASION_PRIMARY_FALLBACK;
  const holiday = holidayName?.trim() || "holiday";
  return template.replaceAll("{name}", name).replaceAll("{holiday}", holiday);
}

export function isValidPrimaryOccasionContext(
  value: string | undefined | null,
): boolean {
  return typeof value === "string" && value.trim().length >= PRIMARY_OCCASION_CONTEXT_MIN_LENGTH;
}

/**
 * When occasion changes, clear stale primary context so it cannot carry over.
 */
export function clearPrimaryOccasionContextOnOccasionChange<
  T extends Record<string, string | string[]>,
>(answers: T): T {
  const next = { ...answers };
  delete next.primaryOccasionContext;
  return next;
}
