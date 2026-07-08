/**
 * Unit tests for brain/decision/rules/accomplishmentFollowUpRule.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/accomplishment-follow-up-rule.test.ts
 */

import { ACCOMPLISHMENT_FOLLOW_UP_THRESHOLD_DAYS } from "../brain/config/opportunityThresholds.js";
import { RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS } from "../brain/config/relationshipThresholds.js";
import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { accomplishmentFollowUpRule } from "../brain/decision/rules/accomplishmentFollowUpRule.js";
import type { NormalizedRelationshipState } from "../brain/normalization/index.js";
import type { FreshUpdate } from "../services/recipient-context.js";
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

function freshUpdate(
  daysAgo: number,
  questionKey: string = "recent_accomplishment",
): FreshUpdate {
  return {
    id: "fresh-update-1",
    questionKey,
    question: "What accomplishment would make them proud right now?",
    answer: "Promoted to senior role",
    createdAt: "2026-06-15T00:00:00.000Z",
    daysAgo,
    ageCategory: daysAgo < 90 ? "recent" : "mid",
  };
}

function accomplishmentContext(
  normalizedOverrides: Partial<NormalizedRelationshipState> = {},
  freshUpdateDaysAgo: number = 15,
  activityDaysAgo: number = 15,
  questionKey: string = "recent_accomplishment",
) {
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.freshUpdates = [freshUpdate(freshUpdateDaysAgo, questionKey)];
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-fresh",
      type: "fresh_update",
      occurredAt: "2026-06-15T00:00:00.000Z",
      daysAgo: activityDaysAgo,
      label: "Recent accomplishment",
    },
    {
      id: "event-card",
      type: "card",
      occurredAt: "2026-05-01T00:00:00.000Z",
      daysAgo: 60,
      label: "birthday card",
    },
  ];
  return buildDecisionContext(
    normalized({
      freshness: "current",
      ...normalizedOverrides,
    }),
    relationshipContext,
  );
}

const MATCH_CANDIDATE = {
  ruleId: "accomplishment_follow_up",
  priority: 33,
  confidence: 43,
  decision: { outcome: "ask_question" },
  reasons: ["accomplishment_follow_up_due"],
  debugNotes: [
    "AccomplishmentFollowUpRule matched",
    "most recent fresh update question key: recent_accomplishment",
    `most recent fresh update days ago: 15`,
    `accomplishment follow up threshold days: ${ACCOMPLISHMENT_FOLLOW_UP_THRESHOLD_DAYS}`,
    "freshness: current",
    "last relationship activity days ago: 15",
  ],
};

section("AccomplishmentFollowUpRule matches when recent accomplishment is within window");
{
  const ctx = accomplishmentContext();
  expect("matches", accomplishmentFollowUpRule.evaluate(ctx), MATCH_CANDIDATE);
}

section("card sent after accomplishment still matches on fresh update recency");
{
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.freshUpdates = [freshUpdate(20)];
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-card",
      type: "card",
      occurredAt: "2026-06-29T00:00:00.000Z",
      daysAgo: 2,
      label: "congrats card",
    },
    {
      id: "event-fresh",
      type: "fresh_update",
      occurredAt: "2026-06-11T00:00:00.000Z",
      daysAgo: 20,
      label: "Recent accomplishment",
    },
  ];
  const ctx = buildDecisionContext(
    normalized({ freshness: "current" }),
    relationshipContext,
  );
  const result = accomplishmentFollowUpRule.evaluate(ctx);
  expect("matches", result?.ruleId, "accomplishment_follow_up");
  expect("uses fresh update days ago", result?.debugNotes[2], "most recent fresh update days ago: 20");
}

section("accomplishment outside window does not match");
{
  const ctx = accomplishmentContext({}, ACCOMPLISHMENT_FOLLOW_UP_THRESHOLD_DAYS + 1);
  expect("outside window", accomplishmentFollowUpRule.evaluate(ctx), null);
}

section("non-accomplishment fresh update does not match");
{
  const ctx = accomplishmentContext({}, 15, 15, "current_excitement");
  expect("wrong question key", accomplishmentFollowUpRule.evaluate(ctx), null);
}

section("stale freshness does not match");
{
  const ctx = accomplishmentContext({ freshness: "stale" });
  expect("stale", accomplishmentFollowUpRule.evaluate(ctx), null);
}

section("inactive relationship does not match");
{
  const ctx = accomplishmentContext({}, 15, RELATIONSHIP_INACTIVITY_THRESHOLD_DAYS + 1);
  expect("inactive", accomplishmentFollowUpRule.evaluate(ctx), null);
}

section("calendar preparation window does not match");
{
  const relationshipContext = minimalRelationshipContext({
    generatedAt: "2026-07-01T00:00:00.000Z",
    birthday: "1988-07-08",
    previewDays: 14,
  });
  relationshipContext.freshUpdates = [freshUpdate(15)];
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-fresh",
      type: "fresh_update",
      occurredAt: "2026-06-15T00:00:00.000Z",
      daysAgo: 15,
      label: "Recent accomplishment",
    },
  ];
  const ctx = buildDecisionContext(
    normalized({ freshness: "current" }),
    relationshipContext,
  );
  expect("birthday in window", accomplishmentFollowUpRule.evaluate(ctx), null);
}

section("no fresh updates does not match");
{
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-fresh",
      type: "fresh_update",
      occurredAt: "2026-06-15T00:00:00.000Z",
      daysAgo: 15,
      label: "Recent accomplishment",
    },
  ];
  const ctx = buildDecisionContext(
    normalized({ freshness: "current" }),
    relationshipContext,
  );
  expect("no fresh update facts", accomplishmentFollowUpRule.evaluate(ctx), null);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
