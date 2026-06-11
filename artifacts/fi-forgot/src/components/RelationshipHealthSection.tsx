/**
 * RelationshipHealthSection
 *
 * Answers: "Who should I spend a few minutes on today?"
 *
 * Sections:
 *   1. Attention Panel  — summary chips (stale updates, pending follow-ups, upcoming events)
 *   2. Grouped Cards    — Priority → Needs Attention → Healthy → Excellent
 *   3. Insights         — lightweight stat tiles at the bottom
 *
 * Data: GET /api/v2/recipient-health (fetched once on mount)
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getApiHeaders } from "@/lib/data";

/* ── Brand constants ─────────────────────────────────────────────────── */
const BEIGE  = "#F2E6D3";
const RED    = "#E23B2E";
const INK    = "#1F1F1F";
const MID    = "#4B5563";
const WHITE  = "#FFFFFF";
const SAGE   = "#5B8C6B";
const BORDER = "#E5E0D8";
const AMBER  = "#D97706";

/* ── Types ───────────────────────────────────────────────────────────── */
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

/* ── Status config ───────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  Priority:       { label: "Priority",       color: RED,   bg: "#FFF0EF",  order: 0 },
  NeedsAttention: { label: "Needs Attention", color: AMBER, bg: "#FFF8EC",  order: 1 },
  Healthy:        { label: "Healthy",         color: SAGE,  bg: "#EDF7F1",  order: 2 },
  Excellent:      { label: "Excellent",       color: "#166534", bg: "#F0FDF4", order: 3 },
} as const;

/* ── Helpers ─────────────────────────────────────────────────────────── */
function avatar(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

function lastUpdateText(days: number | null): string {
  if (days === null) return "Never updated";
  if (days === 0)  return "Updated today";
  if (days === 1)  return "Updated yesterday";
  if (days < 30)   return `Updated ${days}d ago`;
  if (days < 60)   return "Updated last month";
  const months = Math.round(days / 30);
  if (months < 12) return `Updated ${months} month${months > 1 ? "s" : ""} ago`;
  return "Updated 1+ years ago";
}

function actionDestination(score: RecipientHealthScore): string {
  if (score.actionType === "card") return `/v2?recipientId=${score.recipientId}`;
  if (score.actionType === "review") return `/recipients/${score.recipientId}/timeline`;
  return `/recipients/${score.recipientId}?from=dashboard`;
}

/* ── Recipient Card ──────────────────────────────────────────────────── */
function RecipientCard({ score, isMobile }: { score: RecipientHealthScore; isMobile: boolean }) {
  const [, setLocation] = useLocation();
  const cfg = STATUS_CONFIG[score.status];

  return (
    <div style={{
      background: WHITE,
      border:     `1px solid ${BORDER}`,
      borderRadius: 16,
      padding:    isMobile ? "16px 14px" : "18px 20px",
      display:    "flex",
      gap:        14,
      alignItems: "flex-start",
      position:   "relative" as const,
    }}>
      {/* Status accent bar */}
      <div style={{
        position: "absolute",
        left: 0,
        top: 10,
        bottom: 10,
        width: 3,
        borderRadius: "0 3px 3px 0",
        background: cfg.color,
      }} />

      {/* Avatar */}
      <div style={{
        width: 42, height: 42, borderRadius: 11,
        background: INK, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginLeft: 4,
      }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", color: WHITE }}>
          {avatar(score.name)}
        </span>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Row 1: name + score + badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 4 }}>
          <span style={{ fontWeight: 800, fontSize: "0.95rem", color: INK }}>{score.name}</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: cfg.color }}>
            {score.score}
          </span>
          <span style={{
            fontSize: "0.65rem", fontWeight: 700,
            padding: "2px 8px", borderRadius: 10,
            background: cfg.bg, color: cfg.color,
            whiteSpace: "nowrap" as const,
          }}>
            {cfg.label}
          </span>
        </div>

        {/* Row 2: relationship */}
        <div style={{ fontSize: "0.76rem", color: MID, marginBottom: 6 }}>
          {score.relationshipType}
        </div>

        {/* Row 3: stats chips */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "4px 10px", marginBottom: 8 }}>
          {score.nextEventLabel && score.nextEventDaysAway !== null && (
            <span style={{ fontSize: "0.76rem", color: score.nextEventDaysAway <= 30 ? RED : MID, fontWeight: 600 }}>
              {score.nextEventLabel === "Birthday" ? "🎂" : "💕"} {score.nextEventLabel} in {score.nextEventDaysAway}d
            </span>
          )}
          <span style={{ fontSize: "0.76rem", color: score.lastUpdateDaysAgo === null || score.lastUpdateDaysAgo > 90 ? AMBER : MID }}>
            {lastUpdateText(score.lastUpdateDaysAgo)}
          </span>
          {score.pendingFollowUps > 0 && (
            <span style={{ fontSize: "0.76rem", color: "#2E6BE2", fontWeight: 600 }}>
              🔁 {score.pendingFollowUps} follow-up{score.pendingFollowUps > 1 ? "s" : ""} waiting
            </span>
          )}
        </div>

        {/* Row 4: recommended action */}
        <div style={{
          background: BEIGE,
          borderRadius: 8,
          padding: "7px 11px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap" as const,
        }}>
          <div>
            <span style={{ fontSize: "0.67rem", fontWeight: 700, color: MID, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
              Recommended Next Step
            </span>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: INK, marginTop: 1 }}>
              {score.recommendedAction}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" as const }}>
            <button
              onClick={() => setLocation(`/recipients/${score.recipientId}?action=add-memory`)}
              style={{
                background: "none",
                color:       SAGE,
                border:      `1.5px solid ${SAGE}50`,
                borderRadius: 8,
                padding:     "6px 12px",
                fontSize:    "0.74rem",
                fontWeight:  700,
                cursor:      "pointer",
                whiteSpace:  "nowrap" as const,
              }}
            >
              + Memory
            </button>
            <button
              onClick={() => setLocation(actionDestination(score))}
              style={{
                background: cfg.color,
                color:       WHITE,
                border:      "none",
                borderRadius: 8,
                padding:     "7px 14px",
                fontSize:    "0.78rem",
                fontWeight:  700,
                cursor:      "pointer",
                whiteSpace:  "nowrap" as const,
              }}
            >
              Take Action →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Group header ─────────────────────────────────────────────────────── */
