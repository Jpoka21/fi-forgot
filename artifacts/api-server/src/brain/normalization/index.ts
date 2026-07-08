/**
 * Signal normalization — public entry.
 *
 * Isolated pure module. Not wired into the orchestrator yet.
 */

export { normalizeSignals } from "./normalizeSignals";

export type {
  EngagementState,
  FreshnessState,
  HistoryState,
  IdentityState,
  MomentumState,
  NormalizedDerivedFrom,
  NormalizedRelationshipState,
  WritingState,
} from "./types";
