/**
 * Unit tests for services/event-briefing — briefing completion projector.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/event-briefing-completion.test.ts
 */

import { evaluateEventBriefingCompletion } from "../services/event-briefing/index.js";
import type { BriefingSummary } from "../services/recipient-context.js";

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

function emptyBriefing(): BriefingSummary {
  return { totalAnswers: 0, byEvent: {}, allAnswers: [] };
}

section("no matching event cycle briefing produces complete false");
{
  const result = evaluateEventBriefingCompletion({
    eventId: "birthday",
    briefingEventLabel: "Birthday",
    cycleYear: 2026,
    briefingSummary: emptyBriefing(),
  });
  expect("complete false", result.complete, false);
}

section("valid saved current cycle event briefing produces complete true");
{
  const briefingSummary: BriefingSummary = {
    totalAnswers: 1,
    byEvent: {
      Birthday_2026: [
        {
          questionKey: "favorite_memory",
          question: "Favorite memory?",
          answer: "Beach trip",
          eventType: "Birthday",
          eventYear: 2026,
        },
      ],
    },
    allAnswers: [],
  };

  const result = evaluateEventBriefingCompletion({
    eventId: "birthday",
    briefingEventLabel: "Birthday",
    cycleYear: 2026,
    briefingSummary,
  });
  expect("complete true", result.complete, true);
}

section("prior year briefing does not complete the current cycle");
{
  const briefingSummary: BriefingSummary = {
    totalAnswers: 1,
    byEvent: {
      Birthday_2025: [
        {
          questionKey: "favorite_memory",
          question: "Favorite memory?",
          answer: "Old trip",
          eventType: "Birthday",
          eventYear: 2025,
        },
      ],
    },
    allAnswers: [],
  };

  const result = evaluateEventBriefingCompletion({
    eventId: "birthday",
    briefingEventLabel: "Birthday",
    cycleYear: 2026,
    briefingSummary,
  });
  expect("complete false for prior year", result.complete, false);
}

section("different event labels do not cross complete one another");
{
  const briefingSummary: BriefingSummary = {
    totalAnswers: 1,
    byEvent: {
      Anniversary_2026: [
        {
          questionKey: "years_together",
          question: "Years together?",
          answer: "10",
          eventType: "Anniversary",
          eventYear: 2026,
        },
      ],
    },
    allAnswers: [],
  };

  const result = evaluateEventBriefingCompletion({
    eventId: "birthday",
    briefingEventLabel: "Birthday",
    cycleYear: 2026,
    briefingSummary,
  });
  expect("birthday not completed by anniversary", result.complete, false);
}

section("completion logic remains inside the briefing module");
{
  const result = evaluateEventBriefingCompletion({
    eventId: "valentines_day",
    briefingEventLabel: "Valentine's Day",
    cycleYear: 2026,
    briefingSummary: {
      totalAnswers: 1,
      byEvent: {
        "Valentine's Day_2026": [
          {
            questionKey: "romantic_detail",
            question: "What makes them smile?",
            answer: "Morning coffee",
            eventType: "Valentine's Day",
            eventYear: 2026,
          },
        ],
      },
      allAnswers: [],
    },
  });
  expect("valentines complete", result.complete, true);
  expect("result shape", Object.keys(result), ["complete"]);
}

section("empty answers do not complete briefing");
{
  const result = evaluateEventBriefingCompletion({
    eventId: "birthday",
    briefingEventLabel: "Birthday",
    cycleYear: 2026,
    briefingSummary: {
      totalAnswers: 1,
      byEvent: {
        Birthday_2026: [
          {
            questionKey: "memory",
            question: "Memory?",
            answer: "   ",
            eventType: "Birthday",
            eventYear: 2026,
          },
        ],
      },
      allAnswers: [],
    },
  });
  expect("whitespace-only answer not complete", result.complete, false);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
