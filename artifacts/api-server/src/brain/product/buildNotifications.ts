/**
 * Builds ranked relationship notifications for all owned recipients.
 */

import { collectProductBrainDecisions } from "../attention/collectProductBrainDecisions";
import type { BrainExecutionResult } from "../orchestrator";
import { buildNotificationItem } from "./buildNotificationItem";
import {
  NOTIFICATIONS_MAX,
  NOTIFICATIONS_VERSION,
  type NotificationsResponse,
} from "./notificationTypes";
import { orchestrateProductBrainFatigue } from "./orchestrateProductBrainFatigue";

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

  return orchestrateProductBrainFatigue({
    userId,
    generatedAt,
    decisions,
    recipients,
    buildFromVisible: (visibleFatigueOpportunities, buildGeneratedAt) => {
      const capped = visibleFatigueOpportunities.slice(0, NOTIFICATIONS_MAX);
      const notifications = capped.map((item) =>
        buildNotificationItem(
          item.opportunity.decision,
          {
            recipientId: item.opportunity.recipientId,
            recipientName: item.opportunity.recipientName,
          },
          buildGeneratedAt,
        ),
      );

      return {
        product: {
          version: NOTIFICATIONS_VERSION,
          generatedAt: buildGeneratedAt,
          unreadCount: notifications.length,
          notifications,
        },
        deliveredFatigueOpportunities: capped,
      };
    },
  });
}
