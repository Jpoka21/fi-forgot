/**
 * Signal normalization types — read-only elevated relationship states.
 *
 * Built from availableSignals only. Not part of BrainResponse yet.
 */

export type IdentityState = "empty" | "thin" | "developing" | "established";
export type FreshnessState = "unknown" | "stale" | "aging" | "current";
export type HistoryState = "none" | "light" | "moderate" | "rich";
export type WritingState = "none" | "low" | "moderate" | "high";
export type EngagementState = "none" | "low" | "moderate" | "high";
export type MomentumState = "new" | "dormant" | "quiet" | "active";

export interface NormalizedDerivedFrom {
  signalCount: number;
  sourcesPresent: string[];
}

/**
 * Deterministic, read-only summary of raw Brain signals.
 * Dimensions are independent — none depends on another normalized field.
 */
export interface NormalizedRelationshipState {
  identity: IdentityState;
  freshness: FreshnessState;
  history: HistoryState;
  writing: WritingState;
  engagement: EngagementState;
  momentum: MomentumState;
  derivedFrom: NormalizedDerivedFrom;
}
