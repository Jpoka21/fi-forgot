import type { FiAiSuggestion } from "@/app/ai/aiDomain";
import { FiAiRecommendationPanelCard } from "@/app/components/ai/FiAiRecommendationPanelCard";

export interface FiAiSuggestionListProps {
  suggestions: FiAiSuggestion[];
}

export function FiAiSuggestionList({ suggestions }: FiAiSuggestionListProps) {
  return (
    <ul className="fi-ai__list" aria-label="Concierge suggestions">
      {suggestions.map((suggestion, index) => (
        <li key={suggestion.id} className="fi-ai__list-item">
          <FiAiRecommendationPanelCard recommendation={suggestion} index={index} />
        </li>
      ))}
    </ul>
  );
}
