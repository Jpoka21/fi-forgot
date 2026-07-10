/**
 * Architecture guard tests for Brain Outcomes module (Step 6b).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-outcomes-architecture.test.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BRAIN_ROOT = join(TEST_DIR, "../brain");
const OUTCOMES_ROOT = join(BRAIN_ROOT, "outcomes");

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
  "product/orchestrateProductBrainFatigue.ts",
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

function readBrainSource(relativePath: string): string {
  return readFileSync(join(BRAIN_ROOT, relativePath), "utf8");
}

section("outcomes module does not import product builders or DTOs");
{
  const outcomesSource = listTypeScriptSources(OUTCOMES_ROOT);

  for (const token of [
    "buildDashboardBrainOpportunities",
    "buildNotifications",
    "buildConciergeWorkspace",
    "orchestrateProductBrainFatigue",
    "dashboardBrainOpportunitiesTypes",
    "notificationTypes",
    "conciergeTypes",
    "/product/",
    "express",
    "fi-forgot",
    "artifacts/fi-forgot",
  ]) {
    expectTrue(`outcomes source has no ${token}`, !outcomesSource.includes(token));
  }
}

section("outcomes module does not import exposure persistence or fatigue rules");
{
  const nonProjectionSource = readdirSync(OUTCOMES_ROOT)
    .filter((entry) => entry.endsWith(".ts"))
    .map((entry) => readFileSync(join(OUTCOMES_ROOT, entry), "utf8"))
    .join("\n");

  for (const token of [
    "pgExposureRepository",
    "recordExposureEvent",
    "recordSurfacedOpportunities",
    "materializeExposureSnapshot",
    "applyFatigue",
    "recentlySurfacedRule",
  ]) {
    expectTrue(`non-projection outcomes source has no ${token}`, !nonProjectionSource.includes(token));
  }
}

section("outcomes projection uses exposure append contract only");
{
  const projectionSource = listTypeScriptSources(join(OUTCOMES_ROOT, "projection"));

  expectTrue(
    "projection references ExposureEventRepository",
    projectionSource.includes("ExposureEventRepository"),
  );
  expectTrue(
    "projection does not import pgExposureRepository",
    !projectionSource.includes("pgExposureRepository"),
  );
  expectTrue(
    "projection does not import recordSurfacedOpportunities",
    !projectionSource.includes("recordSurfacedOpportunities"),
  );
}

section("outcomes module does not import planner ranking");
{
  const outcomesSource = listTypeScriptSources(OUTCOMES_ROOT);

  for (const token of [
    "planAttentionOrder",
    "rankGlobalOpportunities",
    "computeAttentionScore",
    "buildGlobalOpportunityPool",
  ]) {
    expectTrue(`outcomes source has no ${token}`, !outcomesSource.includes(token));
  }
}

section("planner and product builders do not import outcomes module");
{
  const plannerSource = PLANNER_FILES.map(readBrainSource).join("\n");
  const builderSource = PRODUCT_BUILDERS.map(readBrainSource).join("\n");
  const combined = `${plannerSource}\n${builderSource}`;

  for (const token of ["/outcomes", "recordBrainOutcome", "BrainOutcomeRecorder", "noOpBrainOutcomeRecorder"]) {
    expectTrue(`planner/builders have no ${token}`, !combined.includes(token));
  }
}

section("outcomes module avoids deferred execution identity implementation");
{
  const outcomesSource = listTypeScriptSources(OUTCOMES_ROOT);

  expectTrue("outcomes source has no BrainExecutionId type usage", !outcomesSource.includes("BrainExecutionId:"));
  expectTrue("outcomes source has no execution repository", !outcomesSource.includes("ExecutionRepository"));
  expectTrue("outcomes source has no brainActionToken", !outcomesSource.includes("brainActionToken"));
  expectTrue("outcomes source has no brainContextToken", !outcomesSource.includes("brainContextToken"));
  expectTrue("outcomes source has no requestingSurface", !outcomesSource.includes("requestingSurface"));
  expectTrue("outcomes source has no FatigueSurface", !outcomesSource.includes("FatigueSurface"));
}

section("outcome vocabulary matches approved Sprint 6 roadmap");
{
  const typesSource = readBrainSource("outcomes/outcomeTypes.ts");

  for (const outcomeType of [
    "question_answered",
    "card_created",
    "card_approved",
    "card_sent",
    "opportunity_dismissed",
  ]) {
    expectTrue(`types include ${outcomeType}`, typesSource.includes(`"${outcomeType}"`));
  }

  expectTrue("types exclude speculative logged", !typesSource.includes('"memory_logged"'));
  expectTrue("types exclude speculative ignored", !typesSource.includes('"opportunity_ignored"'));
}

section("outcomes persistence avoids exposure writes");
{
  const outcomesSource = listTypeScriptSources(OUTCOMES_ROOT);

  for (const token of [
    "brainOpportunityExposureEventsTable",
    "insertExposureEvent",
    "materializeExposureSnapshot",
  ]) {
    expectTrue(`outcomes source has no ${token}`, !outcomesSource.includes(token));
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
