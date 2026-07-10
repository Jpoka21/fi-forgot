/**
 * Phase 3 tests for calendar event rules — birthday, anniversary, valentines_day.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/calendar-event-rules.test.ts
 */

import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import { anniversaryRule } from "../brain/decision/rules/anniversaryRule.js";
import { birthdayRule } from "../brain/decision/rules/birthdayRule.js";
import { valentinesDayRule } from "../brain/decision/rules/valentinesDayRule.js";
import type { EventPreparationFacts } from "../brain/events/eventPreparationTypes.js";
import {
  briefingSummaryFor,
  buildCalendarDecisionContext,
  writingHistoryCard,
} from "./fixtures/calendarEventRuleFixtures.js";
import { minimalRelationshipContext } from "./fixtures/minimalRelationshipContext.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { normalized } from "./fixtures/calendarEventRuleFixtures.js";

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

function expectTrue(label: string, condition: boolean): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

function birthdayFacts(
  overrides: Partial<EventPreparationFacts> = {},
): EventPreparationFacts {
  return {
    eventId: "birthday",
    cycleYear: 2026,
    daysUntilEvent: 7,
    withinPreparationWindow: true,
    briefingComplete: false,
    cardCycleStatus: "none",
    ...overrides,
  };
}

section("1. missing event preparation facts produces no match");
{
  const context = buildCalendarDecisionContext({
    relationship: { birthday: null, previewDays: 14 },
  });
  expect("birthday no match", birthdayRule.evaluate(context), null);
}

section("2. outside preparation window produces no match");
{
  const context = buildCalendarDecisionContext({
    relationship: { birthday: "1988-08-01", previewDays: 14 },
  });
  expect("outside window", birthdayRule.evaluate(context), null);
}

section("3. in window with incomplete briefing produces ask_question");
{
  const context = buildCalendarDecisionContext();
  const candidate = birthdayRule.evaluate(context);
  expect("outcome ask_question", candidate?.decision.outcome, "ask_question");
  expect("reason", candidate?.reasons[0], "event_briefing_incomplete");
}

section("4. in window with complete briefing and no card produces prepare_card");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
  });
  const candidate = birthdayRule.evaluate(context);
  expect("outcome prepare_card", candidate?.decision.outcome, "prepare_card");
  expect("reason", candidate?.reasons[0], "event_ready_for_card_preparation");
}

section("5. ready_for_approval blocks prepare_card");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
    cards: [writingHistoryCard({ status: "Ready for approval" })],
  });
  expect("ready_for_approval blocks", birthdayRule.evaluate(context), null);
}

section("6. approved blocks prepare_card");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
    cards: [writingHistoryCard({ status: "Approved" })],
  });
  expect("approved blocks", birthdayRule.evaluate(context), null);
}

section("7. mailed blocks prepare_card");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
    cards: [writingHistoryCard({ status: "Mailed to me" })],
  });
  expect("mailed blocks", birthdayRule.evaluate(context), null);
}

section("8. terminal blocks prepare_card");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
    cards: [writingHistoryCard({ status: "Delivered" })],
  });
  expect("terminal blocks", birthdayRule.evaluate(context), null);
}

section("9. in_progress blocks prepare_card to avoid duplicate preparation");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
    cards: [writingHistoryCard({ status: "Card being drafted" })],
  });
  expect("in_progress blocks", birthdayRule.evaluate(context), null);
}

section("10. Valentine's Day unavailable for ineligible relationships");
{
  const context = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: "2026-02-01T00:00:00.000Z",
      relationshipType: "Friend",
      previewDays: 14,
    }),
  );
  expect("friend no match", valentinesDayRule.evaluate(context), null);
  expect("no valentines facts", context.eventPreparation.byEventId.valentines_day, undefined);
}

section("11. rule uses targetEventId for preparation lookup");
{
  const context = buildCalendarDecisionContext();
  context.eventPreparation = {
    byEventId: {
      birthday: birthdayFacts({ briefingComplete: false }),
    },
  };
  const candidate = birthdayRule.evaluate(context);
  expect("uses birthday facts", candidate?.decision.outcome, "ask_question");
  expectTrue(
    "debug notes reference targetEventId",
    candidate?.debugNotes.some((note) => note === "targetEventId: birthday") ?? false,
  );
}

section("12. one rule evaluation never produces simultaneous outcomes");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
  });
  const candidate = birthdayRule.evaluate(context);
  expectTrue("single outcome", candidate?.decision.outcome === "prepare_card");
  expect("single reason", candidate?.reasons.length, 1);
}

section("anniversary prepare_card when briefing complete and no card");
{
  const context = buildCalendarDecisionContext({
    relationship: {
      birthday: null,
      anniversary: "2015-07-08",
      previewDays: 14,
    },
    briefingSummary: briefingSummaryFor("Anniversary", 2026),
  });
  expect("anniversary prepare_card", anniversaryRule.evaluate(context)?.decision.outcome, "prepare_card");
}

section("orchestration aligns prepare_card decision with prepare_card action plan");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
  });
  const { decideResult, actionPlan } = planFromDecisionContext(context);
  expect("decideResult prepare_card", decideResult.decision.outcome, "prepare_card");
  expect("actionPlan prepare_card", actionPlan.type, "prepare_card");
  expect("actionPlan category birthday", actionPlan.category, "birthday");
  expect("actionPlan sourceRuleId birthday", actionPlan.sourceRuleId, "birthday");
  expect("not deferred to wait", actionPlan.type !== "wait", true);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
