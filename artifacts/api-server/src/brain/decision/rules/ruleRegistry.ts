/**
 * Rule Registry — static list of registered deterministic rules.
 */

import { anniversaryRule } from "./anniversaryRule";
import { birthdayRule } from "./birthdayRule";
import { cardGapRule } from "./cardGapRule";
import { freshUpdateRule } from "./freshUpdateRule";
import { inactivityRule } from "./inactivityRule";
import { memoryAccumulationRule } from "./memoryAccumulationRule";
import type { DecisionRule } from "./types";
import { valentinesDayRule } from "./valentinesDayRule";
import { waitRule } from "./waitRule";

export const ruleRegistry: DecisionRule[] = [
  birthdayRule,
  anniversaryRule,
  valentinesDayRule,
  inactivityRule,
  freshUpdateRule,
  cardGapRule,
  memoryAccumulationRule,
  waitRule,
];
