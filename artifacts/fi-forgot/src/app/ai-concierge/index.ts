export {
  aiConciergeDefaults,
  conciergeMessageRoles,
  conciergePageSections,
  conciergeQuickLinks,
  suggestedConversations,
  CONCIERGE_API_INTEGRATION_POINTS,
} from "@/app/ai-concierge/aiConciergeDomain";
export type {
  ConciergeMemorySnippet,
  ConciergeMessage,
  ConciergeMessageRole,
  ConciergePageSection,
  ConciergeRelationshipInsight,
  ConciergeSuggestedAction,
  ConciergeSuggestedConversation,
} from "@/app/ai-concierge/aiConciergeDomain";

export {
  buildMemorySnippets,
  buildRelationshipInsights,
  getSuggestedConversations,
  resolveConciergeResponse,
  streamConciergeText,
} from "@/app/ai-concierge/aiConciergeEngine";

export {
  clearConversationHistory,
  loadConversationHistory,
  saveConversationHistory,
} from "@/app/ai-concierge/conversationStorage";

export { trackConciergeEvent } from "@/app/ai-concierge/aiConciergeAnalytics";
export type {
  FiConciergeAnalyticsEvent,
  FiConciergeAnalyticsPayload,
} from "@/app/ai-concierge/aiConciergeAnalytics";

export { useAiConciergeWorkspace } from "@/app/ai-concierge/hooks/useAiConciergeWorkspace";
export type { AiConciergeWorkspaceController } from "@/app/ai-concierge/hooks/useAiConciergeWorkspace";

export { useConciergeConversation } from "@/app/ai-concierge/hooks/useConciergeConversation";
export type { ConciergeConversationController } from "@/app/ai-concierge/hooks/useConciergeConversation";
