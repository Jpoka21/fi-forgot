import { useCallback, useEffect, useMemo, useState } from "react";

import { useDebouncedValue } from "@/app/search/hooks/useDebouncedValue";
import { buildNotificationInboxForDisplay } from "@/app/notifications-brain/buildNotificationInboxForDisplay";
import { trackNotificationEvent } from "@/app/notification/notificationAnalytics";
import {
  countUnreadNotifications,
  dismissNotification,
  filterNotifications,
  groupNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  restoreNotification,
  searchNotifications,
} from "@/app/notification/notificationEngine";
import {
  notificationDefaults,
  type FiNotification,
  type FiNotificationFilterOption,
} from "@/app/notification/notificationDomain";
import {
  notificationsPageDefaults,
  notificationsPageSections,
  type NotificationsPageSection,
} from "@/app/notification/notificationsPageDomain";
import { useNotifications } from "@/app/providers/NotificationProvider";

export function useNotificationsPage() {
  const { setUnreadCount } = useNotifications();
  const [section, setSection] = useState<NotificationsPageSection>("inbox");
  const [notifications, setNotifications] = useState<FiNotification[]>([]);
  const [filter, setFilter] = useState<FiNotificationFilterOption>("all");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const debouncedQuery = useDebouncedValue(query, notificationDefaults.debounceMs);
  const isArchive = section === "archive";

  const refresh = useCallback(async () => {
    try {
      const inbox = await buildNotificationInboxForDisplay({ archive: isArchive });
      setNotifications(inbox);
      if (!isArchive) {
        setUnreadCount(countUnreadNotifications(inbox));
      }
      setError(null);
    } catch (refreshError) {
      setNotifications([]);
      if (!isArchive) {
        setUnreadCount(0);
      }
      setError(notificationDefaults.errorLabel);
      trackNotificationEvent("notification_error");
      if (import.meta.env.DEV) {
        console.error(refreshError);
      }
    }
  }, [isArchive, setUnreadCount]);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => {
      void refresh().finally(() => setIsLoading(false));
    }, 120);
    return () => window.clearTimeout(timer);
  }, [refresh, version, section]);

  useEffect(() => {
    trackNotificationEvent("notification_page_viewed", { filter: section });
  }, [section]);

  const visibleNotifications = useMemo(() => {
    const filtered = filterNotifications(notifications, filter);
    return searchNotifications(filtered, debouncedQuery);
  }, [debouncedQuery, filter, notifications]);

  const groupedNotifications = useMemo(
    () => groupNotifications(visibleNotifications),
    [visibleNotifications],
  );

  const unreadCount = useMemo(
    () => (isArchive ? 0 : countUnreadNotifications(notifications)),
    [isArchive, notifications],
  );

  const handleSectionChange = useCallback((nextSection: NotificationsPageSection) => {
    setSection(nextSection);
    setFilter("all");
    setQuery("");
  }, []);

  const handleFilterChange = useCallback((nextFilter: FiNotificationFilterOption) => {
    setFilter(nextFilter);
    trackNotificationEvent("notification_filter_changed", { filter: nextFilter });
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    markNotificationRead(id);
    trackNotificationEvent("notification_marked_read", { notificationId: id });
    setVersion((current) => current + 1);
  }, []);

  const handleMarkUnread = useCallback((id: string) => {
    markNotificationUnread(id);
    trackNotificationEvent("notification_marked_unread", { notificationId: id });
    setVersion((current) => current + 1);
  }, []);

  const handleRestore = useCallback((id: string) => {
    restoreNotification(id);
    trackNotificationEvent("notification_restored", { notificationId: id });
    setVersion((current) => current + 1);
  }, []);

  const handleDismiss = useCallback((id: string) => {
    dismissNotification(id);
    trackNotificationEvent("notification_dismissed", { notificationId: id });
    setVersion((current) => current + 1);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    if (isArchive) return;
    markAllNotificationsRead(notifications);
    trackNotificationEvent("notification_mark_all_read");
    setVersion((current) => current + 1);
  }, [isArchive, notifications]);

  const handleOpenNotification = useCallback((notification: FiNotification) => {
    trackNotificationEvent("notification_opened", {
      notificationId: notification.id,
      category: notification.category,
    });
    if (!isArchive && notification.readState === "unread") {
      markNotificationRead(notification.id);
      setVersion((current) => current + 1);
    }
  }, [isArchive]);

  const showEmpty =
    !isLoading && !error && visibleNotifications.length === 0 && debouncedQuery.trim().length === 0;
  const showSearchEmpty =
    !isLoading && !error && visibleNotifications.length === 0 && debouncedQuery.trim().length > 0;

  return {
    defaults: notificationsPageDefaults,
    sections: notificationsPageSections,
    section,
    setSection: handleSectionChange,
    notifications,
    visibleNotifications,
    groupedNotifications,
    unreadCount,
    filter,
    query,
    debouncedQuery,
    isLoading,
    error,
    showEmpty,
    showSearchEmpty,
    isArchive,
    setQuery,
    setFilter: handleFilterChange,
    refresh,
    markRead: handleMarkRead,
    markUnread: handleMarkUnread,
    dismiss: handleDismiss,
    restore: handleRestore,
    markAllRead: handleMarkAllRead,
    openNotification: handleOpenNotification,
  };
}

export type NotificationsPageController = ReturnType<typeof useNotificationsPage>;
