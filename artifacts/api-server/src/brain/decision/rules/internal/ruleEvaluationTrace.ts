/**
 * Engine-private trace sink for rule evaluation explanations.
 *
 * NOT part of the public DecisionRule contract. Used only by evaluateRules()
 * to collect no-match explanations during the single evaluation pass.
 *
 * Do not export from public barrels. Rule implementations may accept an
 * optional trace parameter as a private engine convention — not a public API.
 */

export interface RuleNoMatchExplanation {
  reasons: string[];
  debugNotes: string[];
}

export interface RuleEvaluationTrace {
  recordNoMatch(explanation: RuleNoMatchExplanation): void;
}

/**
 * Internal evaluate signature used only inside evaluateRules().
 * Public DecisionRule.evaluate remains (context) => RuleCandidate | null.
 */
export type RuleEvaluateWithTrace = (
  context: import("../../decisionContextTypes").DecisionContext,
  trace?: RuleEvaluationTrace,
) => import("../types").RuleCandidate | null;

export function createRuleEvaluationTrace(
  onNoMatch: (explanation: RuleNoMatchExplanation) => void,
): RuleEvaluationTrace {
  return {
    recordNoMatch(explanation) {
      onNoMatch(explanation);
    },
  };
}
