import { FiButton } from "@/app/components/button/FiButton";

export interface FiRecipientErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FiRecipientErrorState({ message, onRetry }: FiRecipientErrorStateProps) {
  return (
    <div className="fi-recipient__error" role="alert">
      <h3 className="fi-recipient__section-title">Could not load recipient</h3>
      {message ? <p className="fi-recipient__copy">{message}</p> : null}
      {onRetry ? (
        <FiButton variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </FiButton>
      ) : null}
    </div>
  );
}
