import type { DashboardOpportunityViewModel } from "@/app/dashboard-brain/dashboardOpportunityViewModel";
import type {
  FiDashboardSnapshot,
  FiDashboardSpotlight,
  FiDashboardSuggestedAction,
} from "@/app/dashboard/dashboardDomain";
import type { Recipient } from "@/lib/data";

export interface MergeBrainIntoSnapshotOptions {
  snapshot: FiDashboardSnapshot;
  opportunities: DashboardOpportunityViewModel[];
  brainEnabled: boolean;
}

function findRecipient(
  recipients: Recipient[],
  recipientId: string,
): Recipient | undefined {
  return recipients.find((recipient) => recipient.id === recipientId);
}

function mapOpportunityToSuggestedAction(
  opportunity: DashboardOpportunityViewModel,
): FiDashboardSuggestedAction {
  return {
    id: opportunity.id,
    title: opportunity.title,
    detail: opportunity.explanation,
    actionLabel: opportunity.actionLabel,
    href: opportunity.href,
    recipientId: opportunity.recipientId,
    recipientName: opportunity.recipientName,
    priority: opportunity.priority,
  };
}

export function mergeBrainSuggestedActionsIntoSnapshot(
  options: Pick<MergeBrainIntoSnapshotOptions, "snapshot" | "opportunities" | "brainEnabled">,
): FiDashboardSnapshot {
  const { snapshot, opportunities, brainEnabled } = options;

  if (!brainEnabled) {
    return snapshot;
  }

  return {
    ...snapshot,
    suggestedActions: opportunities.map(mapOpportunityToSuggestedAction),
  };
}

function mapTopOpportunityToSpotlight(
  opportunity: DashboardOpportunityViewModel,
  recipient: Recipient,
): FiDashboardSpotlight {
  return {
    recipient,
    summary: `${opportunity.recipientName} · ${opportunity.title}`,
    suggestedActionLabel: opportunity.actionLabel,
    suggestedActionHref: opportunity.href,
    healthInsight: opportunity.explanation,
  };
}

export function mergeBrainSpotlightIntoSnapshot(
  options: Pick<MergeBrainIntoSnapshotOptions, "snapshot" | "opportunities" | "brainEnabled">,
): FiDashboardSnapshot {
  const { snapshot, opportunities, brainEnabled } = options;

  if (!brainEnabled) {
    return snapshot;
  }

  const topOpportunity = opportunities[0];
  if (!topOpportunity) {
    return {
      ...snapshot,
      spotlight: null,
    };
  }

  const spotlightRecipient = findRecipient(snapshot.recipients, topOpportunity.recipientId);
  const spotlight = spotlightRecipient
    ? mapTopOpportunityToSpotlight(topOpportunity, spotlightRecipient)
    : null;

  return {
    ...snapshot,
    spotlight,
  };
}

export function mergeBrainHeroIntoSnapshot(
  options: Pick<MergeBrainIntoSnapshotOptions, "snapshot" | "opportunities" | "brainEnabled">,
): FiDashboardSnapshot {
  const { snapshot, opportunities, brainEnabled } = options;

  if (!brainEnabled) {
    return snapshot;
  }

  const topOpportunity = opportunities[0];

  return {
    ...snapshot,
    welcome: {
      ...snapshot.welcome,
      conciergeSummary: topOpportunity?.explanation,
    },
  };
}

/**
 * Merges server-ranked Brain relationship opportunities into a dashboard snapshot.
 *
 * Preserves operational snapshot fields. Does not rank opportunities on the frontend.
 */
export function mergeBrainIntoSnapshot(
  options: MergeBrainIntoSnapshotOptions,
): FiDashboardSnapshot {
  const { snapshot, opportunities, brainEnabled } = options;

  if (!brainEnabled) {
    return snapshot;
  }

  const withSuggestedActions = mergeBrainSuggestedActionsIntoSnapshot(options);
  const withSpotlight = mergeBrainSpotlightIntoSnapshot({
    snapshot: withSuggestedActions,
    opportunities,
    brainEnabled: true,
  });

  return mergeBrainHeroIntoSnapshot({
    snapshot: withSpotlight,
    opportunities,
    brainEnabled: true,
  });
}
