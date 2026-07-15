/**
 * Sprint 8E — refine-card factual grounding + legacy compatibility.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/v2-refine-card-grounding.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildAuthoritativeFactsBlock,
  buildRefineSystemPrompt,
  buildRefineUserPrompt,
  normalizeRefineGrounding,
} from "../routes/v2RefineCardGrounding.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROUTE_SOURCE = readFileSync(join(TEST_DIR, "../routes/v2-generate-card.ts"), "utf8");

let passed = 0;
let failed = 0;

function expectTrue(label: string, value: boolean): void {
  if (value) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}`);
  }
}

function section(name: string) {
  console.log(`\n${name}`);
}

const JOHN_GROUNDING = {
  firstName: "John",
  relationship: "Friend",
  occasion: "Birthday",
  primaryOccasionContext: "Another year of being great friends",
  details: "When we were kids he had a girl over and lasted five seconds.",
  tone: "Funny",
  emotionalOpenness: "Warm",
  signOff: "Poka",
};

section("normalizeRefineGrounding");
{
  const empty = normalizeRefineGrounding(undefined);
  expectTrue("undefined → empty object", Object.keys(empty).length === 0);

  const trimmed = normalizeRefineGrounding({
    firstName: "  John  ",
    relationship: "",
    primaryOccasionContext: "  Another year  ",
    avoidList: [" Too Cheesy ", "", "Too Long"],
  });
  expectTrue("trims firstName", trimmed.firstName === "John");
  expectTrue("drops empty relationship", trimmed.relationship === undefined);
  expectTrue("trims primary", trimmed.primaryOccasionContext === "Another year");
  expectTrue(
    "cleans avoidList",
    Array.isArray(trimmed.avoidList) &&
      trimmed.avoidList.length === 2 &&
      trimmed.avoidList.includes("Too Cheesy") &&
      trimmed.avoidList.includes("Too Long"),
  );
}

section("John scenario authoritative facts");
{
  const block = buildAuthoritativeFactsBlock(JOHN_GROUNDING);
  expectTrue("labeled AUTHORITATIVE FACTS", block.includes("AUTHORITATIVE FACTS"));
  expectTrue("John", block.includes("John"));
  expectTrue("Friend", block.includes("Friend"));
  expectTrue("Birthday", block.includes("Birthday"));
  expectTrue("primary reason", block.includes("Another year of being great friends"));
  expectTrue("five-second memory", /five seconds/i.test(block));
  expectTrue("kids / girl memory present", /kids/i.test(block) && /girl/i.test(block));
  expectTrue("Funny tone", block.includes("Funny"));
  expectTrue("Warm intensity", block.includes("Warm"));
  expectTrue("Poka sign-off", block.includes("Poka"));
  expectTrue("Primary reason label", block.includes("Primary reason"));
  expectTrue("Supporting detail label", block.includes("Supporting detail"));
  expectTrue("Sign-off exact label", /Sign-off \(exact\)/i.test(block));
}

section("refine system prompt grounding contract");
{
  const sys = buildRefineSystemPrompt();
  expectTrue("only facts in card or AUTHORITATIVE", /AUTHORITATIVE FACTS/i.test(sys));
  expectTrue("no invention language", /Do NOT invent/i.test(sys));
  expectTrue("no illustrative anecdotes", /illustrative anecdotes/i.test(sys));
  expectTrue("preserve facts unless explicit remove", /Preserve known personal facts/i.test(sys));
  expectTrue("style ≠ invention", /do NOT authorize factual invention/i.test(sys));
  expectTrue("specificity without new facts", /EXISTING facts/i.test(sys));
  expectTrue("sign-off exact once", /exact sign-off once/i.test(sys));
  expectTrue("visible retention", /VISIBLE FACT RETENTION/i.test(sys));
  expectTrue("recover omitted support", /absent from the ORIGINAL CARD/i.test(sys));
  expectTrue("rewrite differentiation", /genuinely different opening/i.test(sys));
  expectTrue("return only revised text", /Return ONLY the revised card text/i.test(sys));
}

section("refine user prompt structure");
{
  const user = buildRefineUserPrompt({
    grounding: JOHN_GROUNDING,
    cardText: "Happy birthday John.\n\nPoka",
    instruction: "Completely rewrite with a fresh opening.",
  });
  expectTrue("AUTHORITATIVE FACTS section", user.includes("AUTHORITATIVE FACTS"));
  expectTrue("ORIGINAL CARD section", user.includes("ORIGINAL CARD:"));
  expectTrue("REQUESTED ADJUSTMENT section", user.includes("REQUESTED ADJUSTMENT"));
  expectTrue(
    "adjustment does not authorize invention",
    /does NOT authorize factual invention/i.test(user),
  );
  expectTrue("includes original card text", user.includes("Happy birthday John."));
  expectTrue("includes instruction", user.includes("fresh opening"));
  expectTrue("primary in facts", user.includes("Another year of being great friends"));
  expectTrue("supporting memory in facts", /five seconds/i.test(user));
  expectTrue("visible retention contract in user", /VISIBLE RETENTION CONTRACT/i.test(user));
  expectTrue(
    "requires weaving support",
    /should normally contain one brief recognizable callback/i.test(user),
  );
}

section("legacy thin context still works");
{
  const legacy = buildRefineUserPrompt({
    grounding: {},
    cardText: "Hi.",
    instruction: "Make warmer.",
    legacyContext: "Friend • Birthday • John",
  });
  expectTrue("legacy label present", /legacy thin context/i.test(legacy));
  expectTrue("legacy string preserved", legacy.includes("Friend • Birthday • John"));
  expectTrue("still has ORIGINAL CARD", legacy.includes("ORIGINAL CARD:"));
}

section("route wiring");
{
  expectTrue("accepts groundingContext", ROUTE_SOURCE.includes("groundingContext"));
  expectTrue("accepts facts alias", ROUTE_SOURCE.includes("body.facts"));
  expectTrue("uses normalizeRefineGrounding", ROUTE_SOURCE.includes("normalizeRefineGrounding"));
  expectTrue("uses buildRefineSystemPrompt", ROUTE_SOURCE.includes("buildRefineSystemPrompt"));
  expectTrue("uses buildRefineUserPrompt", ROUTE_SOURCE.includes("buildRefineUserPrompt"));
  expectTrue(
    "legacy context still read",
    ROUTE_SOURCE.includes("legacyContext: context") || ROUTE_SOURCE.includes("context"),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
