import {
  aiConfidenceLabels,
  resolveAiConfidenceMessage,
  type FiAiConfidenceLevel,
} from "@/app/ai/aiDomain";
import { getFiAiConfidenceClassName } from "@/app/components/ai/aiVariants";
import { aiDefaults } from "@/app/ai/aiDomain";

export interface FiAiConfidenceMessageProps {
  level: FiAiConfidenceLevel;
  title?: string;
  message?: string;
}

export function FiAiConfidenceMessage({
  level,
  title = aiDefaults.confidenceTitle,
  message,
}: FiAiConfidenceMessageProps) {
  const resolvedMessage = message ?? resolveAiConfidenceMessage(level);

  return (
    <div
      className={getFiAiConfidenceClassName(level)}
      role="note"
      aria-label={`${title}: ${aiConfidenceLabels[level]}`}
    >
      <p className="fi-ai__confidence-label">
        {title} — {aiConfidenceLabels[level]}
      </p>
      <p className="fi-ai__copy">{resolvedMessage}</p>
    </div>
  );
}
