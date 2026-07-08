/**
 * WaitRule — lowest-priority fallback that always matches.
 *
 * Phase 1 preserves the frozen scaffold decision output exactly.
 */

import type { DecisionContext } from "../decisionContextTypes";
import type { DecisionRule, RuleCandidate } from "./types";

const WAIT_CANDIDATE: RuleCandidate = {
  ruleId: "wait",
  priority: 0,
  confidence: 0,
  decision: { outcome: "wait" },
  reasons: ["read_only_scaffold", "no_behavior_change"],
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

export const waitRule: DecisionRule = {
  id: "wait",
  evaluate(_context: DecisionContext): RuleCandidate {
    return WAIT_CANDIDATE;
  },
};
