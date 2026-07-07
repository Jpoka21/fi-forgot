export type FiRelationshipProfileAnalyticsEvent =
  | "relationship_profile_viewed"
  | "relationship_profile_refreshed"
  | "relationship_profile_error"
  | "relationship_profile_memory_saved"
  | "relationship_profile_answer_saved"
  | "relationship_profile_occasion_added"
  | "relationship_profile_quick_action";

export interface FiRelationshipProfileAnalyticsPayload {
  recipientId?: string;
  actionId?: string;
}

const RELATIONSHIP_PROFILE_ANALYTICS_EVENT = "fi-relationship-profile-analytics";

export function trackRelationshipProfileEvent(
  event: FiRelationshipProfileAnalyticsEvent,
  payload: FiRelationshipProfileAnalyticsPayload = {},
): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(RELATIONSHIP_PROFILE_ANALYTICS_EVENT, {
      detail: { event, payload, timestamp: Date.now() },
    }),
  );

  if (import.meta.env.DEV) {
    console.debug("[fi-relationship-profile-analytics]", event, payload);
  }
}
