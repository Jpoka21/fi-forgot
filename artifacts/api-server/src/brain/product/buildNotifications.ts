/**
 * Builds ranked relationship notifications for all owned recipients.
 */

import { collectProductBrainDecisions } from "../attention/collectProductBrainDecisions";
import { planAttentionOrder } from "../attention/planAttentionOrder";
import type { BrainExecutionResult } from "../orchestrator";
import { buildNotificationItem } from "./buildNotificationItem";
import {
  NOTIFICATIONS_MAX,
  NOTIFICATIONS_VERSION,
  type NotificationsResponse,
} from "./notificationTypes";

export interface NotificationRecipientInput {
  recipientId: string;
  recipientName: string;
}

export type RunBrainForRecipient = (
  recipientId: string,
  userId: string,
) => Promise<BrainExecutionResult>;

export interface BuildNotificationsOptions {
  userId: string;
  recipients: NotificationRecipientInput[];
  runBrain: RunBrainForRecipient;
  generatedAt?: string;
}

export async function buildNotifications(
  options: BuildNotificationsOptions,
): Promise<NotificationsResponse> {
  const { userId, recipients, runBrain, generatedAt = new Date().toISOString() } = options;

  const decisions = await collectProductBrainDecisions({
    userId,
    recipients,
    runBrain,
  });

  const ranked = planAttentionOrder({ decisions, recipients });
  const capped = ranked.slice(0, NOTIFICATIONS_MAX);
  const notifications = capped.map((item) =>
    buildNotificationItem(
      item.decision,
      { recipientId: item.recipientId, recipientName: item.recipientName },
      generatedAt,
    ),
  );

  return {
    version: NOTIFICATIONS_VERSION,
    generatedAt,
    unreadCount: notifications.length,
    notifications,
  };
}
