/**
 * Domain contract tests for @workspace/events (Phase 7B.2).
 *
 * Run with:
 *   corepack pnpm dlx tsx lib/events/src/__tests__/events-domain.test.ts
 */

import {
  EVENT_IDS,
  INITIAL_EVENT_IDS,
  SCHEDULING_NOT_MIGRATED_REASON,
  canonicalLabel,
  getBriefingProjection,
  getCalendarProjection,
  getCardLibraryProjection,
  getCatalogProjection,
  getEvent,
  getEventAvailability,
  getEventBriefingRef,
  getEventPresentation,
  getEventScheduling,
  getFrontendOccasionProjection,
  getHandwryttenIntegration,
  isEventId,
  isWithinWindow,
  listAliases,
  listBriefingProjections,
  listCalendarProjections,
  listCatalogProjections,
  listEvents,
  listFrontendOccasionProjections,
  matchesEvent,
  matchesRelationshipFilter,
  resolveEventId,
  resolveOccurrence,
} from "../index.js";

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

function section(name: string): void {
  console.log(`\n${name}`);
}

section("completeness — three initial Brain events");
{
  expect("EVENT_IDS", [...EVENT_IDS], [
    "birthday",
    "anniversary",
    "valentines_day",
  ]);
  expect("INITIAL_EVENT_IDS alias", [...INITIAL_EVENT_IDS], [...EVENT_IDS]);
  expect("listEvents length", listEvents().length, 3);
  expect("listEvents activeOnly", listEvents({ activeOnly: true }).length, 3);
  expect("listCatalogProjections", listCatalogProjections().length, 3);
}

section("closed EventId identity");
{
  expectTrue("isEventId birthday", isEventId("birthday"));
  expectTrue("isEventId anniversary", isEventId("anniversary"));
  expectTrue("isEventId valentines_day", isEventId("valentines_day"));
  expect("isEventId unknown string", isEventId("mothers_day"), false);
  expect("isEventId open string", isEventId("anything"), false);

  const birthday = getEvent("birthday");
  expect("birthday displayLabel", birthday?.displayLabel, "Birthday");
  expect("birthday category", birthday?.category, "calendar");
  expect("birthday kind", birthday?.kind, "recurring_scheduled");
  expect("birthday active", birthday?.active, true);

  expect("anniversary displayLabel", getEvent("anniversary")?.displayLabel, "Anniversary");
  expect(
    "valentines displayLabel",
    getEvent("valentines_day")?.displayLabel,
    "Valentine's Day",
  );
}

section("label normalization and aliases");
{
  expect("resolveEventId Birthday", resolveEventId("Birthday"), "birthday");
  expect("resolveEventId Anniversary", resolveEventId("Anniversary"), "anniversary");
  expect(
    "resolveEventId Valentine's Day",
    resolveEventId("Valentine's Day"),
    "valentines_day",
  );
  expect(
    "resolveEventId Valentines Day alias",
    resolveEventId("Valentines Day"),
    "valentines_day",
  );
  expect(
    "resolveEventId valentines day alias",
    resolveEventId("valentines day"),
    "valentines_day",
  );
  expect("canonical self birthday", resolveEventId("birthday"), "birthday");
  expect(
    "canonical self valentines_day",
    resolveEventId("valentines_day"),
    "valentines_day",
  );
  expect("resolveEventId bday alias", resolveEventId("bday"), "birthday");
  expect("resolveEventId unknown", resolveEventId("Mother's Day"), null);
  expect("resolveEventId empty", resolveEventId(""), null);
  expect("resolveEventId whitespace", resolveEventId("   "), null);
  expect("resolveEventId substring guess", resolveEventId("birth"), null);
  expect("resolveEventId fuzzy", resolveEventId("Bday!!!"), null);

  expect("canonicalLabel birthday", canonicalLabel("birthday"), "Birthday");
  expect(
    "canonicalLabel valentines_day",
    canonicalLabel("valentines_day"),
    "Valentine's Day",
  );

  expectTrue("matchesEvent Birthday", matchesEvent("Birthday", "birthday"));
  expect("matchesEvent wrong", matchesEvent("Anniversary", "birthday"), false);
  expectTrue(
    "listAliases birthday includes bday",
    listAliases("birthday").includes("bday"),
  );
}

