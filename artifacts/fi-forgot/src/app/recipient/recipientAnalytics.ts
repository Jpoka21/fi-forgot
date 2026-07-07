export type FiRecipientAnalyticsEvent =
  | "recipient_loaded"
  | "recipient_refreshed"
  | "recipient_error"
  | "recipient_action_selected";

export interface FiRecipientAnalyticsPayload {
  recipientId?: string;
  actionId?: string;
}

const RECIPIENT_ANALYTICS_EVENT = "fi-recipient-analytics";

export function trackRecipientEvent(
  event: FiRecipientAnalyticsEvent,
  payload: FiRecipientAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(RECIPIENT_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-recipient-analytics]", event, payload);
  }
}

export function subscribeToRecipientAnalytics(
  listener: (event: FiRecipientAnalyticsEvent, payload: FiRecipientAnalyticsPayload) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (customEvent: Event) => {
    const custom = customEvent as CustomEvent<{
      event: FiRecipientAnalyticsEvent;
      payload: FiRecipientAnalyticsPayload;
    }>;
    listener(custom.detail.event, custom.detail.payload);
  };

  window.addEventListener(RECIPIENT_ANALYTICS_EVENT, handler);
  return () => window.removeEventListener(RECIPIENT_ANALYTICS_EVENT, handler);
}
