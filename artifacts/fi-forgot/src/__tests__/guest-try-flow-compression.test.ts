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
  GUEST_DEFAULT_EMOTIONAL_OPENNESS,
  GUEST_INTENSITY_CHOICES,
  GUEST_TRY_EXCLUDED_STEP_IDS,
  GUEST_TRY_STEP_IDS,
  GUEST_WHO_SUBTITLE,
  buildGuestTrySteps,
  isGuestTryExcludedStepId,
  resolveEmotionalOpennessOrDefault,
  resolveGuestIntensityLabel,
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

section("guest step order matches Sprint 8C.1–8C.4");
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
    "no separate emotionalOpenness step",
    !guestIds.includes("emotionalOpenness"),
  );
  expectTrue(
    "no dedicated avoidMentioning step",
    !guestIds.includes("avoidMentioning"),
  );
  expectTrue("no birthday date step for guests", !guestIds.includes("birthday"));
  expectTrue("holidayName still in guest catalog", guestIds.includes("holidayName"));
  expectTrue("tone is last guest step", guestIds[guestIds.length - 1] === "tone");
}

section("Sprint 8C.4 occasion paths: Birthday vs Holiday vs Thank You");
{
  type Step = {
    id: string;
    condition?: (a: Record<string, string | string[]>) => boolean;
  };

  // Mirror UNIVERSAL conditions used by the wizard for guest filtering.
  const guestCatalog: Step[] = buildGuestTrySteps([
    { id: "occasion" },
    {
      id: "holidayName",
      condition: (a) => a["occasion"] === "Holiday",
    },
    { id: "primaryOccasionContext" },
    { id: "details" },
    { id: "tone" },
  ]);

  function visibleIds(occasion: string): string[] {
    const answers = { occasion };
    return guestCatalog
      .filter((s) => !s.condition || s.condition(answers))
      .map((s) => s.id);
  }

  expect("Thank You path", visibleIds("Thank You"), [
    "occasion",
    "primaryOccasionContext",
    "details",
    "tone",
  ]);
  expect("Birthday path skips date", visibleIds("Birthday"), [
    "occasion",
    "primaryOccasionContext",
    "details",
    "tone",
  ]);
  expect("Holiday path keeps holidayName", visibleIds("Holiday"), [
    "occasion",
    "holidayName",
    "primaryOccasionContext",
    "details",
    "tone",
  ]);

  expectTrue("birthday excluded for guests", isGuestTryExcludedStepId("birthday"));

  const birthdayBody = packTryGenerateCardBody({
    firstName: "Mom",
    relationship: "Mom",
    occasion: "Birthday",
    primaryOccasionContext: "Her kindness this year.",
    tone: "Heartfelt",
    emotionalOpenness: resolveEmotionalOpennessOrDefault(undefined),
    avoidList: [],
    details: "",
    relAnswers: {},
    senderName: "Me",
  });
  expectTrue(
    "no birthday packed when omitted",
    !("birthday" in birthdayBody) || birthdayBody.birthday === undefined,
  );
  expectTrue(
    "no placeholder birthday date",
    birthdayBody.birthday !== "1970-01-01" &&
      birthdayBody.birthday !== "01/01" &&
      !(birthdayBody.birthday ?? "").includes("TBD"),
  );
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
    "emotionalOpenness",
    "avoidMentioning",
    "birthday",
  ]) {
    expectTrue(`excludes ${id}`, isGuestTryExcludedStepId(id));
    expectTrue(
      `${id} not in guest order`,
      !(GUEST_TRY_STEP_IDS as readonly string[]).includes(id),
    );
  }
  expectTrue(
    "excluded list covers profile + deferred + folded + birthday",
    GUEST_TRY_EXCLUDED_STEP_IDS.length >= 21,
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
  expectTrue(
    "auth universal still has separate emotionalOpenness step",
    ids.includes("emotionalOpenness"),
  );
  expectTrue(
    "auth emotionalOpenness still follows tone",
    ids.indexOf("emotionalOpenness") === toneIdx + 1,
  );
  expectTrue(
    "auth universal still has dedicated avoidMentioning",
    ids.includes("avoidMentioning"),
  );
  expectTrue(
    "auth universal still has birthday date step",
    ids.includes("birthday"),
  );
  expectTrue(
    "auth birthday still follows occasion",
    ids.indexOf("birthday") === ids.indexOf("occasion") + 1,
  );
}

