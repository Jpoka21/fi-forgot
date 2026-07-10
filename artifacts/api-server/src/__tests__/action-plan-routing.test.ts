/**
 * Phase 4 — Action Plan routing and prepare_card planner support.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/action-plan-routing.test.ts
 */

import { shouldIncludeOpportunity } from "../brain/attention/shouldIncludeOpportunity.js";
import { buildActionPlan } from "../brain/action/buildActionPlan.js";
import { enrichActionPlanRouting } from "../brain/action/enrichActionPlanRouting.js";
import { mapDecisionToPlan } from "../brain/action/mapDecisionToPlan.js";
import { resolveProductBrainActionHref } from "../brain/product/buildBrainEventActionHref.js";
import { buildProductBrainDecision } from "../brain/product/buildProductBrainDecision.js";
import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { selectQuestionForActionPlan } from "../brain/questions/index.js";
import { RULE_ID_TO_QUESTION_CATEGORY } from "../brain/questions/ruleIdQuestionCategoryMapping.js";
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

section("1. birthday prepare_card maps to prepare_card / birthday");
{
  const plan = buildActionPlan({
    decideResult: {
      decision: { outcome: "prepare_card" },
      confidence: 60,
      reasons: ["event_ready_for_card_preparation"],
      debugNotes: [],
    },
    sourceRuleId: "birthday",
  });
  expect("type", plan.type, "prepare_card");
  expect("category", plan.category, "birthday");
}

section("2. anniversary prepare_card maps correctly");
{
  const plan = buildActionPlan({
    decideResult: {
      decision: { outcome: "prepare_card" },
      confidence: 60,
      reasons: ["event_ready_for_card_preparation"],
      debugNotes: [],
    },
    sourceRuleId: "anniversary",
  });
  expect("type", plan.type, "prepare_card");
  expect("category", plan.category, "anniversary");
}

section("3. valentines_day prepare_card maps to category holiday");
{
  const plan = buildActionPlan({
    decideResult: {
      decision: { outcome: "prepare_card" },
      confidence: 60,
      reasons: ["event_ready_for_card_preparation"],
      debugNotes: [],
    },
    sourceRuleId: "valentines_day",
  });
  expect("type", plan.type, "prepare_card");
  expect("category", plan.category, "holiday");
}

section("4. no prepare_card decision produces wait action plan");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
  });
  const { decideResult, actionPlan } = planFromDecisionContext(context);
  expect("decision outcome", decideResult.decision.outcome, "prepare_card");
  expect("action plan type", actionPlan.type, "prepare_card");
  expectTrue("not wait", actionPlan.type !== "wait");
}

section("5. Phase 3 deferral guard removed — mapDecisionToPlan supports prepare_card");
{
  const mapping = mapDecisionToPlan("birthday", "prepare_card");
  expect("mapped type", mapping.type, "prepare_card");
  expect("mapped category", mapping.category, "birthday");
}

section("6. calendar ask_question routing uses event_briefing");
{
  const plan = buildActionPlan({
    decideResult: {
      decision: { outcome: "ask_question" },
      confidence: 60,
      reasons: ["event_briefing_incomplete"],
      debugNotes: [],
    },
    sourceRuleId: "birthday",
  });
  expect("experience", plan.routing?.experience, "event_briefing");
}

section("7. calendar prepare_card routing uses card_preparation_briefing");
{
  const plan = buildActionPlan({
    decideResult: {
      decision: { outcome: "prepare_card" },
      confidence: 60,
      reasons: ["event_ready_for_card_preparation"],
      debugNotes: [],
    },
    sourceRuleId: "birthday",
  });
  expect("experience", plan.routing?.experience, "card_preparation_briefing");
}

section("8. routing eventId uses targetEventId not category");
{
  const plan = buildActionPlan({
    decideResult: {
      decision: { outcome: "prepare_card" },
      confidence: 60,
      reasons: ["event_ready_for_card_preparation"],
      debugNotes: [],
    },
    sourceRuleId: "valentines_day",
  });
  expect("eventId is valentines_day", plan.routing?.eventId, "valentines_day");
  expect("category is holiday", plan.category, "holiday");
  expectTrue("eventId differs from category string", plan.routing?.eventId !== plan.category);
}

