/**
 * Unit tests for Studio artwork candidate validation.
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/studio-artwork-candidates-validation.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { validateCreateArtworkCandidatePayload } from "../services/studio-artwork-candidates/validation.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROUTE_SOURCE = readFileSync(
  join(TEST_DIR, "../routes/studio-artwork-candidates.ts"),
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

section("validateCreateArtworkCandidatePayload — valid payload");
{
  const result = validateCreateArtworkCandidatePayload({
    name: "Warm watercolor bouquet",
    brief: "Soft flowers surrounding a birthday table.",
  });
  expectTrue("valid payload accepted", result.ok);
  if (result.ok) {
    expect("name", result.data.name, "Warm watercolor bouquet");
    expect("brief", result.data.brief, "Soft flowers surrounding a birthday table.");
  }
}

section("validateCreateArtworkCandidatePayload — brief optional");
{
  const result = validateCreateArtworkCandidatePayload({
    name: "Warm watercolor bouquet",
  });
  expectTrue("valid without brief", result.ok);
  if (result.ok) {
    expect("brief null", result.data.brief, null);
  }
}

section("validateCreateArtworkCandidatePayload — missing name");
{
  const result = validateCreateArtworkCandidatePayload({ brief: "Test" });
  expect("rejects missing name", result.ok, false);
  if (!result.ok) {
    expect("error", result.error, "name is required");
  }
}

section("validateCreateArtworkCandidatePayload — blank name");
{
  const result = validateCreateArtworkCandidatePayload({ name: "   " });
  expect("rejects blank name", result.ok, false);
  if (!result.ok) {
    expect("error", result.error, "name is required");
  }
}

section("validateCreateArtworkCandidatePayload — invalid payload type");
{
  const result = validateCreateArtworkCandidatePayload("invalid");
  expect("rejects invalid payload type", result.ok, false);
  if (!result.ok) {
    expect("error", result.error, "Request body required");
  }
}

section("route wiring — list, create, read");
{
  expectTrue(
    "GET list route",
    ROUTE_SOURCE.includes("router.get") &&
      ROUTE_SOURCE.includes(
        '"/studio/collections/:collectionId/artwork-slots/:slotId/artwork-candidates"',
      ),
  );
  expectTrue(
    "POST create route",
    ROUTE_SOURCE.includes("router.post") &&
      ROUTE_SOURCE.includes(
        '"/studio/collections/:collectionId/artwork-slots/:slotId/artwork-candidates"',
      ),
  );
  expectTrue(
    "GET by id route",
    ROUTE_SOURCE.includes(
      '"/studio/collections/:collectionId/artwork-slots/:slotId/artwork-candidates/:candidateId"',
    ),
  );
  expectTrue("uses validation", ROUTE_SOURCE.includes("validateCreateArtworkCandidatePayload"));
  expectTrue("assigns sort order", ROUTE_SOURCE.includes("getNextArtworkCandidateSortOrder"));
  expectTrue("slot scoping", ROUTE_SOURCE.includes("slotBelongsToCollection"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
