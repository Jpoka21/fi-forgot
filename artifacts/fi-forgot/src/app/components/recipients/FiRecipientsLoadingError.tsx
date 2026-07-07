import { FiButton } from "@/app/components/button/FiButton";
import { FiRecipientLoadingSkeleton } from "@/app/components/recipient/FiRecipientSkeleton";
import { recipientsListDefaults } from "@/app/recipients/recipientsListDomain";

export function FiRecipientsLoadingState() {
  return <FiRecipientLoadingSkeleton />;
}

export interface FiRecipientsErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FiRecipientsErrorState({
  message = recipientsListDefaults.errorLabel,
  onRetry,
}: FiRecipientsErrorStateProps) {
  return (
    <div className="fi-recipients__no-results" role="alert">
      <p className="fi-recipients__subtitle">{message}</p>
      {onRetry ? (
        <FiButton variant="primary" size="sm" onClick={onRetry}>
          {recipientsListDefaults.retryLabel}
        </FiButton>
      ) : null}
    </div>
  );
}
