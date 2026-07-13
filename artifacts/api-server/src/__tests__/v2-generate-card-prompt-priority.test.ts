/**
 * Sprint 8B prompt prioritization tests for v2 generate-card.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/v2-generate-card-prompt-priority.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildAuthenticatedContextRules,
  buildMemoryDensityRequirement,
  buildOrderedBodyContextLines,
  buildPrimaryContentPriorityBlock,
  formatMainObjectiveLine,
} from "../routes/v2GenerateCardContextLines.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROUTE_SOURCE = readFileSync(join(TEST_DIR, "../routes/v2-generate-card.ts"), "utf8");
const HELPER_SOURCE = readFileSync(join(TEST_DIR, "../routes/v2GenerateCardContextLines.ts"), "utf8");
const PACK_SOURCE = readFileSync(
  join(TEST_DIR, "../../../fi-forgot/src/app/card-creation/packTryGenerateCardBody.ts"),
  "utf8",
);
const USE_CARD = readFileSync(
  join(TEST_DIR, "../../../fi-forgot/src/app/card-creation/hooks/useCardCreation.ts"),
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

section("ordered body context: primary before relationship and supporting");
{
  const lines = buildOrderedBodyContextLines({
    relAnswers: { parentPersonality: "Supportive" },
    primaryOccasionContext: "She watched the kids while I was sick.",
    details: "She always butters my bread.",
  });

  const primaryIdx = lines.findIndex((l) => l.startsWith("Primary reason for this card:"));
  const relIdx = lines.findIndex((l) => l.startsWith("--- Relationship profile"));
  const supportingIdx = lines.findIndex((l) =>
    l.startsWith("Supporting memory or personal detail:"),
  );

  expectTrue("has primary", primaryIdx === 0);
  expectTrue("has relationship after primary", relIdx > primaryIdx);
  expectTrue("has supporting after relationship", supportingIdx > relIdx);
  expectTrue("primary content", lines[primaryIdx]!.includes("watched the kids"));
  expectTrue("supporting distinct", lines[supportingIdx]!.includes("butters my bread"));
  expectTrue("supporting not merged into primary", !lines[primaryIdx]!.includes("butters"));
}

section("legacy order without primary");
{
  const lines = buildOrderedBodyContextLines({
    relAnswers: { friendType: "Best Friend" },
    details: "We hike together.",
  });
  expectTrue("relationship first without primary", lines[0]!.startsWith("--- Relationship profile"));
  expectTrue(
    "legacy details label",
    lines.some((l) => l.startsWith("Extra details / memories to include:")),
  );
  expectTrue(
    "no supporting label without primary",
    !lines.some((l) => l.startsWith("Supporting memory or personal detail:")),
  );
}

section("content priority and same-reason instruction");
{
  const block = buildPrimaryContentPriorityBlock();
  expectTrue("has CONTENT PRIORITY", block.includes("CONTENT PRIORITY"));
  expectTrue("occasion first", block.includes("1. Occasion"));
  expectTrue("primary mandatory", block.includes("Primary reason — mandatory center"));
  expectTrue("supporting optional", block.includes("Supporting memories — optional"));
  expectTrue(
    "same reason across versions",
    block.includes("revolve around the same primary occasion reason"),
  );
}

section("memory density gated on primary");
{
  const withPrimary = buildMemoryDensityRequirement(true);
  expectTrue("primary-centered label", withPrimary.includes("PRIMARY-CENTERED SPECIFICITY"));
  expectTrue("no second reference required", withPrimary.includes("Do not require a second personal reference"));
  expectTrue("do not invent supporting", withPrimary.includes("Do not invent a supporting memory"));
  expectTrue("primary alone enough", withPrimary.includes("that alone is enough specificity"));
  expectTrue("no legacy two-ref force", !withPrimary.includes("at least 2 specific personal references"));

  const legacy = buildMemoryDensityRequirement(false);
  expectTrue("legacy density preserved", legacy.includes("MEMORY DENSITY REQUIREMENT"));
  expectTrue("legacy two refs", legacy.includes("at least 2 specific personal references"));
}

section("guest omits auth rules; auth preserves and yields to primary");
{
  const guest = buildAuthenticatedContextRules({
    hasContextSupplement: false,
    hasPrimary: true,
  });
  expect("guest emits empty auth rules", guest, "");

  const authNoPrimary = buildAuthenticatedContextRules({
    hasContextSupplement: true,
    hasPrimary: false,
  });
  expectTrue("auth keeps PRIORITY ORDER", authNoPrimary.includes("PRIORITY ORDER for context"));
  expectTrue("auth keeps FRESH UPDATE", authNoPrimary.includes("FRESH UPDATE OPENING RULE"));
  expectTrue(
    "no primary vs auth without primary",
    !authNoPrimary.includes("PRIMARY VS AUTHENTICATED CONTEXT"),
  );

  const authWithPrimary = buildAuthenticatedContextRules({
    hasContextSupplement: true,
    hasPrimary: true,
  });
  expectTrue("auth keeps rules with primary", authWithPrimary.includes("FRESH UPDATE OPENING RULE"));
  expectTrue(
    "primary outranks auth context",
    authWithPrimary.includes("PRIMARY VS AUTHENTICATED CONTEXT"),
  );
  expectTrue(
    "auth must not replace primary",
    authWithPrimary.includes("must not replace or outrank the primary reason"),
  );
}

section("objective line only when explicitly provided");
{
  expect("omitted objective prints nothing", formatMainObjectiveLine(false, "Tell Them I Appreciate Them"), "");
  expect(
    "explicit objective prints",
    formatMainObjectiveLine(true, "Make Them Laugh"),
    "Main objective: Make Them Laugh\n",
  );
}

section("route wiring and option descriptors");
{
  expectTrue("objectiveProvided detection", ROUTE_SOURCE.includes("objectiveProvided"));
  expectTrue(
    "buildUserPrompt gets objectiveProvided",
    ROUTE_SOURCE.includes("objectiveProvided)"),
  );
  expectTrue(
    "option centers primary reason",
    ROUTE_SOURCE.includes("Center the primary reason"),
  );
  expectTrue(
    "supporting optional in options",
    ROUTE_SOURCE.includes("Supporting memories are optional enrichment"),
  );
  expectTrue(
    "uses buildOrderedBodyContextLines",
    ROUTE_SOURCE.includes("buildOrderedBodyContextLines"),
  );
  expectTrue(
    "uses primary-centered density helper",
    ROUTE_SOURCE.includes("buildMemoryDensityRequirement"),
  );
  expectTrue(
    "uses auth rules helper",
    ROUTE_SOURCE.includes("buildAuthenticatedContextRules"),
  );
  expectTrue(
    "internal objective fallback string retained",
    ROUTE_SOURCE.includes('"Tell Them I Appreciate Them"'),
  );
}

section("compatibility and ownership");
{
  expectTrue("8A packing unchanged — has primaryOccasionContext", PACK_SOURCE.includes("primaryOccasionContext"));
  expectTrue("8A packing still omits objective property", !PACK_SOURCE.includes("objective:"));
  expectTrue("v1 auth path unchanged", USE_CARD.includes("/api/generate-card"));
  expectTrue("v1 no primaryOccasionContext", !USE_CARD.includes("primaryOccasionContext"));
  expectTrue("helper no brain/", !HELPER_SOURCE.includes("brain/"));
  expectTrue("helper no @workspace/events", !HELPER_SOURCE.includes("@workspace/events"));
  expectTrue("route no @workspace/events", !ROUTE_SOURCE.includes("@workspace/events"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("Failures:", failures);
  process.exit(1);
}
