/**
 * Unit tests for brain/decision/rules/valentinesDayRule.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/valentines-day-rule.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { valentinesDayRule } from "../brain/decision/rules/valentinesDayRule.js";
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

function contextForValentines(
  relationshipType: string,
  previewDays: number | null = 14,
  generatedAt = "2026-02-01T00:00:00.000Z",
  normalizedOverrides: Partial<NormalizedRelationshipState> = {},
) {
  return buildDecisionContext(
    normalized(normalizedOverrides),
    minimalRelationshipContext({ generatedAt, relationshipType, previewDays }),
  );
}

const IN_WINDOW_CANDIDATE = {
  ruleId: "valentines_day",
  priority: 42,
  confidence: 60,
  decision: { outcome: "ask_question" },
  reasons: ["valentines_preparation_window"],
  debugNotes: [
    "ValentinesDayRule matched",
    "valentines days away: 13",
    "preparation window: 14",
  ],
};

section("ValentinesDayRule matches romantic relationship inside preparation window");
{
  const context = contextForValentines("Wife");
  expect("in window matches", valentinesDayRule.evaluate(context), IN_WINDOW_CANDIDATE);
}

section("ValentinesDayRule does not match outside preparation window");
{
  const context = contextForValentines("Wife", 14, "2026-01-01T00:00:00.000Z");
  expect("outside window", valentinesDayRule.evaluate(context), null);
}

section("ValentinesDayRule does not match non romantic relationship");
{
  const context = contextForValentines("Friend");
  expect("non romantic", valentinesDayRule.evaluate(context), null);
}

section("ValentinesDayRule matches on Valentine's Day and window edge");
{
  const today = contextForValentines("Wife", 14, "2026-02-14T00:00:00.000Z");
  expect("today matches", valentinesDayRule.evaluate(today)?.ruleId, "valentines_day");

  const edge = contextForValentines("Wife", 14, "2026-01-31T00:00:00.000Z");
  expect("edge matches", valentinesDayRule.evaluate(edge)?.ruleId, "valentines_day");
}

section("ValentinesDayRule ignores stale freshness when in window");
{
  const context = contextForValentines("Wife", 14, "2026-02-01T00:00:00.000Z", {
    freshness: "stale",
  });
  expect(
    "stale but in window still matches",
    valentinesDayRule.evaluate(context)?.ruleId,
    "valentines_day",
  );
}

section("ValentinesDayRule does not match when previewDays missing");
{
  const context = contextForValentines("Wife", null);
  expect("missing previewDays", valentinesDayRule.evaluate(context), null);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
