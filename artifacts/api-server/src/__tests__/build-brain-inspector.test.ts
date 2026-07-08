/**
 * Unit tests for brain/debug/buildBrainInspector.
 *
 * Proves inspector pass-through of normalized, decisionContext, and actionPlan.
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/build-brain-inspector.test.ts
 */

import type { ActionPlan } from "../brain/action/actionPlanTypes.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { buildBrainInspector } from "../brain/debug/buildBrainInspector.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import type { RelationshipContextLoadResult } from "../brain/types.js";
import { BRAIN_CONTEXT_VERSION } from "../brain/types.js";
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

function normalizedState(
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

const WAIT_ACTION_PLAN: ActionPlan = {
  type: "wait",
  category: "none",
  priority: "low",
  sourceRuleId: "wait",
  primaryReason: "read_only_scaffold",
  reasons: ["read_only_scaffold", "no_behavior_change"],
  confidence: 0,
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

const FRESH_UPDATE_ACTION_PLAN: ActionPlan = {
  type: "ask_question",
  category: "fresh_update",
  priority: "medium",
  sourceRuleId: "fresh_update",
  primaryReason: "information_stale",
  reasons: ["information_stale", "fresh_update_due"],
  confidence: 52,
  debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
};

const normalized = normalizedState({
  identity: "established",
  freshness: "current",
  history: "rich",
  writing: "high",
  engagement: "moderate",
  momentum: "active",
  derivedFrom: {
    signalCount: 70,
    sourcesPresent: ["profile_completeness", "relationship_timeline"],
  },
});

const decisionContext = buildDecisionContext(normalized, minimalRelationshipContext());

const loadResult = {
  brainContextVersion: BRAIN_CONTEXT_VERSION,
  relationshipId: "recipient-1",
  userId: "user-1",
  loadedAt: "2026-01-01T00:00:00.000Z",
  relationshipContext: {
    generatedAt: "2026-01-01T00:00:00.000Z",
  },
} as RelationshipContextLoadResult;

const extraction = {
  availableSignals: [
    {
      source: "profile_completeness",
      label: "score",
      value: 80,
    },
  ],
  contributorGroups: [
    {
      key: "contributeProfileCompletenessSignals",
      title: "Profile Completeness",
      registryIndex: 0,
      sources: ["profile_completeness"],
      signalCount: 1,
      signals: [
        {
          source: "profile_completeness",
          label: "score",
          value: 80,
        },
      ],
    },
  ],
};

const decideResult = {
  decision: { outcome: "wait" as const },
  confidence: 0,
  reasons: ["read_only_scaffold", "no_behavior_change"],
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

section("pass-through normalized, decisionContext, and actionPlan from execution");
{
  const actionPlan = WAIT_ACTION_PLAN;
  const inspector = buildBrainInspector({
    loadResult,
    extraction,
    normalized,
    decisionContext,
    decideResult,
    actionPlan,
  });

  expect("normalized is same reference", inspector.normalized, normalized);
  expect("decisionContext is same reference", inspector.decisionContext, decisionContext);
  expect("actionPlan is same reference", inspector.actionPlan, actionPlan);
  expect("decisionContext identity", inspector.decisionContext.identity, "established");
  expect("derivedFrom signalCount", inspector.decisionContext.derivedFrom.signalCount, 70);
  expect(
    "derivedFrom sourcesPresent",
    inspector.decisionContext.derivedFrom.sourcesPresent,
    ["profile_completeness", "relationship_timeline"],
  );
}

section("wait actionPlan pass-through");
{
  const actionPlan = WAIT_ACTION_PLAN;
  const inspector = buildBrainInspector({
    loadResult,
    extraction,
    normalized,
    decisionContext,
    decideResult,
    actionPlan,
  });

  expect("actionPlan", inspector.actionPlan, WAIT_ACTION_PLAN);
  expect(
    "serialized wait actionPlan",
    JSON.stringify(inspector.actionPlan),
    JSON.stringify(WAIT_ACTION_PLAN),
  );
}

section("fresh_update actionPlan pass-through");
{
  const staleNormalized = normalizedState({ freshness: "stale" });
  const staleDecisionContext = buildDecisionContext(
    staleNormalized,
    minimalRelationshipContext(),
  );
  const actionPlan = FRESH_UPDATE_ACTION_PLAN;
  const inspector = buildBrainInspector({
    loadResult,
    extraction,
    normalized: staleNormalized,
    decisionContext: staleDecisionContext,
    decideResult: {
      decision: { outcome: "ask_question" },
      confidence: 52,
      reasons: ["information_stale", "fresh_update_due"],
      debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
    },
    actionPlan,
  });

  expect("actionPlan is same reference", inspector.actionPlan, actionPlan);
  expect("actionPlan", inspector.actionPlan, FRESH_UPDATE_ACTION_PLAN);
  expect(
    "serialized fresh update actionPlan",
    JSON.stringify(inspector.actionPlan),
    JSON.stringify(FRESH_UPDATE_ACTION_PLAN),
  );
}

section("inspector summary still derived from extraction and decide result");
{
  const inspector = buildBrainInspector({
    loadResult,
    extraction,
    normalized,
    decisionContext,
    decideResult,
    actionPlan: WAIT_ACTION_PLAN,
  });

  expect("signalCount", inspector.summary.signalCount, 1);
  expect("decisionOutcome", inspector.summary.decisionOutcome, "wait");
  expect("confidence", inspector.summary.confidence, 0);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
