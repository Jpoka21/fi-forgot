import type { DashboardBrainOpportunity } from "@/app/dashboard-brain/dashboardBrainOpportunitiesTypes";
import type { DashboardOpportunityViewModel } from "@/app/dashboard-brain/dashboardOpportunityViewModel";

export function dashboardOpportunityViewModelId(
  recipientId: string,
  sourceRuleId: string,
): string {
  return `${recipientId}:${sourceRuleId}`;
}

export function mapDashboardOpportunityViewModel(
  opportunity: DashboardBrainOpportunity,
): DashboardOpportunityViewModel {
  return {
    id: dashboardOpportunityViewModelId(opportunity.recipientId, opportunity.sourceRuleId),
    recipientId: opportunity.recipientId,
    recipientName: opportunity.recipientName,
    title: opportunity.title,
    explanation: opportunity.explanation,
    href: opportunity.profileHref,
    priority: opportunity.priority,
    actionLabel: opportunity.actionLabel,
  };
}
