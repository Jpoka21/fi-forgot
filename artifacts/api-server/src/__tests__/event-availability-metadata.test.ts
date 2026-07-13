/**
 * Phase 7C.4 — Brain event availability metadata via Event Domain adapter.
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/event-availability-metadata.test.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getEventScheduling, resolveOccurrence } from "@workspace/events";

import { enrichActionPlanRouting } from "../brain/action/enrichActionPlanRouting.js";
import { buildEventPreparationContext } from "../brain/events/buildEventPreparationContext.js";
import {
  getBrainEventAvailabilityMetadata,
  getBrainEventBriefingMetadata,
  getBrainEventView,
  isBrainEventAvailableOnSurface,
  isEventAvailableForRelationship,
  listBrainEventAvailabilityMetadata,
  requireCanonicalEventId,
  toCanonicalEventId,
} from "../brain/events/eventDomain/index.js";
import { resolveCatalogEventTiming } from "../brain/events/resolveCatalogEventTiming.js";
import { minimalRelationshipContext } from "./fixtures/minimalRelationshipContext.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(TEST_DIR, "../../../..");
const ADAPTER_PATH = join(
  REPO_ROOT,
  "artifacts/api-server/src/brain/events/eventDomain/adapter.ts",
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

function expectTrue(label: string, actual: boolean): void {
  expect(label, actual, true);
}

function expectThrows(label: string, fn: () => void): void {
  try {
    fn();
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
    console.log(`      expected throw`);
  } catch {
    passed++;
    console.log(`  ✓ ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

section("static availability metadata flows through the adapter");
{
  expect("birthday availability", getBrainEventAvailabilityMetadata("birthday"), {
    eventId: "birthday",
    surfaces: { personal: true, business: true },
    declaredRoles: [],
    requiresRomanticRelationship: false,
  });
  expect("anniversary availability", getBrainEventAvailabilityMetadata("anniversary"), {
    eventId: "anniversary",
    surfaces: { personal: true, business: false },
    declaredRoles: [],
    requiresRomanticRelationship: false,
  });
  expect(
    "valentines availability",
    getBrainEventAvailabilityMetadata("valentines_day"),
    {
      eventId: "valentines_day",
      surfaces: { personal: true, business: false },
      declaredRoles: ["romantic"],
      requiresRomanticRelationship: true,
    },
  );
  expect(
    "list covers three",
    listBrainEventAvailabilityMetadata().map((e) => e.eventId),
    ["birthday", "anniversary", "valentines_day"],
  );
  expect("birthday personal surface", isBrainEventAvailableOnSurface("birthday", "personal"), true);
  expect("anniversary business surface", isBrainEventAvailableOnSurface("anniversary", "business"), false);
  expect("valentines business surface", isBrainEventAvailableOnSurface("valentines_day", "business"), false);
}

section("view composes availability metadata");
{
  const view = getBrainEventView("valentines_day");
  const availability = getBrainEventAvailabilityMetadata("valentines_day");
  expect("view surfaces", view.surfaces, availability.surfaces);
  expect(
    "view romantic flag",
    view.requiresRomanticRelationship,
    availability.requiresRomanticRelationship,
  );
  expectTrue("view has no includeTypes", !("includeTypes" in view));
  expectTrue(
    "availability has no includeTypes",
    !("includeTypes" in availability),
  );
}

section("unsupported event failure / no fuzzy resolution");
{
  expect("toCanonical Birthday label", toCanonicalEventId("Birthday"), null);
  expect("toCanonical substring", toCanonicalEventId("birth"), null);
  expectThrows("availability unknown", () =>
    getBrainEventAvailabilityMetadata("mothers_day" as "birthday"),
  );
  expectThrows("requireCanonical unknown", () =>
    requireCanonicalEventId("mothers_day"),
  );
  expect(
    "surface check unsupported",
    isBrainEventAvailableOnSurface("mothers_day" as "birthday", "personal"),
    false,
  );
}

section("runtime relationship interpretation unchanged");
{
  expect("birthday Friend", isEventAvailableForRelationship("birthday", "Friend"), true);
  expect("anniversary Friend", isEventAvailableForRelationship("anniversary", "Friend"), true);
  expect("valentines Wife", isEventAvailableForRelationship("valentines_day", "Wife"), true);
  expect("valentines Partner", isEventAvailableForRelationship("valentines_day", "Partner"), true);
  expect("valentines Friend", isEventAvailableForRelationship("valentines_day", "Friend"), false);
  expect("valentines null", isEventAvailableForRelationship("valentines_day", null), false);

  const ref = new Date("2026-01-15T12:00:00.000Z");
  expect(
    "timing romantic applicable",
    resolveCatalogEventTiming(
      "valentines_day",
      minimalRelationshipContext({ relationshipType: "Wife" }),
      ref,
    ).applicable,
    true,
  );
  expect(
    "timing friend not applicable",
    resolveCatalogEventTiming(
      "valentines_day",
      minimalRelationshipContext({ relationshipType: "Friend" }),
      ref,
    ).applicable,
    false,
  );
}

section("preparation and briefing behavior unchanged");
{
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
  expectTrue("birthday prep present", prep.byEventId.birthday != null);
  expect("friend valentines omitted", prep.byEventId.valentines_day, undefined);
  expect(
    "briefing title still Birthday",
    getBrainEventBriefingMetadata("birthday").questionSetTitle,
    "Birthday",
  );
}

section("Action Planner routing unchanged");
{
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
  expect("routing eventId", plan.routing?.eventId, "birthday");
}

section("identity separation + EVENT_QUESTIONS untouched");
{
  const availability = getBrainEventAvailabilityMetadata("birthday");
  const briefing = getBrainEventBriefingMetadata("birthday");
  expectTrue("availability has eventId", availability.eventId === "birthday");
  expectTrue("briefing has questionSetId", briefing.questionSetId === "birthday");
  expectTrue(
    "availability has no questionSetId",
    !("questionSetId" in availability),
  );
  expectTrue("availability has no sourceRuleId", !("sourceRuleId" in availability));

  const eventQuestions = readFileSync(
    join(REPO_ROOT, "artifacts/fi-forgot/src/lib/data.ts"),
    "utf8",
  );
  expectTrue("EVENT_QUESTIONS still present", eventQuestions.includes("export const EVENT_QUESTIONS"));
  expectTrue(
    "Birthday question content unchanged",
    eventQuestions.includes("Is this a milestone birthday?"),
  );
}

section("adapter reads availability; no scheduling / occurrence APIs");
{
  const adapterSource = readFileSync(ADAPTER_PATH, "utf8");
  const importBlock =
    adapterSource.match(
      /import\s*\{([\s\S]*?)\}\s*from\s*["']@workspace\/events["']/,
    )?.[1] ?? "";
  expectTrue("imports getEventAvailability", /\bgetEventAvailability\b/.test(importBlock));
  expectTrue(
    "does not import resolveOccurrence",
    !/\bresolveOccurrence\b/.test(importBlock),
  );
  expectTrue(
    "does not import matchesRelationshipFilter",
    !/\bmatchesRelationshipFilter\b/.test(importBlock),
  );
  expectTrue(
    "does not import listAvailableEventIds",
    !/\blistAvailableEventIds\b/.test(importBlock),
  );

  const stub = resolveOccurrence(getEventScheduling("birthday")!, {
    referenceDate: new Date("2026-06-01T12:00:00.000Z"),
    recipientDates: { birthday: "1990-07-08" },
  });
  expect("stub still stubbed", stub.stubbed, true);
}

section("availability metadata keys are Brain-safe");
{
  const keys = Object.keys(getBrainEventAvailabilityMetadata("valentines_day")).sort();
  expect("keys", keys, [
    "declaredRoles",
    "eventId",
    "requiresRomanticRelationship",
    "surfaces",
  ]);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
