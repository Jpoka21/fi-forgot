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
import { eq, and, isNull } from "drizzle-orm";
import type { RecipientRow, RecipientProfileRow } from "@workspace/db";
import type { QuestionAnswer } from "@workspace/db";
import type { PersonalCard } from "@workspace/db";

export const CONTEXT_VERSION = 3 as const;

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

/**
 * Metadata-only inventory of personal card writing history.
 * No message body text — counts and flags only.
 */
export interface WritingHistoryCard {
  id: string;
  eventType: string;
  eventDate: string | null;
  status: string;
  wasEdited: boolean;
  createdAt: string;
  daysAgo: number;
  hasMessageFinal: boolean;
  hasMessageOriginal: boolean;
  messageWordCount: number | null;
  archetype: string | null;
  generationVersion: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  mailedAt: string | null;
}

export interface WritingHistoryInventory {
  /** All cards for this recipient, newest first. */
  cards: WritingHistoryCard[];
}

/**
 * Metadata-only relationship activity timeline.
 * No answer text, no card message bodies — labels and timestamps only.
 */
export type RelationshipTimelineEventType =
  | "fresh_update"
  | "follow_up_answer"
  | "profile_gap"
  | "event_briefing"
  | "card";

export interface RelationshipTimelineEvent {
  id: string;
  type: RelationshipTimelineEventType;
  occurredAt: string; // ISO 8601
  daysAgo: number;
  label: string;
}

