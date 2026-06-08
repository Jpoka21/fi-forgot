/**
 * Question Engine — v1
 *
 * Lightweight service that reads profileCompleteness.missing from an assembled
 * RecipientContext and returns the single best next question to ask the user.
 *
 * Two question modes:
 *   profile_gap   — permanent profile fields; exhausts when all 13 are filled.
 *   fresh_update  — time-sensitive, rotating prompts; never exhausted.
 *
 * Design constraints:
 * - Question bank is in code, not the database.
 * - No answer saving — this service only suggests; it does not collect.
 * - Does not replace the existing briefing flow.
 * - Priority drives selection: highest → high → medium → low.
 * - Within the same priority level, the first bank entry wins (bank order matters).
 *
 * Labels in the question bank MUST match the label strings produced by
 * COMPLETENESS_FIELDS in recipient-context.ts — those are what appear in
 * profileCompleteness.missing.
 */

import type { RecipientContext } from "./recipient-context";

// ─── Output types ─────────────────────────────────────────────────────────────

export type QuestionPriority = "highest" | "high" | "medium" | "low";

export type QuestionCategory =
  | "safety"       // things_to_avoid — protect the recipient from sensitive topics
  | "personality"  // who they are
  | "memories"     // shared history
  | "tone"         // how emotional/funny/deep the cards should feel
  | "delivery"     // logistics
  | "setup";       // dates and one-time setup info

export type QuestionMode = "profile_gap" | "fresh_update" | "follow_up";

export interface FollowUpMeta {
  id:             string;
  originalAnswer: string;
  category:       string;
}

export interface SuggestedQuestion {
  fieldKey: string;
  fieldLabel: string;
  category: QuestionCategory | "update";
  priority: QuestionPriority;
  question: string;   // {name} already substituted with recipient's first name
  reason: string;     // one-line explanation of why this question improves card quality
  mode: QuestionMode;
  followUp?: FollowUpMeta;  // present only when mode === "follow_up"
}

// ─── Profile gap question bank ────────────────────────────────────────────────
// fieldLabel MUST match the label values in COMPLETENESS_FIELDS (recipient-context.ts).
// Within the same priority, earlier entries in this array win.

interface QuestionBankEntry {
  fieldKey: string;
  fieldLabel: string;
  category: QuestionCategory | "update";
  priority: QuestionPriority;
  questionTemplate: string;   // use {name} as a placeholder
  reason: string;
}

