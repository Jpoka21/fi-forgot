import type { CardOrder, Recipient } from "@/lib/data";
import type {
  FreshUpdate,
  HealthScore,
  NextQuestion,
  TrackedEventData,
} from "@/app/relationship-profile/relationshipProfileDomain";

export const conciergeQuestionDefaults = {
  skipLabel: "Skip for now",
  alternateLabel: "Ask me something else",
  rememberLaterLabel: "I'll remember later",
  saveLabel: "Save this",
  savingLabel: "Saving…",
  placeholder: "Share a story, a moment, or a detail…",
  sectionEyebrow: "Your Relationship Concierge",
  matureTitle: "I already know enough for now",
  matureBody:
    "I've learned a lot over time. I'll only ask when something would meaningfully improve the next card.",
} as const;

export type ConciergeQuestionPriority =
  | "foundational"
  | "maintenance"
  | "occasion"
  | "follow_up"
  | "writing_style";

export type ConciergeExpectedValue = "high" | "medium" | "low";

export interface ConciergeQuestion {
  fieldKey: string;
  fieldLabel: string;
  mode: NextQuestion["mode"];
  question: string;
  reason: string;
  contextNote?: string;
  progressLabel?: string;
  maturityMessage?: string;
  affirmationOnSave: string;
  shouldAskNow: boolean;
  deferReason?: string;
  priority: ConciergeQuestionPriority;
  expectedValue: ConciergeExpectedValue;
  /** Relationship confidence score (0–100) from concierge orchestration */
  confidenceScore?: number;
  learningHeadline?: string;
  followUp?: NextQuestion["followUp"];
}

export interface QuestionIntelligenceInput {
  serverQuestion: NextQuestion | null;
  recipient: Recipient;
  freshUpdates: FreshUpdate[];
  healthScore: HealthScore | null;
  upcomingEvents: TrackedEventData[];
  profileComplete: boolean;
  profileScore?: number;
  cards: CardOrder[];
  alternateIndex?: number;
  forceAsk?: boolean;
}

export interface ConversationalTemplate {
  fieldKey: string;
  fieldLabel: string;
  mode: NextQuestion["mode"];
  templates: string[];
  reason: string;
  priority: ConciergeQuestionPriority;
  expectedValue: ConciergeExpectedValue;
}

export const AFFIRMATIONS = [
  "Perfect. That helps me understand them much better.",
  "That's exactly the kind of detail that makes cards personal.",
  "Thanks — I'll remember that.",
  "Wonderful. Future cards will be much more meaningful because of that.",
] as const;

