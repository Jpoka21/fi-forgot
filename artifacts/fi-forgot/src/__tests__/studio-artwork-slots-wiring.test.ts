/**
 * Studio artwork slots frontend wiring and validation tests.
 *
 * Run with:
 *   corepack pnpm dlx tsx --tsconfig tsconfig.json src/__tests__/studio-artwork-slots-wiring.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  EMPTY_CREATE_ARTWORK_SLOT_FORM,
  artworkSlotsDefaults,
  buildCreateArtworkSlotPayload,
  validateCreateArtworkSlotForm,
} from "../app/studio/artworkSlotsDomain.js";

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

section("empty state action");
{
  const detail = readSrc("app/components/studio/FiStudioCollectionDetailPage.tsx");
  expectTrue("empty state add action", detail.includes("artworkSlotsDefaults.addArtworkSlotLabel"));
}

section("dialog fields");
{
  const dialog = readSrc("app/components/studio/AddArtworkSlotDialog.tsx");
  expectTrue("slot name field", dialog.includes("artworkSlotsDefaults.slotNameLabel"));
  expectTrue("brief field", dialog.includes("artworkSlotsDefaults.briefLabel"));
  expectTrue("quantity field", dialog.includes("artworkSlotsDefaults.quantityLabel"));
}

section("required name validation");
{
  const result = validateCreateArtworkSlotForm(EMPTY_CREATE_ARTWORK_SLOT_FORM);
  expectTrue("invalid when empty name", !result.ok);
  if (!result.ok) {
    expectTrue("name error", Boolean(result.errors.name));
  }
}

section("quantity validation");
{
  const invalid = validateCreateArtworkSlotForm({
    name: "Test",
    brief: "",
    quantity: "0",
  });
  expectTrue("rejects quantity below 1", !invalid.ok);

  const nonInteger = validateCreateArtworkSlotForm({
    name: "Test",
    brief: "",
    quantity: "1.5",
  });
  expectTrue("rejects noninteger quantity", !nonInteger.ok);
}

section("default quantity");
{
  expect("default form quantity", EMPTY_CREATE_ARTWORK_SLOT_FORM.quantity, "1");
  const payload = buildCreateArtworkSlotPayload({
    name: "Birthday Cake Scene",
    brief: "",
    quantity: "1",
  });
  expect("payload quantity", payload.quantity, 1);
}

section("dialog submission behavior");
{
  const dialog = readSrc("app/components/studio/AddArtworkSlotDialog.tsx");
  expectTrue("duplicate submission guard", dialog.includes("if (submitting) return"));
  expectTrue("loading state", dialog.includes("loading={submitting}"));
  expectTrue("api error state", dialog.includes("submitError"));
  expectTrue("inline validation", dialog.includes("validateCreateArtworkSlotForm"));
}

section("slot list rendering");
{
  const section = readSrc("app/components/studio/ArtworkSlotSection.tsx");
  expectTrue("slot list component", readSrc("app/components/studio/FiStudioCollectionDetailPage.tsx").includes("ArtworkSlotSection"));
  expectTrue("brief rendering", section.includes("slot.brief"));
  expectTrue("quantity rendering", section.includes("slot.quantity"));
  expectTrue("slot position label", section.includes("artworkSlotsDefaults.slotPositionLabel"));
}

section("summary counts");
{
  const detail = readSrc("app/components/studio/FiStudioCollectionDetailPage.tsx");
  expectTrue("real artwork slots count", detail.includes("slots.slotCount"));
  expectTrue("artwork remains zero", detail.includes('label="Artwork" value={0}'));
  expectTrue("live candidates count", detail.includes("candidateCount"));
  expectTrue("approved assets remain zero", detail.includes('label="Approved Assets" value={0}'));
}

section("collection route protected");
{
  const routes = readSrc("app/routes/AppRoutes.tsx");
  expectTrue("collection detail route protected", routes.includes("StudioCollectionDetailPage"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
