import { useCallback, useEffect, useMemo, useState } from "react";

import { trackAccountSettingsEvent } from "@/app/account-settings/accountSettingsAnalytics";
import {
  accountSettingsDefaults,
  channelToPersonal,
  type AccountLanguage,
  type AccountNotificationDraft,
  type AccountPreferences,
  type AccountProfileDraft,
  type FiAccountSettingsSnapshot,
} from "@/app/account-settings/accountSettingsDomain";
import {
  applyAccessibilityEffects,
  buildAccountSettingsSnapshot,
  readAccountPreferences,
  readStoredTheme,
  validateEmailDraft,
  validateMailingAddress,
  validateNotificationDraft,
  validateProfileDraft,
  writeAccountPreferences,
  writeStoredTheme,
} from "@/app/account-settings/accountSettingsEngine";
import type { AppTheme } from "@/app/providers/ThemeProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useAppSettings } from "@/app/state/hooks/useAppSettings";
import { useAppStateContext } from "@/app/state/AppStateProvider";
import { useAuth } from "@/lib/auth-context";
import {
  getPersonalSettings,
  savePersonalSettings,
  type PersonalSettings,
  type RecipientAddress,
} from "@/lib/data";

const EMPTY_ADDRESS: RecipientAddress = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
};

export function useAccountSettings() {
  const {
    user,
    login,
    logout,
    workspaces,
    activeWorkspace,
    authReady,
    isLoggedIn,
    updateMailingAddress,
  } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { settings: appSettings, updateAppSettings } = useAppSettings();
  const { connectivity } = useAppStateContext();

  const [snapshot, setSnapshot] = useState<FiAccountSettingsSnapshot | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<AccountPreferences>(() => readAccountPreferences());
  const [personalSettings, setPersonalSettings] = useState<PersonalSettings>(() => getPersonalSettings());
  const [profileDraft, setProfileDraft] = useState<AccountProfileDraft>({
    name: user?.name ?? "",
    email: user?.email ?? "",
  });
  const [notificationDraft, setNotificationDraft] = useState<AccountNotificationDraft>({
    channel: "email",
    notifyEmail: user?.email ?? "",
    notifyPhone: "",
  });
  const [addressDraft, setAddressDraft] = useState<RecipientAddress>(
    user?.mailingAddress ?? EMPTY_ADDRESS,
  );
  const [profileError, setProfileError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [notificationsSaved, setNotificationsSaved] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const refreshSnapshot = useCallback(() => {
    try {
      const prefs = readAccountPreferences();
      const personal = getPersonalSettings();
      setPreferences(prefs);
      setPersonalSettings(personal);
      const nextSnapshot = buildAccountSettingsSnapshot({
        userName: user?.name,
        userEmail: user?.email,
        mailingAddress: user?.mailingAddress ?? null,
        personalSettings: personal,
        preferences: prefs,
        appSettings,
        theme,
        resolvedTheme,
        workspaces,
        activeWorkspaceId: activeWorkspace?.id ?? null,
        authReady,
        isLoggedIn,
      });
      setSnapshot(nextSnapshot);
      setProfileDraft({ name: user?.name ?? "", email: user?.email ?? "" });
      setNotificationDraft({
        channel: nextSnapshot.notification.channel,
        notifyEmail: nextSnapshot.notification.notifyEmail,
        notifyPhone: nextSnapshot.notification.notifyPhone,
      });
      setAddressDraft(user?.mailingAddress ?? EMPTY_ADDRESS);
      applyAccessibilityEffects({
        reducedMotion: prefs.reducedMotion,
        language: prefs.language,
      });
      setLoadError(null);
      return true;
    } catch {
      setLoadError(accountSettingsDefaults.loadErrorLabel);
      return false;
    }
  }, [
    activeWorkspace?.id,
    appSettings,
    authReady,
    isLoggedIn,
    resolvedTheme,
    theme,
    user?.email,
    user?.mailingAddress,
    user?.name,
    workspaces,
  ]);

  useEffect(() => {
    if (!authReady) {
      setIsReady(false);
      return;
    }
    const loaded = refreshSnapshot();
    setIsReady(loaded);
    if (loaded) {
      trackAccountSettingsEvent("account_settings_opened");
    }
  }, [authReady, refreshSnapshot]);

  const retryLoad = useCallback(() => {
    if (!authReady) return;
    setIsReady(false);
    setLoadError(null);
    const loaded = refreshSnapshot();
    setIsReady(loaded);
  }, [authReady, refreshSnapshot]);

  useEffect(() => {
    const storedTheme = readStoredTheme();
    if (storedTheme && storedTheme !== theme) {
      setTheme(storedTheme);
    }
  }, [setTheme, theme]);

  const saveProfile = useCallback(async () => {
    const error = validateProfileDraft(profileDraft);
    if (error) {
      setProfileError(error);
      return;
    }
    if (!user?.email) return;

    setIsSavingProfile(true);
    setProfileError(null);
    try {
      const trimmedName = profileDraft.name.trim();
      login(user.email, trimmedName);
      setProfileSaved(true);
      trackAccountSettingsEvent("account_settings_profile_saved");
      refreshSnapshot();
      window.setTimeout(() => setProfileSaved(false), 2500);
    } catch {
      setProfileError("We couldn't save your profile. Please try again.");
      trackAccountSettingsEvent("account_settings_error", { section: "profile" });
    } finally {
      setIsSavingProfile(false);
    }
  }, [login, profileDraft, refreshSnapshot, user?.email]);

  const saveEmail = useCallback(async () => {
    const error = validateEmailDraft(profileDraft.email);
    if (error) {
      setEmailError(error);
      return;
    }
    if (!user?.name) return;

    setIsSavingEmail(true);
    setEmailError(null);
    try {
      const trimmedEmail = profileDraft.email.trim();
      login(trimmedEmail, user.name);
      setEmailSaved(true);
      trackAccountSettingsEvent("account_settings_email_saved");
      refreshSnapshot();
      window.setTimeout(() => setEmailSaved(false), 2500);
    } catch {
      setEmailError("We couldn't update your email. Please try again.");
      trackAccountSettingsEvent("account_settings_error", { section: "email" });
    } finally {
      setIsSavingEmail(false);
    }
  }, [login, profileDraft.email, refreshSnapshot, user?.name]);

  const saveNotifications = useCallback(async () => {
    const error = validateNotificationDraft(notificationDraft);
    if (error) {
      setNotificationError(error);
      return;
    }

    setIsSavingNotifications(true);
    setNotificationError(null);
    try {
      const next: PersonalSettings = {
        ...personalSettings,
        notifyChannel: channelToPersonal(notificationDraft.channel),
        notifyEmail: notificationDraft.notifyEmail.trim(),
        notifyPhone: notificationDraft.notifyPhone.trim(),
      };
      savePersonalSettings(next);
      setPersonalSettings(next);
      setNotificationsSaved(true);
      trackAccountSettingsEvent("account_settings_notifications_saved");
      refreshSnapshot();
      window.setTimeout(() => setNotificationsSaved(false), 2500);
    } catch {
      setNotificationError("We couldn't save notification preferences. Please try again.");
      trackAccountSettingsEvent("account_settings_error", { section: "notifications" });
    } finally {
      setIsSavingNotifications(false);
    }
  }, [notificationDraft, personalSettings, refreshSnapshot]);

  const saveAddress = useCallback(async () => {
    const error = validateMailingAddress(addressDraft);
    if (error) {
      setAddressError(error);
      return;
    }

    setIsSavingAddress(true);
    setAddressError(null);
    try {
      updateMailingAddress({
        line1: addressDraft.line1.trim(),
        line2: addressDraft.line2?.trim() ?? "",
        city: addressDraft.city.trim(),
        state: addressDraft.state.trim().toUpperCase(),
        zip: addressDraft.zip.trim(),
      });
      setAddressSaved(true);
      trackAccountSettingsEvent("account_settings_address_saved");
      refreshSnapshot();
      window.setTimeout(() => setAddressSaved(false), 2500);
    } catch {
      setAddressError("We couldn't save your mailing address. Please try again.");
      trackAccountSettingsEvent("account_settings_error", { section: "address" });
    } finally {
      setIsSavingAddress(false);
    }
  }, [addressDraft, refreshSnapshot, updateMailingAddress]);

  const updatePreferences = useCallback(
    (patch: Partial<AccountPreferences>) => {
      setPreferences((current) => {
        const next = { ...current, ...patch };
        writeAccountPreferences(next);
        applyAccessibilityEffects({
          reducedMotion: next.reducedMotion,
          language: next.language,
        });
        trackAccountSettingsEvent("account_settings_preferences_saved", patch);
        refreshSnapshot();
        return next;
      });
    },
    [refreshSnapshot],
  );

  const setAppearanceTheme = useCallback(
    (nextTheme: AppTheme) => {
      setTheme(nextTheme);
      writeStoredTheme(nextTheme);
      trackAccountSettingsEvent("account_settings_preferences_saved", { theme: nextTheme });
      refreshSnapshot();
    },
    [refreshSnapshot, setTheme],
  );

  const updateAccessibility = useCallback(
    (patch: { announceRouteChanges?: boolean; showConnectivityBanner?: boolean; reducedMotion?: boolean }) => {
      if (patch.announceRouteChanges !== undefined || patch.showConnectivityBanner !== undefined) {
        updateAppSettings({
          announceRouteChanges: patch.announceRouteChanges ?? appSettings.announceRouteChanges,
          showConnectivityBanner: patch.showConnectivityBanner ?? appSettings.showConnectivityBanner,
        });
      }
      if (patch.reducedMotion !== undefined) {
        updatePreferences({ reducedMotion: patch.reducedMotion });
      } else {
        refreshSnapshot();
      }
    },
    [appSettings.announceRouteChanges, appSettings.showConnectivityBanner, refreshSnapshot, updateAppSettings, updatePreferences],
  );

  const setLanguage = useCallback(
    (language: AccountLanguage) => {
      updatePreferences({ language });
    },
    [updatePreferences],
  );

  const signOut = useCallback(() => {
    const shouldConfirm = preferences.confirmBeforeSignOut;
    if (shouldConfirm && !window.confirm(accountSettingsDefaults.signOutConfirm)) {
      return;
    }
    trackAccountSettingsEvent("account_settings_sign_out");
    logout();
  }, [logout, preferences.confirmBeforeSignOut]);

  const defaults = useMemo(() => accountSettingsDefaults, []);

  return {
    snapshot,
    defaults,
    isReady,
    isLoading: !authReady || !isReady,
    loadError,
    isOffline: !connectivity.isOnline,
    retryLoad,
    profileDraft,
    setProfileDraft,
    notificationDraft,
    setNotificationDraft,
    addressDraft,
    setAddressDraft,
    profileError,
    emailError,
    notificationError,
    addressError,
    profileSaved,
    emailSaved,
    notificationsSaved,
    addressSaved,
    isSavingProfile,
    isSavingEmail,
    isSavingNotifications,
    isSavingAddress,
    preferences,
    saveProfile,
    saveEmail,
    saveNotifications,
    saveAddress,
    updatePreferences,
    setAppearanceTheme,
    updateAccessibility,
    setLanguage,
    signOut,
    refreshSnapshot,
  };
}
