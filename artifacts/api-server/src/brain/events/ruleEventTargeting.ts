/**
 * Rule-to-event targeting registry — maps rule ids to catalog event ids.
 *
 * `sourceRuleId` and `targetEventId` are separate concepts. Values may coincide
 * for v1 calendar rules; future rules may share one `targetEventId`.
 *
 * Production rules are not modified in Phase 1 — this registry establishes the
 * contract for later rule evaluation without changing DecisionRule outcomes.
 */

import type { BrainEventId } from "./brainEventCatalogTypes";

export interface RuleEventTarget {
  sourceRuleId: string;
  targetEventId: BrainEventId;
}

/** v1 calendar rules — one rule per catalog event today. */
export const CALENDAR_EVENT_RULE_TARGETS: readonly RuleEventTarget[] = [
  { sourceRuleId: "birthday", targetEventId: "birthday" },
  { sourceRuleId: "anniversary", targetEventId: "anniversary" },
  { sourceRuleId: "valentines_day", targetEventId: "valentines_day" },
] as const;

const TARGET_EVENT_ID_BY_SOURCE_RULE_ID = new Map<string, BrainEventId>(
  CALENDAR_EVENT_RULE_TARGETS.map((entry) => [entry.sourceRuleId, entry.targetEventId]),
);

export function ruleTargetEventId(sourceRuleId: string): BrainEventId | null {
  return TARGET_EVENT_ID_BY_SOURCE_RULE_ID.get(sourceRuleId) ?? null;
}
