/**
 * Safe parse-failure diagnostic helper tests.
 * Does not import the Express route (avoids openai/db load).
 * Mirrors buildGenerateCardParseFailureDiagnostic and asserts route wiring via source.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/v2-generate-card-parse-diagnostics.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROUTE_SOURCE = readFileSync(join(TEST_DIR, "../routes/v2-generate-card.ts"), "utf8");

/** Mirror of route helper — keep fields aligned with buildGenerateCardParseFailureDiagnostic. */
function buildGenerateCardParseFailureDiagnostic(opts: {
  model: string;
  completion: {
    choices?: Array<{
      finish_reason?: string | null;
      message?: {
        content?: string | null;
        refusal?: string | null;
      } | null;
    }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    } | null;
  } | null | undefined;
  raw: string;
  parseBranch: "json_parse_failed" | "empty_cards";
  jsonErrorMessage?: string | null;
  parsed?: unknown;
}): Record<string, unknown> {
  const completion = opts.completion ?? null;
  const choices = completion?.choices ?? [];
  const first = choices[0];
  const refusal = first?.message?.refusal ?? null;
  const usage = completion?.usage ?? null;
  const raw = typeof opts.raw === "string" ? opts.raw : "";

  let parsedTopLevelKeys: string[] | null = null;
  let parsedCardsExists = false;
  let parsedCardsIsArray = false;
  let parsedCardsLength: number | null = null;

  if (opts.parsed !== undefined && opts.parsed !== null && typeof opts.parsed === "object") {
    parsedTopLevelKeys = Object.keys(opts.parsed as object);
    const cards = (opts.parsed as { cards?: unknown }).cards;
    parsedCardsExists = Object.prototype.hasOwnProperty.call(opts.parsed, "cards");
    parsedCardsIsArray = Array.isArray(cards);
    parsedCardsLength = Array.isArray(cards) ? cards.length : null;
  }

  return {
    model: opts.model,
    choiceCount: choices.length,
    finishReason: first?.finish_reason ?? null,
    refusal: typeof refusal === "string" ? refusal.slice(0, 200) : refusal,
    promptTokens: usage?.prompt_tokens ?? null,
    completionTokens: usage?.completion_tokens ?? null,
    totalTokens: usage?.total_tokens ?? null,
    hasContent: raw.length > 0,
    rawContentLength: raw.length,
    parseBranch: opts.parseBranch,
    jsonErrorMessage: opts.jsonErrorMessage ?? null,
    parsedTopLevelKeys,
    parsedCardsExists,
    parsedCardsIsArray,
    parsedCardsLength,
  };
}

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

section("route wires safe parse-failure diagnostics");
{
  expectTrue("helper present", ROUTE_SOURCE.includes("buildGenerateCardParseFailureDiagnostic"));
  expectTrue("json_parse_failed", ROUTE_SOURCE.includes('parseBranch: "json_parse_failed"'));
  expectTrue("empty_cards", ROUTE_SOURCE.includes('parseBranch: "empty_cards"'));
  expectTrue("logs parseFailureDiagnostic", ROUTE_SOURCE.includes("parseFailureDiagnostic"));
  expectTrue("client body unchanged", ROUTE_SOURCE.includes('{ error: "Failed to parse card response" }'));
  expectTrue(
    "no full-raw-only error log",
    !ROUTE_SOURCE.includes('logger.error({ raw }, "v2-generate-card: JSON parse failed")'),
  );
  expectTrue("no rawHead in route helper", !ROUTE_SOURCE.includes("rawHead"));
  expectTrue("no rawTail in route helper", !ROUTE_SOURCE.includes("rawTail"));
}

section("json_parse_failed diagnostic construction");
{
  const long = "A".repeat(250) + "MID" + "B".repeat(250);
  const d = buildGenerateCardParseFailureDiagnostic({
    model: "gpt-5",
    completion: {
      choices: [
        {
          finish_reason: "length",
          message: { content: long, refusal: null },
        },
      ],
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    },
    raw: long,
    parseBranch: "json_parse_failed",
    jsonErrorMessage: "Unexpected end of JSON input",
  });

  expectTrue("returns object", typeof d === "object" && d !== null);
  expectTrue("model", d.model === "gpt-5");
  expectTrue("choiceCount", d.choiceCount === 1);
  expectTrue("finishReason", d.finishReason === "length");
  expectTrue("promptTokens", d.promptTokens === 10);
  expectTrue("completionTokens", d.completionTokens === 20);
  expectTrue("totalTokens", d.totalTokens === 30);
  expectTrue("hasContent", d.hasContent === true);
  expectTrue("rawContentLength", d.rawContentLength === long.length);
  expectTrue("no rawHead field", !("rawHead" in d));
  expectTrue("no rawTail field", !("rawTail" in d));
  expectTrue("parseBranch", d.parseBranch === "json_parse_failed");
  expectTrue("jsonErrorMessage set", d.jsonErrorMessage === "Unexpected end of JSON input");
  expectTrue("no full raw field", !("raw" in d));
}

section("empty_cards diagnostic construction");
{
  const d = buildGenerateCardParseFailureDiagnostic({
    model: "gpt-5",
    completion: {
      choices: [{ finish_reason: "stop", message: { content: '{"cards":[]}', refusal: null } }],
      usage: null,
    },
    raw: '{"cards":[]}',
    parseBranch: "empty_cards",
    parsed: { cards: [] },
  });

  expectTrue("parseBranch empty_cards", d.parseBranch === "empty_cards");
  expectTrue(
    "parsedTopLevelKeys",
    Array.isArray(d.parsedTopLevelKeys) && (d.parsedTopLevelKeys as string[]).includes("cards"),
  );
  expectTrue("parsedCardsExists", d.parsedCardsExists === true);
  expectTrue("parsedCardsIsArray", d.parsedCardsIsArray === true);
  expectTrue("parsedCardsLength 0", d.parsedCardsLength === 0);
  expectTrue("null usage fields", d.promptTokens === null && d.completionTokens === null);
}

section("null / sparse completion does not throw");
{
  let threw = false;
  let d: Record<string, unknown> | null = null;
  try {
    d = buildGenerateCardParseFailureDiagnostic({
      model: "gpt-5",
      completion: null,
      raw: "",
      parseBranch: "json_parse_failed",
      jsonErrorMessage: "x",
    });
  } catch {
    threw = true;
  }
  expectTrue("null completion safe", !threw && d !== null);
  expectTrue("empty content", d?.hasContent === false && d?.rawContentLength === 0);
  expectTrue("choiceCount 0", d?.choiceCount === 0);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
