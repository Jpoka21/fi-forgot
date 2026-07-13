/**
 * Phase 7C.3 — Brain event briefing metadata via Event Domain adapter.
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/event-briefing-metadata.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getEventScheduling, resolveOccurrence } from "@workspace/events";

import {
  getBrainEventBriefingMetadata,
  getBrainEventPreparationMetadata,
  getBrainEventView,
  listBrainEventBriefingMetadata,
  requireCanonicalEventId,
  toCanonicalEventId,
} from "../brain/events/eventDomain/index.js";
import { getBrainEventDefinition } from "../brain/events/brainEventCatalog.js";
import { enrichActionPlanRouting } from "../brain/action/enrichActionPlanRouting.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(TEST_DIR, "../../../..");

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

function expectTrue(label: string, actual: boolean): void {
  expect(label, actual, true);
}

function expectThrows(label: string, fn: () => void): void {
  try {
    fn();
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
    console.log(`      expected throw`);
  } catch {
    passed++;
    console.log(`  ✓ ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

section("exact briefing metadata for all three events");
{
  const expected = {
    birthday: {
      eventId: "birthday",
      questionSetId: "birthday",
      questionSetVersion: 1,
      questionSetTitle: "Birthday",
    },
    anniversary: {
      eventId: "anniversary",
      questionSetId: "anniversary",
      questionSetVersion: 1,
      questionSetTitle: "Anniversary",
    },
    valentines_day: {
      eventId: "valentines_day",
      questionSetId: "valentines_day",
      questionSetVersion: 1,
      questionSetTitle: "Valentine's Day",
    },
  } as const;

  for (const [eventId, meta] of Object.entries(expected)) {
    expect(
      `${eventId} briefing metadata`,
      getBrainEventBriefingMetadata(eventId as keyof typeof expected),
      meta,
    );
  }

  expect(
    "list covers three",
    listBrainEventBriefingMetadata().map((e) => e.eventId),
    ["birthday", "anniversary", "valentines_day"],
  );
}

section("adapter driven briefing references / question set parity");
{
  for (const eventId of ["birthday", "anniversary", "valentines_day"] as const) {
    const briefing = getBrainEventBriefingMetadata(eventId);
    const prep = getBrainEventPreparationMetadata(eventId);
    const def = getBrainEventDefinition(eventId);
    expect(
      `${eventId} prep label from briefing title`,
      prep.briefingEventLabel,
      briefing.questionSetTitle,
    );
    expect(
      `${eventId} catalog label from briefing title`,
      def.briefingEventLabel,
      briefing.questionSetTitle,
    );
    expect(
      `${eventId} title matches identity display label (v1 parity)`,
      briefing.questionSetTitle,
      getBrainEventView(eventId).displayLabel,
    );
  }
}

section("unsupported event failure / no fuzzy resolution");
{
  expect("toCanonical Birthday label", toCanonicalEventId("Birthday"), null);
  expect("toCanonical substring", toCanonicalEventId("birth"), null);
  expect("toCanonical mothers_day", toCanonicalEventId("mothers_day"), null);
  expectThrows("briefing unknown", () =>
    getBrainEventBriefingMetadata("mothers_day" as "birthday"),
  );
  expectThrows("requireCanonical unknown", () =>
    requireCanonicalEventId("mothers_day"),
  );
}

section("question set IDs remain distinct from event IDs");
{
  const birthday = getBrainEventBriefingMetadata("birthday");
  expectTrue("has eventId field", "eventId" in birthday);
  expectTrue("has questionSetId field", "questionSetId" in birthday);
  expectTrue(
    "adapter source keeps separate fields",
    readFileSync(
      join(REPO_ROOT, "artifacts/api-server/src/brain/events/eventDomain/adapter.ts"),
      "utf8",
    ).includes("Distinct fields from distinct Event Domain records"),
  );
  // Values may coincide for v1; concepts remain separate — no derivation helper.
  expectTrue(
    "no deriveQuestionSetId helper",
    !readFileSync(
      join(REPO_ROOT, "artifacts/api-server/src/brain/events/eventDomain/adapter.ts"),
      "utf8",
    ).includes("deriveQuestionSetId"),
  );
}

section("no actual question content in @workspace/events");
{
  const briefingTypes = readFileSync(
    join(REPO_ROOT, "lib/events/src/briefing/types.ts"),
    "utf8",
  );
  const briefingRegistry = readFileSync(
    join(REPO_ROOT, "lib/events/src/briefing/registry.ts"),
    "utf8",
  );
  expectTrue("types say references only", briefingTypes.includes("References only"));
  expectTrue("no questions array in types", !briefingTypes.includes("questions:"));
  expectTrue(
    "registry has no question text blobs",
    !briefingRegistry.includes("Is this a milestone"),
  );

  const meta = getBrainEventBriefingMetadata("birthday");
  const keys = Object.keys(meta).sort();
  expect("BrainEventBriefingMetadata keys", keys, [
    "eventId",
    "questionSetId",
    "questionSetTitle",
    "questionSetVersion",
  ]);
  expectTrue("no questions on adapter view", !("questions" in meta));
  expectTrue("no emoji", !("emoji" in meta));
  expectTrue("no handwrytten", !("categories" in meta));
  expectTrue("no sourceRuleId", !("sourceRuleId" in meta));
}

section("EVENT_QUESTIONS remains unchanged and outside Event Domain");
{
  const eventQuestionsSource = readFileSync(
    join(REPO_ROOT, "artifacts/fi-forgot/src/lib/data.ts"),
    "utf8",
  );
  expectTrue("EVENT_QUESTIONS still defined in frontend", eventQuestionsSource.includes("export const EVENT_QUESTIONS"));
  expectTrue(
    "Birthday questions still present",
    eventQuestionsSource.includes('"Birthday"') &&
      eventQuestionsSource.includes("Is this a milestone birthday?"),
  );
  expectTrue(
    "Valentine questions still present",
    eventQuestionsSource.includes("\"Valentine's Day\"") &&
      eventQuestionsSource.includes("what_you_love"),
  );
  expectTrue(
    "adapter does not import EVENT_QUESTIONS",
    !/from\s+["'][^"']*EVENT_QUESTIONS|import\s+[^;]*EVENT_QUESTIONS/.test(
      readFileSync(
        join(REPO_ROOT, "artifacts/api-server/src/brain/events/eventDomain/adapter.ts"),
        "utf8",
      ),
    ),
  );
}

section("routing uses briefing metadata titles");
{
  const ask = enrichActionPlanRouting(
    {
      type: "ask_question",
      category: "birthday",
      priority: "high",
      sourceRuleId: "birthday",
      primaryReason: "test",
      reasons: ["test"],
      confidence: 0.9,
      debugNotes: [],
    },
    "ask_question",
  );
  expect("event_briefing label", ask.routing?.briefingEventLabel, "Birthday");
  expect("event_briefing experience", ask.routing?.experience, "event_briefing");

  const prepare = enrichActionPlanRouting(
    {
      type: "prepare_card",
      category: "holiday",
      priority: "high",
      sourceRuleId: "valentines_day",
      primaryReason: "test",
      reasons: ["test"],
      confidence: 0.9,
      debugNotes: [],
    },
    "prepare_card",
  );
  expect(
    "card_preparation_briefing label",
    prepare.routing?.briefingEventLabel,
    "Valentine's Day",
  );
  expect(
    "card_preparation_briefing experience",
    prepare.routing?.experience,
    "card_preparation_briefing",
  );
}

section("scheduling resolver remains unused");
{
  const scheduling = getEventScheduling("birthday")!;
  const stub = resolveOccurrence(scheduling, {
    referenceDate: new Date("2026-06-01T12:00:00.000Z"),
    recipientDates: { birthday: "1990-07-08" },
  });
  expect("stub still stubbed", stub.stubbed, true);

  const adapterSource = readFileSync(
    join(REPO_ROOT, "artifacts/api-server/src/brain/events/eventDomain/adapter.ts"),
    "utf8",
  );
  const importBlock = adapterSource.match(
    /import\s*\{([\s\S]*?)\}\s*from\s*["']@workspace\/events["']/,
  )?.[1] ?? "";
  expectTrue(
    "adapter does not import resolveOccurrence",
    !/\bresolveOccurrence\b/.test(importBlock),
  );
  expectTrue(
    "adapter imports getEventBriefingRef",
    /\bgetEventBriefingRef\b/.test(importBlock),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
