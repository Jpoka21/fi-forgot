/**
 * Unit tests for brain/decision/rules/runRuleEngine and public decide().
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/rule-engine.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { decide } from "../brain/decision/decide.js";
import { decideInternal } from "../brain/decision/decideInternal.js";
import { runRuleEngine } from "../brain/decision/rules/runRuleEngine.js";
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

section("runRuleEngine preserves scaffold for empty DecisionContext");
{
  const context = buildDecisionContext(normalized(), minimalRelationshipContext());
  const result = runRuleEngine(context);
  expect("sourceRuleId", result.sourceRuleId, "wait");
  expect("decideResult", result.decideResult, SCAFFOLD);
  expect(
    "serialized decideResult",
    JSON.stringify(result.decideResult),
    JSON.stringify(SCAFFOLD),
  );
}

section("runRuleEngine preserves scaffold for rich DecisionContext");
{
  const context = buildDecisionContext(
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
  );
  const result = runRuleEngine(context);
  expect("sourceRuleId", result.sourceRuleId, "wait");
  expect("decideResult", result.decideResult, SCAFFOLD);
}

section("decideInternal matches runRuleEngine decideResult");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext(),
  );
  const internal = decideInternal(context);
  const engine = runRuleEngine(context);
  expect("decideResult parity", internal.decideResult, engine.decideResult);
  expect("sourceRuleId parity", internal.sourceRuleId, engine.sourceRuleId);
}

section("decide() serialized output matches scaffold for non-stale contexts");
{
  const empty = buildDecisionContext(normalized(), minimalRelationshipContext());
  const rich = buildDecisionContext(
    normalized({
      identity: "established",
      freshness: "current",
      history: "rich",
      writing: "high",
      engagement: "moderate",
      momentum: "active",
    }),
    minimalRelationshipContext(),
  );
  expect("decide empty serialized", JSON.stringify(decide(empty)), JSON.stringify(SCAFFOLD));
  expect("decide rich serialized", JSON.stringify(decide(rich)), JSON.stringify(SCAFFOLD));
  expect("decide empty === decide rich", JSON.stringify(decide(empty)), JSON.stringify(decide(rich)));
}

const FRESH_UPDATE_RESULT = {
  decision: { outcome: "ask_question" },
  confidence: 52,
  reasons: ["information_stale", "fresh_update_due"],
  debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
};

section("runRuleEngine returns ask_question for stale freshness");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext(),
  );
  const result = runRuleEngine(context);
  expect("sourceRuleId", result.sourceRuleId, "fresh_update");
  expect("decideResult", result.decideResult, FRESH_UPDATE_RESULT);
  expect(
    "serialized fresh update",
    JSON.stringify(result.decideResult),
    JSON.stringify(FRESH_UPDATE_RESULT),
  );
}

section("decide() returns ask_question only for stale freshness");
{
  const stale = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext(),
  );
  const unknown = buildDecisionContext(
    normalized({ freshness: "unknown" }),
    minimalRelationshipContext(),
  );
  expect("stale serialized", JSON.stringify(decide(stale)), JSON.stringify(FRESH_UPDATE_RESULT));
  expect("unknown serialized", JSON.stringify(decide(unknown)), JSON.stringify(SCAFFOLD));
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

section("runRuleEngine returns birthday ask_question when in preparation window");
{
  const context = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      birthday: "1988-07-08",
      previewDays: 14,
    }),
  );
  const result = runRuleEngine(context);
  expect("sourceRuleId", result.sourceRuleId, "birthday");
  expect("decideResult", result.decideResult, BIRTHDAY_RESULT);
}

section("birthday beats stale freshness in runRuleEngine");
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
  expect("sourceRuleId", result.sourceRuleId, "birthday");
}

const ANNIVERSARY_RESULT = {
  decision: { outcome: "ask_question" },
  confidence: 60,
  reasons: ["anniversary_preparation_window"],
  debugNotes: [
    "AnniversaryRule matched",
    "anniversary days away: 7",
    "preparation window: 14",
  ],
};

section("runRuleEngine returns anniversary ask_question when in preparation window");
{
  const context = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      anniversary: "2015-07-08",
      previewDays: 14,
    }),
  );
  const result = runRuleEngine(context);
  expect("sourceRuleId", result.sourceRuleId, "anniversary");
  expect("decideResult", result.decideResult, ANNIVERSARY_RESULT);
}

section("anniversary beats stale freshness in runRuleEngine");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      anniversary: "2015-07-08",
      previewDays: 14,
    }),
  );
  const result = runRuleEngine(context);
  expect("sourceRuleId", result.sourceRuleId, "anniversary");
}

section("birthday beats anniversary when both in window");
{
  const context = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      birthday: "1988-07-08",
      anniversary: "2015-07-08",
      previewDays: 14,
    }),
  );
  const result = runRuleEngine(context);
  expect("sourceRuleId", result.sourceRuleId, "birthday");
}

const VALENTINES_RESULT = {
  decision: { outcome: "ask_question" },
  confidence: 60,
  reasons: ["valentines_preparation_window"],
  debugNotes: [
    "ValentinesDayRule matched",
    "valentines days away: 13",
    "preparation window: 14",
  ],
};

section("runRuleEngine returns valentines ask_question when in preparation window");
{
  const context = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: "2026-02-01T00:00:00.000Z",
      relationshipType: "Wife",
      previewDays: 14,
    }),
  );
  const result = runRuleEngine(context);
  expect("sourceRuleId", result.sourceRuleId, "valentines_day");
  expect("decideResult", result.decideResult, VALENTINES_RESULT);
}

section("valentines beats stale freshness in runRuleEngine");
{
  const context = buildDecisionContext(
    normalized({ freshness: "stale" }),
    minimalRelationshipContext({
      generatedAt: "2026-02-01T00:00:00.000Z",
      relationshipType: "Wife",
      previewDays: 14,
    }),
  );
  const result = runRuleEngine(context);
  expect("sourceRuleId", result.sourceRuleId, "valentines_day");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
