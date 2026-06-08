/**
 * Recipient Context Assembly Service
 *
 * Assembles a structured intelligence object for a given recipientId by joining:
 *   - recipients          (identity + relationship)
 *   - recipient_profile   (personality, tone, delivery)
 *   - question_answers    (briefing Q&A history)
 *   - personal_cards      (card history)
 *
 * This is the read layer for the normalized tables. It is currently consumed
 * only by the debug endpoint. Future AI card generation will call assembleRecipientContext()
 * instead of reading from the localStorage blob.
 *
 * contextVersion must be bumped whenever the shape of RecipientContext changes,
 * so callers can detect stale cached contexts.
 */

import {
  db,
  recipientsTable,
  recipientProfileTable,
  questionAnswersTable,
  personalCardsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import type { RecipientRow, RecipientProfileRow } from "@workspace/db";
import type { QuestionAnswer } from "@workspace/db";
import type { PersonalCard } from "@workspace/db";

export const CONTEXT_VERSION = 1 as const;

// ─── Output types ─────────────────────────────────────────────────────────────

export interface RecipientIdentity {
  id: string;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  fullName: string;
  active: boolean;
  archived: boolean;
}

export interface RecipientRelationship {
  type: string;
  label: string | null;
  birthday: string | null;
  anniversary: string | null;
}

export interface RecipientPersonality {
  notes: string | null;
  traits: string[];
}

export interface RecipientMemories {
  favoriteMemories: string | null;
  insideJokes: string | null;
}

export interface RecipientTone {
  preferred: string | null;
  emotionalOpenness: number | null;
  thingsToAvoid: string | null;
  thingsToAlwaysInclude: string | null;
}

export interface RecipientDelivery {
  preference: string | null;
  previewDays: number | null;
  senderNickname: string | null;
  signOff: string | null;
}

export interface CardHistorySummary {
  totalSent: number;
  approvedCount: number;
  rejectedCount: number;
  editedCount: number;
  eventTypes: string[];
  mostRecentCard: {
    eventType: string;
    eventDate: string | null;
    status: string;
  } | null;
}

export interface BriefingAnswer {
  questionKey: string;
  question: string;
  answer: string;
  eventType: string;
  eventYear: number;
}

export interface BriefingSummary {
  totalAnswers: number;
  byEvent: Record<string, BriefingAnswer[]>;
  allAnswers: BriefingAnswer[];
}

export interface ProfileCompleteness {
  score: number;
  filled: string[];
  missing: string[];
}

export interface RecipientContext {
  contextVersion: typeof CONTEXT_VERSION;
  generatedAt: string;
  recipientId: string;
  userId: string;
  identity: RecipientIdentity | null;
  relationship: RecipientRelationship | null;
  personality: RecipientPersonality;
  interests: string[];
  memories: RecipientMemories;
  tone: RecipientTone;
  delivery: RecipientDelivery;
  cardHistory: CardHistorySummary;
  briefingSummary: BriefingSummary;
  profileCompleteness: ProfileCompleteness;
}

// ─── Pure assembly functions (exported for testing) ───────────────────────────

export function buildIdentity(row: RecipientRow): RecipientIdentity {
  const parts = [row.firstName, row.lastName].filter(Boolean);
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName ?? null,
    nickname: row.nickname ?? null,
    fullName: parts.join(" "),
    active: row.active,
    archived: row.archivedAt !== null,
  };
}

export function buildRelationship(row: RecipientRow): RecipientRelationship {
  return {
    type: row.relationshipType,
    label: row.relationshipLabel ?? null,
    birthday: row.birthday ?? null,
    anniversary: row.anniversary ?? null,
  };
}

export function buildPersonality(profile: RecipientProfileRow | null): RecipientPersonality {
  return {
    notes: profile?.personalityNotes ?? null,
    traits: profile?.personalityTraits ?? [],
  };
}

