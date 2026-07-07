import { FiButton } from "@/app/components/button/FiButton";
import { browniePointsUiCopy } from "@/app/components/brownie-points/browniePointsDomain";

export interface FiBrowniePointsErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FiBrowniePointsErrorState({ message, onRetry }: FiBrowniePointsErrorStateProps) {
  return (
    <div className="fi-brownie-points__error" role="alert">
      <h3 className="fi-brownie-points__section-title">{browniePointsUiCopy.errorTitle}</h3>
      {message ? <p className="fi-brownie-points__milestone-copy">{message}</p> : null}
      {onRetry ? (
        <FiButton variant="secondary" size="sm" onClick={onRetry}>
          {browniePointsUiCopy.retryLabel}
        </FiButton>
      ) : null}
    </div>
  );
}
