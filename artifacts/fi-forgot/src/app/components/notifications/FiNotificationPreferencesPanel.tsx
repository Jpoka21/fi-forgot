import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { FiCard } from "@/app/components/card/FiCard";
import { getPersonalSettings } from "@/lib/data";
import type { NotificationsPageController } from "@/app/notification/hooks/useNotificationsPage";

const channelLabels = {
  email: "Email",
  text: "Text message",
  both: "Email and text",
} as const;

export function FiNotificationPreferencesPanel({ page }: { page: NotificationsPageController }) {
  const settings = getPersonalSettings();

  return (
    <section className="fi-notifications-page__panel" aria-labelledby="notifications-preferences-title">
      <header className="fi-notifications-page__panel-header">
        <h2 id="notifications-preferences-title" className="fi-notifications-page__panel-title">
          {page.defaults.preferencesTitle}
        </h2>
        <p className="fi-notifications-page__panel-copy">{page.defaults.preferencesDescription}</p>
      </header>

      <div className="fi-notifications-page__pref-grid">
        <FiCard className="fi-notifications-page__pref-card">
          <p className="fi-notifications-page__pref-label">Preferred channel</p>
          <p className="fi-notifications-page__pref-value">
            {channelLabels[settings.notifyChannel]}
          </p>
          <p className="fi-notifications-page__pref-label">Notification email</p>
          <p className="fi-notifications-page__pref-value">
            {settings.notifyEmail || "Not set yet"}
          </p>
          <Link href={page.defaults.accountSettingsHref}>
            <FiButton variant="secondary" size="sm">
              {page.defaults.accountSettingsLabel}
            </FiButton>
          </Link>
        </FiCard>

        <FiCard className="fi-notifications-page__pref-card">
          <p className="fi-notifications-page__pref-label">Reminder timing</p>
          <p className="fi-notifications-page__pref-value">
            {settings.notifyTiming.join(" · ")}
          </p>
          <p className="fi-notifications-page__pref-label">Phone for texts</p>
          <p className="fi-notifications-page__pref-value">
            {settings.notifyPhone || "Not set yet"}
          </p>
          <Link href={page.defaults.reminderSettingsHref}>
            <FiButton variant="secondary" size="sm">
              {page.defaults.reminderSettingsLabel}
            </FiButton>
          </Link>
        </FiCard>
      </div>
    </section>
  );
}
