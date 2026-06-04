import type { Recipient } from "./data";

// ── Types ─────────────────────────────────────────────────────────────────────
export type RelationshipTier = "core" | "important" | "occasional";

export interface CategoryScore { score: number; max: number; gaps: string[] }
export interface CategoryBreakdown {
  eventCoverage:   CategoryScore;
  memoryBank:      CategoryScore;
  preferences:     CategoryScore;
  commStyle:       CategoryScore;
  actionReadiness: CategoryScore;
}
export interface RecipientHealth {
  id:              string;
  name:            string;
  relationship:    string;
  tier:            RelationshipTier;
  score:           number;    // 0–100
  categories:      CategoryBreakdown;
  topGap:          string;
  topGapHref:      string;
  pointsAvailable: number;
}
export interface HealthInsight {
  recipientName: string;
  category:      string;
  action:        string;
  pointsGain:    number;
}
export interface OverallHealth {
  score:            number;
  label:            string;
  color:            string;
  tagline:          string;
  explanation:      string;
  recipientHealths: RecipientHealth[];
  topInsight:       HealthInsight | null;
}
export interface CoverageGap { relationship: string; tier: RelationshipTier; suggestion: string }
export interface CoverageResult { coveredCount: number; totalActive: number; gaps: CoverageGap[]; score: number }
export interface RecommendedAction {
  type:          "approve_card" | "answer_briefing" | "improve_profile" | "add_person";
  title:         string;
  description:   string;
  href:          string;
  recipientName?: string;
  daysUntil?:    number;
  urgency:       "high" | "medium" | "low";
}
export interface ScoreSnapshot { date: string; score: number }

// ── Tier map ──────────────────────────────────────────────────────────────────
export const RELATIONSHIP_TIER_MAP: Record<string, RelationshipTier> = {
  "Wife": "core", "Husband": "core", "Girlfriend": "core", "Boyfriend": "core",
  "Mom": "core",  "Dad": "core",
  "Mother in law": "important", "Father in law": "important",
  "Daughter": "important", "Son": "important",
  "Grandmother": "important", "Grandfather": "important",
  "Sister": "important", "Brother": "important", "Friend": "important",
  "Employee": "occasional", "Client": "occasional", "Other": "occasional",
};

export const TIER_WEIGHTS: Record<RelationshipTier, number> = { core: 3, important: 2, occasional: 1 };
export const TIER_LABELS:  Record<RelationshipTier, string>  = { core: "Core", important: "Important", occasional: "Occasional" };
export const TIER_COLORS:  Record<RelationshipTier, string>  = { core: "#E23B2E", important: "#1d4ed8", occasional: "#6B6B6B" };

const PARTNER_RELS = new Set(["Wife", "Husband", "Girlfriend", "Boyfriend"]);

// ── Configurable scoring weights — change these constants to re-weight ────────
export const SCORING_CONFIG = {
  EVENT_COVERAGE: {
    max: 25,
    birthday: 10,    // permanent — no decay
    anniversary: 8,  // permanent — no decay
    holidays: 7,     // ≥ 2 selected occasions
  },
  MEMORY_BANK: {
    max: 20,
    favoriteMemories: 8,  // meaningful context > quick facts
    insideJokes: 7,       // meaningful context
    personalityNotes: 5,  // additional context
    // freshness decay applies to this whole category
  },
  PREFERENCES: {
    max: 20,
    personality: 6,
    interests: 7,    // weighted slightly higher — drives card quality more
    tonePreference: 4,
    emotionalLevel: 3,
  },
  COMM_STYLE: {
    max: 15,
    senderName: 5,
    petName: 5,
    yearsTogther: 5,  // partner-only field (intentional typo preserved)
  },
  ACTION_READINESS: {
    max: 20,
    mailingAddress: 10,
    previewDays: 5,
    deliveryPreference: 5,
  },
} as const;

// Freshness decay — applies to MEMORY_BANK only (not permanent facts like dates)
const FRESHNESS_DECAY: Array<{ daysOld: number; factor: number }> = [
  { daysOld: 0,   factor: 1.0 },
  { daysOld: 180, factor: 0.9 },
  { daysOld: 365, factor: 0.8 },
  { daysOld: 730, factor: 0.7 },
];

