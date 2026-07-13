/**
 * /try generate-card request packing tests (Sprint 8A).
 *
 * Run with:
 *   npx tsx --tsconfig artifacts/fi-forgot/tsconfig.json artifacts/fi-forgot/src/__tests__/pack-try-generate-card-body.test.ts
 */

import { packTryGenerateCardBody } from "../app/card-creation/packTryGenerateCardBody.js";

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

section("request includes primaryOccasionContext and keeps details separate");
{
  const body = packTryGenerateCardBody({
    firstName: "Mom",
    relationship: "Mom",
    occasion: "Thank You",
    primaryOccasionContext: "She watched the kids while I was sick.",
    tone: "Heartfelt",
    emotionalOpenness: "Meaningful But Not Mushy",
    avoidList: [],
    interests: undefined,
    details: "She always butters my bread.",
    relAnswers: { parentPersonality: "Supportive" },
    senderName: "Me",
  });

  expect("primaryOccasionContext", body.primaryOccasionContext, "She watched the kids while I was sick.");
  expect("details is supporting only", body.details, "She always butters my bread.");
  expectTrue("no objective field", !("objective" in body));
  expect("firstName", body.firstName, "Mom");
  expect("occasion", body.occasion, "Thank You");
}

section("interests merge into supporting details only");
{
  const body = packTryGenerateCardBody({
    firstName: "Sam",
    relationship: "Friend",
    occasion: "Birthday",
    primaryOccasionContext: "Turning 30 and finishing grad school.",
    tone: "Funny",
    emotionalOpenness: "A Little Appreciation At The End",
    avoidList: ["Too Cheesy"],
    interests: "hiking",
    details: "We hiked Rainier last year.",
    relAnswers: {},
    senderName: "Alex",
  });

  expectTrue("details includes interests", body.details.includes("Their interests: hiking"));
  expectTrue("details includes memory", body.details.includes("We hiked Rainier last year."));
  expectTrue(
    "primary not merged into details",
    !body.details.includes("Turning 30"),
  );
  expect(
    "primary remains distinct",
    body.primaryOccasionContext,
    "Turning 30 and finishing grad school.",
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("Failures:", failures);
  process.exit(1);
}
