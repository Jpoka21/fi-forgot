import { Link } from "wouter";

import type { AccountLanguage, NotifyChannelUi } from "@/app/account-settings/accountSettingsDomain";
import type { AppTheme } from "@/app/providers/ThemeProvider";
import { FiButton } from "@/app/components/button/FiButton";
import {
  FiCard,
  FiCardContent,
  FiCardDescription,
  FiCardHeader,
  FiCardTitle,
} from "@/app/components/card/FiCard";
import { FiField } from "@/app/components/input/FiField";
import { FiInput } from "@/app/components/input/FiInput";
import { FiSelect } from "@/app/components/input/FiSelect";
import { FiSwitch } from "@/app/components/input/FiSwitch";
import { FiSettingsEmptyState } from "@/app/components/settings";
import { getFiAccountSettingsSectionClassName } from "@/app/components/account-settings/accountSettingsVariants";
import { ROUTE_PATHS } from "@/app/routes/routePaths";
import type { RecipientAddress } from "@/lib/data";
import type { useAccountSettings } from "@/app/account-settings/hooks/useAccountSettings";

type AccountSettings = ReturnType<typeof useAccountSettings>;

interface OptionChoiceProps {
  active: boolean;
  label: string;
  detail: string;
  onSelect: () => void;
}

function OptionChoice({ active, label, detail, onSelect }: OptionChoiceProps) {
  return (
    <li>
      <button
        type="button"
        className={`fi-account-settings__option${active ? " fi-account-settings__option--active" : ""}`}
        aria-pressed={active}
        onClick={onSelect}
      >
        <div>
          <div className="fi-account-settings__option-label">{label}</div>
          <div className="fi-account-settings__option-detail">{detail}</div>
        </div>
      </button>
    </li>
  );
}

export function FiAccountProfileSection({ settings }: { settings: AccountSettings }) {
  const { snapshot, profileDraft, setProfileDraft, profileError, profileSaved, isSavingProfile, saveProfile } =
    settings;
  if (!snapshot) return null;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Your profile</FiCardTitle>
        <FiCardDescription>The basics your concierge uses to keep things personal.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiAccountSettingsSectionClassName()}>
        <div className="fi-account-settings__avatar" aria-hidden>
          {snapshot.profile.initials}
        </div>
        <FiField label="Full name" htmlFor="account-profile-name" errorText={profileError} required>
          <FiInput
            id="account-profile-name"
            value={profileDraft.name}
            onChange={(event) => {
              setProfileDraft((current) => ({ ...current, name: event.target.value }));
            }}
            autoComplete="name"
            maxLength={100}
          />
        </FiField>
        <div className="fi-account-settings__actions">
          <FiButton loading={isSavingProfile} onClick={() => void saveProfile()}>
            {settings.defaults.saveProfileLabel}
          </FiButton>
          {profileSaved ? (
            <output className="fi-account-settings__saved">{settings.defaults.profileSavedLabel}</output>
          ) : null}
        </div>
      </FiCardContent>
    </FiCard>
  );
}

export function FiAccountEmailSection({ settings }: { settings: AccountSettings }) {
  const { snapshot, profileDraft, setProfileDraft, emailError, emailSaved, isSavingEmail, saveEmail } = settings;
  if (!snapshot) return null;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Email</FiCardTitle>
        <FiCardDescription>Your primary sign-in and account identifier.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiAccountSettingsSectionClassName()}>
        <FiField
          label="Email address"
          htmlFor="account-profile-email"
          helperText="Changing your email updates how you sign in on this device."
          errorText={emailError}
          required
        >
          <FiInput
            id="account-profile-email"
            type="email"
            value={profileDraft.email}
            onChange={(event) => {
              setProfileDraft((current) => ({ ...current, email: event.target.value }));
            }}
            autoComplete="email"
          />
        </FiField>
        <div className="fi-account-settings__actions">
          <FiButton loading={isSavingEmail} onClick={() => void saveEmail()}>
            {settings.defaults.saveEmailLabel}
          </FiButton>
          {emailSaved ? (
            <output className="fi-account-settings__saved">{settings.defaults.emailSavedLabel}</output>
          ) : null}
        </div>
      </FiCardContent>
    </FiCard>
  );
}