function getFreshnessFactor(profileUpdatedAt?: string): number {
  if (!profileUpdatedAt) return 1.0;
  const daysSince = Math.floor((Date.now() - new Date(profileUpdatedAt).getTime()) / 86400000);
  let factor = 1.0;
  for (const tier of FRESHNESS_DECAY) {
    if (daysSince >= tier.daysOld) factor = tier.factor;
    else break;
  }
  return factor;
}

function isMeaningful(text?: string): boolean {
  return !!(text && text.trim().length > 5);
}

// ── Category scorers ──────────────────────────────────────────────────────────
function scoreEventCoverage(r: Recipient): CategoryScore {
  const c = SCORING_CONFIG.EVENT_COVERAGE;
  let score = 0;
  const gaps: string[] = [];

  if (r.birthday) { score += c.birthday; } else { gaps.push("Add birthday"); }

  if (PARTNER_RELS.has(r.relationship)) {
    if (r.anniversaryDate || r.marriageDate) { score += c.anniversary; }
    else { gaps.push("Add anniversary date"); }
  }

  const holidayCount = (r.selectedEvents ?? []).filter(e => e !== "Birthday" && e !== "Anniversary").length;
  if (holidayCount >= 2)      { score += c.holidays; }
  else if (holidayCount === 1){ score += Math.round(c.holidays * 0.5); gaps.push("Add one more occasion"); }
  else                         { gaps.push("Select at least 2 occasions"); }

  return { score: Math.min(score, c.max), max: c.max, gaps };
}

function scoreMemoryBank(r: Recipient, freshnessFactor: number): CategoryScore {
  const c = SCORING_CONFIG.MEMORY_BANK;
  let raw = 0;
  const gaps: string[] = [];

  if (isMeaningful(r.favoriteMemories)) { raw += c.favoriteMemories; } else { gaps.push("Add a shared memory or story"); }
  if (isMeaningful(r.insideJokes))      { raw += c.insideJokes; }      else { gaps.push("Add an inside reference or shared history"); }
  if (isMeaningful(r.personalityNotes)) { raw += c.personalityNotes; } else { gaps.push("Add personality notes"); }

  return { score: Math.round(Math.min(raw, c.max) * freshnessFactor), max: c.max, gaps };
}

function scorePreferences(r: Recipient): CategoryScore {
  const c = SCORING_CONFIG.PREFERENCES;
  let score = 0;
  const gaps: string[] = [];

  if ((r.personality ?? []).length > 0) { score += c.personality; }  else { gaps.push("Select personality traits"); }
  if ((r.interests ?? []).length > 0)   { score += c.interests; }    else { gaps.push("Select what they love"); }
  if (r.tonePreference)                  { score += c.tonePreference; }
  if (r.emotionalLevel)                  { score += c.emotionalLevel; }

  return { score: Math.min(score, c.max), max: c.max, gaps };
}

function scoreCommStyle(r: Recipient): CategoryScore {
  const c = SCORING_CONFIG.COMM_STYLE;
  let score = 0;
  const gaps: string[] = [];

  if (r.senderName?.trim()) { score += c.senderName; } else { gaps.push("Add how they know you"); }
  if (r.petName?.trim())    { score += c.petName; }    else { gaps.push("Add a nickname or pet name"); }

  if (PARTNER_RELS.has(r.relationship)) {
    if (r.yearsTogther?.trim()) { score += c.yearsTogther; }
    else { gaps.push("Add how long you've been together"); }
  } else {
    score += c.yearsTogther; // non-partner: field not applicable, give full points
  }

  return { score: Math.min(score, c.max), max: c.max, gaps };
}

function scoreActionReadiness(r: Recipient): CategoryScore {
  const c = SCORING_CONFIG.ACTION_READINESS;
  let score = 0;
  const gaps: string[] = [];

  const addr = r.mailingAddress;
  const hasAddr = addr?.line1?.trim() && addr?.city?.trim() && addr?.state?.trim() && addr?.zip?.trim();
  if (hasAddr)             { score += c.mailingAddress; }   else { gaps.push("Add a mailing address"); }
  if (r.previewDays)       { score += c.previewDays; }
  if (r.deliveryPreference){ score += c.deliveryPreference; }

  return { score: Math.min(score, c.max), max: c.max, gaps };
}

