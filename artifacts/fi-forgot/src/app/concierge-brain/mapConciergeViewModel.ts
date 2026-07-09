import type { ConciergeRelationshipInsight } from "@/app/ai-concierge/aiConciergeDomain";
import type { FiAiRecommendation } from "@/app/ai/aiDomain";
import type {
  ConciergeInsight,
  ConciergeRecommendation,
  ConciergeWorkspaceResponse,
} from "@/app/concierge-brain/conciergeWorkspaceTypes";
import type {
  ConciergeInsightViewModel,
  ConciergeRecommendationViewModel,
  ConciergeWorkspaceViewModel,
} from "@/app/concierge-brain/conciergeViewModel";

export function mapConciergeRecommendationViewModel(
  recommendation: ConciergeRecommendation,
): ConciergeRecommendationViewModel {
  return {
    id: recommendation.id,
    recipientId: recommendation.recipientId,
    recipientName: recommendation.recipientName,
    title: recommendation.title,
    body: recommendation.body,
    href: recommendation.href,
    actionLabel: recommendation.actionLabel,
    priority: recommendation.priority,
    kind: recommendation.kind,
  };
}

export function mapConciergeInsightViewModel(insight: ConciergeInsight): ConciergeInsightViewModel {
  return {
    id: insight.id,
    recipientId: insight.recipientId,
    recipientName: insight.recipientName,
    title: insight.title,
    body: insight.body,
    href: insight.href,
  };
}

export function mapConciergeWorkspaceViewModel(
  response: ConciergeWorkspaceResponse,
): ConciergeWorkspaceViewModel {
  return {
    recommendations: response.recommendations.map(mapConciergeRecommendationViewModel),
    insights: response.insights.map(mapConciergeInsightViewModel),
  };
}

export function adaptConciergeRecommendationToFiAiRecommendation(
  viewModel: ConciergeRecommendationViewModel,
): FiAiRecommendation {
  return {
    id: viewModel.id,
    title: viewModel.title,
    description: viewModel.body,
    href: viewModel.href,
    actionLabel: viewModel.actionLabel,
    confidence: viewModel.priority,
    recipientName: viewModel.recipientName,
    sourceType: viewModel.kind,
  };
}

export function adaptConciergeInsightToRelationshipInsight(
  viewModel: ConciergeInsightViewModel,
): ConciergeRelationshipInsight {
  return {
    id: viewModel.id,
    title: viewModel.title,
    description: viewModel.body,
    href: viewModel.href,
    recipientName: viewModel.recipientName,
  };
}

export function adaptConciergeWorkspaceViewModel(
  viewModel: ConciergeWorkspaceViewModel,
): {
  recommendations: FiAiRecommendation[];
  insights: ConciergeRelationshipInsight[];
} {
  return {
    recommendations: viewModel.recommendations.map(adaptConciergeRecommendationToFiAiRecommendation),
    insights: viewModel.insights.map(adaptConciergeInsightToRelationshipInsight),
  };
}
