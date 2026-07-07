import { loadCalendarEvents } from "@/app/calendar/calendarEngine";
import { collectPendingReviewCount } from "@/app/dashboard/dashboardEngine";
import { loadConciergeSuggestions } from "@/app/concierge-suggestions/conciergeSuggestionsEngine";
import {
  resolveAutopilotRuntimeState,
  type FiAutopilotActivityItem,
  type FiAutopilotCoverageSummary,
  type FiAutopilotInsight,
  type FiAutopilotSnapshot,
} from "@/app/autopilot/autopilotDomain";
import {
  getCards,
  getPersonalSettings,
  getRecipients,
  type CardOrder,
  type Recipient,
} from "@/lib/data";
import { computeOverallHealth } from "@/lib/relationship-health";

function buildCoverage(recipients: Recipient[]): FiAutopilotCoverageSummary {
  const activeRecipients = recipients.filter((recipient) => recipient.active !== false);
  const pausedRecipients = recipients.length - activeRecipients.length;
  const trackedOccasions = activeRecipients.reduce(
    (sum, recipient) => sum + (recipient.selectedEvents?.length ?? 0),
    0,
  );
  const health = computeOverallHealth(activeRecipients);
  const averageHealthScore =
    health.recipientHealths.length > 0
      ? Math.round(
          health.recipientHealths.reduce((sum, item) => sum + item.score, 0)
            / health.recipientHealths.length,
        )
      : 0;
  const relationshipsNeedingAttention = health.recipientHealths.filter(
    (item) => item.topGap !== "Profile looks great!",
  ).length;

  return {
    activeRecipients: activeRecipients.length,
    pausedRecipients,
    trackedOccasions,
    averageHealthScore,
    relationshipsNeedingAttention,
  };
}

function buildRecentActivity(
  recipients: Recipient[],
  cards: CardOrder[],
): FiAutopilotActivityItem[] {
  const items: FiAutopilotActivityItem[] = [];

  for (const card of cards) {
    if (card.status === "Approved" || card.status === "Ready for approval") {
      items.push({
        id: `activity-card-${card.id}`,
        title: `${card.holiday} for ${card.recipientName}`,
        detail: card.status === "Approved" ? "Approved and queued" : "Ready for your review",
        href: `/cards/review?id=${card.id}`,
      });
    }
  }

  for (const recipient of recipients.slice(0, 3)) {
    items.push({
      id: `activity-recipient-${recipient.id}`,
      title: `${recipient.name} is on your list`,
      detail: recipient.relationship,
      href: `/relationship/${recipient.id}`,
    });
  }

  return items.slice(0, 6);
}

function buildInsights(
  coverage: FiAutopilotCoverageSummary,
  pendingReviewCount: number,
  runtimeState: FiAutopilotSnapshot["runtimeState"],
): FiAutopilotInsight[] {
  const insights: FiAutopilotInsight[] = [];

  if (pendingReviewCount > 0) {
    insights.push({
      id: "pending-review",
      title: `${pendingReviewCount} card${pendingReviewCount === 1 ? "" : "s"} waiting for review`,
      detail: "A quick approval keeps everything on schedule.",
      href: "/cards/review",
    });
  }

  if (coverage.relationshipsNeedingAttention > 0) {
    insights.push({
      id: "profile-gaps",
      title: `${coverage.relationshipsNeedingAttention} relationship${coverage.relationshipsNeedingAttention === 1 ? "" : "s"} could use a little more detail`,
      detail: "Richer profiles help cards sound more like you.",
      href: "/people",
    });
  }

  if (runtimeState === "manual") {
    insights.push({
      id: "trust-builder",
      title: "Start with review mode",
      detail: "Approve a few cards, then enable Autopilot when you trust the flow.",
      href: "/settings/reminders",
    });
  }

  if (coverage.pausedRecipients > 0) {
    insights.push({
      id: "paused-people",
      title: `${coverage.pausedRecipients} paused relationship${coverage.pausedRecipients === 1 ? "" : "s"}`,
      detail: "Restore them from Your People when you're ready.",
      href: "/people",
    });
  }

  return insights.slice(0, 4);
}

export interface BuildAutopilotSnapshotOptions {
  userEmail?: string;
  isPaused?: boolean;
  isOnline?: boolean;
}

export function buildAutopilotSnapshot(
  options: BuildAutopilotSnapshotOptions = {},
): FiAutopilotSnapshot {
  const recipients = getRecipients();
  const cards = getCards();
  const settings = getPersonalSettings();
  const isPaused = options.isPaused ?? false;
  const runtimeState = resolveAutopilotRuntimeState(settings, isPaused);
  const coverage = buildCoverage(recipients);
  const pendingReviewCount = collectPendingReviewCount(cards, options.userEmail);
  const upcomingAutomated = loadCalendarEvents(60).filter((event) => {
    if (runtimeState === "manual") return !event.hasCard || event.status === "draft";
    return true;
  });
  const recommendations = loadConciergeSuggestions(options.userEmail).slice(0, 3);

  return {
    settings,
    runtimeState,
    isOnline: options.isOnline ?? true,
    coverage,
    pendingReviewCount,
    upcomingAutomated: upcomingAutomated.slice(0, 8),
    recommendations,
    recentActivity: buildRecentActivity(recipients, cards),
    insights: buildInsights(coverage, pendingReviewCount, runtimeState),
    isEmpty: recipients.length === 0,
  };
}
