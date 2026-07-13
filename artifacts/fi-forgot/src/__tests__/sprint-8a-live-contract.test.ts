/**
 * Sprint 8A live-contract verification helpers (no OpenAI required).
 *
 * Run with:
 *   npx tsx --tsconfig artifacts/fi-forgot/tsconfig.json artifacts/fi-forgot/src/__tests__/sprint-8a-live-contract.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  clearPrimaryOccasionContextOnOccasionChange,
  isValidPrimaryOccasionContext,
  resolveGuestPrimaryOccasionQuestion,
} from "../app/card-creation/guestOccasionPrimaryQuestions.js";
import { packTryGenerateCardBody } from "../app/card-creation/packTryGenerateCardBody.js";
import { appendPrimaryAndSupportingDetailLines } from "../../../api-server/src/routes/v2GenerateCardContextLines.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const FLOW_SOURCE = readFileSync(join(TEST_DIR, "../pages/card-flow-v2.tsx"), "utf8");
const ROUTE_SOURCE = readFileSync(
  join(TEST_DIR, "../../../api-server/src/routes/v2-generate-card.ts"),
  "utf8",
);
const USE_CARD = readFileSync(
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

section("required Mom / Thank You live scenario contract");
{
  const question = resolveGuestPrimaryOccasionQuestion("Thank You", "Mom");
  expect("question", question, "What are you thanking Mom for?");
  expectTrue(
    "primary valid",
    isValidPrimaryOccasionContext("She watched the kids while I was sick."),
  );
  expectTrue("whitespace rejected", !isValidPrimaryOccasionContext("   "));

  const body = packTryGenerateCardBody({
    firstName: "Mom",
    relationship: "Mom",
    occasion: "Thank You",
    primaryOccasionContext: "She watched the kids while I was sick.",
    tone: "Heartfelt",
    emotionalOpenness: "Meaningful But Not Mushy",
    avoidList: [],
    details: "She always butters my bread.",
    relAnswers: {},
    senderName: "Me",
  });

  expect("has primary", body.primaryOccasionContext, "She watched the kids while I was sick.");
  expect("has supporting details", body.details, "She always butters my bread.");
  expectTrue("no objective", !("objective" in body));

  const lines: string[] = [];
  appendPrimaryAndSupportingDetailLines(
    lines,
    body.primaryOccasionContext,
    body.details,
  );
  expectTrue("primary line first", lines[0]!.includes("Primary reason for this card:"));
  expectTrue("supporting second", lines[1]!.includes("Supporting memory or personal detail:"));
  expectTrue("kids in primary", lines[0]!.includes("watched the kids"));
  expectTrue("bread in supporting", lines[1]!.includes("butters my bread"));
}

section("occasion smoke questions");
{
  expect(
    "Birthday",
    resolveGuestPrimaryOccasionQuestion("Birthday", "Mom"),
    "What would you most like to celebrate about Mom this birthday?",
  );
  expect(
    "Congratulations",
    resolveGuestPrimaryOccasionQuestion("Congratulations", "Sam"),
    "What accomplishment are you celebrating?",
  );
  expect(
    "Sympathy",
    resolveGuestPrimaryOccasionQuestion("Sympathy", "Mom"),
    "What happened, or what would you like to acknowledge?",
  );
  expect(
    "Holiday Christmas",
    resolveGuestPrimaryOccasionQuestion("Holiday", "Mom", "Christmas"),
    "What do you want this Christmas card to focus on?",
  );
  expect(
    "unsupported fallback",
    resolveGuestPrimaryOccasionQuestion("Not A Real Occasion", "Mom"),
    "What is the main thing this card should say?",
  );
}

section("stale primary + name wording");
{
  const cleared = clearPrimaryOccasionContextOnOccasionChange({
    occasion: "Birthday",
    primaryOccasionContext: "She watched the kids while I was sick.",
  });
  expect("cleared on occasion change", cleared.primaryOccasionContext, undefined);
  expect(
    "name update only changes wording",
    resolveGuestPrimaryOccasionQuestion("Thank You", "Dad"),
    "What are you thanking Dad for?",
  );
}

section("wizard + API + auth compatibility source checks");
{
  expectTrue("no Objective question copy", !FLOW_SOURCE.includes("What should this card mainly do?"));
  expectTrue("primary step present", FLOW_SOURCE.includes('id: "primaryOccasionContext"'));
  expectTrue("primary in REAL_DETAIL_FIELDS", FLOW_SOURCE.includes('"primaryOccasionContext"'));
  expectTrue("results chip not full answer", FLOW_SOURCE.includes('"primary reason"'));
  expectTrue("no old objective chip logic", !FLOW_SOURCE.includes("getA(\"objective\")"));
  expectTrue("PRIMARY REASON RULE", ROUTE_SOURCE.includes("PRIMARY REASON RULE"));
  expectTrue("no label leak instruction", ROUTE_SOURCE.includes('Never print internal labels'));
  expectTrue("objective default kept", ROUTE_SOURCE.includes('objective = "Tell Them I Appreciate Them"'));
  expectTrue("auth path unchanged", USE_CARD.includes("/api/generate-card"));
  expectTrue("auth path no primary", !USE_CARD.includes("primaryOccasionContext"));
  expectTrue("no events import in flow", !FLOW_SOURCE.includes("@workspace/events"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("Failures:", failures);
  process.exit(1);
}
