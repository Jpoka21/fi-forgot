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

section("single candidate maps to DecideResult");
{
  const result = resolveDecision([waitCandidate]);
  expect("result", result, SCAFFOLD);
  expect("serialized scaffold", JSON.stringify(result), JSON.stringify(SCAFFOLD));
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
  expect("outcome", result.decision.outcome, "prepare_card");
  expect("confidence", result.confidence, 98);
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
  expect("outcome", result.decision.outcome, "ask_question");
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
  expect("alpha wins lexicographically", result.reasons, ["alpha"]);
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
