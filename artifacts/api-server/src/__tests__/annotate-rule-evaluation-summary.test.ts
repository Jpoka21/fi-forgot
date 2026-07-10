/**
 * Unit tests for brain/decision/rules/annotateRuleEvaluationSummary.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/annotate-rule-evaluation-summary.test.ts
 */

import { annotateRuleEvaluationSummary } from "../brain/decision/rules/annotateRuleEvaluationSummary.js";
import type { RuleEvaluationEntry } from "../brain/decision/rules/ruleEvaluationTypes.js";
import type { RuleCandidate } from "../brain/decision/rules/types.js";

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

const waitCandidate: RuleCandidate = {
  ruleId: "wait",
  priority: 0,
  confidence: 0,
  decision: { outcome: "wait" },
  reasons: ["read_only_scaffold", "no_behavior_change"],
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

const freshUpdateCandidate: RuleCandidate = {
  ruleId: "fresh_update",
  priority: 40,
  confidence: 52,
  decision: { outcome: "ask_question" },
  reasons: ["information_stale", "fresh_update_due"],
  debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
};

const birthdayCandidate: RuleCandidate = {
  ruleId: "birthday",
  priority: 50,
  confidence: 60,
  decision: { outcome: "ask_question" },
  reasons: ["event_briefing_incomplete"],
  debugNotes: ["BirthdayRule matched"],
};

function matchedEntry(candidate: RuleCandidate, registryIndex: number): RuleEvaluationEntry {
  return {
    ruleId: candidate.ruleId,
    registryIndex,
    matched: true,
    candidate,
    priority: candidate.priority,
    confidence: candidate.confidence,
    outcome: candidate.decision.outcome,
    reasons: candidate.reasons,
    debugNotes: candidate.debugNotes,
    resolutionStatus: "not_matched",
    lostToRuleId: null,
    lostBecause: null,
  };
}

function notMatchedEntry(ruleId: string, registryIndex: number): RuleEvaluationEntry {
  return {
    ruleId,
    registryIndex,
    matched: false,
    candidate: null,
    priority: null,
    confidence: null,
    outcome: null,
    reasons: ["outside_preparation_window"],
    debugNotes: [],
    resolutionStatus: "not_matched",
    lostToRuleId: null,
    lostBecause: null,
  };
}

section("winner and matched losers are annotated");
{
  const entries = [
    matchedEntry(birthdayCandidate, 0),
    notMatchedEntry("anniversary", 1),
    matchedEntry(freshUpdateCandidate, 2),
    matchedEntry(waitCandidate, 3),
  ];
  const annotated = annotateRuleEvaluationSummary(entries, birthdayCandidate);
  expect("birthday winner", annotated[0]?.resolutionStatus, "winner");
  expect("anniversary not matched", annotated[1]?.resolutionStatus, "not_matched");
  expect("fresh_update lost", annotated[2]?.resolutionStatus, "matched_lost");
  expect("fresh_update lost to birthday", annotated[2]?.lostToRuleId, "birthday");
  expect("fresh_update lower priority", annotated[2]?.lostBecause, "lower_priority");
  expect("wait lost", annotated[3]?.resolutionStatus, "matched_lost");
}

section("confidence tie-break loss reason");
{
  const alpha: RuleCandidate = {
    ruleId: "alpha",
    priority: 10,
    confidence: 50,
    decision: { outcome: "wait" },
    reasons: ["alpha"],
    debugNotes: ["alpha"],
  };
  const beta: RuleCandidate = {
    ruleId: "beta",
    priority: 10,
    confidence: 40,
    decision: { outcome: "wait" },
    reasons: ["beta"],
    debugNotes: ["beta"],
  };
  const annotated = annotateRuleEvaluationSummary(
    [matchedEntry(alpha, 0), matchedEntry(beta, 1)],
    alpha,
  );
  expect("beta lost on confidence", annotated[1]?.lostBecause, "lower_confidence");
}

section("ruleId tie-break loss reason");
{
  const alpha: RuleCandidate = {
    ruleId: "alpha",
    priority: 10,
    confidence: 50,
    decision: { outcome: "wait" },
    reasons: ["alpha"],
    debugNotes: ["alpha"],
  };
  const beta: RuleCandidate = {
    ruleId: "beta",
    priority: 10,
    confidence: 50,
    decision: { outcome: "wait" },
    reasons: ["beta"],
    debugNotes: ["beta"],
  };
  const annotated = annotateRuleEvaluationSummary(
    [matchedEntry(alpha, 0), matchedEntry(beta, 1)],
    alpha,
  );
  expect("beta lost on tie break", annotated[1]?.lostBecause, "tie_break");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
