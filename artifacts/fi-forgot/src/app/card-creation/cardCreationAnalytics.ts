export type FiCardCreationAnalyticsEvent =
  | "card_creation_opened"
  | "card_creation_recipient_selected"
  | "card_creation_occasion_selected"
  | "card_creation_tone_selected"
  | "card_creation_generation_started"
  | "card_creation_generation_completed"
  | "card_creation_generation_failed"
  | "card_creation_enhancement_applied"
  | "card_creation_draft_saved"
  | "card_creation_approved"
  | "card_creation_cancelled"
  | "card_creation_retried";

export interface FiCardCreationAnalyticsPayload {
  recipientId?: string;
  occasion?: string;
  tone?: string;
  actionId?: string;
}

const CARD_CREATION_ANALYTICS_EVENT = "fi-card-creation-analytics";

export function trackCardCreationEvent(
  event: FiCardCreationAnalyticsEvent,
  payload: FiCardCreationAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(CARD_CREATION_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-card-creation-analytics]", event, payload);
  }
}
