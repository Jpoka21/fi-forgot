/**
 * Unit tests for orchestrator action plan wiring.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestrator-action-plan.test.ts
 */

import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import type { ActionPlan } from "../brain/action/actionPlanTypes.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import { minimalRelationshipContext } from "./fixtures/minimalRelationshipContext.js";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expect(label: string, actual: unknown, expected: unknown): void {
  const ok =
    typeof expected === "object" && expected !== null
      ? JSON.stringify(actual) === JSON.stringify(expected)
      : actual === expected;
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
    console.log(`      expected: ${JSON.stringify(expected)}`);
    console.log(`      received: ${JSON.stringify(actual)}`);
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

function normalized(
  overrides: Partial<NormalizedRelationshipState> = {},
): NormalizedRelationshipState {
  const { derivedFrom: derivedOverride, ...rest } = overrides;
  return {
    identity: "empty",
    freshness: "unknown",
    history: "none",
    writing: "none",
    engagement: "none",
    momentum: "new",
    ...rest,
    derivedFrom: {
      signalCount: 0,
      sourcesPresent: [],
      ...derivedOverride,
    },
  };
}

const WAIT_ACTION_PLAN: ActionPlan = {
  type: "wait",
  category: "none",
  priority: "low",
  sourceRuleId: "wait",
  primaryReason: "read_only_scaffold",
  reasons: ["read_only_scaffold", "no_behavior_change"],
  confidence: 0,
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

const FRESH_UPDATE_ACTION_PLAN: ActionPlan = {
  type: "ask_question",
  category: "fresh_update",
  priority: "medium",
  sourceRuleId: "fresh_update",
  primaryReason: "information_stale",
  reasons: ["information_stale", "fresh_update_due"],
  confidence: 52,
  debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
};

const BIRTHDAY_ACTION_PLAN: ActionPlan = {
  type: "ask_question",
  category: "birthday",
  priority: "medium",
  sourceRuleId: "birthday",
  primaryReason: "birthday_preparation_window",
  reasons: ["birthday_preparation_window"],
  confidence: 60,
  debugNotes: [
    "BirthdayRule matched",
    "birthday days away: 7",
    "preparation window: 14",
  ],
};

section("planFromDecisionContext → wait action plan");
{
  const { decideResult, actionPlan } = planFromDecisionContext(
    buildDecisionContext(normalized(), minimalRelationshipContext()),
  );
  expect("outcome wait", decideResult.decision.outcome, "wait");
  expect("actionPlan", actionPlan, WAIT_ACTION_PLAN);
  expect(
    "serialized wait action plan",
    JSON.stringify(actionPlan),
    JSON.stringify(WAIT_ACTION_PLAN),
  );
}

section("planFromDecisionContext → fresh_update action plan");
{
  const { decideResult, actionPlan } = planFromDecisionContext(
    buildDecisionContext(
      normalized({ freshness: "stale" }),
      minimalRelationshipContext(),
    ),
  );
  expect("outcome ask_question", decideResult.decision.outcome, "ask_question");
  expect("actionPlan", actionPlan, FRESH_UPDATE_ACTION_PLAN);
  expect(
    "serialized fresh update action plan",
    JSON.stringify(actionPlan),
    JSON.stringify(FRESH_UPDATE_ACTION_PLAN),
  );
}

section("planFromDecisionContext → birthday action plan");
{
  const { decideResult, actionPlan } = planFromDecisionContext(
    buildDecisionContext(
      normalized(),
      minimalRelationshipContext({
        generatedAt: "2026-07-01T00:00:00.000Z",
        birthday: "1988-07-08",
        previewDays: 14,
      }),
    ),
  );
  expect("outcome ask_question", decideResult.decision.outcome, "ask_question");
  expect("actionPlan", actionPlan, BIRTHDAY_ACTION_PLAN);
  expect(
    "serialized birthday action plan",
    JSON.stringify(actionPlan),
    JSON.stringify(BIRTHDAY_ACTION_PLAN),
  );
}

const ANNIVERSARY_ACTION_PLAN: ActionPlan = {
  type: "ask_question",
  category: "anniversary",
  priority: "medium",
  sourceRuleId: "anniversary",
  primaryReason: "anniversary_preparation_window",
  reasons: ["anniversary_preparation_window"],
  confidence: 60,
  debugNotes: [
    "AnniversaryRule matched",
    "anniversary days away: 7",
    "preparation window: 14",
  ],
};

section("planFromDecisionContext → anniversary action plan");
{
  const { decideResult, actionPlan } = planFromDecisionContext(
    buildDecisionContext(
      normalized(),
      minimalRelationshipContext({
        generatedAt: "2026-07-01T00:00:00.000Z",
        anniversary: "2015-07-08",
        previewDays: 14,
      }),
    ),
  );
  expect("outcome ask_question", decideResult.decision.outcome, "ask_question");
  expect("actionPlan", actionPlan, ANNIVERSARY_ACTION_PLAN);
  expect(
    "serialized anniversary action plan",
    JSON.stringify(actionPlan),
    JSON.stringify(ANNIVERSARY_ACTION_PLAN),
  );
}

const VALENTINES_ACTION_PLAN: ActionPlan = {
  type: "ask_question",
  category: "holiday",
  priority: "medium",
  sourceRuleId: "valentines_day",
  primaryReason: "valentines_preparation_window",
  reasons: ["valentines_preparation_window"],
  confidence: 60,
  debugNotes: [
    "ValentinesDayRule matched",
    "valentines days away: 13",
    "preparation window: 14",
  ],
};

section("planFromDecisionContext → valentines_day action plan");
{
  const { decideResult, actionPlan } = planFromDecisionContext(
    buildDecisionContext(
      normalized(),
      minimalRelationshipContext({
        generatedAt: "2026-02-01T00:00:00.000Z",
        relationshipType: "Wife",
        previewDays: 14,
      }),
    ),
  );
  expect("outcome ask_question", decideResult.decision.outcome, "ask_question");
  expect("actionPlan", actionPlan, VALENTINES_ACTION_PLAN);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