const QUESTION_BANK: QuestionBankEntry[] = [
  // ── Highest priority ────────────────────────────────────────────────────────
  {
    fieldKey:         "things_to_avoid",
    fieldLabel:       "Things to avoid",
    category:         "safety",
    priority:         "highest",
    questionTemplate: "Is there anything we should never mention in a card to {name}?",
    reason:           "Prevents cards from hitting sensitive topics — the most important guardrail we can have.",
  },

  // ── High priority ────────────────────────────────────────────────────────────
  {
    fieldKey:         "interests",
    fieldLabel:       "Interests",
    category:         "personality",
    priority:         "high",
    questionTemplate: "What is {name} really into these days?",
    reason:           "Weaving in what {name} loves makes cards feel genuinely personal rather than generic.",
  },
  {
    fieldKey:         "favorite_memories",
    fieldLabel:       "Favorite memories",
    category:         "memories",
    priority:         "high",
    questionTemplate: "What\u2019s a favorite memory you share with {name}?",
    reason:           "Specific shared memories are the fastest way to make a card feel like it came from you.",
  },
  {
    fieldKey:         "inside_jokes",
    fieldLabel:       "Inside jokes",
    category:         "memories",
    priority:         "high",
    questionTemplate: "Is there an inside joke or a phrase that only you and {name} would understand?",
    reason:           "Shared references make cards unmistakably personal — nothing generic can compete.",
  },

  // ── Medium priority ───────────────────────────────────────────────────────────
  {
    fieldKey:         "personality_notes",
    fieldLabel:       "Personality notes",
    category:         "personality",
    priority:         "medium",
    questionTemplate: "How would you describe {name} in your own words?",
    reason:           "Freeform notes give us the texture of who {name} is beyond checkboxes.",
  },
  {
    fieldKey:         "personality_traits",
    fieldLabel:       "Personality traits",
    category:         "personality",
    priority:         "medium",
    questionTemplate: "How would you describe {name}\u2019s personality — a few words or phrases?",
    reason:           "Personality traits help us match the card\u2019s voice to who {name} actually is.",
  },
  {
    fieldKey:         "preferred_tone",
    fieldLabel:       "Preferred tone",
    category:         "tone",
    priority:         "medium",
    questionTemplate: "What tone feels right for cards to {name} \u2014 funny, heartfelt, romantic, or something else?",
    reason:           "Tone is the single biggest lever on whether a card lands or misses.",
  },
  {
    fieldKey:         "emotional_openness",
    fieldLabel:       "Emotional openness",
    category:         "tone",
    priority:         "medium",
    questionTemplate: "How emotionally open do you want cards to {name} to feel \u2014 light and fun, or deep and heartfelt?",
    reason:           "Calibrates how much feeling to put into every card we write for {name}.",
  },
  {
    fieldKey:         "always_include",
    fieldLabel:       "Things to always include",
    category:         "tone",
    priority:         "medium",
    questionTemplate: "Is there anything you always want included in a card to {name}?",
    reason:           "Some things belong in every card \u2014 better to know upfront than guess every time.",
  },

  // ── Low priority ──────────────────────────────────────────────────────────────
  // These are typically set at recipient-creation time. They surface only when
  // everything above is already filled.
  {
    fieldKey:         "birthday",
    fieldLabel:       "Birthday",
    category:         "setup",
    priority:         "low",
    questionTemplate: "When is {name}\u2019s birthday?",
    reason:           "Lets us send birthday cards automatically so you never miss it.",
  },
  {
    fieldKey:         "anniversary",
    fieldLabel:       "Anniversary",
    category:         "setup",
    priority:         "low",
    questionTemplate: "Is there a recurring date \u2014 anniversary, holiday, or tradition \u2014 we should know about for {name}?",
    reason:           "Recurring dates let us prepare cards in advance without you having to remember.",
  },
  {
    fieldKey:         "delivery_preference",
    fieldLabel:       "Delivery preference",
    category:         "delivery",
    priority:         "low",
    questionTemplate: "How would you like cards to {name} handled \u2014 mailed directly to them, or sent to you for review first?",
    reason:           "Makes sure every card reaches {name} the way you intended.",
  },
  {
    fieldKey:         "briefing_answers",
    fieldLabel:       "Briefing answers",
    category:         "personality",
    priority:         "low",
    questionTemplate: "Tell us one specific thing about {name} right now \u2014 a memory, a detail, anything personal.",
    reason:           "Even a single specific detail makes the next card dramatically better.",
  },
];

// ─── Fresh update question bank ───────────────────────────────────────────────
// These rotate perpetually once all profile-gap questions are answered.
// They are never "exhausted" — the engine picks the one answered longest ago.
// Within the same last-answered date (or never answered), earlier entries win.

export const FRESH_UPDATE_BANK: QuestionBankEntry[] = [
  {
    fieldKey:         "recent_memory",
    fieldLabel:       "Recent memory",
    category:         "update",
    priority:         "high",
    questionTemplate: "What\u2019s a recent memory you\u2019ve shared with {name} in the last few months?",
    reason:           "Recent moments make cards feel current — not like they were written from a template.",
  },
  {
    fieldKey:         "current_excitement",
    fieldLabel:       "Current excitement",
    category:         "update",
    priority:         "high",
    questionTemplate: "What is {name} most excited about right now?",
    reason:           "What someone\u2019s excited about is the most personal detail we can put in a card.",
  },
  {
    fieldKey:         "current_challenge",
    fieldLabel:       "Current challenge",
    category:         "update",
    priority:         "high",
    questionTemplate: "Has anything been challenging for {name} lately?",
    reason:           "Acknowledging what someone\u2019s going through makes a card land very differently.",
  },
  {
    fieldKey:         "recent_accomplishment",
    fieldLabel:       "Recent accomplishment",
    category:         "update",
    priority:         "high",
    questionTemplate: "What accomplishment would make {name} proud right now?",
    reason:           "Calling out a real win makes a card feel like it was written just for them.",
  },
  {
    fieldKey:         "family_news",
    fieldLabel:       "Family & home life",
    category:         "update",
    priority:         "medium",
    questionTemplate: "Has anything changed in {name}\u2019s family, home life, or daily routine?",
    reason:           "Family context shapes what kind of message will land best right now.",
  },
  {
    fieldKey:         "new_hobby",
    fieldLabel:       "New hobby or interest",
    category:         "update",
    priority:         "medium",
    questionTemplate: "Has {name} picked up any new hobbies, interests, or habits recently?",
    reason:           "New interests are the easiest way to make a card feel timely and specific.",
  },
  {
    fieldKey:         "anything_to_remember",
    fieldLabel:       "Anything to remember",
    category:         "update",
    priority:         "medium",
    questionTemplate: "Is there anything new you\u2019d like us to remember for future cards?",
    reason:           "Whatever the sender flags tends to be exactly what makes the card matter.",
  },
];