export function FiAccountPasswordSection({ settings }: { settings: AccountSettings }) {
  if (!settings.snapshot) return null;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>{settings.defaults.passwordTitle}</FiCardTitle>
        <FiCardDescription>{settings.defaults.passwordDescription}</FiCardDescription>
      </FiCardHeader>
    </FiCard>
  );
}

export function FiAccountSecuritySection({ settings }: { settings: AccountSettings }) {
  const { preferences, updatePreferences } = settings;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Security preferences</FiCardTitle>
        <FiCardDescription>Small choices that help you stay in control.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiAccountSettingsSectionClassName()}>
        <FiField
          label="Confirm before sign out"
          helperText="Ask once before leaving your account on this device."
        >
          <FiSwitch
            checked={preferences.confirmBeforeSignOut}
            onCheckedChange={(checked) => updatePreferences({ confirmBeforeSignOut: checked })}
            aria-label="Confirm before sign out"
          />
        </FiField>
        <FiField
          label="Security email alerts"
          helperText="We'll let you know about important account changes by email when available."
        >
          <FiSwitch
            checked={preferences.securityEmailAlerts}
            onCheckedChange={(checked) => updatePreferences({ securityEmailAlerts: checked })}
            aria-label="Security email alerts"
          />
        </FiField>
      </FiCardContent>
    </FiCard>
  );
}

export function FiAccountSessionSection({ settings }: { settings: AccountSettings }) {
  const { snapshot, signOut } = settings;
  if (!snapshot) return null;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Session</FiCardTitle>
        <FiCardDescription>{snapshot.session.statusLabel}</FiCardDescription>
      </FiCardHeader>
      <FiCardContent>
        <FiButton variant="secondary" onClick={signOut}>
          {settings.defaults.signOutLabel}
        </FiButton>
      </FiCardContent>
    </FiCard>
  );
}

export function FiAccountConnectedSection({ settings }: { settings: AccountSettings }) {
  const { snapshot } = settings;
  if (!snapshot) return null;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Connected accounts</FiCardTitle>
        <FiCardDescription>Workspaces linked to your sign-in on this device.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent>
        {snapshot.connectedAccounts.length === 0 ? (
          <FiSettingsEmptyState
            title="No connected workspaces"
            description="When you add a business or personal workspace, it will appear here."
          />
        ) : (
          snapshot.connectedAccounts.map((account) => (
            <div key={account.id} className="fi-account-settings__connected">
              <div>
                <div className="fi-account-settings__option-label">{account.name}</div>
                <div className="fi-account-settings__option-detail">
                  {account.type === "business" ? "Business workspace" : "Personal workspace"}
                </div>
              </div>
              {account.isActive ? <span className="fi-account-settings__badge">Active</span> : null}
            </div>
          ))
        )}
      </FiCardContent>
    </FiCard>
  );
}

export function FiAccountAccessibilitySection({ settings }: { settings: AccountSettings }) {
  const { snapshot, updateAccessibility } = settings;
  if (!snapshot) return null;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Accessibility</FiCardTitle>
        <FiCardDescription>Make the experience easier to follow and navigate.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiAccountSettingsSectionClassName()}>
        <FiField label="Reduce motion" helperText="Minimize animations across the app.">
          <FiSwitch
            checked={snapshot.accessibility.reducedMotion}
            onCheckedChange={(checked) => updateAccessibility({ reducedMotion: checked })}
            aria-label="Reduce motion"
          />
        </FiField>
        <FiField label="Announce page changes" helperText="Help screen readers know when you move to a new page.">
          <FiSwitch
            checked={snapshot.accessibility.announceRouteChanges}
            onCheckedChange={(checked) => updateAccessibility({ announceRouteChanges: checked })}
            aria-label="Announce page changes"
          />
        </FiField>
        <FiField label="Connectivity banner" helperText="Show a gentle banner when you're offline.">
          <FiSwitch
            checked={snapshot.accessibility.showConnectivityBanner}
            onCheckedChange={(checked) => updateAccessibility({ showConnectivityBanner: checked })}
            aria-label="Connectivity banner"
          />
        </FiField>
      </FiCardContent>
    </FiCard>
  );
}

