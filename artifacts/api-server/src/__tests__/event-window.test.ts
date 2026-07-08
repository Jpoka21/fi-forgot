/**
 * Unit tests for brain/decision/eventWindow.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/event-window.test.ts
 */

import { isEventWithinPreparationWindow } from "../brain/decision/eventWindow.js";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expect(label: string, actual: unknown, expected: unknown): void {
  const ok = actual === expected;
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

section("inside preparation window");
{
  expect("7 days within 14-day window", isEventWithinPreparationWindow(7, 14), true);
}

section("outside preparation window");
{
  expect("30 days outside 14-day window", isEventWithinPreparationWindow(30, 14), false);
}

section("today");
{
  expect("0 days within window", isEventWithinPreparationWindow(0, 14), true);
}

section("window edge");
{
  expect("exactly at window edge", isEventWithinPreparationWindow(14, 14), true);
}

section("null eventDaysAway");
{
  expect("null event", isEventWithinPreparationWindow(null, 14), false);
}

section("null preparationWindowDays");
{
  expect("null window", isEventWithinPreparationWindow(7, null), false);
}

section("both null");
{
  expect("both null", isEventWithinPreparationWindow(null, null), false);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
