export type FiAiAnalyticsEvent =
  | "ai_recommendations_loaded"
  | "ai_recommendations_refreshed"
  | "ai_recommendations_error"
  | "ai_recommendation_selected"
  | "ai_generation_started"
  | "ai_generation_completed"
  | "ai_generation_failed"
  | "ai_generation_retried";

export interface FiAiAnalyticsPayload {
  count?: number;
  recommendationId?: string;
  sourceType?: string;
}

const AI_ANALYTICS_EVENT = "fi-ai-analytics";

export function trackAiEvent(
  event: FiAiAnalyticsEvent,
  payload: FiAiAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(AI_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-ai-analytics]", event, payload);
  }
}

export function subscribeToAiAnalytics(
  listener: (event: FiAiAnalyticsEvent, payload: FiAiAnalyticsPayload) => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const handler = (customEvent: Event) => {
    const custom = customEvent as CustomEvent<{
      event: FiAiAnalyticsEvent;
      payload: FiAiAnalyticsPayload;
    }>;
    listener(custom.detail.event, custom.detail.payload);
  };

  window.addEventListener(AI_ANALYTICS_EVENT, handler);
  return () => window.removeEventListener(AI_ANALYTICS_EVENT, handler);
}
