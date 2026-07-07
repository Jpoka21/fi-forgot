import { FiConciergeSuggestionCard } from "@/app/components/concierge-suggestions/FiConciergeSuggestionCard";
import type { FiConciergeSuggestion } from "@/app/concierge-suggestions/conciergeSuggestionsDomain";

export interface FiConciergeSuggestionsListProps {
  suggestions: FiConciergeSuggestion[];
}

export function FiConciergeSuggestionsList({ suggestions }: FiConciergeSuggestionsListProps) {
  return (
    <ul className="fi-concierge-suggestions__list" aria-label="Concierge recommendations">
      {suggestions.map((suggestion, index) => (
        <li key={suggestion.id}>
          <FiConciergeSuggestionCard suggestion={suggestion} index={index} />
        </li>
      ))}
    </ul>
  );
}