// ── Public: score a single recipient ─────────────────────────────────────────
export function computeRecipientHealth(r: Recipient): RecipientHealth {
  const tier = RELATIONSHIP_TIER_MAP[r.relationship] ?? "occasional";
  const freshness = getFreshnessFactor((r as Recipient & { profileUpdatedAt?: string }).profileUpdatedAt);

  const categories: CategoryBreakdown = {
    eventCoverage:   scoreEventCoverage(r),
    memoryBank:      scoreMemoryBank(r, freshness),
    preferences:     scorePreferences(r),
    commStyle:       scoreCommStyle(r),
    actionReadiness: scoreActionReadiness(r),
  };

  const rawTotal = Object.values(categories).reduce((s, c) => s + c.score, 0);
  const maxTotal = 100; // sum of all category maxes
  const score = Math.max(15, Math.round((rawTotal / maxTotal) * 100));

  // Find most impactful single gap
  const allGaps = Object.entries(categories)
    .filter(([, c]) => c.gaps.length > 0)
    .map(([key, c]) => ({ gap: c.gaps[0], key, pointsAvail: c.max - c.score }))
    .sort((a, b) => b.pointsAvail - a.pointsAvail);

  const topGapEntry  = allGaps[0];
  const topGap       = topGapEntry?.gap ?? "Profile looks great!";
  const topGapHref   = `/recipients/${r.id}?from=dashboard`;
  const pointsAvailable = allGaps.reduce((s, g) => s + g.pointsAvail, 0);

  return { id: r.id, name: r.name, relationship: r.relationship, tier, score, categories, topGap, topGapHref, pointsAvailable };
}

// ── Public: overall account health ───────────────────────────────────────────
export function computeOverallHealth(recipients: Recipient[]): OverallHealth {
  const active = recipients.filter(r => r.active !== false);

  if (active.length === 0) {
    return {
      score: 0, label: "Not started", color: "#9E9E9E",
      tagline: "Add your first important person to get started.",
      explanation: "Add the people who matter most and we'll track every important moment for you.",
      recipientHealths: [], topInsight: null,
    };
  }

  const recipientHealths = active.map(computeRecipientHealth);

  let weightedSum = 0, weightTotal = 0;
  for (const rh of recipientHealths) {
    const w = TIER_WEIGHTS[rh.tier];
    weightedSum += rh.score * w;
    weightTotal += w;
  }
  const score = Math.round(weightedSum / weightTotal);
  const { label, color, tagline, explanation } = getScoreMeta(score);

  // Best improvement opportunity: highest-tier recipient with most points to gain
  const topOpp = [...recipientHealths]
    .sort((a, b) => (TIER_WEIGHTS[b.tier] - TIER_WEIGHTS[a.tier]) || (b.pointsAvailable - a.pointsAvailable))
    .find(r => r.pointsAvailable > 0);

  let topInsight: HealthInsight | null = null;
  if (topOpp) {
    const topCat = Object.entries(topOpp.categories)
      .sort(([, a], [, b]) => (b.max - b.score) - (a.max - a.score))
      .find(([, c]) => c.gaps.length > 0);
    if (topCat) {
      const [catKey, catData] = topCat;
      topInsight = {
        recipientName: topOpp.name,
        category: CAT_LABELS[catKey] ?? catKey,
        action: catData.gaps[0],
        pointsGain: catData.max - catData.score,
      };
    }
  }

  return { score, label, color, tagline, explanation, recipientHealths, topInsight };
}

