/**
 * Phase 7C.5 — Event Domain integration metadata vs Brain adapter boundary.
 *
 * Inspection found no Brain duplication/consumption of integration registries.
 * This suite guards the no-forced-migration decision.
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/event-integration-metadata.test.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  getAiGenerationIntegration,
  getCardClassifierIntegration,
  getCardLibraryIntegration,
  getEmailDeliveryIntegration,
  getEventScheduling,
  getHandwryttenIntegration,
  resolveOccurrence,
} from "@workspace/events";

import { enrichActionPlanRouting } from "../brain/action/enrichActionPlanRouting.js";
import { buildBrainEventActionHref } from "../brain/product/buildBrainEventActionHref.js";
import { buildEventPreparationContext } from "../brain/events/buildEventPreparationContext.js";
import {
  getBrainEventAvailabilityMetadata,
  getBrainEventBriefingMetadata,
  getBrainEventPreparationMetadata,
  getBrainEventView,
  isEventAvailableForRelationship,
  listSupportedBrainEventIds,
} from "../brain/events/eventDomain/index.js";
import { resolveCatalogEventTiming } from "../brain/events/resolveCatalogEventTiming.js";
import { minimalRelationshipContext } from "./fixtures/minimalRelationshipContext.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(TEST_DIR, "../../../..");
const API_SRC = join(REPO_ROOT, "artifacts/api-server/src");
const BRAIN_EVENTS = join(API_SRC, "brain/events");
const ADAPTER_PATH = join(BRAIN_EVENTS, "eventDomain/adapter.ts");

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
    } else if (entry.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

section("Event Domain integration registries exist (source of truth)");
{
  expect(
    "handwrytten birthday categories",
    [...(getHandwryttenIntegration("birthday")?.categories ?? [])],
    ["Birthday"],
  );
  expect(
    "ai birthday archetypes",
    [...(getAiGenerationIntegration("birthday")?.archetypes ?? [])],
    ["Celebration"],
  );
  expectTrue(
    "classifier anniversary present",
    getCardClassifierIntegration("anniversary") != null,
  );
  expectTrue(
    "card library valentines present",
    getCardLibraryIntegration("valentines_day") != null,
  );
  expectTrue(
    "email birthday present",
    getEmailDeliveryIntegration("birthday") != null,
  );
}

section("no Brain integration metadata API / no forced consumer");
{
  const adapterSource = readFileSync(ADAPTER_PATH, "utf8");
  expectTrue(
    "no getBrainEventIntegrationMetadata",
    !adapterSource.includes("getBrainEventIntegrationMetadata"),
  );
  expectTrue(
    "no BrainEventIntegrationMetadata type",
    !adapterSource.includes("BrainEventIntegrationMetadata"),
  );

  const importBlock =
    adapterSource.match(
      /import\s*\{([\s\S]*?)\}\s*from\s*["']@workspace\/events["']/,
    )?.[1] ?? "";
  for (const name of [
    "getHandwryttenIntegration",
    "getAiGenerationIntegration",
    "getCardClassifierIntegration",
    "getCardLibraryIntegration",
    "getEmailDeliveryIntegration",
  ]) {
    expectTrue(`adapter does not import ${name}`, !new RegExp(`\\b${name}\\b`).test(importBlock));
  }
  expectTrue(
    "adapter does not import resolveOccurrence",
    !/\bresolveOccurrence\b/.test(importBlock),
  );
  expectTrue(
    "adapter does not import handwrytten SDK",
    !adapterSource.includes('from "handwrytten"') &&
      !adapterSource.includes("from 'handwrytten'"),
  );
}

section("Brain event modules do not duplicate integration registries");
{
  const hits: string[] = [];
  for (const file of listTsFiles(BRAIN_EVENTS)) {
    const rel = relative(API_SRC, file).replace(/\\/g, "/");
    if (rel.includes("eventDomain/README.md")) continue;
    const text = readFileSync(file, "utf8");
    // Production Brain event code must not embed HW/AI/email/library registries.
    if (
      text.includes("scoringHints") ||
      text.includes("libraryCategories") ||
      text.includes("matchKeywords") ||
      text.includes('archetypes: ["Celebration"]') ||
      text.includes('categories: ["Birthday"]')
    ) {
      hits.push(rel);
    }
  }
  expect("no duplicated integration registry literals in brain/events", hits, []);
}

section("Brain-safe views exclude integration fields");
{
  for (const eventId of listSupportedBrainEventIds()) {
    const view = getBrainEventView(eventId);
    const prep = getBrainEventPreparationMetadata(eventId);
    const briefing = getBrainEventBriefingMetadata(eventId);
    const availability = getBrainEventAvailabilityMetadata(eventId);
    for (const [label, obj] of [
      ["view", view],
      ["prep", prep],
      ["briefing", briefing],
      ["availability", availability],
    ] as const) {
      expectTrue(
        `${eventId} ${label} has no categories`,
        !("categories" in obj),
      );
      expectTrue(
        `${eventId} ${label} has no archetypes`,
        !("archetypes" in obj),
      );
      expectTrue(
        `${eventId} ${label} has no matchKeywords`,
        !("matchKeywords" in obj),
      );
      expectTrue(
        `${eventId} ${label} has no libraryCategories`,
        !("libraryCategories" in obj),
      );
    }
    expectTrue(
      `${eventId} briefing questionSetId distinct field`,
      "questionSetId" in briefing && "eventId" in briefing,
    );
    expectTrue(
      `${eventId} availability has no questionSetId`,
      !("questionSetId" in availability),
    );
    expectTrue(`${eventId} view has no sourceRuleId`, !("sourceRuleId" in view));
  }
}

section("identity / behavior parity unchanged");
{
  expect("birthday Friend available", isEventAvailableForRelationship("birthday", "Friend"), true);
  expect(
    "valentines Friend unavailable",
    isEventAvailableForRelationship("valentines_day", "Friend"),
    false,
  );

  const prep = buildEventPreparationContext({
    relationshipContext: minimalRelationshipContext({
      generatedAt: "2026-07-01T00:00:00.000Z",
      birthday: "1988-07-08",
      previewDays: 14,
      relationshipType: "Friend",
    }),
    referenceDate: new Date("2026-07-01T00:00:00.000Z"),
    preparationWindowDays: 14,
  });
  expectTrue("prep birthday present", prep.byEventId.birthday != null);

  expect(
    "briefing title",
    getBrainEventBriefingMetadata("birthday").questionSetTitle,
    "Birthday",
  );

  const plan = enrichActionPlanRouting(
    {
      type: "ask_question",
      category: "birthday",
      priority: "high",
      sourceRuleId: "birthday",
      primaryReason: "test",
      reasons: ["test"],
      confidence: 0.9,
      debugNotes: [],
    },
    "ask_question",
  );
  expect("routing experience", plan.routing?.experience, "event_briefing");
  expect("routing label", plan.routing?.briefingEventLabel, "Birthday");

  const href = buildBrainEventActionHref({
    recipientId: "recipient-1",
    sourceRuleId: "birthday",
    routing: plan.routing!,
  });
  expectTrue("product href still briefing path", (href ?? "").includes("/briefings/"));
  expectTrue("href not built from HW categories", !(href ?? "").includes("Everyday"));

  expect(
    "timing friend valentines inapplicable",
    resolveCatalogEventTiming(
      "valentines_day",
      minimalRelationshipContext({ relationshipType: "Friend" }),
      new Date("2026-01-15T12:00:00.000Z"),
    ).applicable,
    false,
  );
}

section("EVENT_QUESTIONS untouched; scheduling stub unused");
{
  const eventQuestions = readFileSync(
    join(REPO_ROOT, "artifacts/fi-forgot/src/lib/data.ts"),
    "utf8",
  );
  expectTrue("EVENT_QUESTIONS present", eventQuestions.includes("export const EVENT_QUESTIONS"));
  expectTrue(
    "Birthday question content present",
    eventQuestions.includes("Is this a milestone birthday?"),
  );

  const stub = resolveOccurrence(getEventScheduling("birthday")!, {
    referenceDate: new Date("2026-06-01T12:00:00.000Z"),
    recipientDates: { birthday: "1990-07-08" },
  });
  expect("stub still stubbed", stub.stubbed, true);
}

section("production Brain modules do not import @workspace/events");
{
  const hits: string[] = [];
  for (const file of listTsFiles(join(API_SRC, "brain"))) {
    const rel = relative(API_SRC, file).replace(/\\/g, "/");
    if (rel.startsWith("brain/events/eventDomain/")) continue;
    const text = readFileSync(file, "utf8");
    if (/from\s+["']@workspace\/events["']/.test(text)) {
      hits.push(rel);
    }
  }
  expect("no direct Brain imports outside adapter", hits, []);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
