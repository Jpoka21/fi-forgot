/**
 * Unit tests for Brain attention extract phase (Step 4b).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/brain-attention-extract.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import {
  collectProductBrainDecisions,
} from "../brain/attention/collectProductBrainDecisions.js";
import { shouldIncludeOpportunity } from "../brain/attention/shouldIncludeOpportunity.js";
import type { BrainExecutionResult } from "../brain/orchestrator.js";
import { buildConciergeWorkspace } from "../brain/product/buildConciergeWorkspace.js";
import { buildDashboardBrainOpportunities } from "../brain/product/buildDashboardBrainOpportunities.js";
import { buildDashboardBrainOpportunity } from "../brain/product/buildDashboardBrainOpportunity.js";
import { buildNotificationItem } from "../brain/product/buildNotificationItem.js";
import { buildNotifications } from "../brain/product/buildNotifications.js";
import { buildConciergeRecommendation } from "../brain/product/buildConciergeRecommendation.js";
import { buildConciergeInsight } from "../brain/product/buildConciergeInsight.js";
import { buildProductBrainDecision } from "../brain/product/buildProductBrainDecision.js";
import {
  CONCIERGE_INSIGHTS_MAX,
  CONCIERGE_RECOMMENDATIONS_MAX,
} from "../brain/product/conciergeTypes.js";
import {
  DASHBOARD_BRAIN_OPPORTUNITIES_MAX,
  DASHBOARD_BRAIN_OPPORTUNITIES_VERSION,
} from "../brain/product/dashboardBrainOpportunitiesTypes.js";
import {
  NOTIFICATIONS_MAX,
  NOTIFICATIONS_VERSION,
} from "../brain/product/notificationTypes.js";
import type { ProductBrainDecision } from "../brain/product/productBrainDecisionTypes.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import { selectQuestionForActionPlan } from "../brain/questions/index.js";
import { rankDashboardOpportunities } from "../brain/product/rankDashboardOpportunities.js";
import { rankNotifications } from "../brain/product/rankNotifications.js";
import { rankRelationshipOpportunities } from "../brain/product/rankRelationshipOpportunities.js";
import { shouldIncludeConciergeOpportunity } from "../brain/product/shouldIncludeConciergeOpportunity.js";
import { shouldIncludeDashboardOpportunity } from "../brain/product/shouldIncludeDashboardOpportunity.js";
import { shouldIncludeNotification } from "../brain/product/shouldIncludeNotification.js";
import { BRAIN_CONTEXT_VERSION } from "../brain/types.js";
import type { RelationshipContextLoadResult } from "../brain/types.js";
import {
  minimalRelationshipContext,
  type MinimalRelationshipContextOptions,
} from "./fixtures/minimalRelationshipContext.js";

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

function decisionFixture(
  overrides: Partial<ProductBrainDecision> & {
    sourceRuleId: string;
    outcome: ProductBrainDecision["decision"]["outcome"];
    priority?: ProductBrainDecision["actionPlan"]["priority"];
    title?: string;
    explanation?: string;
  },
): ProductBrainDecision {
  const {
    sourceRuleId,
    outcome,
    priority = "medium",
    title = "Title",
    explanation = "Explanation.",
    recipientId = "recipient-1",
    ...rest
  } = overrides;

  return {
    version: 1,
    recipientId,
    decision: { outcome },
    sourceRuleId,
    actionPlan: {
      type: outcome,
      category: "follow_up",
      priority,
      primaryReason: "test_reason",
    },
    selectedFollowUpQuestion: null,
    display: { title, explanation },
    ...rest,
  };
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

function buildExecution(
  normalizedOverrides: Partial<NormalizedRelationshipState> = {},
  contextOptions: MinimalRelationshipContextOptions = {},
  recipientId = "recipient-1",
): BrainExecutionResult {
  const normalizedState = normalized(normalizedOverrides);
  const relationshipContext = minimalRelationshipContext(contextOptions);
  const decisionContext = buildDecisionContext(
    normalizedState,
    relationshipContext,
    [],
  );
  const { decideResult, actionPlan, ruleEvaluation } = planFromDecisionContext(decisionContext);
  const selectedFollowUpQuestion = selectQuestionForActionPlan({
    decisionContext,
    decideResult,
    actionPlan,
  });

  const loadResult: RelationshipContextLoadResult = {
    brainContextVersion: BRAIN_CONTEXT_VERSION,
    relationshipId: recipientId,
    userId: "user-1",
    loadedAt: "2026-01-01T00:00:00.000Z",
    relationshipContext,
  };

  return {
    loadResult,
    extraction: { availableSignals: [], contributorGroups: [] },
    normalized: normalizedState,
    decisionContext,
    decideResult,
    actionPlan,
    ruleEvaluation,
    selectedFollowUpQuestion,
  };
}

const INCLUSION_FIXTURES: ProductBrainDecision[] = [
  decisionFixture({ sourceRuleId: "fresh_update", outcome: "ask_question" }),
  decisionFixture({ sourceRuleId: "inactivity", outcome: "recommend_action" }),
  decisionFixture({ sourceRuleId: "memory_accumulation", outcome: "show_dashboard_insight" }),
  decisionFixture({ sourceRuleId: "wait", outcome: "wait" }),
  decisionFixture({ sourceRuleId: "wait", outcome: "ask_question" }),
  decisionFixture({ sourceRuleId: "fresh_update", outcome: "do_nothing" }),
  decisionFixture({ sourceRuleId: "birthday", outcome: "prepare_card" }),
];

section("shouldIncludeOpportunity matches legacy product helpers");
{
  for (const [index, fixture] of INCLUSION_FIXTURES.entries()) {
    const shared = shouldIncludeOpportunity(fixture);
    expectTrue(
      `fixture ${index} matches dashboard helper`,
      shouldIncludeDashboardOpportunity(fixture) === shared,
    );
    expectTrue(
      `fixture ${index} matches notification helper`,
      shouldIncludeNotification(fixture) === shared,
    );
    expectTrue(
      `fixture ${index} matches concierge helper`,
      shouldIncludeConciergeOpportunity(fixture) === shared,
    );
  }
}

async function runAsyncTests(): Promise<void> {
  section("collectProductBrainDecisions returns one decision per recipient in order");
  {
    const waitExecution = buildExecution();
    const staleExecution = buildExecution({ freshness: "stale" });
    let callCount = 0;

    const recipients = [
      { recipientId: "alpha", recipientName: "Alpha" },
      { recipientId: "beta", recipientName: "Beta" },
      { recipientId: "gamma", recipientName: "Gamma" },
    ];

    const decisions = await collectProductBrainDecisions({
      userId: "user-1",
      recipients,
      runBrain: async (recipientId) => {
        callCount++;
        if (recipientId === "alpha") {
          return buildExecution(
            {},
            { birthday: "1988-07-08", generatedAt: "2026-07-01T00:00:00.000Z" },
            recipientId,
          );
        }
        if (recipientId === "beta") return staleExecution;
        return waitExecution;
      },
    });

    expect("calls runBrain once per recipient", callCount, 3);
    expect("returns all decisions unfiltered", decisions.length, 3);
    expect("preserves recipient order", decisions.map((item) => item.recipientId), [
      "alpha",
      "beta",
      "gamma",
    ]);
    expect("alpha decision rule", decisions[0]?.sourceRuleId, "birthday");
    expect("beta decision rule", decisions[1]?.sourceRuleId, "fresh_update");
    expect("gamma decision rule", decisions[2]?.sourceRuleId, "wait");

    expectTrue(
      "collector matches direct buildProductBrainDecision",
      JSON.stringify(decisions[1]) ===
        JSON.stringify(buildProductBrainDecision("beta", staleExecution)),
    );
  }

  section("collectProductBrainDecisions empty recipients");
  {
    const decisions = await collectProductBrainDecisions({
      userId: "user-1",
      recipients: [],
      runBrain: async () => buildExecution(),
    });
    expect("empty collection", decisions, []);
  }

  const parityRecipients = [
    { recipientId: "alpha", recipientName: "Alpha" },
    { recipientId: "beta", recipientName: "Beta" },
    { recipientId: "wait-recipient", recipientName: "Wait Person" },
  ];
  const parityGeneratedAt = "2026-07-09T12:00:00.000Z";
  const waitExecution = buildExecution();
  const staleExecution = buildExecution({ freshness: "stale" });

  const parityRunBrain = async (recipientId: string) => {
    if (recipientId === "alpha") {
      return buildExecution(
        {},
        { birthday: "1988-07-08", generatedAt: "2026-07-01T00:00:00.000Z" },
        recipientId,
      );
    }
    if (recipientId === "beta") return staleExecution;
    return waitExecution;
  };

  const parityOptions = {
    userId: "user-1",
    recipients: parityRecipients,
    runBrain: parityRunBrain,
    generatedAt: parityGeneratedAt,
  };

  section("reference pipeline parity — dashboard");
  {
    const actual = await buildDashboardBrainOpportunities(parityOptions);
    const decisions = await collectProductBrainDecisions(parityOptions);
    const rankable = [];

    for (let index = 0; index < parityRecipients.length; index++) {
      const recipient = parityRecipients[index]!;
      const decision = decisions[index]!;
      if (!shouldIncludeOpportunity(decision)) continue;
      rankable.push({
        decision,
        recipientId: recipient.recipientId,
        recipientName: recipient.recipientName,
      });
    }

    const opportunities = rankDashboardOpportunities(rankable)
      .slice(0, DASHBOARD_BRAIN_OPPORTUNITIES_MAX)
      .map((item, index) => buildDashboardBrainOpportunity(item.decision, item, index + 1));

    const expected = {
      version: DASHBOARD_BRAIN_OPPORTUNITIES_VERSION,
      generatedAt: parityGeneratedAt,
      opportunities,
      spotlight: opportunities[0] ?? null,
    };

    expect(
      "dashboard byte-for-byte parity",
      JSON.stringify(actual),
      JSON.stringify(expected),
    );
  }

  section("reference pipeline parity — notifications");
  {
    const actual = await buildNotifications(parityOptions);
    const decisions = await collectProductBrainDecisions(parityOptions);
    const rankable = [];

    for (let index = 0; index < parityRecipients.length; index++) {
      const recipient = parityRecipients[index]!;
      const decision = decisions[index]!;
      if (!shouldIncludeOpportunity(decision)) continue;
      rankable.push({
        decision,
        recipientId: recipient.recipientId,
        recipientName: recipient.recipientName,
      });
    }

    const notifications = rankNotifications(rankable)
      .slice(0, NOTIFICATIONS_MAX)
      .map((item) => buildNotificationItem(item.decision, item, parityGeneratedAt));

    const expected = {
      version: NOTIFICATIONS_VERSION,
      generatedAt: parityGeneratedAt,
      unreadCount: notifications.length,
      notifications,
    };

    expect(
      "notifications byte-for-byte parity",
      JSON.stringify(actual),
      JSON.stringify(expected),
    );
  }

  section("reference pipeline parity — concierge");
  {
    const actual = await buildConciergeWorkspace(parityOptions);
    const decisions = await collectProductBrainDecisions(parityOptions);
    const rankable = [];

    for (let index = 0; index < parityRecipients.length; index++) {
      const recipient = parityRecipients[index]!;
      const decision = decisions[index]!;
      if (!shouldIncludeOpportunity(decision)) continue;
      rankable.push({
        decision,
        recipientId: recipient.recipientId,
        recipientName: recipient.recipientName,
      });
    }

    const ranked = rankRelationshipOpportunities(rankable);
    const recommendations = ranked
      .slice(0, CONCIERGE_RECOMMENDATIONS_MAX)
      .map((item) => buildConciergeRecommendation(item.decision, item));
    const insights = ranked
      .slice(0, CONCIERGE_INSIGHTS_MAX)
      .map((item) => buildConciergeInsight(item.decision, item));

    const expected = {
      version: 1,
      generatedAt: parityGeneratedAt,
      recommendations,
      insights,
    };

    expect(
      "concierge byte-for-byte parity",
      JSON.stringify(actual),
      JSON.stringify(expected),
    );
  }
}

await runAsyncTests();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
