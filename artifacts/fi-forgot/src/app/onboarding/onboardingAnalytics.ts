type OnboardingAnalyticsPayload = Record<string, string | number | boolean | undefined>;

const ONBOARDING_ANALYTICS_EVENT = "fi-onboarding-analytics";

export type OnboardingAnalyticsEvent =
  | "onboarding_opened"
  | "onboarding_welcome_step"
  | "onboarding_guided_step"
  | "onboarding_resumed"
  | "onboarding_completed"
  | "onboarding_error";

export function trackOnboardingEvent(
  event: OnboardingAnalyticsEvent,
  payload?: OnboardingAnalyticsPayload,
): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(ONBOARDING_ANALYTICS_EVENT, {
        detail: { event, payload, at: Date.now() },
      }),
    );
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- dev analytics mirror
    console.debug("[fi-onboarding-analytics]", event, payload);
  }
}
