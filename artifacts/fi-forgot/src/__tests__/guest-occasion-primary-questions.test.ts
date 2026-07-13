/**
 * Guest /try occasion primary question resolver tests (Sprint 8A).
 *
 * Run with:
 *   npx tsx --tsconfig artifacts/fi-forgot/tsconfig.json artifacts/fi-forgot/src/__tests__/guest-occasion-primary-questions.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  GUEST_OCCASION_PRIMARY_FALLBACK,
  GUEST_OCCASION_PRIMARY_QUESTIONS,
  TRY_OCCASIONS,
  clearPrimaryOccasionContextOnOccasionChange,
  isValidPrimaryOccasionContext,
  resolveGuestPrimaryOccasionQuestion,
} from "../app/card-creation/guestOccasionPrimaryQuestions.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = join(TEST_DIR, "..");

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

function expectTrue(label: string, value: boolean): void {
  expect(label, value, true);
}

function section(name: string) {
  console.log(`\n${name}`);
}

section("every production /try occasion has a primary question");
{
  for (const occasion of TRY_OCCASIONS) {
    const def = GUEST_OCCASION_PRIMARY_QUESTIONS[occasion];
    expectTrue(`${occasion} has question`, typeof def.question === "string" && def.question.length > 0);
    expect(`${occasion} required`, def.required, true);
  }
  expect("TRY_OCCASIONS length", TRY_OCCASIONS.length, 16);
}

section("expected wording for key occasions");
{
  expect(
    "Thank You",
    resolveGuestPrimaryOccasionQuestion("Thank You", "Mom"),
    "What are you thanking Mom for?",
  );
  expect(
    "Birthday",
    resolveGuestPrimaryOccasionQuestion("Birthday", "Mom"),
    "What would you most like to celebrate about Mom this birthday?",
  );
  expect(
    "Congratulations",
    resolveGuestPrimaryOccasionQuestion("Congratulations", "Alex"),
    "What accomplishment are you celebrating?",
  );
  expect(
    "Sympathy",
    resolveGuestPrimaryOccasionQuestion("Sympathy", "Mom"),
    "What happened, or what would you like to acknowledge?",
  );
  expect(
    "Thinking Of You",
    resolveGuestPrimaryOccasionQuestion("Thinking Of You", "Mom"),
    "What made you think of Mom right now?",
  );
  expect(
    "Get Well",
    resolveGuestPrimaryOccasionQuestion("Get Well", "Mom"),
    "What is Mom going through or recovering from?",
  );
}

section("fallback and name substitution");
{
  expect(
    "unsupported occasion uses fallback",
    resolveGuestPrimaryOccasionQuestion("Secret Handshake", "Sam"),
    GUEST_OCCASION_PRIMARY_FALLBACK,
  );
  expect(
    "empty name uses them",
    resolveGuestPrimaryOccasionQuestion("Thank You", "   "),
    "What are you thanking them for?",
  );
  expect(
    "name change updates wording",
    resolveGuestPrimaryOccasionQuestion("Thank You", "Dad"),
    "What are you thanking Dad for?",
  );
}

section("Holiday uses holidayName when available");
{
  expect(
    "Holiday with Christmas",
    resolveGuestPrimaryOccasionQuestion("Holiday", "Sam", "Christmas"),
    "What do you want this Christmas card to focus on?",
  );
  expect(
    "Holiday without holidayName",
    resolveGuestPrimaryOccasionQuestion("Holiday", "Sam"),
    "What do you want this holiday card to focus on?",
  );
}

section("validation");
{
  expect("whitespace rejected", isValidPrimaryOccasionContext("   "), false);
  expect("empty rejected", isValidPrimaryOccasionContext(""), false);
  expect("short rejected", isValidPrimaryOccasionContext("hey"), false);
  expect("valid accepted", isValidPrimaryOccasionContext("She watched the kids."), true);
}

section("stale primary cleared on occasion change");
{
  const cleared = clearPrimaryOccasionContextOnOccasionChange({
    occasion: "Birthday",
    primaryOccasionContext: "old thank you reason",
    details: "keep me",
  });
  expect("primary cleared", cleared.primaryOccasionContext, undefined);
  expect("details preserved", cleared.details, "keep me");
  expect("occasion preserved in object", cleared.occasion, "Birthday");
}

section("no Brain or Event Domain imports");
{
  const source = readFileSync(
    join(SRC_ROOT, "app/card-creation/guestOccasionPrimaryQuestions.ts"),
    "utf8",
  );
  expectTrue("no @workspace/events", !source.includes("@workspace/events"));
  expectTrue("no brain/", !source.includes("brain/"));
  expectTrue("no EVENT_QUESTIONS", !source.includes("EVENT_QUESTIONS"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("Failures:", failures);
  process.exit(1);
}
