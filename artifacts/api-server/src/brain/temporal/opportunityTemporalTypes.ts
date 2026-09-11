export type OpportunityTimingState =
  | "valid_now"
  | "premature"
  | "approaching_relevance"
  | "stale"
  | "expired"
  | "unknown";

export type OpportunityDecay = "none" | "watch" | "diminished" | "exhausted" | "unknown";
export type OpportunityTemporalFamily = "one_time" | "annual_recurring" | "unsupported";
export type OpportunityTemporalSupport = "supported" | "withdrawn" | "archived" | "invalid" | "unknown";

export interface OpportunityTemporalEvidence {
  source: string;
  sourceId: string | null;
  sourceVersion: string | null;
  evidenceId: string | null;
  dateLabel: string | null;
  dateValue: string | null;
}

export interface OpportunityTimingChange {
  changeId: string;
  evaluatedAt: string;
  state: OpportunityTimingState;
  occurrenceCycleId: string | null;
  effectiveDate: string | null;
  reason: string;
  family: OpportunityTemporalFamily;
  evidence: OpportunityTemporalEvidence;
}

export interface OpportunityTemporalState {
  persistence: "available" | "unavailable" | "failed";
  support: OpportunityTemporalSupport;
  state: OpportunityTimingState;
  family: OpportunityTemporalFamily;
  effectiveDate: string | null;
  occurrenceCycleId: string | null;
  activatesAt: string | null;
  expiresAt: string | null;
  preparationWindow: { source: "policy"; days: number; approachingLeadDays?: number; staleRetentionDays?: number } | null;
  decay: OpportunityDecay;
  recommendationEligible: boolean;
  restraintReason: string | null;
  evidence: OpportunityTemporalEvidence;
  history: OpportunityTimingChange[];
}

export interface EvaluateOpportunityTemporalInput {
  family: OpportunityTemporalFamily;
  dateValue: unknown;
  dateLabel?: string | null;
  evaluatedAt: string;
  evidence: Omit<OpportunityTemporalEvidence, "dateLabel" | "dateValue">;
  previousHistory?: OpportunityTimingChange[];
  preparationWindowDays?: number;
  evidenceStatus?: "archived" | "withdrawn" | "invalidated";
  fixedOccurrenceCycleId?: string;
  /** Previously established occurrence date; never replaces the raw source date. */
  fixedOccurrenceDate?: string;
}
