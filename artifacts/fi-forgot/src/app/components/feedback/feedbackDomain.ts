export const fiFeedbackTones = ["success", "info", "warning", "error", "neutral"] as const;

export type FiFeedbackTone = (typeof fiFeedbackTones)[number];

export const fiAlertTones = ["success", "info", "warning", "critical"] as const;

export type FiAlertTone = (typeof fiAlertTones)[number];

export const fiInlineMessageTones = ["success", "info", "warning", "error"] as const;

export type FiInlineMessageTone = (typeof fiInlineMessageTones)[number];

export const fiLoadingIndicatorSizes = ["sm", "md", "lg"] as const;

export type FiLoadingIndicatorSize = (typeof fiLoadingIndicatorSizes)[number];

export const fiToastDefaultDurationMs = 5000;

export const confirmationBannerDefaults = {
  title: "All set",
  description: "Your changes were saved successfully.",
} as const;

export const retryBannerDefaults = {
  title: "We couldn't finish that request",
  description: "Please check your connection and try again.",
  retryLabel: "Try Again",
} as const;

export const offlineBannerDefaults = {
  title: "You're offline right now",
  description:
    "You can keep reviewing anything already loaded. We'll sync new changes once your connection returns.",
  retryLabel: "Try Again",
  continueLabel: "Continue Offline",
} as const;

export function mapAlertToneToFeedbackTone(tone: FiAlertTone): FiFeedbackTone {
  if (tone === "critical") return "error";
  return tone;
}
