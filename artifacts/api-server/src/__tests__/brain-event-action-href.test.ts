/**
 * Phase 5 — authoritative server Brain event action URLs.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/brain-event-action-href.test.ts
 */

import { buildConciergeInsight } from "../brain/product/buildConciergeInsight.js";
import { buildConciergeRecommendation } from "../brain/product/buildConciergeRecommendation.js";
import {
  buildBrainEventActionHref,
  resolveProductBrainActionHref,
} from "../brain/product/buildBrainEventActionHref.js";
import { buildDashboardBrainOpportunity } from "../brain/product/buildDashboardBrainOpportunity.js";
import { buildNotificationItem } from "../brain/product/buildNotificationItem.js";
import { buildProductBrainDecision } from "../brain/product/buildProductBrainDecision.js";
import { resolveDashboardBrainActionLabel } from "../brain/product/dashboardBrainActionLabels.js";
import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import type { ActionCategory } from "../brain/action/actionPlanTypes.js";
import type { ProductBrainDecision } from "../brain/product/productBrainDecisionTypes.js";
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

function calendarDecision(
  overrides: Partial<ProductBrainDecision> & {
    sourceRuleId: string;
    outcome: ProductBrainDecision["decision"]["outcome"];
    routing: NonNullable<ProductBrainDecision["actionPlan"]["routing"]>;
  },
): ProductBrainDecision {
  const { sourceRuleId, outcome, routing, recipientId = "r-42", ...rest } = overrides;
  const category: ActionCategory =
    sourceRuleId === "valentines_day"
      ? "holiday"
      : sourceRuleId === "birthday"
        ? "birthday"
        : sourceRuleId === "anniversary"
          ? "anniversary"
          : "follow_up";
  return {
    version: 1,
    recipientId,
    decision: { outcome },
    sourceRuleId,
    actionPlan: {
      type: outcome,
      category,
      priority: "medium",
      primaryReason: "test_reason",
      routing,
    },
    selectedFollowUpQuestion: null,
    display: { title: "Title", explanation: "Explanation." },
    ...rest,
  };
}

section("1. event_briefing produces encoded briefing URL");
{
  const href = buildBrainEventActionHref({
    recipientId: "r-42",
    sourceRuleId: "birthday",
    routing: {
      experience: "event_briefing",
      eventId: "birthday",
      briefingEventLabel: "Birthday",
    },
  });
  expect("href", href, "/briefings/r-42/Birthday");
}

section("2. event_briefing does not include brainSourceRuleId");
{
  const href = buildBrainEventActionHref({
    recipientId: "r-42",
    sourceRuleId: "birthday",
    routing: {
      experience: "event_briefing",
      eventId: "birthday",
      briefingEventLabel: "Birthday",
    },
  });
  expectTrue("no query param", href != null && !href.includes("brainSourceRuleId"));
}

section("3. card_preparation_briefing produces briefing URL");
{
  const href = buildBrainEventActionHref({
    recipientId: "r-42",
    sourceRuleId: "birthday",
    routing: {
      experience: "card_preparation_briefing",
      eventId: "birthday",
      briefingEventLabel: "Birthday",
    },
  });
  expect("href", href, "/briefings/r-42/Birthday?brainSourceRuleId=birthday");
}

section("4. card_preparation_briefing encodes brainSourceRuleId");
{
  const href = buildBrainEventActionHref({
    recipientId: "r-42",
    sourceRuleId: "valentines_day",
    routing: {
      experience: "card_preparation_briefing",
      eventId: "valentines_day",
      briefingEventLabel: "Valentine's Day",
    },
  });
  expect(
    "encoded label and provenance",
    href,
    "/briefings/r-42/Valentine's%20Day?brainSourceRuleId=valentines_day",
  );
}

section("5. missing briefingEventLabel does not infer from sourceRuleId");
{
  const href = buildBrainEventActionHref({
    recipientId: "r-42",
    sourceRuleId: "birthday",
    routing: {
      experience: "event_briefing",
      eventId: "birthday",
    },
  });
  expect("returns null", href, null);
}

section("6. unsupported routing falls back to relationship profile");
{
  const decision = calendarDecision({
    sourceRuleId: "fresh_update",
    outcome: "ask_question",
    routing: { experience: "catalog_follow_up_question" },
  });
  expect(
    "fallback href",
    resolveProductBrainActionHref(decision, "r-42"),
    "/relationship/r-42",
  );
}

section("7. dashboard calendar ask_question uses briefing URL without provenance");
{
  const decision = calendarDecision({
    sourceRuleId: "birthday",
    outcome: "ask_question",
    routing: {
      experience: "event_briefing",
      eventId: "birthday",
      briefingEventLabel: "Birthday",
    },
  });
  const opportunity = buildDashboardBrainOpportunity(
    decision,
    { recipientId: "r-42", recipientName: "Alice" },
    1,
  );
  expect("profileHref", opportunity.profileHref, "/briefings/r-42/Birthday");
  expectTrue("no provenance", !opportunity.profileHref.includes("brainSourceRuleId"));
  expect("event briefing label", opportunity.actionLabel, "Add birthday details");
}

