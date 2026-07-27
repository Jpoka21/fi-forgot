/**
 * Studio artwork candidates frontend wiring and validation tests.
 *
 * Run with:
 *   corepack pnpm dlx tsx --tsconfig tsconfig.json src/__tests__/studio-artwork-candidates-wiring.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  EMPTY_CREATE_ARTWORK_CANDIDATE_FORM,
  artworkCandidatesDefaults,
  buildCreateArtworkCandidatePayload,
  validateCreateArtworkCandidateForm,
} from "../app/studio/artworkCandidatesDomain.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(TEST_DIR, "..");

function readSrc(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

let passed = 0;
let failed = 0;
const failures: string[] = [];

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

section("dialog fields");
{
  const dialog = readSrc("app/components/studio/AddArtworkCandidateDialog.tsx");
  expectTrue("candidate name field", dialog.includes("artworkCandidatesDefaults.candidateNameLabel"));
  expectTrue("brief field", dialog.includes("artworkCandidatesDefaults.briefLabel"));
}

section("required name validation");
{
  const result = validateCreateArtworkCandidateForm(EMPTY_CREATE_ARTWORK_CANDIDATE_FORM);
  expectTrue("invalid when empty name", !result.ok);
  if (!result.ok) {
    expectTrue("name error", Boolean(result.errors.name));
  }
}

section("successful payload build");
{
  const payload = buildCreateArtworkCandidatePayload({
    name: "Warm watercolor bouquet",
    brief: "Soft flowers around a birthday table.",
  });
  expectTrue("name trimmed", payload.name === "Warm watercolor bouquet");
  expectTrue("brief included", payload.brief === "Soft flowers around a birthday table.");
}

section("dialog submission behavior");
{
  const dialog = readSrc("app/components/studio/AddArtworkCandidateDialog.tsx");
  expectTrue("duplicate submission guard", dialog.includes("if (submitting) return"));
  expectTrue("loading state", dialog.includes("loading={submitting}"));
  expectTrue("api error state", dialog.includes("submitError"));
  expectTrue("inline validation", dialog.includes("validateCreateArtworkCandidateForm"));
}

section("candidate list rendering");
{
  const section = readSrc("app/components/studio/ArtworkSlotSection.tsx");
  expectTrue("candidate row rendering", section.includes("ArtworkCandidateRow"));
  expectTrue("brief rendering", section.includes("candidate.brief"));
  expectTrue("candidate position label", section.includes("artworkCandidatesDefaults.candidatePositionLabel"));
  expectTrue("add candidate action", section.includes("artworkCandidatesDefaults.addArtworkCandidateLabel"));
}

section("summary counts");
{
  const detail = readSrc("app/components/studio/FiStudioCollectionDetailPage.tsx");
  expectTrue("live candidates count", detail.includes("candidateCount"));
  expectTrue("artwork remains zero", detail.includes('label="Artwork" value={0}'));
  expectTrue("approved assets remain zero", detail.includes('label="Approved Assets" value={0}'));
  expectTrue("artwork slots still live", detail.includes("slots.slotCount"));
}

section("api endpoints");
{
  const endpoints = readSrc("app/api/endpoints.ts");
  expectTrue("artwork candidates list endpoint", endpoints.includes("artworkCandidates:"));
  expectTrue("artwork candidate by id endpoint", endpoints.includes("artworkCandidateById:"));
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