export function buildMemories(profile: RecipientProfileRow | null): RecipientMemories {
  return {
    favoriteMemories: profile?.favoriteMemories ?? null,
    insideJokes: profile?.insideJokes ?? null,
  };
}

export function buildTone(profile: RecipientProfileRow | null): RecipientTone {
  return {
    preferred: profile?.preferredTone ?? null,
    emotionalOpenness: profile?.emotionalOpenness ?? null,
    thingsToAvoid: profile?.thingsToAvoid ?? null,
    thingsToAlwaysInclude: profile?.thingsToAlwaysInclude ?? null,
  };
}

export function buildDelivery(profile: RecipientProfileRow | null): RecipientDelivery {
  return {
    preference: profile?.deliveryPreference ?? null,
    previewDays: profile?.previewDays ?? null,
    senderNickname: profile?.senderNickname ?? null,
    signOff: profile?.signOff ?? null,
  };
}

export function buildCardHistorySummary(cards: PersonalCard[]): CardHistorySummary {
  if (cards.length === 0) {
    return {
      totalSent: 0,
      approvedCount: 0,
      rejectedCount: 0,
      editedCount: 0,
      eventTypes: [],
      mostRecentCard: null,
    };
  }

  // Use status as the single source of truth. Combining status with timestamps
  // via OR would double-count cards if both fields were ever set inconsistently.
  const approved = cards.filter(c => c.status === "Approved");
  const rejected = cards.filter(c => c.status === "Rejected");
  const edited = cards.filter(c => c.wasEdited);
  const eventTypes = [...new Set(cards.map(c => c.eventType).filter(Boolean))];

  const sorted = [...cards].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const latest = sorted[0];

  return {
    totalSent: cards.length,
    approvedCount: approved.length,
    rejectedCount: rejected.length,
    editedCount: edited.length,
    eventTypes,
    mostRecentCard: {
      eventType: latest.eventType,
      eventDate: latest.eventDate ?? null,
      status: latest.status,
    },
  };
}

export function buildBriefingSummary(answers: QuestionAnswer[]): BriefingSummary {
  const allAnswers: BriefingAnswer[] = answers.map(a => ({
    questionKey: a.questionKey,
    question: a.questionText,
    answer: a.answerText,
    eventType: a.eventType,
    eventYear: a.eventYear,
  }));

  const byEvent: Record<string, BriefingAnswer[]> = {};
  for (const a of allAnswers) {
    const key = `${a.eventType}_${a.eventYear}`;
    if (!byEvent[key]) byEvent[key] = [];
    byEvent[key].push(a);
  }

  return {
    totalAnswers: allAnswers.length,
    byEvent,
    allAnswers,
  };
}

// ─── Completeness scoring ──────────────────────────────────────────────────────

interface CompletenessInput {
  relationship: RecipientRelationship | null;
  personality: RecipientPersonality;
  interests: string[];
  memories: RecipientMemories;
  tone: RecipientTone;
  delivery: RecipientDelivery;
  briefing: BriefingSummary;
}

const COMPLETENESS_FIELDS: {
  key: string;
  label: string;
  check: (c: CompletenessInput) => boolean;
}[] = [
  { key: "birthday",              label: "Birthday",               check: c => !!c.relationship?.birthday },
  { key: "anniversary",           label: "Anniversary",            check: c => !!c.relationship?.anniversary },
  { key: "personality_notes",     label: "Personality notes",      check: c => !!c.personality.notes },
  { key: "personality_traits",    label: "Personality traits",     check: c => c.personality.traits.length > 0 },
  { key: "interests",             label: "Interests",              check: c => c.interests.length > 0 },
  { key: "favorite_memories",     label: "Favorite memories",      check: c => !!c.memories.favoriteMemories },
  { key: "inside_jokes",          label: "Inside jokes",           check: c => !!c.memories.insideJokes },
  { key: "preferred_tone",        label: "Preferred tone",         check: c => !!c.tone.preferred },
  { key: "emotional_openness",    label: "Emotional openness",     check: c => c.tone.emotionalOpenness !== null },
  { key: "things_to_avoid",       label: "Things to avoid",        check: c => !!c.tone.thingsToAvoid },
  { key: "always_include",        label: "Things to always include", check: c => !!c.tone.thingsToAlwaysInclude },
  { key: "delivery_preference",   label: "Delivery preference",    check: c => !!c.delivery.preference },
  { key: "briefing_answers",      label: "Briefing answers",       check: c => c.briefing.totalAnswers > 0 },
];

