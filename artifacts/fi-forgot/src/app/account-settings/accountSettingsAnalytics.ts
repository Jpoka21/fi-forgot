type AccountSettingsAnalyticsPayload = Record<string, string | number | boolean | undefined>;

const ACCOUNT_SETTINGS_ANALYTICS_EVENT = "fi-account-settings-analytics";

export type AccountSettingsAnalyticsEvent =
  | "account_settings_opened"
  | "account_settings_profile_saved"
  | "account_settings_email_saved"
  | "account_settings_notifications_saved"
  | "account_settings_address_saved"
  | "account_settings_preferences_saved"
  | "account_settings_sign_out"
  | "account_settings_error";

export function trackAccountSettingsEvent(
  event: AccountSettingsAnalyticsEvent,
  payload?: AccountSettingsAnalyticsPayload,
): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(ACCOUNT_SETTINGS_ANALYTICS_EVENT, {
        detail: { event, payload, at: Date.now() },
      }),
    );
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- dev analytics mirror
    console.debug("[fi-account-settings-analytics]", event, payload);
  }
}
