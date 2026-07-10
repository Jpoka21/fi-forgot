/**
 * Step 6f.3I — prepare_card Attention activation and surfacing verification.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/prepare-card-activation.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildGlobalOpportunityPool } from "../brain/attention/buildGlobalOpportunityPool.js";
import { buildOpportunityKey } from "../brain/attention/buildOpportunityKey.js";
import { planAttentionOrder } from "../brain/attention/planAttentionOrder.js";
import { shouldIncludeOpportunity } from "../brain/attention/shouldIncludeOpportunity.js";
import { applyFatigue } from "../brain/fatigue/applyFatigue.js";
import { materializeExposureSnapshot } from "../brain/fatigue/exposure/materializeExposureSnapshot.js";
import type { FatigueContext } from "../brain/fatigue/fatigueTypes.js";
import { buildConciergeRecommendation } from "../brain/product/buildConciergeRecommendation.js";
import { buildDashboardBrainOpportunity } from "../brain/product/buildDashboardBrainOpportunity.js";
import { buildNotificationItem } from "../brain/product/buildNotificationItem.js";
import { buildProductBrainDecision } from "../brain/product/buildProductBrainDecision.js";
import { DASHBOARD_BRAIN_OPPORTUNITIES_MAX } from "../brain/product/dashboardBrainOpportunitiesTypes.js";
import { NOTIFICATIONS_MAX } from "../brain/product/notificationTypes.js";
import { CONCIERGE_RECOMMENDATIONS_MAX } from "../brain/product/conciergeTypes.js";
import type { ProductBrainDecision } from "../brain/product/productBrainDecisionTypes.js";
import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import { minimalRelationshipContext } from "./fixtures/minimalRelationshipContext.js";
import {
  briefingSummaryFor,
  buildCalendarDecisionContext,
} from "./fixtures/calendarEventRuleFixtures.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = join(TEST_DIR, "../../../fi-forgot/src");
const BRIEFING_SOURCE = readFileSync(join(FRONTEND_ROOT, "pages/briefing.tsx"), "utf8");
const PROVENANCE_SOURCE = readFileSync(
  join(FRONTEND_ROOT, "app/brain-cards/brainCardProvenance.ts"),
  "utf8",
);

const ORIGINAL_ENFORCE = process.env["BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED"];

function restoreFatigueEnv(): void {
  if (ORIGINAL_ENFORCE === undefined) {
    delete process.env["BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED"];
  } else {
    process.env["BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED"] = ORIGINAL_ENFORCE;
  }
}

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

function calendarDecisionFromPipeline(options: {
  briefingComplete?: boolean;
  recipientId?: string;
} = {}): ProductBrainDecision {
  const context = buildCalendarDecisionContext({
    briefingSummary: options.briefingComplete
      ? briefingSummaryFor("Birthday", 2026)
      : undefined,
  });
  const { decideResult, actionPlan, ruleEvaluation } = planFromDecisionContext(context);
  return buildProductBrainDecision(options.recipientId ?? "r-42", {
    loadResult: {
      brainContextVersion: 1,
      relationshipId: options.recipientId ?? "r-42",
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
}

function decisionFixture(
  overrides: Partial<ProductBrainDecision> & {
    sourceRuleId: string;
    outcome: ProductBrainDecision["decision"]["outcome"];
    recipientId?: string;
  },
): ProductBrainDecision {
  const { sourceRuleId, outcome, recipientId = "r-1", ...rest } = overrides;
  return {
    version: 1,
    recipientId,
    decision: { outcome },
    sourceRuleId,
    actionPlan: {
      type: outcome,
      category: "birthday",
      priority: "medium",
      primaryReason: "test_reason",
      routing: {
        experience:
          outcome === "prepare_card" ? "card_preparation_briefing" : "event_briefing",
        eventId: "birthday",
        briefingEventLabel: "Birthday",
      },
    },
    selectedFollowUpQuestion: null,
    display: { title: "Birthday preparation", explanation: "Inside window." },
    ...rest,
  };
}

try {
section("1. prepare_card is included by shouldIncludeOpportunity");
{
  const decision = calendarDecisionFromPipeline({ briefingComplete: true });
  expect("outcome", decision.decision.outcome, "prepare_card");
  expectTrue("included", shouldIncludeOpportunity(decision));
}

section("2. prepare_card enters the global opportunity pool");
{
  const decision = decisionFixture({ sourceRuleId: "birthday", outcome: "prepare_card", recipientId: "pc-1" });
  const ranked = planAttentionOrder({
    decisions: [decision],
    recipients: [{ recipientId: "pc-1", recipientName: "Card Person" }],
  });
  expect("ranked length", ranked.length, 1);
  expect("sourceRuleId", ranked[0]?.decision.sourceRuleId, "birthday");
  expect("outcome", ranked[0]?.decision.decision.outcome, "prepare_card");
}

section("3. existing ranking order unchanged for non-prepare_card fixtures");
{
  const decisions: ProductBrainDecision[] = [
    {
      ...decisionFixture({ sourceRuleId: "fresh_update", outcome: "ask_question", recipientId: "b" }),
      actionPlan: {
        type: "ask_question",
        category: "fresh_update",
        priority: "medium",
        primaryReason: "test_reason",
        routing: { experience: "catalog_follow_up_question" },
      },
    },
    {
      ...decisionFixture({ sourceRuleId: "birthday", outcome: "ask_question", recipientId: "a" }),
      actionPlan: {
        type: "ask_question",
        category: "birthday",
        priority: "high",
        primaryReason: "test_reason",
        routing: {
          experience: "event_briefing",
          eventId: "birthday",
          briefingEventLabel: "Birthday",
        },
      },
    },
    {
      ...decisionFixture({ sourceRuleId: "memory_accumulation", outcome: "ask_question", recipientId: "c" }),
      actionPlan: {
        type: "ask_question",
        category: "profile_information",
        priority: "low",
        primaryReason: "test_reason",
        routing: { experience: "catalog_follow_up_question" },
      },
    },
  ];
  const recipients = [
    { recipientId: "b", recipientName: "Bob" },
    { recipientId: "a", recipientName: "Alice" },
    { recipientId: "c", recipientName: "Cara" },
  ];
  const ranked = planAttentionOrder({ decisions, recipients });
  expect("birthday first", ranked[0]?.recipientId, "a");
  expect("fresh_update second", ranked[1]?.recipientId, "b");
  expect("memory third", ranked[2]?.recipientId, "c");
}

section("4. existing per surface limits unchanged");
{
  expect("dashboard cap", DASHBOARD_BRAIN_OPPORTUNITIES_MAX, 10);
  expect("notifications cap", NOTIFICATIONS_MAX, 20);
  expect("concierge cap", CONCIERGE_RECOMMENDATIONS_MAX, 6);
}

section("5-8. product builders receive provenance briefing URLs for prepare_card");
{
  const decision = calendarDecisionFromPipeline({ briefingComplete: true });
  const recipient = { recipientId: "r-42", recipientName: "Alice" };
  const expectedHref = "/briefings/r-42/Birthday?brainSourceRuleId=birthday";

  const dashboard = buildDashboardBrainOpportunity(decision, recipient, 1);
  expect("dashboard profileHref", dashboard.profileHref, expectedHref);

  const notification = buildNotificationItem(decision, recipient, "2026-07-09T12:00:00.000Z");
  expect("notification href", notification.href, expectedHref);

  const concierge = buildConciergeRecommendation(decision, recipient);
  expect("concierge href", concierge.href, expectedHref);
}

section("9. calendar ask_question still uses nonprovenance briefing URL");
{
  const decision = calendarDecisionFromPipeline({ briefingComplete: false });
  expect("outcome ask_question", decision.decision.outcome, "ask_question");
  const href = buildDashboardBrainOpportunity(
    decision,
    { recipientId: "r-42", recipientName: "Alice" },
    1,
  ).profileHref;
  expect("briefing href", href, "/briefings/r-42/Birthday");
  expectTrue("no provenance", !href.includes("brainSourceRuleId"));
  expect(
    "event briefing label",
    buildDashboardBrainOpportunity(decision, { recipientId: "r-42", recipientName: "Alice" }, 1).actionLabel,
    "Add birthday details",
  );
}

section("10. incomplete routing falls back to profile");
{
  const decision: ProductBrainDecision = {
    version: 1,
    recipientId: "r-42",
    decision: { outcome: "prepare_card" },
    sourceRuleId: "birthday",
    actionPlan: {
      type: "prepare_card",
      category: "birthday",
      priority: "medium",
      primaryReason: "test",
      routing: { experience: "card_preparation_briefing", eventId: "birthday" },
    },
    selectedFollowUpQuestion: null,
    display: { title: "T", explanation: "E" },
  };
  const href = buildDashboardBrainOpportunity(
    decision,
    { recipientId: "r-42", recipientName: "Alice" },
    1,
  ).profileHref;
  expect("fallback", href, "/relationship/r-42");
}

section("11. shared opportunity key unchanged between ask_question and prepare_card");
{
  const ask = decisionFixture({ sourceRuleId: "birthday", outcome: "ask_question", recipientId: "r-1" });
  const prepare = decisionFixture({ sourceRuleId: "birthday", outcome: "prepare_card", recipientId: "r-1" });
  expect(
    "same key",
    buildOpportunityKey("r-1", "birthday"),
    buildOpportunityKey("r-1", "birthday"),
  );
  const pool = buildGlobalOpportunityPool({
    decisions: [ask, prepare],
    recipients: [{ recipientId: "r-1", recipientName: "Alice" }],
  });
  expect("pool uses one key format", pool[0]?.opportunityKey, "r-1:birthday");
  expect("prepare pool key", pool[1]?.opportunityKey, "r-1:birthday");
}

section("12. recently_surfaced fatigue suppresses prepare_card after ask_question");
{
  process.env["BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED"] = "true";
  const prepareDecision = decisionFixture({
    sourceRuleId: "birthday",
    outcome: "prepare_card",
    recipientId: "a",
  });
  const ranked = planAttentionOrder({
    decisions: [prepareDecision],
    recipients: [{ recipientId: "a", recipientName: "Alice" }],
  });
  const context: FatigueContext = {
    userId: "user-1",
    evaluatedAt: "2026-07-10T14:00:00.000Z",
    exposureSnapshot: materializeExposureSnapshot(
      [
        {
          opportunityKey: "a:birthday",
          recipientId: "a",
          sourceRuleId: "birthday",
          eventType: "surfaced",
          occurredAt: "2026-07-10T12:00:00.000Z",
        },
      ],
      "2026-07-10T14:00:00.000Z",
    ),
  };
  const fatigued = applyFatigue(ranked, context);
  expect("suppressed", fatigued[0]?.fatigueDecision, "suppressed");
  expect("reason", fatigued[0]?.suppressionReason, "recently_surfaced");
}

section("13. no fatigue exception for prepare_card stage");
{
  const inclusionSource = readFileSync(
    join(TEST_DIR, "../brain/attention/shouldIncludeOpportunity.ts"),
    "utf8",
  );
  const fatigueSource = readFileSync(
    join(TEST_DIR, "../brain/fatigue/rules/recentlySurfacedRule.ts"),
    "utf8",
  );
  expectTrue("no prepare_card exclusion", !inclusionSource.includes('outcome === "prepare_card"'));
  expectTrue("fatigue uses opportunityKey only", fatigueSource.includes("opportunity.opportunityKey"));
  expectTrue("no prepare_card branch in fatigue rule", !fatigueSource.includes("prepare_card"));
}

section("14. completed briefing path continues into card creation");
{
  expectTrue("briefing reads provenance from URL", BRIEFING_SOURCE.includes("readBrainSourceRuleIdFromSearch"));
  expectTrue("consume-once before saveCard", BRIEFING_SOURCE.includes("consumeBrainSourceRuleIdForCreate"));
  expectTrue("passes provenance to saveCard", BRIEFING_SOURCE.includes("saveCard(newCard, brainSourceRuleId"));
  expectTrue("strips query after consume", BRIEFING_SOURCE.includes("stripBrainSourceRuleIdFromSearch"));
  expectTrue("rewrite skips provenance", BRIEFING_SOURCE.includes("if (isRewrite)"));
  expectTrue(
    "redirects only ready/approved cards not drafts",
    BRIEFING_SOURCE.includes('"Ready for approval"') && BRIEFING_SOURCE.includes('"Approved"'),
  );
  expectTrue(
    "does not block on completed briefing alone",
    !BRIEFING_SOURCE.includes("briefingComplete"),
  );
}

section("15-17. provenance transport on first card POST only");
{
  expectTrue("query param name stable", PROVENANCE_SOURCE.includes("brainSourceRuleId"));
  expectTrue("buildPersonalCardCreateRequestBody adds top-level field", PROVENANCE_SOURCE.includes("brainSourceRuleId: options.brainSourceRuleId"));
  expectTrue("no frontend rule allowlist", !PROVENANCE_SOURCE.includes("BRIEFING_EVENT_BY_RULE_ID"));
}

section("18. no frontend event mapping or rule allowlist introduced");
{
  const mapperSource = readFileSync(
    join(FRONTEND_ROOT, "app/dashboard-brain/mapDashboardOpportunityViewModel.ts"),
    "utf8",
  );
  expectTrue("mapper passes href through", mapperSource.includes("profileHref"));
  expectTrue("mapper has no rule allowlist", !mapperSource.includes("birthday"));
}

section("19. noncalendar opportunities unchanged");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext(),
  );
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
    normalized: normalized({ freshness: "stale" }),
    decisionContext: context,
    decideResult,
    actionPlan,
    ruleEvaluation,
    selectedFollowUpQuestion: null,
  });
  expect("fresh_update outcome", decision.decision.outcome, "ask_question");
  expectTrue("still included", shouldIncludeOpportunity(decision));
  expect(
    "profile fallback href",
    buildDashboardBrainOpportunity(decision, { recipientId: "r-1", recipientName: "Bob" }, 1).profileHref,
    "/relationship/r-1",
  );
}

} finally {
  restoreFatigueEnv();
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