export interface RelationshipTimelineInventory {
  /** Historical relationship activity, newest first. */
  events: RelationshipTimelineEvent[];
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

/**
 * A single saved fresh-update answer with recency metadata.
 * Stored in question_answers with triggerType === "fresh_update".
 */
export interface FreshUpdate {
  id: string;
  questionKey: string;
  question: string;
  answer: string;
  createdAt: string;                          // ISO string
  daysAgo: number;
  ageCategory: "recent" | "mid" | "older";   // <90d | <180d | ≥180d
}

/**
 * A follow-up conversation answer — something the user circled back on.
 * Stored in question_answers with triggerType === "follow_up".
 * Treated as high-priority recent memory for card generation.
 */
export interface FollowUpAnswer {
  id: string;
  originalTopic: string;   // the follow-up question (what was being revisited)
  answer: string;
  createdAt: string;       // ISO string
  daysAgo: number;
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
  writingHistory: WritingHistoryInventory;
  relationshipTimeline: RelationshipTimelineInventory;
  briefingSummary: BriefingSummary;
  profileCompleteness: ProfileCompleteness;
  freshUpdates: FreshUpdate[];
  followUpAnswers: FollowUpAnswer[];
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

const MS_PER_DAY = 86_400_000;

function toIsoTimestamp(value: Date | null | undefined): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

function countMessageWords(text: string | null | undefined): number | null {
  if (!text?.trim()) return null;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function buildWritingHistoryInventory(
  cards: PersonalCard[],
  referenceTime: Date = new Date(),
): WritingHistoryInventory {
  const referenceMs = referenceTime.getTime();
  const sorted = [...cards].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    cards: sorted.map((card) => ({
      id: card.id,
      eventType: card.eventType,
      eventDate: card.eventDate ?? null,
      status: card.status,
      wasEdited: card.wasEdited,
      createdAt: new Date(card.createdAt).toISOString(),
      daysAgo: Math.floor(
        (referenceMs - new Date(card.createdAt).getTime()) / MS_PER_DAY,
      ),
      hasMessageFinal: !!card.messageFinal?.trim(),
      hasMessageOriginal: !!card.messageOriginal?.trim(),
      messageWordCount: countMessageWords(card.messageFinal ?? card.messageOriginal),
      archetype: card.archetype ?? null,
      generationVersion: card.generationVersion,
      approvedAt: toIsoTimestamp(card.approvedAt),
      rejectedAt: toIsoTimestamp(card.rejectedAt),
      mailedAt: toIsoTimestamp(card.mailedAt),
    })),
  };
}

const TIMELINE_QUESTION_KEY_LABELS: Record<string, string> = {
  things_to_avoid: "Things to avoid",
  interests: "Interests",
  favorite_memories: "Favorite memories",
  inside_jokes: "Inside jokes",
  personality_notes: "Personality notes",
  personality_traits: "Personality traits",
  preferred_tone: "Preferred tone",
  emotional_openness: "Emotional openness",
  always_include: "Always include",
  birthday: "Birthday",
  anniversary: "Anniversary",
  delivery_preference: "Delivery preference",
  briefing_answers: "General notes",
  recent_memory: "Recent memory",
  current_excitement: "Current excitement",
  current_challenge: "Current challenge",
  recent_accomplishment: "Recent accomplishment",
  family_news: "Family & home life",
  new_hobby: "New hobby or interest",
  anything_to_remember: "Anything to remember",
};

function cardOccurredAt(card: PersonalCard): Date {
  return new Date(card.mailedAt ?? card.approvedAt ?? card.createdAt);
}

/**
 * Builds a metadata-only activity timeline from already-loaded answer and card rows.
 * No answer text, no message bodies, no important_date profile placeholders.
 */
export function buildRelationshipTimelineInventory(
  answers: QuestionAnswer[],
  cards: PersonalCard[],
  referenceTime: Date = new Date(),
): RelationshipTimelineInventory {
  const referenceMs = referenceTime.getTime();
  const events: RelationshipTimelineEvent[] = [];

  const briefingGroups = new Map<string, QuestionAnswer[]>();

  for (const answer of answers) {
    if (answer.triggerType === "event_briefing") {
      const key = `${answer.eventType}_${answer.eventYear}`;
      if (!briefingGroups.has(key)) briefingGroups.set(key, []);
      briefingGroups.get(key)!.push(answer);
      continue;
    }

    const type: RelationshipTimelineEventType =
      answer.triggerType === "fresh_update"
        ? "fresh_update"
        : answer.triggerType === "follow_up"
          ? "follow_up_answer"
          : "profile_gap";

    const occurredAt = new Date(answer.createdAt);
    events.push({
      id: answer.id,
      type,
      occurredAt: occurredAt.toISOString(),
      daysAgo: Math.floor((referenceMs - occurredAt.getTime()) / MS_PER_DAY),
      label:
        type === "follow_up_answer"
          ? "Follow Up"
          : (TIMELINE_QUESTION_KEY_LABELS[answer.questionKey] ?? answer.questionKey),
    });
  }

  for (const [groupKey, group] of briefingGroups) {
    const first = group[0]!;
    const latestDate = group.reduce(
      (max, row) => (row.createdAt > max ? row.createdAt : max),
      group[0]!.createdAt,
    );
    const occurredAt = new Date(latestDate);
    events.push({
      id: `briefing_${groupKey}`,
      type: "event_briefing",
      occurredAt: occurredAt.toISOString(),
      daysAgo: Math.floor((referenceMs - occurredAt.getTime()) / MS_PER_DAY),
      label: `${first.eventType} ${first.eventYear}`,
    });
  }

  for (const card of cards) {
    if (card.status === "draft") continue;
    const occurredAt = cardOccurredAt(card);
    events.push({
      id: `card_${card.id}`,
      type: "card",
      occurredAt: occurredAt.toISOString(),
      daysAgo: Math.floor((referenceMs - occurredAt.getTime()) / MS_PER_DAY),
      label: `${card.eventType} card`,
    });
  }

  events.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  return { events };
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

// ─── Fresh updates ────────────────────────────────────────────────────────────

/**
 * Converts raw question_answers rows (triggerType === "fresh_update") into
 * FreshUpdate objects sorted newest-first, with recency age categories:
 *   recent  = last 90 days
 *   mid     = 90–180 days
 *   older   = 180+ days
 */
export function buildFreshUpdates(rows: QuestionAnswer[]): FreshUpdate[] {
  const now = Date.now();
  return rows
    .filter(r => !r.wasSkipped && r.archivedAt === null)
    .map(r => {
      const daysAgo = Math.floor(
        (now - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      const ageCategory: FreshUpdate["ageCategory"] =
        daysAgo < 90  ? "recent" :
        daysAgo < 180 ? "mid"    : "older";
      return {
        id:          r.id,
        questionKey: r.questionKey,
        question:    r.questionText,
        answer:      r.answerText,
        createdAt:   new Date(r.createdAt).toISOString(),
        daysAgo,
        ageCategory,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ─── Follow-up answers ────────────────────────────────────────────────────────

/**
 * Converts raw question_answers rows (triggerType === "follow_up") into
 * FollowUpAnswer objects sorted newest-first.
 * These are treated as high-priority recent memory by the card generation prompt.
 */
export function buildFollowUpAnswers(rows: QuestionAnswer[]): FollowUpAnswer[] {
  const now = Date.now();
  return rows
    .filter(r => !r.wasSkipped && r.archivedAt === null)
    .map(r => {
      const daysAgo = Math.floor(
        (now - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        id:            r.id,
        originalTopic: r.questionText,
        answer:        r.answerText,
        createdAt:     new Date(r.createdAt).toISOString(),
        daysAgo,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
          isNull(questionAnswersTable.archivedAt),
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

  // Split answers by trigger type:
  //   fresh_update → freshUpdates (time-sensitive life moments, recency-bucketed)
  //   follow_up    → followUpAnswers (recent conversations, high-priority memory)
  //   everything else → briefingSummary (profile gap + briefing Q&A)
  const freshAnswerRows   = answerRows.filter(r => r.triggerType === "fresh_update");
  const followUpAnswerRows = answerRows.filter(r => r.triggerType === "follow_up");
  const regularAnswerRows = answerRows.filter(
    r => r.triggerType !== "fresh_update" && r.triggerType !== "follow_up",
  );

  const identity = recipient ? buildIdentity(recipient) : null;
  const relationship = recipient ? buildRelationship(recipient) : null;
  const personality = buildPersonality(profile);
  const interests = profile?.interests ?? [];
  const memories = buildMemories(profile);
  const tone = buildTone(profile);
  const delivery = buildDelivery(profile);
  const cardHistory = buildCardHistorySummary(cardRows);
  const writingHistory = buildWritingHistoryInventory(cardRows);
  const relationshipTimeline = buildRelationshipTimelineInventory(answerRows, cardRows);
  const briefingSummary = buildBriefingSummary(regularAnswerRows);
  const freshUpdates = buildFreshUpdates(freshAnswerRows);
  const followUpAnswers = buildFollowUpAnswers(followUpAnswerRows);
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
    writingHistory,
    relationshipTimeline,
    briefingSummary,
    freshUpdates,
    followUpAnswers,
    profileCompleteness,
  };
}
