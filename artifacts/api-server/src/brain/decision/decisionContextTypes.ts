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
import type { LifeEventClassification } from "../lifeEvents/lifeEventTypes";

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

  /** Days until next birthday from RelationshipContext.generatedAt. Null when unknown. */
  birthdayDaysAway: number | null;
  /** Days until next anniversary from RelationshipContext.generatedAt. Null when unknown. */
  anniversaryDaysAway: number | null;
  /** Days until next Valentine's Day from RelationshipContext.generatedAt. */
  valentinesDaysAway: number | null;
  /** Relationship type fact from RelationshipContext.relationship.type. */
  relationshipType: string | null;
  /** Configured preview window from RelationshipContext.delivery.previewDays. */
  preparationWindowDays: number | null;
  /** Days since the most recent relationship timeline activity. Null when unknown or empty. */
  lastRelationshipActivityDaysAgo: number | null;
  /** Days since the most recent card event on the relationship timeline. Null when none. */
  lastCardActivityDaysAgo: number | null;
  /** Days since the most recent fresh update. Null when none. */
  mostRecentFreshUpdateDaysAgo: number | null;
  /** Question key of the most recent fresh update. Null when none. */
  mostRecentFreshUpdateQuestionKey: string | null;
  /** Primary classified life event, when present. Null when none. */
  lifeEvent: LifeEventClassification | null;

  derivedFrom: DecisionContextDerivedFrom;
}

/** Re-export normalized input type for callers of buildDecisionContext. */
export type { NormalizedRelationshipState };