// ── Public: coverage analysis ─────────────────────────────────────────────────
export function computeCoverage(recipients: Recipient[]): CoverageResult {
  const active = recipients.filter(r => r.active !== false);

  const hasPartner  = active.some(r => PARTNER_RELS.has(r.relationship));
  const hasMom      = active.some(r => ["Mom", "Mother in law"].includes(r.relationship));
  const hasDad      = active.some(r => ["Dad", "Father in law"].includes(r.relationship));
  const hasFriend   = active.some(r => r.relationship === "Friend");
  const hasKid      = active.some(r => ["Son", "Daughter"].includes(r.relationship));

  const gaps: CoverageGap[] = [];
  if (!hasPartner && active.length >= 1) gaps.push({ relationship: "Partner",      tier: "core",      suggestion: "Your partner may be the most meaningful card you send all year." });
  if (!hasMom     && active.length >= 1) gaps.push({ relationship: "Mom",          tier: "core",      suggestion: "Mom's birthday and Mother's Day are two of the most meaningful occasions." });
  if (!hasDad     && active.length >= 1) gaps.push({ relationship: "Dad",          tier: "core",      suggestion: "Father's Day and birthdays are easy wins for a relationship with Dad." });
  if (!hasFriend  && active.length >= 2) gaps.push({ relationship: "Close Friend", tier: "important", suggestion: "Friends often go years without hearing from each other — a card changes that." });
  if (!hasKid     && active.length >= 3) gaps.push({ relationship: "Adult Child",  tier: "important", suggestion: "Grown kids appreciate hearing from you more than you might think." });

  const coveredCount = active.filter(r => (r.selectedEvents ?? []).length > 0).length;
  const coverageScore = active.length === 0 ? 0 : Math.round((coveredCount / active.length) * 100);

  return { coveredCount, totalActive: active.length, gaps: gaps.slice(0, 3), score: coverageScore };
}

// ── Public: recommended next action ──────────────────────────────────────────
export function getRecommendedAction(
  recipients: Recipient[],
  pendingApprovalCount: number,
  briefingsNeeded: Array<{ recipient: { name: string; id: string }; event: string; daysAway: number }>,
  health: OverallHealth,
): RecommendedAction {
  if (pendingApprovalCount > 0) {
    return {
      type: "approve_card",
      title: pendingApprovalCount === 1 ? "A card is ready for your review" : `${pendingApprovalCount} cards are ready for review`,
      description: "Read through, make any tweaks, and approve. Takes about 60 seconds.",
      href: "/cards/review",
      urgency: "high",
    };
  }

  const urgent = briefingsNeeded.find(b => b.daysAway <= 14);
  if (urgent) {
    return {
      type: "answer_briefing",
      title: `Personalize ${urgent.recipient.name}'s ${urgent.event} card`,
      description: `Answer a few quick questions so the card sounds like you wrote it. ${urgent.daysAway} days away.`,
      href: `/briefings/${urgent.recipient.id}/${encodeURIComponent(urgent.event)}`,
      recipientName: urgent.recipient.name,
      daysUntil: urgent.daysAway,
      urgency: "high",
    };
  }

  const soon = briefingsNeeded.find(b => b.daysAway <= 30);
  if (soon) {
    return {
      type: "answer_briefing",
      title: `Add a personal touch to ${soon.recipient.name}'s ${soon.event} card`,
      description: `A few details now will make ${soon.recipient.name}'s card feel genuinely personal, not generic.`,
      href: `/briefings/${soon.recipient.id}/${encodeURIComponent(soon.event)}`,
      recipientName: soon.recipient.name,
      daysUntil: soon.daysAway,
      urgency: "medium",
    };
  }

  if (health.topInsight) {
    const rh = health.recipientHealths.find(r => r.name === health.topInsight!.recipientName);
    return {
      type: "improve_profile",
      title: `Make ${health.topInsight.recipientName}'s next card more personal`,
      description: `${health.topInsight.action} — this will make future cards feel much more like they came from you.`,
      href: rh?.topGapHref ?? "/recipients",
      recipientName: health.topInsight.recipientName,
      urgency: "medium",
    };
  }

  const coverage = computeCoverage(recipients);
  if (coverage.gaps.length > 0) {
    return {
      type: "add_person",
      title: `Consider adding your ${coverage.gaps[0].relationship}`,
      description: coverage.gaps[0].suggestion,
      href: "/recipients/new",
      urgency: "low",
    };
  }

  return {
    type: "improve_profile",
    title: "Your relationships are well covered",
    description: "All the important people are being watched. Keep profiles fresh as things change.",
    href: "/recipients",
    urgency: "low",
  };
}

