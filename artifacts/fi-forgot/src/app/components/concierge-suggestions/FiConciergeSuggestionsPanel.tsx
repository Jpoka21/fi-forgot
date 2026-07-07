import { cn } from "@/lib/utils";
import { FiButton } from "@/app/components/button/FiButton";
import { buildConciergeSuggestionsRegionLabel } from "@/app/components/concierge-suggestions/accessibility";
import { FiConciergeSuggestionsEmptyState } from "@/app/components/concierge-suggestions/FiConciergeSuggestionsEmptyState";
import { FiConciergeSuggestionsErrorState } from "@/app/components/concierge-suggestions/FiConciergeSuggestionsErrorState";
import { FiConciergeSuggestionsList } from "@/app/components/concierge-suggestions/FiConciergeSuggestionsList";
import { FiConciergeSuggestionsSkeleton } from "@/app/components/concierge-suggestions/FiConciergeSuggestionsSkeleton";
import { getFiConciergeSuggestionsContainerClassName } from "@/app/components/concierge-suggestions/conciergeSuggestionsVariants";
import { useConciergeSuggestions } from "@/app/concierge-suggestions/hooks/useConciergeSuggestions";
import { conciergeSuggestionsDefaults } from "@/app/concierge-suggestions/conciergeSuggestionsDomain";

export interface FiConciergeSuggestionsPanelProps {
  className?: string;
  onAddPerson?: () => void;
}

export function FiConciergeSuggestionsPanel({
  className,
  onAddPerson,
}: FiConciergeSuggestionsPanelProps) {
  const suggestionsState = useConciergeSuggestions();

  const statusMessage = suggestionsState.isLoading
    ? "Loading concierge suggestions"
    : suggestionsState.isRefreshing
      ? "Refreshing concierge suggestions"
      : suggestionsState.showEmpty
        ? "No concierge suggestions"
        : `${suggestionsState.suggestions.length} concierge suggestions`;

  return (
    <section
      className={cn(getFiConciergeSuggestionsContainerClassName(className))}
      aria-label={buildConciergeSuggestionsRegionLabel(suggestionsState.suggestions.length)}
    >
      <header className="fi-concierge-suggestions__header">
        <h2 className="fi-concierge-suggestions__title">{conciergeSuggestionsDefaults.title}</h2>
        <p className="fi-concierge-suggestions__description">{conciergeSuggestionsDefaults.description}</p>
      </header>

      <div className="fi-concierge-suggestions__toolbar">
        <FiButton
          variant="ghost"
          size="sm"
          loading={suggestionsState.isRefreshing}
          onClick={() => void suggestionsState.refresh({ silent: true })}
        >
          {conciergeSuggestionsDefaults.refreshLabel}
        </FiButton>
      </div>

      <p className="fi-concierge-suggestions__status" aria-live="polite">
        {statusMessage}
      </p>

      {suggestionsState.error ? (
        <FiConciergeSuggestionsErrorState
          message={suggestionsState.error}
          onRetry={() => void suggestionsState.refresh()}
        />
      ) : null}

      {suggestionsState.isLoading ? <FiConciergeSuggestionsSkeleton /> : null}

      {suggestionsState.showEmpty && !suggestionsState.error && !suggestionsState.isLoading ? (
        <FiConciergeSuggestionsEmptyState onAddPerson={onAddPerson} />
      ) : null}

      {!suggestionsState.isLoading
        && !suggestionsState.error
        && !suggestionsState.showEmpty ? (
        <FiConciergeSuggestionsList suggestions={suggestionsState.suggestions} />
      ) : null}
    </section>
  );
}
