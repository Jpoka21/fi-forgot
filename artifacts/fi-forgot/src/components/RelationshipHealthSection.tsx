/**
 * RelationshipHealthSection — compact people list
 *
 * Sections:
 *   WGYBSection (named export) — "We Got Your Back" compact list, ≤3 items
 *   default export             — grouped compact recipient rows
 *
 * Data: GET /api/v2/recipient-health (unchanged)
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getApiHeaders } from "@/lib/data";

/* ── Brand tokens ────────────────────────────────────────────────── */
const BEIGE  = "#F2E6D3";
const RED    = "#E23B2E";
const INK    = "#1F1F1F";
const MID    = "#4B5563";
const WHITE  = "#FFFFFF";
const SAGE   = "#5B8C6B";
const BORDER = "#E5E0D8";
const AMBER  = "#D97706";

/* ── Types ───────────────────────────────────────────────────────── */
interface RecipientHealthScore {
  recipientId:       string;
  name:              string;
  relationshipType:  string;
  score:             number;
  status:            "Excellent" | "Healthy" | "NeedsAttention" | "Priority";
  profilePct:        number;
  lastUpdateDaysAgo: number | null;
  nextEventLabel:    string | null;
  nextEventDaysAway: number | null;
  pendingFollowUps:  number;
  recommendedAction: string;
  actionType:        "profile" | "follow_up" | "fresh_update" | "card" | "review";
}

/* ── Status config ───────────────────────────────────────────────── */
const STATUS_CONFIG = {
  Priority:       { label: "Priority",       color: RED,       order: 0 },
  NeedsAttention: { label: "Needs Attention", color: AMBER,     order: 1 },
  Healthy:        { label: "Healthy",         color: SAGE,      order: 2 },
  Excellent:      { label: "Excellent",       color: "#166534", order: 3 },
} as const;

/* ── Action label map ────────────────────────────────────────────── */
const ACTION_LABELS: Record<string, string> = {
  profile:      "Complete Profile",
  follow_up:    "Answer Follow Up",
  fresh_update: "Tell Us Something New",
  card:         "Create Card",
  review:       "Review Activity",
};

