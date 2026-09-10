/**
 * Concierge workspace — relationship concierge public contract (v1).
 */

import type { ActionPriority } from "../action/actionPlanTypes";
import type { RelationshipOpportunity } from "./relationshipOpportunityTypes";

export const CONCIERGE_WORKSPACE_VERSION = 1 as const;

/** Maximum ranked recommendations in one workspace payload. */
export const CONCIERGE_RECOMMENDATIONS_MAX = 6 as const;

/** Maximum insights derived from ranked relationship opportunities. */
export const CONCIERGE_INSIGHTS_MAX = 4 as const;

/** Maximum Opportunity actions presented in the Concierge workspace/conversation. */
export const CONCIERGE_PRESENTED_RECOMMENDATIONS_MAX = 3 as const;

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
  opportunities: RelationshipOpportunity[];
  recommendations: ConciergeRecommendation[];
  insights: ConciergeInsight[];
}
