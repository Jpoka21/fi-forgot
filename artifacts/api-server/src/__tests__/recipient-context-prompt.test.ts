/**
 * Unit tests for recipient-context-prompt pure functions.
 *
 * Tests buildContextSupplement and extractContextAvoids against the six
 * scenarios requested:
 *   1. Recipient with full context
 *   2. Recipient with no context (null)
 *   3. Wrong userId (identity null, profile null — context arrives empty)
 *   4. Briefing answers included correctly
 *   5. Previous card history included
 *   6. Things to avoid extracted correctly for system-level hard instructions
 *
 * Run with:
 *   pnpm dlx tsx artifacts/api-server/src/__tests__/recipient-context-prompt.test.ts
 */

import {
  buildContextSupplement,
  extractContextAvoids,
} from "../services/recipient-context-prompt.js";
import type { RecipientContext } from "../services/recipient-context.js";

// ─── Harness ─────────────────────────────────────────────────────────────────

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

function expectContains(label: string, haystack: string | null, needle: string): void {
  const ok = typeof haystack === "string" && haystack.includes(needle);
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
    console.log(`      expected to contain: ${JSON.stringify(needle)}`);
    console.log(`      received:             ${JSON.stringify(haystack)}`);
  }
}

function expectNotContains(label: string, haystack: string | null, needle: string): void {
  const ok = typeof haystack === "string" && !haystack.includes(needle);
  if (ok) {
    passed++;
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    failures.push(label);
    console.log(`  ✗ ${label}`);
    console.log(`      expected NOT to contain: ${JSON.stringify(needle)}`);
    console.log(`      received:                 ${JSON.stringify(haystack)}`);
  }
}

function section(name: string) { console.log(`\n${name}`); }

// ─── Fixtures ────────────────────────────────────────────────────────────────

const now = new Date().toISOString();

function makeContext(overrides: Partial<RecipientContext> = {}): RecipientContext {
  return {
    contextVersion: 1,
    generatedAt: now,
    recipientId: "r-1",
    userId: "u-1",
    identity: {
      id: "r-1",
      firstName: "Sarah",
      lastName: "Mitchell",
      nickname: null,
      fullName: "Sarah Mitchell",
      active: true,
      archived: false,
    },
    relationship: {
      type: "Wife",
      label: "Wife",
      birthday: "1988-04-12",
      anniversary: "2015-06-20",
    },
    personality: {
      notes: "Very thoughtful and sentimental",
      traits: ["sweet", "calm"],
    },
    interests: ["reading", "travel"],
    memories: {
      favoriteMemories: "Our trip to Italy in 2019",
      insideJokes: "The pasta incident",
    },
    tone: {
      preferred: "Romantic",
      emotionalOpenness: 8,
      thingsToAvoid: "Anything too cheesy, generic Hallmark phrases",
      thingsToAlwaysInclude: "A specific memory",
    },
    delivery: {
      preference: "Mail it to me",
      previewDays: 14,
      senderNickname: "Love always",
      signOff: null,
    },
    cardHistory: {
      totalSent: 0,
      approvedCount: 0,
      rejectedCount: 0,
      editedCount: 0,
      eventTypes: [],
      mostRecentCard: null,
    },
    briefingSummary: {
      totalAnswers: 0,
      byEvent: {},
      allAnswers: [],
    },
    profileCompleteness: {
      score: 80,
      filled: ["Birthday", "Personality notes"],
      missing: ["Anniversary"],
    },
    freshUpdates: [],
    ...overrides,
  };
}

function emptyContext(): RecipientContext {
  return makeContext({
    identity: null,
    relationship: null,
    personality: { notes: null, traits: [] },
    interests: [],
    memories: { favoriteMemories: null, insideJokes: null },
    tone: { preferred: null, emotionalOpenness: null, thingsToAvoid: null, thingsToAlwaysInclude: null },
    delivery: { preference: null, previewDays: null, senderNickname: null, signOff: null },
    cardHistory: { totalSent: 0, approvedCount: 0, rejectedCount: 0, editedCount: 0, eventTypes: [], mostRecentCard: null },
    briefingSummary: { totalAnswers: 0, byEvent: {}, allAnswers: [] },
  });
}

// ─── Scenario 1: Recipient with full context ──────────────────────────────────

