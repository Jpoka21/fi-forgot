import { useMemo } from "react";
import { deriveSessionExpirationStatus, isSessionActive } from "@/app/state/session/expiration";
import { useSessionState } from "@/app/state/hooks/useSessionState";
import type { SessionExpirationState } from "@/app/state/types";

export function useSessionExpiration(): SessionExpirationState {
  const session = useSessionState();

  return useMemo(() => {
    const status = deriveSessionExpirationStatus({
      authReady: session.authReady,
      isLoggedIn: session.isLoggedIn,
    });

    return {
      status,
      isSessionActive: isSessionActive(status),
    };
  }, [session.authReady, session.isLoggedIn]);
}
