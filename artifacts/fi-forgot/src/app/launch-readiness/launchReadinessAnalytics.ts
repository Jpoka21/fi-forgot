export type FiLaunchReadinessAnalyticsEvent = "launch_readiness_viewed";

export interface FiLaunchReadinessAnalyticsPayload {
  passed?: number;
  total?: number;
  launchReady?: boolean;
}

const LAUNCH_READINESS_EVENT = "fi-launch-readiness-analytics";

export function trackLaunchReadinessEvent(
  event: FiLaunchReadinessAnalyticsEvent,
  payload: FiLaunchReadinessAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(LAUNCH_READINESS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-launch-readiness-analytics]", event, payload);
  }
}
