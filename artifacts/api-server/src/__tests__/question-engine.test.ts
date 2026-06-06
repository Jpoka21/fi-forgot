/**
 * Unit tests for the question engine.
 *
 * Tests getNextQuestion and getAllPendingQuestions against the full priority
 * matrix. All tests are pure — no database, no mocking, no framework.
 *
 * Run with:
 *   pnpm dlx tsx artifacts/api-server/src/__tests__/question-engine.test.ts
 */

import { getNextQuestion, getAllPendingQuestions } from "../services/question-engine.js";
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

function expectContains(label: string, haystack: string | null | undefined, needle: string): void {
  const ok = typeof haystack === "string" && haystack.includes(needle);
  if (ok) { passed++; console.log(`  ✓ ${label}`); }
  else {
    failed++; failures.push(label);
    console.log(`  ✗ ${label}`);
    console.log(`      expected to contain: ${JSON.stringify(needle)}`);
    console.log(`      received:             ${JSON.stringify(haystack)}`);
  }
}

function section(name: string) { console.log(`\n${name}`); }

// ─── Fixtures ────────────────────────────────────────────────────────────────

const now = new Date().toISOString();

function makeContext(missing: string[], firstName = "Sarah"): RecipientContext {
  // All 13 labels
  const allLabels = [
    "Birthday", "Anniversary", "Personality notes", "Personality traits",
    "Interests", "Favorite memories", "Inside jokes", "Preferred tone",
    "Emotional openness", "Things to avoid", "Things to always include",
    "Delivery preference", "Briefing answers",
  ];
  const filled = allLabels.filter(l => !missing.includes(l));
  const score = Math.round((filled.length / allLabels.length) * 100);

  return {
    contextVersion: 1,
    generatedAt: now,
    recipientId: "r-test",
    userId: "u-test",
    identity: firstName === "__null__"
      ? null
      : { id: "r-test", firstName, lastName: null, nickname: null, fullName: firstName, active: true, archived: false },
    relationship: null,
    personality: { notes: null, traits: [] },
    interests: [],
    memories: { favoriteMemories: null, insideJokes: null },
    tone: { preferred: null, emotionalOpenness: null, thingsToAvoid: null, thingsToAlwaysInclude: null },
    delivery: { preference: null, previewDays: null, senderNickname: null, signOff: null },
    cardHistory: { totalSent: 0, approvedCount: 0, rejectedCount: 0, editedCount: 0, eventTypes: [], mostRecentCard: null },
    briefingSummary: { totalAnswers: 0, byEvent: {}, allAnswers: [] },
    profileCompleteness: { score, filled, missing },
  };
}

// ─── Tests: getNextQuestion ───────────────────────────────────────────────────

section("getNextQuestion — nothing missing");
{
  const ctx = makeContext([]);
  expect("returns null when profile is complete", getNextQuestion(ctx), null);
}

section("getNextQuestion — only unknown labels missing");
{
  // Labels not in the question bank should be skipped gracefully
  const ctx = makeContext(["Some future field not in bank"]);
  expect("returns null when no bank match", getNextQuestion(ctx), null);
}

section("getNextQuestion — highest priority wins (things_to_avoid)");
{
  const ctx = makeContext([
    "Things to avoid",
    "Interests",
    "Favorite memories",
    "Inside jokes",
    "Personality traits",
  ]);
  const q = getNextQuestion(ctx);
  expect("priority is highest",   q?.priority,  "highest");
  expect("fieldKey correct",      q?.fieldKey,  "things_to_avoid");
  expect("fieldLabel correct",    q?.fieldLabel, "Things to avoid");
  expect("category is safety",    q?.category,  "safety");
  expect("question not null",     q !== null,   true);
  expectContains("question contains name", q?.question, "Sarah");
  expectContains("question is the avoid question", q?.question, "never mention");
}

section("getNextQuestion — high beats medium (interests > personality traits)");
{
  const ctx = makeContext(["Interests", "Personality traits", "Preferred tone"]);
  const q = getNextQuestion(ctx);
  expect("priority is high",    q?.priority, "high");
  expect("fieldKey is interests", q?.fieldKey, "interests");
}

section("getNextQuestion — high beats medium (favorite_memories > personality_notes)");
{
  const ctx = makeContext(["Favorite memories", "Personality notes"]);
  const q = getNextQuestion(ctx);
  expect("priority is high",           q?.priority,  "high");
  expect("fieldKey is favorite_memories", q?.fieldKey, "favorite_memories");
}

section("getNextQuestion — medium returned when only medium/low missing");
{
  const ctx = makeContext(["Personality traits", "Preferred tone", "Birthday"]);
  const q = getNextQuestion(ctx);
  expect("priority is medium", q?.priority, "medium");
  // personality_notes is before personality_traits in bank but not missing here
  // personality_traits comes before preferred_tone in bank at medium priority
  expect("fieldKey is personality_traits", q?.fieldKey, "personality_traits");
}

