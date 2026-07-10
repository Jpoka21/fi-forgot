/**
 * Product + Fatigue integration tests (Step 5e).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-fatigue-product-integration.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { planAttentionOrder } from "../brain/attention/planAttentionOrder.js";
import { applyFatigue } from "../brain/fatigue/applyFatigue.js";
import { createEmptyExposureSnapshot } from "../brain/fatigue/exposure/loadExposureSnapshot.js";
import {
  dedupeSurfacedFatigueOpportunities,
} from "../brain/fatigue/exposure/recordSurfacedOpportunities.js";
import { getVisibleFatigueOpportunities } from "../brain/fatigue/getVisibleFatigueOpportunities.js";
import type { FatigueContext, FatigueOpportunity } from "../brain/fatigue/fatigueTypes.js";
import type { ProductBrainDecision } from "../brain/product/productBrainDecisionTypes.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BRAIN_ROOT = join(TEST_DIR, "../brain");

const PRODUCT_BUILDERS = [
  "product/buildDashboardBrainOpportunities.ts",
  "product/buildNotifications.ts",
  "product/buildConciergeWorkspace.ts",
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

function section(name: string): void {
  console.log(`\n${name}`);
}

function readBrainSource(relativePath: string): string {
  return readFileSync(join(BRAIN_ROOT, relativePath), "utf8");
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

function fatigueItem(
  recipientId: string,
  sourceRuleId: string,
): FatigueOpportunity {
  return {
    opportunity: {
      opportunityKey: `${recipientId}:${sourceRuleId}`,
      recipientId,
      recipientName: recipientId,
      decision: decisionFixture({ sourceRuleId, outcome: "ask_question", recipientId }),
      attentionScore: 1,
      globalRank: 1,
      suppressionReason: null,
      metadata: {},
    },
    fatigueDecision: "visible",
    suppressionReason: null,
    deferUntil: null,
  };
}

section("product builders consume orchestrateProductBrainFatigue");
{
  for (const builderPath of PRODUCT_BUILDERS) {
    const source = readBrainSource(builderPath);
    expectTrue(`${builderPath} imports orchestrateProductBrainFatigue`, source.includes("orchestrateProductBrainFatigue"));
    expectTrue(`${builderPath} calls orchestrateProductBrainFatigue`, /orchestrateProductBrainFatigue\s*\(/.test(source));
    expectTrue(`${builderPath} does not call planAttentionOrder`, !source.includes("planAttentionOrder"));
    expectTrue(`${builderPath} does not call recordSurfacedOpportunities`, !source.includes("recordSurfacedOpportunities"));
    expectTrue(`${builderPath} does not call applyFatigue`, !source.includes("applyFatigue"));
  }
}

section("centralized orchestration owns fatigue pipeline and surfaced recording");
{
  const orchestrationSource = readBrainSource("product/orchestrateProductBrainFatigue.ts");
  expectTrue("orchestration imports runAttentionFatiguePipeline", orchestrationSource.includes("runAttentionFatiguePipeline"));
  expectTrue("orchestration imports recordSurfacedOpportunities", orchestrationSource.includes("recordSurfacedOpportunities"));
  expectTrue("orchestration calls runAttentionFatiguePipeline", /runAttentionFatiguePipeline\s*\(/.test(orchestrationSource));
  expectTrue("orchestration calls recordSurfacedOpportunities", /recordSurfacedOpportunities\s*\(/.test(orchestrationSource));
}

section("fatigue pipeline uses planner and applyFatigue");
{
  const pipelineSource = readBrainSource("fatigue/runAttentionFatiguePipeline.ts");
  expectTrue("pipeline imports planAttentionOrder", pipelineSource.includes("planAttentionOrder"));
  expectTrue("pipeline calls planAttentionOrder", /planAttentionOrder\s*\(/.test(pipelineSource));
  expectTrue("pipeline imports applyFatigue", pipelineSource.includes("applyFatigue"));
  expectTrue("pipeline calls applyFatigue", /applyFatigue\s*\(/.test(pipelineSource));
}

section("builders map nested opportunity fields");
{
  for (const builderPath of PRODUCT_BUILDERS) {
    const source = readBrainSource(builderPath);
    expectTrue(`${builderPath} reads item.opportunity.decision`, source.includes("item.opportunity.decision"));
    expectTrue(`${builderPath} reads item.opportunity.recipientId`, source.includes("item.opportunity.recipientId"));
    expectTrue(`${builderPath} reads item.opportunity.recipientName`, source.includes("item.opportunity.recipientName"));
  }
}

section("getVisibleFatigueOpportunities preserves order in no-op mode");
{
  const decisions = [
    decisionFixture({ sourceRuleId: "birthday", outcome: "ask_question", recipientId: "a", priority: "high" }),
    decisionFixture({ sourceRuleId: "fresh_update", outcome: "ask_question", recipientId: "b" }),
  ];
  const recipients = [
    { recipientId: "a", recipientName: "Alice" },
    { recipientId: "b", recipientName: "Bob" },
  ];
  const ranked = planAttentionOrder({ decisions, recipients });
  const context: FatigueContext = {
    userId: "user-1",
    evaluatedAt: "2026-07-10T14:00:00.000Z",
    exposureSnapshot: createEmptyExposureSnapshot("2026-07-10T14:00:00.000Z"),
  };
  const visible = getVisibleFatigueOpportunities(applyFatigue(ranked, context));

  expect("visible length", visible.length, ranked.length);
  expect(
    "visible recipient order",
    visible.map((item) => item.opportunity.recipientId),
    ranked.map((item) => item.recipientId),
  );
  expectTrue(
    "all fatigue decisions visible",
    visible.every((item) => item.fatigueDecision === "visible"),
  );
  expectTrue(
    "all suppressionReason null",
    visible.every((item) => item.suppressionReason === null),
  );
  expectTrue(
    "all deferUntil null",
    visible.every((item) => item.deferUntil === null),
  );
}

section("dedupeSurfacedFatigueOpportunities deduplicates opportunity keys");
{
  const deduped = dedupeSurfacedFatigueOpportunities([
    fatigueItem("a", "birthday"),
    fatigueItem("a", "birthday"),
    fatigueItem("b", "fresh_update"),
  ]);

  expect("deduped count", deduped.length, 2);
  expect(
    "deduped keys",
    deduped.map((item) => item.opportunity.opportunityKey),
    ["a:birthday", "b:fresh_update"],
  );
}

section("fatigue rules live under fatigue/rules");
{
  const rulesSource = readBrainSource("fatigue/rules/recentlySurfacedRule.ts");
  expectTrue("recentlySurfacedRule exists", rulesSource.includes("evaluateRecentlySurfacedRule"));
  expectTrue("applyFatigue imports evaluator", readBrainSource("fatigue/applyFatigue.ts").includes("evaluateFatigueOpportunity"));
}

section("fail-open behavior in fatigue pipeline and exposure loader");
{
  const pipelineSource = readBrainSource("fatigue/runAttentionFatiguePipeline.ts");
  expectTrue("pipeline has try/catch fallback", pipelineSource.includes("try {") && pipelineSource.includes("} catch"));
  expectTrue("pipeline falls back to pass-through", pipelineSource.includes("passThroughFatigueOpportunities"));

  const loaderSource = readBrainSource("fatigue/exposure/loadExposureSnapshot.ts");
  expectTrue("loadExposureSnapshot has try/catch", loaderSource.includes("try {") && loaderSource.includes("} catch"));
  expectTrue("loadExposureSnapshot returns empty snapshot on failure", loaderSource.includes("createEmptyExposureSnapshot"));

  const recorderSource = readBrainSource("fatigue/exposure/recordSurfacedOpportunities.ts");
  expectTrue("recordSurfacedOpportunities uses Promise.allSettled", recorderSource.includes("Promise.allSettled"));
  expectTrue("orchestration does not await surfaced recording", readBrainSource("product/orchestrateProductBrainFatigue.ts").includes("void recordSurfacedOpportunities"));
}

section("concierge builder deduplicates delivered surfaced opportunities");
{
  const source = readBrainSource("product/buildConciergeWorkspace.ts");
  expectTrue("concierge defines dedupe helper", source.includes("dedupeDeliveredConciergeOpportunities"));
  expectTrue("concierge passes deduped delivered list", source.includes("deliveredFatigueOpportunities: dedupeDeliveredConciergeOpportunities"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
