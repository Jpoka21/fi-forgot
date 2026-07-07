import { useCallback, useState } from "react";
import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { trackNotificationEvent } from "@/app/notification/notificationAnalytics";
import { useCommunicationHistory } from "@/app/notification/hooks/useCommunicationHistory";
import {
  communicationHistoryEmptyCopy,
  communicationHistoryTabLabels,
  type CommunicationHistoryTab,
} from "@/app/notification/notificationsPageDomain";
import type { NotificationsPageController } from "@/app/notification/hooks/useNotificationsPage";
import { getFiNotificationFilterChipClassName } from "@/app/components/notification/notificationVariants";

function formatHistoryDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function FiCommunicationHistoryPanel({ page }: { page: NotificationsPageController }) {
  const [activeTab, setActiveTab] = useState<CommunicationHistoryTab>("email");
  const history = useCommunicationHistory(activeTab);

  const handleTabChange = useCallback((tab: CommunicationHistoryTab) => {
    setActiveTab(tab);
    trackNotificationEvent("communication_history_tab_changed", { filter: tab });
  }, []);

  const emptyCopy = communicationHistoryEmptyCopy[activeTab];

  return (
    <section className="fi-notifications-page__panel" aria-labelledby="notifications-history-title">
      <header className="fi-notifications-page__panel-header">
        <h2 id="notifications-history-title" className="fi-notifications-page__panel-title">
          {page.defaults.historyTitle}
        </h2>
        <p className="fi-notifications-page__panel-copy">{page.defaults.historyDescription}</p>
      </header>

      <div
        className="fi-notifications-page__history-tabs"
        role="tablist"
        aria-label="Communication history categories"
      >
        {history.tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`history-tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`history-panel-${tab}`}
            className={getFiNotificationFilterChipClassName({ active: activeTab === tab })}
            onClick={() => handleTabChange(tab)}
          >
            {communicationHistoryTabLabels[tab]}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`history-panel-${activeTab}`}
        aria-labelledby={`history-tab-${activeTab}`}
      >
        {history.entries.length === 0 ? (
          <div className="fi-notifications-page__pref-card">
            <h3 className="fi-notifications-page__panel-title">{emptyCopy.title}</h3>
            <p className="fi-notifications-page__panel-copy">{emptyCopy.description}</p>
          </div>
        ) : (
          <ul className="fi-notifications-page__history-list" aria-label={`${communicationHistoryTabLabels[activeTab]} history`}>
            {history.entries.map((entry) => (
              <li key={entry.id} className="fi-notifications-page__history-item">
                <h3 className="fi-notifications-page__history-title">{entry.title}</h3>
                <p className="fi-notifications-page__history-copy">{entry.description}</p>
                <div className="fi-notifications-page__history-meta">
                  <time dateTime={entry.occurredAt}>{formatHistoryDate(entry.occurredAt)}</time>
                  {entry.statusLabel ? (
                    <span className="fi-notifications-page__history-status">{entry.statusLabel}</span>
                  ) : null}
                </div>
                {entry.href ? (
                  <Link href={entry.href}>
                    <FiButton variant="ghost" size="sm">
                      View details
                    </FiButton>
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
