import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  RefreshCw,
  WifiOff,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { FiButton } from "@/app/components/button/FiButton";
import {
  confirmationBannerDefaults,
  offlineBannerDefaults,
  retryBannerDefaults,
  type FiFeedbackTone,
} from "@/app/components/feedback/feedbackDomain";
import { getFiBannerClassName } from "@/app/components/feedback/feedbackVariants";

export interface FiBannerProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  tone?: FiFeedbackTone;
  icon?: ReactNode;
  showIcon?: boolean;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export const FiBanner = forwardRef<HTMLElement, FiBannerProps>(
  (
    {
      tone = "info",
      icon,
      showIcon = true,
      title,
      description,
      action,
      secondaryAction,
      onDismiss,
      dismissLabel = "Dismiss banner",
      className,
      ...props
    },
    ref,
  ) => (
    <section
      ref={ref}
      className={cn(getFiBannerClassName({ tone, dismissible: Boolean(onDismiss), className }))}
      aria-label={typeof title === "string" ? title : "Banner"}
      {...props}
    >
      <div className="fi-banner__main">
        {showIcon && icon ? (
          <span className="fi-banner__icon" aria-hidden>
            {icon}
          </span>
        ) : null}
        <div className="fi-banner__content">
          <p className="fi-banner__title">{title}</p>
          {description ? <p className="fi-banner__description">{description}</p> : null}
        </div>
      </div>

      {(action || secondaryAction || onDismiss) ? (
        <div className="fi-banner__actions">
          {action}
          {secondaryAction}
          {onDismiss ? (
            <button
              type="button"
              className="fi-banner__dismiss"
              onClick={onDismiss}
              aria-label={dismissLabel}
            >
              <X aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  ),
);

FiBanner.displayName = "FiBanner";

export interface FiConfirmationBannerProps extends Omit<FiBannerProps, "tone" | "title" | "description"> {
  title?: ReactNode;
  description?: ReactNode;
}

export const FiConfirmationBanner = forwardRef<HTMLElement, FiConfirmationBannerProps>(
  (
    {
      title = confirmationBannerDefaults.title,
      description = confirmationBannerDefaults.description,
      icon = <CheckCircle2 />,
      ...props
    },
    ref,
  ) => (
    <FiBanner
      ref={ref}
      tone="success"
      title={title}
      description={description}
      icon={icon}
      {...props}
    />
  ),
);
FiConfirmationBanner.displayName = "FiConfirmationBanner";

export interface FiRetryBannerProps extends Omit<FiBannerProps, "tone" | "title" | "description" | "action"> {
  title?: ReactNode;
  description?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export const FiRetryBanner = forwardRef<HTMLElement, FiRetryBannerProps>(
  (
    {
      title = retryBannerDefaults.title,
      description = retryBannerDefaults.description,
      retryLabel = retryBannerDefaults.retryLabel,
      onRetry,
      icon = <RefreshCw />,
      action,
      ...props
    },
    ref,
  ) => (
    <FiBanner
      ref={ref}
      tone="warning"
      title={title}
      description={description}
      icon={icon}
      action={
        action ?? (
          onRetry ? (
            <FiButton variant="secondary" size="sm" onClick={onRetry}>
              {retryLabel}
            </FiButton>
          ) : undefined
        )
      }
      {...props}
    />
  ),
);
FiRetryBanner.displayName = "FiRetryBanner";

export interface FiOfflineBannerProps extends Omit<FiBannerProps, "tone" | "title" | "description"> {
  title?: ReactNode;
  description?: ReactNode;
  retryLabel?: string;
  continueLabel?: string;
  onRetry?: () => void;
  onContinueOffline?: () => void;
}

export const FiOfflineBanner = forwardRef<HTMLElement, FiOfflineBannerProps>(
  (
    {
      title = offlineBannerDefaults.title,
      description = offlineBannerDefaults.description,
      retryLabel = offlineBannerDefaults.retryLabel,
      continueLabel = offlineBannerDefaults.continueLabel,
      onRetry,
      onContinueOffline,
      icon = <WifiOff />,
      action,
      secondaryAction,
      ...props
    },
    ref,
  ) => (
    <FiBanner
      ref={ref}
      tone="info"
      title={title}
      description={description}
      icon={icon}
      action={
        action ?? (
          onRetry ? (
            <FiButton variant="secondary" size="sm" onClick={onRetry}>
              {retryLabel}
            </FiButton>
          ) : undefined
        )
      }
      secondaryAction={
        secondaryAction ?? (
          onContinueOffline ? (
            <FiButton variant="ghost" size="sm" onClick={onContinueOffline}>
              {continueLabel}
            </FiButton>
          ) : undefined
        )
      }
      {...props}
    />
  ),
);
FiOfflineBanner.displayName = "FiOfflineBanner";
