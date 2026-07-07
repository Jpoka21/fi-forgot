import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { FiNotificationEmptyState } from "@/app/components/empty-state/FiEmptyStatePresets";
import {
  FiNotificationErrorState,
  FiNotificationSearchEmptyState,
} from "@/app/components/notification/FiNotificationErrorState";
import { FiNotificationFilters } from "@/app/components/notification/FiNotificationFilters";
import { FiNotificationList } from "@/app/components/notification/FiNotificationList";
import { FiNotificationSearch } from "@/app/components/notification/FiNotificationSearch";
import { FiNotificationSkeleton } from "@/app/components/notification/FiNotificationSkeleton";
import { buildNotificationDrawerLabel } from "@/app/components/notification/accessibility";
import { notificationUiDefaults } from "@/app/components/notification/notificationDomain";
import { getFiNotificationDrawerClassName } from "@/app/components/notification/notificationVariants";
import { trackNotificationEvent } from "@/app/notification/notificationAnalytics";
import type { NotificationCenterController } from "@/app/notification/hooks/useNotificationCenter";
import { notificationDefaults, type FiNotification } from "@/app/notification/notificationDomain";

export interface FiNotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  center: NotificationCenterController;
  onNavigate: (notification: FiNotification) => void;
}

function useIsMobileNotificationCenter(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const handler = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

export function FiNotificationCenter({
  open,
  onOpenChange,
  center,
  onNavigate,
}: FiNotificationCenterProps) {
  const dialogId = useId();
  const titleId = useId();
  const isMobile = useIsMobileNotificationCenter();

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onOpenChange, open]);

  if (!open) return null;

  const statusMessage = center.isLoading
    ? notificationUiDefaults.loadingLabel
    : center.showEmpty
      ? "No notifications"
      : center.showSearchEmpty
        ? notificationUiDefaults.searchEmptyTitle
        : `${center.visibleNotifications.length} notifications`;

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
    }
  };

  return (
    <div
      className="fi-notification-drawer-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <aside
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(getFiNotificationDrawerClassName({ mobile: isMobile }))}
        onKeyDown={handleKeyDown}
      >
        <header className="fi-notification-drawer__header">
          <h2 id={titleId} className="fi-notification-drawer__title">
            {notificationUiDefaults.drawerTitle}
          </h2>
          <div className="fi-notification-drawer__header-actions">
            {center.unreadCount > 0 ? (
              <button
                type="button"
                className="fi-notification-drawer__link"
                onClick={center.markAllRead}
              >
                {notificationDefaults.markAllReadLabel}
              </button>
            ) : null}
            <button
              type="button"
              className="fi-notification-drawer__close"
              aria-label={notificationUiDefaults.closeLabel}
              onClick={() => onOpenChange(false)}
            >
              <X aria-hidden />
            </button>
          </div>
        </header>

        <FiNotificationSearch value={center.query} onChange={center.setQuery} />
        <FiNotificationFilters filter={center.filter} onFilterChange={center.setFilter} />

        <div className="fi-notification-drawer__body">
          <p className="fi-notification-drawer__status" aria-live="polite">
            {buildNotificationDrawerLabel(center.unreadCount)} · {statusMessage}
          </p>

          {center.error ? <FiNotificationErrorState onRetry={center.refresh} /> : null}
          {center.isLoading ? <FiNotificationSkeleton /> : null}

          {center.showEmpty && !center.error ? (
            <FiNotificationEmptyState
              contained={false}
              secondaryHref={notificationDefaults.settingsHref}
              onPrimaryAction={() => onOpenChange(false)}
            />
          ) : null}

          {center.showSearchEmpty && !center.error ? <FiNotificationSearchEmptyState /> : null}

          {!center.isLoading && !center.error && center.visibleNotifications.length > 0 ? (
            <FiNotificationList
              groupedNotifications={center.groupedNotifications}
              query={center.debouncedQuery}
              onOpen={onNavigate}
              onMarkRead={center.markRead}
              onMarkUnread={center.markUnread}
              onDismiss={center.dismiss}
            />
          ) : null}
        </div>

        <footer className="fi-notification-drawer__footer">
          <div className="fi-notification-drawer__footer-links">
            <a
              href={notificationDefaults.viewAllHref}
              className="fi-notification-drawer__link"
              onClick={() => {
                trackNotificationEvent("notification_page_viewed", { filter: "drawer_link" });
                onOpenChange(false);
              }}
            >
              {notificationUiDefaults.viewAllLabel}
            </a>
            <a
              href={notificationDefaults.settingsHref}
              className="fi-notification-drawer__link"
              onClick={() => trackNotificationEvent("notification_settings_opened")}
            >
              {notificationUiDefaults.settingsShortcutLabel}
            </a>
          </div>
          <span>
            {isMobile
              ? notificationUiDefaults.footerHintMobile
              : notificationUiDefaults.footerHintDesktop}
          </span>
        </footer>
      </aside>
    </div>
  );
}
