/**
 * Notifications — relationship notification public contract (v1).
 */

import type { ActionPriority } from "../action/actionPlanTypes";

export const NOTIFICATIONS_VERSION = 1 as const;

/** Maximum ranked notifications returned in one inbox payload. */
export const NOTIFICATIONS_MAX = 20 as const;

export const NOTIFICATION_SOURCE_BRAIN = "brain" as const;

export type NotificationSource = typeof NOTIFICATION_SOURCE_BRAIN;

export interface NotificationItem {
  id: string;
  recipientId: string;
  recipientName: string;
  title: string;
  body: string;
  href: string;
  actionLabel: string;
  priority: ActionPriority;
  createdAt: string;
  source: NotificationSource;
}

export interface NotificationsResponse {
  version: typeof NOTIFICATIONS_VERSION;
  generatedAt: string;
  unreadCount: number;
  notifications: NotificationItem[];
}
