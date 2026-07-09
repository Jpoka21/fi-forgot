/**
 * Unit tests for brain/decision/rules/lifeEventFollowUpRule.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/life-event-follow-up-rule.test.ts
 */

import { buildDecisionContext } from "../brain/decision/buildDecisionContext.js";
import { lifeEventFollowUpRule } from "../brain/decision/rules/lifeEventFollowUpRule.js";
import { ruleRegistry } from "../brain/decision/rules/ruleRegistry.js";
import type { LifeEventClassification } from "../brain/lifeEvents/lifeEventTypes.js";
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

function lifeEventContext(
  lifeEvent: LifeEventClassification | null,
  normalizedOverrides: Partial<NormalizedRelationshipState> = {},
) {
  return buildDecisionContext(
    normalized(normalizedOverrides),
    minimalRelationshipContext(),
    lifeEvent ? [lifeEvent] : [],
  );
}

const READY_LIFE_EVENT: LifeEventClassification = {
  type: "family_update",
  category: "family",
  daysAgo: 30,
  followUpWindowDays: 30,
  followUpReady: true,
  source: "fresh_update",
  capturedAt: "2026-06-01T00:00:00.000Z",
  classified: true,
  supported: true,
};

const MATCH_CANDIDATE = {
  ruleId: "life_event_follow_up",
  priority: 38,
  confidence: 46,
  decision: { outcome: "ask_question" },
  reasons: ["life_event_follow_up_ready"],
  debugNotes: [
    "LifeEventFollowUpRule matched",
    "type: family_update",
    "category: family",
    "days ago: 30",
    "follow up window days: 30",
    "followUpReady: true",
    "source: fresh_update",
  ],
};

section("no lifeEvent does not match");
{
  const ctx = lifeEventContext(null);
  expect("no match", lifeEventFollowUpRule.evaluate(ctx), null);
}

section("unclassified life event does not match");
{
  const ctx = lifeEventContext({ ...READY_LIFE_EVENT, classified: false });
  expect("not classified", lifeEventFollowUpRule.evaluate(ctx), null);
}

section("unsupported life event does not match");
{
  const ctx = lifeEventContext({ ...READY_LIFE_EVENT, supported: false });
  expect("not supported", lifeEventFollowUpRule.evaluate(ctx), null);
}

section("supported and classified but followUpReady false does not match");
{
  const ctx = lifeEventContext({ ...READY_LIFE_EVENT, followUpReady: false, daysAgo: 12 });
  expect("not ready", lifeEventFollowUpRule.evaluate(ctx), null);
}

section("supported classified and followUpReady true matches");
{
  const ctx = lifeEventContext(READY_LIFE_EVENT);
  expect("matches", lifeEventFollowUpRule.evaluate(ctx), MATCH_CANDIDATE);
}

section("rule priority is 38");
{
  const ctx = lifeEventContext(READY_LIFE_EVENT);
  expect("priority", lifeEventFollowUpRule.evaluate(ctx)?.priority, 38);
}

section("registry ordering places life_event_follow_up between fresh_update and card_gap");
{
  const freshUpdateIndex = ruleRegistry.findIndex((rule) => rule.id === "fresh_update");
  const lifeEventIndex = ruleRegistry.findIndex((rule) => rule.id === "life_event_follow_up");
  const cardGapIndex = ruleRegistry.findIndex((rule) => rule.id === "card_gap");
  expect("fresh_update before life_event", freshUpdateIndex < lifeEventIndex, true);
  expect("life_event before card_gap", lifeEventIndex < cardGapIndex, true);
  expect("fresh_update priority above life_event", 40 > 38, true);
  expect("life_event priority above card_gap", 38 > 35, true);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
