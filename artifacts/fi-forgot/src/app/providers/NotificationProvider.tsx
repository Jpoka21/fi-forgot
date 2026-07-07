import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface NotificationContextValue {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: (by?: number) => void;
  clearUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

/**
 * Lightweight notification state foundation.
 *
 * Does not implement the notification center, drawers, or API polling.
 * Future notification features should build on this context.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCountState] = useState(0);

  const setUnreadCount = useCallback((count: number) => {
    setUnreadCountState(Math.max(0, count));
  }, []);

  const incrementUnreadCount = useCallback((by = 1) => {
    setUnreadCountState((current) => Math.max(0, current + by));
  }, []);

  const clearUnreadCount = useCallback(() => {
    setUnreadCountState(0);
  }, []);

  const value = useMemo(
    () => ({
      unreadCount,
      setUnreadCount,
      incrementUnreadCount,
      clearUnreadCount,
    }),
    [clearUnreadCount, incrementUnreadCount, setUnreadCount, unreadCount],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        id="fi-notification-portal"
        data-testid="notification-portal"
        hidden
        aria-hidden="true"
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }

  return context;
}
