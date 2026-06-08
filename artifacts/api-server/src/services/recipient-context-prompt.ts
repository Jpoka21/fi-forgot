/**
 * Recipient Context → Prompt Supplement
 *
 * Pure functions that convert an assembled RecipientContext into structured
 * text blocks for injection into the card generation prompt.
 *
 * Rules:
 * - These functions are pure: no DB, no side-effects, easy to unit-test.
 * - The supplement is ADDITIVE — it appends to the existing relAnswers/details
 *   block. It never replaces body-provided fields.
 * - thingsToAvoid is extracted separately and merged into the system-level
 *   avoidList, making it a hard instruction rather than advisory text.
 * - Archived recipients are flagged in the supplement but not blocked.
 * - wasSkipped answers are already filtered at the DB query layer; no
 *   additional filtering is needed here.
 *
 * Prompt section order (priority-first):
 *   1. Event Briefing Answers  — most specific to this card
 *   2. Fresh Updates (recent)  — last 90 days, highest recency priority
 *   3. Follow-Up Answers       — recent conversations, acts as rich memory
 *   4. Fresh Updates (mid)     — 90–180 days
 *   5. Permanent profile       — character, interests, shared memories
 *   6. Card history            — to avoid repetition
 */

import type { RecipientContext } from "./recipient-context";

export function buildContextSupplement(context: RecipientContext | null): string | null {
  if (!context) return null;

  const lines: string[] = [
    "--- Recipient memory intelligence ---",
    "[WEAVING RULE] Do not mention one memory at a time. Weave multiple sources together naturally into the card. A card that references two or three different aspects of this person's life feels written by someone who actually knows them.",
    "[PRIORITY RULE] Briefing answers > Recent fresh updates (last 90 days) > Follow-up conversation answers > Older updates. When context conflicts, use the most recent. Do NOT invent details not provided.",
  ];

  if (context.identity?.archived) {
    lines.push("[Note] This recipient is archived — generate normally but be aware.");
  }

  // ── 1. Event Briefing Answers — most specific to this card ───────────────
  if (context.briefingSummary.totalAnswers > 0) {
    for (const answers of Object.values(context.briefingSummary.byEvent)) {
      if (answers.length === 0) continue;
      const first = answers[0]!;
      lines.push(`[Event Briefing — ${first.eventType} ${first.eventYear} — USE THESE FIRST, most specific to this card]`);
      for (const a of answers) {
        lines.push(`  Q: ${a.question}`);
        lines.push(`  A: ${a.answer}`);
      }
    }
  }

  // ── 2. Fresh Updates — recent (last 90 days) ─────────────────────────────
  if (context.freshUpdates.length > 0) {
    const recent = context.freshUpdates.filter(u => u.ageCategory === "recent");
    const mid    = context.freshUpdates.filter(u => u.ageCategory === "mid");
    const older  = context.freshUpdates.filter(u => u.ageCategory === "older");

    if (recent.length > 0) {
      lines.push("[Recent life updates — last 90 days — USE THESE, they are the most current window into this person's life]");
      for (const u of recent) {
        lines.push(`  Topic: ${u.question}`);
        lines.push(`  Update: ${u.answer}`);
      }
    }

    // ── 3. Follow-Up Conversation Answers ─────────────────────────────────
    if (context.followUpAnswers && context.followUpAnswers.length > 0) {
      lines.push("[Follow-up conversation answers — things we circled back on — treat as living memory]");
      for (const fa of context.followUpAnswers) {
        lines.push(`  Previously about: ${fa.originalTopic}`);
        lines.push(`  Update: ${fa.answer}`);
      }
    }

    if (mid.length > 0) {
      lines.push("[Life updates — 90–180 days ago — still relevant, good for weaving with recent context]");
      for (const u of mid) {
        lines.push(`  Topic: ${u.question}`);
        lines.push(`  Update: ${u.answer}`);
      }
    }
    if (older.length > 0) {
      lines.push("[Older life context — background only, use sparingly]");
      for (const u of older) {
        lines.push(`  Topic: ${u.question}`);
        lines.push(`  Update: ${u.answer}`);
      }
    }
  } else if (context.followUpAnswers && context.followUpAnswers.length > 0) {
    // Follow-ups even if no fresh updates
    lines.push("[Follow-up conversation answers — things we circled back on — treat as living memory]");
    for (const fa of context.followUpAnswers) {
      lines.push(`  Previously about: ${fa.originalTopic}`);
      lines.push(`  Update: ${fa.answer}`);
    }
  }

  // ── 4. Permanent profile ─────────────────────────────────────────────────
  const { traits, notes } = context.personality;
  if (traits.length > 0 || notes) {
    const parts: string[] = [];
    if (traits.length > 0) parts.push(`personality traits: ${traits.join(", ")}`);
    if (notes)             parts.push(`notes: ${notes}`);
    lines.push(`[Who they are] ${parts.join(" | ")}`);
  }

  if (context.interests.length > 0) {
    lines.push(`[Interests / hobbies] ${context.interests.join(", ")}`);
  }

  if (context.memories.favoriteMemories) {
    lines.push(`[Favorite shared memories] ${context.memories.favoriteMemories}`);
  }
  if (context.memories.insideJokes) {
    lines.push(`[Inside references / callbacks] ${context.memories.insideJokes}`);
  }

  // ── 5. Card history ──────────────────────────────────────────────────────
  const ch = context.cardHistory;
  if (ch.totalSent > 0) {
    const recent = ch.mostRecentCard;
    const histParts: string[] = [`${ch.totalSent} card(s) previously generated`];
    if (recent) histParts.push(`most recent: ${recent.eventType} (${recent.status})`);
    lines.push(
      `[Card history] ${histParts.join(", ")}. Avoid repeating the same opening structure, angle, or emotional beat used in prior cards.`,
    );
  }

  // ── 6. Things to always include ─────────────────────────────────────────
  if (context.tone.thingsToAlwaysInclude) {
    lines.push(`[Always include this] ${context.tone.thingsToAlwaysInclude}`);
  }

  if (lines.length === 3) return null;

  return lines.join("\n");
}

export function extractContextAvoids(context: RecipientContext | null): string[] {
  const raw = context?.tone.thingsToAvoid;
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;]+/)
    .map(s => s.trim())
    .filter(Boolean);
}
