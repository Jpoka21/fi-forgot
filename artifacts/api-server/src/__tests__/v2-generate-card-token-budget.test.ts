/**
 * GPT-5 generate completion-budget source contract.
 * Reliability prerequisite: generate must not use the proven-insufficient 900 cap.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/v2-generate-card-token-budget.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

/** Isolate the generate-card OpenAI create block (before refine-card). */
function extractGenerateCreateBlock(source: string): string {
  const genStart = source.indexOf('router.post("/v2/generate-card"');
  const refineStart = source.indexOf('router.post("/v2/refine-card"');
  expectTrue("generate route present", genStart >= 0);
  expectTrue("refine route present", refineStart > genStart);
  return source.slice(genStart, refineStart);
}

function extractRefineCreateBlock(source: string): string {
  const refineStart = source.indexOf('router.post("/v2/refine-card"');
  return source.slice(refineStart);
}

section("v2 generate completion budget");
{
  const gen = extractGenerateCreateBlock(ROUTE_SOURCE);
  expectTrue(
    "generate uses max_completion_tokens: 8000",
    /max_completion_tokens:\s*8000/.test(gen),
  );
  expectTrue(
    "generate does not use proven-insufficient 900",
    !/max_completion_tokens:\s*900/.test(gen),
  );
  expectTrue("generate model remains gpt-5", gen.includes('GENERATE_CARD_MODEL = "gpt-5"') || /model:\s*GENERATE_CARD_MODEL/.test(gen));
}

section("v2 refine completion budget unchanged");
{
  const refine = extractRefineCreateBlock(ROUTE_SOURCE);
  expectTrue(
    "refine remains max_completion_tokens: 4000",
    /max_completion_tokens:\s*4000/.test(refine),
  );
  expectTrue(
    "refine does not use generate 8000",
    !/max_completion_tokens:\s*8000/.test(refine),
  );
}

section("one-card response contract unchanged");
{
  expectTrue("Write one occasion card", /Write one \$\{occasion\} card/.test(ROUTE_SOURCE));
  expectTrue("slice(0, 1) after parse", ROUTE_SOURCE.includes("parsed.cards.slice(0, 1)"));
  expectTrue(
    "response still uses cards array key",
    ROUTE_SOURCE.includes("res.json({ cards: scoredCards"),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
