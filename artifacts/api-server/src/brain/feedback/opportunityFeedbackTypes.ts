export const OPPORTUNITY_FEEDBACK_TYPES = [
  "helpful", "not_helpful", "not_now", "too_early", "too_late",
  "already_handled", "do_not_remind", "more_often", "less_often",
] as const;

export type OpportunityFeedbackType = typeof OPPORTUNITY_FEEDBACK_TYPES[number];
export type OpportunityFeedbackScope = "occurrence" | "recipient_family";
export type OpportunityFeedbackAction = "set" | "withdraw";

export interface OpportunityFeedbackTarget {
  ownerId: string;
  recipientId: string;
  opportunityId: string;
  occurrenceCycleId: string | null;
  relationshipId: string | null;
  family: string;
}

/** Immutable explicit-interaction-preference event. It is never relationship truth or outcome proof. */
export interface OpportunityFeedbackEvent extends OpportunityFeedbackTarget {
  id: string;
  lineageId: string;
  version: number;
  action: OpportunityFeedbackAction;
  type: OpportunityFeedbackType;
  scope: OpportunityFeedbackScope;
  notBefore: string | null;
  timingProvenance: "qualitative" | "user_not_before";
  provenance: "explicit_owner_feedback";
  receivedAt: string;
  supersedesId: string | null;
  withdrawnEventId: string | null;
  idempotencyKey: string;
  active: boolean;
}

export interface OpportunityFeedbackMutation {
  recipientId: string;
  opportunityId: string;
  occurrenceCycleId: string | null;
  type: OpportunityFeedbackType;
  scope?: OpportunityFeedbackScope;
  notBefore?: string | null;
  expectedVersion: number;
  idempotencyKey: string;
  withdraw?: boolean;
  feedbackEventId?: string;
}

export const FEEDBACK_SEMANTICS: Record<OpportunityFeedbackType, string> = {
  helpful: "Records an explicit positive preference without changing eligibility.",
  not_helpful: "Records an explicit negative preference for this occurrence.",
  not_now: "Defers presentation; an optional user supplied not-before date may bound the deferral.",
  too_early: "Qualitatively suppresses this occurrence as premature unless a user supplies not-before.",
  too_late: "Qualitatively suppresses this occurrence as no longer timely.",
  already_handled: "Suppresses this occurrence based only on the owner's report; it does not prove action.",
  do_not_remind: "Suppresses the explicitly selected occurrence or recipient-and-family scope.",
  more_often: "Expresses cadence preference but never creates or bypasses eligibility.",
  less_often: "Adds presentation restraint for the selected scope.",
};