section("Scenario 1 — full context");
{
  const ctx = makeContext();
  const s = buildContextSupplement(ctx);

  expect("returns a string (not null)", typeof s, "string");
  expectContains("includes header", s, "Recipient profile intelligence");
  expectContains("includes character traits", s, "sweet, calm");
  expectContains("includes personality notes", s, "thoughtful and sentimental");
  expectContains("includes interests", s, "reading, travel");
  expectContains("includes favorite memories", s, "trip to Italy");
  expectContains("includes inside jokes", s, "pasta incident");
  expectContains("includes always include", s, "A specific memory");
  // thingsToAvoid must NOT appear in the supplement — it goes to extractContextAvoids
  expectNotContains("thingsToAvoid NOT in supplement", s, "Anything too cheesy");
  expectNotContains("thingsToAvoid NOT in supplement (2)", s, "generic Hallmark");
}

// ─── Scenario 2: Recipient with no context (null) ─────────────────────────────

section("Scenario 2 — null context");
{
  expect("buildContextSupplement(null) = null", buildContextSupplement(null), null);
  expect("extractContextAvoids(null) = []", JSON.stringify(extractContextAvoids(null)), JSON.stringify([]));
}

// ─── Scenario 3: Wrong userId (identity null, all profile fields null) ────────
// This mirrors what assembleRecipientContext returns when the recipient doesn't
// belong to the requesting userId — identity is null, profile is null (gated),
// Q&A and cards are empty (filtered by userId).

section("Scenario 3 — wrong userId (empty context, identity null)");
{
  const ctx = emptyContext();
  const s = buildContextSupplement(ctx);

  expect("supplement is null (no useful data)", s, null);
  expect("extractContextAvoids on empty context = []",
    JSON.stringify(extractContextAvoids(ctx)),
    JSON.stringify([]),
  );
}

// ─── Scenario 4: Briefing answers included ────────────────────────────────────

section("Scenario 4 — briefing answers");
{
  const ctx = makeContext({
    personality: { notes: null, traits: [] },
    interests: [],
    memories: { favoriteMemories: null, insideJokes: null },
    tone: { preferred: null, emotionalOpenness: null, thingsToAvoid: null, thingsToAlwaysInclude: null },
    briefingSummary: {
      totalAnswers: 2,
      byEvent: {
        "Birthday_2024": [
          { questionKey: "fav_gift",    question: "What gift did she love?",     answer: "The handmade photo album", eventType: "Birthday", eventYear: 2024 },
          { questionKey: "best_moment", question: "Best moment from this year?", answer: "Our road trip to the coast", eventType: "Birthday", eventYear: 2024 },
        ],
      },
      allAnswers: [],
    },
  });

  const s = buildContextSupplement(ctx);
  expect("supplement not null when answers present", s !== null, true);
  expectContains("briefing section header appears", s, "[Briefing answers — Birthday 2024]");
  expectContains("question text included", s, "What gift did she love?");
  expectContains("answer text included", s, "handmade photo album");
  expectContains("second answer included", s, "road trip to the coast");
}

section("Scenario 4b — multiple events grouped separately");
{
  const ctx = makeContext({
    personality: { notes: null, traits: [] },
    interests: [],
    memories: { favoriteMemories: null, insideJokes: null },
    tone: { preferred: null, emotionalOpenness: null, thingsToAvoid: null, thingsToAlwaysInclude: null },
    briefingSummary: {
      totalAnswers: 2,
      byEvent: {
        "Birthday_2024": [
          { questionKey: "q1", question: "Birthday Q", answer: "Birthday A", eventType: "Birthday", eventYear: 2024 },
        ],
        "Anniversary_2024": [
          { questionKey: "q2", question: "Anniversary Q", answer: "Anniversary A", eventType: "Anniversary", eventYear: 2024 },
        ],
      },
      allAnswers: [],
    },
  });

  const s = buildContextSupplement(ctx);
  expectContains("Birthday briefing header present", s, "[Briefing answers — Birthday 2024]");
  expectContains("Anniversary briefing header present", s, "[Briefing answers — Anniversary 2024]");
  expectContains("Birthday answer present", s, "Birthday A");
  expectContains("Anniversary answer present", s, "Anniversary A");
}

// ─── Scenario 5: Previous card history ────────────────────────────────────────

section("Scenario 5 — card history (avoid repetition)");
{
  const ctx = makeContext({
    personality: { notes: null, traits: [] },
    interests: [],
    memories: { favoriteMemories: null, insideJokes: null },
    tone: { preferred: null, emotionalOpenness: null, thingsToAvoid: null, thingsToAlwaysInclude: null },
    cardHistory: {
      totalSent: 2,
      approvedCount: 1,
      rejectedCount: 1,
      editedCount: 0,
      eventTypes: ["Birthday", "Anniversary"],
      mostRecentCard: { eventType: "Birthday", eventDate: "2024-04-12", status: "Approved" },
    },
  });

  const s = buildContextSupplement(ctx);
  expect("supplement not null when history present", s !== null, true);
  expectContains("card history section present", s, "[Card history]");
  expectContains("totalSent count in history", s, "2 card(s)");
  expectContains("most recent event type in history", s, "Birthday");
  expectContains("most recent status in history", s, "Approved");
  expectContains("avoid repetition instruction", s, "Avoid repeating");
}

