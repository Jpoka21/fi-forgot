import { useNotifications } from "@/app/providers/NotificationProvider";
import type { NotificationCountState } from "@/app/state/types";

export function useNotificationCount(): NotificationCountState {
  const { unreadCount, setUnreadCount, incrementUnreadCount, clearUnreadCount } =
    useNotifications();

  return {
    unreadCount,
    setUnreadCount,
    incrementUnreadCount,
    clearUnreadCount,
  };
}
