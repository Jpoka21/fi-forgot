/**
 * Brain Event Domain adapter tests — Phase 7C.1.
 *
 * Run with:
 *   corepack pnpm dlx tsx artifacts/api-server/src/__tests__/event-domain-adapter.test.ts
 */

import { resolveOccurrence, getEventScheduling } from "@workspace/events";

import {
  getBrainEventTimingMetadata,
  getBrainEventView,
  getCanonicalEventDisplayLabel,
  isEventAvailableForRelationship,
  isSupportedBrainEventId,
  listSupportedBrainEventIds,
  requireCanonicalEventId,
  toCanonicalEventId,
} from "../brain/events/eventDomain/index.js";
import {
  BRAIN_EVENT_IDS,
  getBrainEventDefinition,
} from "../brain/events/brainEventCatalog.js";
import { resolveCatalogEventTiming } from "../brain/events/resolveCatalogEventTiming.js";
import { minimalRelationshipContext } from "./fixtures/minimalRelationshipContext.js";

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

section("exact supported event set");
{
  expect("listSupportedBrainEventIds", [...listSupportedBrainEventIds()], [
    "birthday",
    "anniversary",
    "valentines_day",
  ]);
  expect("BRAIN_EVENT_IDS matches adapter", [...BRAIN_EVENT_IDS], [
    "birthday",
    "anniversary",
    "valentines_day",
  ]);
}

section("canonical identity mapping");
{
  expect("toCanonical birthday", toCanonicalEventId("birthday"), "birthday");
  expect("toCanonical anniversary", toCanonicalEventId("anniversary"), "anniversary");
  expect(
    "toCanonical valentines_day",
    toCanonicalEventId("valentines_day"),
    "valentines_day",
  );
  expect("isSupported birthday", isSupportedBrainEventId("birthday"), true);
  expect(
    "display label birthday",
    getCanonicalEventDisplayLabel("birthday"),
    "Birthday",
  );
  expect(
    "catalog label from adapter",
    getBrainEventDefinition("birthday").briefingEventLabel,
    "Birthday",
  );
  expect(
    "catalog label anniversary",
    getBrainEventDefinition("anniversary").briefingEventLabel,
    "Anniversary",
  );
  expect(
    "catalog label valentines",
    getBrainEventDefinition("valentines_day").briefingEventLabel,
    "Valentine's Day",
  );
}

section("unknown identity failure");
{
  expect("toCanonical mothers_day", toCanonicalEventId("mothers_day"), null);
  expect("toCanonical Birthday label", toCanonicalEventId("Birthday"), null);
  expect("toCanonical substring", toCanonicalEventId("birth"), null);
  expect("toCanonical empty", toCanonicalEventId(""), null);
  expect("isSupported mothers_day", isSupportedBrainEventId("mothers_day"), false);
  expectThrows("requireCanonical unknown", () =>
    requireCanonicalEventId("mothers_day"),
  );
  expectThrows("getBrainEventView unknown", () =>
    getBrainEventView("mothers_day" as "birthday"),
  );
}

section("availability parity");
{
  expect(
    "birthday available for Friend",
    isEventAvailableForRelationship("birthday", "Friend"),
    true,
  );
  expect(
    "anniversary available for Friend",
    isEventAvailableForRelationship("anniversary", "Friend"),
    true,
  );
  expect(
    "valentines available for Wife",
    isEventAvailableForRelationship("valentines_day", "Wife"),
    true,
  );
  expect(
    "valentines available for Partner",
    isEventAvailableForRelationship("valentines_day", "Partner"),
    true,
  );
  expect(
    "valentines available for Spouse",
    isEventAvailableForRelationship("valentines_day", "Spouse"),
    true,
  );
  expect(
    "valentines unavailable for Friend",
    isEventAvailableForRelationship("valentines_day", "Friend"),
    false,
  );
  expect(
    "valentines unavailable for Mom",
    isEventAvailableForRelationship("valentines_day", "Mom"),
    false,
  );
  expect(
    "valentines unavailable for null",
    isEventAvailableForRelationship("valentines_day", null),
    false,
  );
}

section("no sourceRuleId derivation");
{
  const view = getBrainEventView("birthday");
  expectTrue("view has eventId", view.eventId === "birthday");
  expectTrue("view has no sourceRuleId key", !("sourceRuleId" in view));
  expectTrue(
    "timing meta has no sourceRuleId",
    !("sourceRuleId" in getBrainEventTimingMetadata("birthday")),
  );
}

section("Event Domain scheduling resolver is not called by adapter path");
{
  // Adapter reads static timing metadata only. Prove stub still unused:
  const scheduling = getEventScheduling("birthday")!;
  const stub = resolveOccurrence(scheduling, {
    referenceDate: new Date("2026-06-01T12:00:00.000Z"),
    recipientDates: { birthday: "1990-07-08" },
  });
  expect("stub still stubbed", stub.stubbed, true);
  expect("stub not applicable", stub.applicable, false);

  // Brain timing path still computes dates via Brain utilities
  const ctx = minimalRelationshipContext({
    birthday: "1990-07-08",
    relationshipType: "Friend",
  });
  const timing = resolveCatalogEventTiming(
    "birthday",
    ctx,
    new Date("2026-06-01T12:00:00.000Z"),
  );
  expectTrue("Brain timing applicable", timing.applicable === true);
  expectTrue("Brain timing has days", timing.daysUntilEvent != null);
}

section("adapter exposes no integration or presentation metadata");
{
  const view = getBrainEventView("valentines_day");
  const keys = Object.keys(view).sort();
  expect("BrainEventView keys", keys, [
    "category",
    "displayLabel",
    "eventId",
    "kind",
    "requiresRomanticRelationship",
    "surfaces",
  ]);
  expectTrue("no emoji", !("emoji" in view));
  expectTrue("no handwrytten", !("categories" in view));
  expectTrue("no archetypes", !("archetypes" in view));
  expect("requiresRomantic", view.requiresRomanticRelationship, true);
  expect("birthday not romantic", getBrainEventView("birthday").requiresRomanticRelationship, false);
}

section("timing metadata parity");
{
  expect("birthday timing", getBrainEventTimingMetadata("birthday").timing, {
    kind: "recipient_date",
    field: "birthday",
  });
  expect("anniversary timing", getBrainEventTimingMetadata("anniversary").timing, {
    kind: "recipient_date",
    field: "anniversary",
  });
  expect("valentines timing", getBrainEventTimingMetadata("valentines_day").timing, {
    kind: "fixed_calendar",
    monthDay: "02-14",
  });
}

section("resolveCatalogEventTiming eligibility parity");
{
  const romanticCtx = minimalRelationshipContext({
    relationshipType: "Wife",
  });
  const friendCtx = minimalRelationshipContext({
    relationshipType: "Friend",
  });
  const ref = new Date("2026-01-15T12:00:00.000Z");

  expect(
    "valentines romantic applicable",
    resolveCatalogEventTiming(
      "valentines_day",
      romanticCtx,
      ref,
    ).applicable,
    true,
  );
  expect(
    "valentines friend not applicable",
    resolveCatalogEventTiming(
      "valentines_day",
      friendCtx,
      ref,
    ).applicable,
    false,
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
