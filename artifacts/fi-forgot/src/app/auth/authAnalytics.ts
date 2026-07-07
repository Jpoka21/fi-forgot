type AuthAnalyticsPayload = Record<string, string | number | boolean | undefined>;

const AUTH_ANALYTICS_EVENT = "fi-auth-analytics";

export type AuthAnalyticsEvent =
  | "auth_opened"
  | "auth_login_submitted"
  | "auth_login_success"
  | "auth_login_error"
  | "auth_signup_submitted"
  | "auth_signup_success"
  | "auth_forgot_password"
  | "auth_recovery_view";

export function trackAuthEvent(event: AuthAnalyticsEvent, payload?: AuthAnalyticsPayload): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(AUTH_ANALYTICS_EVENT, {
        detail: { event, payload, at: Date.now() },
      }),
    );
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- dev analytics mirror
    console.debug("[fi-auth-analytics]", event, payload);
  }
}
