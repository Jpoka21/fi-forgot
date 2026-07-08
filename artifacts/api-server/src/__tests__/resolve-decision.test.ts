/**
 * Unit tests for brain/decision/rules/resolveDecision.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/resolve-decision.test.ts
 */

import { resolveDecision } from "../brain/decision/rules/resolveDecision.js";
import type { RuleCandidate } from "../brain/decision/rules/types.js";

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

const SCAFFOLD = {
  decision: { outcome: "wait" as const },
  confidence: 0,
  reasons: ["read_only_scaffold", "no_behavior_change"],
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

const waitCandidate: RuleCandidate = {
  ruleId: "wait",
  priority: 0,
  ...SCAFFOLD,
};

section("single candidate maps to RuleEngineResult");
{
  const result = resolveDecision([waitCandidate]);
  expect("sourceRuleId", result.sourceRuleId, "wait");
  expect("decideResult", result.decideResult, SCAFFOLD);
  expect(
    "serialized decideResult",
    JSON.stringify(result.decideResult),
    JSON.stringify(SCAFFOLD),
  );
}

section("fresh update candidate beats wait");
{
  const result = resolveDecision([
    waitCandidate,
    {
      ruleId: "fresh_update",
      priority: 40,
      confidence: 52,
      decision: { outcome: "ask_question" as const },
      reasons: ["information_stale", "fresh_update_due"],
      debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
    },
  ]);
  expect("sourceRuleId", result.sourceRuleId, "fresh_update");
  expect("outcome", result.decideResult.decision.outcome, "ask_question");
  expect("confidence", result.decideResult.confidence, 52);
  expect(
    "serialized decideResult",
    JSON.stringify(result.decideResult),
    JSON.stringify({
      decision: { outcome: "ask_question" },
      confidence: 52,
      reasons: ["information_stale", "fresh_update_due"],
      debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
    }),
  );
}

section("birthday candidate beats fresh_update");
{
  const result = resolveDecision([
    waitCandidate,
    {
      ruleId: "fresh_update",
      priority: 40,
      confidence: 52,
      decision: { outcome: "ask_question" as const },
      reasons: ["information_stale", "fresh_update_due"],
      debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
    },
    {
      ruleId: "birthday",
      priority: 50,
      confidence: 60,
      decision: { outcome: "ask_question" as const },
      reasons: ["birthday_preparation_window"],
      debugNotes: ["BirthdayRule matched"],
    },
  ]);
  expect("sourceRuleId", result.sourceRuleId, "birthday");
  expect("outcome", result.decideResult.decision.outcome, "ask_question");
  expect("reasons", result.decideResult.reasons, ["birthday_preparation_window"]);
}

section("highest priority wins");
{
  const result = resolveDecision([
    waitCandidate,
    {
      ruleId: "birthday",
      priority: 100,
      confidence: 98,
      decision: { outcome: "prepare_card" as const },
      reasons: ["birthday"],
      debugNotes: ["birthday"],
    },
  ]);
  expect("sourceRuleId", result.sourceRuleId, "birthday");
  expect("outcome", result.decideResult.decision.outcome, "prepare_card");
  expect("confidence", result.decideResult.confidence, 98);
}

section("equal priority uses confidence");
{
  const result = resolveDecision([
    {
      ruleId: "low",
      priority: 50,
      confidence: 10,
      decision: { outcome: "wait" as const },
      reasons: ["low"],
      debugNotes: ["low"],
    },
    {
      ruleId: "high",
      priority: 50,
      confidence: 90,
      decision: { outcome: "ask_question" as const },
      reasons: ["high"],
      debugNotes: ["high"],
    },
  ]);
  expect("sourceRuleId", result.sourceRuleId, "high");
  expect("outcome", result.decideResult.decision.outcome, "ask_question");
}

section("equal priority and confidence uses ruleId tie-break");
{
  const result = resolveDecision([
    {
      ruleId: "beta",
      priority: 50,
      confidence: 90,
      decision: { outcome: "wait" as const },
      reasons: ["beta"],
      debugNotes: ["beta"],
    },
    {
      ruleId: "alpha",
      priority: 50,
      confidence: 90,
      decision: { outcome: "ask_question" as const },
      reasons: ["alpha"],
      debugNotes: ["alpha"],
    },
  ]);
  expect("sourceRuleId", result.sourceRuleId, "alpha");
  expect("alpha wins lexicographically", result.decideResult.reasons, ["alpha"]);
}

section("empty candidate list throws");
{
  let threw = false;
  try {
    resolveDecision([]);
  } catch (error) {
    threw = true;
    expect(
      "error message",
      error instanceof Error ? error.message : "",
      "Rule Engine resolution failed: no rule candidates were produced",
    );
  }
  expect("throws on empty candidates", threw, true);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
