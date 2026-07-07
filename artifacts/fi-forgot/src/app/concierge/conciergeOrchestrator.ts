import type { CardOrder, Recipient } from "@/lib/data";
import type {
  FreshUpdate,
  HealthScore,
  TrackedEventData,
} from "@/app/relationship-profile/relationshipProfileDomain";
import type { ConciergeOrchestrationResult } from "@/app/concierge/conciergeDomain";
import { evaluateOccasionReadiness } from "@/app/concierge/occasionReadinessEngine";
import { selectBestFollowUp } from "@/app/concierge/followUpIntelligenceEngine";
import {
  computeRelationshipConfidence,
  shouldDeferQuestionForConfidence,
} from "@/app/concierge/relationshipConfidenceEngine";
import {
  describeLearningTrajectory,
  detectPositiveSurprise,
} from "@/app/concierge/relationshipLearningEngine";
import { getRelationshipPhrase } from "@/app/question-intelligence/questionIntelligenceDomain";
import type { ConciergeExpectedValue } from "@/app/question-intelligence/questionIntelligenceDomain";

const MAILED_STATUSES = new Set<CardOrder["status"]>([
  "Approved",
  "Mailed to me",
  "Mailed to her",
  "Delivered",
  "Given",
]);

export interface OrchestratorContext {
  recipient: Recipient;
  freshUpdates: FreshUpdate[];
  healthScore: HealthScore | null;
  upcomingEvents: TrackedEventData[];
  profileComplete: boolean;
  profileScore?: number;
  cards: CardOrder[];
}

function countApprovedCards(cards: CardOrder[]): number {
  return cards.filter((card) => MAILED_STATUSES.has(card.status)).length;
}

function newestUpdateDaysAgo(freshUpdates: FreshUpdate[]): number | null {
  if (freshUpdates.length === 0) return null;
  return Math.min(...freshUpdates.map((u) => u.daysAgo));
}

function findImminentEvent(events: TrackedEventData[]): TrackedEventData | null {
  return (
    events.find((event) => event.daysAway !== null && event.daysAway <= 45) ?? null
  );
}

/**
 * Central concierge orchestration — composes all engines for a recipient context.
 */
export function orchestrateConcierge(context: OrchestratorContext): ConciergeOrchestrationResult {
  const profileScore = context.profileScore ?? 0;
  const healthNumeric = context.healthScore?.score ?? null;
  const newestDays = newestUpdateDaysAgo(context.freshUpdates);
  const cardsApproved = countApprovedCards(context.cards);

  const confidence = computeRelationshipConfidence({
    profileScore,
    healthScore: healthNumeric,
    freshUpdateCount: context.freshUpdates.length,
    newestUpdateDaysAgo: newestDays,
    cardsApprovedCount: cardsApproved,
    profileComplete: context.profileComplete,
  });

  const imminent = findImminentEvent(context.upcomingEvents);
  const occasionReadiness = imminent
    ? evaluateOccasionReadiness({
        eventLabel: imminent.event,
        daysAway: imminent.daysAway,
        relationshipConfidence: confidence.score,
        hasRecentUpdate: newestDays !== null && newestDays <= 30,
      })
    : null;

  const phrase = getRelationshipPhrase(context.recipient);
  const followUp = selectBestFollowUp({
    freshUpdates: context.freshUpdates,
    relationshipPhrase: phrase,
    relationshipConfidence: confidence.score,
  });

  const positiveSurprise = detectPositiveSurprise(
    context.recipient.id,
    context.recipient.name,
    context.freshUpdates,
  );

  const learning = describeLearningTrajectory(confidence);

  let shouldInterrupt = true;
  let interruptReason = learning.detail;

  if (occasionReadiness?.shouldAutoPrepare && !occasionReadiness.shouldAskOneQuestion) {
    shouldInterrupt = false;
    interruptReason = occasionReadiness.reason;
  }

  if (confidence.questionFrequency === "minimal") {
    shouldInterrupt = false;
    interruptReason = learning.headline;
  }

  return {
    confidence,
    occasionReadiness,
    interrupt: {
      shouldInterrupt,
      priority: occasionReadiness?.shouldAskOneQuestion ? "high" : "medium",
      reason: interruptReason,
      valueProposition: learning.detail,
    },
    followUp,
    positiveSurprise,
    learningStage: confidence.stage,
  };
}

/** Apply orchestration gates to a selected question's expected value */
export function applyConciergeGates(
  orchestration: ConciergeOrchestrationResult,
  expectedValue: ConciergeExpectedValue,
  forceAsk?: boolean,
): { shouldAskNow: boolean; maturityMessage?: string; enhancedReason?: string } {
  if (forceAsk) {
    return { shouldAskNow: true };
  }

  if (
    orchestration.occasionReadiness?.shouldAutoPrepare
    && !orchestration.occasionReadiness.shouldAskOneQuestion
    && expectedValue !== "high"
  ) {
    return {
      shouldAskNow: false,
      maturityMessage: orchestration.occasionReadiness.reason,
    };
  }

  if (shouldDeferQuestionForConfidence(orchestration.confidence, expectedValue)) {
    const trajectory = describeLearningTrajectory(orchestration.confidence);
    return {
      shouldAskNow: false,
      maturityMessage: trajectory.headline + " " + trajectory.detail,
    };
  }

  if (!orchestration.interrupt.shouldInterrupt && expectedValue === "low") {
    return {
      shouldAskNow: false,
      maturityMessage: orchestration.interrupt.reason,
    };
  }

  const enhancedReason =
    orchestration.confidence.score >= 70
      ? undefined
      : "I only need one recent detail to make the next card much more personal.";

  return { shouldAskNow: true, enhancedReason };
}
