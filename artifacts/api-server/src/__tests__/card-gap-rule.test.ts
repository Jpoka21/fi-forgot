/**
 * Unit tests for brain/decision/rules/cardGapRule.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/card-gap-rule.test.ts
 */

import { CARD_GAP_THRESHOLD_DAYS } from "../brain/config/opportunityThresholds.js";
import { RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS } from "../brain/config/relationshipThresholds.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { cardGapRule } from "../brain/decision/rules/cardGapRule.js";
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

function cardGapRelationshipContext(
  cardDaysAgo: number,
  activityDaysAgo: number = 30,
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
      occurredAt: "2025-01-01T00:00:00.000Z",
      daysAgo: cardDaysAgo,
      label: "birthday card",
    },
  ];
  return relationshipContext;
}

const MATCH_CANDIDATE = {
  ruleId: "card_gap",
  priority: 35,
  confidence: 45,
  decision: { outcome: "ask_question" },
  reasons: ["card_channel_quiet"],
  debugNotes: [
    "CardGapRule matched",
    `last card activity days ago: ${CARD_GAP_THRESHOLD_DAYS + 1}`,
    `card gap threshold days: ${CARD_GAP_THRESHOLD_DAYS}`,
    "last relationship activity days ago: 30",
  ],
};

section("CardGapRule matches when card channel is quiet but relationship is active");
{
  const ctx = buildDecisionContext(
    normalized({ identity: "established", freshness: "current" }),
    cardGapRelationshipContext(CARD_GAP_THRESHOLD_DAYS + 1),
  );
  expect("matches", cardGapRule.evaluate(ctx), MATCH_CANDIDATE);
}

section("at threshold does not match");
{
  const ctx = buildDecisionContext(
    normalized({ identity: "established", freshness: "current" }),
    cardGapRelationshipContext(CARD_GAP_THRESHOLD_DAYS),
  );
  expect("at threshold", cardGapRule.evaluate(ctx), null);
}

section("stale freshness does not match");
{
  const ctx = buildDecisionContext(
    normalized({ identity: "established", freshness: "stale" }),
    cardGapRelationshipContext(CARD_GAP_THRESHOLD_DAYS + 1),
  );
  expect("stale", cardGapRule.evaluate(ctx), null);
}

section("inactive relationship does not match");
{
  const ctx = buildDecisionContext(
    normalized({ identity: "established", freshness: "current" }),
    cardGapRelationshipContext(
      CARD_GAP_THRESHOLD_DAYS + 1,
      RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS + 1,
    ),
  );
  expect("inactive", cardGapRule.evaluate(ctx), null);
}

section("thin identity does not match");
{
  const ctx = buildDecisionContext(
    normalized({ identity: "thin", freshness: "current" }),
    cardGapRelationshipContext(CARD_GAP_THRESHOLD_DAYS + 1),
  );
  expect("thin identity", cardGapRule.evaluate(ctx), null);
}

section("no card history and no writing does not match");
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
  const ctx = buildDecisionContext(
    normalized({ identity: "established", freshness: "current", writing: "none" }),
    relationshipContext,
  );
  expect("no card and no writing", cardGapRule.evaluate(ctx), null);
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
      daysAgo: 30,
      label: "Fresh Update",
    },
    {
      id: "event-card",
      type: "card",
      occurredAt: "2025-01-01T00:00:00.000Z",
      daysAgo: CARD_GAP_THRESHOLD_DAYS + 1,
      label: "card",
    },
  ];
  const ctx = buildDecisionContext(
    normalized({ identity: "established", freshness: "current" }),
    relationshipContext,
  );
  expect("birthday in window", cardGapRule.evaluate(ctx), null);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
