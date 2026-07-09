/**
 * Builds ranked relationship notifications for all owned recipients.
 */

import { collectProductBrainDecisions } from "../attention/collectProductBrainDecisions";
import { shouldIncludeOpportunity } from "../attention/shouldIncludeOpportunity";
import type { BrainExecutionResult } from "../orchestrator";
import { buildNotificationItem } from "./buildNotificationItem";
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

  const decisions = await collectProductBrainDecisions({
    userId,
    recipients,
    runBrain,
  });

  const rankable: RankableNotification[] = [];

  for (let index = 0; index < recipients.length; index++) {
    const recipient = recipients[index]!;
    const decision = decisions[index]!;
    if (!shouldIncludeOpportunity(decision)) continue;
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
