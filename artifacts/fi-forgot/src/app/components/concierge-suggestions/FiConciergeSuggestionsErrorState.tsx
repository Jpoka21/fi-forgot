import { FiButton } from "@/app/components/button/FiButton";
import { conciergeSuggestionsUiCopy } from "@/app/components/concierge-suggestions/conciergeSuggestionsDomain";

export interface FiConciergeSuggestionsErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FiConciergeSuggestionsErrorState({
  message,
  onRetry,
}: FiConciergeSuggestionsErrorStateProps) {
  return (
    <div className="fi-concierge-suggestions__error" role="alert">
      <h3 className="fi-concierge-suggestion-card__title">{conciergeSuggestionsUiCopy.errorTitle}</h3>
      {message ? <p className="fi-concierge-suggestion-card__description">{message}</p> : null}
      {onRetry ? (
        <FiButton variant="secondary" size="sm" onClick={onRetry}>
          {conciergeSuggestionsUiCopy.retryLabel}
        </FiButton>
      ) : null}
    </div>
  );
}
