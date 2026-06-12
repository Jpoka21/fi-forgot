// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

type Health = "Excellent" | "Healthy" | "Needs Attention" | "Priority";

const personCards: {
  emoji: string; name: string; rel: string; health: Health; ring: string;
  nextEvent: string; daysAway: number; action: string; priority?: boolean;
}[] = [
  { emoji: "👩", name: "Sarah",  rel: "Sister",  health: "Excellent",       ring: "#3d7a59", nextEvent: "Anniversary",  daysAway: 8,  action: "Review Draft →" },
  { emoji: "💛", name: "Mom",    rel: "Mother",  health: "Needs Attention", ring: "#B45309", nextEvent: "Mother's Day", daysAway: 15, action: "Add Details →" },
  { emoji: "🤝", name: "Steve",  rel: "Friend",  health: "Healthy",         ring: SAGE,      nextEvent: "Birthday",     daysAway: 3,  action: "Review Draft →" },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  health: "Priority",        ring: RED,       nextEvent: "Birthday",     daysAway: 3,  action: "Write Card →",  priority: true },
  { emoji: "👔", name: "Dad",    rel: "Father",  health: "Healthy",         ring: SAGE,      nextEvent: "Father's Day", daysAway: 28, action: "View →" },
  { emoji: "💼", name: "Jenny",  rel: "Client",  health: "Excellent",       ring: "#3d7a59", nextEvent: "Work Anniv",   daysAway: 45, action: "View →" },
];

function healthChipStyle(h: Health) {
  if (h === "Excellent")       return { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" };
  if (h === "Healthy")         return { bg: `${SAGE}18`, color: SAGE, border: `${SAGE}44` };
  if (h === "Needs Attention") return { bg: "#FFF3CD", color: "#B45309", border: "#FDE68A" };
  return { bg: `${RED}12`, color: RED, border: `${RED}44` };
}

function HealthRing({ color, pct }: { color: string; pct: number }) {
  const r = 22, cx = 26, cy = 26, circ = 2 * Math.PI * r;
  return (
    <svg width={52} height={52} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}22`} strokeWidth={4} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fontWeight="700" fill={color} fontFamily="'Plus Jakarta Sans', sans-serif">{pct}%</text>
    </svg>
  );
}

const ringPct: Record<string, number> = { Sarah: 82, Mom: 51, Steve: 74, Marcus: 68, Dad: 77, Jenny: 90 };
const lastUpdated: Record<string, string> = { Sarah: "2 days ago", Mom: "18 days ago", Steve: "5 days ago", Marcus: "1 day ago", Dad: "3 days ago", Jenny: "4 days ago" };

export function Dashboard() {
  const [_h, setH] = useState<string | null>(null);
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: WHITE, letterSpacing: "0.04em" }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "22px 20px" }}>

        {/* Summary strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, padding: "10px 16px", background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}` }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#B45309" }} />
          <span style={{ fontSize: "0.8rem", color: BLACK, marginLeft: 6 }}><strong>5 people healthy</strong> · <span style={{ color: "#B45309", fontWeight: 600 }}>1 needs attention</span></span>
        </div>

        {/* Person cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          {personCards.map(p => {
            const cs = healthChipStyle(p.health);
            return (
              <div
                key={p.name}
                onMouseEnter={() => setH(p.name)}
                onMouseLeave={() => setH(null)}
                style={{
                  background: WHITE, borderRadius: 16, padding: "18px 18px 14px",
                  border: p.priority ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                  borderLeft: p.priority ? `4px solid ${RED}` : undefined,
                  boxShadow: p.priority ? `0 4px 20px ${RED}18` : "0 1px 6px rgba(0,0,0,0.05)",
                  display: "flex", flexDirection: "column", gap: 0,
                }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.55rem", flexShrink: 0 }}>{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1 }}>{p.name.toUpperCase()}</div>
                    <span style={{ display: "inline-block", background: `${BLACK}10`, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "2px 10px", fontSize: "0.68rem", fontWeight: 600, color: GRAY, marginTop: 4 }}>{p.rel}</span>
                  </div>
                  <HealthRing color={p.ring} pct={ringPct[p.name] ?? 75} />
                </div>

                {/* Health chip */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ background: cs.bg, border: `1px solid ${cs.border}`, borderRadius: 20, padding: "3px 10px", fontSize: "0.68rem", fontWeight: 700, color: cs.color }}>{p.health}</span>
                  <span style={{ fontSize: "0.65rem", color: GRAY }}>· updated {lastUpdated[p.name]}</span>
                </div>

                {/* Next event */}
                <div style={{ padding: "8px 10px", borderRadius: 10, background: CREAM, border: `1px solid ${BORDER}`, marginBottom: 12 }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, color: BLACK }}>{p.nextEvent}</span>
                  <span style={{ fontSize: "0.68rem", color: GRAY }}> · {p.daysAway} days away</span>
                </div>

                {/* Action button */}
                <button style={{
                  width: "100%", padding: "8px 0", borderRadius: 9, border: "none", cursor: "pointer",
                  background: p.priority ? RED : BLACK, color: WHITE,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.78rem",
                }}>
                  {p.action}
                </button>
              </div>
            );
          })}

          {/* Add Person */}
          <div style={{ background: "none", borderRadius: 16, padding: "18px", border: `1.5px dashed ${SAGE}55`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", minHeight: 140 }}>
            <div style={{ fontSize: "1.8rem", color: SAGE }}>＋</div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: SAGE }}>Add Person</div>
          </div>
        </div>

      </div>
    </div>
  );
}
