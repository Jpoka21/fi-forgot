export {
  FiAlert,
  FiAlertActions,
  FiAlertDescription,
  FiAlertTitle,
  FiErrorMessage,
  FiSuccessMessage,
  FiWarningMessage,
  useFiAlertTone,
} from "@/app/components/feedback/FiAlert";
export type { FiAlertProps, FiMessageAlertProps } from "@/app/components/feedback/FiAlert";

export { FiInlineMessage } from "@/app/components/feedback/FiInlineMessage";
export type { FiInlineMessageProps } from "@/app/components/feedback/FiInlineMessage";

export {
  FiBanner,
  FiConfirmationBanner,
  FiOfflineBanner,
  FiRetryBanner,
} from "@/app/components/feedback/FiBanner";
export type {
  FiBannerProps,
  FiConfirmationBannerProps,
  FiOfflineBannerProps,
  FiRetryBannerProps,
} from "@/app/components/feedback/FiBanner";

export { FiToast, FiToastViewport } from "@/app/components/feedback/FiToast";
export type { FiToastProps, FiToastViewportProps } from "@/app/components/feedback/FiToast";

export { FiLoadingIndicator } from "@/app/components/feedback/FiLoadingIndicator";
export type { FiLoadingIndicatorProps } from "@/app/components/feedback/FiLoadingIndicator";

export {
  confirmationBannerDefaults,
  fiAlertTones,
  fiFeedbackTones,
  fiInlineMessageTones,
  fiLoadingIndicatorSizes,
  fiToastDefaultDurationMs,
  mapAlertToneToFeedbackTone,
  offlineBannerDefaults,
  retryBannerDefaults,
} from "@/app/components/feedback/feedbackDomain";
export type {
  FiAlertTone,
  FiFeedbackTone,
  FiInlineMessageTone,
  FiLoadingIndicatorSize,
} from "@/app/components/feedback/feedbackDomain";

export {
  fiAlertToneClasses,
  fiFeedbackToneClasses,
  fiInlineMessageToneClasses,
  getFiAlertClassName,
  getFiBannerClassName,
  getFiInlineMessageClassName,
  getFiLoadingIndicatorClassName,
  getFiToastClassName,
} from "@/app/components/feedback/feedbackVariants";

export {
  buildLoadingIndicatorLabel,
  feedbackAccessibility,
  feedbackAccessibilityChecks,
  resolveFeedbackLiveRole,
  verifyFeedbackAccessibility,
} from "@/app/components/feedback/accessibility";
