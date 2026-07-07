import { useAppError } from "@/app/state/hooks/useAppError";
import { useAppSettings } from "@/app/state/hooks/useAppSettings";
import { useAuthRefresh } from "@/app/state/hooks/useAuthRefresh";
import { useConnectivity } from "@/app/state/hooks/useConnectivity";
import { useFeatureFlags } from "@/app/state/hooks/useFeatureFlags";
import { useGlobalLoading } from "@/app/state/hooks/useGlobalLoading";
import { useNotificationCount } from "@/app/state/hooks/useNotificationCount";
import { useSessionExpiration } from "@/app/state/hooks/useSessionExpiration";
import { useSessionState } from "@/app/state/hooks/useSessionState";
import { useSubscriptionState } from "@/app/state/hooks/useSubscriptionState";
import { useThemeState } from "@/app/state/hooks/useThemeState";
import { useUserState } from "@/app/state/hooks/useUserState";

/**
 * Composite read model for app-layer global state.
 * Derives from existing providers — does not duplicate auth or API behavior.
 */
export function useAppState() {
  return {
    user: useUserState(),
    session: useSessionState(),
    subscription: useSubscriptionState(),
    theme: useThemeState(),
    notifications: useNotificationCount(),
    loading: useGlobalLoading(),
    featureFlags: useFeatureFlags(),
    settings: useAppSettings(),
    error: useAppError(),
    connectivity: useConnectivity(),
    sessionExpiration: useSessionExpiration(),
    authRefresh: useAuthRefresh(),
  };
}
