// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

type HealthStatus = "Excellent" | "Healthy" | "NeedsAttention" | "Priority";

const people = [
  { id: 1, emoji: "👩", name: "Sarah",  rel: "Sister",  health: "Excellent"      as HealthStatus, score: 91, nextEvent: "Anniversary", nextDays: 8  },
  { id: 2, emoji: "💛", name: "Mom",    rel: "Mother",  health: "NeedsAttention" as HealthStatus, score: 58, nextEvent: "Mother's Day", nextDays: 15 },
  { id: 3, emoji: "🤝", name: "Steve",  rel: "Friend",  health: "Healthy"        as HealthStatus, score: 74, nextEvent: "Birthday",     nextDays: 3  },
  { id: 4, emoji: "🧢", name: "Marcus", rel: "Friend",  health: "Priority"       as HealthStatus, score: 42, nextEvent: "Birthday",     nextDays: 3  },
  { id: 5, emoji: "👔", name: "Dad",    rel: "Father",  health: "Healthy"        as HealthStatus, score: 77, nextEvent: "Father's Day", nextDays: 28 },
  { id: 6, emoji: "💼", name: "Jenny",  rel: "Client",  health: "Excellent"      as HealthStatus, score: 88, nextEvent: "Work Anniv",   nextDays: 45 },
];

const healthDot: Record<HealthStatus, string> = { Excellent: "#166534", Healthy: SAGE, NeedsAttention: AMBER, Priority: RED };

function MiniRing({ score, status }: { score: number; status: HealthStatus }) {
  const r = 18, c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <svg width={44} height={44} viewBox="0 0 44 44">
      <circle cx={22} cy={22} r={r} fill="none" stroke={BORDER} strokeWidth={4} />
      <circle cx={22} cy={22} r={r} fill="none" stroke={healthDot[status]} strokeWidth={4}
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 22 22)" />
      <text x={22} y={26} textAnchor="middle" fontSize={9} fontWeight={700} fill={healthDot[status]} fontFamily="'Plus Jakarta Sans', sans-serif">{score}%</text>
    </svg>
  );
}

const tabs = [
  { icon: "👥", label: "People",   active: true  },
  { icon: "🗓", label: "Moments",  active: false },
  { icon: "💌", label: "Cards",    active: false },
  { icon: "⚙️", label: "Settings", active: false },
];

export function Mobile() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div style={{ width: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative" as const, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: WHITE }}>YOUR PEOPLE</div>
        <div style={{ fontSize: "0.72rem", color: "#ffffff50", marginTop: 2 }}>6 people · 5 healthy · 1 priority</div>
      </div>

      {/* People list */}
      <div style={{ padding: "14px 14px 80px", display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {people.map((p) => {
          const isOpen = expanded === p.id;
          return (
            <div key={p.id} style={{ background: WHITE, borderRadius: 14, border: `1px solid ${p.health === "Priority" ? RED + "40" : BORDER}`, overflow: "hidden", cursor: "pointer" }}>
              {/* Row */}
              <div
                onClick={() => setExpanded(isOpen ? null : p.id)}
                style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}
              >
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: CREAM, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 1 }}>{p.rel}</div>
                </div>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: healthDot[p.health], flexShrink: 0 }} />
                <div style={{
                  padding: "3px 8px", borderRadius: 20,
                  background: p.nextDays <= 7 ? RED : CREAM,
                  color: p.nextDays <= 7 ? WHITE : GRAY,
                  fontSize: "0.68rem", fontWeight: 700, flexShrink: 0,
                }}>{p.nextDays}d</div>
              </div>

              {/* Expanded */}
              {isOpen && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                    <MiniRing score={p.score} status={p.health} />
                    <div>
                      <div style={{ fontSize: "0.76rem", fontWeight: 700, color: BLACK }}>{p.nextEvent}</div>
                      <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 2 }}>{p.nextDays} days away</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", background: p.health === "Priority" ? RED : BLACK, color: WHITE, fontWeight: 700, fontSize: "0.76rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {p.health === "Priority" ? "Write Card" : "Review →"}
                    </button>
                    <button style={{ flex: 1, padding: "9px", borderRadius: 9, border: `1.5px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.76rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      View Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: `1px solid #ffffff15` }}>
        {tabs.map((t, i) => (
          <div key={i} style={{ flex: 1, padding: "10px 0 12px", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3, cursor: "pointer" }}>
            <div style={{ fontSize: "1.1rem" }}>{t.icon}</div>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, color: t.active ? RED : "#ffffff50" }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
