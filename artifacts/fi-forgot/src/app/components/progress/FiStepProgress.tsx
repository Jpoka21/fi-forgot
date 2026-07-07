import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";
import {
  buildStepProgressAriaLabel,
} from "@/app/components/progress/accessibility";
import {
  aiGenerationSteps,
  getAiGenerationProgressValue,
  resolveAiGenerationStepIndex,
  type FiAiGenerationStepId,
  type FiStepProgressVariant,
} from "@/app/components/progress/progressDomain";
import { getFiStepProgressClassName } from "@/app/components/progress/progressVariants";
import { FiLinearProgress } from "@/app/components/progress/FiLinearProgress";

export interface FiStepProgressStep {
  id: string;
  label: string;
}

export interface FiStepProgressProps extends HTMLAttributes<HTMLDivElement> {
  steps: readonly FiStepProgressStep[];
  currentIndex?: number;
  currentStepId?: string;
  variant?: FiStepProgressVariant;
  showCurrentLabel?: boolean;
  showStepList?: boolean;
}

export const FiStepProgress = forwardRef<HTMLDivElement, FiStepProgressProps>(
  (
    {
      steps,
      currentIndex = 0,
      currentStepId,
      variant = "segments",
      showCurrentLabel = true,
      showStepList = false,
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const resolvedIndex = currentStepId
      ? Math.max(steps.findIndex((step) => step.id === currentStepId), 0)
      : Math.min(Math.max(currentIndex, 0), Math.max(steps.length - 1, 0));

    const currentLabel = steps[resolvedIndex]?.label ?? "";

    return (
      <div
        ref={ref}
        className={cn(getFiStepProgressClassName({ variant }), className)}
        aria-label={ariaLabel ?? buildStepProgressAriaLabel(steps, resolvedIndex)}
        {...props}
      >
        <div className="fi-step-progress__track" aria-hidden>
          {steps.map((step, index) => {
            const state =
              index < resolvedIndex
                ? "complete"
                : index === resolvedIndex
                  ? "current"
                  : "upcoming";

            return (
              <div
                key={step.id}
                className={cn(
                  "fi-step-progress__segment",
                  `fi-step-progress__segment--${state}`,
                )}
              />
            );
          })}
        </div>

        {showCurrentLabel && currentLabel ? (
          <p className="fi-step-progress__label">{currentLabel}</p>
        ) : null}

        {showStepList ? (
          <div className="fi-step-progress__steps" aria-hidden>
            {steps.map((step, index) => {
              const state =
                index < resolvedIndex
                  ? "complete"
                  : index === resolvedIndex
                    ? "current"
                    : "upcoming";

              return (
                <div
                  key={step.id}
                  className={cn("fi-step-progress__step", `fi-step-progress__step--${state}`)}
                >
                  <span className="fi-step-progress__step-marker" />
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  },
);

FiStepProgress.displayName = "FiStepProgress";

export interface FiAiGenerationProgressProps extends Omit<FiStepProgressProps, "steps"> {
  stepId?: FiAiGenerationStepId;
  stepIndex?: number;
  showLinearBar?: boolean;
}

export const FiAiGenerationProgress = forwardRef<HTMLDivElement, FiAiGenerationProgressProps>(
  (
    {
      stepId,
      stepIndex,
      showLinearBar = true,
      showStepList = true,
      className,
      ...props
    },
    ref,
  ) => {
    const resolvedIndex = resolveAiGenerationStepIndex(stepId, stepIndex);
    const progressValue = getAiGenerationProgressValue(resolvedIndex);

    return (
      <div ref={ref} className={cn("fi-ai-generation-progress", className)}>
        {showLinearBar ? (
          <FiLinearProgress
            tone="ai"
            value={progressValue}
            aria-label="AI draft generation progress"
            className="fi-ai-generation-progress__bar"
          />
        ) : null}
        <FiStepProgress
          steps={aiGenerationSteps}
          currentIndex={resolvedIndex}
          variant="segments"
          showStepList={showStepList}
          aria-label="Concierge draft generation steps"
          {...props}
        />
      </div>
    );
  },
);

FiAiGenerationProgress.displayName = "FiAiGenerationProgress";
