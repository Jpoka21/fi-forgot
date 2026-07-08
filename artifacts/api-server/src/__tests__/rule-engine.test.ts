/**
 * Unit tests for brain/decision/rules/runRuleEngine.
 *
 * Proves serialized decide() scaffold output is unchanged via the Rule Engine.
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/rule-engine.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { decide } from "../brain/decision/decide.js";
import { runRuleEngine } from "../brain/decision/rules/runRuleEngine.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";

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

const SCAFFOLD = {
  decision: { outcome: "wait" },
  confidence: 0,
  reasons: ["read_only_scaffold", "no_behavior_change"],
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

section("runRuleEngine preserves scaffold for empty DecisionContext");
{
  const context = buildDecisionContext(normalized());
  const result = runRuleEngine(context);
  expect("result", result, SCAFFOLD);
  expect("serialized scaffold", JSON.stringify(result), JSON.stringify(SCAFFOLD));
}

section("runRuleEngine preserves scaffold for rich DecisionContext");
{
  const context = buildDecisionContext(
    normalized({
      identity: "established",
      freshness: "current",
      history: "rich",
      writing: "high",
      engagement: "moderate",
      momentum: "active",
      derivedFrom: { signalCount: 70, sourcesPresent: ["engagement"] },
    }),
  );
  const result = runRuleEngine(context);
  expect("result", result, SCAFFOLD);
  expect("serialized scaffold", JSON.stringify(result), JSON.stringify(SCAFFOLD));
}

section("decide() serialized output matches scaffold");
{
  const empty = buildDecisionContext(normalized());
  const rich = buildDecisionContext(
    normalized({
      identity: "established",
      freshness: "current",
      history: "rich",
      writing: "high",
      engagement: "moderate",
      momentum: "active",
    }),
  );
  expect("decide empty serialized", JSON.stringify(decide(empty)), JSON.stringify(SCAFFOLD));
  expect("decide rich serialized", JSON.stringify(decide(rich)), JSON.stringify(SCAFFOLD));
  expect("decide empty === decide rich", JSON.stringify(decide(empty)), JSON.stringify(decide(rich)));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