section("8. dashboard prepare_card builder produces provenance URL");
{
  const decision = calendarDecision({
    sourceRuleId: "birthday",
    outcome: "prepare_card",
    routing: {
      experience: "card_preparation_briefing",
      eventId: "birthday",
      briefingEventLabel: "Birthday",
    },
  });
  const opportunity = buildDashboardBrainOpportunity(
    decision,
    { recipientId: "r-42", recipientName: "Alice" },
    1,
  );
  expect(
    "profileHref with provenance",
    opportunity.profileHref,
    "/briefings/r-42/Birthday?brainSourceRuleId=birthday",
  );
  expect("prepare label unchanged", opportunity.actionLabel, "Prepare for birthday");
}

section("9. notifications follow the same behavior");
{
  const decision = calendarDecision({
    sourceRuleId: "anniversary",
    outcome: "ask_question",
    routing: {
      experience: "event_briefing",
      eventId: "anniversary",
      briefingEventLabel: "Anniversary",
    },
  });
  const item = buildNotificationItem(
    decision,
    { recipientId: "r-42", recipientName: "Alice" },
    "2026-07-09T12:00:00.000Z",
  );
  expect("href", item.href, "/briefings/r-42/Anniversary");
  expectTrue("no routing field on DTO", !("routing" in item));
}

section("10. concierge follows the same behavior");
{
  const decision = calendarDecision({
    sourceRuleId: "birthday",
    outcome: "prepare_card",
    routing: {
      experience: "card_preparation_briefing",
      eventId: "birthday",
      briefingEventLabel: "Birthday",
    },
  });
  const recipient = { recipientId: "r-42", recipientName: "Alice" };
  const recommendation = buildConciergeRecommendation(decision, recipient);
  const insight = buildConciergeInsight(decision, recipient);
  expect(
    "recommendation href",
    recommendation.href,
    "/briefings/r-42/Birthday?brainSourceRuleId=birthday",
  );
  expect(
    "insight href",
    insight.href,
    "/briefings/r-42/Birthday?brainSourceRuleId=birthday",
  );
  expectTrue("no routing field on recommendation", !("routing" in recommendation));
}

section("11. end-to-end calendar ask_question from Brain pipeline");
{
  const context = buildCalendarDecisionContext({
    relationship: {
      birthday: "1988-07-08",
      generatedAt: "2026-07-01T00:00:00.000Z",
      previewDays: 14,
    },
  });
  const { decideResult, actionPlan, ruleEvaluation } = planFromDecisionContext(context);
  const decision = buildProductBrainDecision("r-42", {
    loadResult: {
      brainContextVersion: 1,
      relationshipId: "r-42",
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
  const href = resolveProductBrainActionHref(decision, "r-42");
  expect("pipeline briefing href", href, "/briefings/r-42/Birthday");
  expectTrue("uses routing eventId not sourceRuleId inference", href.includes("/Birthday"));
}

section("12. noncalendar opportunities retain profile destination");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext(),
  );
  const { decideResult, actionPlan, ruleEvaluation } = planFromDecisionContext(context);
  const decision = buildProductBrainDecision("r-42", {
    loadResult: {
      brainContextVersion: 1,
      relationshipId: "r-42",
      userId: "user-1",
      loadedAt: "2026-01-01T00:00:00.000Z",
      relationshipContext: minimalRelationshipContext(),
    },
    extraction: { availableSignals: [], contributorGroups: [] },
    normalized: normalized({ freshness: "stale" }),
    decisionContext: context,
    decideResult,
    actionPlan,
    ruleEvaluation,
    selectedFollowUpQuestion: null,
  });
  expect(
    "fresh_update profile href",
    resolveProductBrainActionHref(decision, "r-42"),
    "/relationship/r-42",
  );
  expect(
    "catalog follow up label unchanged",
    resolveDashboardBrainActionLabel("fresh_update", {
      routingExperience: decision.actionPlan.routing?.experience,
    }),
    "Add a fresh update",
  );
}

section("13. prepare_card is included by Attention Planner after activation");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
  });
  const { decideResult, actionPlan, ruleEvaluation } = planFromDecisionContext(context);
  const decision = buildProductBrainDecision("r-42", {
    loadResult: {
      brainContextVersion: 1,
      relationshipId: "r-42",
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
  expectTrue(
    "builder supports provenance URL when invoked directly",
    resolveProductBrainActionHref(decision, "r-42").includes("brainSourceRuleId=birthday"),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
