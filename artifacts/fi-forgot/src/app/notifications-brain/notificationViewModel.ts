/**
 * Notification presentation contract — UI-ready, source-agnostic model.
 */

import type { FiNotificationReadState } from "@/app/notification/notificationDomain";
import type { ActionPriority } from "@/app/product-brain/productBrainDecisionTypes";
import type { NotificationSource } from "@/app/notifications-brain/notificationsTypes";

export interface NotificationViewModel {
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
  readState: FiNotificationReadState;
}
