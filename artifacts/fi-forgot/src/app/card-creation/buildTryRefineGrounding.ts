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

/** Grounded rewrite / new-version / more-personal instructions for /try quick adjust. */
export const TRY_REFINE_INSTRUCTIONS = {
  shorter: "Shorten this significantly — keep only the most impactful lines. Do not remove or invent personal facts.",
  warmer: "Make this noticeably warmer and more heartfelt using only the facts already present. Do not invent memories.",
  funnier: "Add a genuine touch of humor that still feels warm, using only existing facts. Do not invent new anecdotes.",
  morePersonal:
    "Make this feel more personal by emphasizing the supplied primary reason and supporting details already present. Do not invent any new personal details, memories, places, or events.",
  goDeeper:
    "Make this more emotionally raw and vulnerable using only the facts already present. Do not invent new memories or events.",
  rewrite:
    "Completely rewrite with a fresh opening, fresh structure, and fresh wording, while retaining every supplied personal fact — recipient, occasion, primary reason, supporting personal details, and sign-off. Do not invent new personal facts, memories, places, or events.",
  newVersion:
    "Write a completely different expression of the same facts — fresh angle, different opening, different structure and wording — same recipient, relationship, occasion, primary reason, supporting details, and sign-off. Do not invent new personal facts or memories.",
} as const;