/** Story-based conversational templates keyed by server fieldKey */
export const CONVERSATIONAL_TEMPLATES: ConversationalTemplate[] = [
  {
    fieldKey: "things_to_avoid",
    fieldLabel: "Things to avoid",
    mode: "profile_gap",
    priority: "foundational",
    expectedValue: "high",
    reason: "Sensitive topics are the most important guardrail before anything is written.",
    templates: [
      "Is there anything I should avoid mentioning when writing to {phrase}?",
      "Are there topics that would feel uncomfortable or off-limits for {phrase}?",
    ],
  },
  {
    fieldKey: "interests",
    fieldLabel: "Interests",
    mode: "profile_gap",
    priority: "foundational",
    expectedValue: "high",
    reason: "What someone could talk about for hours is gold for future cards.",
    templates: [
      "What could {phrase} talk about for hours?",
      "What has {phrase} been really into lately?",
    ],
  },
  {
    fieldKey: "favorite_memories",
    fieldLabel: "Favorite memories",
    mode: "profile_gap",
    priority: "foundational",
    expectedValue: "high",
    reason: "One vivid memory can shape every future card.",
    templates: [
      "What's one memory that perfectly captures who {phrase} is?",
      "Tell me about a time {phrase} made you laugh.",
      "What always reminds you of {phrase}?",
    ],
  },
  {
    fieldKey: "inside_jokes",
    fieldLabel: "Inside jokes",
    mode: "profile_gap",
    priority: "foundational",
    expectedValue: "high",
    reason: "Shared references make cards unmistakably yours.",
    templates: [
      "Is there an inside joke or phrase that only you and {phrase} would understand?",
      "What's something {phrase} says all the time?",
    ],
  },
  {
    fieldKey: "personality_notes",
    fieldLabel: "Personality notes",
    mode: "profile_gap",
    priority: "foundational",
    expectedValue: "medium",
    reason: "First impressions help cards sound observant, not generic.",
    templates: [
      "If someone met {phrase} for the first time, what would they notice?",
      "How would you describe {phrase} in your own words?",
    ],
  },
  {
    fieldKey: "personality_traits",
    fieldLabel: "Personality traits",
    mode: "profile_gap",
    priority: "foundational",
    expectedValue: "medium",
    reason: "A few true traits go further than a dozen adjectives.",
    templates: [
      "What three words would people who love {phrase} use to describe them?",
      "What's one thing you hope {phrase} never changes?",
    ],
  },
  {
    fieldKey: "preferred_tone",
    fieldLabel: "Preferred tone",
    mode: "profile_gap",
    priority: "writing_style",
    expectedValue: "high",
    reason: "Tone is the biggest lever on whether a card lands.",
    templates: [
      "When you write to {phrase}, are you usually sentimental, funny, playful, or somewhere in between?",
      "Should cards to {phrase} sound casual or a little more elegant?",
    ],
  },
  {
    fieldKey: "emotional_openness",
    fieldLabel: "Emotional openness",
    mode: "profile_gap",
    priority: "writing_style",
    expectedValue: "medium",
    reason: "This calibrates how deep every future card should go.",
    templates: [
      "When you write to {phrase}, are you more emotional or more playful?",
      "Do you usually express feelings directly, or keep things lighter?",
    ],
  },
  {
    fieldKey: "always_include",
    fieldLabel: "Things to always include",
    mode: "profile_gap",
    priority: "maintenance",
    expectedValue: "medium",
    reason: "Some details belong in every card — better to know upfront.",
    templates: [
      "Is there anything you always want included when writing to {phrase}?",
      "What's something small that means a lot to {phrase}?",
    ],
  },
  {
    fieldKey: "recent_memory",
    fieldLabel: "Recent memory",
    mode: "fresh_update",
    priority: "maintenance",
    expectedValue: "high",
    templates: [
      "What's a recent moment with {phrase} that still makes you smile?",
      "Tell me about something that happened with {phrase} in the last few months.",
    ],
    reason: "Recent stories keep cards feeling current, not recycled.",
  },
  {
    fieldKey: "current_excitement",
    fieldLabel: "Current excitement",
    mode: "fresh_update",
    priority: "maintenance",
    expectedValue: "high",
    templates: [
      "Over the last six months, what has {phrase} been most excited about?",
      "What has {phrase} been looking forward to lately?",
    ],
    reason: "What someone is excited about right now is the most personal detail we can use.",
  },
  {
    fieldKey: "current_challenge",
    fieldLabel: "Current challenge",
    mode: "fresh_update",
    priority: "maintenance",
    expectedValue: "medium",
    templates: [
      "Has anything been challenging for {phrase} lately?",
      "Is there something weighing on {phrase} that a card should acknowledge gently?",
    ],
    reason: "Acknowledging real life makes a card land very differently.",
  },
  {
    fieldKey: "recent_accomplishment",
    fieldLabel: "Recent accomplishment",
    mode: "fresh_update",
    priority: "maintenance",
    expectedValue: "high",
    templates: [
      "What's something {phrase} is incredibly proud of right now?",
      "Has {phrase} accomplished anything recently that deserves celebrating?",
    ],
    reason: "Calling out a real win makes a card feel written just for them.",
  },
  {
    fieldKey: "family_news",
    fieldLabel: "Family & home life",
    mode: "fresh_update",
    priority: "maintenance",
    expectedValue: "medium",
    templates: [
      "Has anything changed in {phrase}'s family or home life recently?",
      "Any family news I should keep in mind for future cards?",
    ],
    reason: "Family context shapes what kind of message will land best.",
  },
  {
    fieldKey: "new_hobby",
    fieldLabel: "New hobby or interest",
    mode: "fresh_update",
    priority: "maintenance",
    expectedValue: "medium",
    templates: [
      "Has {phrase} picked up anything new recently — a hobby, habit, or obsession?",
      "What's something new {phrase} has been into this year?",
    ],
    reason: "New interests are the easiest way to make a card feel timely.",
  },
  {
    fieldKey: "anything_to_remember",
    fieldLabel: "Anything to remember",
    mode: "fresh_update",
    priority: "maintenance",
    expectedValue: "medium",
    templates: [
      "Is there anything new you'd like me to remember for future cards?",
      "What's something that instantly makes you think of {phrase}?",
    ],
    reason: "Whatever you flag here tends to be exactly what makes the next card matter.",
  },
];

