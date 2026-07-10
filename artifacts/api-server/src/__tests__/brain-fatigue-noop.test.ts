/**
 * No-op Fatigue Engine tests (Step 5b).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-fatigue-noop.test.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { planAttentionOrder } from "../brain/attention/planAttentionOrder.js";
import type { GlobalOpportunity } from "../brain/attention/globalOpportunityTypes.js";
import { applyFatigue } from "../brain/fatigue/applyFatigue.js";
import {
  createEmptyExposureSnapshot,
  loadExposureSnapshot,
  type FatigueContext,
  type FatigueOpportunity,
} from "../brain/fatigue/index.js";
import type { ProductBrainDecision } from "../brain/product/productBrainDecisionTypes.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BRAIN_ROOT = join(TEST_DIR, "../brain");
const FATIGUE_ROOT = join(BRAIN_ROOT, "fatigue");

const PLANNER_FIELD_NAMES = [
  "opportunityKey",
  "recipientId",
  "recipientName",
  "decision",
  "attentionScore",
  "globalRank",
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

function section(name: string): void {
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

const SAMPLE_DECISIONS = [
  decisionFixture({ sourceRuleId: "birthday", outcome: "ask_question", recipientId: "a", priority: "high" }),
  decisionFixture({ sourceRuleId: "fresh_update", outcome: "ask_question", recipientId: "b" }),
  decisionFixture({ sourceRuleId: "memory_accumulation", outcome: "show_dashboard_insight", recipientId: "c", priority: "low" }),
];

const SAMPLE_RECIPIENTS = [
  { recipientId: "a", recipientName: "Alice" },
  { recipientId: "b", recipientName: "Bob" },
  { recipientId: "c", recipientName: "Cara" },
];

function fatigueContext(userId = "user-1"): FatigueContext {
  const evaluatedAt = "2026-07-09T12:00:00.000Z";
  return {
    userId,
    evaluatedAt,
    exposureSnapshot: loadExposureSnapshot({ userId, evaluatedAt }),
  };
}

function snapshotGlobalOpportunity(opportunity: GlobalOpportunity): string {
  return JSON.stringify({
    opportunityKey: opportunity.opportunityKey,
    recipientId: opportunity.recipientId,
    recipientName: opportunity.recipientName,
    attentionScore: opportunity.attentionScore,
    globalRank: opportunity.globalRank,
    suppressionReason: opportunity.suppressionReason,
    metadata: opportunity.metadata,
    decision: opportunity.decision,
  });
}

section("one output per input with identical ordering");
{
  const ranked = planAttentionOrder({ decisions: SAMPLE_DECISIONS, recipients: SAMPLE_RECIPIENTS });
  const fatigued = applyFatigue(ranked, fatigueContext());

  expect("same length", fatigued.length, ranked.length);
  expect(
    "recipient order preserved via nested opportunity",
    fatigued.map((item) => item.opportunity.recipientId),
    ranked.map((item) => item.recipientId),
  );
  expect(
    "globalRank order preserved via nested opportunity",
    fatigued.map((item) => item.opportunity.globalRank),
    ranked.map((item) => item.globalRank),
  );
  expect(
    "opportunityKey order preserved via nested opportunity",
    fatigued.map((item) => item.opportunity.opportunityKey),
    ranked.map((item) => item.opportunityKey),
  );
}

section("each output.opportunity is the exact same object reference as input");
{
  const ranked = planAttentionOrder({ decisions: SAMPLE_DECISIONS, recipients: SAMPLE_RECIPIENTS });
  const fatigued = applyFatigue(ranked, fatigueContext());

  for (let index = 0; index < ranked.length; index++) {
    expectTrue(
      `item ${index} preserves GlobalOpportunity reference`,
      fatigued[index]!.opportunity === ranked[index],
    );
  }
}

section("no planner fields duplicated at FatigueOpportunity top level");
{
  const ranked = planAttentionOrder({ decisions: SAMPLE_DECISIONS, recipients: SAMPLE_RECIPIENTS });
  const fatigued = applyFatigue(ranked, fatigueContext());

  for (let index = 0; index < fatigued.length; index++) {
    const item = fatigued[index] as FatigueOpportunity & Record<string, unknown>;
    for (const field of PLANNER_FIELD_NAMES) {
      expectTrue(
        `item ${index} has no top-level ${field}`,
        !(field in item),
      );
    }
  }

  expectTrue(
    "top-level keys are only fatigue fields plus opportunity",
    fatigued.every((item) => {
      const keys = Object.keys(item).sort();
      return JSON.stringify(keys) === JSON.stringify(["deferUntil", "fatigueDecision", "opportunity", "suppressionReason"]);
    }),
  );
}

section("every opportunity marked visible with null suppression and defer");
{
  const ranked = planAttentionOrder({ decisions: SAMPLE_DECISIONS, recipients: SAMPLE_RECIPIENTS });
  const fatigued = applyFatigue(ranked, fatigueContext());

  expectTrue(
    "all visible",
    fatigued.every((item) => item.fatigueDecision === "visible"),
  );
  expectTrue(
    "all suppressionReason null",
    fatigued.every((item) => item.suppressionReason === null),
  );
  expectTrue(
    "all deferUntil null",
    fatigued.every((item) => item.deferUntil === null),
  );
}

section("input array and GlobalOpportunity objects unchanged");
{
  const ranked = planAttentionOrder({ decisions: SAMPLE_DECISIONS, recipients: SAMPLE_RECIPIENTS });
  const rankedSnapshot = JSON.stringify(ranked.map((item) => item.recipientId));
  const opportunitySnapshots = ranked.map((item) => snapshotGlobalOpportunity(item));

  applyFatigue(ranked, fatigueContext());

  expect("input array unchanged", JSON.stringify(ranked.map((item) => item.recipientId)), rankedSnapshot);
  expectTrue(
    "GlobalOpportunity objects unchanged",
    ranked.every((item, index) => snapshotGlobalOpportunity(item) === opportunitySnapshots[index]),
  );
}

section("no filtering — count equals ranked input");
{
  const decisions = [
    ...SAMPLE_DECISIONS,
    decisionFixture({ sourceRuleId: "wait", outcome: "wait", recipientId: "wait-1" }),
  ];
  const recipients = [
    ...SAMPLE_RECIPIENTS,
    { recipientId: "wait-1", recipientName: "Wait" },
  ];
  const ranked = planAttentionOrder({ decisions, recipients });
  const fatigued = applyFatigue(ranked, fatigueContext());

  expect("output count equals ranked count", fatigued.length, ranked.length);
}

section("empty input");
{
  const fatigued = applyFatigue([], fatigueContext());
  expect("empty output", fatigued, []);
}

section("applyFatigue ignores ExposureSnapshot — pass-through with loaded snapshot");
{
  const ranked = planAttentionOrder({ decisions: SAMPLE_DECISIONS, recipients: SAMPLE_RECIPIENTS });
  const evaluatedAt = "2026-07-10T14:00:00.000Z";
  const context: FatigueContext = {
    userId: "user-with-snapshot",
    evaluatedAt,
    exposureSnapshot: createEmptyExposureSnapshot(evaluatedAt),
  };

  expect("snapshot loadedAt", context.exposureSnapshot.loadedAt, evaluatedAt);
  const fatigued = applyFatigue(ranked, context);

  expect("same length with snapshot context", fatigued.length, ranked.length);
  expectTrue(
    "all visible with snapshot context",
    fatigued.every((item) => item.fatigueDecision === "visible"),
  );
  expectTrue(
    "all suppressionReason null with snapshot context",
    fatigued.every((item) => item.suppressionReason === null),
  );
  expectTrue(
    "all deferUntil null with snapshot context",
    fatigued.every((item) => item.deferUntil === null),
  );
}

function listFatigueSources(): string {
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

  walk(FATIGUE_ROOT);
  return files.join("\n");
}

section("architecture — fatigue module has no product names");
{
  const source = listFatigueSources();

  for (const token of [
    "Dashboard",
    "Notifications",
    "Concierge",
    "DASHBOARD_",
    "NOTIFICATIONS_",
    "CONCIERGE_",
    "buildDashboard",
    "buildNotification",
    "buildConcierge",
  ]) {
    expectTrue(`fatigue source has no ${token}`, !source.includes(token));
  }
}

section("architecture — fatigue does not import planner ranking internals");
{
  const source = listFatigueSources();

  for (const token of [
    "planAttentionOrder",
    "rankGlobalOpportunities",
    "computeAttentionScore",
    "collectProductBrainDecisions",
    "shouldIncludeOpportunity",
    "buildGlobalOpportunityPool",
  ]) {
    expectTrue(`fatigue source has no ${token}`, !source.includes(token));
  }

  expectTrue(
    "fatigue imports GlobalOpportunity type only from attention",
    source.includes("globalOpportunityTypes") || source.includes("GlobalOpportunity"),
  );
}

section("architecture — fatigue does not import product surfaces or DTO mappers");
{
  const source = listFatigueSources();

  for (const token of [
    "../dashboard",
    "../notifications",
    "../concierge",
    "dto/",
    "Dto",
    "DTO",
    "mapTo",
    "Mapper",
  ]) {
    expectTrue(`fatigue source has no ${token}`, !source.includes(token));
  }
}

section("architecture — product builders do not import fatigue module");
{
  const builders = [
    "product/buildDashboardBrainOpportunities.ts",
    "product/buildNotifications.ts",
    "product/buildConciergeWorkspace.ts",
  ];

  for (const builderPath of builders) {
    const source = readFileSync(join(BRAIN_ROOT, builderPath), "utf8");
    expectTrue(`${builderPath} does not import applyFatigue`, !source.includes("applyFatigue"));
    expectTrue(`${builderPath} does not import fatigue module`, !source.includes("/fatigue"));
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
