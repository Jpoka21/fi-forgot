/**
 * Unit tests for brain/action/buildActionPlan.
 *
 * Isolated planner tests with explicit fixtures — no live pipeline changes.
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/build-action-plan.test.ts
 */

import { buildActionPlan } from "../brain/action/buildActionPlan.js";
import type { ActionPlan } from "../brain/action/actionPlanTypes.js";
import type { DecideResult } from "../brain/decision/decide.js";

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

const WAIT_DECIDE_RESULT: DecideResult = {
  decision: { outcome: "wait" },
  confidence: 0,
  reasons: ["read_only_scaffold", "no_behavior_change"],
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

const FRESH_UPDATE_DECIDE_RESULT: DecideResult = {
  decision: { outcome: "ask_question" },
  confidence: 52,
  reasons: ["information_stale", "fresh_update_due"],
  debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
};

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

section("wait ActionPlan");
{
  const plan = buildActionPlan({
    decideResult: WAIT_DECIDE_RESULT,
    sourceRuleId: "wait",
  });
  expect("full plan", plan, WAIT_ACTION_PLAN);
  expect(
    "serialized wait plan",
    JSON.stringify(plan),
    JSON.stringify(WAIT_ACTION_PLAN),
  );
}

section("fresh_update ActionPlan");
{
  const plan = buildActionPlan({
    decideResult: FRESH_UPDATE_DECIDE_RESULT,
    sourceRuleId: "fresh_update",
  });
  expect("full plan", plan, FRESH_UPDATE_ACTION_PLAN);
  expect(
    "serialized fresh update plan",
    JSON.stringify(plan),
    JSON.stringify(FRESH_UPDATE_ACTION_PLAN),
  );
}

const BIRTHDAY_DECIDE_RESULT: DecideResult = {
  decision: { outcome: "ask_question" },
  confidence: 60,
  reasons: ["birthday_preparation_window"],
  debugNotes: [
    "BirthdayRule matched",
    "birthday days away: 7",
    "preparation window: 14",
  ],
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

section("birthday ActionPlan");
{
  const plan = buildActionPlan({
    decideResult: BIRTHDAY_DECIDE_RESULT,
    sourceRuleId: "birthday",
  });
  expect("full plan", plan, BIRTHDAY_ACTION_PLAN);
  expect(
    "serialized birthday plan",
    JSON.stringify(plan),
    JSON.stringify(BIRTHDAY_ACTION_PLAN),
  );
}

const ANNIVERSARY_DECIDE_RESULT: DecideResult = {
  decision: { outcome: "ask_question" },
  confidence: 60,
  reasons: ["anniversary_preparation_window"],
  debugNotes: [
    "AnniversaryRule matched",
    "anniversary days away: 7",
    "preparation window: 14",
  ],
};

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

section("anniversary ActionPlan");
{
  const plan = buildActionPlan({
    decideResult: ANNIVERSARY_DECIDE_RESULT,
    sourceRuleId: "anniversary",
  });
  expect("full plan", plan, ANNIVERSARY_ACTION_PLAN);
  expect(
    "serialized anniversary plan",
    JSON.stringify(plan),
    JSON.stringify(ANNIVERSARY_ACTION_PLAN),
  );
}

const VALENTINES_DECIDE_RESULT: DecideResult = {
  decision: { outcome: "ask_question" },
  confidence: 60,
  reasons: ["valentines_preparation_window"],
  debugNotes: [
    "ValentinesDayRule matched",
    "valentines days away: 13",
    "preparation window: 14",
  ],
};

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

section("valentines_day ActionPlan");
{
  const plan = buildActionPlan({
    decideResult: VALENTINES_DECIDE_RESULT,
    sourceRuleId: "valentines_day",
  });
  expect("full plan", plan, VALENTINES_ACTION_PLAN);
  expect(
    "serialized valentines plan",
    JSON.stringify(plan),
    JSON.stringify(VALENTINES_ACTION_PLAN),
  );
}

const INACTIVITY_DECIDE_RESULT: DecideResult = {
  decision: { outcome: "ask_question" },
  confidence: 48,
  reasons: ["relationship_inactive"],
  debugNotes: [
    "InactivityRule matched",
    "last relationship activity days ago: 365",
    "threshold days: 180",
  ],
};

const INACTIVITY_ACTION_PLAN: ActionPlan = {
  type: "ask_question",
  category: "follow_up",
  priority: "medium",
  sourceRuleId: "inactivity",
  primaryReason: "relationship_inactive",
  reasons: ["relationship_inactive"],
  confidence: 48,
  debugNotes: [
    "InactivityRule matched",
    "last relationship activity days ago: 365",
    "threshold days: 180",
  ],
};

section("inactivity ActionPlan");
{
  const plan = buildActionPlan({
    decideResult: INACTIVITY_DECIDE_RESULT,
    sourceRuleId: "inactivity",
  });
  expect("full plan", plan, INACTIVITY_ACTION_PLAN);
  expect(
    "serialized inactivity plan",
    JSON.stringify(plan),
    JSON.stringify(INACTIVITY_ACTION_PLAN),
  );
}

section("unknown sourceRuleId throws");
{
  let threw = false;
  try {
    buildActionPlan({
      decideResult: WAIT_DECIDE_RESULT,
      sourceRuleId: "unknown_rule",
    });
  } catch (error) {
    threw = true;
    expect(
      "error message",
      error instanceof Error ? error.message : "",
      'Action Planner: unknown sourceRuleId "unknown_rule"',
    );
  }
  expect("throws on unknown sourceRuleId", threw, true);
}

section("mismatched sourceRuleId and outcome throws");
{
  let threw = false;
  try {
    buildActionPlan({
      decideResult: FRESH_UPDATE_DECIDE_RESULT,
      sourceRuleId: "wait",
    });
  } catch (error) {
    threw = true;
    expect(
      "error message",
      error instanceof Error ? error.message : "",
      'Action Planner: mismatched sourceRuleId "wait" and outcome "ask_question"',
    );
  }
  expect("throws on mismatched pair", threw, true);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
