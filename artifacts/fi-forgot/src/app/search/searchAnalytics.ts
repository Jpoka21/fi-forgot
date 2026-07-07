export type FiSearchAnalyticsEvent =
  | "search_opened"
  | "search_closed"
  | "search_query"
  | "search_result_selected"
  | "search_empty"
  | "search_error"
  | "search_filter_changed"
  | "search_sort_changed"
  | "search_recent_selected"
  | "search_recent_removed"
  | "search_recent_cleared"
  | "search_suggestion_selected"
  | "search_page_viewed";

export interface FiSearchAnalyticsPayload {
  query?: string;
  resultId?: string;
  entityType?: string;
  filter?: string;
  sort?: string;
  source?: string;
}

const SEARCH_ANALYTICS_EVENT = "fi-search-analytics";

export function trackSearchEvent(
  event: FiSearchAnalyticsEvent,
  payload: FiSearchAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(SEARCH_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-search-analytics]", event, payload);
  }
}

export function subscribeToSearchAnalytics(
  listener: (event: FiSearchAnalyticsEvent, payload: FiSearchAnalyticsPayload) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const custom = event as CustomEvent<{ event: FiSearchAnalyticsEvent; payload: FiSearchAnalyticsPayload }>;
    listener(custom.detail.event, custom.detail.payload);
  };

  window.addEventListener(SEARCH_ANALYTICS_EVENT, handler);
  return () => window.removeEventListener(SEARCH_ANALYTICS_EVENT, handler);
}
