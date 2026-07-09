import type { NotificationItem } from "@/app/notifications-brain/notificationsTypes";
import type { NotificationViewModel } from "@/app/notifications-brain/notificationViewModel";

const DEFAULT_READ_STATE: NotificationViewModel["readState"] = "unread";

export function mapNotificationViewModel(item: NotificationItem): NotificationViewModel {
  return {
    id: item.id,
    recipientId: item.recipientId,
    recipientName: item.recipientName,
    title: item.title,
    body: item.body,
    href: item.href,
    actionLabel: item.actionLabel,
    priority: item.priority,
    createdAt: item.createdAt,
    source: item.source,
    readState: DEFAULT_READ_STATE,
  };
}

export function mapNotificationsViewModels(
  notifications: NotificationItem[],
): NotificationViewModel[] {
  return notifications.map(mapNotificationViewModel);
}
