/**
 * Unit tests for brain/decision/buildDecisionContext.
 *
 * Pure module — no database, no orchestrator. Run with:
 *   npx tsx artifacts/api-server/src/__tests__/build-decision-context.test.ts
 */

import { buildDecisionContext } from "../brain/decision/index.js";
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

const PINNED_GENERATED_AT = "2026-07-01T00:00:00.000Z";

section("conservative defaults from empty normalized state");
{
  const ctx = buildDecisionContext(normalized(), minimalRelationshipContext());
  expect("identity empty", ctx.identity, "empty");
  expect("freshness unknown", ctx.freshness, "unknown");
  expect("history none", ctx.history, "none");
  expect("writing none", ctx.writing, "none");
  expect("engagement none", ctx.engagement, "none");
  expect("momentum new", ctx.momentum, "new");
  expect("relationshipMaturity mirrors identity", ctx.relationshipMaturity, "empty");
  expect("informationFreshness mirrors freshness", ctx.informationFreshness, "unknown");
  expect("writingReadiness mirrors writing", ctx.writingReadiness, "none");
  expect("engagementLevel mirrors engagement", ctx.engagementLevel, "none");
  expect("relationshipMomentum mirrors momentum", ctx.relationshipMomentum, "new");
  expect("timelineHistory mirrors history", ctx.timelineHistory, "none");
  expect("signalCount 0", ctx.derivedFrom.signalCount, 0);
  expect("sourcesPresent []", ctx.derivedFrom.sourcesPresent, []);
  expect("birthdayDaysAway null without birthday", ctx.birthdayDaysAway, null);
  expect("anniversaryDaysAway null without anniversary", ctx.anniversaryDaysAway, null);
  expect("relationshipType from relationship", ctx.relationshipType, "Friend");
  expect("valentinesDaysAway computed", ctx.valentinesDaysAway, 228);
  expect("preparationWindowDays from delivery", ctx.preparationWindowDays, 14);
  expect(
    "lastRelationshipActivityDaysAgo null when timeline empty",
    ctx.lastRelationshipActivityDaysAgo,
    null,
  );
  expect("lastCardActivityDaysAgo null when no card events", ctx.lastCardActivityDaysAgo, null);
  expect("mostRecentFreshUpdateDaysAgo null when no fresh updates", ctx.mostRecentFreshUpdateDaysAgo, null);
  expect(
    "mostRecentFreshUpdateQuestionKey null when no fresh updates",
    ctx.mostRecentFreshUpdateQuestionKey,
    null,
  );
}

section("full rich state maps decision vocabulary 1:1");
{
  const input = normalized({
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
  const ctx = buildDecisionContext(input, minimalRelationshipContext());

  expect("identity established", ctx.identity, "established");
  expect("relationshipMaturity established", ctx.relationshipMaturity, "established");
  expect("informationFreshness current", ctx.informationFreshness, "current");
  expect("writingReadiness high", ctx.writingReadiness, "high");
  expect("engagementLevel moderate", ctx.engagementLevel, "moderate");
  expect("relationshipMomentum active", ctx.relationshipMomentum, "active");
  expect("timelineHistory rich", ctx.timelineHistory, "rich");
  expect("signalCount 70", ctx.derivedFrom.signalCount, 70);
  expect(
    "sourcesPresent",
    ctx.derivedFrom.sourcesPresent,
    ["profile_completeness", "relationship_timeline"],
  );
  expect(
    "normalizedSnapshot",
    ctx.derivedFrom.normalizedSnapshot,
    {
      identity: "established",
      freshness: "current",
      history: "rich",
      writing: "high",
      engagement: "moderate",
      momentum: "active",
    },
  );
}

section("sourcesPresent is a copy (mutation safe)");
{
  const sources = ["engagement"];
  const input = normalized({
    derivedFrom: { signalCount: 1, sourcesPresent: sources },
  });
  const ctx = buildDecisionContext(input, minimalRelationshipContext());
  sources.push("mutated");
  expect("builder does not retain caller array", ctx.derivedFrom.sourcesPresent, [
    "engagement",
  ]);
}

section("birthdayDaysAway computed from RelationshipContext");
{
  const ctx = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: PINNED_GENERATED_AT,
      birthday: "1988-07-08",
      previewDays: 14,
    }),
  );
  expect("birthday 7 days away", ctx.birthdayDaysAway, 7);
  expect("preparationWindowDays", ctx.preparationWindowDays, 14);
}

section("birthday outside window");
{
  const ctx = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: PINNED_GENERATED_AT,
      birthday: "1988-08-01",
      previewDays: 14,
    }),
  );
  expect("birthday 31 days away", ctx.birthdayDaysAway, 31);
}

