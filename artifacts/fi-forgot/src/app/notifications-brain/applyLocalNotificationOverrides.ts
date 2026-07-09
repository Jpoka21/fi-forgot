import type { FiNotification } from "@/app/notification/notificationDomain";
import {
  getDismissedNotificationIds,
  getNotificationReadStateMap,
} from "@/app/notification/notificationStorage";

export interface ApplyLocalNotificationOverridesOptions {
  /** When true, return only dismissed notifications (archive). When false, exclude dismissed (inbox). */
  archive?: boolean;
  getReadStateMap?: () => Record<string, FiNotification["readState"]>;
  getDismissedIds?: () => string[];
}

export function applyLocalNotificationOverrides(
  notifications: FiNotification[],
  options: ApplyLocalNotificationOverridesOptions = {},
): FiNotification[] {
  const {
    archive = false,
    getReadStateMap = getNotificationReadStateMap,
    getDismissedIds = getDismissedNotificationIds,
  } = options;

  const readStateMap = getReadStateMap();
  const dismissed = new Set(getDismissedIds());

  return notifications
    .filter((notification) =>
      archive ? dismissed.has(notification.id) : !dismissed.has(notification.id),
    )
    .map((notification) => ({
      ...notification,
      readState: readStateMap[notification.id] ?? notification.readState,
    }));
}
