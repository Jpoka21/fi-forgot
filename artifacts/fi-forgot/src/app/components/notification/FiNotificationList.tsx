import { fiNotificationTimeGroups, type FiNotification } from "@/app/notification/notificationDomain";
import type { GroupedNotifications } from "@/app/notification/hooks/useNotificationCenter";
import { FiNotificationItem } from "@/app/components/notification/FiNotificationItem";
import { FiNotificationGroup } from "@/app/components/notification/FiNotificationGroup";

export interface FiNotificationListProps {
  groupedNotifications: GroupedNotifications;
  query?: string;
  archived?: boolean;
  onOpen?: (notification: FiNotification) => void;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onRestore?: (id: string) => void;
}

export function FiNotificationList({
  groupedNotifications,
  query = "",
  archived = false,
  onOpen,
  onMarkRead,
  onMarkUnread,
  onDismiss,
  onRestore,
}: FiNotificationListProps) {
  return (
    <div className="fi-notification-list" role="feed" aria-label="Notification list">
      {fiNotificationTimeGroups.map((group) => {
        const items = groupedNotifications[group];
        if (!items.length) return null;

        return (
          <FiNotificationGroup key={group} title={group}>
            {items.map((notification) => (
              <FiNotificationItem
                key={notification.id}
                notification={notification}
                query={query}
                archived={archived}
                onOpen={onOpen}
                onMarkRead={onMarkRead}
                onMarkUnread={onMarkUnread}
                onDismiss={onDismiss}
                onRestore={onRestore}
              />
            ))}
          </FiNotificationGroup>
        );
      })}
    </div>
  );
}
