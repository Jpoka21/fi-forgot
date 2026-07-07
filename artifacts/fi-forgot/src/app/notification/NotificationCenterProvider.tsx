import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useFeatureFlags } from "@/app/state/hooks/useFeatureFlags";
import { trackNotificationEvent } from "@/app/notification/notificationAnalytics";

interface NotificationCenterContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  enabled: boolean;
}

const NotificationCenterContext = createContext<NotificationCenterContextValue | null>(null);

export function NotificationCenterProvider({ children }: { children: ReactNode }) {
  const { flags } = useFeatureFlags();
  const [open, setOpenState] = useState(false);

  const enabled = flags.enableNotificationCenter;

  const setOpen = useCallback((nextOpen: boolean) => {
    setOpenState(nextOpen);
    trackNotificationEvent(
      nextOpen ? "notification_center_opened" : "notification_center_closed",
    );
  }, []);

  const toggle = useCallback(() => {
    setOpenState((current) => {
      const nextOpen = !current;
      trackNotificationEvent(
        nextOpen ? "notification_center_opened" : "notification_center_closed",
      );
      return nextOpen;
    });
  }, []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
      enabled,
    }),
    [enabled, open, setOpen, toggle],
  );

  return (
    <NotificationCenterContext.Provider value={value}>{children}</NotificationCenterContext.Provider>
  );
}

export function useNotificationCenterContext(): NotificationCenterContextValue {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error("useNotificationCenterContext must be used within NotificationCenterProvider");
  }
  return context;
}
