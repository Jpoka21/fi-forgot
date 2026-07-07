import type { AppSettings } from "@/app/state/types";
import type { AppTheme } from "@/app/providers/ThemeProvider";
import type { Workspace } from "@/lib/auth-context";
import type { PersonalSettings } from "@/lib/data";
import type { RecipientAddress } from "@/lib/data";
import {
  ACCOUNT_PREFS_STORAGE_KEY,
  ACCOUNT_THEME_STORAGE_KEY,
  DEFAULT_ACCOUNT_PREFERENCES,
  accountSettingsDefaults,
  buildProfileInitials,
  channelFromPersonal,
  type AccountLanguage,
  type AccountNotificationDraft,
  type AccountPreferences,
  type AccountProfileDraft,
  type FiAccountSettingsSnapshot,
} from "@/app/account-settings/accountSettingsDomain";
import { deriveSessionExpirationStatus, isSessionActive } from "@/app/state/session/expiration";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function readAccountPreferences(): AccountPreferences {
  try {
    const raw = localStorage.getItem(ACCOUNT_PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ACCOUNT_PREFERENCES };
    return { ...DEFAULT_ACCOUNT_PREFERENCES, ...JSON.parse(raw) as Partial<AccountPreferences> };
  } catch {
    return { ...DEFAULT_ACCOUNT_PREFERENCES };
  }
}

export function writeAccountPreferences(prefs: AccountPreferences): void {
  localStorage.setItem(ACCOUNT_PREFS_STORAGE_KEY, JSON.stringify(prefs));
}

export function readStoredTheme(): AppTheme | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeStoredTheme(theme: AppTheme): void {
  localStorage.setItem(ACCOUNT_THEME_STORAGE_KEY, theme);
}

export function validateProfileDraft(draft: AccountProfileDraft): string | null {
  const name = draft.name.trim();
  if (!name) return "Please enter your name.";
  if (name.length > 100) return "Name must be 100 characters or fewer.";
  return null;
}

export function validateEmailDraft(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Please enter your email address.";
  if (!EMAIL_PATTERN.test(trimmed)) return "Please enter a valid email address.";
  return null;
}

export function validateNotificationDraft(draft: AccountNotificationDraft): string | null {
  if (draft.channel === "email" || draft.channel === "both") {
    const email = draft.notifyEmail.trim();
    if (email && !EMAIL_PATTERN.test(email)) {
      return "Please enter a valid notification email.";
    }
  }
  return null;
}

export function validateMailingAddress(address: RecipientAddress): string | null {
  if (!address.line1.trim()) return "Street address is required.";
  if (!address.city.trim()) return "City is required.";
  if (!address.state.trim()) return "State is required.";
  if (!address.zip.trim()) return "Zip code is required.";
  return null;
}

export function applyAccessibilityEffects(input: {
  reducedMotion: boolean;
  language: AccountLanguage;
}): void {
  document.documentElement.dataset.reducedMotion = input.reducedMotion ? "true" : "false";
  document.documentElement.lang = input.language;
}

export function buildAccountSettingsSnapshot(input: {
  userName?: string;
  userEmail?: string;
  mailingAddress?: RecipientAddress | null;
  personalSettings: PersonalSettings;
  preferences: AccountPreferences;
  appSettings: AppSettings;
  theme: AppTheme;
  resolvedTheme: "light" | "dark";
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  authReady: boolean;
  isLoggedIn: boolean;
}): FiAccountSettingsSnapshot {
  const name = input.userName ?? "";
  const email = input.userEmail ?? "";
  const sessionStatus = deriveSessionExpirationStatus({
    authReady: input.authReady,
    isLoggedIn: input.isLoggedIn,
  });
  const active = isSessionActive(sessionStatus);

  const statusLabel =
    sessionStatus === "active"
      ? "You're signed in on this device."
      : sessionStatus === "expired"
        ? "Your session may have expired. Sign in again if something looks off."
        : sessionStatus === "unauthenticated"
          ? "You're not signed in."
          : "Checking your session…";

  return {
    profile: {
      name,
      email,
      initials: buildProfileInitials(name, email),
      mailingAddress: input.mailingAddress ?? null,
    },
    notification: {
      channel: channelFromPersonal(input.personalSettings.notifyChannel),
      notifyEmail: input.personalSettings.notifyEmail || email,
      notifyPhone: input.personalSettings.notifyPhone,
    },
    preferences: input.preferences,
    appearance: {
      theme: input.theme,
      resolvedTheme: input.resolvedTheme,
    },
    accessibility: {
      announceRouteChanges: input.appSettings.announceRouteChanges,
      showConnectivityBanner: input.appSettings.showConnectivityBanner,
      reducedMotion: input.preferences.reducedMotion,
    },
    session: {
      statusLabel,
      isActive: active,
    },
    connectedAccounts: input.workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      type: workspace.type,
      isActive: workspace.id === input.activeWorkspaceId,
    })),
    usesPasswordlessAuth: true,
  };
}

export function sessionStatusForAnalytics(snapshot: FiAccountSettingsSnapshot): string {
  return snapshot.session.isActive ? "active" : "inactive";
}

export function accountSettingsErrorLabel(source: string): string {
  return source || accountSettingsDefaults.description;
}
