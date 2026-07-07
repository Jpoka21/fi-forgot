export type FiCalendarAnalyticsEvent =
  | "calendar_loaded"
  | "calendar_refreshed"
  | "calendar_error"
  | "calendar_view_changed"
  | "calendar_event_selected";

export interface FiCalendarAnalyticsPayload {
  view?: string;
  eventId?: string;
  count?: number;
}

const CALENDAR_ANALYTICS_EVENT = "fi-calendar-analytics";

export function trackCalendarEvent(
  event: FiCalendarAnalyticsEvent,
  payload: FiCalendarAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(CALENDAR_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-calendar-analytics]", event, payload);
  }
}

export function subscribeToCalendarAnalytics(
  listener: (event: FiCalendarAnalyticsEvent, payload: FiCalendarAnalyticsPayload) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (customEvent: Event) => {
    const custom = customEvent as CustomEvent<{
      event: FiCalendarAnalyticsEvent;
      payload: FiCalendarAnalyticsPayload;
    }>;
    listener(custom.detail.event, custom.detail.payload);
  };

  window.addEventListener(CALENDAR_ANALYTICS_EVENT, handler);
  return () => window.removeEventListener(CALENDAR_ANALYTICS_EVENT, handler);
}
