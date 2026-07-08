/**
 * Unit tests for brain/decision/rules/inactivityRule.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/inactivity-rule.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { inactivityRule } from "../brain/decision/rules/inactivityRule.js";
import { RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS } from "../brain/config/relationshipThresholds.js";
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

const INACTIVITY_CANDIDATE = {
  ruleId: "inactivity",
  priority: 41,
  confidence: 48,
  decision: { outcome: "ask_question" },
  reasons: ["relationship_inactive"],
  debugNotes: [
    "InactivityRule matched",
    `last relationship activity days ago: ${RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS + 1}`,
    `threshold days: ${RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS}`,
  ],
};

section("null activity does not match");
{
  const ctx = buildDecisionContext(normalized(), minimalRelationshipContext());
  expect("no match", inactivityRule.evaluate(ctx), null);
}

section("at or below threshold does not match");
{
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-1",
      type: "card",
      occurredAt: "2026-06-01T00:00:00.000Z",
      daysAgo: RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS,
      label: "card",
    },
  ];
  const ctx = buildDecisionContext(normalized(), relationshipContext);
  expect("at threshold", inactivityRule.evaluate(ctx), null);
}

section("above threshold matches");
{
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-1",
      type: "card",
      occurredAt: "2026-06-01T00:00:00.000Z",
      daysAgo: RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS + 1,
      label: "card",
    },
  ];
  const ctx = buildDecisionContext(normalized(), relationshipContext);
  expect("matches", inactivityRule.evaluate(ctx), INACTIVITY_CANDIDATE);
}

section("matches regardless of freshness state");
{
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-1",
      type: "card",
      occurredAt: "2026-06-01T00:00:00.000Z",
      daysAgo: RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS + 1,
      label: "card",
    },
  ];
  const stale = buildDecisionContext(
    normalized({ freshness: "stale" }),
    relationshipContext,
  );
  expect("stale still matches", inactivityRule.evaluate(stale), INACTIVITY_CANDIDATE);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}

