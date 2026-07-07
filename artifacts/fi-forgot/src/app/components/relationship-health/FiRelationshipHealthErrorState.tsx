import { FiButton } from "@/app/components/button/FiButton";
import { relationshipHealthUiCopy } from "@/app/components/relationship-health/relationshipHealthDomain";

export interface FiRelationshipHealthErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FiRelationshipHealthErrorState({
  message,
  onRetry,
}: FiRelationshipHealthErrorStateProps) {
  return (
    <div className="fi-relationship-health__error" role="alert">
      <h3 className="fi-relationship-health__section-title">{relationshipHealthUiCopy.errorTitle}</h3>
      {message ? <p className="fi-relationship-health__explanation-copy">{message}</p> : null}
      {onRetry ? (
        <FiButton variant="secondary" size="sm" onClick={onRetry}>
          {relationshipHealthUiCopy.retryLabel}
        </FiButton>
      ) : null}
    </div>
  );
}
