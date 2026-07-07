export type FiRelationshipHealthAnalyticsEvent =
  | "relationship_health_loaded"
  | "relationship_health_refreshed"
  | "relationship_health_error"
  | "relationship_health_suggestion_selected";

export interface FiRelationshipHealthAnalyticsPayload {
  recipientId?: string;
  score?: number;
  suggestionId?: string;
}

const RELATIONSHIP_HEALTH_ANALYTICS_EVENT = "fi-relationship-health-analytics";

export function trackRelationshipHealthEvent(
  event: FiRelationshipHealthAnalyticsEvent,
  payload: FiRelationshipHealthAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(RELATIONSHIP_HEALTH_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-relationship-health-analytics]", event, payload);
  }
}

export function subscribeToRelationshipHealthAnalytics(
  listener: (
    event: FiRelationshipHealthAnalyticsEvent,
    payload: FiRelationshipHealthAnalyticsPayload,
  ) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (event: Event) => {
    const custom = event as CustomEvent<{
      event: FiRelationshipHealthAnalyticsEvent;
      payload: FiRelationshipHealthAnalyticsPayload;
    }>;
    listener(custom.detail.event, custom.detail.payload);
  };

  window.addEventListener(RELATIONSHIP_HEALTH_ANALYTICS_EVENT, handler);
  return () => window.removeEventListener(RELATIONSHIP_HEALTH_ANALYTICS_EVENT, handler);
}
