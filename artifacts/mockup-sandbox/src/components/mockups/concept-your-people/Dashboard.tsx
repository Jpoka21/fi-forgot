// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";
const DARK_SAGE = "#3D6B4F";

interface Person {
  emoji: string; name: string; rel: string;
  health: "Excellent" | "Healthy" | "Needs Attention" | "Priority";
  pct: number; event: string; days: number; action: string; priority?: boolean;
}

const PEOPLE: Person[] = [
  { emoji: "👩", name: "Sarah",  rel: "Sister",  health: "Excellent",       pct: 94, event: "Anniversary",  days: 8,  action: "Review Draft →"  },
  { emoji: "💛", name: "Mom",    rel: "Mother",  health: "Needs Attention",  pct: 52, event: "Mother's Day", days: 15, action: "Add Details →"   },
  { emoji: "🤝", name: "Steve",  rel: "Friend",  health: "Healthy",          pct: 76, event: "Birthday",     days: 3,  action: "Review Draft →"  },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  health: "Priority",         pct: 38, event: "Birthday",     days: 3,  action: "Write Card →",   priority: true },
  { emoji: "👔", name: "Dad",    rel: "Father",  health: "Healthy",          pct: 80, event: "Father's Day", days: 28, action: "View →"          },
  { emoji: "💼", name: "Jenny",  rel: "Client",  health: "Excellent",        pct: 91, event: "Work Anniv",   days: 45, action: "View →"          },
];

function healthColor(h: Person["health"]) {
  if (h === "Excellent")       return DARK_SAGE;
  if (h === "Healthy")         return SAGE;
  if (h === "Needs Attention") return AMBER;
  return RED;
}

function HealthRing({ pct, size, color }: { pct: number; size: number; color: string }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}22`} strokeWidth={7} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize={10} fontWeight={800} fill={color}>{pct}%</text>
    </svg>
  );
}

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "0 32px", height: 62, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: 3 }}>YOUR PEOPLE</div>
        </div>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
      </nav>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "28px 28px" }}>
        {/* Summary strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "12px 20px", background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[DARK_SAGE, DARK_SAGE, SAGE, SAGE, SAGE].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: AMBER }} />
          </div>
          <span style={{ fontSize: "0.85rem", color: BLACK, fontWeight: 600 }}>5 people healthy</span>
          <span style={{ color: GRAY, fontSize: "0.82rem" }}>·</span>
          <span style={{ fontSize: "0.85rem", color: RED, fontWeight: 700 }}>1 needs attention</span>
        </div>

        {/* People grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {PEOPLE.map((p, i) => {
            const hc = healthColor(p.health);
            return (
              <div
                key={i}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: WHITE,
                  borderRadius: 18,
                  border: p.priority ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                  borderLeft: p.priority ? `5px solid ${RED}` : `1.5px solid ${BORDER}`,
                  padding: "20px 22px",
                  boxShadow: hov === i ? "0 6px 24px rgba(0,0,0,0.09)" : "0 1px 4px rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.15s",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                  {/* Emoji */}
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: `${hc}18`, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.7rem", flexShrink: 0,
                  }}>{p.emoji}</div>
                  {/* Name + rel */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, lineHeight: 1 }}>{p.name.toUpperCase()}</span>
                      <span style={{ background: `${hc}18`, color: hc, fontSize: "0.65rem", fontWeight: 700, borderRadius: 20, padding: "3px 9px" }}>{p.rel}</span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: hc, fontWeight: 700, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: hc }} />
                      {p.health}
                    </div>
                  </div>
                  {/* Health ring */}
                  <HealthRing pct={p.pct} size={52} color={hc} />
                </div>

                {/* Event chip */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ background: CREAM, borderRadius: 20, padding: "5px 12px", fontSize: "0.75rem", fontWeight: 600, color: BLACK }}>
                    {p.event} · {p.days} days
                  </div>
                  <div style={{ fontSize: "0.65rem", color: GRAY }}>last updated 3 days ago</div>
                </div>

                {/* Action button */}
                <button style={{
                  width: "100%",
                  background: p.priority ? RED : p.health === "Excellent" ? DARK_SAGE : p.health === "Needs Attention" ? AMBER : "transparent",
                  color: p.priority || p.health === "Excellent" || p.health === "Needs Attention" ? WHITE : BLACK,
                  border: p.priority || p.health === "Excellent" || p.health === "Needs Attention" ? "none" : `1.5px solid ${BLACK}22`,
                  borderRadius: 10, padding: "10px",
                  fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                }}>
                  {p.action}
                </button>
              </div>
            );
          })}

          {/* Add Person */}
          <div style={{
            borderRadius: 18, border: `2px dashed ${SAGE}55`,
            padding: "20px 22px",
            display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
            cursor: "pointer", minHeight: 160,
            color: SAGE,
          }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>+</div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>Add Person</div>
          </div>
        </div>
      </div>
    </div>
  );
}
