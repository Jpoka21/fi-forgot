/**
 * Sprint 8E — single-card generate-card contract.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/v2-generate-card-one-card.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROUTE_SOURCE = readFileSync(join(TEST_DIR, "../routes/v2-generate-card.ts"), "utf8");
const HELPER_SOURCE = readFileSync(join(TEST_DIR, "../routes/v2GenerateCardContextLines.ts"), "utf8");

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

section("prompt requests exactly one card");
{
  expectTrue("Write one occasion card", /Write one \$\{occasion\} card/.test(ROUTE_SOURCE));
  expectTrue("cards array exactly one", ROUTE_SOURCE.includes("exactly one card"));
  expectTrue(
    "JSON sketch has single Draft",
    ROUTE_SOURCE.includes('{ "tone": "Draft", "text": "..." }'),
  );
  expectTrue("no Best Match label in return sketch", !ROUTE_SOURCE.includes("Best Match"));
  expectTrue("no More Casual in return sketch", !ROUTE_SOURCE.includes("More Casual"));
  expectTrue("no More Heartfelt in return sketch", !ROUTE_SOURCE.includes("More Heartfelt"));
  expectTrue(
    "no three-version instruction",
    !ROUTE_SOURCE.includes("Write exactly 3") &&
      !ROUTE_SOURCE.includes("3 versions") &&
      !ROUTE_SOURCE.includes("three versions") &&
      !ROUTE_SOURCE.includes("three alternatives"),
  );
  expectTrue("polish guides say Write one polished", ROUTE_SOURCE.includes("Write one polished card"));
}

section("response truncates to one card");
{
  expectTrue("slice(0, 1) after parse", ROUTE_SOURCE.includes("parsed.cards.slice(0, 1)"));
  expectTrue("empty cards guarded", ROUTE_SOURCE.includes("empty cards array"));
  expectTrue(
    "response still uses cards array key",
    ROUTE_SOURCE.includes("res.json({ cards: scoredCards"),
  );
}

section("Sprint 8 grounding contracts retained");
{
  expectTrue(
    "primary output contract still wired",
    ROUTE_SOURCE.includes("buildPrimarySubjectOutputContract"),
  );
  expectTrue(
    "primary content priority in helper",
    HELPER_SOURCE.includes("CONTENT PRIORITY"),
  );
  expectTrue(
    "forbidden stand-ins retained",
    HELPER_SOURCE.includes('"this one"') && HELPER_SOURCE.includes('"what I needed"'),
  );
  expectTrue(
    "sign-off instruction retained",
    ROUTE_SOURCE.includes("End the card with exactly this sign-off"),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
