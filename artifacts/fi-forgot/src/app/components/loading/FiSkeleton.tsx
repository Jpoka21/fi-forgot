import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";
import {
  buildLoadingRegionLabel,
} from "@/app/components/loading/accessibility";
import type { FiLoadingSkeletonVariant } from "@/app/components/loading/loadingDomain";
import {
  getFiLoadingRegionClassName,
  getFiSkeletonClassName,
  type FiSkeletonShape,
  type FiSkeletonWidth,
} from "@/app/components/loading/loadingVariants";

export interface FiSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: FiSkeletonShape;
  width?: FiSkeletonWidth;
  animate?: boolean;
}

export const FiSkeleton = forwardRef<HTMLDivElement, FiSkeletonProps>(
  ({ shape = "line", width = "full", animate = true, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(getFiSkeletonClassName({ shape, width, animate, className }))}
      aria-hidden
      {...props}
    />
  ),
);

FiSkeleton.displayName = "FiSkeleton";

export interface FiSkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
  animate?: boolean;
}

const skeletonTextWidths: FiSkeletonWidth[] = ["lg", "full", "md", "sm"];

export const FiSkeletonText = forwardRef<HTMLDivElement, FiSkeletonTextProps>(
  ({ lines = 3, animate = true, className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-skeleton-text", className)} aria-hidden {...props}>
      {Array.from({ length: lines }, (_, index) => (
        <FiSkeleton
          key={index}
          width={skeletonTextWidths[index % skeletonTextWidths.length]}
          animate={animate}
        />
      ))}
    </div>
  ),
);

FiSkeletonText.displayName = "FiSkeletonText";

export interface FiSkeletonRowProps extends HTMLAttributes<HTMLDivElement> {
  showAvatar?: boolean;
  lines?: number;
  animate?: boolean;
}

export const FiSkeletonRow = forwardRef<HTMLDivElement, FiSkeletonRowProps>(
  ({ showAvatar = true, lines = 2, animate = true, className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-skeleton-row", className)} aria-hidden {...props}>
      {showAvatar ? <FiSkeleton shape="avatar" width="xs" animate={animate} /> : null}
      <div className="fi-skeleton-row__content">
        <FiSkeletonText lines={lines} animate={animate} />
      </div>
    </div>
  ),
);

FiSkeletonRow.displayName = "FiSkeletonRow";

export interface FiLoadingRegionProps extends HTMLAttributes<HTMLDivElement> {
  variant?: FiLoadingSkeletonVariant;
  label?: string;
  busy?: boolean;
  showLabel?: boolean;
}

export const FiLoadingRegion = forwardRef<HTMLDivElement, FiLoadingRegionProps>(
  (
    {
      variant,
      label,
      busy = true,
      showLabel = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const resolvedLabel = buildLoadingRegionLabel(variant, label);

    return (
      <div
        ref={ref}
        className={cn(getFiLoadingRegionClassName({ variant, className }))}
        role="status"
        aria-live="polite"
        aria-busy={busy || undefined}
        aria-label={resolvedLabel}
        {...props}
      >
        {showLabel ? (
          <p className="fi-loading-region__label">{resolvedLabel}</p>
        ) : (
          <span className="fi-loading-region__label">{resolvedLabel}</span>
        )}
        {children}
      </div>
    );
  },
);

FiLoadingRegion.displayName = "FiLoadingRegion";
