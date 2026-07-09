/**
 * Unit tests for brain/decision/rules/evaluateRules.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/evaluate-rules.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { evaluateRules } from "../brain/decision/rules/evaluateRules.js";
import { ruleRegistry } from "../brain/decision/rules/ruleRegistry.js";
import type { DecisionRule } from "../brain/decision/rules/types.js";
import { waitRule } from "../brain/decision/rules/waitRule.js";
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

section("live registry collects WaitRule for unknown freshness");
{
  const context = buildDecisionContext(normalized(), minimalRelationshipContext());
  const { candidates } = evaluateRules(context, ruleRegistry);
  expect("candidate count", candidates.length, 1);
  expect("ruleId", candidates[0]?.ruleId, "wait");
}

section("live registry collects FreshUpdateRule and WaitRule for stale freshness");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext(),
  );
  const { candidates } = evaluateRules(context, ruleRegistry);
  expect("candidate count", candidates.length, 2);
  expect("rule ids", candidates.map((candidate) => candidate.ruleId).sort(), [
    "fresh_update",
    "wait",
  ]);
}

section("live registry collects InactivityRule when relationship timeline is inactive");
{
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-1",
      type: "card",
      occurredAt: "2025-01-01T00:00:00.000Z",
      daysAgo: 365,
      label: "card",
    },
  ];
  const context = buildDecisionContext(normalized(), relationshipContext);
  const { candidates } = evaluateRules(context, ruleRegistry);
  expect("candidate count", candidates.length, 2);
  expect("rule ids", candidates.map((candidate) => candidate.ruleId).sort(), [
    "inactivity",
    "wait",
  ]);
}

section("live registry collects BirthdayRule, FreshUpdateRule, and WaitRule when both match");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      birthday: "1988-07-08",
      previewDays: 14,
    }),
  );
  const { candidates } = evaluateRules(context, ruleRegistry);
  expect("candidate count", candidates.length, 3);
  expect("rule ids", candidates.map((candidate) => candidate.ruleId).sort(), [
    "birthday",
    "fresh_update",
    "wait",
  ]);
}

section("live registry collects AnniversaryRule and WaitRule when anniversary in window");
{
  const context = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      anniversary: "2015-07-08",
      previewDays: 14,
    }),
  );
  const { candidates } = evaluateRules(context, ruleRegistry);
  expect("candidate count", candidates.length, 2);
  expect("rule ids", candidates.map((candidate) => candidate.ruleId).sort(), [
    "anniversary",
    "wait",
  ]);
}

section("live registry collects all event rules when birthday, anniversary, and stale match");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      birthday: "1988-07-08",
      anniversary: "2015-07-08",
      previewDays: 14,
    }),
  );
  const { candidates } = evaluateRules(context, ruleRegistry);
  expect("candidate count", candidates.length, 4);
  expect("rule ids", candidates.map((candidate) => candidate.ruleId).sort(), [
    "anniversary",
    "birthday",
    "fresh_update",
    "wait",
  ]);
}

section("live registry collects ValentinesDayRule and WaitRule when in window");
{
  const context = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: "2026-02-01T00:00:00.000Z",
      relationshipType: "Wife",
      previewDays: 14,
    }),
  );
  const { candidates } = evaluateRules(context, ruleRegistry);
  expect("candidate count", candidates.length, 2);
  expect("rule ids", candidates.map((candidate) => candidate.ruleId).sort(), [
    "valentines_day",
    "wait",
  ]);
}

section("non-matching rules are omitted");
{
  const noMatchRule: DecisionRule = {
    id: "never",
    evaluate: () => null,
  };
  const context = buildDecisionContext(normalized(), minimalRelationshipContext());
  const { candidates } = evaluateRules(context, [noMatchRule, waitRule]);
  expect("only WaitRule matches", candidates.length, 1);
  expect("ruleId", candidates[0]?.ruleId, "wait");
}

section("multiple matching rules are all collected");
{
  const highPriorityRule: DecisionRule = {
    id: "alpha",
    evaluate: () => ({
      ruleId: "alpha",
      priority: 10,
      confidence: 50,
      decision: { outcome: "wait" },
      reasons: ["alpha"],
      debugNotes: ["alpha"],
    }),
  };
  const context = buildDecisionContext(normalized(), minimalRelationshipContext());
  const { candidates } = evaluateRules(context, [waitRule, highPriorityRule]);
  expect("candidate count", candidates.length, 2);
}

section("live registry collects CardGapRule and WaitRule when card channel is quiet");
{
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-fresh",
      type: "fresh_update",
      occurredAt: "2026-06-01T00:00:00.000Z",
      daysAgo: 30,
      label: "Fresh Update",
    },
    {
      id: "event-card",
      type: "card",
      occurredAt: "2025-01-01T00:00:00.000Z",
      daysAgo: 150,
      label: "card",
    },
  ];
  const context = buildDecisionContext(
    normalized({ identity: "established", freshness: "current" }),
    relationshipContext,
  );
  const { candidates } = evaluateRules(context, ruleRegistry);
  expect("candidate count", candidates.length, 2);
  expect("rule ids", candidates.map((candidate) => candidate.ruleId).sort(), [
    "card_gap",
    "wait",
  ]);
}

section("live registry collects MemoryAccumulationRule and WaitRule when memory opportunity exists");
{
  const relationshipContext = minimalRelationshipContext();
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
  const context = buildDecisionContext(
    normalized({
      identity: "developing",
      history: "moderate",
      freshness: "current",
      momentum: "quiet",
    }),
    relationshipContext,
  );
  const { candidates } = evaluateRules(context, ruleRegistry);
  expect("candidate count", candidates.length, 2);
  expect("rule ids", candidates.map((candidate) => candidate.ruleId).sort(), [
    "memory_accumulation",
    "wait",
  ]);
}

section("live registry collects AccomplishmentFollowUpRule and WaitRule when accomplishment is recent");
{
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.freshUpdates = [
    {
      id: "fresh-1",
      questionKey: "recent_accomplishment",
      question: "What accomplishment would make them proud right now?",
      answer: "Promoted",
      createdAt: "2026-06-15T00:00:00.000Z",
      daysAgo: 15,
      ageCategory: "recent",
    },
  ];
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-fresh",
      type: "fresh_update",
      occurredAt: "2026-06-15T00:00:00.000Z",
      daysAgo: 15,
      label: "Recent accomplishment",
    },
    {
      id: "event-card",
      type: "card",
      occurredAt: "2026-05-01T00:00:00.000Z",
      daysAgo: 60,
      label: "card",
    },
  ];
  const context = buildDecisionContext(
    normalized({ freshness: "current", history: "rich" }),
    relationshipContext,
  );
  const { candidates } = evaluateRules(context, ruleRegistry);
  expect("candidate count", candidates.length, 2);
  expect("rule ids", candidates.map((candidate) => candidate.ruleId).sort(), [
    "accomplishment_follow_up",
    "wait",
  ]);
}

const READY_LIFE_EVENT = {
  type: "family_update",
  category: "family" as const,
  daysAgo: 30,
  followUpWindowDays: 30,
  followUpReady: true,
  source: "fresh_update" as const,
  capturedAt: "2026-06-01T00:00:00.000Z",
  classified: true,
  supported: true,
};

section("live registry collects LifeEventFollowUpRule and WaitRule when life event is ready");
{
  const context = buildDecisionContext(
    normalized({ freshness: "current" }),
    minimalRelationshipContext(),
    [READY_LIFE_EVENT],
  );
  const { candidates } = evaluateRules(context, ruleRegistry);
  expect("candidate count", candidates.length, 2);
  expect("rule ids", candidates.map((candidate) => candidate.ruleId).sort(), [
    "life_event_follow_up",
    "wait",
  ]);
}

section("evaluation entries cover full registry");
{
  const context = buildDecisionContext(normalized(), minimalRelationshipContext());
  const { candidates, entries } = evaluateRules(context, ruleRegistry);
  expect("candidate count", candidates.length, 1);
  expect("entry count", entries.length, ruleRegistry.length);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
