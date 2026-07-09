/**
 * Unit tests for brain/decision/decideInternal.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/decide-internal.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { decideInternal } from "../brain/decision/decideInternal.js";
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

const FRESH_UPDATE_DECIDE = {
  decision: { outcome: "ask_question" },
  confidence: 52,
  reasons: ["information_stale", "fresh_update_due"],
  debugNotes: ["FreshUpdateRule matched", "freshness: stale"],
};

section("non-stale freshness → wait rule result");
{
  const result = decideInternal(buildDecisionContext(normalized(), minimalRelationshipContext()));
  expect("sourceRuleId", result.sourceRuleId, "wait");
  expect("decideResult", result.decideResult, SCAFFOLD);
}

section("stale freshness → fresh_update rule result");
{
  const result = decideInternal(
    buildDecisionContext(normalized({ freshness: "stale" }), minimalRelationshipContext()),
  );
  expect("sourceRuleId", result.sourceRuleId, "fresh_update");
  expect("decideResult", result.decideResult, FRESH_UPDATE_DECIDE);
}

section("inactive relationship timeline → inactivity rule result");
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
  const result = decideInternal(
    buildDecisionContext(normalized({ freshness: "stale" }), relationshipContext),
  );
  expect("sourceRuleId", result.sourceRuleId, "inactivity");
  expect("outcome ask_question", result.decideResult.decision.outcome, "ask_question");
  expect("reasons", result.decideResult.reasons, ["relationship_inactive"]);
}

section("birthday in window → birthday rule result");
{
  const result = decideInternal(
    buildDecisionContext(
      normalized(),
      minimalRelationshipContext({
        generatedAt: "2026-07-01T00:00:00.000Z",
        birthday: "1988-07-08",
        previewDays: 14,
      }),
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "birthday");
  expect("outcome ask_question", result.decideResult.decision.outcome, "ask_question");
  expect("reasons", result.decideResult.reasons, ["birthday_preparation_window"]);
}

section("birthday in window beats stale freshness");
{
  const result = decideInternal(
    buildDecisionContext(
      normalized({ freshness: "stale" }),
      minimalRelationshipContext({
        generatedAt: "2026-07-01T00:00:00.000Z",
        birthday: "1988-07-08",
        previewDays: 14,
      }),
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "birthday");
}

section("anniversary in window → anniversary rule result");
{
  const result = decideInternal(
    buildDecisionContext(
      normalized(),
      minimalRelationshipContext({
        generatedAt: "2026-07-01T00:00:00.000Z",
        anniversary: "2015-07-08",
        previewDays: 14,
      }),
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "anniversary");
  expect("outcome ask_question", result.decideResult.decision.outcome, "ask_question");
  expect("reasons", result.decideResult.reasons, ["anniversary_preparation_window"]);
}

section("anniversary in window beats stale freshness");
{
  const result = decideInternal(
    buildDecisionContext(
      normalized({ freshness: "stale" }),
      minimalRelationshipContext({
        generatedAt: "2026-07-01T00:00:00.000Z",
        anniversary: "2015-07-08",
        previewDays: 14,
      }),
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "anniversary");
}

section("birthday in window beats anniversary when both match");
{
  const result = decideInternal(
    buildDecisionContext(
      normalized(),
      minimalRelationshipContext({
        generatedAt: "2026-07-01T00:00:00.000Z",
        birthday: "1988-07-08",
        anniversary: "2015-07-08",
        previewDays: 14,
      }),
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "birthday");
}

section("valentines day in window → valentines_day rule result");
{
  const result = decideInternal(
    buildDecisionContext(
      normalized(),
      minimalRelationshipContext({
        generatedAt: "2026-02-01T00:00:00.000Z",
        relationshipType: "Wife",
        previewDays: 14,
      }),
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "valentines_day");
  expect("reasons", result.decideResult.reasons, ["valentines_preparation_window"]);
}

section("valentines day in window beats stale freshness");
{
  const result = decideInternal(
    buildDecisionContext(
      normalized({ freshness: "stale" }),
      minimalRelationshipContext({
        generatedAt: "2026-02-01T00:00:00.000Z",
        relationshipType: "Wife",
        previewDays: 14,
      }),
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "valentines_day");
}

section("card gap → card_gap rule result");
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
  const result = decideInternal(
    buildDecisionContext(
      normalized({ identity: "established", freshness: "current" }),
      relationshipContext,
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "card_gap");
  expect("outcome ask_question", result.decideResult.decision.outcome, "ask_question");
  expect("reasons", result.decideResult.reasons, ["card_channel_quiet"]);
}

section("stale freshness beats card gap");
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
  const result = decideInternal(
    buildDecisionContext(
      normalized({ identity: "established", freshness: "stale" }),
      relationshipContext,
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "fresh_update");
}

section("inactive relationship beats card gap");
{
  const relationshipContext = minimalRelationshipContext();
  relationshipContext.relationshipTimeline.events = [
    {
      id: "event-card",
      type: "card",
      occurredAt: "2025-01-01T00:00:00.000Z",
      daysAgo: 365,
      label: "card",
    },
  ];
  const result = decideInternal(
    buildDecisionContext(
      normalized({ identity: "established", freshness: "current" }),
      relationshipContext,
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "inactivity");
}

section("birthday in window beats card gap");
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
      daysAgo: 150,
      label: "card",
    },
  ];
  const result = decideInternal(
    buildDecisionContext(
      normalized({ identity: "established", freshness: "current" }),
      relationshipContext,
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "birthday");
}

section("memory accumulation → memory_accumulation rule result");
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
  const result = decideInternal(
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
  expect("sourceRuleId", result.sourceRuleId, "memory_accumulation");
  expect("outcome ask_question", result.decideResult.decision.outcome, "ask_question");
  expect("reasons", result.decideResult.reasons, ["memory_inventory_thin"]);
}

section("card gap beats memory accumulation");
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
      occurredAt: "2025-01-01T00:00:00.000Z",
      daysAgo: 150,
      label: "card",
    },
  ];
  const result = decideInternal(
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
  expect("sourceRuleId", result.sourceRuleId, "card_gap");
}

section("accomplishment follow up → accomplishment_follow_up rule result");
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
  const result = decideInternal(
    buildDecisionContext(
      normalized({ freshness: "current", history: "rich" }),
      relationshipContext,
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "accomplishment_follow_up");
  expect("outcome ask_question", result.decideResult.decision.outcome, "ask_question");
  expect("reasons", result.decideResult.reasons, ["accomplishment_follow_up_due"]);
}

section("card gap beats accomplishment follow up");
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
      occurredAt: "2025-01-01T00:00:00.000Z",
      daysAgo: 150,
      label: "card",
    },
  ];
  const result = decideInternal(
    buildDecisionContext(
      normalized({ identity: "established", freshness: "current", history: "rich" }),
      relationshipContext,
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "card_gap");
}

section("stale freshness beats accomplishment follow up");
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
  ];
  const result = decideInternal(
    buildDecisionContext(
      normalized({ freshness: "stale", history: "rich" }),
      relationshipContext,
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "fresh_update");
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

section("life event follow up → life_event_follow_up rule result");
{
  const result = decideInternal(
    buildDecisionContext(
      normalized({ freshness: "current" }),
      minimalRelationshipContext(),
      [READY_LIFE_EVENT],
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "life_event_follow_up");
  expect("outcome ask_question", result.decideResult.decision.outcome, "ask_question");
  expect("reasons", result.decideResult.reasons, ["life_event_follow_up_ready"]);
}

section("life event follow up beats card gap");
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
  const result = decideInternal(
    buildDecisionContext(
      normalized({ identity: "established", freshness: "current" }),
      relationshipContext,
      [READY_LIFE_EVENT],
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "life_event_follow_up");
}

section("stale freshness beats life event follow up");
{
  const result = decideInternal(
    buildDecisionContext(
      normalized({ freshness: "stale" }),
      minimalRelationshipContext(),
      [READY_LIFE_EVENT],
    ),
  );
  expect("sourceRuleId", result.sourceRuleId, "fresh_update");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