section("9. briefing labels come from Brain event catalog");
{
  const plan = buildActionPlan({
    decideResult: {
      decision: { outcome: "ask_question" },
      confidence: 60,
      reasons: ["event_briefing_incomplete"],
      debugNotes: [],
    },
    sourceRuleId: "valentines_day",
  });
  expect("catalog label", plan.routing?.briefingEventLabel, "Valentine's Day");
}

section("10. prepare_card selects no follow up catalog question");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
  });
  const { decideResult, actionPlan } = planFromDecisionContext(context);
  const question = selectQuestionForActionPlan({
    decisionContext: context,
    decideResult,
    actionPlan,
  });
  expect("no question", question, null);
}

section("11. catalog follow up question rules unchanged");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext(),
  );
  const { decideResult, actionPlan } = planFromDecisionContext(context);
  const question = selectQuestionForActionPlan({
    decisionContext: context,
    decideResult,
    actionPlan,
  });
  expect("fresh_update routing", actionPlan.routing?.experience, "catalog_follow_up_question");
  expectTrue("question selected", question !== null);
  expect("question category", question?.category, "fresh_update_follow_up");
  expectTrue(
    "calendar rules not in RULE_ID_TO_QUESTION_CATEGORY",
    !("birthday" in RULE_ID_TO_QUESTION_CATEGORY),
  );
}

section("12. ProductBrainDecision.actionPlan carries routing internally");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
  });
  const { decideResult, actionPlan, ruleEvaluation } = planFromDecisionContext(context);
  const selectedFollowUpQuestion = selectQuestionForActionPlan({
    decisionContext: context,
    decideResult,
    actionPlan,
  });
  const decision = buildProductBrainDecision("recipient-1", {
    loadResult: {
      brainContextVersion: 1,
      relationshipId: "recipient-1",
      userId: "user-1",
      loadedAt: "2026-01-01T00:00:00.000Z",
      relationshipContext: minimalRelationshipContext(),
    },
    extraction: { availableSignals: [], contributorGroups: [] },
    normalized: normalized(),
    decisionContext: context,
    decideResult,
    actionPlan,
    ruleEvaluation,
    selectedFollowUpQuestion,
  });
  expect("routing experience", decision.actionPlan.routing?.experience, "card_preparation_briefing");
  expect("routing eventId", decision.actionPlan.routing?.eventId, "birthday");
}

section("13. prepare_card is included by Attention Planner after activation");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
  });
  const { decideResult, actionPlan, ruleEvaluation } = planFromDecisionContext(context);
  const decision = buildProductBrainDecision("recipient-1", {
    loadResult: {
      brainContextVersion: 1,
      relationshipId: "recipient-1",
      userId: "user-1",
      loadedAt: "2026-01-01T00:00:00.000Z",
      relationshipContext: minimalRelationshipContext(),
    },
    extraction: { availableSignals: [], contributorGroups: [] },
    normalized: normalized(),
    decisionContext: context,
    decideResult,
    actionPlan,
    ruleEvaluation,
    selectedFollowUpQuestion: null,
  });
  expectTrue("shouldIncludeOpportunity true for prepare_card", shouldIncludeOpportunity(decision));
  expectTrue(
    "builder still supports provenance URL",
    resolveProductBrainActionHref(decision, "recipient-1").includes("brainSourceRuleId=birthday"),
  );
}

section("enrichActionPlanRouting is pure post-map enrichment");
{
  const base = {
    type: "prepare_card" as const,
    category: "birthday" as const,
    priority: "medium" as const,
    sourceRuleId: "birthday",
    primaryReason: "event_ready_for_card_preparation",
    reasons: ["event_ready_for_card_preparation"],
    confidence: 60,
    debugNotes: [],
  };
  const enriched = enrichActionPlanRouting(base, "prepare_card");
  expect("enriched routing experience", enriched.routing?.experience, "card_preparation_briefing");
  expect("base type unchanged", enriched.type, "prepare_card");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
