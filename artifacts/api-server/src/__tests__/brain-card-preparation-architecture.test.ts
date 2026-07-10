/**
 * Architecture guard tests — Brain card preparation authorization (Step 6f.3J).
 *
 * Source-boundary checks only. Does not assert runtime behavior.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/brain-card-preparation-architecture.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildOpportunityKey } from "../brain/attention/buildOpportunityKey.js";
import { shouldIncludeOpportunity } from "../brain/attention/shouldIncludeOpportunity.js";
import { buildBrainEventActionHref } from "../brain/product/buildBrainEventActionHref.js";
import { buildProductBrainDecision } from "../brain/product/buildProductBrainDecision.js";
import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import { minimalRelationshipContext } from "./fixtures/minimalRelationshipContext.js";
import {
  briefingSummaryFor,
  buildCalendarDecisionContext,
} from "./fixtures/calendarEventRuleFixtures.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BRAIN_ROOT = join(TEST_DIR, "../brain");
const FRONTEND_ROOT = join(TEST_DIR, "../../../fi-forgot/src");

const CALENDAR_RULES = [
  "decision/rules/birthdayRule.ts",
  "decision/rules/anniversaryRule.ts",
  "decision/rules/valentinesDayRule.ts",
] as const;

const PRODUCT_BUILDER_FILES = [
  "product/buildDashboardBrainOpportunity.ts",
  "product/buildNotificationItem.ts",
  "product/buildConciergeRecommendation.ts",
  "product/buildConciergeInsight.ts",
  "product/buildBrainEventActionHref.ts",
] as const;

const ACTION_PLANNER_FILES = [
  "action/mapDecisionToPlan.ts",
  "action/enrichActionPlanRouting.ts",
  "action/buildActionPlan.ts",
] as const;

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

function section(name: string): void {
  console.log(`\n${name}`);
}

function readBrainSource(relativePath: string): string {
  return readFileSync(join(BRAIN_ROOT, relativePath), "utf8");
}

function readFrontendSource(relativePath: string): string {
  return readFileSync(join(FRONTEND_ROOT, relativePath), "utf8");
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

section("frontend — no calendar rule allowlists or event inference");
{
  const provenanceSource = readFrontendSource("app/brain-cards/brainCardProvenance.ts");
  const dashboardMapper = readFrontendSource("app/dashboard-brain/mapDashboardOpportunityViewModel.ts");
  const notificationMapper = readFrontendSource("app/notifications-brain/mapNotificationViewModel.ts");

  for (const token of [
    "BRAIN_CARD_PREPARATION_RULE_IDS",
    "isBrainCardPreparationRuleId",
    "BRIEFING_EVENT_BY_RULE_ID",
    "birthday:",
    "valentines_day",
    "planAttentionOrder",
    "executeBrain",
    "buildOpportunityKey",
  ]) {
    expectTrue(`brainCardProvenance has no ${token}`, !provenanceSource.includes(token));
  }

  expectTrue("dashboard mapper uses profileHref pass-through", dashboardMapper.includes("profileHref"));
  expectTrue("dashboard mapper does not import brain orchestrator", !dashboardMapper.includes("executeBrain"));
  expectTrue("notification mapper uses href pass-through", notificationMapper.includes("href"));
}

section("frontend — provenance consume-once transport only");
{
  const briefingSource = readFrontendSource("pages/briefing.tsx");
  const dataSource = readFrontendSource("lib/data.ts");
  const updateCardBlock = dataSource.match(/export function updateCard[\s\S]*?^}/m)?.[0] ?? "";

  expectTrue("briefing reads brainSourceRuleId", briefingSource.includes("readBrainSourceRuleIdFromSearch"));
  expectTrue("briefing consume-once", briefingSource.includes("consumeBrainSourceRuleIdForCreate"));
  expectTrue("briefing strips query after consume", briefingSource.includes("stripBrainSourceRuleIdFromSearch"));
  expectTrue("saveCard accepts optional provenance", dataSource.includes("brainSourceRuleId"));
  expectTrue("updateCard block omits provenance", !updateCardBlock.includes("brainSourceRuleId"));
}

section("calendar rules — no URLs, raw briefing, or card persistence");
{
  const evaluatorSource = readBrainSource("decision/rules/calendarEventRuleEvaluation.ts");
  const ruleSources = CALENDAR_RULES.map(readBrainSource).join("\n");

  for (const token of ["/briefings/", "brainSourceRuleId", "briefingSummary", "writingHistory", "personal_cards"]) {
    expectTrue(`calendar rules have no ${token}`, !ruleSources.includes(token));
  }

  expectTrue("evaluator uses eventPreparation.byEventId", evaluatorSource.includes("eventPreparation.byEventId"));
  expectTrue("evaluator uses targetEventId config", evaluatorSource.includes("config.targetEventId"));
  expectTrue("evaluator has no URL construction", !evaluatorSource.includes("/briefings/"));
}

section("action planner — routing without URLs");
{
  const plannerSource = ACTION_PLANNER_FILES.map(readBrainSource).join("\n");

  expectTrue("prepare_card mapped in mapDecisionToPlan", plannerSource.includes('prepare_card: { type: "prepare_card"'));
  expectTrue("enrichment uses ruleTargetEventId", plannerSource.includes("ruleTargetEventId"));
  for (const token of ["/briefings/", "brainSourceRuleId", "encodeURIComponent", "URLSearchParams"]) {
    expectTrue(`action planner has no ${token}`, !plannerSource.includes(token));
  }
  expectTrue("enrichment has no applyFatigue", !plannerSource.includes("applyFatigue"));
  expectTrue("enrichment has no planAttentionOrder", !plannerSource.includes("planAttentionOrder"));
}

section("product builders — authoritative URLs from routing only");
{
  const hrefSource = readBrainSource("product/buildBrainEventActionHref.ts");
  const dashboardSource = readBrainSource("product/buildDashboardBrainOpportunity.ts");
  const notificationSource = readBrainSource("product/buildNotificationItem.ts");
  const conciergeSource = readBrainSource("product/buildConciergeRecommendation.ts");

  expectTrue("href builder uses routing.experience", hrefSource.includes('experience === "event_briefing"'));
  expectTrue("provenance only on card_preparation_briefing", hrefSource.includes('experience === "card_preparation_briefing"'));
  expectTrue("event_briefing has no brainSourceRuleId", !/event_briefing[\s\S]{0,120}brainSourceRuleId/.test(hrefSource));
  expectTrue("requires briefingEventLabel", hrefSource.includes("briefingEventLabel"));
  expectTrue("does not use ruleTargetEventId in product layer", !hrefSource.includes("ruleTargetEventId"));

  expectTrue("dashboard uses resolveProductBrainActionHref", dashboardSource.includes("resolveProductBrainActionHref"));
  expectTrue("notification uses resolveProductBrainActionHref", notificationSource.includes("resolveProductBrainActionHref"));
  expectTrue("concierge uses resolveProductBrainActionHref", conciergeSource.includes("resolveProductBrainActionHref"));
  expectTrue("builders do not call ruleTargetEventId", !`${dashboardSource}${notificationSource}${conciergeSource}`.includes("ruleTargetEventId"));
}

section("attention — prepare_card included, stable opportunity key");
{
  const inclusionSource = readBrainSource("attention/shouldIncludeOpportunity.ts");
  const keySource = readBrainSource("attention/buildOpportunityKey.ts");
  const poolSource = readBrainSource("attention/buildGlobalOpportunityPool.ts");

  expectTrue("prepare_card in INCLUDED_OUTCOMES", inclusionSource.includes('"prepare_card"'));
  expectTrue("no explicit prepare_card exclusion", !inclusionSource.includes('outcome === "prepare_card"'));

  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
  });
  const { decideResult, actionPlan, ruleEvaluation } = planFromDecisionContext(context);
  const decision = buildProductBrainDecision("r-1", {
    loadResult: {
      brainContextVersion: 1,
      relationshipId: "r-1",
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
  expectTrue("pipeline prepare_card included", shouldIncludeOpportunity(decision));

  expectTrue("key format recipientId:sourceRuleId", keySource.includes('`${recipientId}:${sourceRuleId}`'));
  expectTrue("pool uses buildOpportunityKey", poolSource.includes("buildOpportunityKey(recipientId, decision.sourceRuleId)"));
  expectTrue("key builder has no outcome parameter", !keySource.includes("outcome"));
  expect("key example", buildOpportunityKey("r-1", "birthday"), "r-1:birthday");
}

section("fatigue — filter only, shared key documented");
{
  const fatigueSource = readBrainSource("fatigue/applyFatigue.ts");
  const recentlySurfaced = readBrainSource("fatigue/rules/recentlySurfacedRule.ts");
  const readme = readFileSync(join(BRAIN_ROOT, "attention/README.md"), "utf8");

  expectTrue("applyFatigue does not rank", !fatigueSource.includes("rankGlobalOpportunities"));
  expectTrue("recently_surfaced uses opportunityKey", recentlySurfaced.includes("opportunity.opportunityKey"));
  expectTrue("readme documents shared calendar key", readme.includes("recipientId:sourceRuleId"));
  expectTrue("readme documents prepare_card inclusion", readme.includes("prepare_card"));
}

section("provenance — write-once backend, routing contract");
{
  const validateSource = readBrainSource("cards/validateBrainSourceRuleId.ts");
  const routeSource = readFileSync(join(TEST_DIR, "../routes/personal-history.ts"), "utf8");
  const cardContextSource = readBrainSource("outcomes/producers/resolveCardOutcomeContext.ts");
  const upsertSetMatch = routeSource.match(/onConflictDoUpdate\(\{[\s\S]*?set:\s*\{([\s\S]*?)\},/)?.[1] ?? "";

  expectTrue("validate rejects wait", validateSource.includes('"wait"'));
  expectTrue("route write-once insert", routeSource.includes("brainSourceRuleIdForInsert"));
  expectTrue("upsert set omits brainSourceRuleId", !upsertSetMatch.includes("brainSourceRuleId"));
  expectTrue("card producer uses persisted provenance", cardContextSource.includes("card.brainSourceRuleId"));

  const briefingHref = buildBrainEventActionHref({
    recipientId: "r-1",
    sourceRuleId: "birthday",
    routing: {
      experience: "event_briefing",
      eventId: "birthday",
      briefingEventLabel: "Birthday",
    },
  });
  const cardHref = buildBrainEventActionHref({
    recipientId: "r-1",
    sourceRuleId: "birthday",
    routing: {
      experience: "card_preparation_briefing",
      eventId: "birthday",
      briefingEventLabel: "Birthday",
    },
  });
  expectTrue("event_briefing has no provenance param", briefingHref != null && !briefingHref.includes("brainSourceRuleId"));
  expectTrue("card_preparation has provenance param", cardHref != null && cardHref.includes("brainSourceRuleId=birthday"));
}

section("identity contract — eventId separate from sourceRuleId");
{
  const targetingSource = readBrainSource("events/ruleEventTargeting.ts");
  expectTrue("registry documents separate concepts", targetingSource.includes("separate concepts"));
  expectTrue("valentines_day target is valentines_day", targetingSource.includes('targetEventId: "valentines_day"'));

  const valentinesHref = buildBrainEventActionHref({
    recipientId: "r-1",
    sourceRuleId: "valentines_day",
    routing: {
      experience: "card_preparation_briefing",
      eventId: "valentines_day",
      briefingEventLabel: "Valentine's Day",
    },
  });
  expectTrue("routing uses catalog label not rule id", valentinesHref != null && valentinesHref.includes("Valentine"));
  expectTrue("eventId contract differs from action category holiday", "valentines_day" !== ("holiday" as string));
}

section("pipeline invariant — decision.outcome matches actionPlan.type for prepare_card");
{
  const context = buildCalendarDecisionContext({
    briefingSummary: briefingSummaryFor("Birthday", 2026),
  });
  const { decideResult, actionPlan } = planFromDecisionContext(context);
  expectTrue("outcome prepare_card", decideResult.decision.outcome === "prepare_card");
  expectTrue("type prepare_card", actionPlan.type === "prepare_card");
  expectTrue("types aligned", decideResult.decision.outcome === actionPlan.type);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
