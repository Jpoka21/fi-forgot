import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";
import {
  buildProgressAriaLabel,
} from "@/app/components/progress/accessibility";
import {
  clampProgressValue,
  formatProgressPercent,
  type FiProgressSize,
  type FiProgressTone,
} from "@/app/components/progress/progressDomain";
import { getFiLinearProgressClassName } from "@/app/components/progress/progressVariants";

export interface FiLinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  size?: FiProgressSize;
  tone?: FiProgressTone;
  label?: string;
  showValue?: boolean;
}

export const FiLinearProgress = forwardRef<HTMLProgressElement, FiLinearProgressProps>(
  (
    {
      value = 0,
      max = 100,
      indeterminate = false,
      size = "md",
      tone = "primary",
      label,
      showValue = false,
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const clamped = clampProgressValue(value, max);
    const percent = formatProgressPercent(clamped, max);
    const resolvedLabel = buildProgressAriaLabel(ariaLabel ?? label, clamped, max);

    return (
      <div className={cn("fi-linear-progress", className)} {...props}>
        {(label || showValue) && !indeterminate ? (
          <div className="fi-progress__meta">
            {label ? <span className="fi-progress__meta-label">{label}</span> : <span />}
            {showValue ? <span className="fi-progress__meta-value">{percent}</span> : null}
          </div>
        ) : null}

        <progress
          ref={ref}
          className={getFiLinearProgressClassName({ size, tone, indeterminate })}
          value={indeterminate ? undefined : clamped}
          max={max}
          aria-label={resolvedLabel}
          aria-busy={indeterminate || undefined}
        />
      </div>
    );
  },
);

FiLinearProgress.displayName = "FiLinearProgress";

export interface FiUploadProgressProps extends Omit<FiLinearProgressProps, "tone"> {
  fileName?: string;
}

export const FiUploadProgress = forwardRef<HTMLProgressElement, FiUploadProgressProps>(
  ({ fileName, label, showValue = true, ...props }, ref) => (
    <FiLinearProgress
      ref={ref}
      tone="upload"
      label={label ?? fileName}
      showValue={showValue}
      aria-label={fileName ? `Uploading ${fileName}` : undefined}
      {...props}
    />
  ),
);
FiUploadProgress.displayName = "FiUploadProgress";

export interface FiBrowniePointsProgressProps extends Omit<FiLinearProgressProps, "tone" | "value" | "max"> {
  current: number;
  target: number;
  milestoneLabel?: string;
}

export const FiBrowniePointsProgress = forwardRef<HTMLProgressElement, FiBrowniePointsProgressProps>(
  ({ current, target, milestoneLabel, label, showValue = true, ...props }, ref) => {
    const resolvedLabel = label ?? (milestoneLabel ? `Next: ${milestoneLabel}` : "Brownie Points milestone");

    return (
      <FiLinearProgress
        ref={ref}
        tone="brownie"
        value={current}
        max={target}
        label={resolvedLabel}
        showValue={showValue}
        aria-label={`Brownie Points progress toward ${milestoneLabel ?? "next milestone"}`}
        {...props}
      />
    );
  },
);
FiBrowniePointsProgress.displayName = "FiBrowniePointsProgress";
