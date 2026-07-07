export type FiConciergeSuggestionsAnalyticsEvent =
  | "concierge_suggestions_loaded"
  | "concierge_suggestions_refreshed"
  | "concierge_suggestions_error"
  | "concierge_suggestion_selected";

export interface FiConciergeSuggestionsAnalyticsPayload {
  suggestionId?: string;
  suggestionType?: string;
  count?: number;
}

const CONCIERGE_SUGGESTIONS_ANALYTICS_EVENT = "fi-concierge-suggestions-analytics";

export function trackConciergeSuggestionsEvent(
  event: FiConciergeSuggestionsAnalyticsEvent,
  payload: FiConciergeSuggestionsAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(CONCIERGE_SUGGESTIONS_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-concierge-suggestions-analytics]", event, payload);
  }
}

export function subscribeToConciergeSuggestionsAnalytics(
  listener: (
    event: FiConciergeSuggestionsAnalyticsEvent,
    payload: FiConciergeSuggestionsAnalyticsPayload,
  ) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const custom = event as CustomEvent<{
      event: FiConciergeSuggestionsAnalyticsEvent;
      payload: FiConciergeSuggestionsAnalyticsPayload;
    }>;
    listener(custom.detail.event, custom.detail.payload);
  };

  window.addEventListener(CONCIERGE_SUGGESTIONS_ANALYTICS_EVENT, handler);
  return () => window.removeEventListener(CONCIERGE_SUGGESTIONS_ANALYTICS_EVENT, handler);
}