/* ── Helpers ─────────────────────────────────────────────────────── */
function avatar(name: string): string {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function actionDestination(score: RecipientHealthScore): string {
  if (score.actionType === "card")   return `/v2?recipientId=${score.recipientId}`;
  if (score.actionType === "review") return `/recipients/${score.recipientId}/timeline`;
  return `/recipients/${score.recipientId}?from=dashboard`;
}

function contextLine(score: RecipientHealthScore): string {
  if (score.nextEventDaysAway !== null && score.nextEventLabel && score.nextEventDaysAway <= 60) {
    const d = score.nextEventDaysAway;
    return `${score.nextEventLabel} in ${d} day${d !== 1 ? "s" : ""}`;
  }
  if (score.lastUpdateDaysAgo === null) return "Never updated";
  if (score.lastUpdateDaysAgo > 90) {
    const m = Math.round(score.lastUpdateDaysAgo / 30);
    return `No update in ${m} month${m !== 1 ? "s" : ""}`;
  }
  if (score.pendingFollowUps > 0) {
    return `${score.pendingFollowUps} follow-up${score.pendingFollowUps > 1 ? "s" : ""} waiting`;
  }
  return score.recommendedAction;
}

function wgybSentence(s: RecipientHealthScore): string | null {
  if (s.nextEventDaysAway !== null && s.nextEventLabel && s.nextEventDaysAway <= 30) {
    const d = s.nextEventDaysAway;
    return `${s.name}'s ${s.nextEventLabel} is in ${d} day${d !== 1 ? "s" : ""}`;
  }
  if (s.lastUpdateDaysAgo !== null && s.lastUpdateDaysAgo > 90) {
    const m = Math.round(s.lastUpdateDaysAgo / 30);
    return `${s.name} hasn't been updated in ${m} month${m !== 1 ? "s" : ""}`;
  }
  if (s.pendingFollowUps > 0) {
    return `${s.name} has a follow-up waiting`;
  }
  if (s.actionType === "card" && s.nextEventLabel) {
    return `${s.name}'s ${s.nextEventLabel} card is ready to draft`;
  }
  return null;
}

/* ── Compact recipient row ───────────────────────────────────────── */
function RecipientRow({ score }: { score: RecipientHealthScore }) {
  const [, setLocation] = useLocation();
  const cfg        = STATUS_CONFIG[score.status];
  const actionLabel = ACTION_LABELS[score.actionType] ?? "View";
  const dest       = actionDestination(score);
  const ctx        = contextLine(score);
  const isUrgent   = score.status === "Priority";

  return (
    <div
      onClick={() => setLocation(`/recipients/${score.recipientId}?from=dashboard`)}
      style={{
        background:   WHITE,
        borderRadius: 12,
        padding:      "11px 14px",
        border:       `1px solid ${BORDER}`,
        borderLeft:   `3px solid ${cfg.color}`,
        display:      "flex",
        alignItems:   "center",
        gap:          12,
        cursor:       "pointer",
        minHeight:    72,
        boxSizing:    "border-box" as const,
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: "50%", background: INK, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.88rem", color: WHITE }}>
          {avatar(score.name)}
        </span>
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Line 1: Name · Relationship */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 3 }}>
          <span style={{ fontWeight: 700, fontSize: "0.92rem", color: INK }}>{score.name}</span>
          <span style={{ fontSize: "0.72rem", color: MID }}>· {score.relationshipType}</span>
        </div>
        {/* Line 2: Most important context */}
        <div style={{
          fontSize: "0.78rem", fontWeight: isUrgent ? 600 : 400,
          color:    isUrgent ? RED : MID,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
        }}>
          {ctx}
        </div>
      </div>

      {/* Single primary action */}
      <button
        onClick={e => { e.stopPropagation(); setLocation(dest); }}
        style={{
          flexShrink:   0,
          padding:      "6px 11px",
          borderRadius: 7,
          border:       "none",
          background:   isUrgent ? RED : BEIGE,
          color:        isUrgent ? WHITE : INK,
          fontWeight:   700,
          fontSize:     "0.72rem",
          cursor:       "pointer",
          whiteSpace:   "nowrap" as const,
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WGYBSection — named export
   "We Got Your Back" compact list: max 3 action items
═══════════════════════════════════════════════════════════════════ */
export function WGYBSection() {
  const [scores, setScores] = useState<RecipientHealthScore[] | null>(null);

  useEffect(() => {
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;
    fetch("/api/v2/recipient-health", { headers })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((data: { scores: RecipientHealthScore[] }) => setScores(data.scores))
      .catch(() => setScores([]));
  }, []);

  if (!scores || scores.length === 0) return null;

  const items: string[] = [];

  // Priority items first
  for (const s of scores) {
    if (items.length >= 3) break;
    if (s.status !== "Priority" && s.status !== "NeedsAttention") continue;
    const sentence = wgybSentence(s);
    if (sentence) items.push(sentence);
  }

  if (items.length === 0) return null;

  return (
    <div style={{
      marginBottom:  16,
      background:    WHITE,
      borderRadius:  12,
      border:        `1px solid ${BORDER}`,
      padding:       "14px 18px",
    }}>
      <div style={{
        fontFamily:    "'Bebas Neue', cursive",
        fontSize:      "0.82rem",
        letterSpacing: "0.1em",
        color:         MID,
        marginBottom:  10,
      }}>
        WE GOT YOUR BACK
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 7 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontSize: "0.55rem", color: MID, marginTop: 4, flexShrink: 0 }}>●</span>
            <span style={{ fontSize: "0.86rem", color: INK, lineHeight: 1.45 }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   RelationshipHealthSection — default export
   Grouped compact recipient rows (people-first, no scores shown)
═══════════════════════════════════════════════════════════════════ */
export default function RelationshipHealthSection({ isMobile: _isMobile }: { isMobile: boolean }) {
  const [scores,  setScores]  = useState<RecipientHealthScore[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) { setLoading(false); return; }
    fetch("/api/v2/recipient-health", { headers })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((data: { scores: RecipientHealthScore[] }) => setScores(data.scores))
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: "16px 0", fontSize: "0.86rem", color: MID }}>Loading…</div>
  );

  if (!scores || scores.length === 0) return null;

  const groups: Record<RecipientHealthScore["status"], RecipientHealthScore[]> = {
    Priority:       scores.filter(s => s.status === "Priority"),
    NeedsAttention: scores.filter(s => s.status === "NeedsAttention"),
    Healthy:        scores.filter(s => s.status === "Healthy"),
    Excellent:      scores.filter(s => s.status === "Excellent"),
  };

  return (
    <div>
      {(["Priority", "NeedsAttention", "Healthy", "Excellent"] as const).map(status => {
        const group = groups[status];
        if (group.length === 0) return null;
        const cfg = STATUS_CONFIG[status];
        return (
          <div key={status} style={{ marginBottom: 20 }}>
            {/* Simple group header */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
              <span style={{
                fontFamily:    "'Bebas Neue', cursive",
                fontSize:      "0.82rem",
                letterSpacing: "0.08em",
                color:         MID,
              }}>
                {cfg.label}
              </span>
              <span style={{ fontSize: "0.76rem", color: MID, fontWeight: 600 }}>({group.length})</span>
            </div>
            {/* Compact rows */}
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 5 }}>
              {group.map(score => (
                <RecipientRow key={score.recipientId} score={score} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
