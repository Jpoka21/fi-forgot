/**
 * Phase 7C.2 — Brain event preparation metadata via Event Domain adapter.
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/event-preparation-metadata.test.ts
 */

import { getEventScheduling, resolveOccurrence } from "@workspace/events";

import { buildEventPreparationContext } from "../brain/events/buildEventPreparationContext.js";
import {
  BRAIN_EVENT_IDS,
  getBrainEventDefinition,
} from "../brain/events/brainEventCatalog.js";
import {
  getBrainEventPreparationMetadata,
  listBrainEventPreparationMetadata,
  requireCanonicalEventId,
} from "../brain/events/eventDomain/index.js";
import { resolveCatalogEventTiming } from "../brain/events/resolveCatalogEventTiming.js";
import { resolveOccurrenceDateStr } from "../brain/events/resolveOccurrenceDateStr.js";
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

section("preparation metadata parity");
{
  const birthday = getBrainEventPreparationMetadata("birthday");
  const anniversary = getBrainEventPreparationMetadata("anniversary");
  const valentines = getBrainEventPreparationMetadata("valentines_day");

  expect("birthday label", birthday.briefingEventLabel, "Birthday");
  expect("anniversary label", anniversary.briefingEventLabel, "Anniversary");
  expect("valentines label", valentines.briefingEventLabel, "Valentine's Day");

  expect("birthday timing", birthday.timing, {
    kind: "recipient_date",
    field: "birthday",
  });
  expect("anniversary timing", anniversary.timing, {
    kind: "recipient_date",
    field: "anniversary",
  });
  expect("valentines timing", valentines.timing, {
    kind: "fixed_calendar",
    monthDay: "02-14",
  });

  expect("birthday category", birthday.category, "calendar");
  expect("anniversary category", anniversary.category, "calendar");
  expect("valentines category", valentines.category, "calendar");
  expect("birthday kind", birthday.kind, "recurring_scheduled");
  expect("valentines kind", valentines.kind, "recurring_scheduled");

  expect(
    "list covers three events",
    listBrainEventPreparationMetadata().map((e) => e.eventId),
    ["birthday", "anniversary", "valentines_day"],
  );
}

section("adapter driven preparation metadata matches catalog facade");
{
  for (const eventId of BRAIN_EVENT_IDS) {
    const prep = getBrainEventPreparationMetadata(eventId);
    const def = getBrainEventDefinition(eventId);
    expect(`${eventId} label parity`, def.briefingEventLabel, prep.briefingEventLabel);
    expect(`${eventId} timing parity`, def.timing, prep.timing);
    expect(`${eventId} id parity`, def.eventId, prep.eventId);
  }
}

section("unsupported event failure");
{
  expectThrows("prep metadata unknown", () =>
    getBrainEventPreparationMetadata("mothers_day" as "birthday"),
  );
  expectThrows("requireCanonical unknown", () =>
    requireCanonicalEventId("mothers_day"),
  );
  expect(
    "timing unsupported returns inapplicable",
    resolveCatalogEventTiming(
      "mothers_day" as "birthday",
      minimalRelationshipContext(),
      new Date("2026-01-15T12:00:00.000Z"),
    ),
    { applicable: false, daysUntilEvent: null, cycleYear: null },
  );
  expect(
    "occurrence unsupported returns null",
    resolveOccurrenceDateStr(
      "mothers_day" as "birthday",
      minimalRelationshipContext({ birthday: "1990-07-08" }),
    ),
    null,
  );
}

section("no scheduling resolver usage in preparation path");
{
  // Domain stub remains unused; Brain still computes occurrence strings.
  const scheduling = getEventScheduling("birthday")!;
  const stub = resolveOccurrence(scheduling, {
    referenceDate: new Date("2026-06-01T12:00:00.000Z"),
    recipientDates: { birthday: "1990-07-08" },
  });
  expect("stub still stubbed", stub.stubbed, true);

  const ctx = minimalRelationshipContext({
    birthday: "1990-07-08",
    relationshipType: "Friend",
  });
  expect(
    "Brain occurrence date from recipient field",
    resolveOccurrenceDateStr("birthday", ctx),
    "1990-07-08",
  );
  expect(
    "Brain occurrence date from fixed calendar metadata",
    resolveOccurrenceDateStr(
      "valentines_day",
      minimalRelationshipContext({
        relationshipType: "Wife",
      }),
    ),
    "02-14",
  );
}

section("preparation context still Brain-owned and adapter-labeled");
{
  const relationshipContext = minimalRelationshipContext({
    generatedAt: "2026-07-01T00:00:00.000Z",
    birthday: "1988-07-08",
    previewDays: 14,
    relationshipType: "Friend",
  });
  const prepCtx = buildEventPreparationContext({
    relationshipContext,
    referenceDate: new Date("2026-07-01T00:00:00.000Z"),
    preparationWindowDays: 14,
  });
  expectTrue("birthday facts present", prepCtx.byEventId.birthday != null);
  expect("birthday eventId", prepCtx.byEventId.birthday?.eventId, "birthday");
  expect(
    "friend valentines omitted",
    prepCtx.byEventId.valentines_day,
    undefined,
  );

  const romanticCtx = buildEventPreparationContext({
    relationshipContext: minimalRelationshipContext({
      generatedAt: "2026-01-15T00:00:00.000Z",
      relationshipType: "Wife",
      previewDays: 45,
    }),
    referenceDate: new Date("2026-01-15T00:00:00.000Z"),
    preparationWindowDays: 45,
  });
  expectTrue(
    "romantic valentines present",
    romanticCtx.byEventId.valentines_day != null,
  );
}

section("compatibility mappings retained with parity");
{
  expect("BRAIN_EVENT_IDS compatibility", [...BRAIN_EVENT_IDS], [
    "birthday",
    "anniversary",
    "valentines_day",
  ]);
  expectTrue(
    "catalog facade still available",
    getBrainEventDefinition("birthday").briefingEventLabel === "Birthday",
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
