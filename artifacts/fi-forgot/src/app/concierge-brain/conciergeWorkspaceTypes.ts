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

export type OpportunityEvidenceClassification = "observation" | "direct_fact" | "inference";
export type OpportunityTimingState = "valid_now" | "premature" | "approaching_relevance" | "stale" | "expired" | "unknown";
export type OpportunityDecay = "none" | "watch" | "diminished" | "exhausted" | "unknown";
export type OpportunityFeedbackType = "helpful" | "not_helpful" | "not_now" | "too_early" | "too_late" | "already_handled" | "do_not_remind" | "more_often" | "less_often";
export interface OpportunityFeedbackEvent {
  id: string; lineageId: string; version: number; ownerId: string; recipientId: string; opportunityId: string;
  occurrenceCycleId: string | null; relationshipId: string | null; family: string; action: "set" | "withdraw";
  type: OpportunityFeedbackType; scope: "occurrence" | "recipient_family"; notBefore: string | null;
  timingProvenance: "qualitative" | "user_not_before"; provenance: "explicit_owner_feedback"; receivedAt: string;
  supersedesId: string | null; withdrawnEventId: string | null; idempotencyKey: string; active: boolean;
}

export interface OpportunityTemporalState {
  persistence: "available" | "unavailable" | "failed";
  support: "supported" | "withdrawn" | "archived" | "invalid" | "unknown";
  state: OpportunityTimingState;
  family: "one_time" | "annual_recurring" | "unsupported";
  effectiveDate: string | null;
  occurrenceCycleId: string | null;
  activatesAt: string | null;
  expiresAt: string | null;
  preparationWindow: { source: "policy"; days: number; approachingLeadDays?: number; staleRetentionDays?: number } | null;
  decay: OpportunityDecay;
  recommendationEligible: boolean;
  restraintReason: string | null;
  evidence: { source: string; sourceId: string | null; sourceVersion: string | null; evidenceId: string | null; dateLabel: string | null; dateValue: string | null };
  history: Array<{ changeId: string; evaluatedAt: string; state: OpportunityTimingState; occurrenceCycleId: string | null; effectiveDate: string | null; reason: string; family: "one_time" | "annual_recurring" | "unsupported"; evidence: OpportunityTemporalState["evidence"] }>;
}

export interface RelationshipOpportunity {
  version: 1;
  id: string;
  relationshipId: string | null;
  relationshipIdentityProvenance: { sourceType: string; sourceId: string | null } | null;
  recipient: { id: string; name: string };
  title: string;
  explanation: string;
  confidence: { status: "known"; value: number } | { status: "unknown"; value: null };
  provenance: {
    sourceType: "brain_execution";
    sourceId: string | null;
    evidence: Array<{
      evidenceId: string | null;
      source: string;
      label: string;
      classification: OpportunityEvidenceClassification;
      observedAt: string | null;
      sourceVersion?: string | null;
    }>;
  };
  timing: { observedAt: string | null; temporal?: OpportunityTemporalState };
  presentation: { recommendationEligible: boolean; insightEligible: boolean };
  restraint: { restrained: boolean; reason: string | null };
  recommendation: { label: string; href: string; priority: ActionPriority } | null;
  feedback?: { history: OpportunityFeedbackEvent[]; active: OpportunityFeedbackEvent[]; available: boolean };
}

export interface ConciergeWorkspaceResponse {
  version: typeof CONCIERGE_WORKSPACE_VERSION;
  generatedAt: string;
  opportunities: RelationshipOpportunity[];
  recommendations: ConciergeRecommendation[];
  insights: ConciergeInsight[];
}
