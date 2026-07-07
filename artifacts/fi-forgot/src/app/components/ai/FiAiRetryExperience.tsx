import { FiButton } from "@/app/components/button/FiButton";
import { aiDefaults } from "@/app/ai/aiDomain";

export interface FiAiRetryExperienceProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
}

export function FiAiRetryExperience({
  title = aiDefaults.retryTitle,
  description = aiDefaults.retryDescription,
  retryLabel = aiDefaults.retryLabel,
  onRetry,
}: FiAiRetryExperienceProps) {
  return (
    <div className="fi-ai__retry" role="alert">
      <h3 className="fi-ai__retry-title">{title}</h3>
      <p className="fi-ai__copy">{description}</p>
      {onRetry ? (
        <FiButton variant="primary" size="sm" onClick={onRetry}>
          {retryLabel}
        </FiButton>
      ) : null}
    </div>
  );
}
