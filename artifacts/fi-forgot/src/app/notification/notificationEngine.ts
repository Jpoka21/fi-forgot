import { normalizeSearchQuery } from "@/app/search/searchHighlight";
import {
  notificationFilterCategoryMap,
  seedNotifications,
  type FiNotification,
  type FiNotificationFilterOption,
  type FiNotificationTimeGroup,
} from "@/app/notification/notificationDomain";
import {
  dismissNotificationId,
  restoreNotificationId,
  setNotificationReadState,
} from "@/app/notification/notificationStorage";
import { applyLocalNotificationOverrides } from "@/app/notifications-brain/applyLocalNotificationOverrides";

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function resolveNotificationTimeGroup(createdAt: string): FiNotificationTimeGroup {
  const created = new Date(createdAt);
  const now = new Date();
  const today = startOfDay(now).getTime();
  const createdDay = startOfDay(created).getTime();
  const diffDays = Math.floor((today - createdDay) / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "Earlier this week";
  return "Earlier";
}

export function loadNotificationInbox(): FiNotification[] {
  return applyLocalNotificationOverrides(seedNotifications).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export function filterNotifications(
  notifications: FiNotification[],
  filter: FiNotificationFilterOption,
): FiNotification[] {
  if (filter === "all") return notifications;
  if (filter === "unread") return notifications.filter((item) => item.readState === "unread");

  const categories = notificationFilterCategoryMap[filter];
  return notifications.filter((item) => categories.includes(item.category));
}

export function searchNotifications(
  notifications: FiNotification[],
  query: string,
): FiNotification[] {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return notifications;

  return notifications.filter((item) => {
    const haystack = [item.title, item.body ?? "", item.category].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function groupNotifications(
  notifications: FiNotification[],
): Record<FiNotificationTimeGroup, FiNotification[]> {
  const groups: Record<FiNotificationTimeGroup, FiNotification[]> = {
    Today: [],
    Yesterday: [],
    "Earlier this week": [],
    Earlier: [],
  };

  notifications.forEach((notification) => {
    const group = resolveNotificationTimeGroup(notification.createdAt);
    groups[group].push(notification);
  });

  return groups;
}

export function countUnreadNotifications(notifications: FiNotification[]): number {
  return notifications.filter((item) => item.readState === "unread").length;
}

export function markNotificationRead(id: string): void {
  setNotificationReadState(id, "read");
}

export function markNotificationUnread(id: string): void {
  setNotificationReadState(id, "unread");
}

export function dismissNotification(id: string): void {
  dismissNotificationId(id);
}

export function restoreNotification(id: string): void {
  restoreNotificationId(id);
}

export function loadArchivedNotifications(): FiNotification[] {
  return applyLocalNotificationOverrides(seedNotifications, { archive: true }).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export function markAllNotificationsRead(notifications: FiNotification[]): void {
  notifications.forEach((notification) => {
    setNotificationReadState(notification.id, "read");
  });
}
