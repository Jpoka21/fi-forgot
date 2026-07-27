/**
 * Studio collections frontend wiring and validation tests.
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json src/__tests__/studio-collections-wiring.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  EMPTY_CREATE_COLLECTION_FORM,
  buildCreateCollectionPayload,
  studioCollectionsDefaults,
  validateCreateCollectionForm,
} from "../app/studio/collectionsDomain.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(TEST_DIR, "..");

function readSrc(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

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

section("empty state copy");
{
  expect("empty title", studioCollectionsDefaults.emptyTitle, "No collections yet.");
  expect(
    "empty description",
    studioCollectionsDefaults.emptyDescription,
    "Create the first collection to begin planning artwork.",
  );
}

section("required-field validation");
{
  const result = validateCreateCollectionForm(EMPTY_CREATE_COLLECTION_FORM);
  expectTrue("invalid when empty", !result.ok);
  if (!result.ok) {
    expectTrue("name error", Boolean(result.errors.name));
    expectTrue("occasion error", Boolean(result.errors.occasion));
    expectTrue("relationship error", Boolean(result.errors.relationship));
  }
}

section("successful payload build");
{
  const values = {
    ...EMPTY_CREATE_COLLECTION_FORM,
    name: "Birthday — Grandmother",
    occasion: "birthday" as const,
    relationship: "grandmother" as const,
    style: "watercolor" as const,
    description: "Warm birthday artwork for grandmothers.",
  };
  const validation = validateCreateCollectionForm(values);
  expectTrue("valid form passes", validation.ok);
  expect(
    "payload",
    buildCreateCollectionPayload(values),
    {
      name: "Birthday — Grandmother",
      occasion: "birthday",
      relationship: "grandmother",
      style: "watercolor",
      description: "Warm birthday artwork for grandmothers.",
      status: "planning",
    },
  );
}

section("collections page wiring");
{
  const page = readSrc("app/components/studio/FiStudioCollectionsPage.tsx");
  expectTrue("renders page title", page.includes("studioCollectionsDefaults.pageTitle"));
  expectTrue("renders empty state", page.includes("studioCollectionsDefaults.emptyTitle"));
  expectTrue("opens new collection dialog", page.includes("NewCollectionDialog"));
  expectTrue("new collection button", page.includes("studioCollectionsDefaults.newCollectionLabel"));
}

section("new collection dialog wiring");
{
  const dialog = readSrc("app/components/studio/NewCollectionDialog.tsx");
  expectTrue("inline validation", dialog.includes("validateCreateCollectionForm"));
  expectTrue("duplicate submission guard", dialog.includes("if (submitting) return"));
  expectTrue("loading state on submit", dialog.includes("loading={submitting}"));
  expectTrue("disabled while submitting", dialog.includes("disabled={submitting}"));
}

section("collection detail page wiring");
{
  const detail = readSrc("app/components/studio/FiStudioCollectionDetailPage.tsx");
  expectTrue("shows status", detail.includes("Status:"));
  expectTrue("artwork count placeholder", detail.includes('label="Artwork" value={0}'));
  expectTrue("artwork slots uses live count", detail.includes("slots.slotCount"));
  expectTrue("candidates uses live count", detail.includes("candidateCount"));
  expectTrue("approved assets placeholder", detail.includes('label="Approved Assets" value={0}'));
  expectTrue("planning empty state", detail.includes("studioCollectionsDefaults.planningEmptyTitle"));
}

section("routes wiring");
{
  const routes = readSrc("app/routes/AppRoutes.tsx");
  expectTrue("collections route protected", routes.includes("StudioCollectionsPage"));
  expectTrue("detail route protected", routes.includes("StudioCollectionDetailPage"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
