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
 * Prompt section order (per spec):
 *   1. Permanent profile (character, interests, memories)
 *   2. Fresh updates — time-sensitive, highest priority
 *   3. Briefing Q&A answers
 *   4. Card history / always-include
 */

import type { RecipientContext } from "./recipient-context";

/**
 * Converts assembled recipient context into a structured prompt supplement block.
 *
 * Returns null if context is null or contains no useful data (so callers can
 * skip injection entirely and keep the prompt unchanged).
 */
export function buildContextSupplement(context: RecipientContext | null): string | null {
  if (!context) return null;

  const lines: string[] = [
    "--- Recipient profile intelligence (from saved profile — use to enrich the card) ---",
    "[PRIORITY RULE] Recent updates (last 90 days) take precedence over older profile data. When a recent update conflicts with older information, use the most recent update. Prioritize recent updates over everything else when crafting the message.",
  ];

  // Archived flag — inform the AI but don't block generation
  if (context.identity?.archived) {
    lines.push("[Note] This recipient is archived — generate normally but be aware.");
  }

  // ── 1. Permanent profile ──────────────────────────────────────────────────

  // Character
  const { traits, notes } = context.personality;
  if (traits.length > 0 || notes) {
    const parts: string[] = [];
    if (traits.length > 0) parts.push(`traits: ${traits.join(", ")}`);
    if (notes) parts.push(`notes: ${notes}`);
    lines.push(`[Character] ${parts.join(" | ")}`);
  }

  // Structured interests (from recipient_profile.interests JSONB column)
  if (context.interests.length > 0) {
    lines.push(`[Interests] ${context.interests.join(", ")}`);
  }

  // Memories
  if (context.memories.favoriteMemories) {
    lines.push(`[Shared memories] ${context.memories.favoriteMemories}`);
  }
  if (context.memories.insideJokes) {
    lines.push(`[Inside references / jokes] ${context.memories.insideJokes}`);
  }

  // ── 2. Fresh updates — time-sensitive, USE FIRST ──────────────────────────
  // Grouped by recency so the AI can weight accordingly.

  if (context.freshUpdates.length > 0) {
    const recent = context.freshUpdates.filter(u => u.ageCategory === "recent");
    const mid    = context.freshUpdates.filter(u => u.ageCategory === "mid");
    const older  = context.freshUpdates.filter(u => u.ageCategory === "older");

    if (recent.length > 0) {
      lines.push("[Recent updates — last 90 days — USE THESE FIRST when personalising]");
      for (const u of recent) {
        lines.push(`  Q: ${u.question}`);
        lines.push(`  A: ${u.answer}`);
      }
    }
    if (mid.length > 0) {
      lines.push("[Updates — 90–180 days ago — still relevant, use if recent ones are thin]");
      for (const u of mid) {
        lines.push(`  Q: ${u.question}`);
        lines.push(`  A: ${u.answer}`);
      }
    }
    if (older.length > 0) {
      lines.push("[Older updates — background context only]");
      for (const u of older) {
        lines.push(`  Q: ${u.question}`);
        lines.push(`  A: ${u.answer}`);
      }
    }
  }

  // ── 3. Briefing Q&A answers — wasSkipped=false already enforced at DB level

  if (context.briefingSummary.totalAnswers > 0) {
    for (const answers of Object.values(context.briefingSummary.byEvent)) {
      if (answers.length === 0) continue;
      // Use first answer's fields for the event label (avoids string-splitting the key)
      const first = answers[0]!;
      lines.push(`[Briefing answers — ${first.eventType} ${first.eventYear}]`);
      for (const a of answers) {
        lines.push(`  Q: ${a.question}`);
        lines.push(`  A: ${a.answer}`);
      }
    }
  }

  // ── 4. Other context ──────────────────────────────────────────────────────

  // Card history — enough to avoid obvious repetition
  const ch = context.cardHistory;
  if (ch.totalSent > 0) {
    const recent = ch.mostRecentCard;
    const histParts: string[] = [`${ch.totalSent} card(s) previously generated for this recipient`];
    if (recent) {
      histParts.push(`most recent: ${recent.eventType} (${recent.status})`);
    }
    lines.push(
      `[Card history] ${histParts.join(", ")}. Avoid repeating the same opening structure, angle, or emotional beat used in prior cards.`,
    );
  }

  // Things to always include (advisory — goes in the user prompt supplement)
  if (context.tone.thingsToAlwaysInclude) {
    lines.push(`[Always include] ${context.tone.thingsToAlwaysInclude}`);
  }

  // If nothing useful was added beyond the header lines, return null
  if (lines.length === 2) return null;

  return lines.join("\n");
}

/**
 * Extracts hard-avoid terms from context.tone.thingsToAvoid for merging into
 * the system-level avoidList (which becomes a hard instruction in the system
 * prompt, not advisory text).
 *
 * Returns [] if context is null or thingsToAvoid is absent/empty.
 */
export function extractContextAvoids(context: RecipientContext | null): string[] {
  const raw = context?.tone.thingsToAvoid;
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;]+/)
    .map(s => s.trim())
    .filter(Boolean);
}
