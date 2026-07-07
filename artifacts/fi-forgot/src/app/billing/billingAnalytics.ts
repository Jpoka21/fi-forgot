type BillingAnalyticsPayload = Record<string, string | number | boolean | undefined>;

const BILLING_ANALYTICS_EVENT = "fi-billing-analytics";

export type BillingAnalyticsEvent =
  | "billing_opened"
  | "billing_plans_loaded"
  | "billing_checkout_started"
  | "billing_checkout_error"
  | "billing_plan_change_confirmed"
  | "billing_cancel_reviewed"
  | "billing_retry_payment"
  | "billing_attention_dismissed"
  | "subscribe_opened"
  | "checkout_success_viewed";

export function trackBillingEvent(
  event: BillingAnalyticsEvent,
  payload?: BillingAnalyticsPayload,
): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(BILLING_ANALYTICS_EVENT, {
        detail: { event, payload, at: Date.now() },
      }),
    );
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- dev analytics mirror
    console.debug("[fi-billing-analytics]", event, payload);
  }
}
