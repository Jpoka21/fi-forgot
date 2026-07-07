type AiAutomationAnalyticsPayload = Record<string, string | number | boolean | undefined>;

const AI_AUTOMATION_ANALYTICS_EVENT = "fi-ai-automation-analytics";

export type AiAutomationAnalyticsEvent =
  | "ai_admin_opened"
  | "automation_admin_opened"
  | "automation_retry"
  | "ai_prompt_notes_saved";

export function trackAiAutomationEvent(
  event: AiAutomationAnalyticsEvent,
  payload?: AiAutomationAnalyticsPayload,
): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(AI_AUTOMATION_ANALYTICS_EVENT, {
        detail: { event, payload, at: Date.now() },
      }),
    );
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- dev analytics mirror
    console.debug("[fi-ai-automation-analytics]", event, payload);
  }
}
