/**
 * Question Engine — v1
 *
 * Lightweight service that reads profileCompleteness.missing from an assembled
 * RecipientContext and returns the single best next question to ask the user.
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

export interface SuggestedQuestion {
  fieldKey: string;
  fieldLabel: string;
  category: QuestionCategory;
  priority: QuestionPriority;
  question: string;   // {name} already substituted with recipient's first name
  reason: string;     // one-line explanation of why this question improves card quality
}

// ─── Question bank ────────────────────────────────────────────────────────────
// fieldLabel MUST match the label values in COMPLETENESS_FIELDS (recipient-context.ts).
// Within the same priority, earlier entries in this array win.

interface QuestionBankEntry {
  fieldKey: string;
  fieldLabel: string;
  category: QuestionCategory;
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

// ─── Priority ordering ────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<QuestionPriority, number> = {
  highest: 0,
  high:    1,
  medium:  2,
  low:     3,
};

// ─── Engine ───────────────────────────────────────────────────────────────────

/**
 * Returns the single best next question for a recipient, or null if the profile
 * is complete (nothing is missing from the question bank).
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

  // Find all bank entries whose fieldLabel appears in missing, preserving bank order
  const candidates = QUESTION_BANK.filter(entry => missingSet.has(entry.fieldLabel));
  if (candidates.length === 0) return null;

  // Sort by priority (stable sort — entries with equal priority keep bank order)
  candidates.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const winner = candidates[0]!;

  return {
    fieldKey:   winner.fieldKey,
    fieldLabel: winner.fieldLabel,
    category:   winner.category,
    priority:   winner.priority,
    question:   winner.questionTemplate.replaceAll("{name}", firstName),
    reason:     winner.reason.replaceAll("{name}", firstName),
  };
}

/**
 * Returns all missing fields that have a question in the bank, sorted by
 * priority. Useful for showing a queue of upcoming questions.
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
  }));
}
