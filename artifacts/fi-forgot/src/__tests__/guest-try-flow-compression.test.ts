/**
 * Sprint 8C.1 — guest /try skips REL_QUESTIONS; compressed universal order.
 *
 * Run with:
 *   npx tsx --tsconfig artifacts/fi-forgot/tsconfig.json artifacts/fi-forgot/src/__tests__/guest-try-flow-compression.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  GUEST_TRY_EXCLUDED_STEP_IDS,
  GUEST_TRY_STEP_IDS,
  buildGuestTrySteps,
  isGuestTryExcludedStepId,
} from "../app/card-creation/guestTryFlowSteps.js";
import { packTryGenerateCardBody } from "../app/card-creation/packTryGenerateCardBody.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const FLOW_SOURCE = readFileSync(join(TEST_DIR, "../pages/card-flow-v2.tsx"), "utf8");
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

function extractBlockIds(source: string, constName: string): string[] {
  const start = source.indexOf(`const ${constName}`);
  expectTrue(`${constName} exists`, start >= 0);
  const end = source.indexOf("];", start);
  const block = source.slice(start, end + 1);
  return [...block.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]!);
}

section("guest step order matches Sprint 8C.1");
{
  const universalIds = extractBlockIds(FLOW_SOURCE, "UNIVERSAL_QUESTIONS");
  const guestSteps = buildGuestTrySteps(universalIds.map((id) => ({ id })));
  const guestIds = guestSteps.map((s) => s.id);

  expect("guest ids", guestIds, [...GUEST_TRY_STEP_IDS]);
  expectTrue("occasion first", guestIds[0] === "occasion");
  expectTrue(
    "primary before details",
    guestIds.indexOf("primaryOccasionContext") < guestIds.indexOf("details"),
  );
  expectTrue(
    "details before tone",
    guestIds.indexOf("details") < guestIds.indexOf("tone"),
  );
  expectTrue(
    "tone before emotional",
    guestIds.indexOf("tone") < guestIds.indexOf("emotionalOpenness"),
  );
  expectTrue(
    "emotional before avoidMentioning",
    guestIds.indexOf("emotionalOpenness") < guestIds.indexOf("avoidMentioning"),
  );
  expectTrue("avoidMentioning last", guestIds[guestIds.length - 1] === "avoidMentioning");
}

section("guest skips relationship profile and deferred prefs");
{
  for (const id of [
    "parentPersonality",
    "parentFact",
    "friendType",
    "commStyle",
    "roastingLevel",
    "olderYounger",
    "siblingCloseness",
    "siblingFact",
    "timeTogether",
    "spouseSmile",
    "childAge",
    "proudOf",
    "proStrength",
    "recognizingFor",
    "grandFact",
    "avoidList",
    "interests",
    "signOff",
  ]) {
    expectTrue(`excludes ${id}`, isGuestTryExcludedStepId(id));
    expectTrue(
      `${id} not in guest order`,
      !(GUEST_TRY_STEP_IDS as readonly string[]).includes(id),
    );
  }
  expectTrue(
    "excluded list covers profile + deferred",
    GUEST_TRY_EXCLUDED_STEP_IDS.length >= 18,
  );
}

section("card-flow wires guest vs authenticated builders");
{
  expectTrue("imports buildGuestTrySteps", FLOW_SOURCE.includes("buildGuestTrySteps"));
  expectTrue("has buildGuestSteps", FLOW_SOURCE.includes("function buildGuestSteps"));
  expectTrue(
    "has buildAuthenticatedSteps",
    FLOW_SOURCE.includes("function buildAuthenticatedSteps"),
  );
  expectTrue(
    "advanceFromWho branches on isLoggedIn",
    FLOW_SOURCE.includes("isLoggedIn") &&
      FLOW_SOURCE.includes("buildAuthenticatedSteps(relationship)") &&
      FLOW_SOURCE.includes("buildGuestSteps()"),
  );
  expectTrue(
    "authenticated still spreads REL_QUESTIONS",
    FLOW_SOURCE.includes("...(REL_QUESTIONS[group] ?? [])"),
  );
  expectTrue(
    "legacy buildSteps(rel) removed",
    !FLOW_SOURCE.includes("function buildSteps(rel"),
  );
}

section("authenticated UNIVERSAL order unchanged (8A contract)");
{
  const ids = extractBlockIds(FLOW_SOURCE, "UNIVERSAL_QUESTIONS");
  const primaryIdx = ids.indexOf("primaryOccasionContext");
  const toneIdx = ids.indexOf("tone");
  expectTrue("auth universal still has primary", primaryIdx >= 0);
  expectTrue("auth universal tone immediately after primary", toneIdx === primaryIdx + 1);
  expectTrue("auth universal still has avoidList", ids.includes("avoidList"));
  expectTrue("auth universal still has interests", ids.includes("interests"));
  expectTrue("auth universal still has signOff", ids.includes("signOff"));
}

section("payload contract still valid without relAnswers / deferred fields");
{
  const body = packTryGenerateCardBody({
    firstName: "Mom",
    relationship: "Mom",
    occasion: "Thank You",
    primaryOccasionContext: "Helping me get new insurance.",
    tone: "Heartfelt",
    emotionalOpenness: "Meaningful But Not Mushy",
    avoidList: [],
    details: "That time she flew to my college.",
    avoidMentioning: "ex-partner",
    relAnswers: {},
    senderName: "Me",
  });
  expect("primary preserved", body.primaryOccasionContext, "Helping me get new insurance.");
  expect("details preserved", body.details, "That time she flew to my college.");
  expect("empty relAnswers", body.relAnswers, {});
  expectTrue("no objective", !("objective" in body));
  expectTrue("avoidMentioning optional ok", body.avoidMentioning === "ex-partner");
}

section("authenticated card creation outside /try unchanged");
{
  expectTrue("useCardCreation still /api/generate-card", USE_CARD.includes("/api/generate-card"));
  expectTrue("useCardCreation no primaryOccasionContext", !USE_CARD.includes("primaryOccasionContext"));
  expectTrue("useCardCreation no buildGuestTrySteps", !USE_CARD.includes("buildGuestTrySteps"));
}

section("no Brain / Event Domain coupling");
{
  const guestStepsSrc = readFileSync(
    join(TEST_DIR, "../app/card-creation/guestTryFlowSteps.ts"),
    "utf8",
  );
  expectTrue("no @workspace/events", !guestStepsSrc.includes("@workspace/events"));
  expectTrue("no brain/", !guestStepsSrc.includes("brain/"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("Failures:", failures);
  process.exit(1);
}
