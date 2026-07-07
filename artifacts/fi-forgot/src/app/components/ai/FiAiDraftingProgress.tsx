import { cn } from "@/lib/utils";
import { FiAiGenerationProgress } from "@/app/components/progress/FiStepProgress";
import type { FiAiGenerationStepId } from "@/app/components/progress/progressDomain";
import { aiDefaults, resolveDraftingHeadline } from "@/app/ai/aiDomain";
import { getFiAiDraftingClassName } from "@/app/components/ai/aiVariants";

export interface FiAiDraftingProgressProps {
  stepId?: FiAiGenerationStepId;
  stepIndex?: number;
  headline?: string;
  supportText?: string;
  className?: string;
}

export function FiAiDraftingProgress({
  stepId,
  stepIndex = 0,
  headline,
  supportText = aiDefaults.generationSupport,
  className,
}: FiAiDraftingProgressProps) {
  const resolvedHeadline = headline ?? resolveDraftingHeadline(stepIndex);

  return (
    <div
      className={cn(getFiAiDraftingClassName(className))}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={aiDefaults.generationHeadline}
    >
      <h3 className="fi-ai__drafting-headline">{resolvedHeadline}</h3>
      <p className="fi-ai__drafting-support">{supportText}</p>
      <FiAiGenerationProgress stepId={stepId} stepIndex={stepIndex} showLinearBar={false} />
    </div>
  );
}
