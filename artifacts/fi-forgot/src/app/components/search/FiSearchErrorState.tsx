import { FiButton } from "@/app/components/button/FiButton";
import { searchDefaults } from "@/app/search/searchDomain";
import { searchUiDefaults } from "@/app/components/search/searchDomain";

export interface FiSearchErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function FiSearchErrorState({
  title = searchDefaults.errorLabel,
  description = "Try again in a moment.",
  onRetry,
}: FiSearchErrorStateProps) {
  return (
    <div className="fi-search-error-state" role="alert">
      <h3 className="fi-search-error-state__title">{title}</h3>
      <p className="fi-search-error-state__description">{description}</p>
      {onRetry ? (
        <FiButton variant="secondary" onClick={onRetry}>
          {searchUiDefaults.retryLabel}
        </FiButton>
      ) : null}
    </div>
  );
}
