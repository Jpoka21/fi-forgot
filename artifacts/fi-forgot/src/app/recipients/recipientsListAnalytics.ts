export type FiRecipientsListAnalyticsEvent =
  | "recipients_list_opened"
  | "recipients_list_searched"
  | "recipients_list_filtered"
  | "recipients_list_sorted"
  | "recipients_list_restored"
  | "recipients_list_load_more"
  | "recipients_list_error";

export interface FiRecipientsListAnalyticsPayload {
  query?: string;
  filterId?: string;
  sortId?: string;
  recipientId?: string;
}

const RECIPIENTS_LIST_ANALYTICS_EVENT = "fi-recipients-list-analytics";

export function trackRecipientsListEvent(
  event: FiRecipientsListAnalyticsEvent,
  payload: FiRecipientsListAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(RECIPIENTS_LIST_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-recipients-list-analytics]", event, payload);
  }
}
