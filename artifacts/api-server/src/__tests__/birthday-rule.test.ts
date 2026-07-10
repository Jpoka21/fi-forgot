/**
 * Unit tests for brain/decision/rules/birthdayRule.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/birthday-rule.test.ts
 */

import { birthdayRule } from "../brain/decision/rules/birthdayRule.js";
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

section("BirthdayRule matches ask_question when briefing is incomplete");
{
  const context = buildCalendarDecisionContext();
  expect("outcome", birthdayRule.evaluate(context)?.decision.outcome, "ask_question");
  expect("reason", birthdayRule.evaluate(context)?.reasons[0], "event_briefing_incomplete");
}

section("BirthdayRule does not match outside preparation window");
{
  const context = buildCalendarDecisionContext({
    relationship: { birthday: "1988-08-01", previewDays: 14 },
  });
  expect("outside window", birthdayRule.evaluate(context), null);
}

section("BirthdayRule does not match without birthday");
{
  const context = buildCalendarDecisionContext({
    relationship: { birthday: null, previewDays: 14 },
  });
  expect("no birthday", birthdayRule.evaluate(context), null);
}

section("BirthdayRule matches prepare_card when briefing complete and no card");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
  });
  expect("prepare_card", birthdayRule.evaluate(context)?.decision.outcome, "prepare_card");
}

section("BirthdayRule does not match when previewDays missing");
{
  const context = buildCalendarDecisionContext({
    relationship: { previewDays: null },
  });
  expect("missing previewDays", birthdayRule.evaluate(context), null);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
