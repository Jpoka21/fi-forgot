/**
 * Unit tests for brain/decision/eventTimingUtils — cycle year resolution.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/event-cycle-resolution.test.ts
 */

import {
  resolveEventCycleYear,
  resolveNextOccurrenceDate,
} from "../brain/decision/eventTimingUtils.js";

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

section("recipient birthday cycle year near year boundary");
{
  const decemberReference = new Date("2026-12-20T00:00:00.000Z");
  expect(
    "january birthday uses next year",
    resolveEventCycleYear("1988-01-05", decemberReference),
    2027,
  );
  expect(
    "next occurrence date year",
    resolveNextOccurrenceDate("1988-01-05", decemberReference)?.toISOString(),
    "2027-01-05T00:00:00.000Z",
  );
}

section("recipient anniversary cycle year in same calendar year");
{
  const julyReference = new Date("2026-07-01T00:00:00.000Z");
  expect("july anniversary cycle year", resolveEventCycleYear("2015-07-08", julyReference), 2026);
}

section("fixed valentines cycle year near January");
{
  const janReference = new Date("2026-01-10T00:00:00.000Z");
  expect("february valentines same year", resolveEventCycleYear("02-14", janReference), 2026);
  expect(
    "next valentines date",
    resolveNextOccurrenceDate("02-14", janReference)?.toISOString(),
    "2026-02-14T00:00:00.000Z",
  );
}

section("fixed valentines cycle year after February");
{
  const marchReference = new Date("2026-03-01T00:00:00.000Z");
  expect("next valentines rolls forward", resolveEventCycleYear("02-14", marchReference), 2027);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
