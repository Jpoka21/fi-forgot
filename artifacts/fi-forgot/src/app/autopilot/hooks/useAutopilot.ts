import { useCallback, useEffect, useState } from "react";

import { trackAutopilotEvent } from "@/app/autopilot/autopilotAnalytics";
import {
  AUTOPILOT_PAUSED_KEY,
  autopilotDefaults,
  type FiAutopilotSnapshot,
} from "@/app/autopilot/autopilotDomain";
import { buildAutopilotSnapshot } from "@/app/autopilot/autopilotEngine";
import { useAuth } from "@/lib/auth-context";
import { getPersonalSettings, savePersonalSettings } from "@/lib/data";

function readPausedState(): boolean {
  try {
    return localStorage.getItem(AUTOPILOT_PAUSED_KEY) === "1";
  } catch {
    return false;
  }
}

function writePausedState(paused: boolean): void {
  localStorage.setItem(AUTOPILOT_PAUSED_KEY, paused ? "1" : "0");
}

export function useAutopilot() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<FiAutopilotSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(readPausedState);
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === "undefined" || navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      trackAutopilotEvent("autopilot_offline");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const refresh = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!isOnline) {
        setError(autopilotDefaults.offlineLabel);
        return;
      }

      if (options.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const nextSnapshot = buildAutopilotSnapshot({
          userEmail: user?.email,
          isPaused,
          isOnline,
        });
        setSnapshot(nextSnapshot);
        setError(null);
        trackAutopilotEvent(
          options.silent ? "autopilot_refreshed" : "autopilot_opened",
          {
            runtimeState: nextSnapshot.runtimeState,
            pendingReviewCount: nextSnapshot.pendingReviewCount,
          },
        );
      } catch (refreshError) {
        setError(autopilotDefaults.errorLabel);
        trackAutopilotEvent("autopilot_error");
        if (import.meta.env.DEV) {
          console.error(refreshError);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isOnline, isPaused, user?.email],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const enableAutopilot = useCallback(() => {
    const settings = getPersonalSettings();
    savePersonalSettings({ ...settings, automationMode: "autopilot" });
    writePausedState(false);
    setIsPaused(false);
    trackAutopilotEvent("autopilot_enabled");
    void refresh({ silent: true });
  }, [refresh]);

  const disableAutopilot = useCallback(() => {
    const settings = getPersonalSettings();
    savePersonalSettings({ ...settings, automationMode: "approve" });
    trackAutopilotEvent("autopilot_disabled");
    void refresh({ silent: true });
  }, [refresh]);

  const pauseAutopilot = useCallback(() => {
    writePausedState(true);
    setIsPaused(true);
    trackAutopilotEvent("autopilot_paused");
    void refresh({ silent: true });
  }, [refresh]);

  const resumeAutopilot = useCallback(() => {
    writePausedState(false);
    setIsPaused(false);
    trackAutopilotEvent("autopilot_resumed");
    void refresh({ silent: true });
  }, [refresh]);

  return {
    snapshot,
    isLoading,
    isRefreshing,
    error,
    isOnline,
    isPaused,
    showEmpty: !isLoading && !error && Boolean(snapshot?.isEmpty),
    refresh,
    enableAutopilot,
    disableAutopilot,
    pauseAutopilot,
    resumeAutopilot,
  };
}

export type AutopilotController = ReturnType<typeof useAutopilot>;
