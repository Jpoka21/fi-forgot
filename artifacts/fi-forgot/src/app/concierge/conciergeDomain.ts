/**
 * Concierge philosophy domain — playbook-aligned types and defaults.
 * See: 19_CONCIERGE_EXPERIENCE.md, 26_PROACTIVE_CONCIERGE_EXPERIENCE.md, 95_AI_CONCIERGE_BUILD_SPEC.md
 */

export const conciergePhilosophyDefaults = {
  sectionEyebrow: "Your Relationship Concierge",
  silenceIsFeature: "Silence is a feature when nothing would meaningfully improve a relationship.",
  oneQuestionRule: "One question at a time — never a survey.",
  matureHighConfidence:
    "I already know enough to write a wonderful card. I'll check in again when something new would help.",
  matureOccasionReady:
    "I have everything I need for this occasion. I'm preparing the card quietly in the background.",
  oneQuickUpdate: "I only need one quick update to make this card much more personal.",
  relationshipsGetEasier:
    "As I learn someone, questions become rarer and cards become more personal — with less effort from you.",
} as const;

/** Interrupt priority — high may surface; low almost never interrupts */
export type ConciergeInterruptPriority = "high" | "medium" | "low";

export type ConciergeLearningStage =
  | "foundational"
  | "developing"
  | "confident"
  | "mature";

export interface RelationshipConfidenceSnapshot {
  score: number;
  label: string;
  stage: ConciergeLearningStage;
  questionFrequency: "normal" | "reduced" | "minimal";
  cardConfidence: "building" | "good" | "high";
}

export interface OccasionReadinessSnapshot {
  eventLabel: string;
  daysAway: number | null;
  shouldAskOneQuestion: boolean;
  shouldAutoPrepare: boolean;
  reason: string;
}

export interface ConciergeInterruptDecision {
  shouldInterrupt: boolean;
  priority: ConciergeInterruptPriority;
  reason: string;
  valueProposition?: string;
}

export interface FollowUpCandidate {
  fieldKey: string;
  originalAnswer: string;
  daysSinceAnswer: number;
  followUpQuestion: string;
  reason: string;
  priority: ConciergeInterruptPriority;
}

export interface PositiveSurpriseMoment {
  id: string;
  message: string;
  memoryExcerpt: string;
  daysSinceMemory: number;
  /** No action required — display only */
  actionRequired: false;
}

export interface ConciergeOrchestrationInput {
  recipientId: string;
  recipientName: string;
  profileScore: number;
  profileComplete: boolean;
  healthScore: number | null;
  freshUpdateCount: number;
  newestUpdateDaysAgo: number | null;
  cardsApprovedCount: number;
  imminentEventLabel: string | null;
  imminentEventDaysAway: number | null;
  hasServerQuestion: boolean;
  serverQuestionMode?: string;
}

export interface ConciergeOrchestrationResult {
  confidence: RelationshipConfidenceSnapshot;
  occasionReadiness: OccasionReadinessSnapshot | null;
  interrupt: ConciergeInterruptDecision;
  followUp: FollowUpCandidate | null;
  positiveSurprise: PositiveSurpriseMoment | null;
  learningStage: ConciergeLearningStage;
}
