/**
 * Unit tests for GlobalOpportunity pool (Step 4c).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-attention-global-pool.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { collectProductBrainDecisions } from "../brain/attention/collectProductBrainDecisions.js";
import {
  buildGlobalOpportunityPool,
  buildOpportunityKey,
} from "../brain/attention/buildGlobalOpportunityPool.js";
import type { GlobalOpportunity } from "../brain/attention/globalOpportunityTypes.js";
import type { BrainExecutionResult } from "../brain/orchestrator.js";
import { buildConciergeWorkspace } from "../brain/product/buildConciergeWorkspace.js";
import { buildDashboardBrainOpportunities } from "../brain/product/buildDashboardBrainOpportunities.js";
import { buildNotifications } from "../brain/product/buildNotifications.js";
import { buildProductBrainDecision } from "../brain/product/buildProductBrainDecision.js";
import type { ProductBrainDecision } from "../brain/product/productBrainDecisionTypes.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import { planFromDecisionContext } from "../brain/planFromDecisionContext.js";
import { selectQuestionForActionPlan } from "../brain/questions/index.js";
import { BRAIN_CONTEXT_VERSION } from "../brain/types.js";
import type { RelationshipContextLoadResult } from "../brain/types.js";
import {
  minimalRelationshipContext,
  type MinimalRelationshipContextOptions,
} from "./fixtures/minimalRelationshipContext.js";

const GLOBAL_OPPORTUNITY_FIELDS = [
  "opportunityKey",
  "attentionScore",
  "globalRank",
  "suppressionReason",
  "metadata",
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

function decisionFixture(
  overrides: Partial<ProductBrainDecision> & {
    sourceRuleId: string;
    outcome: ProductBrainDecision["decision"]["outcome"];
    recipientId?: string;
  },
): ProductBrainDecision {
  const {
    sourceRuleId,
    outcome,
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
      priority: "medium",
      primaryReason: "test_reason",
    },
    selectedFollowUpQuestion: null,
    display: { title: "Title", explanation: "Explanation." },
    ...rest,
  };
}

section("buildOpportunityKey");
{
  expect(
    "stable recipientId:sourceRuleId",
    buildOpportunityKey("alpha", "birthday"),
    "alpha:birthday",
  );
  expect(
    "matches notification id format",
    buildOpportunityKey("r-42", "fresh_update"),
    "r-42:fresh_update",
  );
}

section("buildGlobalOpportunityPool wraps ProductBrainDecision without mutation");
{
  const decision = decisionFixture({
    sourceRuleId: "birthday",
    outcome: "ask_question",
    recipientId: "alpha",
  });
  const decisionSnapshot = JSON.stringify(decision);

  const pool = buildGlobalOpportunityPool({
    decisions: [decision],
    recipients: [{ recipientId: "alpha", recipientName: "Alice" }],
  });

  expect("pool length", pool.length, 1);
  expectTrue("decision reference preserved", pool[0]?.decision === decision);
  expectTrue("decision not mutated", JSON.stringify(decision) === decisionSnapshot);
  expect("recipientId from decision", pool[0]?.recipientId, "alpha");
  expect("recipientName from display", pool[0]?.recipientName, "Alice");
  expect("opportunityKey", pool[0]?.opportunityKey, "alpha:birthday");
}

section("buildGlobalOpportunityPool preserves recipient order");
{
  const decisions = [
    decisionFixture({ sourceRuleId: "birthday", outcome: "ask_question", recipientId: "alpha" }),
    decisionFixture({ sourceRuleId: "fresh_update", outcome: "ask_question", recipientId: "beta" }),
    decisionFixture({ sourceRuleId: "wait", outcome: "wait", recipientId: "gamma" }),
  ];

  const pool = buildGlobalOpportunityPool({
    decisions,
    recipients: [
      { recipientId: "alpha", recipientName: "Alpha" },
      { recipientId: "beta", recipientName: "Beta" },
      { recipientId: "gamma", recipientName: "Gamma" },
    ],
  });

  expect(
    "order preserved",
    pool.map((item) => item.recipientId),
    ["alpha", "beta", "gamma"],
  );
  expect("includes wait decision unfiltered", pool[2]?.decision.sourceRuleId, "wait");
  expect("pool size equals input size", pool.length, 3);
}

section("buildGlobalOpportunityPool null and empty fields");
{
  const pool = buildGlobalOpportunityPool({
    decisions: [
      decisionFixture({ sourceRuleId: "inactivity", outcome: "recommend_action", recipientId: "r-1" }),
    ],
    recipients: [{ recipientId: "r-1", recipientName: "Sam" }],
  });

  const item = pool[0] as GlobalOpportunity;
  expect("attentionScore null", item.attentionScore, null);
  expect("globalRank null", item.globalRank, null);
  expect("suppressionReason null", item.suppressionReason, null);
  expect("metadata empty object", item.metadata, {});
  expectTrue("metadata has no keys", Object.keys(item.metadata).length === 0);
}

section("buildGlobalOpportunityPool empty input");
{
  const pool = buildGlobalOpportunityPool({ decisions: [], recipients: [] });
  expect("empty pool", pool, []);
}

async function runAsyncTests(): Promise<void> {
  section("collector + pool integration preserves order and keys");
  {
    const waitExecution = buildExecution();
    const staleExecution = buildExecution({ freshness: "stale" });
    const recipients = [
      { recipientId: "alpha", recipientName: "Alpha" },
      { recipientId: "beta", recipientName: "Beta" },
    ];

    const decisions = await collectProductBrainDecisions({
      userId: "user-1",
      recipients,
      runBrain: async (recipientId) => {
        if (recipientId === "alpha") {
          return buildExecution(
            {},
            { birthday: "1988-07-08", generatedAt: "2026-07-01T00:00:00.000Z" },
            recipientId,
          );
        }
        return staleExecution;
      },
    });

    const pool = buildGlobalOpportunityPool({ decisions, recipients });

    expect("pool aligns with collector", pool.length, decisions.length);
    expect(
      "opportunity keys stable",
      pool.map((item) => item.opportunityKey),
      decisions.map((item) => buildOpportunityKey(item.recipientId, item.sourceRuleId)),
    );
    expectTrue(
      "each pool item wraps matching decision",
      pool.every((item, index) => item.decision === decisions[index]),
    );
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

  section("product outputs unchanged — dashboard");
  {
    const first = await buildDashboardBrainOpportunities(parityOptions);
    const second = await buildDashboardBrainOpportunities(parityOptions);
    expect(
      "dashboard byte-for-byte stable",
      JSON.stringify(first),
      JSON.stringify(second),
    );

    for (const field of GLOBAL_OPPORTUNITY_FIELDS) {
      expectTrue(`dashboard response has no ${field}`, !(field in first));
    }
    for (const opportunity of first.opportunities) {
      for (const field of GLOBAL_OPPORTUNITY_FIELDS) {
        expectTrue(`dashboard opportunity has no ${field}`, !(field in opportunity));
      }
    }
  }

  section("product outputs unchanged — notifications");
  {
    const first = await buildNotifications(parityOptions);
    const second = await buildNotifications(parityOptions);
    expect(
      "notifications byte-for-byte stable",
      JSON.stringify(first),
      JSON.stringify(second),
    );

    for (const field of GLOBAL_OPPORTUNITY_FIELDS) {
      expectTrue(`notifications response has no ${field}`, !(field in first));
    }
    for (const notification of first.notifications) {
      for (const field of GLOBAL_OPPORTUNITY_FIELDS) {
        expectTrue(`notification item has no ${field}`, !(field in notification));
      }
    }
  }

  section("product outputs unchanged — concierge");
  {
    const first = await buildConciergeWorkspace(parityOptions);
    const second = await buildConciergeWorkspace(parityOptions);
    expect(
      "concierge byte-for-byte stable",
      JSON.stringify(first),
      JSON.stringify(second),
    );

    for (const field of GLOBAL_OPPORTUNITY_FIELDS) {
      expectTrue(`concierge response has no ${field}`, !(field in first));
    }
    for (const recommendation of first.recommendations) {
      for (const field of GLOBAL_OPPORTUNITY_FIELDS) {
        expectTrue(`concierge recommendation has no ${field}`, !(field in recommendation));
      }
    }
    for (const insight of first.insights) {
      for (const field of GLOBAL_OPPORTUNITY_FIELDS) {
        expectTrue(`concierge insight has no ${field}`, !(field in insight));
      }
    }
  }
}

await runAsyncTests();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
