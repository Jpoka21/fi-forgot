import type { AppSettings, FeatureFlags } from "@/app/state/types";

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableNotificationCenter: false,
  enableCommandPalette: false,
  enableGlobalSearch: true,
  enableExperimentalConcierge: false,
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  showConnectivityBanner: true,
  announceRouteChanges: false,
};

export const DEFAULT_CONNECTIVITY_STATUS = {
  status: "online" as const,
  isOnline: true,
  lastChangedAt: null,
};
