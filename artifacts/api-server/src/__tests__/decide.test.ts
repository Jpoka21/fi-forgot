/**
 * Unit tests for brain/decision/decide.
 *
 * Proves decide() remains the frozen scaffold for any DecisionContext.
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/decide.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { decide } from "../brain/decision/decide.js";
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

section("empty DecisionContext → frozen scaffold");
{
  const empty = buildDecisionContext(normalized());
  const result = decide(empty);
  expect("outcome wait", result.decision.outcome, "wait");
  expect("confidence 0", result.confidence, 0);
  expect("reasons", result.reasons, SCAFFOLD.reasons);
  expect("debugNotes", result.debugNotes, SCAFFOLD.debugNotes);
  expect("full DecideResult", result, SCAFFOLD);
}

section("rich DecisionContext → identical scaffold");
{
  const rich = buildDecisionContext(
    normalized({
      identity: "established",
      freshness: "current",
      history: "rich",
      writing: "high",
      engagement: "high",
      momentum: "active",
      derivedFrom: {
        signalCount: 70,
        sourcesPresent: ["profile_completeness", "relationship_timeline"],
      },
    }),
  );
  const result = decide(rich);
  expect("outcome wait", result.decision.outcome, "wait");
  expect("confidence 0", result.confidence, 0);
  expect("reasons", result.reasons, SCAFFOLD.reasons);
  expect("debugNotes", result.debugNotes, SCAFFOLD.debugNotes);
  expect("full DecideResult", result, SCAFFOLD);
}

section("empty and rich DecisionContext return identical results");
{
  const emptyResult = decide(buildDecisionContext(normalized()));
  const richResult = decide(
    buildDecisionContext(
      normalized({
        identity: "established",
        freshness: "current",
        history: "rich",
        writing: "high",
        engagement: "moderate",
        momentum: "active",
        derivedFrom: { signalCount: 70, sourcesPresent: ["engagement"] },
      }),
    ),
  );
  expect("empty === rich", emptyResult, richResult);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
