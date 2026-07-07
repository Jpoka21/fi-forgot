import { useCallback, useEffect, useMemo, useState } from "react";

import { useNotifications } from "@/app/providers/NotificationProvider";
import { useDebouncedValue } from "@/app/search/hooks/useDebouncedValue";
import { trackNotificationEvent } from "@/app/notification/notificationAnalytics";
import {
  countUnreadNotifications,
  dismissNotification,
  filterNotifications,
  groupNotifications,
  loadNotificationInbox,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  searchNotifications,
} from "@/app/notification/notificationEngine";
import {
  notificationDefaults,
  type FiNotification,
  type FiNotificationFilterOption,
  type FiNotificationTimeGroup,
} from "@/app/notification/notificationDomain";

export interface UseNotificationCenterOptions {
  enabled?: boolean;
}

export function useNotificationCenter(options: UseNotificationCenterOptions = {}) {
  const { enabled = true } = options;
  const { setUnreadCount } = useNotifications();

  const [notifications, setNotifications] = useState<FiNotification[]>([]);
  const [filter, setFilter] = useState<FiNotificationFilterOption>("all");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const debouncedQuery = useDebouncedValue(query, notificationDefaults.debounceMs);

  const refresh = useCallback(() => {
    try {
      const inbox = loadNotificationInbox();
      setNotifications(inbox);
      setUnreadCount(countUnreadNotifications(inbox));
      setError(null);
    } catch (refreshError) {
      setError(notificationDefaults.errorLabel);
      trackNotificationEvent("notification_error");
      if (import.meta.env.DEV) {
        console.error(refreshError);
      }
    }
  }, [setUnreadCount]);

  useEffect(() => {
    if (!enabled) return;

    setIsLoading(true);
    const timer = window.setTimeout(() => {
      refresh();
      setIsLoading(false);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [enabled, refresh, version]);

  useEffect(() => {
    if (!enabled || !debouncedQuery.trim()) return;
    trackNotificationEvent("notification_search", { query: debouncedQuery });
  }, [debouncedQuery, enabled]);

  const visibleNotifications = useMemo(() => {
    const filtered = filterNotifications(notifications, filter);
    return searchNotifications(filtered, debouncedQuery);
  }, [debouncedQuery, filter, notifications]);

  const groupedNotifications = useMemo(
    () => groupNotifications(visibleNotifications),
    [visibleNotifications],
  );

  const unreadCount = useMemo(
    () => countUnreadNotifications(notifications),
    [notifications],
  );

  const handleFilterChange = useCallback((nextFilter: FiNotificationFilterOption) => {
    setFilter(nextFilter);
    trackNotificationEvent("notification_filter_changed", { filter: nextFilter });
  }, []);

  const handleMarkRead = useCallback(
    (id: string) => {
      markNotificationRead(id);
      trackNotificationEvent("notification_marked_read", { notificationId: id });
      setVersion((current) => current + 1);
    },
    [],
  );

  const handleMarkUnread = useCallback(
    (id: string) => {
      markNotificationUnread(id);
      trackNotificationEvent("notification_marked_unread", { notificationId: id });
      setVersion((current) => current + 1);
    },
    [],
  );

  const handleDismiss = useCallback((id: string) => {
    dismissNotification(id);
    trackNotificationEvent("notification_dismissed", { notificationId: id });
    setVersion((current) => current + 1);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    markAllNotificationsRead(notifications);
    trackNotificationEvent("notification_mark_all_read");
    setVersion((current) => current + 1);
  }, [notifications]);

  const handleOpenNotification = useCallback((notification: FiNotification) => {
    trackNotificationEvent("notification_opened", {
      notificationId: notification.id,
      category: notification.category,
    });
    if (notification.readState === "unread") {
      markNotificationRead(notification.id);
      setVersion((current) => current + 1);
    }
  }, []);

  const showEmpty =
    !isLoading && !error && visibleNotifications.length === 0 && debouncedQuery.trim().length === 0;
  const showSearchEmpty =
    !isLoading && !error && visibleNotifications.length === 0 && debouncedQuery.trim().length > 0;

  return {
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
    setQuery,
    setFilter: handleFilterChange,
    refresh,
    markRead: handleMarkRead,
    markUnread: handleMarkUnread,
    dismiss: handleDismiss,
    markAllRead: handleMarkAllRead,
    openNotification: handleOpenNotification,
  };
}

export type NotificationCenterController = ReturnType<typeof useNotificationCenter>;

export type GroupedNotifications = Record<FiNotificationTimeGroup, FiNotification[]>;
