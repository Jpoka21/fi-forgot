/**
 * Unit tests for brain/decision/rules/birthdayRule.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/birthday-rule.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { birthdayRule } from "../brain/decision/rules/birthdayRule.js";
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

function contextForBirthday(
  birthday: string | null,
  previewDays: number | null = 14,
  generatedAt = "2026-07-01T00:00:00.000Z",
  normalizedOverrides: Partial<NormalizedRelationshipState> = {},
) {
  return buildDecisionContext(
    normalized(normalizedOverrides),
    minimalRelationshipContext({ generatedAt, birthday, previewDays }),
  );
}

const IN_WINDOW_CANDIDATE = {
  ruleId: "birthday",
  priority: 50,
  confidence: 60,
  decision: { outcome: "ask_question" },
  reasons: ["birthday_preparation_window"],
  debugNotes: [
    "BirthdayRule matched",
    "birthday days away: 7",
    "preparation window: 14",
  ],
};

section("BirthdayRule matches when birthday is inside preparation window");
{
  const context = contextForBirthday("1988-07-08");
  expect("in window matches", birthdayRule.evaluate(context), IN_WINDOW_CANDIDATE);
}

section("BirthdayRule does not match outside preparation window");
{
  const context = contextForBirthday("1988-08-01");
  expect("outside window", birthdayRule.evaluate(context), null);
}

section("BirthdayRule does not match without birthday");
{
  const context = contextForBirthday(null);
  expect("no birthday", birthdayRule.evaluate(context), null);
}

section("BirthdayRule matches on window edge and today");
{
  const today = contextForBirthday("1988-07-01");
  expect("today matches", birthdayRule.evaluate(today)?.ruleId, "birthday");

  const edge = contextForBirthday("1988-07-15");
  expect("edge matches", birthdayRule.evaluate(edge)?.ruleId, "birthday");
}

section("BirthdayRule ignores stale freshness when in window");
{
  const context = contextForBirthday("1988-07-08", 14, "2026-07-01T00:00:00.000Z", {
    freshness: "stale",
  });
  expect("stale but in window still matches", birthdayRule.evaluate(context)?.ruleId, "birthday");
}

section("BirthdayRule does not match when previewDays missing");
{
  const context = contextForBirthday("1988-07-08", null);
  expect("missing previewDays", birthdayRule.evaluate(context), null);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
