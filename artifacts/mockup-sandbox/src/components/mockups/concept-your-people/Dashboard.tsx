// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

type HealthStatus = "Excellent" | "Healthy" | "NeedsAttention" | "Priority";

const people = [
  { emoji: "👩", name: "Sarah",  rel: "Sister",  health: "Excellent"      as HealthStatus, score: 91, nextEvent: "Anniversary in 8 days",  action: "Review Draft →",  priority: false },
  { emoji: "💛", name: "Mom",    rel: "Mother",  health: "NeedsAttention" as HealthStatus, score: 58, nextEvent: "Mother's Day in 15 days", action: "Add Details →",  priority: false },
  { emoji: "🤝", name: "Steve",  rel: "Friend",  health: "Healthy"        as HealthStatus, score: 74, nextEvent: "Birthday in 3 days",      action: "Review Draft →",  priority: false },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  health: "Priority"       as HealthStatus, score: 42, nextEvent: "Birthday in 3 days",      action: "Write Card →",    priority: true  },
  { emoji: "👔", name: "Dad",    rel: "Father",  health: "Healthy"        as HealthStatus, score: 77, nextEvent: "Father's Day in 28 days", action: "View →",          priority: false },
  { emoji: "💼", name: "Jenny",  rel: "Client",  health: "Excellent"      as HealthStatus, score: 88, nextEvent: "Work Anniv in 45 days",   action: "View →",          priority: false },
];

const healthRingColor: Record<HealthStatus, string> = {
  Excellent: "#166534", Healthy: SAGE, NeedsAttention: AMBER, Priority: RED,
};

function HealthRing({ score, status }: { score: number; status: HealthStatus }) {
  const r = 20, c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <svg width={52} height={52} viewBox="0 0 52 52">
      <circle cx={26} cy={26} r={r} fill="none" stroke={BORDER} strokeWidth={4} />
      <circle cx={26} cy={26} r={r} fill="none" stroke={healthRingColor[status]} strokeWidth={4}
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 26 26)" />
      <text x={26} y={30} textAnchor="middle" fontSize={10} fontWeight={700} fill={healthRingColor[status]} fontFamily="'Plus Jakarta Sans', sans-serif">{score}%</text>
    </svg>
  );
}

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: WHITE, letterSpacing: "0.05em", flex: 1 }}>YOUR PEOPLE</div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: "0.05em" }}>F.I. FORGOT</div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 20px" }}>
        {/* Summary strip */}
        <div style={{ background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
            <span style={{ fontSize: "0.78rem", color: BLACK, fontWeight: 600 }}>5 people healthy</span>
          </div>
          <div style={{ color: BORDER, fontSize: "0.9rem" }}>·</div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: RED }} />
            <span style={{ fontSize: "0.78rem", color: BLACK, fontWeight: 600 }}>1 needs attention</span>
          </div>
        </div>

        {/* People grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 12 }}>
          {people.map((p, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: WHITE, borderRadius: 14,
                border: `1px solid ${p.priority ? RED + "40" : BORDER}`,
                borderLeft: p.priority ? `4px solid ${RED}` : `1px solid ${BORDER}`,
                padding: "16px",
                boxShadow: p.priority ? `0 3px 14px ${RED}18` : hovered === i ? "0 2px 10px rgba(0,0,0,0.07)" : "none",
                transition: "box-shadow 0.15s", cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                {/* Avatar */}
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: CREAM, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{p.emoji}</div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: BLACK, lineHeight: 1, marginBottom: 4 }}>{p.name}</div>
                  <span style={{ background: BLACK, color: WHITE, fontSize: "0.65rem", fontWeight: 700, borderRadius: 20, padding: "2px 8px" }}>{p.rel}</span>
                </div>
                {/* Health ring */}
                <HealthRing score={p.score} status={p.health} />
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: "0.76rem", color: GRAY, marginBottom: 8 }}>last updated 3 days ago</div>
                <div style={{
                  display: "inline-block", padding: "4px 10px", borderRadius: 20,
                  background: healthRingColor[p.health] + "18",
                  color: healthRingColor[p.health],
                  fontSize: "0.7rem", fontWeight: 700, marginBottom: 10,
                }}>{p.nextEvent}</div>
              </div>

              <button style={{
                width: "100%", padding: "9px", borderRadius: 9, border: "none",
                background: p.priority ? RED : BLACK,
                color: WHITE, fontWeight: 700, fontSize: "0.78rem",
                cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>{p.action}</button>
            </div>
          ))}
          {/* Add person */}
          <div style={{ background: CREAM, borderRadius: 14, border: `2px dashed ${SAGE}70`, padding: "16px", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", minHeight: 140, cursor: "pointer" }}>
            <div style={{ fontSize: "1.8rem", color: SAGE, marginBottom: 6 }}>+</div>
            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: SAGE }}>Add Person</div>
          </div>
        </div>
      </div>
    </div>
  );
}
