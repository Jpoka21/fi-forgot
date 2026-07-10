/**
 * Architecture guard tests for Brain Fatigue Engine (Step 5g).
 *
 * Source and export boundaries only — no runtime behavior assertions.
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-fatigue-architecture.test.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BRAIN_ROOT = join(TEST_DIR, "../brain");
const FATIGUE_ROOT = join(BRAIN_ROOT, "fatigue");
const EXPOSURE_ROOT = join(FATIGUE_ROOT, "exposure");
const RULES_ROOT = join(FATIGUE_ROOT, "rules");

const PLANNER_FILES = [
  "attention/planAttentionOrder.ts",
  "attention/rankGlobalOpportunities.ts",
  "attention/computeAttentionScore.ts",
  "attention/buildGlobalOpportunityPool.ts",
  "attention/collectProductBrainDecisions.ts",
  "attention/shouldIncludeOpportunity.ts",
] as const;

const PRODUCT_BUILDERS = [
  "product/buildDashboardBrainOpportunities.ts",
  "product/buildNotifications.ts",
  "product/buildConciergeWorkspace.ts",
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

function listTypeScriptSources(root: string): string {
  const files: string[] = [];

  function walk(directory: string): void {
    for (const entry of readdirSync(directory)) {
      const fullPath = join(directory, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.endsWith(".ts")) {
        files.push(readFileSync(fullPath, "utf8"));
      }
    }
  }

  walk(root);
  return files.join("\n");
}

section("planner never imports fatigue");
{
  const plannerSource = PLANNER_FILES.map(readBrainSource).join("\n");

  for (const token of [
    "/fatigue",
    "applyFatigue",
    "FatigueContext",
    "FatigueOpportunity",
    "loadExposureSnapshot",
    "recordSurfacedOpportunities",
    "runAttentionFatiguePipeline",
    "orchestrateProductBrainFatigue",
  ]) {
    expectTrue(`planner source has no ${token}`, !plannerSource.includes(token));
  }
}

section("fatigue never imports product builders");
{
  const fatigueSource = listTypeScriptSources(FATIGUE_ROOT);

  for (const token of [
    "buildDashboardBrainOpportunities",
    "buildNotifications",
    "buildConciergeWorkspace",
    "orchestrateProductBrainFatigue",
    "/product/build",
    "dashboardBrainOpportunitiesTypes",
    "notificationTypes",
    "conciergeTypes",
  ]) {
    expectTrue(`fatigue source has no ${token}`, !fatigueSource.includes(token));
  }
}

section("product builders use orchestration and do not rerank");
{
  for (const builderPath of PRODUCT_BUILDERS) {
    const source = readBrainSource(builderPath);
    expectTrue(`${builderPath} uses orchestrateProductBrainFatigue`, source.includes("orchestrateProductBrainFatigue"));
    expectTrue(`${builderPath} does not call planAttentionOrder`, !source.includes("planAttentionOrder"));
    expectTrue(`${builderPath} does not call applyFatigue`, !source.includes("applyFatigue"));
    expectTrue(`${builderPath} does not call recordSurfacedOpportunities`, !source.includes("recordSurfacedOpportunities"));
    expectTrue(`${builderPath} does not call rankRelationshipOpportunities`, !source.includes("rankRelationshipOpportunities"));
  }
}

section("fatigue never imports DTOs or frontend");
{
  const fatigueSource = listTypeScriptSources(FATIGUE_ROOT);

  for (const token of [
    "dto/",
    "Dto",
    "DTO",
    "mapTo",
    "Mapper",
    "fi-forgot",
    "artifacts/fi-forgot",
    "../routes/",
  ]) {
    expectTrue(`fatigue source has no ${token}`, !fatigueSource.includes(token));
  }
}

section("exposure repository remains isolated from planner and products");
{
  const exposureSource = listTypeScriptSources(EXPOSURE_ROOT);

  for (const token of [
    "planAttentionOrder",
    "rankGlobalOpportunities",
    "computeAttentionScore",
    "buildGlobalOpportunityPool",
    "collectProductBrainDecisions",
    "buildDashboard",
    "buildNotification",
    "buildConcierge",
    "orchestrateProductBrainFatigue",
  ]) {
    expectTrue(`exposure source has no ${token}`, !exposureSource.includes(token));
  }
}

section("fatigue never sorts ranked opportunities");
{
  const fatigueSource = listTypeScriptSources(FATIGUE_ROOT);
  expectTrue("fatigue module has no .sort(", !fatigueSource.includes(".sort("));
  expectTrue("applyFatigue uses ranked.map", readBrainSource("fatigue/applyFatigue.ts").includes("ranked.map"));
}

section("rules remain independent — single active rule module");
{
  const ruleFiles = readdirSync(RULES_ROOT).filter((entry) => entry.endsWith(".ts"));
  expectTrue("exactly one rule file", ruleFiles.length === 1);
  expectTrue("recentlySurfacedRule is the rule file", ruleFiles[0] === "recentlySurfacedRule.ts");

  const evaluatorSource = readBrainSource("fatigue/evaluateFatigueOpportunity.ts");
  expectTrue("evaluator imports recentlySurfacedRule only", evaluatorSource.includes("recentlySurfacedRule"));
  expectTrue("evaluator has no recently_dismissed", !evaluatorSource.includes("recently_dismissed"));
  expectTrue("evaluator has no recently_completed", !evaluatorSource.includes("recently_completed"));
  expectTrue("evaluator has no repeatedly_surfaced", !evaluatorSource.includes("repeatedly_surfaced"));
}

section("current suppression reason remains recently_surfaced");
{
  const typesSource = readBrainSource("fatigue/fatigueTypes.ts");
  expectTrue("FatigueSuppressionReason is recently_surfaced", typesSource.includes('"recently_surfaced"'));
  expectTrue("types have no recently_dismissed", !typesSource.includes("recently_dismissed"));

  const reasonsSource = readBrainSource("fatigue/fatigueSuppressionReasons.ts");
  expectTrue("reason literal is recently_surfaced", reasonsSource.includes('"recently_surfaced"'));
}

section("shadow default true and enforcement default false");
{
  const configSource = readBrainSource("fatigue/fatigueEnforcementConfig.ts");
  expectTrue(
    "shadow defaults to true",
    configSource.includes('process.env["BRAIN_FATIGUE_SHADOW_RECENTLY_SURFACED"], true'),
  );
  expectTrue(
    "enforcement defaults to false",
    configSource.includes('process.env["BRAIN_FATIGUE_ENFORCE_RECENTLY_SURFACED"], false'),
  );
}

section("orchestration owns centralized surfaced recording");
{
  const orchestrationSource = readBrainSource("product/orchestrateProductBrainFatigue.ts");
  expectTrue("orchestration imports runAttentionFatiguePipeline", orchestrationSource.includes("runAttentionFatiguePipeline"));
  expectTrue("orchestration imports recordSurfacedOpportunities", orchestrationSource.includes("recordSurfacedOpportunities"));
  expectTrue("orchestration does not import applyFatigue directly", !orchestrationSource.includes("applyFatigue"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
