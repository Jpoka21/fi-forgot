/**
 * Rule evaluation summary types — development-only observability.
 *
 * Not part of BrainResponse or any production API contract.
 */

import type { BrainDecisionOutcome } from "../../types";
import type { RuleCandidate } from "./types";

export type RuleResolutionStatus = "winner" | "matched_lost" | "not_matched";

export type RuleLossReason =
  | "lower_priority"
  | "lower_confidence"
  | "tie_break"
  | null;

export interface RuleEvaluationEntry {
  ruleId: string;
  registryIndex: number;
  matched: boolean;
  resolutionStatus: RuleResolutionStatus;
  candidate: RuleCandidate | null;
  priority: number | null;
  confidence: number | null;
  outcome: BrainDecisionOutcome | null;
  reasons: string[];
  debugNotes: string[];
  lostToRuleId: string | null;
  lostBecause: RuleLossReason;
}

/** Registry-order record of every rule's evaluation and resolution outcome. */
export interface RuleEvaluationSummary {
  entries: RuleEvaluationEntry[];
}

export interface EvaluateRulesResult {
  candidates: RuleCandidate[];
  entries: RuleEvaluationEntry[];
}
