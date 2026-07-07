export type FiAutopilotAnalyticsEvent =
  | "autopilot_opened"
  | "autopilot_refreshed"
  | "autopilot_error"
  | "autopilot_enabled"
  | "autopilot_disabled"
  | "autopilot_paused"
  | "autopilot_resumed"
  | "autopilot_offline";

export interface FiAutopilotAnalyticsPayload {
  runtimeState?: string;
  pendingReviewCount?: number;
}

const AUTOPILOT_ANALYTICS_EVENT = "fi-autopilot-analytics";

export function trackAutopilotEvent(
  event: FiAutopilotAnalyticsEvent,
  payload: FiAutopilotAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(AUTOPILOT_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-autopilot-analytics]", event, payload);
  }
}
