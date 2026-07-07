import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { FiNotificationCard } from "@/app/components/card/FiCard";
import { FiSearchHighlight } from "@/app/components/search/FiSearchHighlight";
import { notificationCategoryLabels } from "@/app/notification/notificationDomain";
import type { FiNotification } from "@/app/notification/notificationDomain";
import { getFiNotificationItemClassName } from "@/app/components/notification/notificationVariants";
import { notificationUiDefaults } from "@/app/components/notification/notificationDomain";

export interface FiNotificationItemProps {
  notification: FiNotification;
  query?: string;
  archived?: boolean;
  onOpen?: (notification: FiNotification) => void;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onRestore?: (id: string) => void;
}

export function FiNotificationItem({
  notification,
  query = "",
  archived = false,
  onOpen,
  onMarkRead,
  onMarkUnread,
  onDismiss,
  onRestore,
}: FiNotificationItemProps) {
  const unread = notification.readState === "unread";

  return (
    <article aria-labelledby={`notification-title-${notification.id}`}>
      <FiNotificationCard className={getFiNotificationItemClassName({ unread })}>
      <div className="fi-notification-item__header">
        <h4 id={`notification-title-${notification.id}`} className="fi-notification-item__title">
          {query ? (
            <FiSearchHighlight text={notification.title} query={query} />
          ) : (
            notification.title
          )}
        </h4>
        <span className="fi-notification-item__indicator" aria-label={unread ? notificationUiDefaults.unreadIndicatorLabel : notificationUiDefaults.readIndicatorLabel}>
          {unread ? <span className="fi-notification-item__indicator-dot" aria-hidden /> : null}
          {unread ? notificationUiDefaults.unreadIndicatorLabel : notificationUiDefaults.readIndicatorLabel}
        </span>
      </div>

      {notification.body ? (
        <p className="fi-notification-item__body">
          {query ? (
            <FiSearchHighlight text={notification.body} query={query} />
          ) : (
            notification.body
          )}
        </p>
      ) : null}

      <div className="fi-notification-item__meta">
        <span>{notificationCategoryLabels[notification.category]}</span>
      </div>

      <div className="fi-notification-item__actions">
        {notification.actions?.map((action) =>
          action.href ? (
            <Link key={action.id} href={action.href}>
              <FiButton
                variant="secondary"
                size="sm"
                onClick={() => onOpen?.(notification)}
              >
                {action.label}
              </FiButton>
            </Link>
          ) : (
            <FiButton
              key={action.id}
              variant="secondary"
              size="sm"
              onClick={() => onOpen?.(notification)}
            >
              {action.label}
            </FiButton>
          ),
        )}
        <FiButton variant="primary" size="sm" onClick={() => onOpen?.(notification)}>
          Open
        </FiButton>
        {!archived ? (
          unread ? (
            <FiButton variant="ghost" size="sm" onClick={() => onMarkRead?.(notification.id)}>
              {notificationUiDefaults.markReadLabel}
            </FiButton>
          ) : (
            <FiButton variant="ghost" size="sm" onClick={() => onMarkUnread?.(notification.id)}>
              {notificationUiDefaults.markUnreadLabel}
            </FiButton>
          )
        ) : null}
        {archived ? (
          <FiButton variant="ghost" size="sm" onClick={() => onRestore?.(notification.id)}>
            {notificationUiDefaults.restoreLabel}
          </FiButton>
        ) : (
          <FiButton variant="ghost" size="sm" onClick={() => onDismiss?.(notification.id)}>
            {notificationUiDefaults.dismissLabel}
          </FiButton>
        )}
      </div>
      </FiNotificationCard>
    </article>
  );
}
