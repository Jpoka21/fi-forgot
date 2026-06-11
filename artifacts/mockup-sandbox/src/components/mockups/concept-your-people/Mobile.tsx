// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

type HealthLevel = "excellent" | "healthy" | "needs-attention" | "priority";

const people = [
  { id: 1, name: "Sarah",  rel: "Sister",  emoji: "👩", health: "excellent" as HealthLevel,       healthPct: 92, nextEvent: "Anniversary",  nextDays: 8  },
  { id: 2, name: "Mom",    rel: "Mother",  emoji: "💛", health: "needs-attention" as HealthLevel, healthPct: 48, nextEvent: "Mother's Day", nextDays: 15 },
  { id: 3, name: "Steve",  rel: "Friend",  emoji: "🤝", health: "healthy" as HealthLevel,         healthPct: 74, nextEvent: "Birthday",     nextDays: 3  },
  { id: 4, name: "Marcus", rel: "Friend",  emoji: "🧢", health: "priority" as HealthLevel,        healthPct: 35, nextEvent: "Birthday",     nextDays: 3  },
  { id: 5, name: "Dad",    rel: "Father",  emoji: "👔", health: "healthy" as HealthLevel,         healthPct: 71, nextEvent: "Father's Day", nextDays: 28 },
];

function dotColor(h: HealthLevel) {
  if (h === "excellent") return "#2D7D52";
  if (h === "healthy")   return SAGE;
  if (h === "needs-attention") return "#F59E0B";
  return RED;
}

function SmallRing({ pct, color }: { pct: number; color: string }) {
  const size = 52, r = 21;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={26} cy={26} r={r} fill="none" stroke={`${color}20`} strokeWidth={5} />
      <circle cx={26} cy={26} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 26 26)" />
      <text x={26} y={30} textAnchor="middle" fontFamily="'Bebas Neue', cursive" fontSize="13" fill={BLACK}>{pct}%</text>
    </svg>
  );
}

const navTabs = ["People", "Moments", "Cards", "Settings"];

export function Mobile() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const }}>

      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", letterSpacing: "0.04em", color: WHITE }}>YOUR PEOPLE</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto" as const, paddingBottom: 64 }}>
        <div style={{ padding: "16px 16px 0" }}>
          {people.map((p) => {
            const isExpanded = expanded === p.id;
            const dc = dotColor(p.health);
            return (
              <div key={p.id} style={{ background: WHITE, borderRadius: 14, marginBottom: 10, border: p.health === "priority" ? `2px solid ${RED}` : `1.5px solid ${BORDER}`, overflow: "hidden" }}>
                {/* Row */}
                <div onClick={() => setExpanded(isExpanded ? null : p.id)} style={{ padding: "14px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                    <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 1 }}>{p.rel}</div>
                  </div>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: dc, flexShrink: 0 }} />
                  <span style={{ padding: "3px 9px", borderRadius: 20, background: p.nextDays <= 7 ? `${RED}12` : `${BLACK}08`, color: p.nextDays <= 7 ? RED : GRAY, fontSize: "0.67rem", fontWeight: 600 }}>
                    {p.nextDays}d
                  </span>
                  <span style={{ fontSize: "0.7rem", color: GRAY, marginLeft: 2 }}>{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div style={{ padding: "14px 14px 16px", borderTop: `1px solid ${BORDER}`, background: CREAM }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                      <SmallRing pct={p.healthPct} color={dc} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK }}>Next: {p.nextEvent}</div>
                        <div style={{ fontSize: "0.73rem", color: GRAY, marginTop: 2 }}>in {p.nextDays} days</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ flex: 1, padding: "9px 0", borderRadius: 9, background: p.health === "priority" ? RED : SAGE, color: WHITE, border: "none", fontWeight: 700, fontSize: "0.76rem", cursor: "pointer" }}>
                        {p.health === "priority" ? "Write Card →" : "Review →"}
                      </button>
                      <button style={{ flex: 1, padding: "9px 0", borderRadius: 9, background: "none", border: `1.5px solid ${BLACK}18`, color: BLACK, fontWeight: 600, fontSize: "0.76rem", cursor: "pointer" }}>
                        View Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        {navTabs.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: "12px 0 14px", background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 600, color: activeTab === i ? RED : "rgba(255,255,255,0.45)", letterSpacing: "0.04em", textTransform: "uppercase" as const, display: "block" }}>{tab}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
