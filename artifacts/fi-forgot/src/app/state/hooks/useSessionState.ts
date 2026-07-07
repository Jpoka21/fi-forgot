import { useMemo } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { getServerUserId } from "@/lib/data";
import type { SessionState } from "@/app/state/types";

export function useSessionState(): SessionState {
  const { authReady, isLoggedIn, onboardingComplete, activeWorkspace, workspaces } = useAuth();

  return useMemo(
    () => ({
      authReady,
      isLoggedIn,
      onboardingComplete,
      serverUserId: getServerUserId(),
      activeWorkspace,
      workspaces,
    }),
    [activeWorkspace, authReady, isLoggedIn, onboardingComplete, workspaces],
  );
}
