export {
  aiConfidenceCopy,
  aiConfidenceLabels,
  aiDefaults,
  aiDraftingHeadlines,
  resolveAiConfidenceMessage,
  resolveDraftingHeadline,
} from "@/app/ai/aiDomain";
export type {
  FiAiConfidenceLevel,
  FiAiRecommendation,
  FiAiSuggestion,
} from "@/app/ai/aiDomain";

export {
  loadAiRecommendations,
  mapConciergeSuggestionToRecommendation,
} from "@/app/ai/aiEngine";

export {
  subscribeToAiAnalytics,
  trackAiEvent,
} from "@/app/ai/aiAnalytics";
export type {
  FiAiAnalyticsEvent,
  FiAiAnalyticsPayload,
} from "@/app/ai/aiAnalytics";

export { useAiRecommendations } from "@/app/ai/hooks/useAiRecommendations";
export type {
  AiRecommendationsController,
  UseAiRecommendationsOptions,
} from "@/app/ai/hooks/useAiRecommendations";

export { useAiGeneration } from "@/app/ai/hooks/useAiGeneration";
export type {
  AiGenerationController,
  UseAiGenerationOptions,
} from "@/app/ai/hooks/useAiGeneration";
