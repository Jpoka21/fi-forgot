import { useCallback } from "react";
import { useLocation } from "wouter";

import { FiNotificationEmptyState } from "@/app/components/empty-state/FiEmptyStatePresets";
import {
  FiNotificationErrorState,
  FiNotificationSearchEmptyState,
} from "@/app/components/notification/FiNotificationErrorState";
import { FiNotificationFilters } from "@/app/components/notification/FiNotificationFilters";
import { FiNotificationList } from "@/app/components/notification/FiNotificationList";
import { FiNotificationSearch } from "@/app/components/notification/FiNotificationSearch";
import { FiNotificationSkeleton } from "@/app/components/notification/FiNotificationSkeleton";
import { buildNotificationDrawerLabel } from "@/app/components/notification/accessibility";
import type { FiNotification } from "@/app/notification/notificationDomain";
import type { NotificationsPageController } from "@/app/notification/hooks/useNotificationsPage";

export function FiNotificationsInboxPanel({ page }: { page: NotificationsPageController }) {
  const [, setLocation] = useLocation();

  const handleNavigate = useCallback(
    (notification: FiNotification) => {
      page.openNotification(notification);
      if (notification.href) {
        setLocation(notification.href);
      }
    },
    [page, setLocation],
  );

  const title = page.isArchive ? page.defaults.archiveTitle : page.defaults.inboxTitle;
  const description = page.isArchive
    ? page.defaults.archiveDescription
    : page.defaults.inboxDescription;

  return (
    <section className="fi-notifications-page__panel" aria-labelledby="notifications-inbox-title">
      <header className="fi-notifications-page__panel-header">
        <h2 id="notifications-inbox-title" className="fi-notifications-page__panel-title">
          {title}
        </h2>
        <p className="fi-notifications-page__panel-copy">{description}</p>
      </header>

      <FiNotificationSearch value={page.query} onChange={page.setQuery} />
      <FiNotificationFilters filter={page.filter} onFilterChange={page.setFilter} />

      <div className="fi-notifications-page__toolbar">
        <p className="fi-notifications-page__status" aria-live="polite">
          {buildNotificationDrawerLabel(page.unreadCount)} ·{" "}
          {page.isLoading
            ? "Loading notifications"
            : `${page.visibleNotifications.length} showing`}
        </p>
        {!page.isArchive && page.unreadCount > 0 ? (
          <button type="button" className="fi-notification-drawer__link" onClick={page.markAllRead}>
            Mark all as read
          </button>
        ) : null}
      </div>

      {page.error ? <FiNotificationErrorState onRetry={page.refresh} /> : null}
      {page.isLoading ? <FiNotificationSkeleton /> : null}

      {page.showEmpty && !page.error ? (
        page.isArchive ? (
          <div className="fi-notifications-page__pref-card">
            <h3 className="fi-notifications-page__panel-title">{page.defaults.emptyArchiveTitle}</h3>
            <p className="fi-notifications-page__panel-copy">{page.defaults.emptyArchiveDescription}</p>
          </div>
        ) : (
          <FiNotificationEmptyState contained={false} />
        )
      ) : null}

      {page.showSearchEmpty && !page.error ? <FiNotificationSearchEmptyState /> : null}

      {!page.isLoading && !page.error && page.visibleNotifications.length > 0 ? (
        <FiNotificationList
          groupedNotifications={page.groupedNotifications}
          query={page.debouncedQuery}
          archived={page.isArchive}
          onOpen={handleNavigate}
          onMarkRead={page.markRead}
          onMarkUnread={page.markUnread}
          onDismiss={page.dismiss}
          onRestore={page.restore}
        />
      ) : null}
    </section>
  );
}
