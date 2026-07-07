import { FiButton } from "@/app/components/button/FiButton";

export interface FiCalendarErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function FiCalendarErrorState({ message, onRetry }: FiCalendarErrorStateProps) {
  return (
    <div className="fi-calendar__error" role="alert">
      <h3 className="fi-calendar__month-label">Could not load calendar</h3>
      {message ? <p className="fi-calendar__section-label">{message}</p> : null}
      {onRetry ? (
        <FiButton variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </FiButton>
      ) : null}
    </div>
  );
}
