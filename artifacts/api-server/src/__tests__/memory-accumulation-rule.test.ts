/**
 * Unit tests for brain/decision/rules/memoryAccumulationRule.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/memory-accumulation-rule.test.ts
 */

import { CARD_GAP_THRESHOLD_DAYS } from "../brain/config/opportunityThresholds.js";
import { RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS } from "../brain/config/relationshipThresholds.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { memoryAccumulationRule } from "../brain/decision/rules/memoryAccumulationRule.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import { minimalRelationshipContext } from "./fixtures/minimalRelationshipContext.js";

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

function memoryAccumulationContext(
  normalizedOverrides: Partial<NormalizedRelationshipState> = {},
  cardDaysAgo: number = 30,
  activityDaysAgo: number = 45,
) {
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-fresh",
      type: "fresh_update",
      occurredAt: "2026-06-01T00:00:00.000Z",
      daysAgo: activityDaysAgo,
      label: "Fresh Update",
    },
    {
      id: "event-card",
      type: "card",
      occurredAt: "2025-06-01T00:00:00.000Z",
      daysAgo: cardDaysAgo,
      label: "card",
    },
  ];
  return buildDecisionContext(
    normalized({
      identity: "developing",
      history: "moderate",
      freshness: "current",
      momentum: "quiet",
      writing: "low",
      ...normalizedOverrides,
    }),
    relationshipContext,
  );
}

const MATCH_CANDIDATE = {
  ruleId: "memory_accumulation",
  priority: 34,
  confidence: 44,
  decision: { outcome: "ask_question" },
  reasons: ["memory_inventory_thin"],
  debugNotes: [
    "MemoryAccumulationRule matched",
    "identity: developing",
    "history: moderate",
    "writing: low",
    "freshness: current",
    "momentum: quiet",
    "last relationship activity days ago: 45",
  ],
};

section("MemoryAccumulationRule matches when memory opportunity exists on active relationship");
{
  const ctx = memoryAccumulationContext();
  expect("matches", memoryAccumulationRule.evaluate(ctx), MATCH_CANDIDATE);
}

section("rich history does not match");
{
  const ctx = memoryAccumulationContext({ history: "rich" });
  expect("history rich", memoryAccumulationRule.evaluate(ctx), null);
}

section("stale freshness does not match");
{
  const ctx = memoryAccumulationContext({ freshness: "stale" });
  expect("stale", memoryAccumulationRule.evaluate(ctx), null);
}

section("inactive relationship does not match");
{
  const ctx = memoryAccumulationContext({}, 30, RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS + 1);
  expect("inactive", memoryAccumulationRule.evaluate(ctx), null);
}

section("thin identity does not match");
{
  const ctx = memoryAccumulationContext({ identity: "thin" });
  expect("thin identity", memoryAccumulationRule.evaluate(ctx), null);
}

section("new momentum does not match");
{
  const ctx = memoryAccumulationContext({ momentum: "new" });
  expect("momentum new", memoryAccumulationRule.evaluate(ctx), null);
}

section("sparse history does not match");
{
  const ctx = memoryAccumulationContext({ history: "none" });
  expect("history none", memoryAccumulationRule.evaluate(ctx), null);
}

section("card_gap overlap does not match");
{
  const ctx = memoryAccumulationContext({}, CARD_GAP_THRESHOLD_DAYS + 1, 45);
  expect("card channel quiet", memoryAccumulationRule.evaluate(ctx), null);
}

section("calendar preparation window does not match");
{
  const relationshipContext = minimalRelationshipContext({
    generatedAt: "2026-07-01T00:00:00.000Z",
    birthday: "1988-07-08",
    previewDays: 14,
  });
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-fresh",
      type: "fresh_update",
      occurredAt: "2026-06-01T00:00:00.000Z",
      daysAgo: 45,
      label: "Fresh Update",
    },
    {
      id: "event-card",
      type: "card",
      occurredAt: "2025-06-01T00:00:00.000Z",
      daysAgo: 30,
      label: "card",
    },
  ];
  const ctx = buildDecisionContext(
    normalized({
      identity: "developing",
      history: "moderate",
      freshness: "current",
      momentum: "quiet",
    }),
    relationshipContext,
  );
  expect("birthday in window", memoryAccumulationRule.evaluate(ctx), null);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
