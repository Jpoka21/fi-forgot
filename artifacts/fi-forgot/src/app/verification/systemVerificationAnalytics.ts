export type FiVerificationAnalyticsEvent = "verification_page_viewed" | "verification_section_opened";

export interface FiVerificationAnalyticsPayload {
  passed?: number;
  total?: number;
  section?: string;
}

const VERIFICATION_ANALYTICS_EVENT = "fi-verification-analytics";

export function trackVerificationEvent(
  event: FiVerificationAnalyticsEvent,
  payload: FiVerificationAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(VERIFICATION_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-verification-analytics]", event, payload);
  }
}
