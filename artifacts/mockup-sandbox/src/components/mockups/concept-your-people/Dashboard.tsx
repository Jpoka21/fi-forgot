// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";

type Person = {
  emoji: string; name: string; rel: string;
  health: "excellent" | "healthy" | "attention" | "priority";
  pct: number; ringColor: string;
  nextEvent: string; nextDays: number;
  lastUpdated: number; action: string;
  priority?: boolean;
};

const PEOPLE: Person[] = [
  { emoji: "👩", name: "Sarah", rel: "Sister", health: "excellent", pct: 92, ringColor: "#3A6B4E", nextEvent: "Anniversary", nextDays: 8, lastUpdated: 2, action: "Review Draft →" },
  { emoji: "💛", name: "Mom", rel: "Mother", health: "attention", pct: 58, ringColor: "#D97706", nextEvent: "Mother's Day", nextDays: 15, lastUpdated: 30, action: "Add Details →" },
  { emoji: "🤝", name: "Steve", rel: "Friend", health: "healthy", pct: 78, ringColor: SAGE, nextEvent: "Birthday", nextDays: 3, lastUpdated: 5, action: "Review Draft →" },
  { emoji: "🧢", name: "Marcus", rel: "Friend", health: "priority", pct: 42, ringColor: RED, nextEvent: "Birthday", nextDays: 3, lastUpdated: 60, action: "Write Card →", priority: true },
  { emoji: "👔", name: "Dad", rel: "Father", health: "healthy", pct: 80, ringColor: SAGE, nextEvent: "Father's Day", nextDays: 28, lastUpdated: 8, action: "View →" },
  { emoji: "💼", name: "Jenny", rel: "Client", health: "excellent", pct: 94, ringColor: "#3A6B4E", nextEvent: "Work Anniv", nextDays: 45, lastUpdated: 1, action: "View →" },
];

function HealthRing({ pct, color, size = 40 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}20`} strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
}

function healthLabel(h: Person["health"]) {
  if (h === "excellent") return { text: "Excellent", bg: "#3A6B4E18", color: "#3A6B4E" };
  if (h === "attention") return { text: "Needs Attention", bg: "#FEF3C7", color: "#D97706" };
  if (h === "priority") return { text: "Priority", bg: `${RED}14`, color: RED };
  return { text: "Healthy", bg: `${SAGE}18`, color: SAGE };
}

export function Dashboard() {
  const [, setSelected] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: "0.04em" }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: RED, letterSpacing: "0.1em" }}>F.I. FORGOT</span>
      </nav>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 20px 64px" }}>
        {/* Summary strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, padding: "10px 16px", background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}` }}>
          {[["#3A6B4E", 3], [SAGE, 2], [RED, 1]].map(([color, count]) => (
            <div key={color as string} style={{ width: 10, height: 10, borderRadius: "50%", background: color as string, flexShrink: 0 }} />
          ))}
          <span style={{ fontSize: "0.82rem", color: GRAY, fontWeight: 600 }}>5 people healthy · 1 needs attention</span>
          <button style={{ marginLeft: "auto", background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>+ Add Person</button>
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {PEOPLE.map(p => {
            const lbl = healthLabel(p.health);
            return (
              <div key={p.name} onClick={() => setSelected(p.name)} style={{
                background: WHITE, borderRadius: 18, border: p.priority ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                padding: "18px 18px 14px",
                boxShadow: p.priority ? `0 4px 20px ${RED}14` : "0 2px 8px rgba(0,0,0,0.04)",
                cursor: "pointer",
                position: "relative" as const,
                borderLeft: p.priority ? `4px solid ${RED}` : undefined,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>{p.emoji}</div>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.04em", lineHeight: 1 }}>{p.name.toUpperCase()}</div>
                      <span style={{ background: `${BLACK}10`, borderRadius: 20, padding: "2px 10px", fontSize: "0.65rem", fontWeight: 700, color: BLACK }}>{p.rel}</span>
                    </div>
                  </div>
                  <div style={{ position: "relative" as const, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HealthRing pct={p.pct} color={p.ringColor} size={44} />
                    <span style={{ position: "absolute" as const, fontSize: "0.58rem", fontWeight: 700, color: p.ringColor }}>{p.pct}%</span>
                  </div>
                </div>

                <span style={{ background: lbl.bg, color: lbl.color, borderRadius: 20, padding: "3px 10px", fontSize: "0.65rem", fontWeight: 700 }}>{lbl.text}</span>

                <div style={{ marginTop: 10, fontSize: "0.75rem" }}>
                  <span style={{ background: `${BLACK}08`, borderRadius: 8, padding: "3px 10px", fontWeight: 600, color: BLACK }}>{p.nextEvent} · {p.nextDays}d away</span>
                </div>
                <div style={{ marginTop: 6, fontSize: "0.68rem", color: GRAY }}>last updated {p.lastUpdated} day{p.lastUpdated !== 1 ? "s" : ""} ago</div>

                <button style={{
                  marginTop: 12, width: "100%",
                  background: p.priority ? RED : `${BLACK}08`,
                  color: p.priority ? WHITE : BLACK,
                  border: "none", borderRadius: 9, padding: "9px 0",
                  fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                }}>
                  {p.action}
                </button>
              </div>
            );
          })}

          {/* Add Person */}
          <div style={{ background: `${SAGE}08`, borderRadius: 18, border: `2px dashed ${SAGE}40`, padding: "18px", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", minHeight: 180 }}>
            <span style={{ fontSize: "2rem", color: SAGE }}>+</span>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: SAGE }}>ADD PERSON</span>
          </div>
        </div>
      </div>
    </div>
  );
}
