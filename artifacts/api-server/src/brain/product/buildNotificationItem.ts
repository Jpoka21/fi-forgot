/**
 * Maps ProductBrainDecision + recipient display data to NotificationItem.
 */

import { resolveDashboardBrainActionLabel } from "./dashboardBrainActionLabels";
import {
  NOTIFICATION_SOURCE_BRAIN,
  type NotificationItem,
} from "./notificationTypes";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";

export interface NotificationRecipientDisplay {
  recipientId: string;
  recipientName: string;
}

export function buildNotificationId(recipientId: string, sourceRuleId: string): string {
  return `${recipientId}:${sourceRuleId}`;
}

export function buildNotificationItem(
  decision: ProductBrainDecision,
  recipient: NotificationRecipientDisplay,
  createdAt: string,
): NotificationItem {
  return {
    id: buildNotificationId(recipient.recipientId, decision.sourceRuleId),
    recipientId: recipient.recipientId,
    recipientName: recipient.recipientName,
    title: decision.display.title,
    body: decision.display.explanation,
    href: `/relationship/${recipient.recipientId}`,
    actionLabel: resolveDashboardBrainActionLabel(decision.sourceRuleId),
    priority: decision.actionPlan.priority,
    createdAt,
    source: NOTIFICATION_SOURCE_BRAIN,
  };
}
