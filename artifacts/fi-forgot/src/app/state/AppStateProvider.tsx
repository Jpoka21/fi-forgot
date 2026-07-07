import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_CONNECTIVITY_STATUS,
  DEFAULT_FEATURE_FLAGS,
} from "@/app/state/defaults";
import { createPassiveAuthRefreshHandlers } from "@/app/state/session/authRefresh";
import type {
  AppErrorState,
  AppSettings,
  AppStateContextValue,
  ConnectivityState,
  FeatureFlags,
} from "@/app/state/types";

const AppStateContext = createContext<AppStateContextValue | null>(null);

function getInitialConnectivity(): ConnectivityState {
  if (typeof navigator === "undefined") {
    return DEFAULT_CONNECTIVITY_STATUS;
  }

  const isOnline = navigator.onLine;

  return {
    status: isOnline ? "online" : "offline",
    isOnline,
    lastChangedAt: null,
  };
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [connectivity, setConnectivity] = useState<ConnectivityState>(getInitialConnectivity);
  const [error, setError] = useState<AppErrorState>({ message: null, source: null });
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [lastRefreshRequestedAt, setLastRefreshRequestedAt] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncConnectivity = (isOnline: boolean) => {
      setConnectivity({
        status: isOnline ? "online" : "offline",
        isOnline,
        lastChangedAt: Date.now(),
      });
    };

    const handleOnline = () => syncConnectivity(true);
    const handleOffline = () => syncConnectivity(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const setAppError = useCallback((message: string, source?: string) => {
    setError({ message, source: source ?? null });
  }, []);

  const clearAppError = useCallback(() => {
    setError({ message: null, source: null });
  }, []);

  const setFeatureFlag = useCallback(
    <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => {
      setFeatureFlags((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const updateAppSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const authRefreshHandlers = useMemo(
    () => createPassiveAuthRefreshHandlers(setLastRefreshRequestedAt),
    [],
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      connectivity,
      error,
      setAppError,
      clearAppError,
      featureFlags,
      setFeatureFlag,
      settings,
      updateAppSettings,
      authRefresh: {
        lastRefreshRequestedAt,
        requestRefresh: authRefreshHandlers.requestRefresh,
      },
    }),
    [
      authRefreshHandlers.requestRefresh,
      clearAppError,
      connectivity,
      error,
      featureFlags,
      lastRefreshRequestedAt,
      setAppError,
      setFeatureFlag,
      settings,
      updateAppSettings,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppStateContext(): AppStateContextValue {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppStateContext must be used within AppStateProvider");
  }

  return context;
}
