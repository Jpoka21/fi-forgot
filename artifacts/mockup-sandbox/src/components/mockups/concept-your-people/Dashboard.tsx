// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

type HealthLevel = "excellent" | "healthy" | "needs-attention" | "priority";

interface Person {
  name: string; rel: string; emoji: string;
  health: HealthLevel; healthPct: number;
  nextEvent: string; nextDays: number;
  lastUpdated: number;
  action: string;
}

const people: Person[] = [
  { name: "Sarah",  rel: "Sister",  emoji: "👩", health: "excellent",       healthPct: 92, nextEvent: "Anniversary",  nextDays: 8,  lastUpdated: 2,  action: "Review Draft →" },
  { name: "Mom",    rel: "Mother",  emoji: "💛", health: "needs-attention", healthPct: 48, nextEvent: "Mother's Day", nextDays: 15, lastUpdated: 21, action: "Add Details →"  },
  { name: "Steve",  rel: "Friend",  emoji: "🤝", health: "healthy",         healthPct: 74, nextEvent: "Birthday",     nextDays: 3,  lastUpdated: 5,  action: "Review Draft →" },
  { name: "Marcus", rel: "Friend",  emoji: "🧢", health: "priority",        healthPct: 35, nextEvent: "Birthday",     nextDays: 3,  lastUpdated: 14, action: "Write Card →"   },
  { name: "Dad",    rel: "Father",  emoji: "👔", health: "healthy",         healthPct: 71, nextEvent: "Father's Day", nextDays: 28, lastUpdated: 7,  action: "View →"         },
  { name: "Jenny",  rel: "Client",  emoji: "💼", health: "excellent",       healthPct: 88, nextEvent: "Work Anniv",   nextDays: 45, lastUpdated: 3,  action: "View →"         },
];

function ringColor(h: HealthLevel) {
  if (h === "excellent")       return "#2D7D52";
  if (h === "healthy")         return SAGE;
  if (h === "needs-attention") return "#F59E0B";
  return RED;
}

function ringLabel(h: HealthLevel) {
  if (h === "excellent")       return "Excellent";
  if (h === "healthy")         return "Healthy";
  if (h === "needs-attention") return "Needs Attention";
  return "Priority";
}

function HealthRing({ pct, color, size = 42 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}20`} strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  );
}

export function Dashboard() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 20px", height: 56, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", letterSpacing: "0.04em", color: WHITE, flex: 1 }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 18px 48px" }}>

        {/* Summary strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, padding: "11px 16px", background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}` }}>
          {[{ color: "#2D7D52", label: "2 excellent" }, { color: SAGE, label: "2 healthy" }, { color: "#F59E0B", label: "1 needs attention" }, { color: RED, label: "1 priority" }].map((d) => (
            <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: "0.72rem", color: GRAY }}>{d.label}</span>
            </div>
          ))}
        </div>

        {/* People grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {people.map((p) => {
            const rc = ringColor(p.health);
            return (
              <div
                key={p.name}
                onMouseEnter={() => setHovered(p.name)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: WHITE, borderRadius: 16, padding: "16px",
                  border: p.health === "priority" ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                  borderLeft: p.health === "priority" ? `5px solid ${RED}` : undefined,
                  boxShadow: hovered === p.name ? "0 4px 18px rgba(0,0,0,0.08)" : "none",
                  transition: "box-shadow 0.15s", cursor: "pointer",
                  display: "flex", flexDirection: "column" as const, gap: 10,
                }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", letterSpacing: "0.04em", color: BLACK, lineHeight: 1 }}>{p.name.toUpperCase()}</div>
                    <span style={{ padding: "2px 8px", borderRadius: 20, background: `${BLACK}0A`, color: GRAY, fontSize: "0.68rem", fontWeight: 600 }}>{p.rel}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 1 }}>
                    <HealthRing pct={p.healthPct} color={rc} size={42} />
                    <span style={{ fontSize: "0.6rem", color: rc, fontWeight: 700 }}>{p.healthPct}%</span>
                  </div>
                </div>

                {/* Health label */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: rc, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.7rem", color: rc, fontWeight: 600 }}>{ringLabel(p.health)}</span>
                </div>

                {/* Next event chip */}
                <div style={{ padding: "6px 10px", borderRadius: 8, background: CREAM, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.74rem", color: BLACK, fontWeight: 600 }}>{p.nextEvent}</span>
                  <span style={{ fontSize: "0.68rem", color: p.nextDays <= 7 ? RED : GRAY, fontWeight: 600 }}>in {p.nextDays}d</span>
                </div>

                {/* Last updated */}
                <div style={{ fontSize: "0.65rem", color: GRAY }}>Last updated {p.lastUpdated} days ago</div>

                {/* Action button */}
                <button style={{ width: "100%", padding: "9px 0", borderRadius: 9, background: p.health === "priority" ? RED : p.health === "needs-attention" ? "#F59E0B" : `${SAGE}15`, color: p.health === "priority" ? WHITE : p.health === "needs-attention" ? WHITE : SAGE, border: "none", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>
                  {p.action}
                </button>
              </div>
            );
          })}

          {/* Add person */}
          <div style={{ borderRadius: 16, border: `2px dashed ${SAGE}55`, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 6, minHeight: 180, cursor: "pointer" }}>
            <span style={{ fontSize: "1.6rem", color: SAGE }}>+</span>
            <span style={{ fontSize: "0.8rem", color: SAGE, fontWeight: 600 }}>Add Person</span>
          </div>
        </div>

      </div>
    </div>
  );
}
