import { FiAiBadge } from "@/app/components/badge/FiBadge";
import { FiButton } from "@/app/components/button/FiButton";
import { FiAiRecommendationCard } from "@/app/components/card/FiCard";
import { FiAiConfidenceMessage } from "@/app/components/ai/FiAiConfidenceMessage";
import { getFiAiRecommendationCardClassName } from "@/app/components/ai/aiVariants";
import { trackAiEvent } from "@/app/ai/aiAnalytics";
import type { FiAiRecommendation } from "@/app/ai/aiDomain";

export interface FiAiRecommendationPanelCardProps {
  recommendation: FiAiRecommendation;
  index?: number;
}

export function FiAiRecommendationPanelCard({
  recommendation,
  index = 0,
}: FiAiRecommendationPanelCardProps) {
  const contextLine =
    recommendation.daysUntil != null
      ? recommendation.daysUntil === 0
        ? "Today"
        : recommendation.daysUntil === 1
          ? "Tomorrow"
          : `In ${recommendation.daysUntil} days`
      : recommendation.recipientName
        ? `For ${recommendation.recipientName}`
        : null;

  return (
    <FiAiRecommendationCard className={getFiAiRecommendationCardClassName({ index })}>
      <div className="fi-ai__recommendation-body">
        <div className="fi-ai__recommendation-meta">
          <FiAiBadge showIcon>Concierge</FiAiBadge>
        </div>
        <h3 className="fi-ai__recommendation-title">{recommendation.title}</h3>
        <p className="fi-ai__recommendation-description">{recommendation.description}</p>
        <FiAiConfidenceMessage level={recommendation.confidence} title="Recommendation confidence" />
        <div className="fi-ai__recommendation-footer">
          {contextLine ? <p className="fi-ai__context">{contextLine}</p> : <span />}
          <FiButton asChild variant="secondary" size="sm">
            <a
              href={recommendation.href}
              onClick={() =>
                trackAiEvent("ai_recommendation_selected", {
                  recommendationId: recommendation.id,
                  sourceType: recommendation.sourceType,
                })
              }
            >
              {recommendation.actionLabel}
            </a>
          </FiButton>
        </div>
      </div>
    </FiAiRecommendationCard>
  );
}
