import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";
import {
  buildLoadingIndicatorLabel,
} from "@/app/components/feedback/accessibility";
import type { FiLoadingIndicatorSize } from "@/app/components/feedback/feedbackDomain";
import { getFiLoadingIndicatorClassName } from "@/app/components/feedback/feedbackVariants";

export interface FiLoadingIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  size?: FiLoadingIndicatorSize;
  label?: string;
  showLabel?: boolean;
  busy?: boolean;
}

export const FiLoadingIndicator = forwardRef<HTMLDivElement, FiLoadingIndicatorProps>(
  (
    {
      size = "md",
      label,
      showLabel = Boolean(label),
      busy = true,
      className,
      ...props
    },
    ref,
  ) => {
    const resolvedLabel = buildLoadingIndicatorLabel(label);

    return (
      <div
        ref={ref}
        className={cn(getFiLoadingIndicatorClassName({ size, className }))}
        role="status"
        aria-live="polite"
        aria-busy={busy || undefined}
        aria-label={resolvedLabel}
        {...props}
      >
        <span className="fi-loading-indicator__spinner" aria-hidden />
        {showLabel ? (
          <span className="fi-loading-indicator__label">{resolvedLabel}</span>
        ) : null}
      </div>
    );
  },
);

FiLoadingIndicator.displayName = "FiLoadingIndicator";
