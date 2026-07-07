type AdminAnalyticsPayload = Record<string, string | number | boolean | undefined>;

const ADMIN_ANALYTICS_EVENT = "fi-admin-analytics";

export type AdminAnalyticsEvent =
  | "admin_opened"
  | "admin_tab_changed"
  | "admin_sync"
  | "admin_reset_requested"
  | "admin_search"
  | "admin_illustration_toggled"
  | "admin_copy_saved"
  | "admin_copy_published";

export function trackAdminEvent(event: AdminAnalyticsEvent, payload?: AdminAnalyticsPayload): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(ADMIN_ANALYTICS_EVENT, {
        detail: { event, payload, at: Date.now() },
      }),
    );
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- dev analytics mirror
    console.debug("[fi-admin-analytics]", event, payload);
  }
}
