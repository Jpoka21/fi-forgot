/**
 * Concierge workspace presentation contract — UI-ready, Concierge-owned model.
 */

import type { ActionPriority } from "@/app/product-brain/productBrainDecisionTypes";
import type { ConciergeRecommendationKind } from "@/app/concierge-brain/conciergeWorkspaceTypes";

export interface ConciergeRecommendationViewModel {
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

export interface ConciergeInsightViewModel {
  id: string;
  recipientId: string;
  recipientName: string;
  title: string;
  body: string;
  href?: string;
}

export interface ConciergeWorkspaceViewModel {
  recommendations: ConciergeRecommendationViewModel[];
  insights: ConciergeInsightViewModel[];
}
