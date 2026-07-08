/**
 * Unit tests for brain/decision/decide.
 *
 * Proves decide() remains the frozen scaffold for any DecisionContext.
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/decide.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { decide } from "../brain/decision/decide.js";
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

const SCAFFOLD = {
  decision: { outcome: "wait" },
  confidence: 0,
  reasons: ["read_only_scaffold", "no_behavior_change"],
  debugNotes: ["Phase 1 read-only scaffold — decision engine not yet active"],
};

section("empty DecisionContext → frozen scaffold");
{
  const empty = buildDecisionContext(normalized(), minimalRelationshipContext());
  const result = decide(empty);
  expect("outcome wait", result.decision.outcome, "wait");
  expect("confidence 0", result.confidence, 0);
  expect("reasons", result.reasons, SCAFFOLD.reasons);
  expect("debugNotes", result.debugNotes, SCAFFOLD.debugNotes);
  expect("full DecideResult", result, SCAFFOLD);
}

section("rich DecisionContext → identical scaffold");
{
  const rich = buildDecisionContext(
    normalized({
      identity: "established",
      freshness: "current",
      history: "rich",
      writing: "high",
      engagement: "high",
      momentum: "active",
      derivedFrom: {
        signalCount: 70,
        sourcesPresent: ["profile_completeness", "relationship_timeline"],
      },
    }),
    minimalRelationshipContext(),
  );
  const result = decide(rich);
  expect("outcome wait", result.decision.outcome, "wait");
  expect("confidence 0", result.confidence, 0);
  expect("reasons", result.reasons, SCAFFOLD.reasons);
  expect("debugNotes", result.debugNotes, SCAFFOLD.debugNotes);
  expect("full DecideResult", result, SCAFFOLD);
}

section("empty and rich non-stale DecisionContext return identical wait results");
{
  const emptyResult = decide(
    buildDecisionContext(normalized(), minimalRelationshipContext()),
  );
  const richResult = decide(
    buildDecisionContext(
      normalized({
        identity: "established",
        freshness: "current",
        history: "rich",
        writing: "high",
        engagement: "moderate",
        momentum: "active",
        derivedFrom: { signalCount: 70, sourcesPresent: ["engagement"] },
      }),
      minimalRelationshipContext(),
    ),
  );
  expect("empty === rich", emptyResult, richResult);
}

const FRESH_UPDATE_RESULT = {
  decision: { outcome: "ask_question" },
  confidence: 52,
  reasons: ["information_stale", "fresh_update_due"],
  debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
};

section("stale DecisionContext → ask_question");
{
  const stale = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext(),
  );
  const result = decide(stale);
  expect("outcome ask_question", result.decision.outcome, "ask_question");
  expect("confidence 52", result.confidence, 52);
  expect("reasons", result.reasons, FRESH_UPDATE_RESULT.reasons);
  expect("debugNotes", result.debugNotes, FRESH_UPDATE_RESULT.debugNotes);
  expect("full DecideResult", result, FRESH_UPDATE_RESULT);
  expect(
    "serialized fresh update",
    JSON.stringify(result),
    JSON.stringify(FRESH_UPDATE_RESULT),
  );
}

section("stale vs unknown freshness produce different outcomes");
{
  const staleResult = decide(
    buildDecisionContext(
      normalized({ freshness: "stale" }),
      minimalRelationshipContext(),
    ),
  );
  const unknownResult = decide(
    buildDecisionContext(
      normalized({ freshness: "unknown" }),
      minimalRelationshipContext(),
    ),
  );
  expect("stale is ask_question", staleResult.decision.outcome, "ask_question");
  expect("unknown is wait", unknownResult.decision.outcome, "wait");
  expect("outcomes differ", staleResult.decision.outcome !== unknownResult.decision.outcome, true);
}

const BIRTHDAY_RESULT = {
  decision: { outcome: "ask_question" },
  confidence: 60,
  reasons: ["birthday_preparation_window"],
  debugNotes: [
    "BirthdayRule matched",
    "birthday days away: 7",
    "preparation window: 14",
  ],
};

section("birthday in preparation window → ask_question");
{
  const context = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      birthday: "1988-07-08",
      previewDays: 14,
    }),
  );
  const result = decide(context);
  expect("outcome ask_question", result.decision.outcome, "ask_question");
  expect("confidence 60", result.confidence, 60);
  expect("reasons", result.reasons, BIRTHDAY_RESULT.reasons);
  expect("debugNotes", result.debugNotes, BIRTHDAY_RESULT.debugNotes);
  expect("full DecideResult", result, BIRTHDAY_RESULT);
}

section("birthday in window beats stale freshness");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      birthday: "1988-07-08",
      previewDays: 14,
    }),
  );
  const result = decide(context);
  expect("birthday wins over fresh_update", result, BIRTHDAY_RESULT);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
