export const OPPORTUNITY_ACTION_STATES = [
  "unknown", "planned", "user_reported_completed", "not_completed", "dismissed", "no_longer_relevant",
] as const;
export const RELATIONSHIP_OUTCOME_STATES = [
  "unknown", "went_well", "went_poorly", "appreciated", "unnecessary",
] as const;

export type OpportunityActionState = typeof OPPORTUNITY_ACTION_STATES[number];
export type RelationshipOutcomeState = typeof RELATIONSHIP_OUTCOME_STATES[number];
export type FollowThroughDimension = "action" | "outcome";

export interface OpportunityFollowThroughTarget {
  ownerId: string;
  recipientId: string;
  opportunityId: string;
  occurrenceCycleId: string | null;
  relationshipId: string | null;
  family: string;
  sourceType: "brain_execution";
  sourceId: string;
}

/** Append-only owner report. It is not system observation or external verification. */
export interface OpportunityFollowThroughEvent extends OpportunityFollowThroughTarget {
  id: string;
  lineageId: string;
  version: number;
  dimension: FollowThroughDimension;
  value: OpportunityActionState | RelationshipOutcomeState;
  action: "set" | "withdraw";
  provenance: "explicit_owner_report";
  verification: "user_reported";
  receivedAt: string;
  supersedesId: string | null;
  withdrawnEventId: string | null;
  idempotencyKey: string;
  active: boolean;
}

export interface OpportunityFollowThroughMutation {
  recipientId: string;
  opportunityId?: string;
  occurrenceCycleId?: string | null;
  dimension?: FollowThroughDimension;
  value?: OpportunityActionState | RelationshipOutcomeState;
  expectedVersion: number;
  idempotencyKey: string;
  withdraw?: boolean;
  followThroughEventId?: string;
}

export interface OpportunityFollowThroughProjection {
  action: OpportunityFollowThroughEvent | null;
  outcome: OpportunityFollowThroughEvent | null;
  history: OpportunityFollowThroughEvent[];
  available: boolean;
}
