import type { AppTheme } from "@/app/providers/ThemeProvider";
import type { PersonalSettings } from "@/lib/data";
import type { RecipientAddress } from "@/lib/data";
import type { Workspace } from "@/lib/auth-context";

export const ACCOUNT_PREFS_STORAGE_KEY = "fi_forgot_account_prefs";
export const ACCOUNT_THEME_STORAGE_KEY = "fi_forgot_theme";

export type AccountLanguage = "en" | "es" | "fr";

export type NotifyChannelUi = "email" | "text" | "both";

export interface AccountPreferences {
  language: AccountLanguage;
  reducedMotion: boolean;
  confirmBeforeSignOut: boolean;
  securityEmailAlerts: boolean;
}

export const DEFAULT_ACCOUNT_PREFERENCES: AccountPreferences = {
  language: "en",
  reducedMotion: false,
  confirmBeforeSignOut: true,
  securityEmailAlerts: true,
};

export interface AccountProfileDraft {
  name: string;
  email: string;
}

export interface AccountNotificationDraft {
  channel: NotifyChannelUi;
  notifyEmail: string;
  notifyPhone: string;
}

export interface FiAccountSettingsSnapshot {
  profile: {
    name: string;
    email: string;
    initials: string;
    mailingAddress: RecipientAddress | null;
  };
  notification: AccountNotificationDraft;
  preferences: AccountPreferences;
  appearance: {
    theme: AppTheme;
    resolvedTheme: "light" | "dark";
  };
  accessibility: {
    announceRouteChanges: boolean;
    showConnectivityBanner: boolean;
    reducedMotion: boolean;
  };
  session: {
    statusLabel: string;
    isActive: boolean;
  };
  connectedAccounts: Array<{
    id: string;
    name: string;
    type: Workspace["type"];
    isActive: boolean;
  }>;
  usesPasswordlessAuth: boolean;
}

export const accountSettingsDefaults = {
  title: "Account",
  description: "Manage how your concierge knows you and keeps your account secure.",
  saveProfileLabel: "Save profile",
  saveEmailLabel: "Save email",
  saveNotificationsLabel: "Save notification preferences",
  saveAddressLabel: "Save mailing address",
  signOutLabel: "Sign out",
  remindersLinkLabel: "Reminder timing preferences",
  remindersHelper:
    "For when we remind you about upcoming cards, visit your reminder preferences.",
  passwordTitle: "Password",
  passwordDescription:
    "F.I. Forgot uses a calm sign-in link sent to your email. There is no password to manage here.",
  profileSavedLabel: "Profile updated.",
  emailSavedLabel: "Email updated.",
  notificationsSavedLabel: "Notification preferences saved.",
  addressSavedLabel: "Mailing address saved.",
  signOutConfirm: "Sign out of F.I. Forgot on this device?",
  loadErrorLabel: "We couldn't load your account settings right now.",
} as const;

export function channelToPersonal(channel: NotifyChannelUi): PersonalSettings["notifyChannel"] {
  if (channel === "text") return "text";
  if (channel === "both") return "both";
  return "email";
}

export function channelFromPersonal(channel: PersonalSettings["notifyChannel"]): NotifyChannelUi {
  if (channel === "text") return "text";
  if (channel === "both") return "both";
  return "email";
}

export function buildProfileInitials(name: string, email: string): string {
  const source = name.trim() || email.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}
