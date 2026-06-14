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

type Ring = "excellent" | "needs-attention" | "healthy" | "priority";

const ringColors: Record<Ring, string> = {
  excellent: "#3D7A56",
  healthy: SAGE,
  "needs-attention": "#D97706",
  priority: RED,
};

const people = [
  { id: 1, emoji: "👩",  name: "Sarah",  rel: "Sister",  health: "excellent" as Ring,        pct: 88, nextEvent: "Anniversary",  nextDays: 8,  lastUpdated: 2,  action: "Review Draft →",  border: false },
  { id: 2, emoji: "💛",  name: "Mom",    rel: "Mother",  health: "needs-attention" as Ring,  pct: 54, nextEvent: "Mother's Day", nextDays: 15, lastUpdated: 21, action: "Add Details →",   border: false },
  { id: 3, emoji: "🤝",  name: "Steve",  rel: "Friend",  health: "healthy" as Ring,          pct: 72, nextEvent: "Birthday",     nextDays: 3,  lastUpdated: 5,  action: "Review Draft →",  border: false },
  { id: 4, emoji: "🧢",  name: "Marcus", rel: "Friend",  health: "priority" as Ring,         pct: 60, nextEvent: "Birthday",     nextDays: 3,  lastUpdated: 14, action: "Write Card →",    border: true  },
  { id: 5, emoji: "👔",  name: "Dad",    rel: "Father",  health: "healthy" as Ring,          pct: 76, nextEvent: "Father's Day", nextDays: 28, lastUpdated: 7,  action: "View →",          border: false },
  { id: 6, emoji: "💼",  name: "Jenny",  rel: "Client",  health: "excellent" as Ring,        pct: 91, nextEvent: "Work Anniv",   nextDays: 45, lastUpdated: 1,  action: "View →",          border: false },
];

function HealthRing({ pct, ring, size = 42 }: { pct: number; ring: Ring; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = ringColors[ring];
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BORDER} strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: WHITE, letterSpacing: 2 }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 18, color: RED, letterSpacing: 1.5 }}>F.I. FORGOT</span>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>
        {/* Summary strip */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "12px 20px", border: `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: BLACK }}>5 people healthy</span>
          </div>
          <div style={{ width: 1, height: 18, background: BORDER }} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: RED }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: RED }}>1 needs attention</span>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 16, color: GRAY, fontFamily: "'Caveat', cursive" }}>June 14, 2026</div>
        </div>

        {/* People grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 14 }}>
          {people.map((p) => {
            const col = ringColors[p.health];
            const isHov = hov === p.id;
            return (
              <div
                key={p.id}
                onMouseEnter={() => setHov(p.id)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: WHITE,
                  borderRadius: 16,
                  padding: "20px 20px 16px",
                  border: p.border ? `2px solid ${RED}` : `1.5px solid ${isHov ? "#C8C0B4" : BORDER}`,
                  borderLeft: p.border ? `5px solid ${RED}` : undefined,
                  boxShadow: isHov ? "0 6px 22px rgba(0,0,0,0.1)" : "0 1px 6px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  transition: "box-shadow 0.18s",
                  position: "relative",
                }}
              >
                {/* Top row: emoji + health ring */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    {p.emoji}
                  </div>
                  <div style={{ position: "relative", width: 42, height: 42 }}>
                    <HealthRing pct={p.pct} ring={p.health} size={42} />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: col }}>
                      {p.pct}%
                    </div>
                  </div>
                </div>

                {/* Name + rel */}
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: BLACK, letterSpacing: 1.5, lineHeight: 1 }}>{p.name.toUpperCase()}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                  <span style={{ background: col + "22", color: col, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, border: `1px solid ${col}44` }}>
                    {p.health === "needs-attention" ? "Needs Attention" : p.health.charAt(0).toUpperCase() + p.health.slice(1)}
                  </span>
                </div>

                {/* Next event */}
                <div style={{ background: CREAM, borderRadius: 8, padding: "8px 12px", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: BLACK }}>{p.nextEvent}</span>
                  <span style={{ fontSize: 12, color: p.nextDays <= 7 ? RED : GRAY, fontWeight: 700 }}>in {p.nextDays}d</span>
                </div>

                {/* Last updated */}
                <div style={{ fontSize: 11, color: GRAY, marginTop: 8 }}>last updated {p.lastUpdated} {p.lastUpdated === 1 ? "day" : "days"} ago</div>

                {/* Action */}
                <button style={{
                  marginTop: 12,
                  width: "100%",
                  background: p.health === "priority" ? RED : "transparent",
                  color: p.health === "priority" ? WHITE : BLACK,
                  border: p.health === "priority" ? "none" : `1.5px solid ${BORDER}`,
                  borderRadius: 9,
                  padding: "10px 0",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}>
                  {p.action}
                </button>
              </div>
            );
          })}

          {/* Add person */}
          <div style={{
            borderRadius: 16,
            border: `2px dashed ${SAGE}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
            color: SAGE,
            fontWeight: 700,
            fontSize: 15,
            minHeight: 120,
          }}>
            + Add Person
          </div>
        </div>
      </div>
    </div>
  );
}