export const OCCASION_QUESTION_TEMPLATES: Record<string, string[]> = {
  Birthday: [
    "Before I write this year's birthday card for {phrase}… has anything happened since last year's birthday I should include?",
    "Anything new you'd like me to celebrate in {phrase}'s birthday card this year?",
  ],
  Anniversary: [
    "Before this anniversary card… is there a moment from this past year worth mentioning?",
    "What's one thing about this year together that {phrase} would love hearing about?",
  ],
  "Mother's Day": [
    "Before Mother's Day… has anything happened recently that Mom would love hearing mentioned?",
    "What's one thing about your mom this year that deserves to be celebrated?",
  ],
  "Father's Day": [
    "Before Father's Day… anything new you'd like celebrated in Dad's card this year?",
    "What's a recent moment with your dad worth mentioning?",
  ],
  "Valentine's Day": [
    "Before Valentine's Day… what's one specific thing about {phrase} you're grateful for right now?",
  ],
  Christmas: [
    "Before the holidays… has anything meaningful happened with {phrase} this year worth mentioning?",
  ],
  Graduation: [
    "Before celebrating this graduation… what accomplishment should the card highlight most?",
  ],
};

export const FRESH_UPDATE_FIELD_KEYS = CONVERSATIONAL_TEMPLATES
  .filter((entry) => entry.mode === "fresh_update")
  .map((entry) => entry.fieldKey);

export function getRelationshipPhrase(recipient: Recipient): string {
  const firstName = recipient.name.split(" ")[0] ?? "them";
  const rel = recipient.relationship?.toLowerCase() ?? "";

  if (rel.includes("mother") || rel === "mom") return "your mom";
  if (rel.includes("father") || rel === "dad") return "your dad";
  if (rel.includes("brother")) return "your brother";
  if (rel.includes("sister")) return "your sister";
  if (rel.includes("wife")) return "your wife";
  if (rel.includes("husband")) return "your husband";
  if (rel.includes("grandmother") || rel.includes("grandma")) return "your grandmother";
  if (rel.includes("grandfather") || rel.includes("grandpa")) return "your grandfather";
  if (rel.includes("son")) return "your son";
  if (rel.includes("daughter")) return "your daughter";
  if (rel.includes("partner") || rel.includes("spouse")) return firstName;

  return firstName;
}

export function applyPhrase(template: string, phrase: string, firstName?: string): string {
  return template
    .replaceAll("{phrase}", phrase)
    .replaceAll("{name}", firstName ?? phrase);
}

export function pickStableVariant(templates: string[], seed: string): string {
  if (templates.length === 0) return "";
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash + seed.charCodeAt(index)) % 9973;
  }
  return templates[hash % templates.length] ?? templates[0]!;
}

export function buildProgressLabel(input: QuestionIntelligenceInput): string | undefined {
  if (!input.serverQuestion) return undefined;
  if (input.serverQuestion.mode === "follow_up") return "Following up on something you shared";

  if (!input.profileComplete) {
    const filled = Math.max(0, Math.min(13, Math.round(((input.profileScore ?? 0) / 100) * 13)));
    const remaining = Math.max(1, 13 - filled);
    return remaining <= 2 ? "Just one more thing" : `We're learning about ${getRelationshipPhrase(input.recipient).replace(/^your /, "")}`;
  }

  return "A gentle check-in";
}

export function wasRecentlyAnswered(
  freshUpdates: FreshUpdate[],
  fieldKey: string,
  withinDays = 21,
): boolean {
  return freshUpdates.some(
    (update) => update.questionKey === fieldKey && update.daysAgo <= withinDays,
  );
}

export function pickAffirmation(seed: string): string {
  return pickStableVariant([...AFFIRMATIONS], seed);
}
