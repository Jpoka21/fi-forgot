import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import {
  buildEmptyStateRegionLabel,
} from "@/app/components/empty-state/accessibility";
import type { FiEmptyStateVariant } from "@/app/components/empty-state/emptyStateDomain";
import {
  getFiEmptyStateClassName,
  getFiEmptyStateIllustrationClassName,
} from "@/app/components/empty-state/emptyStateVariants";

export interface FiEmptyStateProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  variant?: FiEmptyStateVariant;
  contained?: boolean;
  regionLabel?: string;
}

export const FiEmptyState = forwardRef<HTMLElement, FiEmptyStateProps>(
  (
    {
      variant,
      contained = false,
      regionLabel,
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <section
      ref={ref}
      className={cn(getFiEmptyStateClassName({ variant, contained, className }))}
      aria-label={regionLabel ?? buildEmptyStateRegionLabel(variant)}
      {...props}
    >
      {children}
    </section>
  ),
);

FiEmptyState.displayName = "FiEmptyState";

export interface FiEmptyStateIllustrationProps extends HTMLAttributes<HTMLDivElement> {
  alt?: string;
  decorative?: boolean;
}

export const FiEmptyStateIllustration = forwardRef<HTMLDivElement, FiEmptyStateIllustrationProps>(
  ({ alt, decorative = true, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(getFiEmptyStateIllustrationClassName(className))}
      aria-hidden={decorative && !alt ? true : undefined}
      {...props}
    >
      {children}
      {alt && !decorative ? <span className="sr-only">{alt}</span> : null}
    </div>
  ),
);

FiEmptyStateIllustration.displayName = "FiEmptyStateIllustration";

export const FiEmptyStateIcon = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("fi-empty-state__icon", className)} aria-hidden {...props}>
      {children}
    </div>
  ),
);

FiEmptyStateIcon.displayName = "FiEmptyStateIcon";

export const FiEmptyStateContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-empty-state__content", className)} {...props} />
  ),
);

FiEmptyStateContent.displayName = "FiEmptyStateContent";

export const FiEmptyStateTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h2 ref={ref} className={cn("fi-empty-state__title", className)} {...props}>
      {children}
    </h2>
  ),
);

FiEmptyStateTitle.displayName = "FiEmptyStateTitle";

export const FiEmptyStateDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("fi-empty-state__description", className)} {...props} />
));

FiEmptyStateDescription.displayName = "FiEmptyStateDescription";

export const FiEmptyStateActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-empty-state__actions", className)} {...props} />
  ),
);

FiEmptyStateActions.displayName = "FiEmptyStateActions";

export interface FiEmptyStateLayoutProps extends Omit<FiEmptyStateProps, "children"> {
  title: ReactNode;
  description?: ReactNode;
  illustration?: ReactNode;
  illustrationAlt?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}

export const FiEmptyStateLayout = forwardRef<HTMLElement, FiEmptyStateLayoutProps>(
  (
    {
      title,
      description,
      illustration,
      illustrationAlt,
      primaryAction,
      secondaryAction,
      regionLabel,
      variant,
      ...props
    },
    ref,
  ) => (
    <FiEmptyState
      ref={ref}
      variant={variant}
      regionLabel={
        regionLabel ??
        (typeof title === "string" ? title : buildEmptyStateRegionLabel(variant))
      }
      {...props}
    >
      {illustration ? (
        <FiEmptyStateIllustration alt={illustrationAlt} decorative={!illustrationAlt}>
          {illustration}
        </FiEmptyStateIllustration>
      ) : null}
      <FiEmptyStateContent>
        <FiEmptyStateTitle>{title}</FiEmptyStateTitle>
        {description ? <FiEmptyStateDescription>{description}</FiEmptyStateDescription> : null}
      </FiEmptyStateContent>
      {primaryAction || secondaryAction ? (
        <FiEmptyStateActions>
          {primaryAction}
          {secondaryAction}
        </FiEmptyStateActions>
      ) : null}
    </FiEmptyState>
  ),
);

FiEmptyStateLayout.displayName = "FiEmptyStateLayout";
