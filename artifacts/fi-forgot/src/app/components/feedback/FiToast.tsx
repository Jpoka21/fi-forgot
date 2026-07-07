import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FiFeedbackTone } from "@/app/components/feedback/feedbackDomain";
import { getFiToastClassName } from "@/app/components/feedback/feedbackVariants";

export interface FiToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: FiFeedbackTone;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export const FiToast = forwardRef<HTMLDivElement, FiToastProps>(
  (
    {
      tone = "neutral",
      title,
      description,
      action,
      onDismiss,
      dismissLabel = "Dismiss notification",
      className,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(getFiToastClassName({ tone, className }))}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      {...props}
    >
      <div className="fi-toast__content">
        <p className="fi-toast__title">{title}</p>
        {description ? <p className="fi-toast__description">{description}</p> : null}
      </div>
      <div className="fi-toast__actions">
        {action}
        {onDismiss ? (
          <button
            type="button"
            className="fi-toast__dismiss"
            onClick={onDismiss}
            aria-label={dismissLabel}
          >
            <X aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  ),
);

FiToast.displayName = "FiToast";

export type FiToastViewportProps = HTMLAttributes<HTMLDivElement>;

export const FiToastViewport = forwardRef<HTMLDivElement, FiToastViewportProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("fi-toast-viewport", className)}
      aria-live="polite"
      aria-relevant="additions"
      {...props}
    >
      {children}
    </div>
  ),
);

FiToastViewport.displayName = "FiToastViewport";
