/**
 * Unit tests for brain/events — catalog, preparation types, rule targeting.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/brain-event-catalog.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { birthdayRule } from "../brain/decision/rules/birthdayRule.js";
import {
  BRAIN_EVENT_CATALOG,
  BRAIN_EVENT_IDS,
  CALENDAR_EVENT_RULE_TARGETS,
  getBrainEventDefinition,
  isBrainEventId,
  listBrainEventDefinitions,
  ruleTargetEventId,
} from "../brain/events/index.js";
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

section("catalog contains the three expected events");
{
  expect("BRAIN_EVENT_IDS length", BRAIN_EVENT_IDS.length, 3);
  expect("BRAIN_EVENT_IDS", [...BRAIN_EVENT_IDS], [
    "birthday",
    "anniversary",
    "valentines_day",
  ]);
  expect("catalog keys", Object.keys(BRAIN_EVENT_CATALOG).sort(), [
    "anniversary",
    "birthday",
    "valentines_day",
  ]);
  expect("listBrainEventDefinitions length", listBrainEventDefinitions().length, 3);
}

section("each event has the correct canonical briefing label");
{
  expect("birthday label", getBrainEventDefinition("birthday").briefingEventLabel, "Birthday");
  expect(
    "anniversary label",
    getBrainEventDefinition("anniversary").briefingEventLabel,
    "Anniversary",
  );
  expect(
    "valentines_day label",
    getBrainEventDefinition("valentines_day").briefingEventLabel,
    "Valentine's Day",
  );
}

section("event timing definitions cover current calendar occasions");
{
  expect("birthday timing", getBrainEventDefinition("birthday").timing, {
    kind: "recipient_date",
    field: "birthday",
  });
  expect("anniversary timing", getBrainEventDefinition("anniversary").timing, {
    kind: "recipient_date",
    field: "anniversary",
  });
  expect("valentines timing", getBrainEventDefinition("valentines_day").timing, {
    kind: "fixed_calendar",
    monthDay: "02-14",
  });
}

section("event identity is conceptually independent of rule identity");
{
  expect("v1 birthday rule target", ruleTargetEventId("birthday"), "birthday");
  expect("v1 anniversary rule target", ruleTargetEventId("anniversary"), "anniversary");
  expect("v1 valentines rule target", ruleTargetEventId("valentines_day"), "valentines_day");

  // Future many-rules-to-one-event example: sourceRuleId "birthday_last_minute" → eventId "birthday".
  expect("future rule not in v1 production registry", ruleTargetEventId("birthday_last_minute"), null);
  expect("catalog eventId is stable", getBrainEventDefinition("birthday").eventId, "birthday");
  expect(
    "sourceRuleId is not inferred from eventId",
    CALENDAR_EVENT_RULE_TARGETS.some((entry) => entry.targetEventId === "birthday" && entry.sourceRuleId === "birthday"),
    true,
  );
}

section("isBrainEventId narrows catalog ids");
{
  expect("birthday isBrainEventId", isBrainEventId("birthday"), true);
  expect("unknown isBrainEventId", isBrainEventId("birthday_last_minute"), false);
}

section("EventPreparationContext is keyed by eventId");
{
  const ctx = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      birthday: "1988-07-08",
      previewDays: 14,
    }),
  );
  expect("eventPreparation.byEventId is object", typeof ctx.eventPreparation.byEventId, "object");
  expect("birthday keyed by eventId", ctx.eventPreparation.byEventId.birthday?.eventId, "birthday");
  expect("anniversary omitted without date", ctx.eventPreparation.byEventId.anniversary, undefined);
}

section("buildDecisionContext always returns valid eventPreparation");
{
  const emptyCtx = buildDecisionContext(normalized(), minimalRelationshipContext());
  expect("minimal eventPreparation shape", typeof emptyCtx.eventPreparation.byEventId, "object");

  const richCtx = buildDecisionContext(
    normalized({ identity: "established", freshness: "current" }),
    minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      birthday: "1988-07-08",
      anniversary: "2015-07-08",
      previewDays: 14,
    }),
  );
  expect("birthday facts populated", richCtx.eventPreparation.byEventId.birthday?.withinPreparationWindow, true);
  expect("birthdayDaysAway unchanged", richCtx.birthdayDaysAway, 7);
  expect("anniversaryDaysAway unchanged", richCtx.anniversaryDaysAway, 7);
}

section("existing event rule outcomes remain unchanged");
{
  const relationshipContext = minimalRelationshipContext({
    generatedAt: "2026-07-01T00:00:00.000Z",
    birthday: "1988-07-08",
    previewDays: 14,
  });
  const decisionContext = buildDecisionContext(normalized(), relationshipContext);
  const candidate = birthdayRule.evaluate(decisionContext);

  expect("birthday rule matches in window", candidate?.ruleId, "birthday");
  expect("birthday rule outcome ask_question", candidate?.decision.outcome, "ask_question");
  expect("eventPreparation consulted via targetEventId", candidate?.debugNotes.some((n) => n === "targetEventId: birthday"), true);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
