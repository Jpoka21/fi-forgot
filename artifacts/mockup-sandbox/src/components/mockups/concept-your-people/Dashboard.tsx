// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3"; const RED = "#E23B2E"; const BLACK = "#111111";
const SAGE = "#5B8C6B"; const GRAY = "#6B6B6B"; const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF"; const CREAM = "#FDF7EF";

type PersonCard = {
  name: string; rel: string; emoji: string;
  ringPct: number; ringColor: string; ringLabel: string;
  nextEvent: string; daysAway: number; lastUpdated: string;
  action: string; priority?: boolean;
};

const people: PersonCard[] = [
  { name: "Sarah",  rel: "Sister",  emoji: "👩", ringPct: 82, ringColor: SAGE,      ringLabel: "Excellent",  nextEvent: "Anniversary",    daysAway: 8,  lastUpdated: "2 days ago",   action: "Review Draft →" },
  { name: "Mom",    rel: "Mother",  emoji: "💛", ringPct: 55, ringColor: "#F59E0B", ringLabel: "Needs Attn", nextEvent: "Mother's Day",   daysAway: 15, lastUpdated: "3 weeks ago",  action: "Add Details →" },
  { name: "Steve",  rel: "Friend",  emoji: "🤝", ringPct: 74, ringColor: SAGE,      ringLabel: "Healthy",    nextEvent: "Birthday",       daysAway: 3,  lastUpdated: "5 days ago",   action: "Review Draft →" },
  { name: "Marcus", rel: "Friend",  emoji: "🧢", ringPct: 41, ringColor: RED,       ringLabel: "Priority",   nextEvent: "Birthday",       daysAway: 3,  lastUpdated: "6 weeks ago",  action: "Write Card →",   priority: true },
  { name: "Dad",    rel: "Father",  emoji: "👔", ringPct: 68, ringColor: SAGE,      ringLabel: "Healthy",    nextEvent: "Father's Day",   daysAway: 28, lastUpdated: "1 week ago",   action: "View →" },
  { name: "Jenny",  rel: "Client",  emoji: "💼", ringPct: 88, ringColor: "#1B6B4E", ringLabel: "Excellent",  nextEvent: "Work Anniv",     daysAway: 45, lastUpdated: "4 days ago",   action: "View →" },
];

function HealthRing({ pct, color, label, size = 52 }: { pct: number; color: string; label: string; size?: number }) {
  const r = size * 0.36; const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  const cx = size / 2; const cy = size / 2;
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}22`} strokeWidth={size * 0.1} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.1}
          strokeDasharray={`${c}`} strokeDashoffset={`${offset}`} strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: "0.6rem", fontWeight: 700, color, letterSpacing: "0.04em" }}>{label}</span>
    </div>
  );
}

export function Dashboard() {
  const [_x, _setX] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      {/* NAV */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: "0.04em" }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", color: RED, letterSpacing: "0.08em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 64px", boxSizing: "border-box" as const }}>

        {/* SUMMARY STRIP */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, padding: "10px 16px", background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[SAGE, SAGE, SAGE, SAGE, SAGE, "#F59E0B"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{ fontSize: "0.82rem", color: GRAY, fontWeight: 500 }}>5 people healthy</span>
          <span style={{ color: BORDER, fontSize: "0.9rem" }}>·</span>
          <span style={{ fontSize: "0.82rem", color: RED, fontWeight: 700 }}>1 needs attention</span>
        </div>

        {/* PEOPLE CARDS GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {people.map(p => (
            <div key={p.name} style={{
              background: WHITE, borderRadius: 14, padding: "18px 18px 16px",
              border: `1px solid ${p.priority ? `${RED}40` : BORDER}`,
              borderLeft: p.priority ? `4px solid ${RED}` : `1px solid ${BORDER}`,
              cursor: "pointer", position: "relative" as const,
              boxShadow: p.priority ? `0 2px 12px ${RED}15` : "none",
            }}>
              {/* Top row: emoji + ring */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: p.priority ? `${RED}10` : CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", border: `1px solid ${BORDER}` }}>
                    {p.emoji}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.04em", color: BLACK, lineHeight: 1 }}>{p.name}</div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${BLACK}0C`, color: GRAY }}>{p.rel}</span>
                  </div>
                </div>
                <HealthRing pct={p.ringPct} color={p.ringColor} label={p.ringLabel} size={52} />
              </div>
              {/* Next event */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: BLACK }}>{p.nextEvent}</span>
                <span style={{ fontSize: "0.7rem", padding: "1px 8px", borderRadius: 20, background: p.daysAway <= 7 ? `${RED}12` : CREAM, color: p.daysAway <= 7 ? RED : GRAY, fontWeight: 700, border: `1px solid ${p.daysAway <= 7 ? `${RED}30` : BORDER}` }}>{p.daysAway}d</span>
              </div>
              {/* Last updated */}
              <div style={{ fontSize: "0.68rem", color: GRAY, marginBottom: 12 }}>Last updated {p.lastUpdated}</div>
              {/* Action */}
              <button style={{ width: "100%", padding: "8px", borderRadius: 9, border: "none", background: p.priority ? RED : `${BLACK}0C`, color: p.priority ? WHITE : BLACK, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {p.action}
              </button>
            </div>
          ))}
          {/* Add Person */}
          <div style={{ background: "transparent", borderRadius: 14, border: `2px dashed ${SAGE}55`, cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 6, minHeight: 180 }}>
            <span style={{ fontSize: "1.8rem", color: SAGE }}>＋</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: SAGE }}>Add Person</span>
          </div>
        </div>

      </div>
    </div>
  );
}
