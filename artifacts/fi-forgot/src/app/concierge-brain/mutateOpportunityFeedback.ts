import { API_ENDPOINTS } from "@/app/api/endpoints";
import { apiFetch } from "@/app/api/shared/request";
import type { OpportunityFeedbackEvent, OpportunityFeedbackType } from "./conciergeWorkspaceTypes";

export interface OpportunityFeedbackRequest {
  recipientId: string; opportunityId?: string; occurrenceCycleId?: string | null; type?: OpportunityFeedbackType;
  scope?: "occurrence" | "recipient_family"; notBefore?: string | null; expectedVersion: number; idempotencyKey: string; withdraw?: boolean; feedbackEventId?: string;
}

export function mutateOpportunityFeedback(request: OpportunityFeedbackRequest) {
  return apiFetch<{ feedback: OpportunityFeedbackEvent }>(API_ENDPOINTS.concierge.opportunityFeedback, { method: "POST", json: request, throwOnError: true });
}
