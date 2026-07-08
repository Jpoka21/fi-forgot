/**
 * Unit tests for production API isolation of ruleEvaluation.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/brain-response-isolation.test.ts
 */

import { decide } from "../brain/decision/decide.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { toBrainResponse } from "../brain/toBrainResponse.js";
import type { RelationshipContextLoadResult } from "../brain/types.js";
import { BRAIN_CONTEXT_VERSION } from "../brain/types.js";
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

const loadResult = {
  brainContextVersion: BRAIN_CONTEXT_VERSION,
  relationshipId: "recipient-1",
  userId: "user-1",
  loadedAt: "2026-01-01T00:00:00.000Z",
  relationshipContext: {
    contextVersion: 3,
    generatedAt: "2026-01-01T00:00:00.000Z",
    recipientId: "recipient-1",
    userId: "user-1",
  },
} as RelationshipContextLoadResult;

const extraction = {
  availableSignals: [],
  contributorGroups: [],
};

const decideResult = {
  decision: { outcome: "wait" as const },
  confidence: 0,
  reasons: ["read_only_scaffold", "no_behavior_change"],
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

section("public decide() does not expose ruleEvaluation");
{
  const context = buildDecisionContext(
    {
      identity: "empty",
      freshness: "unknown",
      history: "none",
      writing: "none",
      engagement: "none",
      momentum: "new",
      derivedFrom: { signalCount: 0, sourcesPresent: [] },
    },
    minimalRelationshipContext(),
  );
  const result = decide(context);
  expect("no ruleEvaluation on decide", "ruleEvaluation" in result, false);
}

section("toBrainResponse does not expose ruleEvaluation");
{
  const response = toBrainResponse(loadResult, extraction, decideResult);
  expect("no ruleEvaluation key", "ruleEvaluation" in response, false);
  expect("no inspector key", "inspector" in response, false);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
