import { motionUtilityClasses, radiusUtilityClasses, typographyUtilityClasses } from "@/app/design";

import type {
  FiAlertTone,
  FiFeedbackTone,
  FiInlineMessageTone,
  FiLoadingIndicatorSize,
} from "@/app/components/feedback/feedbackDomain";
import { mapAlertToneToFeedbackTone } from "@/app/components/feedback/feedbackDomain";

export const fiFeedbackToneClasses: Record<FiFeedbackTone, string> = {
  success: "fi-feedback--success",
  info: "fi-feedback--info",
  warning: "fi-feedback--warning",
  error: "fi-feedback--error",
  neutral: "fi-feedback--neutral",
};

export const fiAlertToneClasses: Record<FiAlertTone, string> = {
  success: fiFeedbackToneClasses.success,
  info: fiFeedbackToneClasses.info,
  warning: fiFeedbackToneClasses.warning,
  critical: fiFeedbackToneClasses.error,
};

export const fiInlineMessageToneClasses: Record<FiInlineMessageTone, string> = {
  success: fiFeedbackToneClasses.success,
  info: fiFeedbackToneClasses.info,
  warning: fiFeedbackToneClasses.warning,
  error: fiFeedbackToneClasses.error,
};

export const fiLoadingIndicatorSizeClasses: Record<FiLoadingIndicatorSize, string> = {
  sm: "fi-loading-indicator--sm",
  md: "fi-loading-indicator--md",
  lg: "fi-loading-indicator--lg",
};

export function getFiAlertClassName(options: {
  tone?: FiAlertTone;
  dismissible?: boolean;
  className?: string;
}): string {
  const { tone = "info", dismissible = false, className = "" } = options;

  return [
    "fi-alert",
    radiusUtilityClasses.md,
    typographyUtilityClasses.bodySm,
    fiAlertToneClasses[tone],
    dismissible ? "fi-alert--dismissible" : "",
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiInlineMessageClassName(options: {
  tone?: FiInlineMessageTone;
  className?: string;
}): string {
  const { tone = "info", className = "" } = options;

  return [
    "fi-inline-message",
    typographyUtilityClasses.caption,
    fiInlineMessageToneClasses[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiBannerClassName(options: {
  tone?: FiFeedbackTone;
  dismissible?: boolean;
  className?: string;
}): string {
  const { tone = "info", dismissible = false, className = "" } = options;

  return [
    "fi-banner",
    fiFeedbackToneClasses[tone],
    dismissible ? "fi-banner--dismissible" : "",
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiToastClassName(options: {
  tone?: FiFeedbackTone;
  className?: string;
}): string {
  const { tone = "neutral", className = "" } = options;

  return [
    "fi-toast",
    radiusUtilityClasses.md,
    typographyUtilityClasses.bodySm,
    fiFeedbackToneClasses[tone],
    motionUtilityClasses.notificationEnter,
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFiLoadingIndicatorClassName(options: {
  size?: FiLoadingIndicatorSize;
  className?: string;
}): string {
  const { size = "md", className = "" } = options;

  return [
    "fi-loading-indicator",
    fiLoadingIndicatorSizeClasses[size],
    motionUtilityClasses.reducedSafe,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getFeedbackToneClass(tone: FiAlertTone | FiFeedbackTone): string {
  const mapped =
    tone === "critical"
      ? "error"
      : mapAlertToneToFeedbackTone(tone as FiAlertTone);
  return fiFeedbackToneClasses[mapped as FiFeedbackTone];
}
