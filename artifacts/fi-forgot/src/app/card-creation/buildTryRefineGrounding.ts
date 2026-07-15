/**
 * Builds structured grounding for POST /api/v2/refine-card (Sprint 8E).
 */

import { GUEST_INTENSITY_CHOICES } from "./guestTryFlowSteps";

export type TryRefineGroundingContext = {
  firstName?: string;
  relationship?: string;
  occasion?: string;
  primaryOccasionContext?: string;
  details?: string;
  tone?: string;
  emotionalOpenness?: string;
  avoidList?: string[];
  avoidMentioning?: string;
  signOff?: string;
};

function resolveIntensityForGrounding(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const guest = GUEST_INTENSITY_CHOICES.find((c) => c.emotionalOpenness === trimmed);
  return guest ? guest.label : trimmed;
}

export function buildTryRefineGrounding(input: {
  firstName: string;
  relationship: string;
  answers: Record<string, string | string[]>;
}): TryRefineGroundingContext {
  const get = (id: string) => {
    const v = input.answers[id];
    return Array.isArray(v) ? v.join(", ") : (v ?? "");
  };
  const avoidList = (input.answers["avoidList"] as string[] | undefined) ?? [];
  const trim = (s: string) => s.trim();

  const grounding: TryRefineGroundingContext = {
    firstName: trim(input.firstName) || undefined,
    relationship: trim(input.relationship) || undefined,
    occasion: trim(get("occasion") === "Holiday" && get("holidayName")
      ? `Holiday - ${get("holidayName")}`
      : get("occasion")) || undefined,
    primaryOccasionContext: trim(get("primaryOccasionContext")) || undefined,
    details: trim(get("details")) || undefined,
    tone: trim(get("tone")) || undefined,
    emotionalOpenness: resolveIntensityForGrounding(get("emotionalOpenness")),
    avoidMentioning: trim(get("avoidMentioning")) || undefined,
    signOff: trim(get("signOff")) || undefined,
  };
  if (avoidList.length) grounding.avoidList = avoidList;
  return grounding;
}

/** Grounded rewrite / new-version / more-personal instructions for /try quick adjust (Sprint 8G). */
export const TRY_REFINE_INSTRUCTIONS = {
  shorter:
    "Shorten this significantly — keep only the most impactful lines. Keep the primary reason visible. Normally retain supplied supporting detail as a brief recognizable callback unless omitting or softening it clearly produces a more appropriate, tactful, or user-compliant card. Do not invent personal facts. Do not replace a supplied supporting detail with an unrelated generic joke, metaphor, or invented anecdote.",
  warmer:
    "Make this noticeably warmer and more heartfelt using only the facts already present. Keep the primary reason dominant and normally retain supplied supporting detail. Do not invent memories.",
  funnier:
    "Add a genuine touch of humor that still feels warm, preferring humor from supplied supporting details when present and retained. Keep the primary reason dominant. Do not invent new anecdotes. Do not replace a supplied supporting detail with an unrelated generic joke.",
  morePersonal:
    "Make this feel more personal by using the supplied primary reason and supporting details more effectively — emphasize existing facts, keep the primary dominant, and normally retain a brief recognizable callback to supplied support unless a tactful/user-compliant omission reason applies. Do not invent any new personal details, memories, places, or events.",
  goDeeper:
    "Make this more emotionally raw and vulnerable using only the facts already present. Keep the primary reason dominant and normally retain supplied supporting detail. Do not invent new memories or events.",
  rewrite:
    "Completely rewrite with a genuinely different opening, a different sentence progression or structural beat order, and substantially fresh wording and rhythm, while retaining the recipient, occasion, primary reason, and sign-off. When a meaningful supporting detail was supplied, normally include one brief recognizable callback to it while keeping the primary reason dominant; omit or soften only when that clearly produces a more appropriate, tactful, or user-compliant card. Do not reuse distinctive metaphors, punchlines, invented jokes, or framing from the original card unless they came from authoritative user-supplied facts. Do not invent new personal facts, memories, places, or events. Do not replace a supplied supporting detail with an unrelated generic joke, metaphor, or invented anecdote. Do not produce a sentence-by-sentence paraphrase.",
  newVersion:
    "Write a clearly different take using the same authoritative facts — different opening, different structure and wording — same recipient, relationship, occasion, primary reason, tone constraints, and sign-off. Normally retain a brief recognizable callback to any supplied supporting detail while keeping the primary dominant, unless a tactful/user-compliant omission reason applies. Do not reuse distinctive original metaphors unless they are authoritative user-supplied facts. Do not invent new personal facts or memories.",
} as const;
