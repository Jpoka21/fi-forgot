/**
 * Unit tests for brain/decision/rules/anniversaryRule.
 */

import { anniversaryRule } from "../brain/decision/rules/anniversaryRule.js";
import {
  buildCalendarDecisionContext,
  briefingSummaryFor,
} from "./fixtures/calendarEventRuleFixtures.js";

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

section("AnniversaryRule matches ask_question when briefing is incomplete");
{
  const context = buildCalendarDecisionContext({
    relationship: { birthday: null, anniversary: "2015-07-08", previewDays: 14 },
  });
  expect("outcome", anniversaryRule.evaluate(context)?.decision.outcome, "ask_question");
}

section("AnniversaryRule does not match outside preparation window");
{
  const context = buildCalendarDecisionContext({
    relationship: { birthday: null, anniversary: "2015-08-01", previewDays: 14 },
  });
  expect("outside window", anniversaryRule.evaluate(context), null);
}

section("AnniversaryRule does not match without anniversary");
{
  const context = buildCalendarDecisionContext({
    relationship: { birthday: null, anniversary: null, previewDays: 14 },
  });
  expect("no anniversary", anniversaryRule.evaluate(context), null);
}

section("AnniversaryRule matches prepare_card when briefing complete");
{
  const context = buildCalendarDecisionContext({
    relationship: { birthday: null, anniversary: "2015-07-08", previewDays: 14 },
    briefingSummary: briefingSummaryFor("Anniversary", 2026),
  });
  expect("prepare_card", anniversaryRule.evaluate(context)?.decision.outcome, "prepare_card");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
