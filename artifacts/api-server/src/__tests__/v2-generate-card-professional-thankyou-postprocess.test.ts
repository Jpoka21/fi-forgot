/**
 * Sprint 9B.2 attempt 3 — professional Thank You post-generation normalization.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/v2-generate-card-professional-thankyou-postprocess.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  applyProfessionalThankYouPostProcess,
  isDeedThankSentence,
  isGratitudeRestatementSentence,
  isProfessionalThankYouOccasion,
  splitBodyAndSignOff,
  stripProfessionalThankYouGratitudeStack,
} from "../routes/v2ProfessionalThankYouPostProcess.js";
import { signOffContainsGratitudeLanguage } from "../routes/v2GenerateCardContextLines.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROUTE_SOURCE = readFileSync(join(TEST_DIR, "../routes/v2-generate-card.ts"), "utf8");

const G11_SIGN_OFF = "Thanks again — Taylor";
const G13_SIGN_OFF = "Grateful — The Park family";

const G11_STACKED = `Sam—thank you for covering my client calls last Thursday so I could make the school pickup.
Knowing the calls were handled let me take care of that pickup without scrambling, and everything stayed on track.
If you ever need coverage, I'm glad to return the favor.
I'm genuinely grateful you took those calls. Thanks again — Taylor`;

const G11_ATTEMPT1 = `Sam—thank you for covering my client calls last Thursday so I could make the school pickup.
That coverage took real pressure off a tight afternoon on my end.
If you ever need coverage, I'm glad to return the favor.
I really appreciate it. Thanks again — Taylor`;

const G13_TEXT = `Ms. Alvarez,
Thank you for helping my daughter get confident at reading this year. She used to hide behind her hair when it was her turn; now she volunteers to read aloud. That confidence will carry her well beyond this year. Grateful — The Park family`;

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

function expectFalse(label: string, value: boolean): void {
  expect(label, value, false);
}

function section(name: string) {
  console.log(`\n${name}`);
}

section("classifiers");
{
  expectTrue("deed thank detects thank you for", isDeedThankSentence("Thank you for covering my calls."));
  expectTrue("deed thank detects thanks for", isDeedThankSentence("Thanks for jumping in last week."));
  expectFalse(
    "grateful restatement is not deed thank",
    isDeedThankSentence("I'm genuinely grateful you took those calls."),
  );
  expectTrue(
    "grateful restatement detected",
    isGratitudeRestatementSentence("I'm genuinely grateful you took those calls."),
  );
  expectTrue(
    "appreciate restatement detected",
    isGratitudeRestatementSentence("I really appreciate it."),
  );
  expectFalse(
    "reciprocity line is not gratitude restatement",
    isGratitudeRestatementSentence("I'm glad to return the favor."),
  );
  expectFalse(
    "practical close is not gratitude restatement",
    isGratitudeRestatementSentence("It made a difficult afternoon much easier."),
  );
  expectFalse(
    "deed thank is not gratitude restatement",
    isGratitudeRestatementSentence("Thank you again for covering those calls."),
  );
}

section("G11 triple-stack removal");
{
  const result = stripProfessionalThankYouGratitudeStack(G11_STACKED, G11_SIGN_OFF);
  expectTrue("G11 stack strip applied", result.applied);
  expectTrue("G11 removed grateful sentence", result.removedSentence?.includes("genuinely grateful") ?? false);
  expectFalse("G11 output has no grateful final body", /\nI'm genuinely grateful/i.test(result.text));
  expectTrue("G11 preserves opening deed thank", result.text.includes("thank you for covering"));
  expectTrue("G11 preserves reciprocity line", result.text.includes("glad to return the favor"));
  expectTrue("G11 preserves exact sign-off", result.text.endsWith(G11_SIGN_OFF));
  expectTrue("G11 sign-off on own line", result.text.includes(`\n${G11_SIGN_OFF}`));
}

section("attempt-1 shaped removal");
{
  const result = stripProfessionalThankYouGratitudeStack(G11_ATTEMPT1, G11_SIGN_OFF);
  expectTrue("attempt-1 strip applied", result.applied);
  expectTrue("attempt-1 removed appreciate sentence", result.removedSentence === "I really appreciate it.");
}

section("merged body/sign-off line");
{
  const merged = "Body line.\nI'm genuinely grateful you took those calls. Thanks again — Taylor";
  const split = splitBodyAndSignOff(merged, G11_SIGN_OFF);
  expectTrue("merged line sign-off found", split !== null);
  expectTrue("merged line body extracted", split?.body.includes("genuinely grateful") ?? false);
  const result = stripProfessionalThankYouGratitudeStack(
    `Sam—thank you for covering my client calls last Thursday so I could make the school pickup.\n${merged}`,
    G11_SIGN_OFF,
  );
  expectTrue("merged card strip applied", result.applied);
  expectTrue("merged card ends with exact sign-off", result.text.endsWith(G11_SIGN_OFF));
}

section("meaningful closing sentences preserved");
{
  const cases = [
    `Sam—thank you for covering my client calls.\nI'm glad I could return the favor.\n${G11_SIGN_OFF}`,
    `Sam—thank you for covering my client calls.\nYour help kept the client transition on schedule.\n${G11_SIGN_OFF}`,
    `Sam—thank you for covering my client calls.\nPlease know I'm here when you need coverage.\n${G11_SIGN_OFF}`,
    `Sam—thank you for covering my client calls.\nIt made a difficult afternoon much easier.\n${G11_SIGN_OFF}`,
    `Sam—thank you for covering my client calls.\nIf you ever need coverage, I'm glad to return the favor.\n${G11_SIGN_OFF}`,
  ];
  for (const [i, text] of cases.entries()) {
    const result = stripProfessionalThankYouGratitudeStack(text, G11_SIGN_OFF);
    expectFalse(`meaningful close ${i + 1} unchanged`, result.applied);
    expect(`meaningful close ${i + 1} text preserved`, result.text, text);
  }
}

section("G13 protector unchanged");
{
  const result = stripProfessionalThankYouGratitudeStack(G13_TEXT, G13_SIGN_OFF);
  expectFalse("G13 no strip", result.applied);
  expect("G13 text unchanged", result.text, G13_TEXT);
}

section("out-of-scope cards unchanged");
{
  const momThankYou = `Mom—thank you for always picking up the phone.\nI'm grateful for everything you do.\nLove always`;
  const momResult = applyProfessionalThankYouPostProcess(momThankYou, {
    isProThankYou: false,
    signOff: "Love always",
  });
  expectFalse("personal Mom Thank You skipped", momResult.applied);
  expect("personal Mom Thank You unchanged", momResult.text, momThankYou);

  const anniversary = `Sarah—another year of ordinary Tuesdays.\nHere's to many more.\nAll my love — James`;
  const annResult = applyProfessionalThankYouPostProcess(anniversary, {
    isProThankYou: isProfessionalThankYouOccasion(false, "Anniversary"),
    signOff: "All my love — James",
  });
  expectFalse("anniversary skipped", annResult.applied);

  const congrats = `Jake—your marathon finish was incredible.\nProud of you.\n— Dad`;
  const conResult = applyProfessionalThankYouPostProcess(congrats, {
    isProThankYou: isProfessionalThankYouOccasion(false, "Congratulations"),
    signOff: "— Dad",
  });
  expectFalse("congratulations skipped", conResult.applied);
}

section("sign-off and gate behavior");
{
  const deedOnly = `Sam—thank you for covering my client calls.\nThanks again — Taylor`;
  const deedResult = stripProfessionalThankYouGratitudeStack(deedOnly, G11_SIGN_OFF);
  expectFalse("deed thank + sign-off only unchanged", deedResult.applied);

  const noSignOff = stripProfessionalThankYouGratitudeStack(G11_STACKED, "");
  expectFalse("empty sign-off no-op", noSignOff.applied);

  const plainSignOff = stripProfessionalThankYouGratitudeStack(G11_STACKED, "— Taylor");
  expectFalse("non-gratitude sign-off no-op", plainSignOff.applied);

  const missingSignOff = stripProfessionalThankYouGratitudeStack(
    "Sam—thank you for covering my client calls.\nI'm genuinely grateful you took those calls.",
    G11_SIGN_OFF,
  );
  expectFalse("sign-off not found no-op", missingSignOff.applied);

  expectTrue(
    "user sign-off preserved exactly in output",
    stripProfessionalThankYouGratitudeStack(G11_STACKED, G11_SIGN_OFF).text.endsWith(G11_SIGN_OFF),
  );
  expectTrue(
    "gratitude sign-off still gratitude-bearing after strip",
    signOffContainsGratitudeLanguage(G11_SIGN_OFF),
  );
}

section("deed-thank final sentence preserved");
{
  const text = `Sam—thank you for covering my client calls.\nThank you again for covering those calls.\n${G11_SIGN_OFF}`;
  const result = stripProfessionalThankYouGratitudeStack(text, G11_SIGN_OFF);
  expectFalse("final deed thank not removed", result.applied);
}

section("route wiring");
{
  expectTrue(
    "route imports applyProfessionalThankYouPostProcess",
    ROUTE_SOURCE.includes("applyProfessionalThankYouPostProcess"),
  );
  expectTrue(
    "route calls post-process after character strip",
    ROUTE_SOURCE.includes("const postProcessed = applyProfessionalThankYouPostProcess(strippedText") &&
      ROUTE_SOURCE.includes("stripFabricatedCharacterAdjectives"),
  );
  expectTrue(
    "route gates with isProThankYou",
    ROUTE_SOURCE.includes("isProThankYou"),
  );
  expectTrue(
    "route still slices to one card",
    ROUTE_SOURCE.includes("parsed.cards.slice(0, 1)"),
  );
  expectTrue(
    "generate-card route has single OpenAI completion create",
    ROUTE_SOURCE
      .slice(
        ROUTE_SOURCE.indexOf('router.post("/v2/generate-card"'),
        ROUTE_SOURCE.indexOf('router.post("/v2/card-feedback"'),
      )
      .split("openai.chat.completions.create").length -
      1 ===
      1,
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("Failures:", failures);
  process.exit(1);
}
