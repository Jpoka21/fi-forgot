export type FiBrowniePointsAnalyticsEvent =
  | "brownie_points_loaded"
  | "brownie_points_refreshed"
  | "brownie_points_error"
  | "brownie_points_history_item_selected";

export interface FiBrowniePointsAnalyticsPayload {
  balance?: number;
  transactionId?: string;
}

const BROWNIE_POINTS_ANALYTICS_EVENT = "fi-brownie-points-analytics";

export function trackBrowniePointsEvent(
  event: FiBrowniePointsAnalyticsEvent,
  payload: FiBrowniePointsAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(BROWNIE_POINTS_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-brownie-points-analytics]", event, payload);
  }
}

export function subscribeToBrowniePointsAnalytics(
  listener: (
    event: FiBrowniePointsAnalyticsEvent,
    payload: FiBrowniePointsAnalyticsPayload,
  ) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const custom = event as CustomEvent<{
      event: FiBrowniePointsAnalyticsEvent;
      payload: FiBrowniePointsAnalyticsPayload;
    }>;
    listener(custom.detail.event, custom.detail.payload);
  };

  window.addEventListener(BROWNIE_POINTS_ANALYTICS_EVENT, handler);
  return () => window.removeEventListener(BROWNIE_POINTS_ANALYTICS_EVENT, handler);
}