const CHANNEL_OPTIONS: Array<{ value: NotifyChannelUi; label: string; detail: string }> = [
  { value: "text", label: "Text message", detail: "A friendly text when something needs you." },
  { value: "email", label: "Email", detail: "A calm email when a card is ready." },
  { value: "both", label: "Both", detail: "We'll use whichever reaches you best." },
];

export function FiAccountNotificationSection({ settings }: { settings: AccountSettings }) {
  const {
    notificationDraft,
    setNotificationDraft,
    notificationError,
    notificationsSaved,
    isSavingNotifications,
    saveNotifications,
  } = settings;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Notification preferences</FiCardTitle>
        <FiCardDescription>How your concierge reaches you for account-level updates.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiAccountSettingsSectionClassName()}>
        <p className="fi-account-settings__section-copy">Preferred channel</p>
        <ul className="fi-account-settings__option-list">
          {CHANNEL_OPTIONS.map((option) => (
            <OptionChoice
              key={option.value}
              active={notificationDraft.channel === option.value}
              label={option.label}
              detail={option.detail}
              onSelect={() => {
                setNotificationDraft((current) => ({ ...current, channel: option.value }));
              }}
            />
          ))}
        </ul>

        {notificationDraft.channel !== "text" ? (
          <FiField label="Notification email" htmlFor="account-notify-email" errorText={notificationError}>
            <FiInput
              id="account-notify-email"
              type="email"
              value={notificationDraft.notifyEmail}
              onChange={(event) => {
                setNotificationDraft((current) => ({ ...current, notifyEmail: event.target.value }));
              }}
              autoComplete="email"
            />
          </FiField>
        ) : null}

        {notificationDraft.channel !== "email" ? (
          <FiField label="Mobile number" htmlFor="account-notify-phone">
            <FiInput
              id="account-notify-phone"
              type="tel"
              value={notificationDraft.notifyPhone}
              onChange={(event) => {
                setNotificationDraft((current) => ({ ...current, notifyPhone: event.target.value }));
              }}
              autoComplete="tel"
            />
          </FiField>
        ) : null}

        <p className="fi-account-settings__section-copy">
          {settings.defaults.remindersHelper}{" "}
          <Link href={ROUTE_PATHS.settingsReminders}>{settings.defaults.remindersLinkLabel}</Link>.
        </p>

        <div className="fi-account-settings__actions">
          <FiButton loading={isSavingNotifications} onClick={() => void saveNotifications()}>
            {settings.defaults.saveNotificationsLabel}
          </FiButton>
          {notificationsSaved ? (
            <output className="fi-account-settings__saved">{settings.defaults.notificationsSavedLabel}</output>
          ) : null}
        </div>
      </FiCardContent>
    </FiCard>
  );
}

const THEME_OPTIONS: Array<{ value: AppTheme; label: string; detail: string }> = [
  { value: "light", label: "Light", detail: "Warm and bright, like a handwritten note in daylight." },
  { value: "dark", label: "Dark", detail: "Softer contrast for evening review." },
  { value: "system", label: "Match device", detail: "Follow your phone or computer setting." },
];