function GroupHeader({ status, count }: { status: RecipientHealthScore["status"]; count: number }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, marginTop: 4 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      <span style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: "1rem",
        letterSpacing: "0.06em",
        color: cfg.color,
      }}>
        {cfg.label}
      </span>
      <span style={{ fontSize: "0.76rem", color: MID, fontWeight: 600 }}>
        {count} {count === 1 ? "person" : "people"}
      </span>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export default function RelationshipHealthSection({ isMobile }: { isMobile: boolean }) {
  const [scores,  setScores]  = useState<RecipientHealthScore[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) { setLoading(false); return; }

    fetch("/api/v2/recipient-health", { headers })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((data: { scores: RecipientHealthScore[] }) => {
        setScores(data.scores);
      })
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ background: WHITE, borderRadius: 16, padding: "28px 24px", border: `1px solid ${BORDER}`, textAlign: "center" as const }}>
      <div style={{ fontSize: "0.88rem", color: MID }}>Loading relationship health…</div>
    </div>
  );

  if (!scores || scores.length === 0) return null;

  /* ── Computed groupings ──────────────────────────────────────────── */
  const groups: Record<RecipientHealthScore["status"], RecipientHealthScore[]> = {
    Priority:       scores.filter(s => s.status === "Priority"),
    NeedsAttention: scores.filter(s => s.status === "NeedsAttention"),
    Healthy:        scores.filter(s => s.status === "Healthy"),
    Excellent:      scores.filter(s => s.status === "Excellent"),
  };

  const staleCount    = scores.filter(s => s.lastUpdateDaysAgo === null || s.lastUpdateDaysAgo > 90).length;
  const followUpCount = scores.filter(s => s.pendingFollowUps > 0).length;
  const eventSoonCount = scores.filter(s => s.nextEventDaysAway !== null && s.nextEventDaysAway <= 30).length;
  const attentionItems = [
    staleCount > 0     && { text: `${staleCount} ${staleCount === 1 ? "recipient needs" : "recipients need"} an update`,      emoji: "📝", color: AMBER },
    followUpCount > 0  && { text: `${followUpCount} follow-up ${followUpCount === 1 ? "question" : "questions"} waiting`,      emoji: "🔁", color: "#2E6BE2" },
    eventSoonCount > 0 && { text: `${eventSoonCount} ${eventSoonCount === 1 ? "event" : "events"} within 30 days`,             emoji: "📅", color: RED },
  ].filter(Boolean) as { text: string; emoji: string; color: string }[];

  const allHealthy = groups.Priority.length === 0 && groups.NeedsAttention.length === 0;

  /* ── Insights ──────────────────────────────────────────────────── */
  const mostUpdated = scores.find(s => s.lastUpdateDaysAgo !== null && s.lastUpdateDaysAgo === Math.min(...scores.filter(x => x.lastUpdateDaysAgo !== null).map(x => x.lastUpdateDaysAgo!)));
  const longestProfile = scores.reduce((best, s) => s.profilePct > (best?.profilePct ?? -1) ? s : best, null as RecipientHealthScore | null);
  const mostOverdue = scores.find(s => s.lastUpdateDaysAgo !== null && s.lastUpdateDaysAgo === Math.max(...scores.filter(x => x.lastUpdateDaysAgo !== null).map(x => x.lastUpdateDaysAgo!)));

  const insightTiles = [
    mostUpdated     && { label: "Most current",    value: mostUpdated.name,     sub: lastUpdateText(mostUpdated.lastUpdateDaysAgo)         },
    longestProfile  && { label: "Richest profile",  value: longestProfile.name,  sub: `${longestProfile.profilePct}% complete`              },
    mostOverdue && mostOverdue.lastUpdateDaysAgo && mostOverdue.lastUpdateDaysAgo > 30
      ? { label: "Oldest update",  value: mostOverdue.name,    sub: lastUpdateText(mostOverdue.lastUpdateDaysAgo) } : null,
  ].filter(Boolean) as { label: string; value: string; sub: string }[];

  return (
    <div style={{ marginBottom: isMobile ? 36 : 0 }}>

      {/* ── Section header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.65rem", letterSpacing: "0.02em", color: INK, margin: 0, lineHeight: 1 }}>
              Relationship Health
            </h2>
            <span style={{ fontSize: "1.1rem" }}>💚</span>
          </div>
          <p style={{ margin: "5px 0 0", fontSize: "0.84rem", color: MID }}>
            Who could use a few minutes today?
          </p>
        </div>
      </div>

      {/* ── Attention panel ── */}
      {attentionItems.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10, marginBottom: 20 }}>
          {attentionItems.map((item, i) => (
            <div key={i} style={{
              display:      "flex",
              alignItems:   "center",
              gap:          7,
              background:   WHITE,
              border:       `1.5px solid ${item.color}30`,
              borderRadius: 12,
              padding:      "9px 14px",
              fontSize:     "0.83rem",
              fontWeight:   600,
              color:        item.color,
              flexShrink:   0,
            }}>
              <span>{item.emoji}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty / all healthy ── */}
      {allHealthy && attentionItems.length === 0 && (
        <div style={{
          background:   WHITE,
          border:       `1px solid ${BORDER}`,
          borderRadius: 16,
          padding:      "32px 24px",
          textAlign:    "center" as const,
          marginBottom: 20,
        }}>
          <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>🍪</div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: SAGE, letterSpacing: "0.04em", marginBottom: 6 }}>
            Everything looks good
          </div>
          <p style={{ fontSize: "0.86rem", color: MID, margin: 0 }}>
            Your relationships are up to date.
          </p>
        </div>
      )}

      {/* ── Grouped cards ── */}
      {(["Priority", "NeedsAttention", "Healthy", "Excellent"] as const).map(status => {
        const group = groups[status];
        if (group.length === 0) return null;
        return (
          <div key={status} style={{ marginBottom: 20 }}>
            <GroupHeader status={status} count={group.length} />
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {group.map(score => (
                <RecipientCard key={score.recipientId} score={score} isMobile={isMobile} />
              ))}
            </div>
          </div>
        );
      })}

      {/* ── Insights ── */}
      {insightTiles.length > 0 && (
        <div style={{ marginTop: 8, marginBottom: 4 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: MID, textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 10 }}>
            Relationship Insights
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : `repeat(${insightTiles.length}, 1fr)`, gap: 10 }}>
            {insightTiles.map((tile, i) => (
              <div key={i} style={{
                background:   WHITE,
                border:       `1px solid ${BORDER}`,
                borderRadius: 12,
                padding:      "12px 14px",
              }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: MID, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 3 }}>
                  {tile.label}
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.9rem", color: INK, marginBottom: 2 }}>
                  {tile.value}
                </div>
                <div style={{ fontSize: "0.75rem", color: MID }}>
                  {tile.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
