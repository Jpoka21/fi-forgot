import { useCallback } from "react";
import { useLocation } from "wouter";

import { FiNotificationCenter } from "@/app/components/notification/FiNotificationCenter";
import { FiNotificationCenterTrigger } from "@/app/components/notification/FiNotificationCenterTrigger";
import { useAuth } from "@/app/providers/AuthProvider";
import { useNotificationCenter } from "@/app/notification/hooks/useNotificationCenter";
import { useNotificationCenterContext } from "@/app/notification/NotificationCenterProvider";
import type { FiNotification } from "@/app/notification/notificationDomain";

export function NotificationCenterHost() {
  const { authReady, isLoggedIn } = useAuth();
  const { open, setOpen, toggle, enabled } = useNotificationCenterContext();
  const [, setLocation] = useLocation();
  const center = useNotificationCenter({ enabled });

  const handleNavigate = useCallback(
    (notification: FiNotification) => {
      center.openNotification(notification);
      if (notification.href) {
        setLocation(notification.href);
      }
      setOpen(false);
    },
    [center, setLocation, setOpen],
  );

  if (!enabled) return null;
  if (!authReady || !isLoggedIn) return null;

  return (
    <>
      <FiNotificationCenterTrigger
        unreadCount={center.unreadCount}
        onClick={toggle}
        aria-expanded={open}
      />
      <FiNotificationCenter
        open={open}
        onOpenChange={setOpen}
        center={center}
        onNavigate={handleNavigate}
      />
    </>
  );
}
