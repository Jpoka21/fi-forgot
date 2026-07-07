import { FiAiBadge } from "@/app/components/badge/FiBadge";
import { FiLoadingIndicator } from "@/app/components/feedback/FiLoadingIndicator";
import { aiDefaults } from "@/app/ai/aiDomain";

export interface FiAiGenerationIndicatorProps {
  label?: string;
  showBadge?: boolean;
}

export function FiAiGenerationIndicator({
  label = aiDefaults.generationHeadline,
  showBadge = true,
}: FiAiGenerationIndicatorProps) {
  return (
    <div className="fi-ai__generation-indicator" role="status" aria-live="polite" aria-busy="true">
      {showBadge ? <FiAiBadge showIcon>Concierge</FiAiBadge> : null}
      <FiLoadingIndicator size="sm" label={label} showLabel />
    </div>
  );
}
