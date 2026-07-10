/**
 * Unit tests for brain/decision/rules/valentinesDayRule.
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { valentinesDayRule } from "../brain/decision/rules/valentinesDayRule.js";
import { normalized } from "./fixtures/calendarEventRuleFixtures.js";
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

function contextForValentines(
  relationshipType: string,
  previewDays: number | null = 14,
  generatedAt = "2026-02-01T00:00:00.000Z",
) {
  return buildDecisionContext(
    normalized(),
    minimalRelationshipContext({ generatedAt, relationshipType, previewDays }),
  );
}

section("ValentinesDayRule matches romantic relationship inside preparation window");
{
  const context = contextForValentines("Wife");
  expect("in window ask_question", valentinesDayRule.evaluate(context)?.decision.outcome, "ask_question");
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
