/**
 * Relationship Intelligence Engine — shared types.
 *
 * Phase 1 is read-only. These types define the Brain's data contracts without
 * changing any existing API behavior. Decision and orchestration types are
 * declared here for later commits but are not produced yet.
 */

import type { RecipientContext } from "../services/recipient-context";

export const BRAIN_CONTEXT_VERSION = 1 as const;

// ─── Relationship context ─────────────────────────────────────────────────────

/**
 * Structured relationship understanding projected from existing backend services.
 * Alias of RecipientContext — the Brain reads via assembleRecipientContext().
 */
export type RelationshipContext = RecipientContext;

/**
 * Output of loadRelationshipContext(). Read-only assembly only.
 */
export interface RelationshipContextLoadResult {
  brainContextVersion: typeof BRAIN_CONTEXT_VERSION;
  relationshipId: string;
  userId: string;
  loadedAt: string;
  relationshipContext: RelationshipContext;
}

// ─── Future Brain response shape (orchestrator — not yet implemented) ─────────

export type BrainDecisionOutcome =
  | "wait"
  | "do_nothing"
  | "ask_question"
  | "prepare_card"
  | "recommend_action"
  | "show_dashboard_insight";

export interface BrainSignal {
  source: string;
  label: string;
  value: unknown;
}

export interface BrainDecision {
  outcome: BrainDecisionOutcome;
}

/**
 * Full Brain response — produced by the orchestrator in a later commit.
 */
export interface BrainResponse {
  relationshipId: string;
  relationshipContext: RelationshipContext;
  availableSignals: BrainSignal[];
  decision: BrainDecision;
  confidence: number;
  reasons: string[];
  debugNotes: string[];
}
