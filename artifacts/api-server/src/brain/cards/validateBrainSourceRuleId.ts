/**
 * Validation for write-once personal card Brain provenance.
 */

import { ruleRegistry } from "../decision/rules/ruleRegistry";

const REGISTERED_BRAIN_SOURCE_RULE_IDS = new Set(
  ruleRegistry.map((rule) => rule.id).filter((ruleId) => ruleId !== "wait"),
);

export function isRegisteredBrainSourceRuleId(sourceRuleId: string): boolean {
  return REGISTERED_BRAIN_SOURCE_RULE_IDS.has(sourceRuleId);
}

export function assertValidBrainSourceRuleIdForCardProvenance(sourceRuleId: string): void {
  const trimmed = sourceRuleId.trim();
  if (!trimmed) {
    throw new Error("brainSourceRuleId must be a non-empty string");
  }
  if (trimmed === "wait") {
    throw new Error('brainSourceRuleId "wait" is not a completable Brain opportunity');
  }
  if (!isRegisteredBrainSourceRuleId(trimmed)) {
    throw new Error(`brainSourceRuleId "${trimmed}" is not a registered Brain rule id`);
  }
}
