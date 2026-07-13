/**
 * /try wizard Objective → primaryOccasionContext replacement (Sprint 8A).
 *
 * Run with:
 *   npx tsx --tsconfig artifacts/fi-forgot/tsconfig.json artifacts/fi-forgot/src/__tests__/try-flow-primary-occasion.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const FLOW_SOURCE = readFileSync(join(TEST_DIR, "../pages/card-flow-v2.tsx"), "utf8");
const PACK_SOURCE = readFileSync(
  join(TEST_DIR, "../app/card-creation/packTryGenerateCardBody.ts"),
  "utf8",
);
const GUEST_Q_SOURCE = readFileSync(
  join(TEST_DIR, "../app/card-creation/guestOccasionPrimaryQuestions.ts"),
  "utf8",
);
const USE_CARD_CREATION = readFileSync(
  join(TEST_DIR, "../app/card-creation/hooks/useCardCreation.ts"),
  "utf8",
);

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

function extractUniversalIds(source: string): string[] {
  const start = source.indexOf("const UNIVERSAL_QUESTIONS");
  const end = source.indexOf("];", start);
  const block = source.slice(start, end + 1);
  const ids = [...block.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]!);
  return ids;
}

section("Objective removed; primary occupies former position");
{
  const ids = extractUniversalIds(FLOW_SOURCE);
  expectTrue("no objective id", !ids.includes("objective"));
  expectTrue("has primaryOccasionContext", ids.includes("primaryOccasionContext"));

  const occasionIdx = ids.indexOf("occasion");
  const birthdayIdx = ids.indexOf("birthday");
  const holidayIdx = ids.indexOf("holidayName");
  const primaryIdx = ids.indexOf("primaryOccasionContext");
  const toneIdx = ids.indexOf("tone");

  expectTrue("primary after occasion", primaryIdx > occasionIdx);
  expectTrue("primary after birthday slot", primaryIdx > birthdayIdx);
  expectTrue("primary after holidayName slot", primaryIdx > holidayIdx);
  expectTrue("tone after primary", toneIdx === primaryIdx + 1);
  expectTrue("no OBJECTIVES constant", !FLOW_SOURCE.includes("const OBJECTIVES"));
  expectTrue(
    "no What should this card mainly do",
    !FLOW_SOURCE.includes("What should this card mainly do?"),
  );
}

section("wizard clears primary on occasion change and validates");
{
  expectTrue(
    "clears via helper",
    FLOW_SOURCE.includes("clearPrimaryOccasionContextOnOccasionChange"),
  );
  expectTrue(
    "validates primary",
    FLOW_SOURCE.includes("isValidPrimaryOccasionContext"),
  );
  expectTrue(
    "resolves dynamic question",
    FLOW_SOURCE.includes("resolveGuestPrimaryOccasionQuestion"),
  );
  expectTrue(
    "packs via packTryGenerateCardBody",
    FLOW_SOURCE.includes("packTryGenerateCardBody"),
  );
  expectTrue(
    "primary in REAL_DETAIL_FIELDS",
    FLOW_SOURCE.includes('"primaryOccasionContext"'),
  );
}

section("request packing omits objective");
{
  expectTrue(
    "pack module has no objective property",
    !PACK_SOURCE.includes("objective:") && !PACK_SOURCE.includes("objective?,"),
  );
  expectTrue(
    "pack includes primaryOccasionContext",
    PACK_SOURCE.includes("primaryOccasionContext"),
  );
}

section("authenticated card creation outside /try unchanged");
{
  expectTrue(
    "useCardCreation still hits /api/generate-card",
    USE_CARD_CREATION.includes("/api/generate-card"),
  );
  expectTrue(
    "useCardCreation does not use primaryOccasionContext",
    !USE_CARD_CREATION.includes("primaryOccasionContext"),
  );
}

section("no Brain / Event Domain coupling in guest modules");
{
  for (const [label, source] of [
    ["guest questions", GUEST_Q_SOURCE],
    ["pack body", PACK_SOURCE],
  ] as const) {
    expectTrue(`${label}: no @workspace/events`, !source.includes("@workspace/events"));
    expectTrue(`${label}: no brain/`, !source.includes("brain/"));
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("Failures:", failures);
  process.exit(1);
}
