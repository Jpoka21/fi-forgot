import type { Plan } from "@/lib/plan";
import type { AppTheme, ResolvedAppTheme } from "@/app/providers/ThemeProvider";
import type { Workspace } from "@/lib/auth-context";

export type ConnectivityStatus = "online" | "offline";

export interface ConnectivityState {
  status: ConnectivityStatus;
  isOnline: boolean;
  lastChangedAt: number | null;
}

export interface AppErrorState {
  message: string | null;
  source: string | null;
}

export interface FeatureFlags {
  enableNotificationCenter: boolean;
  enableCommandPalette: boolean;
  enableGlobalSearch: boolean;
  enableExperimentalConcierge: boolean;
}

export interface AppSettings {
  showConnectivityBanner: boolean;
  announceRouteChanges: boolean;
}

export interface UserState {
  user: {
    name: string;
    email: string;
    plan?: Plan;
  } | null;
  isAuthenticated: boolean;
}

export interface SessionState {
  authReady: boolean;
  isLoggedIn: boolean;
  onboardingComplete: boolean;
  serverUserId: string | null;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
}

export interface SubscriptionState {
  plan: Plan | null;
  hasActivePlan: boolean;
}

export interface ThemeState {
  theme: AppTheme;
  resolvedTheme: ResolvedAppTheme;
  setTheme: (theme: AppTheme) => void;
}

export interface NotificationCountState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: (by?: number) => void;
  clearUnreadCount: () => void;
}

export interface GlobalLoadingState {
  isLoading: boolean;
  message?: string;
  show: (message?: string) => void;
  hide: () => void;
}

export type SessionExpirationStatus =
  | "unknown"
  | "unauthenticated"
  | "active"
  | "expired";

export interface SessionExpirationState {
  status: SessionExpirationStatus;
  isSessionActive: boolean;
}

export interface AuthRefreshState {
  lastRefreshRequestedAt: number | null;
  requestRefresh: () => void;
}

export interface AppStateContextValue {
  connectivity: ConnectivityState;
  error: AppErrorState;
  setAppError: (message: string, source?: string) => void;
  clearAppError: () => void;
  featureFlags: FeatureFlags;
  setFeatureFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => void;
  settings: AppSettings;
  updateAppSettings: (patch: Partial<AppSettings>) => void;
  authRefresh: AuthRefreshState;
}
