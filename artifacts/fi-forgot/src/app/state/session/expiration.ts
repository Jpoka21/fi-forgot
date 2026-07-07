import type { SessionExpirationStatus } from "@/app/state/types";

/**
 * Passive session expiration helper.
 *
 * Does not sign users out or call auth APIs. Server session TTL is not exposed yet.
 */
export function deriveSessionExpirationStatus(input: {
  authReady: boolean;
  isLoggedIn: boolean;
}): SessionExpirationStatus {
  if (!input.authReady) {
    return "unknown";
  }

  if (!input.isLoggedIn) {
    return "unauthenticated";
  }

  return "active";
}

export function isSessionActive(status: SessionExpirationStatus): boolean {
  return status === "active";
}