section("no birthday → birthdayDaysAway null");
{
  const ctx = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({ birthday: null }),
  );
  expect("birthdayDaysAway null", ctx.birthdayDaysAway, null);
}

section("missing previewDays → preparationWindowDays null");
{
  const ctx = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({ previewDays: null }),
  );
  expect("preparationWindowDays null", ctx.preparationWindowDays, null);
}

section("year rollover uses next calendar occurrence");
{
  const ctx = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: "2026-12-01T00:00:00.000Z",
      birthday: "1988-04-12",
      previewDays: 14,
    }),
  );
  expect("birthday rolls to next year", ctx.birthdayDaysAway, 132);
}

section("anniversaryDaysAway computed from RelationshipContext");
{
  const ctx = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: PINNED_GENERATED_AT,
      anniversary: "2015-07-08",
      previewDays: 14,
    }),
  );
  expect("anniversary 7 days away", ctx.anniversaryDaysAway, 7);
}

section("anniversary outside window");
{
  const ctx = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: PINNED_GENERATED_AT,
      anniversary: "2015-08-01",
      previewDays: 14,
    }),
  );
  expect("anniversary 31 days away", ctx.anniversaryDaysAway, 31);
}

section("no anniversary → anniversaryDaysAway null");
{
  const ctx = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({ anniversary: null }),
  );
  expect("anniversaryDaysAway null", ctx.anniversaryDaysAway, null);
}

section("relationshipType pass-through from RelationshipContext");
{
  const ctx = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({ relationshipType: "Wife" }),
  );
  expect("relationshipType Wife", ctx.relationshipType, "Wife");
}

section("valentinesDaysAway computed from generatedAt");
{
  const ctx = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: "2026-02-01T00:00:00.000Z",
    }),
  );
  expect("valentines 13 days away", ctx.valentinesDaysAway, 13);
}

section("valentinesDaysAway outside window distance");
{
  const ctx = buildDecisionContext(
    normalized(),
    minimalRelationshipContext({
      generatedAt: "2026-01-01T00:00:00.000Z",
    }),
  );
  expect("valentines 44 days away", ctx.valentinesDaysAway, 44);
}

section("missing relationship → relationshipType null");
{
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.relationship = null;
  const ctx = buildDecisionContext(normalized(), relationshipContext);
  expect("relationshipType null", ctx.relationshipType, null);
}

section("relationship timeline activity is exposed as lastRelationshipActivityDaysAgo");
{
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-1",
      type: "fresh_update",
      occurredAt: "2026-06-01T00:00:00.000Z",
      daysAgo: 42,
      label: "Fresh Update",
    },
  ];
  const ctx = buildDecisionContext(normalized(), relationshipContext);
  expect("lastRelationshipActivityDaysAgo 42", ctx.lastRelationshipActivityDaysAgo, 42);
}

section("lastCardActivityDaysAgo uses newest card timeline event");
{
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-1",
      type: "fresh_update",
      occurredAt: "2026-06-15T00:00:00.000Z",
      daysAgo: 30,
      label: "Fresh Update",
    },
    {
      id: "event-2",
      type: "card",
      occurredAt: "2026-01-01T00:00:00.000Z",
      daysAgo: 150,
      label: "birthday card",
    },
    {
      id: "event-3",
      type: "card",
      occurredAt: "2025-01-01T00:00:00.000Z",
      daysAgo: 500,
      label: "older card",
    },
  ];
  const ctx = buildDecisionContext(
    normalized({ identity: "established", freshness: "current" }),
    relationshipContext,
  );
  expect("lastCardActivityDaysAgo 150", ctx.lastCardActivityDaysAgo, 150);
  expect("lastRelationshipActivityDaysAgo 30", ctx.lastRelationshipActivityDaysAgo, 30);
}

section("most recent fresh update facts come from freshUpdates array");
{
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.freshUpdates = [
    {
      id: "fresh-newer",
      questionKey: "recent_accomplishment",
      question: "What accomplishment would make them proud right now?",
      answer: "Promoted",
      createdAt: "2026-06-20T00:00:00.000Z",
      daysAgo: 11,
      ageCategory: "recent",
    },
    {
      id: "fresh-older",
      questionKey: "current_excitement",
      question: "What are they excited about?",
      answer: "Vacation",
      createdAt: "2026-05-01T00:00:00.000Z",
      daysAgo: 61,
      ageCategory: "recent",
    },
  ];
  const ctx = buildDecisionContext(normalized(), relationshipContext);
  expect("mostRecentFreshUpdateDaysAgo 11", ctx.mostRecentFreshUpdateDaysAgo, 11);
  expect(
    "mostRecentFreshUpdateQuestionKey recent_accomplishment",
    ctx.mostRecentFreshUpdateQuestionKey,
    "recent_accomplishment",
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