// ── Score display helpers ─────────────────────────────────────────────────────
export function getScoreMeta(score: number): { label: string; color: string; tagline: string; explanation: string } {
  if (score >= 91) return {
    label: "Legend Status",
    color: "#4CAF50",
    tagline: "Your relationships are in exceptional shape.",
    explanation: "We know these people deeply. Your cards are as personal as they get — keep profiles fresh and you'll stay right here.",
  };
  if (score >= 76) return {
    label: "Thoughtful Human",
    color: "#26A69A",
    tagline: "You're genuinely keeping up with the people who matter.",
    explanation: "Your cards are personal and your relationships are well covered. A few more memories will push things even further.",
  };
  if (score >= 51) return {
    label: "Building Momentum",
    color: "#FFA726",
    tagline: "Good progress — keep adding details to make cards more personal.",
    explanation: "We can create personalized cards, but a few more memories and preferences will make future cards feel much more thoughtful.",
  };
  if (score >= 26) return {
    label: "Staying Out of Trouble",
    color: "#FF7043",
    tagline: "The basics are covered. Time to make things more personal.",
    explanation: "We have enough to send cards, but adding memories and personal details will make a real difference in how they land.",
  };
  return {
    label: "Just Surviving",
    color: "#9E9E9E",
    tagline: "Let's get the important people covered.",
    explanation: "Every relationship starts somewhere. Add a few details and we'll start building cards that actually mean something.",
  };
}

export const CAT_LABELS: Record<string, string> = {
  eventCoverage:   "Event Coverage",
  memoryBank:      "Shared Memories",
  preferences:     "Likes & Interests",
  commStyle:       "Communication Style",
  actionReadiness: "Card Readiness",
};

export const CAT_DESCRIPTIONS: Record<string, string> = {
  eventCoverage:   "Birthdays, anniversaries, and occasions being tracked",
  memoryBank:      "Stories, memories, and personal details on file",
  preferences:     "Personality, interests, and card style preferences",
  commStyle:       "Nickname, how they know you, relationship context",
  actionReadiness: "Address, delivery settings, and approval timing",
};

export function getEventStatus(
  daysAway: number, hasBriefing: boolean, hasCard: boolean, cardApproved: boolean,
): { label: string; color: string; bg: string } {
  if (cardApproved)                           return { label: "Protected",          color: "#15803d", bg: "#f0fdf4" };
  if (hasCard)                                return { label: "Draft Ready",        color: "#1d4ed8", bg: "#eff6ff" };
  if (hasBriefing && daysAway > 14)          return { label: "On Track",           color: "#15803d", bg: "#f0fdf4" };
  if (daysAway <= 7)                          return { label: "Watching",           color: "#b45309", bg: "#fffbeb" };
  if (daysAway <= 14)                         return { label: "Needs One Detail",   color: "#9a3412", bg: "#fff7ed" };
  if (hasBriefing)                            return { label: "On Track",           color: "#15803d", bg: "#f0fdf4" };
  if (daysAway <= 30)                         return { label: "Watching",           color: "#b45309", bg: "#fffbeb" };
  return                                             { label: "On Track",           color: "#15803d", bg: "#f0fdf4" };
}

// ── Score history (localStorage) ─────────────────────────────────────────────
const SCORE_HISTORY_KEY = "fi_forgot_score_history";

export function recordScoreSnapshot(score: number): void {
  if (score === 0) return;
  try {
    const raw  = localStorage.getItem(SCORE_HISTORY_KEY);
    const hist: ScoreSnapshot[] = raw ? JSON.parse(raw) : [];
    const today = new Date().toISOString().slice(0, 10);
    const last  = hist[hist.length - 1];
    if (!last || last.date !== today) {
      hist.push({ date: today, score });
      while (hist.length > 60) hist.shift();
      localStorage.setItem(SCORE_HISTORY_KEY, JSON.stringify(hist));
    }
  } catch {}
}

export function getScoreHistory(): ScoreSnapshot[] {
  try {
    const raw = localStorage.getItem(SCORE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
