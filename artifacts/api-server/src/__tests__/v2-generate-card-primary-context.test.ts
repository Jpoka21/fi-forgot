/**
 * v2-generate-card primaryOccasionContext handoff (Sprint 8A).
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/v2-generate-card-primary-context.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { appendPrimaryAndSupportingDetailLines } from "../routes/v2GenerateCardContextLines.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROUTE_SOURCE = readFileSync(join(TEST_DIR, "../routes/v2-generate-card.ts"), "utf8");
const USE_CARD_CREATION = readFileSync(
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

section("appendPrimaryAndSupportingDetailLines ordering");
{
  const withBoth: string[] = [];
  appendPrimaryAndSupportingDetailLines(
    withBoth,
    "She watched the kids while I was sick.",
    "She always butters my bread.",
  );
  expect("two lines", withBoth.length, 2);
  expectTrue("primary first", withBoth[0]!.startsWith("Primary reason for this card:"));
  expectTrue(
    "supporting second",
    withBoth[1]!.startsWith("Supporting memory or personal detail:"),
  );
  expectTrue("primary content", withBoth[0]!.includes("watched the kids"));
  expectTrue("supporting content", withBoth[1]!.includes("butters my bread"));

  const primaryOnly: string[] = [];
  appendPrimaryAndSupportingDetailLines(primaryOnly, "Thanks for helping.", undefined);
  expect("primary only length", primaryOnly.length, 1);

  const detailsOnly: string[] = [];
  appendPrimaryAndSupportingDetailLines(detailsOnly, undefined, "Old memory");
  expect("details only length", detailsOnly.length, 1);
  expectTrue(
    "legacy details label when no primary",
    detailsOnly[0]!.startsWith("Extra details / memories to include:"),
  );

  const omitted: string[] = [];
  appendPrimaryAndSupportingDetailLines(omitted, undefined, undefined);
  expect("omitted adds nothing", omitted.length, 0);

  const whitespace: string[] = [];
  appendPrimaryAndSupportingDetailLines(whitespace, "   ", "  ");
  expect("whitespace treated as absent", whitespace.length, 0);
}

section("route accepts primaryOccasionContext and keeps objective default");
{
  expectTrue(
    "destructures primaryOccasionContext",
    ROUTE_SOURCE.includes("primaryOccasionContext,"),
  );
  expectTrue(
    "typed optional primaryOccasionContext",
    ROUTE_SOURCE.includes("primaryOccasionContext?: string"),
  );
  expectTrue(
    "objective default preserved",
    ROUTE_SOURCE.includes('objective = "Tell Them I Appreciate Them"'),
  );
  expectTrue(
    "PRIMARY REASON RULE present",
    ROUTE_SOURCE.includes("PRIMARY REASON RULE"),
  );
  expectTrue(
    "label leak guard present",
    ROUTE_SOURCE.includes("Never print internal labels"),
  );
  expectTrue(
    "passes primary into buildUserPrompt",
    ROUTE_SOURCE.includes("primaryOccasionContext);") ||
      ROUTE_SOURCE.includes(", primaryOccasionContext)"),
  );
}

section("authenticated generation path unchanged");
{
  expectTrue(
    "useCardCreation still uses /api/generate-card",
    USE_CARD_CREATION.includes("/api/generate-card"),
  );
  expectTrue(
    "useCardCreation does not send primaryOccasionContext",
    !USE_CARD_CREATION.includes("primaryOccasionContext"),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error("Failures:", failures);
  process.exit(1);
}
