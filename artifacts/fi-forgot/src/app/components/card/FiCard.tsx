import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getFiCardClassName,
  type FiCardVariant,
} from "@/app/components/card/cardVariants";

export interface FiCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: FiCardVariant;
  interactive?: boolean;
  selected?: boolean;
  loading?: boolean;
}

export const FiCard = forwardRef<HTMLDivElement, FiCardProps>(
  (
    {
      variant = "standard",
      interactive = false,
      selected = false,
      loading = false,
      className,
      children,
      tabIndex,
      onClick,
      onKeyDown,
      role,
      ...props
    },
    ref,
  ) => {
    const isInteractive = interactive || Boolean(onClick);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (!isInteractive || !onClick || event.defaultPrevented) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick(event as unknown as MouseEvent<HTMLDivElement>);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          getFiCardClassName({
            variant,
            interactive: isInteractive,
            selected,
            loading,
            className,
          }),
        )}
        role={role ?? (isInteractive ? "button" : undefined)}
        tabIndex={isInteractive ? (tabIndex ?? 0) : tabIndex}
        aria-busy={loading || undefined}
        aria-pressed={selected ? true : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
        {loading ? (
          <div className="fi-card__loading" aria-hidden>
            <Loader2 className="fi-card__spinner" />
          </div>
        ) : null}
      </div>
    );
  },
);

FiCard.displayName = "FiCard";

export const FiCardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-card__header", className)} {...props} />
  ),
);
FiCardHeader.displayName = "FiCardHeader";

export const FiCardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={cn("fi-card__title", className)} {...props}>
      {children}
    </h3>
  ),
);
FiCardTitle.displayName = "FiCardTitle";

export const FiCardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("fi-card__description", className)} {...props} />
  ),
);
FiCardDescription.displayName = "FiCardDescription";

export const FiCardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-card__content", className)} {...props} />
  ),
);
FiCardContent.displayName = "FiCardContent";

export const FiCardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("fi-card__footer", className)} {...props} />
  ),
);
FiCardFooter.displayName = "FiCardFooter";

export interface FiCardLoadingProps extends FiCardProps {
  label?: ReactNode;
}

export const FiCardLoading = forwardRef<HTMLDivElement, FiCardLoadingProps>(
  ({ loading = true, label = "Loading", children, ...props }, ref) => (
    <FiCard ref={ref} loading={loading} aria-label={typeof label === "string" ? label : undefined} {...props}>
      {children}
    </FiCard>
  ),
);

FiCardLoading.displayName = "FiCardLoading";

export interface FiCardSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: FiCardVariant;
  lines?: number;
}

export const FiCardSkeleton = forwardRef<HTMLDivElement, FiCardSkeletonProps>(
  ({ variant = "standard", lines = 3, className, ...props }, ref) => (
    <FiCard
      ref={ref}
      variant={variant}
      className={className}
      aria-hidden
      {...props}
    >
      <FiCardHeader>
        <div className="fi-card__skeleton-line fi-card__skeleton-line--title fi-motion-skeleton" />
        <div className="fi-card__skeleton-line fi-card__skeleton-line--short fi-motion-skeleton" />
      </FiCardHeader>
      <FiCardContent>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="fi-card__skeleton-line fi-motion-skeleton" />
        ))}
        <div className="fi-card__skeleton-block fi-motion-skeleton" />
      </FiCardContent>
    </FiCard>
  ),
);

FiCardSkeleton.displayName = "FiCardSkeleton";

/* Domain convenience wrappers — same shell, typed variant */
export const FiRecipientCard = forwardRef<HTMLDivElement, Omit<FiCardProps, "variant">>(
  (props, ref) => <FiCard ref={ref} variant="recipient" {...props} />,
);
FiRecipientCard.displayName = "FiRecipientCard";

export const FiTimelineCard = forwardRef<HTMLDivElement, Omit<FiCardProps, "variant">>(
  (props, ref) => <FiCard ref={ref} variant="timeline" {...props} />,
);
FiTimelineCard.displayName = "FiTimelineCard";

export const FiNotificationCard = forwardRef<HTMLDivElement, Omit<FiCardProps, "variant">>(
  (props, ref) => <FiCard ref={ref} variant="notification" {...props} />,
);
FiNotificationCard.displayName = "FiNotificationCard";

export const FiBillingCard = forwardRef<HTMLDivElement, Omit<FiCardProps, "variant">>(
  (props, ref) => <FiCard ref={ref} variant="billing" {...props} />,
);
FiBillingCard.displayName = "FiBillingCard";

export const FiDashboardCard = forwardRef<HTMLDivElement, Omit<FiCardProps, "variant">>(
  (props, ref) => <FiCard ref={ref} variant="dashboard" {...props} />,
);
FiDashboardCard.displayName = "FiDashboardCard";

export const FiAnalyticsCard = forwardRef<HTMLDivElement, Omit<FiCardProps, "variant">>(
  (props, ref) => <FiCard ref={ref} variant="analytics" {...props} />,
);
FiAnalyticsCard.displayName = "FiAnalyticsCard";

export const FiAiRecommendationCard = forwardRef<HTMLDivElement, Omit<FiCardProps, "variant">>(
  (props, ref) => <FiCard ref={ref} variant="aiRecommendation" {...props} />,
);
FiAiRecommendationCard.displayName = "FiAiRecommendationCard";

export const FiEmptyStateCard = forwardRef<HTMLDivElement, Omit<FiCardProps, "variant">>(
  (props, ref) => <FiCard ref={ref} variant="empty" {...props} />,
);
FiEmptyStateCard.displayName = "FiEmptyStateCard";
