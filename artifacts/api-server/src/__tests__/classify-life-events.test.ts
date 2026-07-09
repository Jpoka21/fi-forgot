/**
 * Unit tests for brain/lifeEvents/classifyLifeEvents.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/classify-life-events.test.ts
 */

import { LIFE_EVENT_FOLLOW_UP_WINDOWS } from "../brain/config/lifeEventFollowUpWindows.js";
import { classifyLifeEvents } from "../brain/lifeEvents/classifyLifeEvents.js";
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

function freshUpdate(
  overrides: Partial<FreshUpdate> & Pick<FreshUpdate, "questionKey" | "daysAgo" | "createdAt">,
): FreshUpdate {
  return {
    id: "fresh-update-1",
    question: "Question text",
    answer: "Answer text",
    ageCategory: "recent",
    ...overrides,
  };
}

const FAMILY_WINDOW = LIFE_EVENT_FOLLOW_UP_WINDOWS.family_update;

section("empty relationship returns no classifications");
{
  const result = classifyLifeEvents(minimalRelationshipContext());
  expect("empty array", result, []);
}

section("unknown questionKey returns no classifications");
{
  const context = minimalRelationshipContext();
  context.freshUpdates = [
    freshUpdate({
      questionKey: "anything_to_remember",
      daysAgo: 10,
      createdAt: "2026-06-20T00:00:00.000Z",
    }),
  ];
  expect("no match", classifyLifeEvents(context), []);
}

section("supported family_news mapping");
{
  const context = minimalRelationshipContext();
  context.freshUpdates = [
    freshUpdate({
      questionKey: "family_news",
      daysAgo: 10,
      createdAt: "2026-06-20T00:00:00.000Z",
      answer: "They moved to Austin",
    }),
  ];
  expect("one classification", classifyLifeEvents(context), [
    {
      type: "family_update",
      category: "family",
      daysAgo: 10,
      followUpWindowDays: FAMILY_WINDOW,
      followUpReady: false,
      source: "fresh_update",
      capturedAt: "2026-06-20T00:00:00.000Z",
      classified: true,
      supported: true,
    },
  ]);
}

section("multiple captures ordered newest first");
{
  const context = minimalRelationshipContext();
  context.freshUpdates = [
    freshUpdate({
      id: "older",
      questionKey: "family_news",
      daysAgo: 40,
      createdAt: "2026-05-01T00:00:00.000Z",
    }),
    freshUpdate({
      id: "newer",
      questionKey: "family_news",
      daysAgo: 12,
      createdAt: "2026-06-18T00:00:00.000Z",
    }),
  ];
  const result = classifyLifeEvents(context);
  expect("count", result.length, 2);
  expect("newest first capturedAt", result[0]?.capturedAt, "2026-06-18T00:00:00.000Z");
  expect("second capturedAt", result[1]?.capturedAt, "2026-05-01T00:00:00.000Z");
}

section("follow up ready at window boundary");
{
  const context = minimalRelationshipContext();
  context.freshUpdates = [
    freshUpdate({
      questionKey: "family_news",
      daysAgo: FAMILY_WINDOW,
      createdAt: "2026-05-09T00:00:00.000Z",
    }),
  ];
  expect("followUpReady true at boundary", classifyLifeEvents(context)[0]?.followUpReady, true);
}

section("follow up not ready before window");
{
  const context = minimalRelationshipContext();
  context.freshUpdates = [
    freshUpdate({
      questionKey: "family_news",
      daysAgo: FAMILY_WINDOW - 1,
      createdAt: "2026-06-19T00:00:00.000Z",
    }),
  ];
  expect("followUpReady false before window", classifyLifeEvents(context)[0]?.followUpReady, false);
}

section("excluded keys are not classified");
{
  const context = minimalRelationshipContext();
  context.freshUpdates = [
    freshUpdate({
      questionKey: "recent_accomplishment",
      daysAgo: 5,
      createdAt: "2026-06-25T00:00:00.000Z",
    }),
    freshUpdate({
      id: "excitement",
      questionKey: "current_excitement",
      daysAgo: 5,
      createdAt: "2026-06-24T00:00:00.000Z",
    }),
    freshUpdate({
      id: "challenge",
      questionKey: "current_challenge",
      daysAgo: 5,
      createdAt: "2026-06-23T00:00:00.000Z",
    }),
  ];
  expect("excluded keys", classifyLifeEvents(context), []);
}

section("answer text does not affect classification");
{
  const contextA = minimalRelationshipContext();
  contextA.freshUpdates = [
    freshUpdate({
      questionKey: "family_news",
      daysAgo: 15,
      createdAt: "2026-06-15T00:00:00.000Z",
      answer: "They adopted a dog",
    }),
  ];

  const contextB = minimalRelationshipContext();
  contextB.freshUpdates = [
    freshUpdate({
      questionKey: "family_news",
      daysAgo: 15,
      createdAt: "2026-06-15T00:00:00.000Z",
      answer: "Completely different answer text",
    }),
  ];

  expect(
    "same classification regardless of answer",
    classifyLifeEvents(contextA),
    classifyLifeEvents(contextB),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
