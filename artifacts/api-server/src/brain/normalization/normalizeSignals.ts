/**
 * Signal normalization — pure, read-only.
 *
 * Converts a flat BrainSignal[] into independent high-level relationship states.
 * Does not call contributors, touch RelationshipContext, or influence decide().
 */

import type { BrainSignal } from "../types";
import type {
  EngagementState,
  FreshnessState,
  HistoryState,
  IdentityState,
  MomentumState,
  NormalizedRelationshipState,
  WritingState,
} from "./types";

function signalMap(signals: BrainSignal[]): Map<string, unknown> {
  const map = new Map<string, unknown>();
  for (const signal of signals) {
    map.set(`${signal.source}.${signal.label}`, signal.value);
  }
  return map;
}

function get(map: Map<string, unknown>, source: string, label: string): unknown {
  return map.get(`${source}.${label}`);
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * Identity — profile completeness + personalization inventory.
 * Independent of freshness / history / writing / engagement / momentum.
 */
function computeIdentity(map: Map<string, unknown>): IdentityState {
  const score = asNumber(get(map, "profile_completeness", "score")) ?? 0;
  const depth = asString(get(map, "memory_inventory", "personalization_depth"));

  const fromScore: IdentityState =
    score <= 0
      ? "empty"
      : score < 40
        ? "thin"
        : score < 70
          ? "developing"
          : "established";

  const fromDepth: IdentityState =
    depth === "rich"
      ? "established"
      : depth === "moderate"
        ? "developing"
        : depth === "light"
          ? "thin"
          : depth === "none"
            ? "empty"
            : fromScore;

  const rank: Record<IdentityState, number> = {
    empty: 0,
    thin: 1,
    developing: 2,
    established: 3,
  };

  return rank[fromScore] <= rank[fromDepth] ? fromScore : fromDepth;
}

/**
 * Freshness — conversation freshness rollup (pass-through with rename for "none").
 */
function computeFreshness(map: Map<string, unknown>): FreshnessState {
  const state = asString(get(map, "conversation_freshness", "freshness_state"));
  if (state === "current") return "current";
  if (state === "aging") return "aging";
  if (state === "stale") return "stale";
  if (state === "none") return "unknown";

  const age = asString(get(map, "memory_freshness", "most_recent_update_age_category"));
  if (age === "recent") return "current";
  if (age === "mid") return "aging";
  if (age === "older") return "stale";

  return "unknown";
}

/**
 * History — direct pass-through of relationship_timeline.timeline_depth.
 */
function computeHistory(map: Map<string, unknown>): HistoryState {
  const depth = asString(get(map, "relationship_timeline", "timeline_depth"));
  if (depth === "none" || depth === "light" || depth === "moderate" || depth === "rich") {
    return depth;
  }
  return "none";
}

/**
 * Writing — map writing_history.writing_depth to writing confidence tiers.
 * light → low (naming alignment only).
 */
function computeWriting(map: Map<string, unknown>): WritingState {
  const depth = asString(get(map, "writing_history", "writing_depth"));
  if (depth === "none") return "none";
  if (depth === "light") return "low";
  if (depth === "moderate") return "moderate";
  if (depth === "rich") return "high";

  const cardCount = asNumber(get(map, "writing_history", "card_count")) ?? 0;
  if (cardCount === 0) return "none";
  if (cardCount <= 2) return "low";
  if (cardCount <= 5) return "moderate";
  return "high";
}

/**
 * Engagement — independent channel presence score from conversation / momentum counts.
 */
function computeEngagement(map: Map<string, unknown>): EngagementState {
  const briefing =
    asNumber(get(map, "conversation_freshness", "briefing_answer_count")) ??
    asNumber(get(map, "engagement", "briefing_answer_count")) ??
    0;
  const followUps =
    asNumber(get(map, "conversation_freshness", "follow_up_count")) ??
    asNumber(get(map, "follow_up", "follow_up_answer_count")) ??
    0;
  const recentUpdates =
    asNumber(get(map, "conversation_freshness", "recent_update_count")) ?? 0;
  const activity =
    asNumber(get(map, "relationship_momentum", "engagement_activity_count")) ?? 0;

  let channels = 0;
  if (briefing > 0) channels += 1;
  if (followUps > 0) channels += 1;
  if (recentUpdates > 0) channels += 1;
  if (activity >= 3) channels += 1;

  if (channels === 0) return "none";
  if (channels === 1) return "low";
  if (channels === 2) return "moderate";
  return "high";
}

/**
 * Momentum — direct pass-through of relationship_momentum.momentum_state.
 */
function computeMomentum(map: Map<string, unknown>): MomentumState {
  const state = asString(get(map, "relationship_momentum", "momentum_state"));
  if (
    state === "new" ||
    state === "dormant" ||
    state === "quiet" ||
    state === "active"
  ) {
    return state;
  }
  return "new";
}

/**
 * Normalizes raw Brain signals into independent relationship state dimensions.
 */
export function normalizeSignals(
  availableSignals: BrainSignal[],
): NormalizedRelationshipState {
  const map = signalMap(availableSignals);
  const sourcesPresent = [
    ...new Set(availableSignals.map((signal) => signal.source)),
  ];

  return {
    identity: computeIdentity(map),
    freshness: computeFreshness(map),
    history: computeHistory(map),
    writing: computeWriting(map),
    engagement: computeEngagement(map),
    momentum: computeMomentum(map),
    derivedFrom: {
      signalCount: availableSignals.length,
      sourcesPresent,
    },
  };
}
