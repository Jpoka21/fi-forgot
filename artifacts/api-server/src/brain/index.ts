/**
 * Relationship Intelligence Engine — public entry point.
 *
 * Re-exports the Brain orchestrator and shared type contracts.
 */

export { runBrain } from "./orchestrator";

export {
  BRAIN_CONTEXT_VERSION,
  type RelationshipContext,
  type RelationshipContextLoadResult,
  type BrainDecisionOutcome,
  type BrainSignal,
  type BrainDecision,
  type BrainResponse,
} from "./types";
