/**
 * Unit tests for Concierge Brain workspace (Step 3b) and shared ranking.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/concierge-brain-workspace.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import type { BrainExecutionResult } from "../brain/orchestrator.js";
import { buildConciergeInsight, buildConciergeInsightId } from "../brain/product/buildConciergeInsight.js";
import {
  buildConciergeRecommendation,
  buildConciergeRecommendationId,
} from "../brain/product/buildConciergeRecommendation.js";
import { buildConciergeWorkspace } from "../brain/product/buildConciergeWorkspace.js";
import { buildProductBrainDecision } from "../brain/product/buildProductBrainDecision.js";
import {
  CONCIERGE_INSIGHTS_MAX,
  CONCIERGE_RECOMMENDATIONS_MAX,
  CONCIERGE_RECOMMENDATION_KIND_RELATIONSHIP,
  CONCIERGE_WORKSPACE_VERSION,
} from "../brain/product/conciergeTypes.js";
import type { ProductBrainDecision } from "../brain/product/productBrainDecisionTypes.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import { selectQuestionForActionPlan } from "../brain/questions/index.js";
import {
  compareRankableDashboardOpportunities,
  rankDashboardOpportunities,
} from "../brain/product/rankDashboardOpportunities.js";
import {
  compareRankableNotifications,
  rankNotifications,
} from "../brain/product/rankNotifications.js";
import {
  compareRankableRelationshipOpportunities,
  rankRelationshipOpportunities,
} from "../brain/product/rankRelationshipOpportunities.js";
import { shouldIncludeConciergeOpportunity } from "../brain/product/shouldIncludeConciergeOpportunity.js";
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
    relationshipId: "recipient-1",
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

const FORBIDDEN_PUBLIC_FIELDS = [
  "confidence",
  "ruleEvaluation",
  "sourceRuleId",
  "outcome",
  "debug",
  "version",
  "actionPlan",
  "selectedFollowUpQuestion",
  "display",
  "decision",
] as const;

const SAMPLE_RANKABLE = [
  {
    decision: decisionFixture({ sourceRuleId: "fresh_update", outcome: "ask_question", recipientId: "b" }),
    recipientId: "b",
    recipientName: "Bob",
  },
  {
    decision: decisionFixture({ sourceRuleId: "birthday", outcome: "ask_question", recipientId: "a" }),
    recipientId: "a",
    recipientName: "Alice",
  },
];

section("shouldIncludeConciergeOpportunity");
{
  expectTrue(
    "includes ask_question",
    shouldIncludeConciergeOpportunity(
      decisionFixture({ sourceRuleId: "fresh_update", outcome: "ask_question" }),
    ),
  );
  expectTrue(
    "includes recommend_action",
    shouldIncludeConciergeOpportunity(
      decisionFixture({ sourceRuleId: "inactivity", outcome: "recommend_action" }),
    ),
  );
  expectTrue(
    "includes show_dashboard_insight",
    shouldIncludeConciergeOpportunity(
      decisionFixture({ sourceRuleId: "memory_accumulation", outcome: "show_dashboard_insight" }),
    ),
  );
  expectTrue(
    "excludes wait outcome",
    !shouldIncludeConciergeOpportunity(
      decisionFixture({ sourceRuleId: "wait", outcome: "wait" }),
    ),
  );
  expectTrue(
    "excludes do_nothing",
    !shouldIncludeConciergeOpportunity(
      decisionFixture({ sourceRuleId: "fresh_update", outcome: "do_nothing" }),
    ),
  );
  expectTrue(
    "includes prepare_card",
    shouldIncludeConciergeOpportunity(
      decisionFixture({ sourceRuleId: "birthday", outcome: "prepare_card" }),
    ),
  );
}

section("buildConciergeRecommendation and buildConciergeInsight");
{
  const decision = decisionFixture({
    sourceRuleId: "birthday",
    outcome: "ask_question",
    priority: "high",
    title: "Birthday preparation",
    explanation: "Their birthday is inside the preparation window.",
    actionPlan: {
      type: "ask_question",
      category: "birthday",
      priority: "high",
      primaryReason: "event_briefing_incomplete",
      routing: {
        experience: "event_briefing",
        eventId: "birthday",
        briefingEventLabel: "Birthday",
      },
    },
  });
  const recipient = { recipientId: "r-42", recipientName: "Alice" };

  const recommendation = buildConciergeRecommendation(decision, recipient);
  expect("recommendation id", recommendation.id, buildConciergeRecommendationId("r-42", "birthday"));
  expect("kind relationship", recommendation.kind, CONCIERGE_RECOMMENDATION_KIND_RELATIONSHIP);
  expect("recommendation href", recommendation.href, "/briefings/r-42/Birthday");
  expect("actionLabel server-provided", recommendation.actionLabel, "Add birthday details");
  expect("priority", recommendation.priority, "high");

  const insight = buildConciergeInsight(decision, recipient);
  expect("insight id", insight.id, buildConciergeInsightId("r-42", "birthday"));
  expect("insight title", insight.title, "Birthday preparation");
  expect("insight href", insight.href, "/briefings/r-42/Birthday");

  for (const field of FORBIDDEN_PUBLIC_FIELDS) {
    expectTrue(`recommendation has no ${field}`, !(field in recommendation));
    expectTrue(`insight has no ${field}`, !(field in insight));
  }
}

section("shared ranking regression — dashboard, notifications, relationship agree");
{
  const dashboardRanked = rankDashboardOpportunities([...SAMPLE_RANKABLE]);
  const notificationRanked = rankNotifications([...SAMPLE_RANKABLE]);
  const relationshipRanked = rankRelationshipOpportunities([...SAMPLE_RANKABLE]);

  expect(
    "dashboard and relationship recipient order",
    dashboardRanked.map((item) => item.recipientId),
    relationshipRanked.map((item) => item.recipientId),
  );
  expect(
    "notifications and relationship recipient order",
    notificationRanked.map((item) => item.recipientId),
    relationshipRanked.map((item) => item.recipientId),
  );
  expect("birthday ranks first", relationshipRanked[0]?.decision.sourceRuleId, "birthday");

  expectTrue(
    "dashboard compare matches shared compare",
    compareRankableDashboardOpportunities(SAMPLE_RANKABLE[1]!, SAMPLE_RANKABLE[0]!) < 0,
  );
  expectTrue(
    "notifications compare matches shared compare",
    compareRankableNotifications(SAMPLE_RANKABLE[1]!, SAMPLE_RANKABLE[0]!) < 0,
  );
  expectTrue(
    "shared compare is deterministic",
    compareRankableRelationshipOpportunities(SAMPLE_RANKABLE[1]!, SAMPLE_RANKABLE[0]!) < 0,
  );
}

async function runAsyncTests(): Promise<void> {
  section("empty recipients");
  {
    const result = await buildConciergeWorkspace({
      userId: "user-1",
      recipients: [],
      runBrain: async () => buildExecution(),
      generatedAt: "2026-07-09T12:00:00.000Z",
    });
    expect("version", result.version, CONCIERGE_WORKSPACE_VERSION);
    expect("generatedAt", result.generatedAt, "2026-07-09T12:00:00.000Z");
    expect("recommendations empty", result.recommendations, []);
    expect("insights empty", result.insights, []);
  }

  section("buildConciergeWorkspace with mocked brain runs");
  {
    const waitExecution = buildExecution();
    const staleExecution = buildExecution({ freshness: "stale" });

    const result = await buildConciergeWorkspace({
      userId: "user-1",
      recipients: [
        { recipientId: "wait-recipient", recipientName: "Wait Person" },
        { recipientId: "stale-recipient", recipientName: "Stale Person" },
      ],
      runBrain: async (recipientId) => {
        if (recipientId === "stale-recipient") return staleExecution;
        return waitExecution;
      },
      generatedAt: "2026-07-09T12:00:00.000Z",
    });

    expect("only non-wait included", result.recommendations.length, 1);
    expect("included recipient", result.recommendations[0]?.recipientId, "stale-recipient");
    expect("insight for included recipient", result.insights[0]?.recipientId, "stale-recipient");
    expect("uses display title", result.recommendations[0]?.title, "Fresh update");
  }

  section("rank stability and recommendation order");
  {
    const staleExecution = buildExecution({ freshness: "stale" });

    const result = await buildConciergeWorkspace({
      userId: "user-1",
      recipients: [
        { recipientId: "alpha", recipientName: "Alpha" },
        { recipientId: "beta", recipientName: "Beta" },
      ],
      runBrain: async (recipientId) => {
        if (recipientId === "alpha") {
          return buildExecution(
            {},
            { birthday: "1988-07-08", generatedAt: "2026-07-01T00:00:00.000Z" },
          );
        }
        return staleExecution;
      },
      generatedAt: "2026-07-09T12:00:00.000Z",
    });

    expect("two recommendations", result.recommendations.length, 2);
    expect(
      "birthday first",
      result.recommendations[0]?.id,
      buildConciergeRecommendationId("alpha", "birthday"),
    );
    expect(
      "insights follow same ranked order",
      result.insights.map((item) => item.recipientId),
      result.recommendations.slice(0, CONCIERGE_INSIGHTS_MAX).map((item) => item.recipientId),
    );
  }

  section("caps workspace recommendations and insights");
  {
    const staleExecution = buildExecution({ freshness: "stale" });
    const recipients = Array.from({ length: CONCIERGE_RECOMMENDATIONS_MAX + 3 }, (_, index) => ({
      recipientId: `recipient-${index}`,
      recipientName: `Person ${index}`,
    }));

    const result = await buildConciergeWorkspace({
      userId: "user-1",
      recipients,
      runBrain: async () => staleExecution,
      generatedAt: "2026-07-09T12:00:00.000Z",
    });

    expect("recommendations capped", result.recommendations.length, CONCIERGE_RECOMMENDATIONS_MAX);
    expect("insights capped", result.insights.length, CONCIERGE_INSIGHTS_MAX);
  }

  section("DTO does not expose Brain internals");
  {
    const staleExecution = buildExecution({ freshness: "stale" });
    const result = await buildConciergeWorkspace({
      userId: "user-1",
      recipients: [{ recipientId: "r-1", recipientName: "Sam" }],
      runBrain: async () => staleExecution,
      generatedAt: "2026-07-09T12:00:00.000Z",
    });

    const recommendation = result.recommendations[0]!;
    for (const field of FORBIDDEN_PUBLIC_FIELDS) {
      expectTrue(`recommendation has no ${field}`, !(field in recommendation));
    }
    expectTrue("response has no notifications field", !("notifications" in result));
    expectTrue("response has no opportunities field", !("opportunities" in result));
  }
}

await runAsyncTests();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
