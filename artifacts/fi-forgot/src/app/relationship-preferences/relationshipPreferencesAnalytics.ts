type RelationshipPreferencesAnalyticsPayload = Record<string, string | number | boolean | undefined>;

const RELATIONSHIP_PREFS_ANALYTICS_EVENT = "fi-relationship-preferences-analytics";

export type RelationshipPreferencesAnalyticsEvent =
  | "relationship_preferences_opened"
  | "relationship_preferences_saved"
  | "relationship_preferences_personal_saved"
  | "relationship_preferences_exported"
  | "relationship_preferences_error";

export function trackRelationshipPreferencesEvent(
  event: RelationshipPreferencesAnalyticsEvent,
  payload?: RelationshipPreferencesAnalyticsPayload,
): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(RELATIONSHIP_PREFS_ANALYTICS_EVENT, {
        detail: { event, payload, at: Date.now() },
      }),
    );
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- dev analytics mirror
    console.debug("[fi-relationship-preferences-analytics]", event, payload);
  }
}