// ─── Priority ordering ────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<QuestionPriority, number> = {
  highest: 0,
  high:    1,
  medium:  2,
  low:     3,
};

// ─── Profile gap engine ───────────────────────────────────────────────────────

/**
 * Returns the single best next profile-gap question, or null when all 13
 * profile fields are filled.
 *
 * Selection logic:
 * 1. Read profileCompleteness.missing (label strings).
 * 2. Map each missing label to its bank entry (unknown labels are skipped).
 * 3. Sort by priority (highest first); within the same priority, preserve bank order.
 * 4. Return the top entry with {name} substituted.
 */
export function getNextQuestion(context: RecipientContext): SuggestedQuestion | null {
  const { missing } = context.profileCompleteness;
  if (missing.length === 0) return null;

  const missingSet = new Set(missing);
  const firstName = context.identity?.firstName ?? "them";

  const candidates = QUESTION_BANK.filter(entry => missingSet.has(entry.fieldLabel));
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const winner = candidates[0]!;

  return {
    fieldKey:   winner.fieldKey,
    fieldLabel: winner.fieldLabel,
    category:   winner.category,
    priority:   winner.priority,
    question:   winner.questionTemplate.replaceAll("{name}", firstName),
    reason:     winner.reason.replaceAll("{name}", firstName),
    mode:       "profile_gap",
  };
}

/**
 * Returns all missing profile fields that have a question in the bank, sorted
 * by priority. Useful for showing a queue of upcoming questions.
 */
export function getAllPendingQuestions(context: RecipientContext): SuggestedQuestion[] {
  const { missing } = context.profileCompleteness;
  if (missing.length === 0) return [];

  const missingSet = new Set(missing);
  const firstName = context.identity?.firstName ?? "them";

  const candidates = QUESTION_BANK.filter(entry => missingSet.has(entry.fieldLabel));
  candidates.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return candidates.map(entry => ({
    fieldKey:   entry.fieldKey,
    fieldLabel: entry.fieldLabel,
    category:   entry.category,
    priority:   entry.priority,
    question:   entry.questionTemplate.replaceAll("{name}", firstName),
    reason:     entry.reason.replaceAll("{name}", firstName),
    mode:       "profile_gap" as const,
  }));
}

// ─── Fresh update engine ──────────────────────────────────────────────────────

/** Minimal record needed for rotation — just the key and when it was last answered. */
export interface FreshUpdateRecord {
  questionKey: string;
  createdAt: Date;
}

/**
 * Returns the next fresh-update question to ask, rotating through the bank so
 * no prompt is repeated until all have been answered at least once.
 *
 * Selection logic:
 * 1. Build a map of questionKey → most recent createdAt.
 * 2. Never-answered questions sort before answered ones (epoch date).
 * 3. Among answered questions, oldest answer comes first.
 * 4. Ties preserve bank order.
 *
 * Always returns a question — fresh updates are never exhausted.
 */
export function getNextFreshUpdateQuestion(
  context: RecipientContext,
  freshUpdateHistory: FreshUpdateRecord[],
): SuggestedQuestion {
  const firstName = context.identity?.firstName ?? "them";

  // Latest answer date per question key
  const lastAnswered = new Map<string, Date>();
  for (const record of freshUpdateHistory) {
    const existing = lastAnswered.get(record.questionKey);
    if (!existing || record.createdAt > existing) {
      lastAnswered.set(record.questionKey, record.createdAt);
    }
  }

  const epoch = new Date(0);
  const scored = FRESH_UPDATE_BANK.map((entry, bankIndex) => ({
    entry,
    bankIndex,
    lastAt: lastAnswered.get(entry.fieldKey) ?? epoch,
  }));

  // Primary sort: oldest last-answered first (epoch = never answered = oldest)
  // Secondary sort: preserve bank order for ties
  scored.sort((a, b) => {
    const timeDiff = a.lastAt.getTime() - b.lastAt.getTime();
    return timeDiff !== 0 ? timeDiff : a.bankIndex - b.bankIndex;
  });

  const winner = scored[0]!.entry;

  return {
    fieldKey:   winner.fieldKey,
    fieldLabel: winner.fieldLabel,
    category:   winner.category,
    priority:   winner.priority,
    question:   winner.questionTemplate.replaceAll("{name}", firstName),
    reason:     winner.reason.replaceAll("{name}", firstName),
    mode:       "fresh_update",
  };
}
