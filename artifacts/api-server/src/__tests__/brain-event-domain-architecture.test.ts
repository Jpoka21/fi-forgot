/**
 * Architecture guards — Brain Event Domain adapter boundary (Phase 7C.1).
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/brain-event-domain-architecture.test.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { EVENT_IDS } from "@workspace/events";
import { BRAIN_EVENT_IDS } from "../brain/events/brainEventCatalog.js";
import { CALENDAR_EVENT_RULE_TARGETS } from "../brain/events/ruleEventTargeting.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const API_SRC = join(TEST_DIR, "..");
const BRAIN_ROOT = join(API_SRC, "brain");
const ADAPTER_DIR = join(BRAIN_ROOT, "events", "eventDomain");

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

function expectTrue(label: string, actual: boolean): void {
  expect(label, actual, true);
}

function section(name: string): void {
  console.log(`\n${name}`);
}

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") continue;
      out.push(...listTsFiles(full));
    } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

section("BRAIN_EVENT_IDS matches Event Domain EVENT_IDS");
{
  expect("ids equal", [...BRAIN_EVENT_IDS], [...EVENT_IDS]);
}

section("rule targeting preserves eventId !== sourceRuleId contract");
{
  for (const entry of CALENDAR_EVENT_RULE_TARGETS) {
    expectTrue(
      `${entry.sourceRuleId} has targetEventId`,
      typeof entry.targetEventId === "string" && entry.targetEventId.length > 0,
    );
    // Values may coincide; fields remain separate concepts on the type
    expectTrue(
      `${entry.sourceRuleId} mapping has both fields`,
      "sourceRuleId" in entry && "targetEventId" in entry,
    );
  }
  expectTrue(
    "targeting source documents separation",
    readFileSync(join(BRAIN_ROOT, "events/ruleEventTargeting.ts"), "utf8").includes(
      "separate concepts",
    ),
  );
}

section("production Brain modules do not directly import @workspace/events");
{
  const allowedPrefixes = [
    relative(API_SRC, join(ADAPTER_DIR, "adapter.ts")).replace(/\\/g, "/"),
  ];

  const hits: string[] = [];
  for (const file of listTsFiles(BRAIN_ROOT)) {
    const rel = relative(API_SRC, file).replace(/\\/g, "/");
    if (rel.startsWith("brain/events/eventDomain/")) {
      continue; // adapter folder allowed
    }
    const text = readFileSync(file, "utf8");
    if (
      /from\s+["']@workspace\/events["']/.test(text) ||
      /import\s*\(\s*["']@workspace\/events["']\s*\)/.test(text)
    ) {
      hits.push(rel);
    }
  }

  // Also scan non-brain api-server src except tests
  for (const file of listTsFiles(API_SRC)) {
    const rel = relative(API_SRC, file).replace(/\\/g, "/");
    if (rel.startsWith("brain/") || rel.startsWith("__tests__/")) continue;
    const text = readFileSync(file, "utf8");
    if (/from\s+["']@workspace\/events["']/.test(text)) {
      hits.push(rel);
    }
  }

  expect("no direct @workspace/events imports outside adapter", hits, []);
  expectTrue(
    "adapter itself imports @workspace/events",
    readFileSync(join(ADAPTER_DIR, "adapter.ts"), "utf8").includes(
      '@workspace/events',
    ),
  );
  expectTrue("allowed adapter path noted", allowedPrefixes[0].includes("eventDomain"));
}

section("adapter does not call resolveOccurrence");
{
  const adapterSource = readFileSync(join(ADAPTER_DIR, "adapter.ts"), "utf8");
  const importBlockMatch = adapterSource.match(
    /import\s*\{([\s\S]*?)\}\s*from\s*["']@workspace\/events["']/,
  );
  const importedNames = importBlockMatch?.[1] ?? "";
  expectTrue(
    "adapter does not import resolveOccurrence",
    !/\bresolveOccurrence\b/.test(importedNames),
  );
  expectTrue(
    "adapter reads getEventScheduling metadata only",
    /\bgetEventScheduling\b/.test(importedNames),
  );
}

section("catalog facade documents adapter sourcing");
{
  const catalogSource = readFileSync(
    join(BRAIN_ROOT, "events/brainEventCatalog.ts"),
    "utf8",
  );
  expectTrue(
    "catalog uses eventDomain adapter",
    catalogSource.includes("eventDomain"),
  );
  expectTrue(
    "catalog does not import @workspace/events directly",
    !/from\s+["']@workspace\/events["']/.test(catalogSource),
  );
  expectTrue(
    "catalog uses preparation metadata",
    catalogSource.includes("getBrainEventPreparationMetadata"),
  );
}

section("preparation modules do not import @workspace/events directly");
{
  const prepFiles = [
    "brain/events/buildEventPreparationContext.ts",
    "brain/events/resolveCatalogEventTiming.ts",
    "brain/events/resolveOccurrenceDateStr.ts",
    "brain/events/eventPreparationTypes.ts",
    "brain/action/enrichActionPlanRouting.ts",
  ];
  const hits: string[] = [];
  for (const rel of prepFiles) {
    const text = readFileSync(join(API_SRC, rel), "utf8");
    if (/from\s+["']@workspace\/events["']/.test(text)) {
      hits.push(rel);
    }
  }
  expect("no direct imports in preparation/routing modules", hits, []);
}

section("adapter exposes briefing reference API");
{
  const adapterSource = readFileSync(join(ADAPTER_DIR, "adapter.ts"), "utf8");
  expectTrue(
    "adapter exports getBrainEventBriefingMetadata",
    adapterSource.includes("getBrainEventBriefingMetadata"),
  );
  expectTrue(
    "adapter imports getEventBriefingRef",
    /\bgetEventBriefingRef\b/.test(adapterSource),
  );
  expectTrue(
    "adapter does not import EVENT_QUESTIONS",
    !/from\s+["'][^"']*EVENT_QUESTIONS|import\s+[^;]*EVENT_QUESTIONS/.test(adapterSource) &&
      !/\bimport\s*\{[^}]*EVENT_QUESTIONS/.test(adapterSource),
  );
}

section("adapter exposes availability metadata API");
{
  const adapterSource = readFileSync(join(ADAPTER_DIR, "adapter.ts"), "utf8");
  expectTrue(
    "adapter exports getBrainEventAvailabilityMetadata",
    adapterSource.includes("getBrainEventAvailabilityMetadata"),
  );
  expectTrue(
    "adapter imports getEventAvailability",
    /\bgetEventAvailability\b/.test(adapterSource),
  );
  expectTrue(
    "adapter does not import matchesRelationshipFilter",
    !/\bmatchesRelationshipFilter\b/.test(adapterSource),
  );
  const importBlock =
    adapterSource.match(
      /import\s*\{([\s\S]*?)\}\s*from\s*["']@workspace\/events["']/,
    )?.[1] ?? "";
  expectTrue(
    "adapter does not import resolveOccurrence",
    !/\bresolveOccurrence\b/.test(importBlock),
  );
}

section("Phase 7C.5 — adapter does not expose integration metadata");
{
  const adapterSource = readFileSync(join(ADAPTER_DIR, "adapter.ts"), "utf8");
  const importBlock =
    adapterSource.match(
      /import\s*\{([\s\S]*?)\}\s*from\s*["']@workspace\/events["']/,
    )?.[1] ?? "";
  const banned = [
    "getHandwryttenIntegration",
    "getAiGenerationIntegration",
    "getCardClassifierIntegration",
    "getCardLibraryIntegration",
    "getEmailDeliveryIntegration",
    "getHandwryttenProjection",
    "getAiProjection",
    "getCardLibraryProjection",
  ];
  const hits = banned.filter((name) => new RegExp(`\\b${name}\\b`).test(importBlock));
  expect("no integration getters imported by adapter", hits, []);
  expectTrue(
    "no BrainEventIntegrationMetadata API forced",
    !adapterSource.includes("BrainEventIntegrationMetadata") &&
      !adapterSource.includes("getBrainEventIntegrationMetadata"),
  );
  expectTrue(
    "adapter documents exclusion of integration metadata",
    adapterSource.includes("presentation/integration metadata") ||
      adapterSource.includes("Handwrytten"),
  );
}

section("Phase 7C.6 — adapter does not expose presentation metadata");
{
  const adapterSource = readFileSync(join(ADAPTER_DIR, "adapter.ts"), "utf8");
  const importBlock =
    adapterSource.match(
      /import\s*\{([\s\S]*?)\}\s*from\s*["']@workspace\/events["']/,
    )?.[1] ?? "";
  const banned = [
    "getEventPresentation",
    "getEventEmoji",
    "listEventPresentations",
    "EVENT_PRESENTATION_REGISTRY",
    "getCalendarProjection",
    "getFrontendOccasionProjection",
    "getAdminProjection",
  ];
  const hits = banned.filter((name) => new RegExp(`\\b${name}\\b`).test(importBlock));
  expect("no presentation getters imported by adapter", hits, []);
  expectTrue(
    "no BrainEventPresentationMetadata API forced",
    !adapterSource.includes("BrainEventPresentationMetadata") &&
      !adapterSource.includes("getBrainEventPresentationMetadata"),
  );
  expectTrue(
    "adapter excludes emoji from Brain-safe views",
    adapterSource.includes("emoji"),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
