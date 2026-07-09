/**
 * Dashboard opportunity presentation contract — UI-ready, source-agnostic model.
 */

import type { ActionPriority } from "@/app/product-brain/productBrainDecisionTypes";

export interface DashboardOpportunityViewModel {
  id: string;
  recipientId: string;
  recipientName: string;
  title: string;
  explanation: string;
  href: string;
  priority: ActionPriority;
  actionLabel: string;
}
