/**
 * Sprint 8E — guest /try refine grounding + single-draft FE wiring.
 *
 * Run with:
 *   npx tsx --tsconfig artifacts/fi-forgot/tsconfig.json artifacts/fi-forgot/src/__tests__/try-refine-grounding.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  TRY_REFINE_INSTRUCTIONS,
  buildTryRefineGrounding,
} from "../app/card-creation/buildTryRefineGrounding.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const FLOW_SOURCE = readFileSync(join(TEST_DIR, "../pages/card-flow-v2.tsx"), "utf8");
const ONBOARDING_SOURCE = readFileSync(
  join(TEST_DIR, "../app/components/onboarding/FiOnboardingLegacyFlow.tsx"),
  "utf8",
);

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

section("John birthday refine request grounding");
{
  const grounding = buildTryRefineGrounding({
    firstName: "John",
    relationship: "Friend",
    answers: {
      occasion: "Birthday",
      primaryOccasionContext: "Another year of being great friends",
      details: "When we were kids he had a girl over and lasted five seconds.",
      tone: "Funny",
      // Guest stores API emotionalOpenness; Warm → Meaningful But Not Mushy
      emotionalOpenness: "Meaningful But Not Mushy",
      signOff: "Poka",
    },
  });

  expectTrue("John", grounding.firstName === "John");
  expectTrue("Friend", grounding.relationship === "Friend");
  expectTrue("Birthday", grounding.occasion === "Birthday");
  expectTrue(
    "primary",
    grounding.primaryOccasionContext === "Another year of being great friends",
  );
  expectTrue("five-second memory", /five seconds/i.test(grounding.details ?? ""));
  expectTrue("kids/girl memory", /kids/i.test(grounding.details ?? "") && /girl/i.test(grounding.details ?? ""));
  expectTrue("Funny", grounding.tone === "Funny");
  expectTrue("Warm intensity label", grounding.emotionalOpenness === "Warm");
  expectTrue("Poka", grounding.signOff === "Poka");
}

section("refine action instructions preserve facts");
{
  expectTrue(
    "rewrite asks fresh opening/structure/wording",
    /genuinely different opening/i.test(TRY_REFINE_INSTRUCTIONS.rewrite) &&
      /structural beat order/i.test(TRY_REFINE_INSTRUCTIONS.rewrite) &&
      /substantially fresh wording/i.test(TRY_REFINE_INSTRUCTIONS.rewrite),
  );
  expectTrue(
    "rewrite forbids non-authoritative metaphor reuse",
    /Do not reuse distinctive metaphors/i.test(TRY_REFINE_INSTRUCTIONS.rewrite),
  );
  expectTrue("rewrite keeps facts", /primary reason/i.test(TRY_REFINE_INSTRUCTIONS.rewrite) && /sign-off/i.test(TRY_REFINE_INSTRUCTIONS.rewrite));
  expectTrue("rewrite no invent", /Do not invent/i.test(TRY_REFINE_INSTRUCTIONS.rewrite));
  expectTrue(
    "rewrite normally retains support",
    /normally include one brief recognizable callback/i.test(TRY_REFINE_INSTRUCTIONS.rewrite),
  );
  expectTrue(
    "morePersonal uses existing details",
    /supporting details more effectively/i.test(TRY_REFINE_INSTRUCTIONS.morePersonal) &&
      /do not invent/i.test(TRY_REFINE_INSTRUCTIONS.morePersonal),
  );
  expectTrue(
    "newVersion same facts different take",
    /same authoritative facts/i.test(TRY_REFINE_INSTRUCTIONS.newVersion) &&
      /Do not invent/i.test(TRY_REFINE_INSTRUCTIONS.newVersion),
  );
  expectTrue(
    "newVersion normally retains support",
    /Normally retain a brief recognizable callback/i.test(TRY_REFINE_INSTRUCTIONS.newVersion),
  );
}

section("card-flow-v2 single draft + grounded refine");
{
  expectTrue("imports buildTryRefineGrounding", FLOW_SOURCE.includes("buildTryRefineGrounding"));
  expectTrue("imports TRY_REFINE_INSTRUCTIONS", FLOW_SOURCE.includes("TRY_REFINE_INSTRUCTIONS"));
  expectTrue("sends groundingContext", FLOW_SOURCE.includes("groundingContext"));
  expectTrue("rewrite uses TRY_REFINE_INSTRUCTIONS.rewrite", FLOW_SOURCE.includes("TRY_REFINE_INSTRUCTIONS.rewrite"));
  expectTrue(
    "more personal uses TRY_REFINE_INSTRUCTIONS.morePersonal",
    FLOW_SOURCE.includes("TRY_REFINE_INSTRUCTIONS.morePersonal"),
  );
  expectTrue(
    "New Version uses newVersion instruction",
    FLOW_SOURCE.includes("TRY_REFINE_INSTRUCTIONS.newVersion"),
  );
  expectTrue(
    "initial draft takes cards[0] only",
    FLOW_SOURCE.includes('(data.cards as CardOption[])[0]') ||
      FLOW_SOURCE.includes("data.cards as CardOption[])[0]"),
  );
  expectTrue("Draft 1 label for initial", FLOW_SOURCE.includes('label: "Draft 1"'));
  expectTrue("no Building 3 versions", !FLOW_SOURCE.includes("Building 3 versions"));
  expectTrue("loading says Writing Your Card singular", FLOW_SOURCE.includes("WRITING YOUR CARD"));
  expectTrue(
    "New Version drafts marked after first",
    FLOW_SOURCE.includes("v.id > 1 ? `↩ ${v.label}`"),
  );
  expectTrue(
    "New Version appends draft",
    FLOW_SOURCE.includes("setDraftVersions(prev => [...prev") &&
      FLOW_SOURCE.includes("handleRegenerateDraft"),
  );
  expectTrue(
    "Rewrite/quick adjust replace active draft",
    FLOW_SOURCE.includes("updateCurrentDraft(data.text)"),
  );
}

section("onboarding refine also sends grounding");
{
  expectTrue(
    "onboarding refine has groundingContext",
    ONBOARDING_SOURCE.includes("groundingContext"),
  );
  expectTrue(
    "onboarding still hits refine-card",
    ONBOARDING_SOURCE.includes("/api/v2/refine-card"),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
