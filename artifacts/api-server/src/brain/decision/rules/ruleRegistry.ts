/**
 * Rule Registry — static list of registered deterministic rules.
 */

import { accomplishmentFollowUpRule } from "./accomplishmentFollowUpRule";
import { anniversaryRule } from "./anniversaryRule";
import { birthdayRule } from "./birthdayRule";
import { cardGapRule } from "./cardGapRule";
import { freshUpdateRule } from "./freshUpdateRule";
import { inactivityRule } from "./inactivityRule";
import { lifeEventFollowUpRule } from "./lifeEventFollowUpRule";
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
  lifeEventFollowUpRule,
  cardGapRule,
  memoryAccumulationRule,
  accomplishmentFollowUpRule,
  waitRule,
];
