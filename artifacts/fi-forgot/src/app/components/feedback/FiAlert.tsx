import {
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  resolveFeedbackLiveRole,
} from "@/app/components/feedback/accessibility";
import type { FiAlertTone } from "@/app/components/feedback/feedbackDomain";
import { getFiAlertClassName } from "@/app/components/feedback/feedbackVariants";

interface FiAlertContextValue {
  tone: FiAlertTone;
}

const FiAlertContext = createContext<FiAlertContextValue>({ tone: "info" });

function alertIcon(tone: FiAlertTone): ReactNode {
  switch (tone) {
    case "success":
      return <CheckCircle2 />;
    case "warning":
      return <AlertTriangle />;
    case "critical":
      return <AlertCircle />;
    default:
      return <Info />;
  }
}

export interface FiAlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: FiAlertTone;
  icon?: ReactNode;
  showIcon?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
}

export const FiAlert = forwardRef<HTMLDivElement, FiAlertProps>(
  (
    {
      tone = "info",
      icon,
      showIcon = true,
      onDismiss,
      dismissLabel = "Dismiss alert",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const liveRole = resolveFeedbackLiveRole(tone);

    return (
      <FiAlertContext.Provider value={{ tone }}>
        <div
          ref={ref}
          className={cn(getFiAlertClassName({ tone, dismissible: Boolean(onDismiss), className }))}
          role={liveRole}
          {...props}
        >
          {showIcon ? (
            <span className="fi-alert__icon" aria-hidden>
              {icon ?? alertIcon(tone)}
            </span>
          ) : null}
          <div className="fi-alert__content">{children}</div>
          {onDismiss ? (
            <button
              type="button"
              className="fi-alert__dismiss"
              onClick={onDismiss}
              aria-label={dismissLabel}
            >
              <X aria-hidden />
            </button>
          ) : null}
        </div>
      </FiAlertContext.Provider>
    );
  },
);

FiAlert.displayName = "FiAlert";

export const FiAlertTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn("fi-alert__title", className)} {...props} />
));
FiAlertTitle.displayName = "FiAlertTitle";

export const FiAlertDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("fi-alert__description", className)} {...props} />
));
FiAlertDescription.displayName = "FiAlertDescription";

export const FiAlertActions = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("fi-alert__actions", className)} {...props} />
));
FiAlertActions.displayName = "FiAlertActions";

export type FiMessageAlertProps = Omit<FiAlertProps, "tone">;

export const FiSuccessMessage = forwardRef<HTMLDivElement, FiMessageAlertProps>(
  (props, ref) => <FiAlert ref={ref} tone="success" {...props} />,
);
FiSuccessMessage.displayName = "FiSuccessMessage";

export const FiWarningMessage = forwardRef<HTMLDivElement, FiMessageAlertProps>(
  (props, ref) => <FiAlert ref={ref} tone="warning" {...props} />,
);
FiWarningMessage.displayName = "FiWarningMessage";

export const FiErrorMessage = forwardRef<HTMLDivElement, FiMessageAlertProps>(
  (props, ref) => <FiAlert ref={ref} tone="critical" {...props} />,
);
FiErrorMessage.displayName = "FiErrorMessage";

export function useFiAlertTone(): FiAlertTone {
  return useContext(FiAlertContext).tone;
}
