export {
  normalizeRecipientHealthScore,
  relationshipHealthDefaults,
} from "@/app/relationship-health/relationshipHealthDomain";
export type {
  FiRecipientHealthApiResponse,
  FiRecipientHealthScore,
} from "@/app/relationship-health/relationshipHealthDomain";

export {
  buildImprovementSuggestions,
  fetchRecipientHealthScores,
  loadClientOverallHealth,
  loadClientRecipientHealth,
  loadScoreTrend,
  resolveTrendDirection,
} from "@/app/relationship-health/relationshipHealthEngine";

export {
  subscribeToRelationshipHealthAnalytics,
  trackRelationshipHealthEvent,
} from "@/app/relationship-health/relationshipHealthAnalytics";
export type {
  FiRelationshipHealthAnalyticsEvent,
  FiRelationshipHealthAnalyticsPayload,
} from "@/app/relationship-health/relationshipHealthAnalytics";

export {
  useRecipientRelationshipHealth,
  useRelationshipHealth,
} from "@/app/relationship-health/hooks/useRelationshipHealth";
export type {
  RecipientRelationshipHealthController,
  RelationshipHealthController,
  UseRecipientRelationshipHealthOptions,
  UseRelationshipHealthOptions,
} from "@/app/relationship-health/hooks/useRelationshipHealth";
