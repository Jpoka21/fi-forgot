import type { ActionPriority } from "../action/actionPlanTypes";
import type { OpportunityTemporalState } from "../temporal";

export const RELATIONSHIP_OPPORTUNITY_VERSION = 1 as const;

export type OpportunityEvidenceClassification =
  | "observation"
  | "direct_fact"
  | "inference";

export interface RelationshipOpportunityEvidence {
  evidenceId: string | null;
  source: string;
  label: string;
  classification: OpportunityEvidenceClassification;
  observedAt: string | null;
  sourceVersion?: string | null;
}

export interface RelationshipOpportunityRecommendation {
  label: string;
  href: string;
  priority: ActionPriority;
}

/** Server-owned Concierge intelligence. Presentation projections must derive from this object. */
export interface RelationshipOpportunity {
  version: typeof RELATIONSHIP_OPPORTUNITY_VERSION;
  id: string;
  relationshipId: string | null;
  relationshipIdentityProvenance: {
    sourceType: string;
    sourceId: string | null;
  } | null;
  recipient: { id: string; name: string };
  title: string;
  explanation: string;
  confidence: { status: "known"; value: number } | { status: "unknown"; value: null };
  provenance: {
    sourceType: "brain_execution";
    sourceId: string | null;
    evidence: RelationshipOpportunityEvidence[];
  };
  timing: { observedAt: string | null; temporal?: OpportunityTemporalState };
  presentation: {
    recommendationEligible: boolean;
    insightEligible: boolean;
  };
  restraint: { restrained: boolean; reason: string | null };
  recommendation: RelationshipOpportunityRecommendation | null;
}