section("scheduling stub contracts");
{
  const birthdaySched = getEventScheduling("birthday");
  expect("birthday timing kind", birthdaySched?.timing.kind, "recipient_date");
  if (birthdaySched?.timing.kind === "recipient_date") {
    expect("birthday field", birthdaySched.timing.field, "birthday");
  }

  const valentinesSched = getEventScheduling("valentines_day");
  expect("valentines timing kind", valentinesSched?.timing.kind, "fixed_calendar");
  if (valentinesSched?.timing.kind === "fixed_calendar") {
    expect("valentines monthDay", valentinesSched.timing.monthDay, "02-14");
  }
  expect(
    "valentines roles romantic",
    valentinesSched?.constraints?.relationshipRoles?.includes("romantic"),
    true,
  );

  const stub = resolveOccurrence(birthdaySched!, {
    referenceDate: new Date("2026-06-01T12:00:00.000Z"),
    recipientDates: { birthday: "1990-07-08" },
  });
  expect("stub applicable false", stub.applicable, false);
  expect("stub stubbed true", stub.stubbed, true);
  expect("stub occurrence null", stub.occurrenceDateStr, null);
  expect("stub cycleYear null", stub.cycleYear, null);
  expect("stub daysUntil null", stub.daysUntil, null);
  expect("stub reason", stub.reason, SCHEDULING_NOT_MIGRATED_REASON);

  // Even with rich context, stub must not invent dates
  const stub2 = resolveOccurrence(valentinesSched!, {
    referenceDate: new Date("2026-01-01T12:00:00.000Z"),
    relationshipType: "Wife",
  });
  expect("valentines stub no date", stub2.occurrenceDateStr, null);
  expect("valentines stubbed", stub2.stubbed, true);

  expect("isWithinWindow true", isWithinWindow(7, 14), true);
  expect("isWithinWindow false", isWithinWindow(20, 14), false);
  expect("isWithinWindow null days", isWithinWindow(null, 14), false);
}

section("availability — declarative Valentine's");
{
  expect(
    "birthday personal",
    getEventAvailability("birthday")?.surfaces.personal,
    true,
  );
  expect(
    "valentines romantic role declared",
    getEventAvailability("valentines_day")?.relationshipFilter?.roles?.includes(
      "romantic",
    ),
    true,
  );
  expect(
    "valentines Wife match",
    matchesRelationshipFilter("valentines_day", {
      relationshipType: "Wife",
      surface: "personal",
    }),
    true,
  );
  expect(
    "valentines Friend no match",
    matchesRelationshipFilter("valentines_day", {
      relationshipType: "Friend",
      surface: "personal",
    }),
    false,
  );
  expect(
    "valentines no type fails includeTypes",
    matchesRelationshipFilter("valentines_day", { surface: "personal" }),
    false,
  );
}

section("briefing refs — no question content");
{
  const birthdayBriefing = getEventBriefingRef("birthday");
  expect("birthday questionSetId", birthdayBriefing?.questionSetId, "birthday");
  expect("birthday version", birthdayBriefing?.version, 1);

  const briefingProj = getBriefingProjection("birthday");
  expect("briefing projection label", briefingProj?.displayLabel, "Birthday");
  expect("briefing projection set", briefingProj?.questionSetId, "birthday");
  expect("listBriefingProjections", listBriefingProjections().length, 3);
}

section("integrations — three events only");
{
  expect(
    "handwrytten birthday categories",
    [...(getHandwryttenIntegration("birthday")?.categories ?? [])],
    ["Birthday"],
  );
}

section("presentation");
{
  expect("birthday emoji", getEventPresentation("birthday")?.emoji, "🎂");
  expect("anniversary emoji", getEventPresentation("anniversary")?.emoji, "💕");
  expect(
    "valentines emoji",
    getEventPresentation("valentines_day")?.emoji,
    "❤️",
  );
}

section("projections");
{
  const catalog = getCatalogProjection("birthday");
  expect("catalog label", catalog?.displayLabel, "Birthday");
  expect("catalog category", catalog?.category, "calendar");

  const frontend = getFrontendOccasionProjection("birthday");
  expect("frontend emoji", frontend?.emoji, "🎂");
  expect("frontend personal", frontend?.personal, true);
  expect(
    "listFrontendOccasionProjections",
    listFrontendOccasionProjections().length,
    3,
  );

  const calendar = getCalendarProjection("valentines_day");
  expect("calendar label", calendar?.displayLabel, "Valentine's Day");
  expect("calendar timingKind", calendar?.timingKind, "fixed_calendar");
  expect("listCalendarProjections", listCalendarProjections().length, 3);

  const library = getCardLibraryProjection("birthday");
  expect(
    "card library categories",
    [...(library?.libraryCategories ?? [])],
    ["birthday", "humor"],
  );
}

section("no Mother's Day expansion in 7B.2");
{
  expect("no mothers_day resolve", resolveEventId("Mother's Day"), null);
  expect("no mothers_day isEventId", isEventId("mothers_day"), false);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
