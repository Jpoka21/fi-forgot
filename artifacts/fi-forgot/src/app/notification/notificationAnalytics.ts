export type FiNotificationAnalyticsEvent =
  | "notification_center_opened"
  | "notification_center_closed"
  | "notification_opened"
  | "notification_marked_read"
  | "notification_marked_unread"
  | "notification_dismissed"
  | "notification_restored"
  | "notification_mark_all_read"
  | "notification_filter_changed"
  | "notification_search"
  | "notification_error"
  | "notification_settings_opened"
  | "notification_page_viewed"
  | "communication_history_tab_changed";

export interface FiNotificationAnalyticsPayload {
  notificationId?: string;
  category?: string;
  filter?: string;
  query?: string;
}

const NOTIFICATION_ANALYTICS_EVENT = "fi-notification-analytics";

export function trackNotificationEvent(
  event: FiNotificationAnalyticsEvent,
  payload: FiNotificationAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(NOTIFICATION_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-notification-analytics]", event, payload);
  }
}

export function subscribeToNotificationAnalytics(
  listener: (
    event: FiNotificationAnalyticsEvent,
    payload: FiNotificationAnalyticsPayload,
  ) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const custom = event as CustomEvent<{
      event: FiNotificationAnalyticsEvent;
      payload: FiNotificationAnalyticsPayload;
    }>;
    listener(custom.detail.event, custom.detail.payload);
  };

  window.addEventListener(NOTIFICATION_ANALYTICS_EVENT, handler);
  return () => window.removeEventListener(NOTIFICATION_ANALYTICS_EVENT, handler);
}
