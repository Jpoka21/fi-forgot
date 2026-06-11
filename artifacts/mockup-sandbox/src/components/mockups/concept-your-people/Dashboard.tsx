// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";
const CREAM = "#FDF7EF";

type HealthLevel = "excellent" | "healthy" | "needs-attention" | "priority";

const healthConfig: Record<HealthLevel, { ring: string; label: string; pct: number }> = {
  "excellent":       { ring: "#2D6A4F", label: "Excellent",        pct: 92 },
  "healthy":         { ring: SAGE,      label: "Healthy",           pct: 74 },
  "needs-attention": { ring: "#D97706", label: "Needs Attention",   pct: 48 },
  "priority":        { ring: RED,       label: "Priority",          pct: 38 },
};

const people: { name: string; emoji: string; rel: string; health: HealthLevel; nextEvent: string; nextDays: number; action: string; priority?: boolean }[] = [
  { name: "Sarah",  emoji: "👩",  rel: "Sister",  health: "excellent",       nextEvent: "Anniversary",  nextDays: 8,  action: "Review Draft →" },
  { name: "Mom",    emoji: "💛",  rel: "Mother",  health: "needs-attention",  nextEvent: "Mother's Day", nextDays: 15, action: "Add Details →" },
  { name: "Steve",  emoji: "🤝",  rel: "Friend",  health: "healthy",          nextEvent: "Birthday",     nextDays: 3,  action: "Review Draft →" },
  { name: "Marcus", emoji: "🧢",  rel: "Friend",  health: "priority",         nextEvent: "Birthday",     nextDays: 3,  action: "Write Card →",   priority: true },
  { name: "Dad",    emoji: "👔",  rel: "Father",  health: "healthy",          nextEvent: "Father's Day", nextDays: 28, action: "View →" },
  { name: "Jenny",  emoji: "💼",  rel: "Client",  health: "excellent",        nextEvent: "Work Anniv",   nextDays: 45, action: "View →" },
];

function HealthRing({ health, size = 48 }: { health: HealthLevel; size?: number }) {
  const { ring, pct } = healthConfig[health];
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${ring}22`} strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ring} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={size < 60 ? 9 : 11} fill={ring} fontWeight="700">{pct}%</text>
    </svg>
  );
}

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh", color: BLACK }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: WHITE, letterSpacing: "0.06em", flex: 1 }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px" }}>
        {/* Summary strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: "12px 20px", background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#D97706" }} />
          </div>
          <span style={{ fontSize: "0.85rem", color: GRAY }}>
            <strong style={{ color: BLACK }}>5 people healthy</strong> · <strong style={{ color: "#D97706" }}>1 needs attention</strong>
          </span>
          <div style={{ marginLeft: "auto" }}>
            <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>+ Add Person</button>
          </div>
        </div>

        {/* Person cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {people.map((p, i) => {
            const cfg = healthConfig[p.health];
            return (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: hovered === i ? "#FFFAF5" : WHITE,
                  borderRadius: 16,
                  padding: "20px",
                  border: `1.5px solid ${p.priority ? RED : BORDER}`,
                  borderLeft: p.priority ? `4px solid ${RED}` : `1.5px solid ${BORDER}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1 }}>{p.name}</span>
                      <span style={{ padding: "2px 8px", borderRadius: 20, background: `${BLACK}08`, fontSize: "0.72rem", fontWeight: 600, color: GRAY }}>{p.rel}</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: GRAY }}>last updated 3 days ago</div>
                  </div>
                  <HealthRing health={p.health} size={52} />
                </div>

                {/* Health label */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: cfg.ring, background: `${cfg.ring}15`, padding: "3px 10px", borderRadius: 20, border: `1px solid ${cfg.ring}30` }}>{cfg.label}</span>
                  <span style={{ fontSize: "0.78rem", color: GRAY }}>{p.nextEvent} in {p.nextDays} days</span>
                </div>

                {/* Action */}
                <button style={{ width: "100%", padding: "9px", borderRadius: 9, border: `1.5px solid ${p.priority ? RED : BORDER}`, background: p.priority ? RED : "transparent", color: p.priority ? WHITE : BLACK, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                  {p.action}
                </button>
              </div>
            );
          })}

          {/* Add Person */}
          <div style={{ borderRadius: 16, padding: "20px", border: `1.5px dashed ${SAGE}50`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 180 }}>
            <span style={{ fontSize: "2rem", color: SAGE }}>+</span>
            <span style={{ fontWeight: 600, color: SAGE, fontSize: "0.9rem" }}>Add Person</span>
          </div>
        </div>
      </div>
    </div>
  );
}
