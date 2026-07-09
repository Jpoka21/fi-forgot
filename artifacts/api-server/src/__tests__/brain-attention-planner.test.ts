/**
 * Unit tests for Brain Attention Planner (Step 4d).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-attention-planner.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildGlobalOpportunityPool } from "../brain/attention/buildGlobalOpportunityPool.js";
import { computeAttentionScore } from "../brain/attention/computeAttentionScore.js";
import { planAttentionOrder } from "../brain/attention/planAttentionOrder.js";
import { rankGlobalOpportunities } from "../brain/attention/rankGlobalOpportunities.js";
import { shouldIncludeOpportunity } from "../brain/attention/shouldIncludeOpportunity.js";
import type { BrainExecutionResult } from "../brain/orchestrator.js";
import { buildConciergeWorkspace } from "../brain/product/buildConciergeWorkspace.js";
import { buildDashboardBrainOpportunities } from "../brain/product/buildDashboardBrainOpportunities.js";
import { buildNotifications } from "../brain/product/buildNotifications.js";
import type { ProductBrainDecision } from "../brain/product/productBrainDecisionTypes.js";
import {
  compareRankableRelationshipOpportunities,
  rankRelationshipOpportunities,
} from "../brain/product/rankRelationshipOpportunities.js";
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

function decisionFixture(
  overrides: Partial<ProductBrainDecision> & {
    sourceRuleId: string;
    outcome: ProductBrainDecision["decision"]["outcome"];
    priority?: ProductBrainDecision["actionPlan"]["priority"];
    recipientId?: string;
  },
): ProductBrainDecision {
  const {
    sourceRuleId,
    outcome,
    priority = "medium",
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
    display: { title: "Title", explanation: "Explanation." },
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

const SAMPLE_DECISIONS = [
  decisionFixture({ sourceRuleId: "fresh_update", outcome: "ask_question", recipientId: "b" }),
  decisionFixture({ sourceRuleId: "birthday", outcome: "ask_question", recipientId: "a", priority: "high" }),
  decisionFixture({
    sourceRuleId: "memory_accumulation",
    outcome: "ask_question",
    recipientId: "c",
    priority: "low",
  }),
];

const SAMPLE_RECIPIENTS = [
  { recipientId: "b", recipientName: "Bob" },
  { recipientId: "a", recipientName: "Alice" },
  { recipientId: "c", recipientName: "Cara" },
];

section("computeAttentionScore is deterministic");
{
  const decision = decisionFixture({
    sourceRuleId: "birthday",
    outcome: "ask_question",
    priority: "high",
    recipientId: "alpha",
  });
  const first = computeAttentionScore(decision);
  const second = computeAttentionScore(decision);
  expect("same score on repeat", first, second);
  expectTrue("score is positive for birthday", first > 0);
}

section("computeAttentionScore ordering matches rankRelationshipOpportunities");
{
  const rankable = SAMPLE_DECISIONS.map((decision, index) => ({
    decision,
    recipientId: SAMPLE_RECIPIENTS[index]!.recipientId,
    recipientName: SAMPLE_RECIPIENTS[index]!.recipientName,
  }));

  const legacyOrder = rankRelationshipOpportunities(rankable).map((item) => item.recipientId);
  const scoreOrder = [...SAMPLE_DECISIONS]
    .sort((left, right) => {
      const scoreDelta = computeAttentionScore(right) - computeAttentionScore(left);
      if (scoreDelta !== 0) return scoreDelta;
      return left.recipientId.localeCompare(right.recipientId);
    })
    .map((item) => item.recipientId);

  expect("score sort matches legacy rank order", scoreOrder, legacyOrder);
}

section("rankGlobalOpportunities matches rankRelationshipOpportunities exactly");
{
  const pool = buildGlobalOpportunityPool({
    decisions: SAMPLE_DECISIONS,
    recipients: SAMPLE_RECIPIENTS,
  });

  const ranked = rankGlobalOpportunities(pool);
  const legacyRanked = rankRelationshipOpportunities(
    SAMPLE_DECISIONS.map((decision, index) => ({
      decision,
      recipientId: SAMPLE_RECIPIENTS[index]!.recipientId,
      recipientName: SAMPLE_RECIPIENTS[index]!.recipientName,
    })),
  );

  expect(
    "recipient order matches legacy ranker",
    ranked.map((item) => item.recipientId),
    legacyRanked.map((item) => item.recipientId),
  );
  expect(
    "sourceRuleId order matches legacy ranker",
    ranked.map((item) => item.decision.sourceRuleId),
    legacyRanked.map((item) => item.decision.sourceRuleId),
  );
}

section("included outcomes match shouldIncludeOpportunity");
{
  const decisions = [
    ...SAMPLE_DECISIONS,
    decisionFixture({ sourceRuleId: "wait", outcome: "wait", recipientId: "wait-1" }),
    decisionFixture({ sourceRuleId: "fresh_update", outcome: "do_nothing", recipientId: "dn-1" }),
    decisionFixture({ sourceRuleId: "birthday", outcome: "prepare_card", recipientId: "pc-1" }),
  ];
  const recipients = [
    ...SAMPLE_RECIPIENTS,
    { recipientId: "wait-1", recipientName: "Wait" },
    { recipientId: "dn-1", recipientName: "Done" },
    { recipientId: "pc-1", recipientName: "Card" },
  ];

  const ranked = planAttentionOrder({ decisions, recipients });

  expectTrue(
    "every ranked item passes shouldIncludeOpportunity",
    ranked.every((item) => shouldIncludeOpportunity(item.decision)),
  );
  expect("excluded wait", ranked.some((item) => item.recipientId === "wait-1"), false);
  expect("excluded do_nothing", ranked.some((item) => item.recipientId === "dn-1"), false);
  expect("excluded prepare_card", ranked.some((item) => item.recipientId === "pc-1"), false);
  expect("only included decisions ranked", ranked.length, 3);
}

section("globalRank assigned 1..n");
{
  const ranked = planAttentionOrder({
    decisions: SAMPLE_DECISIONS,
    recipients: SAMPLE_RECIPIENTS,
  });

  expect("rank sequence", ranked.map((item) => item.globalRank), [1, 2, 3]);
  expectTrue(
    "attention scores descend with rank",
    (ranked[0]?.attentionScore ?? 0) >= (ranked[1]?.attentionScore ?? 0),
  );
}

section("ProductBrainDecision objects are not mutated");
{
  const decisions = SAMPLE_DECISIONS.map((decision) => ({
    ...decision,
    actionPlan: { ...decision.actionPlan },
    decision: { ...decision.decision },
    display: { ...decision.display },
  }));
  const snapshots = decisions.map((decision) => JSON.stringify(decision));

  planAttentionOrder({
    decisions,
    recipients: SAMPLE_RECIPIENTS,
  });

  expectTrue(
    "decisions unchanged after planning",
    decisions.every((decision, index) => JSON.stringify(decision) === snapshots[index]),
  );
}

section("planAttentionOrder accepts prebuilt pool");
{
  const pool = buildGlobalOpportunityPool({
    decisions: SAMPLE_DECISIONS,
    recipients: SAMPLE_RECIPIENTS,
  });
  const fromDecisions = planAttentionOrder({ decisions: SAMPLE_DECISIONS, recipients: SAMPLE_RECIPIENTS });
  const fromPool = planAttentionOrder({ pool });

  expect(
    "pool input matches decisions input",
    fromPool.map((item) => item.recipientId),
    fromDecisions.map((item) => item.recipientId),
  );
}

section("compareGlobalOpportunities parity with compareRankableRelationshipOpportunities");
{
  const left = {
    decision: SAMPLE_DECISIONS[0]!,
    recipientId: "b",
    recipientName: "Bob",
  };
  const right = {
    decision: SAMPLE_DECISIONS[1]!,
    recipientId: "a",
    recipientName: "Alice",
  };

  const leftGlobal = rankGlobalOpportunities(
    buildGlobalOpportunityPool({
      decisions: [left.decision],
      recipients: [{ recipientId: left.recipientId, recipientName: left.recipientName }],
    }),
  )[0]!;
  const rightGlobal = rankGlobalOpportunities(
    buildGlobalOpportunityPool({
      decisions: [right.decision],
      recipients: [{ recipientId: right.recipientId, recipientName: right.recipientName }],
    }),
  )[0]!;

  const legacyCompare = compareRankableRelationshipOpportunities(left, right);
  const rankedPair = rankGlobalOpportunities(
    buildGlobalOpportunityPool({
      decisions: [left.decision, right.decision],
      recipients: [
        { recipientId: left.recipientId, recipientName: left.recipientName },
        { recipientId: right.recipientId, recipientName: right.recipientName },
      ],
    }),
  );

  expectTrue("birthday ranks before fresh_update", legacyCompare > 0);
  expect("planner puts birthday first", rankedPair[0]?.recipientId, "a");
}

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BRAIN_ROOT = join(TEST_DIR, "../brain");

function readBrainSource(relativePath: string): string {
  return readFileSync(join(BRAIN_ROOT, relativePath), "utf8");
}

section("product builders consume planAttentionOrder");
{
  const dashboardSource = readBrainSource("product/buildDashboardBrainOpportunities.ts");
  const notificationsSource = readBrainSource("product/buildNotifications.ts");
  const conciergeSource = readBrainSource("product/buildConciergeWorkspace.ts");

  expectTrue("dashboard uses planAttentionOrder", dashboardSource.includes("planAttentionOrder"));
  expectTrue("notifications uses planAttentionOrder", notificationsSource.includes("planAttentionOrder"));
  expectTrue("concierge uses planAttentionOrder", conciergeSource.includes("planAttentionOrder"));

  expectTrue(
    "dashboard does not call rankRelationshipOpportunities",
    !dashboardSource.includes("rankRelationshipOpportunities"),
  );
  expectTrue(
    "dashboard does not call rankDashboardOpportunities",
    !dashboardSource.includes("rankDashboardOpportunities"),
  );
  expectTrue(
    "notifications does not call rankNotifications",
    !notificationsSource.includes("rankNotifications"),
  );
  expectTrue(
    "notifications does not call rankRelationshipOpportunities",
    !notificationsSource.includes("rankRelationshipOpportunities"),
  );
  expectTrue(
    "concierge does not call rankRelationshipOpportunities",
    !conciergeSource.includes("rankRelationshipOpportunities"),
  );
}

section("planner remains product agnostic");
{
  const plannerSource = [
    readBrainSource("attention/planAttentionOrder.ts"),
    readBrainSource("attention/rankGlobalOpportunities.ts"),
    readBrainSource("attention/computeAttentionScore.ts"),
  ].join("\n");

  for (const token of [
    "Dashboard",
    "Notifications",
    "Concierge",
    "DASHBOARD_",
    "NOTIFICATIONS_",
    "CONCIERGE_",
    "slice(",
  ]) {
    expectTrue(`planner layer has no ${token}`, !plannerSource.includes(token));
  }
}

async function runAsyncTests(): Promise<void> {
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

  section("GlobalOpportunity fields not exposed in public DTOs");
  {
    const [dashboard, notifications, concierge] = await Promise.all([
      buildDashboardBrainOpportunities(parityOptions),
      buildNotifications(parityOptions),
      buildConciergeWorkspace(parityOptions),
    ]);

    for (const response of [dashboard, notifications, concierge]) {
      for (const field of GLOBAL_OPPORTUNITY_FIELDS) {
        expectTrue(`response has no ${field}`, !(field in response));
      }
    }
  }

  section("product outputs unchanged — dashboard");
  {
    const first = await buildDashboardBrainOpportunities(parityOptions);
    const second = await buildDashboardBrainOpportunities(parityOptions);
    expect("dashboard stable", JSON.stringify(first), JSON.stringify(second));
  }

  section("product outputs unchanged — notifications");
  {
    const first = await buildNotifications(parityOptions);
    const second = await buildNotifications(parityOptions);
    expect("notifications stable", JSON.stringify(first), JSON.stringify(second));
  }

  section("product outputs unchanged — concierge");
  {
    const first = await buildConciergeWorkspace(parityOptions);
    const second = await buildConciergeWorkspace(parityOptions);
    expect("concierge stable", JSON.stringify(first), JSON.stringify(second));
  }
}

await runAsyncTests();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
