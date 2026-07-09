/**
 * Concierge workspace — relationship concierge public contract (v1).
 */

import type { ActionPriority } from "../action/actionPlanTypes";

export const CONCIERGE_WORKSPACE_VERSION = 1 as const;

/** Maximum ranked recommendations in one workspace payload. */
export const CONCIERGE_RECOMMENDATIONS_MAX = 6 as const;

/** Maximum insights derived from ranked relationship opportunities. */
export const CONCIERGE_INSIGHTS_MAX = 4 as const;

export const CONCIERGE_RECOMMENDATION_KIND_RELATIONSHIP = "relationship" as const;

export type ConciergeRecommendationKind = typeof CONCIERGE_RECOMMENDATION_KIND_RELATIONSHIP;

export interface ConciergeRecommendation {
  id: string;
  recipientId: string;
  recipientName: string;
  title: string;
  body: string;
  href: string;
  actionLabel: string;
  priority: ActionPriority;
  kind: ConciergeRecommendationKind;
}

export interface ConciergeInsight {
  id: string;
  recipientId: string;
  recipientName: string;
  title: string;
  body: string;
  href?: string;
}

export interface ConciergeWorkspaceResponse {
  version: typeof CONCIERGE_WORKSPACE_VERSION;
  generatedAt: string;
  recommendations: ConciergeRecommendation[];
  insights: ConciergeInsight[];
}