section("Sprint 8C.2 guest tone+intensity maps to existing emotionalOpenness values");
{
  expect(
    "default matches API default",
    GUEST_DEFAULT_EMOTIONAL_OPENNESS,
    "Meaningful But Not Mushy",
  );
  expect(
    "empty defaults to Meaningful But Not Mushy",
    resolveEmotionalOpennessOrDefault(""),
    "Meaningful But Not Mushy",
  );
  expect(
    "undefined defaults",
    resolveEmotionalOpennessOrDefault(undefined),
    "Meaningful But Not Mushy",
  );
  expect(
    "preserves explicit Deep",
    resolveEmotionalOpennessOrDefault("Deep And Emotional"),
    "Deep And Emotional",
  );
  expect(
    "preserves auth Clearly Heartfelt",
    resolveEmotionalOpennessOrDefault("Clearly Heartfelt"),
    "Clearly Heartfelt",
  );
  expect("Light maps to existing value", GUEST_INTENSITY_CHOICES[0]!.emotionalOpenness, "A Little Appreciation At The End");
  expect("Warm maps to default", GUEST_INTENSITY_CHOICES[1]!.emotionalOpenness, "Meaningful But Not Mushy");
  expect("Deep maps to existing value", GUEST_INTENSITY_CHOICES[2]!.emotionalOpenness, "Deep And Emotional");
  expect("unset intensity label is Warm", resolveGuestIntensityLabel(undefined), "Warm");
  expect("Deep label", resolveGuestIntensityLabel("Deep And Emotional"), "Deep");

  expectTrue(
    "guest tone UI assigns both fields",
    FLOW_SOURCE.includes("emotionalOpenness: resolveEmotionalOpennessOrDefault") &&
      FLOW_SOURCE.includes("isGuestToneStep"),
  );
  expectTrue(
    "guest intensity choices rendered",
    FLOW_SOURCE.includes("GUEST_INTENSITY_CHOICES"),
  );
}

section("Sprint 8C.3 guest Tone screen hosts optional avoidMentioning");
{
  expectTrue(
    "collapsed avoid control present",
    FLOW_SOURCE.includes("Anything we should avoid mentioning?"),
  );
  expectTrue(
    "stores avoidMentioning answer",
    FLOW_SOURCE.includes('avoidMentioning: e.target.value') ||
      FLOW_SOURCE.includes("avoidMentioning: e.target.value"),
  );
  expectTrue(
    "tone selection stays on screen (no auto-advance)",
    FLOW_SOURCE.includes("Stay on screen so optional avoid-mentioning"),
  );
  expectTrue(
    "explicit GENERATE advances after tone",
    FLOW_SOURCE.includes("GENERATE →") && FLOW_SOURCE.includes("guestToneReady"),
  );
  expectTrue("guestAvoidOpen state", FLOW_SOURCE.includes("guestAvoidOpen"));

  const withAvoid = packTryGenerateCardBody({
    firstName: "Mom",
    relationship: "Mom",
    occasion: "Thank You",
    primaryOccasionContext: "Helping me get new insurance.",
    tone: "Heartfelt",
    emotionalOpenness: resolveEmotionalOpennessOrDefault(undefined),
    avoidList: [],
    details: "",
    avoidMentioning: "divorce",
    relAnswers: {},
    senderName: "Me",
  });
  expect("packs avoidMentioning", withAvoid.avoidMentioning, "divorce");

  const blankAvoid = packTryGenerateCardBody({
    firstName: "Mom",
    relationship: "Mom",
    occasion: "Thank You",
    primaryOccasionContext: "Helping me get new insurance.",
    tone: "Heartfelt",
    emotionalOpenness: "Meaningful But Not Mushy",
    avoidList: [],
    details: "",
    relAnswers: {},
    senderName: "Me",
  });
  expectTrue(
    "blank avoid omits or empty field ok",
    blankAvoid.avoidMentioning === undefined || blankAvoid.avoidMentioning === "",
  );
}

section("select CONTINUE vs guest Tone GENERATE (rebase resolution)");
{
  expectTrue(
    "select no longer auto-advances in setAnswer",
    !/kind === "select"\)\s*advanceStep/.test(FLOW_SOURCE) &&
      !FLOW_SOURCE.includes('if (currentStep.kind === "select") advanceStep'),
  );
  expectTrue(
    "non-guest-tone select shows CONTINUE",
    FLOW_SOURCE.includes("isSelectKind && !isGuestToneStep") &&
      FLOW_SOURCE.includes("CONTINUE →"),
  );
  expectTrue(
    "guest Tone still uses GENERATE not CONTINUE auto path",
    FLOW_SOURCE.includes("advanceGuestTone") &&
      FLOW_SOURCE.includes("GENERATE →") &&
      FLOW_SOURCE.includes("isGuestToneStep"),
  );
  expectTrue(
    "guest Tone still has intensity / avoid / signOff / sticky",
    FLOW_SOURCE.includes("GUEST_INTENSITY_CHOICES") &&
      FLOW_SOURCE.includes("Anything we should avoid mentioning?") &&
      FLOW_SOURCE.includes("How should we sign it?") &&
      FLOW_SOURCE.includes('position: "sticky"') &&
      FLOW_SOURCE.includes("scroll clear of sticky GENERATE"),
  );
}

