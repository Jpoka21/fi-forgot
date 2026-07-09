/**
 * Unit tests for dashboard Brain opportunities (Step 4a).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/dashboard-brain-opportunities.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import type { BrainExecutionResult } from "../brain/orchestrator.js";
import { buildDashboardBrainOpportunities } from "../brain/product/buildDashboardBrainOpportunities.js";
import { buildDashboardBrainOpportunity } from "../brain/product/buildDashboardBrainOpportunity.js";
import { resolveDashboardBrainActionLabel } from "../brain/product/dashboardBrainActionLabels.js";
import { DASHBOARD_BRAIN_OPPORTUNITIES_MAX, DASHBOARD_BRAIN_OPPORTUNITIES_VERSION } from "../brain/product/dashboardBrainOpportunitiesTypes.js";
import { buildProductBrainDecision } from "../brain/product/buildProductBrainDecision.js";
import type { ProductBrainDecision } from "../brain/product/productBrainDecisionTypes.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import { selectQuestionForActionPlan } from "../brain/questions/index.js";
import {
  compareRankableDashboardOpportunities,
  rankDashboardOpportunities,
} from "../brain/product/rankDashboardOpportunities.js";
import { shouldIncludeDashboardOpportunity } from "../brain/product/shouldIncludeDashboardOpportunity.js";
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

section("shouldIncludeDashboardOpportunity");
{
  expectTrue(
    "includes ask_question",
    shouldIncludeDashboardOpportunity(
      decisionFixture({ sourceRuleId: "fresh_update", outcome: "ask_question" }),
    ),
  );
  expectTrue(
    "includes recommend_action",
    shouldIncludeDashboardOpportunity(
      decisionFixture({ sourceRuleId: "inactivity", outcome: "recommend_action" }),
    ),
  );
  expectTrue(
    "includes show_dashboard_insight",
    shouldIncludeDashboardOpportunity(
      decisionFixture({ sourceRuleId: "memory_accumulation", outcome: "show_dashboard_insight" }),
    ),
  );
  expectTrue(
    "excludes wait outcome",
    !shouldIncludeDashboardOpportunity(
      decisionFixture({ sourceRuleId: "wait", outcome: "wait" }),
    ),
  );
  expectTrue(
    "excludes wait sourceRuleId even if outcome ask_question",
    !shouldIncludeDashboardOpportunity(
      decisionFixture({ sourceRuleId: "wait", outcome: "ask_question" }),
    ),
  );
  expectTrue(
    "excludes do_nothing",
    !shouldIncludeDashboardOpportunity(
      decisionFixture({ sourceRuleId: "fresh_update", outcome: "do_nothing" }),
    ),
  );
  expectTrue(
    "excludes prepare_card",
    !shouldIncludeDashboardOpportunity(
      decisionFixture({ sourceRuleId: "birthday", outcome: "prepare_card" }),
    ),
  );
}

section("buildDashboardBrainOpportunity");
{
  const decision = decisionFixture({
    sourceRuleId: "birthday",
    outcome: "ask_question",
    priority: "high",
    title: "Birthday preparation",
    explanation: "Their birthday is inside the preparation window.",
  });
  const opportunity = buildDashboardBrainOpportunity(
    decision,
    { recipientId: "r-42", recipientName: "Alice" },
    1,
  );
  expect("recipientId", opportunity.recipientId, "r-42");
  expect("recipientName", opportunity.recipientName, "Alice");
  expect("title", opportunity.title, "Birthday preparation");
  expect("profileHref", opportunity.profileHref, "/relationship/r-42");
  expect("actionLabel server-provided", opportunity.actionLabel, "Prepare for birthday");
  expect("rank", opportunity.rank, 1);
  expectTrue("no confidence field", !("confidence" in opportunity));
}

section("resolveDashboardBrainActionLabel fallback");
{
  expect("known rule", resolveDashboardBrainActionLabel("fresh_update"), "Add a fresh update");
  expect("unknown rule", resolveDashboardBrainActionLabel("unknown_rule"), "Open profile");
}

section("rank stability and ordering");
{
  const items = rankDashboardOpportunities([
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
    {
      decision: decisionFixture({
        sourceRuleId: "memory_accumulation",
        outcome: "ask_question",
        priority: "low",
        recipientId: "c",
      }),
      recipientId: "c",
      recipientName: "Cara",
    },
  ]);

  expect("birthday ranks first", items[0]?.decision.sourceRuleId, "birthday");
  expect("fresh_update ranks second", items[1]?.decision.sourceRuleId, "fresh_update");

  const again = rankDashboardOpportunities([...items].reverse());
  expect(
    "stable reorder",
    again.map((item) => item.recipientId),
    items.map((item) => item.recipientId),
  );

  expectTrue(
    "compare is deterministic",
    compareRankableDashboardOpportunities(items[0]!, items[1]!) < 0,
  );
}

async function runAsyncTests(): Promise<void> {
  section("empty recipients");
  {
    const result = await buildDashboardBrainOpportunities({
      userId: "user-1",
      recipients: [],
      runBrain: async () => buildExecution(),
      generatedAt: "2026-07-09T12:00:00.000Z",
    });
    expect("version", result.version, DASHBOARD_BRAIN_OPPORTUNITIES_VERSION);
    expect("generatedAt", result.generatedAt, "2026-07-09T12:00:00.000Z");
    expect("opportunities empty", result.opportunities, []);
    expect("spotlight null", result.spotlight, null);
  }

  section("buildDashboardBrainOpportunities with mocked brain runs");
  {
    const waitExecution = buildExecution();
    const staleExecution = buildExecution({ freshness: "stale" });

    const result = await buildDashboardBrainOpportunities({
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

    expect("only non-wait included", result.opportunities.length, 1);
    expect("included recipient", result.opportunities[0]?.recipientId, "stale-recipient");
    expect("uses display title", result.opportunities[0]?.title, "Fresh update");
    expectTrue("spotlight equals top opportunity", result.spotlight === result.opportunities[0]);
    expect("spotlight rank is 1", result.spotlight?.rank, 1);

    const staleDecision = buildProductBrainDecision("stale-recipient", staleExecution);
    expectTrue(
      "stale maps to included opportunity",
      shouldIncludeDashboardOpportunity(staleDecision),
    );
  }

  section("all included opportunities receive sequential ranks");
  {
    const staleExecution = buildExecution({ freshness: "stale" });

    const result = await buildDashboardBrainOpportunities({
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

    expect("two opportunities", result.opportunities.length, 2);
    expect("rank 1", result.opportunities[0]?.rank, 1);
    expect("rank 2", result.opportunities[1]?.rank, 2);
    expect("birthday first", result.opportunities[0]?.sourceRuleId, "birthday");
    expectTrue("spotlight is rank 1", result.spotlight?.rank === 1);
  }

  section("caps ranked opportunities");
  {
    const staleExecution = buildExecution({ freshness: "stale" });
    const recipients = Array.from({ length: DASHBOARD_BRAIN_OPPORTUNITIES_MAX + 3 }, (_, index) => ({
      recipientId: `recipient-${index}`,
      recipientName: `Person ${index}`,
    }));

    const result = await buildDashboardBrainOpportunities({
      userId: "user-1",
      recipients,
      runBrain: async () => staleExecution,
      generatedAt: "2026-07-09T12:00:00.000Z",
    });

    expect("capped length", result.opportunities.length, DASHBOARD_BRAIN_OPPORTUNITIES_MAX);
    expectTrue("spotlight still top ranked", result.spotlight === result.opportunities[0]);
  }
}

await runAsyncTests();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
