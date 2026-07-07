import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import type { FiRelationshipHealthLevel } from "@/app/components/badge/badgeDomain";
import {
  buildProgressAriaLabel,
} from "@/app/components/progress/accessibility";
import {
  clampProgressValue,
  formatProgressPercent,
  relationshipHealthRingLabels,
  resolveHealthRingLevel,
  type FiProgressSize,
  type FiProgressTone,
} from "@/app/components/progress/progressDomain";
import {
  fiRelationshipHealthRingClasses,
  getFiCircularProgressClassName,
} from "@/app/components/progress/progressVariants";

const circularSizes: Record<FiProgressSize, number> = {
  sm: 48,
  md: 72,
  lg: 96,
};

const strokeWidths: Record<FiProgressSize, number> = {
  sm: 4,
  md: 5,
  lg: 6,
};

export interface FiCircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: FiProgressSize;
  tone?: FiProgressTone;
  label?: ReactNode;
  showValue?: boolean;
  strokeWidth?: number;
}

export const FiCircularProgress = forwardRef<HTMLDivElement, FiCircularProgressProps>(
  (
    {
      value = 0,
      max = 100,
      size = "md",
      tone = "primary",
      label,
      showValue = false,
      strokeWidth,
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const clamped = clampProgressValue(value, max);
    const dimension = circularSizes[size];
    const stroke = strokeWidth ?? strokeWidths[size];
    const radius = (dimension - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clamped / max) * circumference;
    const resolvedLabel = buildProgressAriaLabel(ariaLabel ?? (typeof label === "string" ? label : undefined), clamped, max);

    return (
      <div
        ref={ref}
        className={cn(getFiCircularProgressClassName({ size, tone }), className)}
        role="progressbar"
        aria-label={resolvedLabel}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        {...props}
      >
        <svg
          className="fi-progress-ring__svg"
          viewBox={`0 0 ${dimension} ${dimension}`}
          aria-hidden
        >
          <circle
            className="fi-progress-ring__track"
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            strokeWidth={stroke}
          />
          <circle
            className="fi-progress-ring__fill"
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        {(label || showValue) ? (
          <div className="fi-progress-ring__center">
            {showValue ? (
              <span className="fi-progress-ring__value">{formatProgressPercent(clamped, max)}</span>
            ) : null}
            {label ? <span className="fi-progress-ring__label">{label}</span> : null}
          </div>
        ) : null}
      </div>
    );
  },
);

FiCircularProgress.displayName = "FiCircularProgress";

export interface FiRelationshipHealthRingProps extends Omit<FiCircularProgressProps, "tone" | "label" | "showValue"> {
  level?: FiRelationshipHealthLevel;
  score?: number;
  showScore?: boolean;
  label?: ReactNode;
}

export const FiRelationshipHealthRing = forwardRef<HTMLDivElement, FiRelationshipHealthRingProps>(
  (
    {
      level,
      score,
      showScore = false,
      label,
      value,
      max = 100,
      className,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const resolvedLevel = level ?? (score != null ? resolveHealthRingLevel(score) : "Healthy");
    const resolvedValue = value ?? score ?? 0;
    const resolvedLabel = label ?? relationshipHealthRingLabels[resolvedLevel];
    const healthClass = fiRelationshipHealthRingClasses[resolvedLevel];

    return (
      <FiCircularProgress
        ref={ref}
        value={resolvedValue}
        max={max}
        tone="health"
        showValue={showScore}
        label={resolvedLabel}
        className={cn(healthClass, className)}
        aria-label={
          ariaLabel ?? `Relationship health: ${relationshipHealthRingLabels[resolvedLevel]}`
        }
        {...props}
      />
    );
  },
);

FiRelationshipHealthRing.displayName = "FiRelationshipHealthRing";