section("Sprint 8C.6 guest Who copy, signature, sticky GENERATE");
{
  expect(
    "guest Who subtitle constant",
    GUEST_WHO_SUBTITLE,
    "We'll use their name and your relationship to personalize this card.",
  );
  expectTrue("guest Who uses GUEST_WHO_SUBTITLE", FLOW_SOURCE.includes("GUEST_WHO_SUBTITLE"));
  expectTrue(
    "no smarter-profile guest promise",
    !GUEST_WHO_SUBTITLE.toLowerCase().includes("profile that gets smarter") &&
      !GUEST_WHO_SUBTITLE.toLowerCase().includes("every card"),
  );
  expectTrue(
    "stale smarter-profile copy removed from page",
    !FLOW_SOURCE.includes("build a profile that gets smarter with every card"),
  );
  expectTrue(
    "guest signature label",
    FLOW_SOURCE.includes("How should we sign it?"),
  );
  expectTrue(
    "guest signature placeholder",
    FLOW_SOURCE.includes('placeholder="Your name"') ||
      FLOW_SOURCE.includes("placeholder=\"Your name\""),
  );
  expectTrue(
    "stores signOff on guest Tone screen",
    FLOW_SOURCE.includes("signOff: e.target.value"),
  );
  expectTrue(
    "signOff remains excluded as dedicated guest step",
    isGuestTryExcludedStepId("signOff") &&
      !(GUEST_TRY_STEP_IDS as readonly string[]).includes("signOff"),
  );
  expectTrue(
    "sticky GENERATE for mobile reachability",
    FLOW_SOURCE.includes('position: "sticky"') && FLOW_SOURCE.includes("advanceGuestTone"),
  );
  expectTrue(
    "scroll spacer above sticky GENERATE",
    FLOW_SOURCE.includes("scroll clear of sticky GENERATE"),
  );
  expectTrue(
    "auth still has dedicated signOff in UNIVERSAL",
    extractBlockIds(FLOW_SOURCE, "UNIVERSAL_QUESTIONS").includes("signOff"),
  );

  const withSign = packTryGenerateCardBody({
    firstName: "Mom",
    relationship: "Mom",
    occasion: "Thank You",
    primaryOccasionContext: "Helping me get new insurance.",
    tone: "Heartfelt",
    emotionalOpenness: resolveEmotionalOpennessOrDefault(undefined),
    avoidList: [],
    details: "",
    signOff: "Love, Alex",
    relAnswers: {},
    senderName: "Me",
  });
  expect("packs guest signOff", withSign.signOff, "Love, Alex");

  const blankSign = packTryGenerateCardBody({
    firstName: "Mom",
    relationship: "Mom",
    occasion: "Thank You",
    primaryOccasionContext: "Helping me get new insurance.",
    tone: "Heartfelt",
    emotionalOpenness: "Meaningful But Not Mushy",
    avoidList: [],
    details: "",
    relAnswers: {},
    senderName: "Me",
  });
  expectTrue(
    "blank signature not invented",
    blankSign.signOff === undefined || blankSign.signOff === "",
  );

  // Screen counts unchanged: 5 standard / 6 holiday (+ Who outside flow steps)
  expect("standard guest flow step ids", [...GUEST_TRY_STEP_IDS], [
    "occasion",
    "holidayName",
    "primaryOccasionContext",
    "details",
    "tone",
  ]);
}

section("guest payload still sends valid emotionalOpenness");
{
  const body = packTryGenerateCardBody({
    firstName: "Mom",
    relationship: "Mom",
    occasion: "Thank You",
    primaryOccasionContext: "Helping me get new insurance.",
    tone: "Heartfelt",
    emotionalOpenness: resolveEmotionalOpennessOrDefault(undefined),
    avoidList: [],
    details: "",
    relAnswers: {},
    senderName: "Me",
  });
  expect(
    "payload emotionalOpenness defaulted",
    body.emotionalOpenness,
    "Meaningful But Not Mushy",
  );
  expect("payload tone preserved", body.tone, "Heartfelt");
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