section("Scenario 5b — no card history → section absent");
{
  const ctx = makeContext({
    personality: { notes: null, traits: [] },
    interests: [],
    memories: { favoriteMemories: null, insideJokes: null },
    tone: { preferred: null, emotionalOpenness: null, thingsToAvoid: null, thingsToAlwaysInclude: null },
    cardHistory: { totalSent: 0, approvedCount: 0, rejectedCount: 0, editedCount: 0, eventTypes: [], mostRecentCard: null },
  });

  const s = buildContextSupplement(ctx);
  expect("supplement is null when no useful data at all", s, null);
}

// ─── Scenario 6: Things to avoid — hard system-level instructions ─────────────

section("Scenario 6 — thingsToAvoid extracted for system avoidList");
{
  const ctx = makeContext({
    tone: {
      preferred: "Romantic",
      emotionalOpenness: 8,
      thingsToAvoid: "Generic phrases, clichés, over-the-top sentiment",
      thingsToAlwaysInclude: null,
    },
  });

  const avoids = extractContextAvoids(ctx);
  expect("extractContextAvoids returns 3 items", avoids.length, 3);
  expect("first item trimmed", avoids[0], "Generic phrases");
  expect("second item trimmed", avoids[1], "clichés");
  expect("third item trimmed", avoids[2], "over-the-top sentiment");

  // The supplement itself must NOT include thingsToAvoid text
  const s = buildContextSupplement(ctx);
  expectNotContains("avoids NOT in supplement", s, "Generic phrases");
  expectNotContains("avoids NOT in supplement (2)", s, "clichés");
}

section("Scenario 6b — semicolon-separated avoids");
{
  const ctx = makeContext({
    tone: { preferred: null, emotionalOpenness: null, thingsToAvoid: "sappy; overly formal", thingsToAlwaysInclude: null },
  });
  const avoids = extractContextAvoids(ctx);
  expect("splits on semicolons", avoids.length, 2);
  expect("first item", avoids[0], "sappy");
  expect("second item", avoids[1], "overly formal");
}

section("Scenario 6c — empty thingsToAvoid");
{
  const ctx = makeContext({
    tone: { preferred: null, emotionalOpenness: null, thingsToAvoid: "", thingsToAlwaysInclude: null },
  });
  expect("empty string → []", JSON.stringify(extractContextAvoids(ctx)), JSON.stringify([]));
}

section("Scenario 6d — null thingsToAvoid");
{
  const ctx = makeContext({
    tone: { preferred: null, emotionalOpenness: null, thingsToAvoid: null, thingsToAlwaysInclude: null },
  });
  expect("null thingsToAvoid → []", JSON.stringify(extractContextAvoids(ctx)), JSON.stringify([]));
}

// ─── Edge cases ───────────────────────────────────────────────────────────────

section("Edge — archived recipient flagged in supplement");
{
  const ctx = makeContext({
    identity: {
      id: "r-1", firstName: "Sarah", lastName: null, nickname: null,
      fullName: "Sarah", active: false, archived: true,
    },
  });
  const s = buildContextSupplement(ctx);
  expectContains("archived note in supplement", s, "archived");
}

section("Edge — alwaysInclude in supplement");
{
  const ctx = makeContext({
    personality: { notes: null, traits: [] },
    interests: [],
    memories: { favoriteMemories: null, insideJokes: null },
    tone: { preferred: null, emotionalOpenness: null, thingsToAvoid: null, thingsToAlwaysInclude: "Reference the lake house" },
  });
  const s = buildContextSupplement(ctx);
  expectContains("always include in supplement", s, "Reference the lake house");
}

section("Edge — avoidList merging (context avoids appended to body avoids)");
{
  const bodyAvoids = ["no rhymes", "no clichés"];
  const ctx = makeContext({
    tone: { preferred: null, emotionalOpenness: null, thingsToAvoid: "Hallmark phrases, overly formal", thingsToAlwaysInclude: null },
  });
  const contextAvoids = extractContextAvoids(ctx);
  const merged = [...bodyAvoids, ...contextAvoids];
  expect("merged length = 4", merged.length, 4);
  expect("body avoids preserved", merged[0], "no rhymes");
  expect("context avoids appended", merged[2], "Hallmark phrases");
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log("\nFailed tests:");
  failures.forEach(f => console.log(`  ✗ ${f}`));
  process.exit(1);
} else {
  console.log("All tests passed.");
  process.exit(0);
}
