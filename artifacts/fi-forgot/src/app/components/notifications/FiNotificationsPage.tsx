import { useEffect } from "react";

import { FiCommunicationHistoryPanel } from "@/app/components/notifications/FiCommunicationHistoryPanel";
import { FiNotificationCategoriesPanel } from "@/app/components/notifications/FiNotificationCategoriesPanel";
import { FiNotificationPreferencesPanel } from "@/app/components/notifications/FiNotificationPreferencesPanel";
import { FiNotificationsInboxPanel } from "@/app/components/notifications/FiNotificationsInboxPanel";
import { useNotificationsPage } from "@/app/notification/hooks/useNotificationsPage";
import type { NotificationsPageSection } from "@/app/notification/notificationsPageDomain";

const sectionLabels: Record<NotificationsPageSection, string> = {
  inbox: "Inbox",
  archive: "Archive",
  preferences: "Preferences",
  history: "History",
};

export function FiNotificationsPage() {
  const page = useNotificationsPage();

  useEffect(() => {
    document.getElementById("notifications-main")?.focus();
  }, [page.section]);

  return (
    <div id="notifications-main" className="fi-notifications-page" tabIndex={-1}>
      <header className="fi-notifications-page__header">
        <h1 className="fi-notifications-page__title">{page.defaults.title}</h1>
        <p className="fi-notifications-page__subtitle">{page.defaults.subtitle}</p>
      </header>

      <div className="fi-notifications-page__tabs" role="tablist" aria-label="Notifications sections">
        {page.sections.map((section) => (
          <button
            key={section}
            type="button"
            role="tab"
            className="fi-notifications-page__tab"
            aria-selected={page.section === section}
            aria-controls={`notifications-section-${section}`}
            id={`notifications-tab-${section}`}
            onClick={() => page.setSection(section)}
          >
            {sectionLabels[section]}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`notifications-section-${page.section}`}
        aria-labelledby={`notifications-tab-${page.section}`}
      >
        {page.section === "inbox" || page.section === "archive" ? (
          <FiNotificationsInboxPanel page={page} />
        ) : null}
        {page.section === "preferences" ? (
          <>
            <FiNotificationPreferencesPanel page={page} />
            <FiNotificationCategoriesPanel page={page} />
          </>
        ) : null}
        {page.section === "history" ? <FiCommunicationHistoryPanel page={page} /> : null}
      </div>
    </div>
  );
}
