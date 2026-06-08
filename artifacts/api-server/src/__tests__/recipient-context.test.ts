/**
 * Unit-style validation tests for recipient-context pure functions.
 *
 * These tests exercise only the pure assembly functions — no database, no
 * network. Run with:
 *
 *   npx tsx artifacts/api-server/src/__tests__/recipient-context.test.ts
 *
 * Exit 0 = all passed. Exit 1 = failures (printed to stdout).
 */

import {
  buildIdentity,
  buildRelationship,
  buildPersonality,
  buildMemories,
  buildTone,
  buildDelivery,
  buildCardHistorySummary,
  buildBriefingSummary,
  buildProfileCompleteness,
  CONTEXT_VERSION,
} from "../services/recipient-context.js";
import type { RecipientRow, RecipientProfileRow } from "@workspace/db";
import type { QuestionAnswer } from "@workspace/db";
import type { PersonalCard } from "@workspace/db";

// ─── Minimal test harness ────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function expect(label: string, actual: unknown, expected: unknown): void {
  const ok =
    typeof expected === "object"
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

function section(name: string) {
  console.log(`\n${name}`);
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const now = new Date();

const baseRecipient: RecipientRow = {
  id: "r-1",
  userId: "u-1",
  firstName: "Sarah",
  lastName: "Mitchell",
  nickname: "Sare",
  relationshipType: "Wife",
  relationshipLabel: "Wife",
  birthday: "1988-04-12",
  anniversary: "2015-06-20",
  email: null,
  phone: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  state: null,
  postalCode: null,
  country: "US",
  active: true,
  archivedAt: null,
  createdAt: now,
  updatedAt: now,
};

const baseProfile: RecipientProfileRow = {
  id: "r-1",
  recipientId: "r-1",
  personalityNotes: "Very thoughtful and sentimental",
  personalityTraits: ["sweet", "calm"],
  interests: ["reading", "travel"],
  hobbies: null,
  dislikes: null,
  favoriteMemories: "Our trip to Italy in 2019",
  insideJokes: "The pasta incident",
  preferredTone: "Romantic",
  emotionalOpenness: 8,
  thingsToAvoid: "Anything too cheesy",
  thingsToAlwaysInclude: "A specific memory",
  senderNickname: null,
  signOff: "Love always",
  deliveryPreference: "Mail it to me",
  previewDays: 14,
  createdAt: now,
  updatedAt: now,
};

const baseCard: PersonalCard = {
  id: "card-1",
  userId: "u-1",
  recipientId: "r-1",
  recipientName: "Sarah",
  eventType: "Birthday",
  eventDate: "2024-04-12",
  status: "Approved",
  messageOriginal: "Happy birthday!",
  messageFinal: "Happy birthday, my love!",
  wasEdited: true,
  generationVersion: "v1",
  archetype: null,
  handwryttenCardId: null,
  approvedAt: now,
  rejectedAt: null,
  mailedAt: null,
  data: {},
  createdAt: now,
  updatedAt: now,
};

const baseAnswer: QuestionAnswer = {
  id: "qa-1",
  userId: "u-1",
  recipientId: "r-1",
  eventType: "Birthday",
  eventYear: 2024,
  questionKey: "favorite_gift",
  questionText: "What was a gift she loved?",
  answerText: "The handmade photo album",
  wasSkipped: false,
  triggerType: "event_briefing",
  importanceScore: null,
  archivedAt: null,
  createdAt: now,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

section("CONTEXT_VERSION");
expect("is 1", CONTEXT_VERSION, 1);

section("buildIdentity — full name");
{
  const id = buildIdentity(baseRecipient);
  expect("fullName joins first + last", id.fullName, "Sarah Mitchell");
  expect("firstName", id.firstName, "Sarah");
  expect("lastName", id.lastName, "Mitchell");
  expect("nickname", id.nickname, "Sare");
  expect("active=true when not archived", id.active, true);
  expect("archived=false when archivedAt is null", id.archived, false);
}

section("buildIdentity — archived recipient");
{
  const archived = buildIdentity({ ...baseRecipient, active: false, archivedAt: now });
  expect("active=false", archived.active, false);
  expect("archived=true when archivedAt is set", archived.archived, true);
}

section("buildIdentity — no last name");
{
  const noLast = buildIdentity({ ...baseRecipient, lastName: null });
  expect("fullName is just firstName when no lastName", noLast.fullName, "Sarah");
  expect("lastName is null", noLast.lastName, null);
}

section("buildRelationship");
{
  const rel = buildRelationship(baseRecipient);
  expect("type", rel.type, "Wife");
  expect("label", rel.label, "Wife");
  expect("birthday", rel.birthday, "1988-04-12");
  expect("anniversary", rel.anniversary, "2015-06-20");
}

section("buildRelationship — no dates");
{
  const rel = buildRelationship({ ...baseRecipient, birthday: null, anniversary: null });
  expect("birthday null when absent", rel.birthday, null);
  expect("anniversary null when absent", rel.anniversary, null);
}

section("buildPersonality — with profile");
{
  const p = buildPersonality(baseProfile);
  expect("notes", p.notes, "Very thoughtful and sentimental");
  expect("traits", JSON.stringify(p.traits), JSON.stringify(["sweet", "calm"]));
}

section("buildPersonality — null profile");
{
  const p = buildPersonality(null);
  expect("notes is null", p.notes, null);
  expect("traits is empty array", JSON.stringify(p.traits), JSON.stringify([]));
}

section("buildMemories");
{
  const m = buildMemories(baseProfile);
  expect("favoriteMemories", m.favoriteMemories, "Our trip to Italy in 2019");
  expect("insideJokes", m.insideJokes, "The pasta incident");
}

section("buildMemories — null profile");
{
  const m = buildMemories(null);
  expect("favoriteMemories null", m.favoriteMemories, null);
  expect("insideJokes null", m.insideJokes, null);
}

section("buildTone");
{
  const t = buildTone(baseProfile);
  expect("preferred", t.preferred, "Romantic");
  expect("emotionalOpenness", t.emotionalOpenness, 8);
  expect("thingsToAvoid", t.thingsToAvoid, "Anything too cheesy");
  expect("thingsToAlwaysInclude", t.thingsToAlwaysInclude, "A specific memory");
}

section("buildDelivery");
{
  const d = buildDelivery(baseProfile);
  expect("preference", d.preference, "Mail it to me");
  expect("previewDays", d.previewDays, 14);
  expect("signOff", d.signOff, "Love always");
  expect("senderNickname null", d.senderNickname, null);
}

section("buildCardHistorySummary — empty");
{
  const h = buildCardHistorySummary([]);
  expect("totalSent=0", h.totalSent, 0);
  expect("mostRecentCard=null", h.mostRecentCard, null);
  expect("eventTypes=[]", JSON.stringify(h.eventTypes), JSON.stringify([]));
}

section("buildCardHistorySummary — one approved+edited card");
{
  const h = buildCardHistorySummary([baseCard]);
  expect("totalSent=1", h.totalSent, 1);
  expect("approvedCount=1", h.approvedCount, 1);
  expect("rejectedCount=0", h.rejectedCount, 0);
  expect("editedCount=1", h.editedCount, 1);
  expect("eventTypes includes Birthday", h.eventTypes.includes("Birthday"), true);
  expect("mostRecentCard not null", h.mostRecentCard !== null, true);
  expect("mostRecentCard eventType", h.mostRecentCard?.eventType, "Birthday");
  expect("mostRecentCard status", h.mostRecentCard?.status, "Approved");
}

section("buildCardHistorySummary — multiple cards, deduplicates eventTypes");
{
  const card2: PersonalCard = {
    ...baseCard,
    id: "card-2",
    eventType: "Anniversary",
    status: "Rejected",
    approvedAt: null,
    rejectedAt: now,
    wasEdited: false,
    createdAt: new Date(now.getTime() - 1000),
  };
  const h = buildCardHistorySummary([baseCard, card2]);
  expect("totalSent=2", h.totalSent, 2);
  expect("rejectedCount=1", h.rejectedCount, 1);
  expect("two distinct eventTypes", h.eventTypes.length, 2);
  expect("mostRecentCard is the newer one (Birthday)", h.mostRecentCard?.eventType, "Birthday");
}

section("buildBriefingSummary — empty");
{
  const b = buildBriefingSummary([]);
  expect("totalAnswers=0", b.totalAnswers, 0);
  expect("allAnswers=[]", JSON.stringify(b.allAnswers), JSON.stringify([]));
  expect("byEvent={}", JSON.stringify(b.byEvent), JSON.stringify({}));
}

section("buildBriefingSummary — one answer");
{
  const b = buildBriefingSummary([baseAnswer]);
  expect("totalAnswers=1", b.totalAnswers, 1);
  expect("answer key present", b.allAnswers[0].questionKey, "favorite_gift");
  expect("answer text present", b.allAnswers[0].answer, "The handmade photo album");
  expect("grouped by event_year", Object.keys(b.byEvent).length, 1);
  expect("event key is eventType_eventYear", !!b.byEvent["Birthday_2024"], true);
}

section("buildProfileCompleteness — fully filled");
{
  const c = buildProfileCompleteness({
    relationship: buildRelationship(baseRecipient),
    personality: buildPersonality(baseProfile),
    interests: baseProfile.interests ?? [],
    memories: buildMemories(baseProfile),
    tone: buildTone(baseProfile),
    delivery: buildDelivery(baseProfile),
    briefing: buildBriefingSummary([baseAnswer]),
  });
  expect("score=100", c.score, 100);
  expect("nothing missing", c.missing.length, 0);
  expect("13 fields filled", c.filled.length, 13);
}

section("buildProfileCompleteness — nothing filled");
{
  const c = buildProfileCompleteness({
    relationship: null,
    personality: buildPersonality(null),
    interests: [],
    memories: buildMemories(null),
    tone: buildTone(null),
    delivery: buildDelivery(null),
    briefing: buildBriefingSummary([]),
  });
  expect("score=0", c.score, 0);
  expect("13 missing fields", c.missing.length, 13);
  expect("nothing filled", c.filled.length, 0);
}

section("buildProfileCompleteness — partial (birthday + tone only)");
{
  const c = buildProfileCompleteness({
    relationship: { type: "Wife", label: null, birthday: "1988-04-12", anniversary: null },
    personality: buildPersonality(null),
    interests: [],
    memories: buildMemories(null),
    tone: { preferred: "Romantic", emotionalOpenness: null, thingsToAvoid: null, thingsToAlwaysInclude: null },
    delivery: buildDelivery(null),
    briefing: buildBriefingSummary([]),
  });
  expect("2 of 13 filled → score ~15", c.score, 15);
  expect("Birthday in filled", c.filled.includes("Birthday"), true);
  expect("Preferred tone in filled", c.filled.includes("Preferred tone"), true);
  expect("Inside jokes in missing", c.missing.includes("Inside jokes"), true);
}

section("buildProfileCompleteness — profile_gap answer satisfies completeness (bug regression)");
{
  // Simulates the state immediately after the user answers a profile-gap question:
  // recipient_profile column is still null, but question_answers has a row with
  // eventType === "Profile" and questionKey === "things_to_avoid".
  // The field must NOT appear in missing — this was the root cause of the loop bug.
  const profileGapAnswer: Parameters<typeof buildBriefingSummary>[0][0] = {
    id: "profile_gap_r-test_things_to_avoid",
    userId: "u-test",
    recipientId: "r-test",
    eventType: "Profile",
    eventYear: 2026,
    questionKey: "things_to_avoid",
    questionText: "Is there anything we should never mention in a card to Test?",
    answerText: "Don't mention her weight.",
    wasSkipped: false,
    triggerType: "profile_gap",
    importanceScore: null,
    archivedAt: null,
    createdAt: new Date(),
  };

  const c = buildProfileCompleteness({
    relationship: null,
    personality: buildPersonality(null),
    interests: [],
    memories: buildMemories(null),
    tone: buildTone(null),        // thingsToAvoid is null in recipient_profile
    delivery: buildDelivery(null),
    briefing: buildBriefingSummary([profileGapAnswer]),
  });

  expect("Things to avoid NOT in missing after profile_gap answer", c.missing.includes("Things to avoid"), false);
  expect("Things to avoid in filled after profile_gap answer",      c.filled.includes("Things to avoid"),  true);
  // The gap answer also satisfies "Briefing answers" (totalAnswers > 0), so 2 fields are filled.
  expect("Briefing answers filled (totalAnswers>0 from gap answer)", c.filled.includes("Briefing answers"), true);
  expect("11 fields still missing (things_to_avoid + briefing_answers both filled)", c.missing.length, 11);
}

section("buildProfileCompleteness — multiple profile_gap answers each fill their field");
{
  const now = new Date();
  const makeGapAnswer = (questionKey: string): Parameters<typeof buildBriefingSummary>[0][0] => ({
    id: `profile_gap_r-test_${questionKey}`,
    userId: "u-test",
    recipientId: "r-test",
    eventType: "Profile",
    eventYear: 2026,
    questionKey,
    questionText: "Q?",
    answerText: "A.",
    wasSkipped: false,
    triggerType: "profile_gap",
    importanceScore: null,
    archivedAt: null,
    createdAt: now,
  });

  const c = buildProfileCompleteness({
    relationship: null,
    personality: buildPersonality(null),
    interests: [],
    memories: buildMemories(null),
    tone: buildTone(null),
    delivery: buildDelivery(null),
    briefing: buildBriefingSummary([
      makeGapAnswer("things_to_avoid"),
      makeGapAnswer("inside_jokes"),
      makeGapAnswer("favorite_memories"),
    ]),
  });

  expect("things_to_avoid filled via gap answer",  c.filled.includes("Things to avoid"),  true);
  expect("inside_jokes filled via gap answer",     c.filled.includes("Inside jokes"),     true);
  expect("favorite_memories filled via gap answer",c.filled.includes("Favorite memories"),true);
  // 3 gap fields + "Briefing answers" (totalAnswers>0) = 4 filled, 9 missing
  expect("Briefing answers also filled (totalAnswers>0)", c.filled.includes("Briefing answers"), true);
  expect("4 fields filled, 9 still missing", c.missing.length, 9);
}

section("buildProfileCompleteness — non-Profile eventType does NOT satisfy completeness");
{
  // Briefing answers from normal event briefings (eventType === "Birthday") must NOT
  // count as satisfying profile completeness for unrelated fields.
  const briefingAnswer: Parameters<typeof buildBriefingSummary>[0][0] = {
    id: "briefing_r-test_Birthday_2026_things_to_avoid",
    userId: "u-test",
    recipientId: "r-test",
    eventType: "Birthday",           // ← NOT "Profile"
    eventYear: 2026,
    questionKey: "things_to_avoid",
    questionText: "Anything to avoid?",
    answerText: "Nothing.",
    wasSkipped: false,
    triggerType: "event_briefing",
    importanceScore: null,
    archivedAt: null,
    createdAt: new Date(),
  };

  const c = buildProfileCompleteness({
    relationship: null,
    personality: buildPersonality(null),
    interests: [],
    memories: buildMemories(null),
    tone: buildTone(null),
    delivery: buildDelivery(null),
    briefing: buildBriefingSummary([briefingAnswer]),
  });

  // "Briefing answers" field IS filled (totalAnswers > 0), but "Things to avoid" must NOT be
  expect("Things to avoid still missing (non-Profile event)", c.missing.includes("Things to avoid"), true);
  expect("Briefing answers filled (totalAnswers > 0)", c.filled.includes("Briefing answers"), true);
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failures.length > 0) {
  console.log(`\nFailed tests:`);
  failures.forEach(f => console.log(`  ✗ ${f}`));
  process.exit(1);
} else {
  console.log("All tests passed.");
  process.exit(0);
}