section("getNextQuestion — within same priority, bank order determines winner");
{
  // All three are high priority; interests appears before favorite_memories in bank
  const ctx = makeContext(["Favorite memories", "Inside jokes", "Interests"]);
  const q = getNextQuestion(ctx);
  expect("priority is high",     q?.priority,  "high");
  expect("interests wins (first in bank at high)", q?.fieldKey, "interests");
}

section("getNextQuestion — low priority returned when nothing higher is missing");
{
  const ctx = makeContext(["Birthday", "Anniversary"]);
  const q = getNextQuestion(ctx);
  expect("priority is low",  q?.priority,  "low");
  // birthday appears before anniversary in bank
  expect("birthday wins", q?.fieldKey, "birthday");
}

section("getNextQuestion — {name} substitution");
{
  // Use "Interests" — its question AND reason both contain {name}
  const ctx = makeContext(["Interests"], "Elena");
  const q = getNextQuestion(ctx);
  expectContains("first name substituted in question", q?.question, "Elena");
  expectContains("first name substituted in reason",   q?.reason,   "Elena");
  expect("literal {name} not in question", q?.question?.includes("{name}"), false);
  expect("literal {name} not in reason",   q?.reason?.includes("{name}"),   false);
}

section("getNextQuestion — identity null → falls back to 'them'");
{
  const ctx = makeContext(["Inside jokes"], "__null__");
  const q = getNextQuestion(ctx);
  expectContains("'them' used when identity null", q?.question, "them");
  expect("{name} not in question", q?.question?.includes("{name}"), false);
}

section("getNextQuestion — single missing field");
{
  const ctx = makeContext(["Inside jokes"]);
  const q = getNextQuestion(ctx);
  expect("priority is high",      q?.priority,  "high");
  expect("fieldKey inside_jokes", q?.fieldKey,  "inside_jokes");
  expect("category is memories",  q?.category,  "memories");
  expectContains("joke question text", q?.question, "inside joke");
}

section("getNextQuestion — all fields missing → things_to_avoid wins");
{
  const allMissing = [
    "Birthday", "Anniversary", "Personality notes", "Personality traits",
    "Interests", "Favorite memories", "Inside jokes", "Preferred tone",
    "Emotional openness", "Things to avoid", "Things to always include",
    "Delivery preference", "Briefing answers",
  ];
  const ctx = makeContext(allMissing);
  const q = getNextQuestion(ctx);
  expect("highest priority wins when everything missing", q?.priority,  "highest");
  expect("things_to_avoid returned", q?.fieldKey, "things_to_avoid");
}

// ─── Tests: getAllPendingQuestions ─────────────────────────────────────────────

section("getAllPendingQuestions — empty when nothing missing");
{
  const ctx = makeContext([]);
  expect("returns [] when complete", getAllPendingQuestions(ctx).length, 0);
}

section("getAllPendingQuestions — returns all matching entries sorted by priority");
{
  const ctx = makeContext(["Things to avoid", "Interests", "Personality traits"]);
  const qs = getAllPendingQuestions(ctx);
  expect("3 questions returned", qs.length, 3);
  expect("first is highest",  qs[0]?.priority, "highest");
  expect("second is high",    qs[1]?.priority, "high");
  expect("third is medium",   qs[2]?.priority, "medium");
  expect("order: avoid → interests → traits",
    qs.map(q => q.fieldKey).join(","),
    "things_to_avoid,interests,personality_traits",
  );
}

section("getAllPendingQuestions — unknown labels skipped, known ones returned");
{
  const ctx = makeContext(["Inside jokes", "Future field not in bank"]);
  const qs = getAllPendingQuestions(ctx);
  expect("only bank entries returned", qs.length, 1);
  expect("inside_jokes returned",      qs[0]?.fieldKey, "inside_jokes");
}

section("getAllPendingQuestions — all bank entries present when all missing");
{
  const allMissing = [
    "Birthday", "Anniversary", "Personality notes", "Personality traits",
    "Interests", "Favorite memories", "Inside jokes", "Preferred tone",
    "Emotional openness", "Things to avoid", "Things to always include",
    "Delivery preference", "Briefing answers",
  ];
  const ctx = makeContext(allMissing);
  const qs = getAllPendingQuestions(ctx);
  expect("all 13 bank entries returned", qs.length, 13);
  expect("first is things_to_avoid",  qs[0]?.fieldKey,  "things_to_avoid");
  expect("last is briefing_answers",  qs[12]?.fieldKey, "briefing_answers");
}

section("getAllPendingQuestions — SuggestedQuestion shape is complete");
{
  const ctx = makeContext(["Things to avoid"]);
  const qs = getAllPendingQuestions(ctx);
  const q = qs[0]!;
  expect("has fieldKey",   typeof q.fieldKey,   "string");
  expect("has fieldLabel", typeof q.fieldLabel,  "string");
  expect("has category",   typeof q.category,    "string");
  expect("has priority",   typeof q.priority,    "string");
  expect("has question",   typeof q.question,    "string");
  expect("has reason",     typeof q.reason,      "string");
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
