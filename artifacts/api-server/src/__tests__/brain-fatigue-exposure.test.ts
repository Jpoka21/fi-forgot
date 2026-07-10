/**
 * Exposure model tests (Step 5c).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-fatigue-exposure.test.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  createEmptyExposureSnapshot,
  loadExposureSnapshot,
  type ExposureSnapshot,
} from "../brain/fatigue/exposure/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BRAIN_ROOT = join(TEST_DIR, "../brain");
const FATIGUE_ROOT = join(BRAIN_ROOT, "fatigue");
const EXPOSURE_ROOT = join(FATIGUE_ROOT, "exposure");

const EVALUATED_AT = "2026-07-10T14:00:00.000Z";

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

function listTypeScriptSources(root: string): string[] {
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
  return files;
}

section("createEmptyExposureSnapshot");
{
  const snapshot = createEmptyExposureSnapshot(EVALUATED_AT);

  expect("loadedAt", snapshot.loadedAt, EVALUATED_AT);
  expect("byOpportunityKey empty", snapshot.byOpportunityKey, {});
}

section("loadExposureSnapshot returns valid empty snapshot");
{
  const snapshot = loadExposureSnapshot({
    userId: "user-1",
    evaluatedAt: EVALUATED_AT,
  });

  expect("loadedAt", snapshot.loadedAt, EVALUATED_AT);
  expect("byOpportunityKey empty", snapshot.byOpportunityKey, {});
  expectTrue("no extra snapshot keys", Object.keys(snapshot).sort().join(",") === "byOpportunityKey,loadedAt");
}

section("ExposureSnapshot shape");
{
  const snapshot: ExposureSnapshot = createEmptyExposureSnapshot(EVALUATED_AT);

  expectTrue("has loadedAt", typeof snapshot.loadedAt === "string");
  expectTrue("has byOpportunityKey", typeof snapshot.byOpportunityKey === "object");
  expectTrue("no recentDismissalKeys", !("recentDismissalKeys" in snapshot));
  expectTrue("no lastUserActionAt", !("lastUserActionAt" in snapshot));
  expectTrue("no requestingSurface", !("requestingSurface" in snapshot));
  expectTrue("no fatigueScore", !("fatigueScore" in snapshot));
}

section("architecture — exposure module is product agnostic");
{
  const source = listTypeScriptSources(EXPOSURE_ROOT).join("\n");

  for (const token of [
    "Dashboard",
    "Notifications",
    "Concierge",
    "DASHBOARD_",
    "NOTIFICATIONS_",
    "CONCIERGE_",
    "requestingSurface",
    "FatigueSurface",
    "fatigueScore",
    "recentDismissalKeys",
    "lastUserActionAt",
    '"read"',
    '"deferred"',
  ]) {
    expectTrue(`exposure source has no ${token}`, !source.includes(token));
  }
}

section("architecture — exposure does not import planner internals");
{
  const source = listTypeScriptSources(EXPOSURE_ROOT).join("\n");

  for (const token of [
    "planAttentionOrder",
    "rankGlobalOpportunities",
    "computeAttentionScore",
    "collectProductBrainDecisions",
    "shouldIncludeOpportunity",
    "buildGlobalOpportunityPool",
  ]) {
    expectTrue(`exposure source has no ${token}`, !source.includes(token));
  }
}

section("architecture — exposure does not import DTO mappers");
{
  const source = listTypeScriptSources(EXPOSURE_ROOT).join("\n");

  for (const token of [
    "dto/",
    "Dto",
    "DTO",
    "mapTo",
    "Mapper",
  ]) {
    expectTrue(`exposure source has no ${token}`, !source.includes(token));
  }
}

section("architecture — product builders do not import exposure module");
{
  const builders = [
    "product/buildDashboardBrainOpportunities.ts",
    "product/buildNotifications.ts",
    "product/buildConciergeWorkspace.ts",
  ];

  for (const builderPath of builders) {
    const source = readFileSync(join(BRAIN_ROOT, builderPath), "utf8");
    expectTrue(`${builderPath} does not import /fatigue/exposure`, !source.includes("/fatigue/exposure"));
    expectTrue(`${builderPath} does not import loadExposureSnapshot`, !source.includes("loadExposureSnapshot"));
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
