/**
 * Architecture / contract guards for @workspace/events (Phase 7B.2).
 *
 * Run with:
 *   corepack pnpm dlx tsx lib/events/src/__tests__/events-architecture.test.ts
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  EVENT_AVAILABILITY_REGISTRY,
  EVENT_BRIEFING_REGISTRY,
  EVENT_IDS,
  EVENT_IDENTITY_REGISTRY,
  EVENT_PRESENTATION_REGISTRY,
  EVENT_SCHEDULING_REGISTRY,
  SCHEDULING_NOT_MIGRATED_REASON,
  getAiProjection,
  getBriefingProjection,
  getCalendarProjection,
  getCardLibraryProjection,
  getCatalogProjection,
  getEvent,
  getEventAvailability,
  getFrontendOccasionProjection,
  getHandwryttenProjection,
  isEventId,
  resolveEventId,
  resolveOccurrence,
  getEventScheduling,
} from "../index.js";
import {
  AI_GENERATION_INTEGRATION_REGISTRY,
  CARD_CLASSIFIER_INTEGRATION_REGISTRY,
  CARD_LIBRARY_INTEGRATION_REGISTRY,
  EMAIL_DELIVERY_INTEGRATION_REGISTRY,
  HANDWRYTTEN_INTEGRATION_REGISTRY,
} from "../integrations/registry.js";
import { __normalizationLookupSizeForTests } from "../normalization/resolveEventId.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(TEST_DIR, "../..");
const SRC_ROOT = join(PACKAGE_ROOT, "src");
const REPO_ROOT = join(PACKAGE_ROOT, "../..");

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

function readSrc(relativePath: string): string {
  return readFileSync(join(SRC_ROOT, relativePath), "utf8");
}

section("exact initial event set");
{
  expect("EVENT_IDS exact", [...EVENT_IDS], [
    "birthday",
    "anniversary",
    "valentines_day",
  ]);
  expect("EVENT_IDS length", EVENT_IDS.length, 3);
  expectTrue("no mothers_day in EVENT_IDS", !EVENT_IDS.includes("mothers_day" as never));
}

section("closed event identity");
{
  expectTrue("birthday is EventId", isEventId("birthday"));
  expect("arbitrary string is not EventId", isEventId("custom_event"), false);
  expect("empty string is not EventId", isEventId(""), false);

  // Type-level: EventId is derived from EVENT_IDS (documented by source)
  const eventIdsSource = readSrc("core/eventIds.ts");
  expectTrue(
    "EventId derived from EVENT_IDS",
    eventIdsSource.includes("export type EventId = (typeof EVENT_IDS)[number]"),
  );
  expectTrue(
    "EventId is not open string",
    !eventIdsSource.includes('export type EventId = string'),
  );
}

section("registry completeness — all keyed by EventId");
{
  const registries: Array<[string, Record<string, unknown>]> = [
    ["identity", EVENT_IDENTITY_REGISTRY],
    ["scheduling", EVENT_SCHEDULING_REGISTRY],
    ["availability", EVENT_AVAILABILITY_REGISTRY],
    ["briefing", EVENT_BRIEFING_REGISTRY],
    ["presentation", EVENT_PRESENTATION_REGISTRY],
    ["handwrytten", HANDWRYTTEN_INTEGRATION_REGISTRY],
    ["ai", AI_GENERATION_INTEGRATION_REGISTRY],
    ["classifier", CARD_CLASSIFIER_INTEGRATION_REGISTRY],
    ["library", CARD_LIBRARY_INTEGRATION_REGISTRY],
    ["email", EMAIL_DELIVERY_INTEGRATION_REGISTRY],
  ];

  for (const [name, registry] of registries) {
    const keys = Object.keys(registry).sort();
    expect(`${name} keys`, keys, [
      "anniversary",
      "birthday",
      "valentines_day",
    ]);
    for (const id of EVENT_IDS) {
      expectTrue(`${name} has ${id}`, id in registry);
    }
  }
}

section("identity facts not redefined across registries");
{
  for (const id of EVENT_IDS) {
    const identity = EVENT_IDENTITY_REGISTRY[id];
    expect(`${id} scheduling eventId`, EVENT_SCHEDULING_REGISTRY[id].eventId, id);
    expect(`${id} availability eventId`, EVENT_AVAILABILITY_REGISTRY[id].eventId, id);
    expect(`${id} briefing eventId`, EVENT_BRIEFING_REGISTRY[id].eventId, id);
    expect(`${id} presentation eventId`, EVENT_PRESENTATION_REGISTRY[id].eventId, id);
    expectTrue(`${id} identity frozen`, Object.isFrozen(identity));
  }
}

section("alias collisions and canonical self-resolution");
{
  expectTrue("lookup built without throw", __normalizationLookupSizeForTests() > 0);

  for (const id of EVENT_IDS) {
    expect(`self-resolve ${id}`, resolveEventId(id), id);
    expect(
      `label-resolve ${id}`,
      resolveEventId(EVENT_IDENTITY_REGISTRY[id].displayLabel),
      id,
    );
  }

  // Collect all normalized keys and ensure each maps to one event
  const seen = new Map<string, string>();
  let collision = false;
  for (const id of EVENT_IDS) {
    const identity = EVENT_IDENTITY_REGISTRY[id];
    const keys = [id, identity.displayLabel, ...identity.aliases];
    for (const raw of keys) {
      const key = raw
        .trim()
        .toLowerCase()
        .replace(/['']/g, "")
        .replace(/\s+/g, " ");
      const existing = seen.get(key);
      if (existing && existing !== id) {
        collision = true;
      }
      seen.set(key, id);
    }
  }
  expect("no cross-event alias collisions", collision, false);

  expect("unknown fails cleanly", resolveEventId("Mother's Day"), null);
  expect("substring fails", resolveEventId("day"), null);
  expect("partial birthday fails", resolveEventId("Birth"), null);
}

section("Valentine's Day declarative availability");
{
  const availability = getEventAvailability("valentines_day");
  expectTrue(
    "declares romantic role",
    availability?.relationshipFilter?.roles?.includes("romantic") === true,
  );
  const availabilityRegistry = readSrc("availability/registry.ts");
  const availabilityTypes = readSrc("availability/types.ts");
  expectTrue(
    "no RelationshipContext import",
    !/import\s+.*RelationshipContext/.test(availabilityRegistry) &&
      !/import\s+.*RelationshipContext/.test(availabilityTypes),
  );
  expectTrue(
    "availability types document adapter boundary",
    availabilityTypes.includes("NOT a relationship taxonomy"),
  );
}

section("safe scheduling stub");
{
  const scheduling = getEventScheduling("birthday")!;
  const result = resolveOccurrence(scheduling, {
    referenceDate: new Date(),
    recipientDates: { birthday: "2000-01-01", anniversary: "2001-02-02" },
  });
  expect("stubbed flag", result.stubbed, true);
  expect("not applicable", result.applicable, false);
  expect("null date", result.occurrenceDateStr, null);
  expect("null cycleYear", result.cycleYear, null);
  expect("null daysUntil", result.daysUntil, null);
  expect("explicit reason", result.reason, SCHEDULING_NOT_MIGRATED_REASON);
  expectTrue(
    "reason marks not migrated",
    result.reason.includes("SCHEDULING_NOT_MIGRATED"),
  );
}

section("projection field isolation");
{
  const catalogKeys = Object.keys(getCatalogProjection("birthday")!).sort();
  expect("catalog keys", catalogKeys, [
    "active",
    "category",
    "displayLabel",
    "eventId",
    "kind",
  ]);

  const frontendKeys = Object.keys(
    getFrontendOccasionProjection("birthday")!,
  ).sort();
  expect("frontend keys", frontendKeys, [
    "briefingQuestionSetId",
    "business",
    "displayLabel",
    "emoji",
    "eventId",
    "personal",
  ]);

  const calendarKeys = Object.keys(getCalendarProjection("birthday")!).sort();
  expect("calendar keys", calendarKeys, [
    "calendarVisible",
    "displayLabel",
    "emoji",
    "eventId",
    "filterGroup",
    "timingKind",
  ]);
  expectTrue(
    "calendar does not expose full timing",
    !calendarKeys.includes("timing"),
  );
  expectTrue(
    "calendar does not expose constraints",
    !calendarKeys.includes("constraints"),
  );

  const briefingKeys = Object.keys(getBriefingProjection("birthday")!).sort();
  expect("briefing keys", briefingKeys, [
    "displayLabel",
    "eventId",
    "questionSetId",
    "questionSetTitle",
    "questionSetVersion",
  ]);
  expectTrue(
    "briefing has no questions array",
    !briefingKeys.includes("questions"),
  );

  const hwKeys = Object.keys(getHandwryttenProjection("birthday")!).sort();
  expect("handwrytten keys", hwKeys, [
    "categories",
    "displayLabel",
    "eventId",
    "libraryCategories",
    "scoringHints",
  ]);

  const aiKeys = Object.keys(getAiProjection("birthday")!).sort();
  expect("ai keys", aiKeys, [
    "archetypes",
    "displayLabel",
    "eventId",
    "excludeKeywords",
    "matchKeywords",
  ]);

  const libraryKeys = Object.keys(getCardLibraryProjection("birthday")!).sort();
  expect("card library keys", libraryKeys, [
    "displayLabel",
    "eventId",
    "libraryCategories",
  ]);
}

section("projection immutability / registry protection");
{
  const catalog = getCatalogProjection("birthday")!;
  expectTrue("catalog frozen", Object.isFrozen(catalog));

  const hw = getHandwryttenProjection("birthday")!;
  expectTrue("handwrytten frozen", Object.isFrozen(hw));
  expectTrue("handwrytten categories frozen", Object.isFrozen(hw.categories));

  const identity = getEvent("birthday")!;
  expectTrue("identity registry entry frozen", Object.isFrozen(identity));
  expectTrue("identity aliases frozen", Object.isFrozen(identity.aliases));

  expectTrue(
    "identity registry frozen",
    Object.isFrozen(EVENT_IDENTITY_REGISTRY),
  );
}

section("no Brain projection / no sourceRuleId in domain");
{
  const indexSource = readSrc("index.ts");
  expectTrue(
    "public API documents no sourceRuleId",
    indexSource.includes("never defines or exports Brain sourceRuleId"),
  );
  expectTrue(
    "no Brain projection export",
    !indexSource.includes("BrainProjection") &&
      !indexSource.includes("getBrainProjection"),
  );

  const srcFiles = listTsFiles(SRC_ROOT).filter(
    (f) => !f.includes(`${join("src", "__tests__")}`),
  );
  let foundSourceRuleIdField = false;
  let foundBrainImport = false;
  for (const file of srcFiles) {
    const text = readFileSync(file, "utf8");
    // Ban actual type/field/export definitions — allow documentation mentions
    if (
      /export\s+(type|interface|const|function|class)\s+.*sourceRuleId/.test(text) ||
      /\bsourceRuleId\s*[?:]/.test(text) ||
      /\bsourceRuleId\s*=/.test(text)
    ) {
      foundSourceRuleIdField = true;
    }
    if (
      /from\s+["'][^"']*brain\//.test(text) ||
      /from\s+["']@workspace\/api-server/.test(text)
    ) {
      foundBrainImport = true;
    }
  }
  expect("no sourceRuleId field/type in domain src", foundSourceRuleIdField, false);
  expect("no brain imports in domain src", foundBrainImport, false);
}

section("no integration client / question engine imports");
{
  const srcFiles = listTsFiles(SRC_ROOT).filter(
    (f) => !f.includes(`${join("src", "__tests__")}`),
  );
  const hits: string[] = [];
  for (const file of srcFiles) {
    const text = readFileSync(file, "utf8");
    const rel = relative(SRC_ROOT, file);

    const importLines = text
      .split("\n")
      .filter((line) => /^\s*import\s+/.test(line) || /^\s*export\s+.*from\s+/.test(line));

    for (const line of importLines) {
      if (
        /handwrytten|openai|anthropic|@sendgrid|sendgrid|question-engine|questionCatalog|EVENT_QUESTIONS/i.test(
          line,
        )
      ) {
        hits.push(`${rel}: ${line.trim()}`);
      }
    }

    if (/\bfetch\s*\(/.test(text)) {
      hits.push(`${rel}: fetch(`);
    }
    if (/\bprocess\.env\b/.test(text)) {
      hits.push(`${rel}: process.env`);
    }
  }
  expect("no banned integration/question imports", hits, []);
}

section("briefing references only");
{
  const briefingTypes = readSrc("briefing/types.ts");
  expectTrue(
    "briefing types say references only",
    briefingTypes.includes("References only"),
  );
  expectTrue(
    "no questions field on EventBriefingRef",
    !briefingTypes.includes("questions:"),
  );
  const briefingProj = getBriefingProjection("birthday")!;
  expectTrue(
    "projection has no question bodies",
    !("questions" in briefingProj) && !("answers" in briefingProj),
  );
}

section("no production consumer imports @workspace/events except Brain adapter");
{
  const artifactRoots = [
    join(REPO_ROOT, "artifacts", "api-server", "src"),
    join(REPO_ROOT, "artifacts", "fi-forgot", "src"),
  ];
  const importPattern =
    /(?:from\s+|import\s*\(\s*)["']@workspace\/events["']|(?:from\s+|import\s*\(\s*)["']lib\/events/;
  const consumerHits: string[] = [];
  for (const root of artifactRoots) {
    for (const file of listTsFiles(root)) {
      const text = readFileSync(file, "utf8");
      if (!importPattern.test(text)) {
        continue;
      }
      const rel = relative(REPO_ROOT, file).replace(/\\/g, "/");
        // Allowed: Brain eventDomain adapter + its tests
        if (
          rel.includes("brain/events/eventDomain/") ||
          rel.includes("__tests__/event-domain-adapter.test.ts") ||
          rel.includes("__tests__/brain-event-domain-architecture.test.ts") ||
          rel.includes("__tests__/event-preparation-metadata.test.ts") ||
          rel.includes("__tests__/event-briefing-metadata.test.ts") ||
          rel.includes("__tests__/event-availability-metadata.test.ts") ||
          rel.includes("__tests__/event-integration-metadata.test.ts") ||
          rel.includes("__tests__/event-presentation-metadata.test.ts") ||
          rel.includes("lib/events/")
        ) {
          continue;
        }
      consumerHits.push(rel);
    }
  }
  expect("no unauthorized artifact imports", consumerHits, []);

  // package.json dependency check — api-server may depend; frontend must not
  const apiPkg = JSON.parse(
    readFileSync(join(REPO_ROOT, "artifacts/api-server/package.json"), "utf8"),
  );
  const fePkg = JSON.parse(
    readFileSync(join(REPO_ROOT, "artifacts/fi-forgot/package.json"), "utf8"),
  );
  expect(
    "api-server depends on @workspace/events",
    apiPkg.dependencies?.["@workspace/events"] ?? null,
    "workspace:*",
  );
  expect(
    "fi-forgot has no @workspace/events dep",
    fePkg.dependencies?.["@workspace/events"] ??
      fePkg.devDependencies?.["@workspace/events"] ??
      null,
    null,
  );
}

section("eventId remains separate from sourceRuleId");
{
  // Domain exports EventId but must not export or alias sourceRuleId as a symbol
  const indexSource = readSrc("index.ts");
  expectTrue("exports EventId", indexSource.includes("EventId"));
  expectTrue(
    "does not export sourceRuleId symbol",
    !/export\s+[^;]*\bsourceRuleId\b/.test(indexSource),
  );
  expectTrue(
    "EventOccurrenceRef exported as distinct concept",
    indexSource.includes("EventOccurrenceRef"),
  );
  expectTrue(
    "BriefingQuestionSetId exported as distinct concept",
    indexSource.includes("BriefingQuestionSetId"),
  );
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("Failures:", failures.join(", "));
  process.exit(1);
}
