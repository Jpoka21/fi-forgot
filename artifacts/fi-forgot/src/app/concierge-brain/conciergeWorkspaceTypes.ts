/**
 * Concierge workspace — frontend mirror of GET /api/v2/concierge (v1).
 */

import type { ActionPriority } from "@/app/product-brain/productBrainDecisionTypes";

export const CONCIERGE_WORKSPACE_VERSION = 1 as const;

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
