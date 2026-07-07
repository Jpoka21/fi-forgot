export type FiConciergeAnalyticsEvent =
  | "concierge_page_viewed"
  | "concierge_section_changed"
  | "concierge_prompt_selected"
  | "concierge_message_sent"
  | "concierge_message_streamed"
  | "concierge_action_selected"
  | "concierge_conversation_cleared"
  | "concierge_conversation_error"
  | "concierge_memory_opened";

export interface FiConciergeAnalyticsPayload {
  section?: string;
  promptId?: string;
  messageId?: string;
  actionId?: string;
  memoryId?: string;
}

const CONCIERGE_ANALYTICS_EVENT = "fi-concierge-analytics";

export function trackConciergeEvent(
  event: FiConciergeAnalyticsEvent,
  payload: FiConciergeAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(CONCIERGE_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-concierge-analytics]", event, payload);
  }
}
