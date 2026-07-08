/**
 * Unit tests for brain/decision/rules/waitRule.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/wait-rule.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { waitRule } from "../brain/decision/rules/waitRule.js";
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

const SCAFFOLD = {
  ruleId: "wait",
  priority: 0,
  confidence: 0,
  decision: { outcome: "wait" },
  reasons: ["read_only_scaffold", "no_behavior_change"],
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

section("WaitRule always matches");
{
  const empty = buildDecisionContext(normalized(), minimalRelationshipContext());
  const rich = buildDecisionContext(
    normalized({
      identity: "established",
      freshness: "current",
      history: "rich",
      writing: "high",
      engagement: "high",
      momentum: "active",
    }),
    minimalRelationshipContext(),
  );

  const emptyCandidate = waitRule.evaluate(empty);
  const richCandidate = waitRule.evaluate(rich);

  expect("never null for empty context", emptyCandidate !== null, true);
  expect("never null for rich context", richCandidate !== null, true);
  expect("empty context candidate", emptyCandidate, SCAFFOLD);
  expect("rich context candidate", richCandidate, SCAFFOLD);
  expect("empty === rich", emptyCandidate, richCandidate);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
