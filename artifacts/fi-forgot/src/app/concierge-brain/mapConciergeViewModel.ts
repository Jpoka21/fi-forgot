import type { ConciergeRelationshipInsight } from "@/app/ai-concierge/aiConciergeDomain";
import type { FiAiRecommendation } from "@/app/ai/aiDomain";
import type {
  ConciergeInsight,
  ConciergeRecommendation,
  ConciergeWorkspaceResponse,
  RelationshipOpportunity,
} from "@/app/concierge-brain/conciergeWorkspaceTypes";
import type {
  ConciergeInsightViewModel,
  ConciergeRecommendationViewModel,
  ConciergeWorkspaceViewModel,
  RelationshipOpportunityViewModel,
} from "@/app/concierge-brain/conciergeViewModel";

export function mapRelationshipOpportunityViewModel(
  opportunity: RelationshipOpportunity,
): RelationshipOpportunityViewModel {
  return {
    ...opportunity,
    recipient: { ...opportunity.recipient },
    relationshipIdentityProvenance: opportunity.relationshipIdentityProvenance
      ? { ...opportunity.relationshipIdentityProvenance }
      : null,
    confidence: { ...opportunity.confidence },
    provenance: {
      ...opportunity.provenance,
      evidence: opportunity.provenance.evidence.map((item) => ({ ...item })),
    },
    timing: {
      ...opportunity.timing,
      ...(opportunity.timing.temporal ? {
        temporal: {
          ...opportunity.timing.temporal,
          evidence: { ...opportunity.timing.temporal.evidence },
          preparationWindow: opportunity.timing.temporal.preparationWindow ? { ...opportunity.timing.temporal.preparationWindow } : null,
          history: opportunity.timing.temporal.history.map((item) => ({ ...item, evidence: { ...item.evidence } })),
        },
      } : {}),
    },
    presentation: { ...opportunity.presentation },
    restraint: { ...opportunity.restraint },
    recommendation: opportunity.recommendation ? { ...opportunity.recommendation } : null,
    feedback: opportunity.feedback ? { history: opportunity.feedback.history.map(item => ({ ...item })), active: opportunity.feedback.active.map(item => ({ ...item })), available: opportunity.feedback.available } : { history: [], active: [], available: true },
  };
}

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
    opportunities: response.opportunities.map(mapRelationshipOpportunityViewModel),
    recommendations: response.recommendations.map(mapConciergeRecommendationViewModel),
    insights: response.insights.map(mapConciergeInsightViewModel),
    feedbackHistory: response.opportunities.flatMap(item => item.feedback?.history ?? []).filter((item, index, all) => all.findIndex(candidate => candidate.id === item.id) === index).map(item => ({ ...item })),
    feedbackAvailable: response.opportunities.every(item => item.feedback?.available ?? true),
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
    // Compatibility projection cannot express numeric/unknown Brain confidence.
    // Never relabel action priority as confidence.
    confidence: undefined as never,
    recipientName: viewModel.recipientName,
    sourceType: viewModel.kind,
  };
}

export function adaptConciergeInsightToRelationshipInsight(
  viewModel: ConciergeInsightViewModel,
): ConciergeRelationshipInsight {
  return {
    id: viewModel.id,
    recipientId: viewModel.recipientId,
    title: viewModel.title,
    description: viewModel.body,
    href: viewModel.href,
    recipientName: viewModel.recipientName,
  };
}

export function adaptConciergeWorkspaceViewModel(
  viewModel: ConciergeWorkspaceViewModel,
): {
  opportunities: RelationshipOpportunityViewModel[];
  recommendations: FiAiRecommendation[];
  insights: ConciergeRelationshipInsight[];
  feedbackHistory: import("./conciergeWorkspaceTypes").OpportunityFeedbackEvent[];
  feedbackAvailable: boolean;
} {
  return {
    opportunities: viewModel.opportunities,
    recommendations: viewModel.recommendations.map(adaptConciergeRecommendationToFiAiRecommendation),
    insights: viewModel.insights.map(adaptConciergeInsightToRelationshipInsight),
    feedbackHistory: viewModel.feedbackHistory,
    feedbackAvailable: viewModel.feedbackAvailable,
  };
}
