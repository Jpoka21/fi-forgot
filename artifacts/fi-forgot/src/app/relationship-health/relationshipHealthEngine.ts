import { recipientService } from "@/app/api/services/recipientService";
import { getRecipients } from "@/lib/data";
import {
  computeOverallHealth,
  computeRecipientHealth,
  getScoreHistory,
  recordScoreSnapshot,
  type OverallHealth,
  type RecipientHealth,
  type ScoreSnapshot,
} from "@/lib/relationship-health";
import {
  normalizeRecipientHealthScore,
  type FiRecipientHealthScore,
} from "@/app/relationship-health/relationshipHealthDomain";

export async function fetchRecipientHealthScores(): Promise<FiRecipientHealthScore[]> {
  const result = await recipientService.getHealth();
  const body = (result.data ?? {}) as { scores?: unknown[] };
  const scores = Array.isArray(body.scores) ? body.scores : [];

  return scores
    .map((item) => normalizeRecipientHealthScore(item))
    .filter((item): item is FiRecipientHealthScore => item !== null);
}

export function loadClientOverallHealth(): OverallHealth {
  const overall = computeOverallHealth(getRecipients());
  if (overall.score > 0) {
    recordScoreSnapshot(overall.score);
  }
  return overall;
}

export function loadClientRecipientHealth(recipientId: string): RecipientHealth | null {
  const recipient = getRecipients().find((item) => item.id === recipientId);
  if (!recipient) return null;
  return computeRecipientHealth(recipient);
}

export function loadScoreTrend(): ScoreSnapshot[] {
  return getScoreHistory();
}

export function buildImprovementSuggestions(overall: OverallHealth): Array<{
  id: string;
  title: string;
  description: string;
  href: string;
  pointsGain?: number;
}> {
  const suggestions: Array<{
    id: string;
    title: string;
    description: string;
    href: string;
    pointsGain?: number;
  }> = [];

  if (overall.topInsight) {
    suggestions.push({
      id: "top-insight",
      title: `Strengthen ${overall.topInsight.recipientName}'s profile`,
      description: overall.topInsight.action,
      href:
        overall.recipientHealths.find((item) => item.name === overall.topInsight?.recipientName)
          ?.topGapHref ?? "/people",
      pointsGain: overall.topInsight.pointsGain,
    });
  }

  overall.recipientHealths
    .filter((item) => item.pointsAvailable > 0)
    .sort((a, b) => b.pointsAvailable - a.pointsAvailable)
    .slice(0, 3)
    .forEach((item) => {
      suggestions.push({
        id: `recipient-${item.id}`,
        title: item.topGap === "Profile looks great!" ? item.name : item.topGap,
        description:
          item.topGap === "Profile looks great!"
            ? `${item.name} is in good shape. Keep memories fresh over time.`
            : `Improve ${item.name}'s relationship profile.`,
        href: item.topGapHref,
        pointsGain: item.pointsAvailable,
      });
    });

  return suggestions.slice(0, 4);
}

export function resolveTrendDirection(history: ScoreSnapshot[]): "up" | "down" | "steady" {
  if (history.length < 2) return "steady";
  const latest = history[history.length - 1]?.score ?? 0;
  const previous = history[history.length - 2]?.score ?? latest;
  if (latest > previous) return "up";
  if (latest < previous) return "down";
  return "steady";
}
