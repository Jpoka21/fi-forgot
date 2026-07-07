import { FiPriorityBadge } from "@/app/components/badge/FiBadge";
import type { FiPriorityLevel } from "@/app/components/badge/badgeDomain";
import { FiButton } from "@/app/components/button/FiButton";
import { FiAiRecommendationCard } from "@/app/components/card/FiCard";
import { getFiConciergeSuggestionCardClassName } from "@/app/components/concierge-suggestions/conciergeSuggestionsVariants";
import { trackConciergeSuggestionsEvent } from "@/app/concierge-suggestions/conciergeSuggestionsAnalytics";
import { resolveConciergeActionLabel } from "@/app/concierge-suggestions/conciergeSuggestionsDomain";
import type { FiConciergeSuggestion } from "@/app/concierge-suggestions/conciergeSuggestionsDomain";

export interface FiConciergeSuggestionCardProps {
  suggestion: FiConciergeSuggestion;
  index?: number;
}

function urgencyToPriority(urgency: FiConciergeSuggestion["urgency"]): FiPriorityLevel {
  return urgency;
}

export function FiConciergeSuggestionCard({ suggestion, index = 0 }: FiConciergeSuggestionCardProps) {
  const actionLabel = resolveConciergeActionLabel(suggestion);
  const contextLine =
    suggestion.daysUntil != null
      ? `${suggestion.daysUntil === 0 ? "Today" : suggestion.daysUntil === 1 ? "Tomorrow" : `In ${suggestion.daysUntil} days`}`
      : suggestion.recipientName
        ? `For ${suggestion.recipientName}`
        : null;

  return (
    <FiAiRecommendationCard className={getFiConciergeSuggestionCardClassName({ index })}>
      <div className="fi-concierge-suggestion-card__body">
        <div className="fi-concierge-suggestion-card__meta">
          <FiPriorityBadge level={urgencyToPriority(suggestion.urgency)} />
        </div>
        <h3 className="fi-concierge-suggestion-card__title">{suggestion.title}</h3>
        <p className="fi-concierge-suggestion-card__description">{suggestion.description}</p>
        <div className="fi-concierge-suggestion-card__footer">
          {contextLine ? <p className="fi-concierge-suggestion-card__context">{contextLine}</p> : <span />}
          <FiButton asChild variant="secondary" size="sm">
            <a
              href={suggestion.href}
              onClick={() =>
                trackConciergeSuggestionsEvent("concierge_suggestion_selected", {
                  suggestionId: suggestion.id,
                  suggestionType: suggestion.type,
                })
              }
            >
              {actionLabel}
            </a>
          </FiButton>
        </div>
      </div>
    </FiAiRecommendationCard>
  );
}
