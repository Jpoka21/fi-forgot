/**
 * Unit tests for Studio collection validation.
 *
 * Run with:
 *   npx tsx artifacts/api-server/src/__tests__/studio-collections-validation.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { validateCreateStudioCollectionPayload } from "../services/studio-collections/validation.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROUTE_SOURCE = readFileSync(join(TEST_DIR, "../routes/studio-collections.ts"), "utf8");

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

section("validateCreateStudioCollectionPayload — valid collection");
{
  const result = validateCreateStudioCollectionPayload({
    name: "Birthday — Grandmother",
    occasion: "birthday",
    relationship: "grandmother",
    style: "watercolor",
    description: "Warm birthday artwork for grandmothers.",
  });
  expectTrue("valid payload accepted", result.ok);
  if (result.ok) {
    expect("name", result.data.name, "Birthday — Grandmother");
    expect("occasion", result.data.occasion, "birthday");
    expect("relationship", result.data.relationship, "grandmother");
    expect("style", result.data.style, "watercolor");
    expect("status default", result.data.status, "planning");
  }
}

section("validateCreateStudioCollectionPayload — missing name");
{
  const result = validateCreateStudioCollectionPayload({
    occasion: "birthday",
    relationship: "grandmother",
  });
  expect("rejects missing name", result.ok, false);
  if (!result.ok) {
    expect("status code", result.statusCode, 400);
    expect("error", result.error, "name is required");
  }
}

section("validateCreateStudioCollectionPayload — missing occasion");
{
  const result = validateCreateStudioCollectionPayload({
    name: "Birthday — Grandmother",
    relationship: "grandmother",
  });
  expect("rejects missing occasion", result.ok, false);
  if (!result.ok) {
    expect("error", result.error, "occasion is required");
  }
}

section("validateCreateStudioCollectionPayload — invalid occasion");
{
  const result = validateCreateStudioCollectionPayload({
    name: "Test",
    occasion: "invalid_occasion",
    relationship: "mother",
  });
  expect("rejects invalid occasion", result.ok, false);
  if (!result.ok) {
    expect("error", result.error, "invalid occasion");
  }
}

section("validateCreateStudioCollectionPayload — invalid relationship");
{
  const result = validateCreateStudioCollectionPayload({
    name: "Test",
    occasion: "birthday",
    relationship: "invalid_relationship",
  });
  expect("rejects invalid relationship", result.ok, false);
  if (!result.ok) {
    expect("error", result.error, "invalid relationship");
  }
}

section("validateCreateStudioCollectionPayload — invalid status");
{
  const result = validateCreateStudioCollectionPayload({
    name: "Test",
    occasion: "birthday",
    relationship: "mother",
    status: "published",
  });
  expect("rejects invalid status", result.ok, false);
  if (!result.ok) {
    expect("error", result.error, "invalid status");
  }
}

section("route wiring — list, read, create");
{
  expectTrue("GET list route", ROUTE_SOURCE.includes('router.get("/studio/collections"'));
  expectTrue("GET by id route", ROUTE_SOURCE.includes('router.get("/studio/collections/:id"'));
  expectTrue("POST create route", ROUTE_SOURCE.includes('router.post("/studio/collections"'));
  expectTrue("uses validation", ROUTE_SOURCE.includes("validateCreateStudioCollectionPayload"));
  expectTrue("returns 404 for missing collection", ROUTE_SOURCE.includes('status(404)'));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
