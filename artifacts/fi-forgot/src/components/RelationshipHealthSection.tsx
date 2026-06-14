/**
 * RelationshipHealthSection — compact people list with expandable rows
 *
 * Tap a row body → expand inline quick actions (questions, add event, new update)
 * Tap the action button directly → immediate primary action
 *
 * Data: GET /api/v2/recipient-health (unchanged)
 */

import { useState, useEffect, type MouseEvent } from "react";
import { useLocation } from "wouter";
import { getApiHeaders, getRecipients } from "@/lib/data";

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

/* ── Local-ID resolver ───────────────────────────────────────────── */
/**
 * Build a name → local Recipient ID lookup map from localStorage.
 * The API's recipientId may drift from localStorage IDs (UUID vs timestamp),
 * so we always resolve navigation targets through this map.
 */
function buildLocalMap(): Map<string, string> {
  const map = new Map<string, string>();
  try {
    for (const r of getRecipients()) {
      if (r.name && r.id) map.set(r.name.trim().toLowerCase(), r.id);
    }
  } catch { /* non-blocking */ }
  return map;
}

function resolveId(score: RecipientHealthScore, localMap: Map<string, string>): string {
  return localMap.get(score.name.trim().toLowerCase()) ?? score.recipientId;
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function avatar(name: string): string {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function actionDestination(score: RecipientHealthScore, localMap: Map<string, string>): string {
  const id = resolveId(score, localMap);
  if (score.actionType === "card") return `/try?recipientId=${id}`;
  return `/relationship/${id}`;
}

function briefingDest(score: RecipientHealthScore, localMap: Map<string, string>): string {
  const id = resolveId(score, localMap);
  if (score.nextEventLabel) {
    return `/briefings/${id}/${encodeURIComponent(score.nextEventLabel)}`;
  }
  return `/recipients/${id}?from=dashboard`;
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
function RecipientRow({ score, localMap }: { score: RecipientHealthScore; localMap: Map<string, string> }) {
  const [, setLocation] = useLocation();
  const [expanded, setExpanded] = useState(false);

  const localId     = resolveId(score, localMap);
  const cfg         = STATUS_CONFIG[score.status];
  const actionLabel = ACTION_LABELS[score.actionType] ?? "View";
  const dest        = actionDestination(score, localMap);
  const ctx         = contextLine(score);
  const isUrgent    = score.status === "Priority";

  function nav(e: MouseEvent, path: string) {
    e.stopPropagation();
    setLocation(path);
  }

  return (
    <div style={{
      background:   WHITE,
      borderRadius: 12,
      border:       `1px solid ${expanded ? INK + "22" : BORDER}`,
      borderLeft:   `3px solid ${cfg.color}`,
      overflow:     "hidden",
      boxSizing:    "border-box" as const,
    }}>
      {/* ── Main row ───────────────────────────────────────── */}
      <div style={{
        display:    "flex",
        alignItems: "center",
        gap:        10,
        padding:    "11px 12px",
        minHeight:  72,
      }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: "50%", background: INK, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.88rem", color: WHITE }}>
            {avatar(score.name)}
          </span>
        </div>

        {/* Text content — tapping this area navigates to profile */}
        <div
          onClick={e => nav(e, `/recipients/${localId}?from=dashboard`)}
          style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 3 }}>
            <span style={{ fontWeight: 700, fontSize: "0.92rem", color: INK }}>{score.name}</span>
            <span style={{ fontSize: "0.72rem", color: MID }}>· {score.relationshipType}</span>
          </div>
          <div style={{
            fontSize:     "0.78rem",
            fontWeight:   isUrgent ? 600 : 400,
            color:        isUrgent ? RED : MID,
            overflow:     "hidden",
            textOverflow: "ellipsis",
            whiteSpace:   "nowrap" as const,
          }}>
            {ctx}
          </div>
        </div>

        {/* Primary action button */}
        <button
          onClick={e => nav(e, dest)}
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

        {/* ⋯ More button — clearly tappable, 40×40 touch target */}
        <button
          onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
          style={{
            flexShrink:      0,
            width:           36,
            height:          36,
            borderRadius:    8,
            border:          `1px solid ${expanded ? INK + "30" : BORDER}`,
            background:      expanded ? `${INK}08` : "transparent",
            color:           MID,
            cursor:          "pointer",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            fontSize:        "1rem",
            letterSpacing:   "0.05em",
            lineHeight:      1,
          }}
          aria-label="More actions"
          aria-expanded={expanded}
        >
          {expanded ? "✕" : "···"}
        </button>
      </div>

      {/* ── Expanded quick-action panel ────────────────────── */}
      {expanded && (
        <div style={{
          borderTop:  `1px solid ${BORDER}`,
          padding:    "12px 14px 14px",
          background: BEIGE,
          display:    "flex",
          flexWrap:   "wrap" as const,
          gap:        8,
        }}>
          {/* Improve the card — answer questions */}
          <button
            onClick={e => nav(e, briefingDest(score, localMap))}
            style={actionPill(false)}
          >
            ✍️ Improve the card
          </button>

          {/* Add occasion / event */}
          <button
            onClick={e => nav(e, `/recipients/${localId}?from=dashboard&tab=events`)}
            style={actionPill(false)}
          >
            🗓 Add occasion
          </button>

          {/* Share something new */}
          <button
            onClick={e => nav(e, `/recipients/${localId}?from=dashboard`)}
            style={actionPill(false)}
          >
            💬 Share something new
          </button>

          {/* View full profile */}
          <button
            onClick={e => nav(e, `/recipients/${localId}?from=dashboard`)}
            style={actionPill(true)}
          >
            View profile →
          </button>
        </div>
      )}
    </div>
  );
}

function actionPill(ghost: boolean) {
  return {
    padding:      "8px 14px",
    borderRadius: 20,
    border:       ghost ? `1px solid ${BORDER}` : "none",
    background:   ghost ? "transparent" : WHITE,
    color:        ghost ? MID : INK,
    fontWeight:   600,
    fontSize:     "0.8rem",
    cursor:       "pointer",
    whiteSpace:   "nowrap" as const,
    boxShadow:    ghost ? "none" : "0 1px 3px rgba(0,0,0,0.07)",
  };
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
  const [localMap, setLocalMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    setLocalMap(buildLocalMap());
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
                <RecipientRow key={score.recipientId} score={score} localMap={localMap} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
