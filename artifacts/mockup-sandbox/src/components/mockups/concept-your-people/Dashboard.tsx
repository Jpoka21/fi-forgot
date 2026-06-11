// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

type HealthLevel = "Excellent" | "Healthy" | "Needs Attention" | "Priority";

const PEOPLE: {
  name: string; emoji: string; rel: string; health: HealthLevel;
  pct: number; nextEvent: string; nextDays: number; action: string;
  lastUpdated: number; priority?: boolean;
}[] = [
  { name: "Sarah",  emoji: "👩", rel: "Sister",  health: "Excellent",       pct: 92, nextEvent: "Anniversary",   nextDays: 8,  action: "Review Draft →",  lastUpdated: 2 },
  { name: "Mom",    emoji: "💛", rel: "Mother",  health: "Needs Attention",  pct: 58, nextEvent: "Mother's Day",  nextDays: 15, action: "Add Details →",   lastUpdated: 30 },
  { name: "Steve",  emoji: "🤝", rel: "Friend",  health: "Healthy",          pct: 76, nextEvent: "Birthday",      nextDays: 3,  action: "Review Draft →",  lastUpdated: 5 },
  { name: "Marcus", emoji: "🧢", rel: "Friend",  health: "Priority",         pct: 45, nextEvent: "Birthday",      nextDays: 3,  action: "Write Card →",    lastUpdated: 14, priority: true },
  { name: "Dad",    emoji: "👔", rel: "Father",  health: "Healthy",          pct: 80, nextEvent: "Father's Day",  nextDays: 28, action: "View →",          lastUpdated: 7 },
  { name: "Jenny",  emoji: "💼", rel: "Client",  health: "Excellent",        pct: 95, nextEvent: "Work Anniv",    nextDays: 45, action: "View →",          lastUpdated: 1 },
];

const HEALTH_COLORS: Record<HealthLevel, string> = {
  "Excellent":      SAGE,
  "Healthy":        SAGE,
  "Needs Attention": AMBER,
  "Priority":       RED,
};

const HEALTH_BG: Record<HealthLevel, string> = {
  "Excellent":      `${SAGE}18`,
  "Healthy":        `${SAGE}14`,
  "Needs Attention": `${AMBER}18`,
  "Priority":       `${RED}15`,
};

function HealthRing({ pct, color, size = 52 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}20`} strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill={color}>{pct}%</text>
    </svg>
  );
}

export function Dashboard() {
  const [hov, setHov] = useState<string | null>(null);

  const healthy = PEOPLE.filter(p => p.health === "Healthy" || p.health === "Excellent").length;
  const needsAttn = PEOPLE.filter(p => p.health === "Needs Attention" || p.health === "Priority").length;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* NAV */}
      <div style={{ background: BLACK, padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: "0.05em" }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      {/* SUMMARY STRIP */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
        <span style={{ fontSize: "0.82rem", color: BLACK, fontWeight: 600 }}>{healthy} people healthy</span>
        <span style={{ color: BORDER, fontWeight: 300 }}>·</span>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: RED }} />
        <span style={{ fontSize: "0.82rem", color: BLACK, fontWeight: 600 }}>{needsAttn} need{needsAttn !== 1 ? "s" : ""} attention</span>
      </div>

      <div style={{ padding: "24px 24px 40px", maxWidth: 900, margin: "0 auto" }}>

        {/* PEOPLE GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {PEOPLE.map(p => {
            const hc = HEALTH_COLORS[p.health];
            return (
              <div
                key={p.name}
                onMouseEnter={() => setHov(p.name)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: WHITE,
                  borderRadius: 18,
                  padding: "20px 20px 18px",
                  border: p.priority ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                  borderLeft: p.priority ? `5px solid ${RED}` : `1.5px solid ${BORDER}`,
                  boxShadow: hov === p.name ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>{p.emoji}</div>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1 }}>{p.name.toUpperCase()}</div>
                      <span style={{ padding: "3px 10px", borderRadius: 20, background: `${BLACK}10`, color: BLACK, fontSize: "0.68rem", fontWeight: 700 }}>{p.rel}</span>
                    </div>
                  </div>
                  <HealthRing pct={p.pct} color={hc} size={54} />
                </div>
                <div>
                  <span style={{ padding: "3px 10px", borderRadius: 20, background: HEALTH_BG[p.health], color: hc, fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.04em" }}>
                    {p.health}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.75rem", color: GRAY, flex: 1 }}>
                    {p.nextEvent} in <strong style={{ color: p.nextDays <= 7 ? RED : BLACK }}>{p.nextDays} days</strong>
                  </span>
                  <span style={{ fontSize: "0.65rem", color: `${GRAY}80` }}>Updated {p.lastUpdated}d ago</span>
                </div>
                <button style={{
                  width: "100%", padding: "10px 0", borderRadius: 10,
                  background: p.priority ? RED : "none",
                  border: p.priority ? "none" : `1.5px solid ${BORDER}`,
                  color: p.priority ? WHITE : BLACK,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                }}>
                  {p.action}
                </button>
              </div>
            );
          })}

          {/* Add Person */}
          <div style={{ borderRadius: 18, border: `2px dashed ${SAGE}55`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", minHeight: 160, padding: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2px dashed ${SAGE}80`, display: "flex", alignItems: "center", justifyContent: "center", color: SAGE, fontSize: "1.4rem", fontWeight: 700 }}>+</div>
            <span style={{ fontSize: "0.8rem", color: SAGE, fontWeight: 600 }}>Add Person</span>
          </div>
        </div>

      </div>
    </div>
  );
}
