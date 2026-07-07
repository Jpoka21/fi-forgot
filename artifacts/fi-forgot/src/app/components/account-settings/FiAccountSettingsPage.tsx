import { useAccountSettings } from "@/app/account-settings/hooks/useAccountSettings";
import { getFiAccountSettingsClassName } from "@/app/components/account-settings/accountSettingsVariants";
import {
  FiAccountAccessibilitySection,
  FiAccountAppearanceSection,
  FiAccountConnectedSection,
  FiAccountEmailSection,
  FiAccountLanguageSection,
  FiAccountMailingAddressSection,
  FiAccountNotificationSection,
  FiAccountPasswordSection,
  FiAccountProfileSection,
  FiAccountSecuritySection,
  FiAccountSessionSection,
} from "@/app/components/account-settings/FiAccountSettingsSections";
import { FiSettingsShell } from "@/app/components/settings";

export function FiAccountSettingsPage() {
  const settings = useAccountSettings();

  return (
    <FiSettingsShell
      isLoading={settings.isLoading}
      error={settings.loadError}
      onRetry={settings.retryLoad}
      offline={settings.isOffline}
    >
      {!settings.snapshot ? null : (
        <div className={getFiAccountSettingsClassName()}>
          <header className="fi-account-settings__header">
            <h1 className="fi-account-settings__title">{settings.defaults.title}</h1>
            <p className="fi-account-settings__subtitle">{settings.defaults.description}</p>
          </header>

          <div className="fi-account-settings__layout">
            <FiAccountProfileSection settings={settings} />
            <FiAccountEmailSection settings={settings} />
            <FiAccountMailingAddressSection settings={settings} />
            <FiAccountPasswordSection settings={settings} />
            <FiAccountSecuritySection settings={settings} />
            <FiAccountSessionSection settings={settings} />
            <FiAccountConnectedSection settings={settings} />
            <FiAccountNotificationSection settings={settings} />
            <FiAccountAccessibilitySection settings={settings} />
            <FiAccountAppearanceSection settings={settings} />
            <FiAccountLanguageSection settings={settings} />
          </div>
        </div>
      )}
    </FiSettingsShell>
  );
}
