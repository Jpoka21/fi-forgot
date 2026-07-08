/**
 * Rule Registry — static list of registered deterministic rules.
 */

import { birthdayRule } from "./birthdayRule";
import { freshUpdateRule } from "./freshUpdateRule";
import type { DecisionRule } from "./types";
import { waitRule } from "./waitRule";

export const ruleRegistry: DecisionRule[] = [birthdayRule, freshUpdateRule, waitRule];
