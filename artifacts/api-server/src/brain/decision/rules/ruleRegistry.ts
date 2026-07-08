/**
 * Rule Registry — static list of registered deterministic rules.
 */

import { freshUpdateRule } from "./freshUpdateRule";
import type { DecisionRule } from "./types";
import { waitRule } from "./waitRule";

export const ruleRegistry: DecisionRule[] = [freshUpdateRule, waitRule];
