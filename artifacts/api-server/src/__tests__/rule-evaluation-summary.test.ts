/**
 * Unit tests for brain/decision/rules/buildRuleEvaluationSummary.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/rule-evaluation-summary.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { evaluateRules } from "../brain/decision/rules/evaluateRules.js";
import { runRuleEngine } from "../brain/decision/rules/runRuleEngine.js";
import { ruleRegistry } from "../brain/decision/rules/ruleRegistry.js";
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

section("ruleEvaluation includes every registry rule in order");
{
  const context = buildDecisionContext(normalized(), minimalRelationshipContext());
  const result = runRuleEngine(context);
  expect("entry count", result.ruleEvaluation.entries.length, ruleRegistry.length);
  expect(
    "registry order",
    result.ruleEvaluation.entries.map((entry) => entry.ruleId),
    ruleRegistry.map((rule) => rule.id),
  );
}

section("exactly one winner entry matches sourceRuleId");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      birthday: "1988-07-08",
      previewDays: 14,
    }),
  );
  const result = runRuleEngine(context);
  const winners = result.ruleEvaluation.entries.filter(
    (entry) => entry.resolutionStatus === "winner",
  );
  expect("one winner", winners.length, 1);
  expect("winner ruleId", winners[0]?.ruleId, result.sourceRuleId);
  expect("winner is birthday", winners[0]?.ruleId, "birthday");
}

section("matched losers reference the winning rule");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      birthday: "1988-07-08",
      previewDays: 14,
    }),
  );
  const result = runRuleEngine(context);
  const freshUpdate = result.ruleEvaluation.entries.find(
    (entry) => entry.ruleId === "fresh_update",
  );
  expect("fresh_update matched", freshUpdate?.matched, true);
  expect("fresh_update lost", freshUpdate?.resolutionStatus, "matched_lost");
  expect("lost to birthday", freshUpdate?.lostToRuleId, "birthday");
  expect("lost because priority", freshUpdate?.lostBecause, "lower_priority");
}

section("no-match entries include rule-authored reasons");
{
  const context = buildDecisionContext(normalized(), minimalRelationshipContext());
  const result = runRuleEngine(context);
  const birthday = result.ruleEvaluation.entries.find((entry) => entry.ruleId === "birthday");
  expect("birthday not matched", birthday?.matched, false);
  expect("birthday reason", birthday?.reasons, ["outside_preparation_window"]);
}

section("candidate reference equality for matched rules");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext(),
  );
  const { candidates, entries } = evaluateRules(context, ruleRegistry);
  const waitEntry = entries.find((entry) => entry.ruleId === "wait");
  const waitCandidate = candidates.find((candidate) => candidate.ruleId === "wait");
  expect("wait candidate same reference", waitEntry?.candidate, waitCandidate);
}

section("summary has no winnerRuleId or evaluatedAt fields");
{
  const context = buildDecisionContext(normalized(), minimalRelationshipContext());
  const result = runRuleEngine(context);
  expect("no winnerRuleId", "winnerRuleId" in result.ruleEvaluation, false);
  expect("no evaluatedAt", "evaluatedAt" in result.ruleEvaluation, false);
}

section("card_gap evaluation entry records no-match reasons");
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
  ];
  const result = runRuleEngine(
    buildDecisionContext(
      normalized({ identity: "established", freshness: "current", writing: "none" }),
      relationshipContext,
    ),
  );
  const cardGap = result.ruleEvaluation.entries.find((entry) => entry.ruleId === "card_gap");
  expect("card_gap not matched", cardGap?.matched, false);
  expect("no card reason", cardGap?.reasons, ["no_card_history_and_no_writing"]);
}

section("memory_accumulation evaluation entry records match");
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
  const result = runRuleEngine(
    buildDecisionContext(
      normalized({
        identity: "developing",
        history: "moderate",
        freshness: "current",
        momentum: "quiet",
      }),
      relationshipContext,
    ),
  );
  const memoryAccumulation = result.ruleEvaluation.entries.find(
    (entry) => entry.ruleId === "memory_accumulation",
  );
  expect("memory_accumulation matched", memoryAccumulation?.matched, true);
  expect("memory_accumulation winner", memoryAccumulation?.resolutionStatus, "winner");
  expect("reasons", memoryAccumulation?.reasons, ["memory_inventory_thin"]);
}

section("decideResult unchanged from pre-explanation behavior for wait scaffold");
{
  const context = buildDecisionContext(normalized(), minimalRelationshipContext());
  const result = runRuleEngine(context);
  expect("sourceRuleId wait", result.sourceRuleId, "wait");
  expect("decideResult", result.decideResult, {
    decision: { outcome: "wait" },
    confidence: 0,
    reasons: ["read_only_scaffold", "no_behavior_change"],
    debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
  });
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
