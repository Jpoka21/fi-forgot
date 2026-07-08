/**
 * Internal rule engine result — decision output plus winning rule attribution.
 *
 * Not part of the public decision API or BrainResponse.
 */

import type { DecideResult } from "./decide";

export interface RuleEngineResult {
  decideResult: DecideResult;
  sourceRuleId: string;
}
