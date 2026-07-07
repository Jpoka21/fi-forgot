import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";
import { FiCircularProgress } from "@/app/components/progress/FiCircularProgress";
import { FiLinearProgress } from "@/app/components/progress/FiLinearProgress";
import {
  type FiCompletionVariant,
  type FiProgressSize,
  type FiProgressTone,
} from "@/app/components/progress/progressDomain";

export interface FiCompletionProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: FiCompletionVariant;
  size?: FiProgressSize;
  tone?: FiProgressTone;
  label?: string;
  message?: string;
  showValue?: boolean;
}

export const FiCompletionProgress = forwardRef<HTMLDivElement, FiCompletionProgressProps>(
  (
    {
      value,
      max = 100,
      variant = "linear",
      size = "md",
      tone = "health",
      label,
      message,
      showValue = false,
      className,
      ...props
    },
    ref,
  ) => {
    const resolvedMessage =
      message ?? "Every detail helps your concierge understand this relationship better.";

    return (
      <div ref={ref} className={cn("fi-completion-progress", className)} {...props}>
        {variant === "circular" ? (
          <FiCircularProgress
            value={value}
            max={max}
            size={size}
            tone={tone}
            label={label}
            showValue={showValue}
            aria-label={label ?? "Profile completion"}
          />
        ) : (
          <FiLinearProgress
            value={value}
            max={max}
            size={size}
            tone={tone}
            label={label ?? "Completion"}
            showValue={showValue}
            aria-label={label ?? "Completion progress"}
          />
        )}

        {resolvedMessage ? (
          <p className="fi-completion-progress__message">{resolvedMessage}</p>
        ) : null}
      </div>
    );
  },
);

FiCompletionProgress.displayName = "FiCompletionProgress";
