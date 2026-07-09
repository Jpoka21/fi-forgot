export { buildConciergeWorkspaceForDisplay, loadLegacyConciergeWorkspace } from "@/app/concierge-brain/buildConciergeWorkspaceForDisplay";
export type {
  BuildConciergeWorkspaceForDisplayDeps,
  BuildConciergeWorkspaceForDisplayOptions,
  ConciergeWorkspaceDisplayModel,
  FetchConciergeWorkspace,
  LoadLegacyConciergeWorkspace,
} from "@/app/concierge-brain/buildConciergeWorkspaceForDisplay";
export { isBrainConciergeEnabled } from "@/app/concierge-brain/conciergeBrainConfig";
export { fetchConciergeWorkspace } from "@/app/concierge-brain/fetchConciergeWorkspace";
export {
  adaptConciergeInsightToRelationshipInsight,
  adaptConciergeRecommendationToFiAiRecommendation,
  adaptConciergeWorkspaceViewModel,
  mapConciergeInsightViewModel,
  mapConciergeRecommendationViewModel,
  mapConciergeWorkspaceViewModel,
} from "@/app/concierge-brain/mapConciergeViewModel";
export type {
  ConciergeInsightViewModel,
  ConciergeRecommendationViewModel,
  ConciergeWorkspaceViewModel,
} from "@/app/concierge-brain/conciergeViewModel";
export {
  CONCIERGE_RECOMMENDATION_KIND_RELATIONSHIP,
  CONCIERGE_WORKSPACE_VERSION,
  type ConciergeInsight,
  type ConciergeRecommendation,
  type ConciergeRecommendationKind,
  type ConciergeWorkspaceResponse,
} from "@/app/concierge-brain/conciergeWorkspaceTypes";
