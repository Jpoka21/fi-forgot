/**
 * Architecture guard tests for Brain Attention Planner (Step 4f).
 *
 * Prevents product builders from bypassing orchestrateProductBrainFatigue().
 * Does not assert runtime behavior — source and export boundaries only.
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-attention-architecture.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BRAIN_ROOT = join(TEST_DIR, "../brain");

const PRODUCT_BUILDERS = [
  "product/buildDashboardBrainOpportunities.ts",
  "product/buildNotifications.ts",
  "product/buildConciergeWorkspace.ts",
] as const;

const LEGACY_RANKER_IMPORTS = [
  "rankRelationshipOpportunities",
  "rankDashboardOpportunities",
  "rankNotifications",
  "compareRankableRelationshipOpportunities",
  "compareRankableDashboardOpportunities",
  "compareRankableNotifications",
] as const;

const PLANNER_FILES = [
  "attention/planAttentionOrder.ts",
  "attention/rankGlobalOpportunities.ts",
  "attention/computeAttentionScore.ts",
  "attention/buildGlobalOpportunityPool.ts",
  "attention/collectProductBrainDecisions.ts",
  "attention/shouldIncludeOpportunity.ts",
] as const;

const GLOBAL_OPPORTUNITY_FIELDS = [
  "opportunityKey",
  "attentionScore",
  "globalRank",
  "suppressionReason",
] as const;

const PUBLIC_DTO_TYPE_FILES = [
  "product/dashboardBrainOpportunitiesTypes.ts",
  "product/notificationTypes.ts",
  "product/conciergeTypes.ts",
] as const;

let passed = 0;
let failed = 0;
const failures: string[] = [];

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

section("product builders use orchestrateProductBrainFatigue");
{
  for (const builderPath of PRODUCT_BUILDERS) {
    const source = readBrainSource(builderPath);
    expectTrue(`${builderPath} imports orchestrateProductBrainFatigue`, source.includes("orchestrateProductBrainFatigue"));
    expectTrue(`${builderPath} calls orchestrateProductBrainFatigue`, /orchestrateProductBrainFatigue\s*\(/.test(source));
    expectTrue(`${builderPath} does not call planAttentionOrder`, !source.includes("planAttentionOrder"));
    expectTrue(`${builderPath} does not call recordSurfacedOpportunities`, !source.includes("recordSurfacedOpportunities"));
  }
}

section("product fatigue orchestration uses fatigue pipeline");
{
  const orchestrationSource = readBrainSource("product/orchestrateProductBrainFatigue.ts");
  expectTrue("orchestration imports runAttentionFatiguePipeline", orchestrationSource.includes("runAttentionFatiguePipeline"));
  expectTrue("orchestration imports recordSurfacedOpportunities", orchestrationSource.includes("recordSurfacedOpportunities"));
}

section("fatigue pipeline uses planAttentionOrder");
{
  const pipelineSource = readBrainSource("fatigue/runAttentionFatiguePipeline.ts");
  expectTrue("pipeline imports planAttentionOrder", pipelineSource.includes("planAttentionOrder"));
  expectTrue("pipeline calls planAttentionOrder", /planAttentionOrder\s*\(/.test(pipelineSource));
  expectTrue("pipeline imports applyFatigue", pipelineSource.includes("applyFatigue"));
}

section("product builders do not import legacy rankers");
{
  for (const builderPath of PRODUCT_BUILDERS) {
    const source = readBrainSource(builderPath);
    for (const ranker of LEGACY_RANKER_IMPORTS) {
      expectTrue(`${builderPath} has no ${ranker}`, !source.includes(ranker));
    }
  }
}

section("planner contains no product caps or surface names");
{
  const plannerSource = PLANNER_FILES.map(readBrainSource).join("\n");

  for (const token of [
    "Dashboard",
    "Notifications",
    "Concierge",
    "DASHBOARD_",
    "NOTIFICATIONS_",
    "CONCIERGE_",
    "DASHBOARD_BRAIN_OPPORTUNITIES_MAX",
    "NOTIFICATIONS_MAX",
    "CONCIERGE_RECOMMENDATIONS_MAX",
    "CONCIERGE_INSIGHTS_MAX",
    "slice(",
  ]) {
    expectTrue(`planner layer has no ${token}`, !plannerSource.includes(token));
  }
}

section("brain/index.ts does not expose attention internals");
{
  const brainIndex = readBrainSource("index.ts");

  for (const token of [
    "planAttentionOrder",
    "GlobalOpportunity",
    "rankGlobalOpportunities",
    "computeAttentionScore",
    "buildGlobalOpportunityPool",
    "shouldIncludeOpportunity",
    "collectProductBrainDecisions",
    "/attention",
  ]) {
    expectTrue(`brain/index.ts does not export ${token}`, !brainIndex.includes(token));
  }
}

section("GlobalOpportunity is not exposed in public DTO types");
{
  for (const dtoPath of PUBLIC_DTO_TYPE_FILES) {
    const source = readBrainSource(dtoPath);
    expectTrue(`${dtoPath} does not reference GlobalOpportunity`, !source.includes("GlobalOpportunity"));
    for (const field of GLOBAL_OPPORTUNITY_FIELDS) {
      expectTrue(`${dtoPath} has no ${field} field name`, !source.includes(field));
    }
  }
}

section("globalOpportunityTypes is not imported by routes");
{
  const routeFiles = [
    join(TEST_DIR, "../routes/v2-dashboard-brain.ts"),
    join(TEST_DIR, "../routes/v2-notifications.ts"),
    join(TEST_DIR, "../routes/v2-concierge.ts"),
  ];

  for (const routePath of routeFiles) {
    const source = readFileSync(routePath, "utf8");
    expectTrue(`${routePath.split("/").pop()} has no GlobalOpportunity`, !source.includes("GlobalOpportunity"));
    expectTrue(`${routePath.split("/").pop()} has no planAttentionOrder`, !source.includes("planAttentionOrder"));
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
