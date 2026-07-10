/**
 * Unit tests for orchestrator action plan wiring.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/orchestrator-action-plan.test.ts
 */

import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import type { ActionPlan } from "../brain/action/actionPlanTypes.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import { minimalRelationshipContext } from "./fixtures/minimalRelationshipContext.js";
import {
  briefingSummaryFor,
  buildCalendarDecisionContext,
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

const WAIT_ACTION_PLAN: ActionPlan = {
  type: "wait",
  category: "none",
  priority: "low",
  sourceRuleId: "wait",
  primaryReason: "read_only_scaffold",
  reasons: ["read_only_scaffold", "no_behavior_change"],
  confidence: 0,
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

const FRESH_UPDATE_ACTION_PLAN: ActionPlan = {
  type: "ask_question",
  category: "fresh_update",
  priority: "medium",
  sourceRuleId: "fresh_update",
  primaryReason: "information_stale",
  reasons: ["information_stale", "fresh_update_due"],
  confidence: 52,
  debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
  routing: { experience: "catalog_follow_up_question" },
};

const BIRTHDAY_ACTION_PLAN: ActionPlan = {
  type: "ask_question",
  category: "birthday",
  priority: "medium",
  sourceRuleId: "birthday",
  primaryReason: "event_briefing_incomplete",
  reasons: ["event_briefing_incomplete"],
  confidence: 60,
  debugNotes: [
    "BirthdayRule matched",
    "targetEventId: birthday",
    "outcome: ask_question",
    "cycleYear: 2026",
    "briefingComplete: false",
    "cardCycleStatus: none",
  ],
  routing: {
    experience: "event_briefing",
    eventId: "birthday",
    briefingEventLabel: "Birthday",
  },
};

section("planFromDecisionContext → wait action plan");
{
  const { decideResult, actionPlan } = planFromDecisionContext(
    buildDecisionContext(normalized(), minimalRelationshipContext()),
  );
  expect("outcome wait", decideResult.decision.outcome, "wait");
  expect("actionPlan", actionPlan, WAIT_ACTION_PLAN);
  expect(
    "serialized wait action plan",
    JSON.stringify(actionPlan),
    JSON.stringify(WAIT_ACTION_PLAN),
  );
}

section("planFromDecisionContext → fresh_update action plan");
{
  const { decideResult, actionPlan } = planFromDecisionContext(
    buildDecisionContext(
      normalized({ freshness: "stale" }),
      minimalRelationshipContext(),
    ),
  );
  expect("outcome ask_question", decideResult.decision.outcome, "ask_question");
  expect("actionPlan", actionPlan, FRESH_UPDATE_ACTION_PLAN);
  expect(
    "serialized fresh update action plan",
    JSON.stringify(actionPlan),
    JSON.stringify(FRESH_UPDATE_ACTION_PLAN),
  );
}

section("planFromDecisionContext → birthday action plan");
{
  const { decideResult, actionPlan } = planFromDecisionContext(
    buildDecisionContext(
      normalized(),
      minimalRelationshipContext({
        generatedAt: "2026-07-01T00:00:00.000Z",
        birthday: "1988-07-08",
        previewDays: 14,
      }),
    ),
  );
  expect("outcome ask_question", decideResult.decision.outcome, "ask_question");
  expect("actionPlan", actionPlan, BIRTHDAY_ACTION_PLAN);
  expect(
    "serialized birthday action plan",
    JSON.stringify(actionPlan),
    JSON.stringify(BIRTHDAY_ACTION_PLAN),
  );
}

const ANNIVERSARY_ACTION_PLAN: ActionPlan = {
  type: "ask_question",
  category: "anniversary",
  priority: "medium",
  sourceRuleId: "anniversary",
  primaryReason: "event_briefing_incomplete",
  reasons: ["event_briefing_incomplete"],
  confidence: 60,
  debugNotes: [
    "AnniversaryRule matched",
    "targetEventId: anniversary",
    "outcome: ask_question",
    "cycleYear: 2026",
    "briefingComplete: false",
    "cardCycleStatus: none",
  ],
  routing: {
    experience: "event_briefing",
    eventId: "anniversary",
    briefingEventLabel: "Anniversary",
  },
};

section("planFromDecisionContext → anniversary action plan");
{
  const { decideResult, actionPlan } = planFromDecisionContext(
    buildDecisionContext(
      normalized(),
      minimalRelationshipContext({
        generatedAt: "2026-07-01T00:00:00.000Z",
        anniversary: "2015-07-08",
        previewDays: 14,
      }),
    ),
  );
  expect("outcome ask_question", decideResult.decision.outcome, "ask_question");
  expect("actionPlan", actionPlan, ANNIVERSARY_ACTION_PLAN);
  expect(
    "serialized anniversary action plan",
    JSON.stringify(actionPlan),
    JSON.stringify(ANNIVERSARY_ACTION_PLAN),
  );
}

const VALENTINES_ACTION_PLAN: ActionPlan = {
  type: "ask_question",
  category: "holiday",
  priority: "medium",
  sourceRuleId: "valentines_day",
  primaryReason: "event_briefing_incomplete",
  reasons: ["event_briefing_incomplete"],
  confidence: 60,
  debugNotes: [
    "ValentinesDayRule matched",
    "targetEventId: valentines_day",
    "outcome: ask_question",
    "cycleYear: 2026",
    "briefingComplete: false",
    "cardCycleStatus: none",
  ],
  routing: {
    experience: "event_briefing",
    eventId: "valentines_day",
    briefingEventLabel: "Valentine's Day",
  },
};

section("planFromDecisionContext → valentines_day action plan");
{
  const { decideResult, actionPlan } = planFromDecisionContext(
    buildDecisionContext(
      normalized(),
      minimalRelationshipContext({
        generatedAt: "2026-02-01T00:00:00.000Z",
        relationshipType: "Wife",
        previewDays: 14,
      }),
    ),
  );
  expect("outcome ask_question", decideResult.decision.outcome, "ask_question");
  expect("actionPlan", actionPlan, VALENTINES_ACTION_PLAN);
}

const READY_LIFE_EVENT = {
  type: "family_update",
  category: "family" as const,
  daysAgo: 30,
  followUpWindowDays: 30,
  followUpReady: true,
  source: "fresh_update" as const,
  capturedAt: "2026-06-01T00:00:00.000Z",
  classified: true,
  supported: true,
};

const LIFE_EVENT_FOLLOW_UP_ACTION_PLAN: ActionPlan = {
  type: "ask_question",
  category: "follow_up",
  priority: "medium",
  sourceRuleId: "life_event_follow_up",
  primaryReason: "life_event_follow_up_ready",
  reasons: ["life_event_follow_up_ready"],
  confidence: 46,
  debugNotes: [
    "LifeEventFollowUpRule matched",
    "type: family_update",
    "category: family",
    "days ago: 30",
    "follow up window days: 30",
    "followUpReady: true",
    "source: fresh_update",
  ],
  routing: { experience: "catalog_follow_up_question" },
};

section("planFromDecisionContext → life_event_follow_up action plan");
{
  const { decideResult, actionPlan } = planFromDecisionContext(
    buildDecisionContext(
      normalized({ freshness: "current" }),
      minimalRelationshipContext(),
      [READY_LIFE_EVENT],
    ),
  );
  expect("outcome ask_question", decideResult.decision.outcome, "ask_question");
  expect("sourceRuleId", actionPlan.sourceRuleId, "life_event_follow_up");
  expect("actionPlan", actionPlan, LIFE_EVENT_FOLLOW_UP_ACTION_PLAN);
  expect(
    "serialized life event follow up action plan",
    JSON.stringify(actionPlan),
    JSON.stringify(LIFE_EVENT_FOLLOW_UP_ACTION_PLAN),
  );
}

section("planFromDecisionContext → birthday prepare_card action plan");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
  });
  const { decideResult, actionPlan } = planFromDecisionContext(context);
  expect("outcome prepare_card", decideResult.decision.outcome, "prepare_card");
  expect("actionPlan type prepare_card", actionPlan.type, "prepare_card");
  expect("actionPlan category birthday", actionPlan.category, "birthday");
  expect("actionPlan sourceRuleId birthday", actionPlan.sourceRuleId, "birthday");
  expect("routing experience", actionPlan.routing?.experience, "card_preparation_briefing");
  expect("routing eventId", actionPlan.routing?.eventId, "birthday");
  expect("not deferred to wait", actionPlan.type !== "wait", true);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
