/**
 * Unit tests for services/event-cards — card cycle status projector.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/event-card-cycle-status.test.ts
 */

import { mapCardPersistenceStatus } from "../services/event-cards/mapCardPersistenceStatus.js";
import { projectEventCardCycleStatus } from "../services/event-cards/projectEventCardCycleStatus.js";
import { resolveCardCycleYear } from "../services/event-cards/resolveCardCycleYear.js";
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

const REFERENCE_DATE = new Date("2026-07-01T00:00:00.000Z");
const EMPTY_BRIEFING: BriefingSummary = { totalAnswers: 0, byEvent: {}, allAnswers: [] };

function card(overrides: {
  eventType?: string;
  eventDate?: string | null;
  dueDateFromData?: string | null;
  storedEventYear?: number | null;
  status?: string;
  createdAt?: string;
}) {
  return {
    eventType: "Birthday",
    eventDate: null,
    dueDateFromData: null,
    storedEventYear: null,
    status: "Ready for approval",
    createdAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

function project(
  cycleYear: number,
  cards: ReturnType<typeof card>[],
  options: {
    occurrenceDateStr?: string | null;
    briefingSummary?: BriefingSummary;
  } = {},
) {
  const occurrenceDateStr =
    "occurrenceDateStr" in options ? options.occurrenceDateStr ?? null : "1988-07-08";

  return projectEventCardCycleStatus({
    eventId: "birthday",
    briefingEventLabel: "Birthday",
    cycleYear,
    occurrenceDateStr,
    briefingSummary: options.briefingSummary ?? EMPTY_BRIEFING,
    cards,
    referenceDate: REFERENCE_DATE,
  });
}

section("Delivered maps to terminal");
{
  expect("Delivered", mapCardPersistenceStatus("Delivered"), "terminal");
}

section("Given maps to terminal");
{
  expect("Given", mapCardPersistenceStatus("Given"), "terminal");
}

section("Rejected does not map to terminal");
{
  expect("Rejected", mapCardPersistenceStatus("Rejected"), "in_progress");
}

section("mailed statuses remain mailed");
{
  expect("Mailed to me", mapCardPersistenceStatus("Mailed to me"), "mailed");
  expect("Mailed to her", mapCardPersistenceStatus("Mailed to her"), "mailed");
}

section("no matching card produces none");
{
  expect("none", project(2026, []), "none");
}

section("December card for January birthday is not assigned to December cycle from createdAt");
{
  const decemberCard = card({
    eventDate: null,
    createdAt: "2026-12-20T00:00:00.000Z",
    status: "Approved",
  });

  expect(
    "does not match 2026 cycle",
    project(2026, [decemberCard], { occurrenceDateStr: "1988-01-05" }),
    "none",
  );
  expect(
    "matches 2027 cycle via occurrence derivation",
    project(2027, [decemberCard], { occurrenceDateStr: "1988-01-05" }),
    "approved",
  );
}

section("explicit event date wins over creation time");
{
  const explicitDateCard = card({
    eventDate: "2027-01-05",
    createdAt: "2026-12-20T00:00:00.000Z",
    status: "Approved",
  });

  expect(
    "explicit date year 2027 matches 2027 cycle",
    project(2027, [explicitDateCard], { occurrenceDateStr: "1988-01-05" }),
    "approved",
  );
  expect(
    "explicit date year 2027 does not match 2026 cycle",
    project(2026, [explicitDateCard], { occurrenceDateStr: "1988-01-05" }),
    "none",
  );
}

section("stored event year wins over creation time");
{
  const storedYearCard = card({
    storedEventYear: 2027,
    createdAt: "2026-12-20T00:00:00.000Z",
    status: "Approved",
  });

  expect("stored year matches 2027 cycle", project(2027, [storedYearCard]), "approved");
  expect("stored year does not match 2026 cycle", project(2026, [storedYearCard]), "none");
}

section("unknown cycle evidence does not falsely block preparation");
{
  const unknownCycleCard = card({
    eventDate: null,
    createdAt: "2026-06-01T00:00:00.000Z",
    status: "Approved",
  });

  expect(
    "no occurrence date yields unknown cycle",
    resolveCardCycleYear(unknownCycleCard, {
      briefingEventLabel: "Birthday",
      occurrenceDateStr: null,
      briefingSummary: EMPTY_BRIEFING,
    }),
    null,
  );
  expect(
    "unknown cycle card does not match",
    project(2026, [unknownCycleCard], { occurrenceDateStr: null }),
    "none",
  );
}

section("multiple cards resolve deterministically");
{
  expect(
    "approved wins over ready",
    project(2026, [
      card({ eventDate: "2026-07-08", status: "Ready for approval", createdAt: "2026-06-20T00:00:00.000Z" }),
      card({ eventDate: "2026-07-08", status: "Approved", createdAt: "2026-06-10T00:00:00.000Z" }),
    ]),
    "approved",
  );
}

section("cards for another event do not match");
{
  expect(
    "anniversary card ignored",
    project(2026, [
      card({ eventType: "Anniversary", eventDate: "2026-07-08", status: "Approved" }),
    ]),
    "none",
  );
}

section("unknown persistence statuses are handled safely");
{
  expect("unknown maps to in_progress", mapCardPersistenceStatus("Legacy status"), "in_progress");
  expect(
    "unknown card resolves to in_progress",
    project(2026, [card({ eventDate: "2026-07-08", status: "Legacy status" })]),
    "in_progress",
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
