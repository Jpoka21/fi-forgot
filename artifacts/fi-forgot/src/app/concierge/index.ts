export {
  conciergePhilosophyDefaults,
  type ConciergeInterruptDecision,
  type ConciergeInterruptPriority,
  type ConciergeLearningStage,
  type ConciergeOrchestrationInput,
  type ConciergeOrchestrationResult,
  type FollowUpCandidate,
  type OccasionReadinessSnapshot,
  type PositiveSurpriseMoment,
  type RelationshipConfidenceSnapshot,
} from "@/app/concierge/conciergeDomain";

export {
  computeRelationshipConfidence,
  shouldDeferQuestionForConfidence,
} from "@/app/concierge/relationshipConfidenceEngine";

export { evaluateOccasionReadiness } from "@/app/concierge/occasionReadinessEngine";

export {
  filterCandidatesForSurface,
  mapUrgencyToInterruptPriority,
  scoreNotificationCandidate,
  shouldSurfaceNotification,
  type NotificationCandidate,
  type NotificationSurface,
} from "@/app/concierge/notificationPriorityEngine";

export { selectBestFollowUp } from "@/app/concierge/followUpIntelligenceEngine";

export {
  describeLearningTrajectory,
  detectPositiveSurprise,
  type LearningTrajectory,
} from "@/app/concierge/relationshipLearningEngine";

export {
  applyConciergeGates,
  orchestrateConcierge,
  type OrchestratorContext,
} from "@/app/concierge/conciergeOrchestrator";