export function buildProfileCompleteness(input: CompletenessInput): ProfileCompleteness {
  // Profile-gap answers (saved by the question engine with eventType === "Profile")
  // satisfy a field's completeness check even when the corresponding recipient_profile
  // column has not been written yet. This prevents the same question from reappearing
  // immediately after a user answers it.
  const profileGapAnswered = new Set(
    input.briefing.allAnswers
      .filter(a => a.eventType === "Profile")
      .map(a => a.questionKey),
  );

  const filled: string[] = [];
  const missing: string[] = [];

  for (const field of COMPLETENESS_FIELDS) {
    if (field.check(input) || profileGapAnswered.has(field.key)) {
      filled.push(field.label);
    } else {
      missing.push(field.label);
    }
  }

  const score = Math.round((filled.length / COMPLETENESS_FIELDS.length) * 100);
  return { score, filled, missing };
}

// ─── Main assembly function ────────────────────────────────────────────────────

export async function assembleRecipientContext(
  recipientId: string,
  userId: string,
): Promise<RecipientContext> {
  const [recipientRows, profileRows, answerRows, cardRows] = await Promise.all([
    db
      .select()
      .from(recipientsTable)
      .where(and(eq(recipientsTable.id, recipientId), eq(recipientsTable.userId, userId)))
      .limit(1),
    db
      .select()
      .from(recipientProfileTable)
      .where(eq(recipientProfileTable.id, recipientId))
      .limit(1),
    db
      .select()
      .from(questionAnswersTable)
      .where(
        and(
          eq(questionAnswersTable.userId, userId),
          eq(questionAnswersTable.recipientId, recipientId),
          eq(questionAnswersTable.wasSkipped, false),
        ),
      )
      .orderBy(questionAnswersTable.createdAt),
    db
      .select()
      .from(personalCardsTable)
      .where(
        and(
          eq(personalCardsTable.userId, userId),
          eq(personalCardsTable.recipientId, recipientId),
        ),
      )
      .orderBy(personalCardsTable.createdAt),
  ]);

  const recipient = recipientRows[0] ?? null;
  // Gate profile on userId ownership. recipient_profile has no userId column,
  // so ownership is enforced through the parent recipients row. If the recipient
  // query returned nothing (wrong user or unknown id), treat profile as absent.
  const profile = recipient ? (profileRows[0] ?? null) : null;

  const identity = recipient ? buildIdentity(recipient) : null;
  const relationship = recipient ? buildRelationship(recipient) : null;
  const personality = buildPersonality(profile);
  const interests = profile?.interests ?? [];
  const memories = buildMemories(profile);
  const tone = buildTone(profile);
  const delivery = buildDelivery(profile);
  const cardHistory = buildCardHistorySummary(cardRows);
  const briefingSummary = buildBriefingSummary(answerRows);
  const profileCompleteness = buildProfileCompleteness({
    relationship,
    personality,
    interests,
    memories,
    tone,
    delivery,
    briefing: briefingSummary,
  });

  return {
    contextVersion: CONTEXT_VERSION,
    generatedAt: new Date().toISOString(),
    recipientId,
    userId,
    identity,
    relationship,
    personality,
    interests,
    memories,
    tone,
    delivery,
    cardHistory,
    briefingSummary,
    profileCompleteness,
  };
}
