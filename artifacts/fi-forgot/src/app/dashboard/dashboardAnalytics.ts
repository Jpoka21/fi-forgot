export type FiDashboardAnalyticsEvent =
  | "dashboard_viewed"
  | "dashboard_refreshed"
  | "dashboard_error"
  | "dashboard_retry_clicked"
  | "dashboard_hero_cta_clicked"
  | "dashboard_upcoming_opened"
  | "dashboard_spotlight_viewed"
  | "dashboard_recommendation_selected"
  | "dashboard_quick_action_clicked"
  | "dashboard_activity_opened"
  | "dashboard_empty_cta_clicked";

export interface FiDashboardAnalyticsPayload {
  actionId?: string;
  recipientId?: string;
  href?: string;
}

const DASHBOARD_ANALYTICS_EVENT = "fi-dashboard-analytics";

export function trackDashboardEvent(
  event: FiDashboardAnalyticsEvent,
  payload: FiDashboardAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(DASHBOARD_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-dashboard-analytics]", event, payload);
  }
}

export function subscribeToDashboardAnalytics(
  listener: (event: FiDashboardAnalyticsEvent, payload: FiDashboardAnalyticsPayload) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (customEvent: Event) => {
    const custom = customEvent as CustomEvent<{
      event: FiDashboardAnalyticsEvent;
      payload: FiDashboardAnalyticsPayload;
    }>;
    listener(custom.detail.event, custom.detail.payload);
  };

  window.addEventListener(DASHBOARD_ANALYTICS_EVENT, handler);
  return () => window.removeEventListener(DASHBOARD_ANALYTICS_EVENT, handler);
}
