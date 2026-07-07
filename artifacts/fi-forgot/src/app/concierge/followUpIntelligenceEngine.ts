import type { FreshUpdate } from "@/app/relationship-profile/relationshipProfileDomain";
import type { FollowUpCandidate } from "@/app/concierge/conciergeDomain";

const FOLLOW_UP_MIN_DAYS = 90;
const FOLLOW_UP_MAX_DAYS = 240;

const FOLLOW_UP_PATTERNS: Array<{
  match: RegExp;
  build: (phrase: string, excerpt: string) => { question: string; reason: string };
}> = [
  {
    match: /job|work|career|promot/i,
    build: (phrase, excerpt) => ({
      question: `Your ${phrase} started something new a while back — has it settled in?`,
      reason: `You mentioned work before: "${excerpt.slice(0, 60)}…" — a quick update keeps cards current.`,
    }),
  },
  {
    match: /garden|flower|plant/i,
    build: (phrase) => ({
      question: `How is ${phrase}'s garden doing these days?`,
      reason: "A natural follow-up on something you shared earlier — only if it's still true.",
    }),
  },
  {
    match: /baby|pregnant|born|child/i,
    build: (phrase) => ({
      question: `How is ${phrase}'s little one doing now?`,
      reason: "Life changes fast — one update helps the next card feel present, not dated.",
    }),
  },
  {
    match: /move|moved|house|home|apartment/i,
    build: (phrase) => ({
      question: `Has ${phrase} settled into the new place?`,
      reason: "You shared a move earlier. A gentle follow-up keeps memories accurate.",
    }),
  },
  {
    match: /health|surgery|recover|hospital/i,
    build: (phrase) => ({
      question: `How is ${phrase} doing lately?`,
      reason: "You mentioned their health before — only follow up if it still feels appropriate.",
    }),
  },
];

export interface FollowUpInput {
  freshUpdates: FreshUpdate[];
  relationshipPhrase: string;
  relationshipConfidence: number;
}

/**
 * Follow-up intelligence — natural follow-ups from real memories only. Never invent.
 */
export function selectBestFollowUp(input: FollowUpInput): FollowUpCandidate | null {
  const eligible = input.freshUpdates.filter(
    (update) =>
      update.daysAgo >= FOLLOW_UP_MIN_DAYS
      && update.daysAgo <= FOLLOW_UP_MAX_DAYS
      && update.answerText.trim().length >= 20,
  );

  if (eligible.length === 0) return null;

  const sorted = [...eligible].sort((a, b) => b.daysAgo - a.daysAgo);
  const update = sorted[0];
  const excerpt = update.answerText.trim();

  for (const pattern of FOLLOW_UP_PATTERNS) {
    if (pattern.match.test(excerpt)) {
      const built = pattern.build(input.relationshipPhrase, excerpt);
      return {
        fieldKey: update.questionKey,
        originalAnswer: excerpt,
        daysSinceAnswer: update.daysAgo,
        followUpQuestion: built.question,
        reason: built.reason,
        priority: input.relationshipConfidence < 70 ? "medium" : "low",
      };
    }
  }

  if (input.relationshipConfidence < 60 && update.daysAgo >= 120) {
    return {
      fieldKey: update.questionKey,
      originalAnswer: excerpt,
      daysSinceAnswer: update.daysAgo,
      followUpQuestion: `Last time you mentioned something about ${input.relationshipPhrase} — anything new worth remembering?`,
      reason: `You shared this ${Math.round(update.daysAgo / 30)} months ago: "${excerpt.slice(0, 80)}${excerpt.length > 80 ? "…" : ""}"`,
      priority: "medium",
    };
  }

  return null;
}
