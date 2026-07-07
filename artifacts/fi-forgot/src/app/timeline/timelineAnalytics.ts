export type FiTimelineAnalyticsEvent =
  | "timeline_loaded"
  | "timeline_refreshed"
  | "timeline_error"
  | "timeline_filter_changed"
  | "timeline_search"
  | "timeline_item_edited"
  | "timeline_item_archived"
  | "timeline_load_more";

export interface FiTimelineAnalyticsPayload {
  recipientId?: string;
  filter?: string;
  query?: string;
  itemId?: string;
  visibleCount?: number;
}

const TIMELINE_ANALYTICS_EVENT = "fi-timeline-analytics";

export function trackTimelineEvent(
  event: FiTimelineAnalyticsEvent,
  payload: FiTimelineAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(TIMELINE_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-timeline-analytics]", event, payload);
  }
}

export function subscribeToTimelineAnalytics(
  listener: (event: FiTimelineAnalyticsEvent, payload: FiTimelineAnalyticsPayload) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const custom = event as CustomEvent<{
      event: FiTimelineAnalyticsEvent;
      payload: FiTimelineAnalyticsPayload;
    }>;
    listener(custom.detail.event, custom.detail.payload);
  };

  window.addEventListener(TIMELINE_ANALYTICS_EVENT, handler);
  return () => window.removeEventListener(TIMELINE_ANALYTICS_EVENT, handler);
}
