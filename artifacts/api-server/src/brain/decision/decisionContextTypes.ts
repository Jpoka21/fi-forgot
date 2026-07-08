/**
 * DecisionContext types — decision-facing relationship understanding.
 *
 * Derived from NormalizedRelationshipState. Not wired into decide() yet.
 * Not part of BrainResponse.
 */

import type {
  EngagementState,
  FreshnessState,
  HistoryState,
  IdentityState,
  MomentumState,
  NormalizedRelationshipState,
  WritingState,
} from "../normalization";

/** Decision vocabulary aliases for normalized dimensions. */
export type RelationshipMaturity = IdentityState;
export type InformationFreshness = FreshnessState;
export type TimelineHistory = HistoryState;
export type WritingReadiness = WritingState;
export type EngagementLevel = EngagementState;
export type RelationshipMomentum = MomentumState;

export interface DecisionContextDerivedFrom {
  signalCount: number;
  sourcesPresent: string[];
  /** Shallow snapshot of the six normalized dimensions used as input. */
  normalizedSnapshot: {
    identity: IdentityState;
    freshness: FreshnessState;
    history: HistoryState;
    writing: WritingState;
    engagement: EngagementState;
    momentum: MomentumState;
  };
}

/**
 * Higher-level relationship understanding for a future decision engine.
 * Step A: 1:1 mapping from NormalizedRelationshipState — no raw signal reinterpretation.
 */
export interface DecisionContext {
  identity: IdentityState;
  freshness: FreshnessState;
  history: HistoryState;
  writing: WritingState;
  engagement: EngagementState;
  momentum: MomentumState;

  relationshipMaturity: RelationshipMaturity;
  informationFreshness: InformationFreshness;
  writingReadiness: WritingReadiness;
  engagementLevel: EngagementLevel;
  relationshipMomentum: RelationshipMomentum;
  timelineHistory: TimelineHistory;

  derivedFrom: DecisionContextDerivedFrom;
}

/** Re-export normalized input type for callers of buildDecisionContext. */
export type { NormalizedRelationshipState };
