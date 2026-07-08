/**
 * Unit tests for brain/decision/decideInternal.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/decide-internal.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { decideInternal } from "../brain/decision/decideInternal.js";
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
  decision: { outcome: "wait" },
  confidence: 0,
  reasons: ["read_only_scaffold", "no_behavior_change"],
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

const FRESH_UPDATE_DECIDE = {
  decision: { outcome: "ask_question" },
  confidence: 52,
  reasons: ["information_stale", "fresh_update_due"],
  debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
};

section("non-stale freshness → wait rule result");
{
  const result = decideInternal(buildDecisionContext(normalized(), minimalRelationshipContext()));
  expect("sourceRuleId", result.sourceRuleId, "wait");
  expect("decideResult", result.decideResult, SCAFFOLD);
}

section("stale freshness → fresh_update rule result");
{
  const result = decideInternal(
    buildDecisionContext(normalized({ freshness: "stale" }), minimalRelationshipContext()),
  );
  expect("sourceRuleId", result.sourceRuleId, "fresh_update");
  expect("decideResult", result.decideResult, FRESH_UPDATE_DECIDE);
}

section("birthday in window → birthday rule result");
{
  const result = decideInternal(
    buildDecisionContext(
      normalized(),
      minimalRelationshipContext({
        generatedAt: "2026-07-01T00:00:00.000Z",
        birthday: "1988-07-08",
        previewDays: 14,
      }),
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "birthday");
  expect("outcome ask_question", result.decideResult.decision.outcome, "ask_question");
  expect("reasons", result.decideResult.reasons, ["birthday_preparation_window"]);
}

section("birthday in window beats stale freshness");
{
  const result = decideInternal(
    buildDecisionContext(
      normalized({ freshness: "stale" }),
      minimalRelationshipContext({
        generatedAt: "2026-07-01T00:00:00.000Z",
        birthday: "1988-07-08",
        previewDays: 14,
      }),
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "birthday");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