export function FiAccountAppearanceSection({ settings }: { settings: AccountSettings }) {
  const { snapshot, setAppearanceTheme } = settings;
  if (!snapshot) return null;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Appearance</FiCardTitle>
        <FiCardDescription>Choose how F.I. Forgot looks on this device.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiAccountSettingsSectionClassName()}>
        <ul className="fi-account-settings__option-list">
          {THEME_OPTIONS.map((option) => (
            <OptionChoice
              key={option.value}
              active={snapshot.appearance.theme === option.value}
              label={option.label}
              detail={option.detail}
              onSelect={() => setAppearanceTheme(option.value)}
            />
          ))}
        </ul>
      </FiCardContent>
    </FiCard>
  );
}

const LANGUAGE_OPTIONS: Array<{ value: AccountLanguage; label: string }> = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
];

export function FiAccountLanguageSection({ settings }: { settings: AccountSettings }) {
  const { preferences, setLanguage } = settings;

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Language</FiCardTitle>
        <FiCardDescription>Choose the language used across the interface.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent>
        <FiField label="Display language" htmlFor="account-language">
          <FiSelect
            id="account-language"
            value={preferences.language}
            onChange={(event) => setLanguage(event.target.value as AccountLanguage)}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FiSelect>
        </FiField>
      </FiCardContent>
    </FiCard>
  );
}

export function FiAccountMailingAddressSection({ settings }: { settings: AccountSettings }) {
  const { addressDraft, setAddressDraft, addressError, addressSaved, isSavingAddress, saveAddress } = settings;

  const updateAddress = (patch: Partial<RecipientAddress>) => {
    setAddressDraft((current) => ({ ...current, ...patch }));
  };

  return (
    <FiCard variant="standard">
      <FiCardHeader>
        <FiCardTitle>Mailing address</FiCardTitle>
        <FiCardDescription>Your default return address for cards we send on your behalf.</FiCardDescription>
      </FiCardHeader>
      <FiCardContent className={getFiAccountSettingsSectionClassName()}>
        <div className="fi-account-settings__address-grid">
          <FiField label="Street address" htmlFor="account-address-line1" errorText={addressError} required>
            <FiInput
              id="account-address-line1"
              value={addressDraft.line1}
              onChange={(event) => updateAddress({ line1: event.target.value })}
              autoComplete="address-line1"
            />
          </FiField>
          <FiField label="Apt / Suite (optional)" htmlFor="account-address-line2">
            <FiInput
              id="account-address-line2"
              value={addressDraft.line2 ?? ""}
              onChange={(event) => updateAddress({ line2: event.target.value })}
              autoComplete="address-line2"
            />
          </FiField>
          <div className="fi-account-settings__address-grid fi-account-settings__address-grid--city">
            <FiField label="City" htmlFor="account-address-city" required>
              <FiInput
                id="account-address-city"
                value={addressDraft.city}
                onChange={(event) => updateAddress({ city: event.target.value })}
                autoComplete="address-level2"
              />
            </FiField>
            <FiField label="State" htmlFor="account-address-state" required>
              <FiInput
                id="account-address-state"
                value={addressDraft.state}
                maxLength={2}
                onChange={(event) => updateAddress({ state: event.target.value.toUpperCase() })}
                autoComplete="address-level1"
              />
            </FiField>
            <FiField label="Zip" htmlFor="account-address-zip" required>
              <FiInput
                id="account-address-zip"
                value={addressDraft.zip}
                maxLength={10}
                onChange={(event) => updateAddress({ zip: event.target.value })}
                autoComplete="postal-code"
              />
            </FiField>
          </div>
        </div>
        <div className="fi-account-settings__actions">
          <FiButton loading={isSavingAddress} onClick={() => void saveAddress()}>
            {settings.defaults.saveAddressLabel}
          </FiButton>
          {addressSaved ? (
            <output className="fi-account-settings__saved">{settings.defaults.addressSavedLabel}</output>
          ) : null}
        </div>
      </FiCardContent>
    </FiCard>
  );
}
