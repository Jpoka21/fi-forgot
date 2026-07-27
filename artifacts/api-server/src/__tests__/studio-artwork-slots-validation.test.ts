/**
 * Unit tests for Studio artwork slot validation.
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/studio-artwork-slots-validation.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { validateCreateArtworkSlotPayload } from "../services/studio-artwork-slots/validation.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROUTE_SOURCE = readFileSync(join(TEST_DIR, "../routes/studio-artwork-slots.ts"), "utf8");

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

function expectTrue(label: string, condition: boolean): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

section("validateCreateArtworkSlotPayload — valid payload");
{
  const result = validateCreateArtworkSlotPayload({
    name: "Birthday Cake Scene",
    brief: "Warm watercolor birthday cake scene created for a grandmother.",
    quantity: 1,
  });
  expectTrue("valid payload accepted", result.ok);
  if (result.ok) {
    expect("name", result.data.name, "Birthday Cake Scene");
    expect("brief", result.data.brief, "Warm watercolor birthday cake scene created for a grandmother.");
    expect("quantity", result.data.quantity, 1);
  }
}

section("validateCreateArtworkSlotPayload — default quantity");
{
  const result = validateCreateArtworkSlotPayload({
    name: "Birthday Cake Scene",
  });
  expectTrue("valid without quantity", result.ok);
  if (result.ok) {
    expect("default quantity", result.data.quantity, 1);
  }
}

section("validateCreateArtworkSlotPayload — missing name");
{
  const result = validateCreateArtworkSlotPayload({ quantity: 1 });
  expect("rejects missing name", result.ok, false);
  if (!result.ok) {
    expect("error", result.error, "name is required");
  }
}

section("validateCreateArtworkSlotPayload — blank name");
{
  const result = validateCreateArtworkSlotPayload({ name: "   ", quantity: 1 });
  expect("rejects blank name", result.ok, false);
  if (!result.ok) {
    expect("error", result.error, "name is required");
  }
}

section("validateCreateArtworkSlotPayload — quantity below 1");
{
  const result = validateCreateArtworkSlotPayload({ name: "Test", quantity: 0 });
  expect("rejects quantity below 1", result.ok, false);
  if (!result.ok) {
    expect("error", result.error, "quantity must be at least 1");
  }
}

section("validateCreateArtworkSlotPayload — quantity above 100");
{
  const result = validateCreateArtworkSlotPayload({ name: "Test", quantity: 101 });
  expect("rejects quantity above 100", result.ok, false);
  if (!result.ok) {
    expect("error", result.error, "quantity must be at most 100");
  }
}

section("validateCreateArtworkSlotPayload — noninteger quantity");
{
  const result = validateCreateArtworkSlotPayload({ name: "Test", quantity: 1.5 });
  expect("rejects noninteger quantity", result.ok, false);
  if (!result.ok) {
    expect("error", result.error, "quantity must be an integer");
  }
}

section("validateCreateArtworkSlotPayload — invalid payload type");
{
  const result = validateCreateArtworkSlotPayload("invalid");
  expect("rejects invalid payload type", result.ok, false);
  if (!result.ok) {
    expect("error", result.error, "Request body required");
  }
}

section("route wiring — list, create, read");
{
  expectTrue("GET list route", ROUTE_SOURCE.includes('router.get("/studio/collections/:collectionId/artwork-slots"'));
  expectTrue("POST create route", ROUTE_SOURCE.includes('router.post("/studio/collections/:collectionId/artwork-slots"'));
  expectTrue("GET by id route", ROUTE_SOURCE.includes('router.get("/studio/collections/:collectionId/artwork-slots/:slotId"'));
  expectTrue("uses validation", ROUTE_SOURCE.includes("validateCreateArtworkSlotPayload"));
  expectTrue("assigns sort order", ROUTE_SOURCE.includes("getNextArtworkSlotSortOrder"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
