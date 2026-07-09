/**
 * Builds ranked relationship notifications for all owned recipients.
 */

import { buildNotificationItem } from "./buildNotificationItem";
import { buildProductBrainDecision } from "./buildProductBrainDecision";
import {
  NOTIFICATIONS_MAX,
  NOTIFICATIONS_VERSION,
  type NotificationsResponse,
} from "./notificationTypes";
import type { ProductBrainDecision } from "./productBrainDecisionTypes";
import {
  rankNotifications,
  type RankableNotification,
} from "./rankNotifications";
import { shouldIncludeNotification } from "./shouldIncludeNotification";
import type { BrainExecutionResult } from "../orchestrator";

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

function toRankable(
  decision: ProductBrainDecision,
  recipient: NotificationRecipientInput,
): RankableNotification {
  return {
    decision,
    recipientId: recipient.recipientId,
    recipientName: recipient.recipientName,
  };
}

export async function buildNotifications(
  options: BuildNotificationsOptions,
): Promise<NotificationsResponse> {
  const { userId, recipients, runBrain, generatedAt = new Date().toISOString() } = options;

  const rankable: RankableNotification[] = [];

  for (const recipient of recipients) {
    const execution = await runBrain(recipient.recipientId, userId);
    const decision = buildProductBrainDecision(recipient.recipientId, execution);
    if (!shouldIncludeNotification(decision)) continue;
    rankable.push(toRankable(decision, recipient));
  }

  const ranked = rankNotifications(rankable);
  const capped = ranked.slice(0, NOTIFICATIONS_MAX);
  const notifications = capped.map((item) =>
    buildNotificationItem(item.decision, item, generatedAt),
  );

  return {
    version: NOTIFICATIONS_VERSION,
    generatedAt,
    unreadCount: notifications.length,
    notifications,
  };
}
