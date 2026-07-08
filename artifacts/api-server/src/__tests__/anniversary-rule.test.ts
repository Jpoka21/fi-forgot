/**
 * Unit tests for brain/decision/rules/anniversaryRule.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/anniversary-rule.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { anniversaryRule } from "../brain/decision/rules/anniversaryRule.js";
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

function contextForAnniversary(
  anniversary: string | null,
  previewDays: number | null = 14,
  generatedAt = "2026-07-01T00:00:00.000Z",
  normalizedOverrides: Partial<NormalizedRelationshipState> = {},
) {
  return buildDecisionContext(
    normalized(normalizedOverrides),
    minimalRelationshipContext({ generatedAt, anniversary, previewDays }),
  );
}

const IN_WINDOW_CANDIDATE = {
  ruleId: "anniversary",
  priority: 45,
  confidence: 60,
  decision: { outcome: "ask_question" },
  reasons: ["anniversary_preparation_window"],
  debugNotes: [
    "AnniversaryRule matched",
    "anniversary days away: 7",
    "preparation window: 14",
  ],
};

section("AnniversaryRule matches when anniversary is inside preparation window");
{
  const context = contextForAnniversary("2015-07-08");
  expect("in window matches", anniversaryRule.evaluate(context), IN_WINDOW_CANDIDATE);
}

section("AnniversaryRule does not match outside preparation window");
{
  const context = contextForAnniversary("2015-08-01");
  expect("outside window", anniversaryRule.evaluate(context), null);
}

section("AnniversaryRule does not match without anniversary");
{
  const context = contextForAnniversary(null);
  expect("no anniversary", anniversaryRule.evaluate(context), null);
}

section("AnniversaryRule matches on window edge and today");
{
  const today = contextForAnniversary("2015-07-01");
  expect("today matches", anniversaryRule.evaluate(today)?.ruleId, "anniversary");

  const edge = contextForAnniversary("2015-07-15");
  expect("edge matches", anniversaryRule.evaluate(edge)?.ruleId, "anniversary");
}

section("AnniversaryRule ignores stale freshness when in window");
{
  const context = contextForAnniversary("2015-07-08", 14, "2026-07-01T00:00:00.000Z", {
    freshness: "stale",
  });
  expect(
    "stale but in window still matches",
    anniversaryRule.evaluate(context)?.ruleId,
    "anniversary",
  );
}

section("AnniversaryRule does not match when previewDays missing");
{
  const context = contextForAnniversary("2015-07-08", null);
  expect("missing previewDays", anniversaryRule.evaluate(context), null);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
