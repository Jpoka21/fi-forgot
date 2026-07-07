import { cn } from "@/lib/utils";
import { FiButton } from "@/app/components/button/FiButton";
import { buildAiRegionLabel } from "@/app/components/ai/accessibility";
import { FiAiDraftingProgress } from "@/app/components/ai/FiAiDraftingProgress";
import { FiAiGenerationIndicator } from "@/app/components/ai/FiAiGenerationIndicator";
import { FiAiPanelEmptyState } from "@/app/components/ai/FiAiPanelEmptyState";
import { FiAiPanelLoadingSkeleton } from "@/app/components/ai/FiAiPanelLoadingSkeleton";
import { FiAiRetryExperience } from "@/app/components/ai/FiAiRetryExperience";
import { FiAiSuggestionList } from "@/app/components/ai/FiAiSuggestionList";
import { getFiAiContainerClassName } from "@/app/components/ai/aiVariants";
import { useAiRecommendations } from "@/app/ai/hooks/useAiRecommendations";
import { aiDefaults } from "@/app/ai/aiDomain";
import type { FiAiGenerationStepId } from "@/app/components/progress/progressDomain";

export interface FiAiPanelProps {
  className?: string;
  onAddPerson?: () => void;
  isGenerating?: boolean;
  generationStepId?: FiAiGenerationStepId;
  generationStepIndex?: number;
  generationError?: string | null;
  onRetryGeneration?: () => void;
}

export function FiAiPanel({
  className,
  onAddPerson,
  isGenerating = false,
  generationStepId,
  generationStepIndex = 0,
  generationError,
  onRetryGeneration,
}: FiAiPanelProps) {
  const aiState = useAiRecommendations();

  const statusMessage = isGenerating
    ? aiDefaults.generationHeadline
    : aiState.isLoading
      ? "Loading concierge intelligence"
      : aiState.isRefreshing
        ? "Refreshing concierge intelligence"
        : aiState.showEmpty
          ? "No concierge recommendations"
          : `${aiState.recommendations.length} concierge recommendations`;

  return (
    <section
      className={cn(getFiAiContainerClassName(className))}
      aria-label={buildAiRegionLabel(aiState.recommendations.length, isGenerating)}
    >
      <header className="fi-ai__header">
        <h2 className="fi-ai__title">{aiDefaults.title}</h2>
        <p className="fi-ai__description">{aiDefaults.description}</p>
      </header>

      <div className="fi-ai__toolbar">
        {isGenerating ? <FiAiGenerationIndicator /> : null}
        <FiButton
          variant="ghost"
          size="sm"
          loading={aiState.isRefreshing}
          disabled={isGenerating}
          onClick={() => void aiState.refresh({ silent: true })}
        >
          {aiDefaults.refreshLabel}
        </FiButton>
      </div>

      <p className="fi-ai__status" aria-live="polite">
        {statusMessage}
      </p>

      {generationError ? (
        <FiAiRetryExperience onRetry={onRetryGeneration} />
      ) : null}

      {aiState.error && !generationError ? (
        <FiAiRetryExperience
          title={aiDefaults.errorLabel}
          description="Try refreshing concierge intelligence."
          retryLabel={aiDefaults.refreshLabel}
          onRetry={() => void aiState.refresh()}
        />
      ) : null}

      {isGenerating ? (
        <FiAiDraftingProgress stepId={generationStepId} stepIndex={generationStepIndex} />
      ) : null}

      {aiState.isLoading ? <FiAiPanelLoadingSkeleton /> : null}

      {aiState.showEmpty && !aiState.error && !aiState.isLoading && !isGenerating ? (
        <FiAiPanelEmptyState onAddPerson={onAddPerson} />
      ) : null}

      {!aiState.isLoading
        && !aiState.error
        && !aiState.showEmpty
        && !isGenerating ? (
        <FiAiSuggestionList suggestions={aiState.recommendations} />
      ) : null}
    </section>
  );
}
