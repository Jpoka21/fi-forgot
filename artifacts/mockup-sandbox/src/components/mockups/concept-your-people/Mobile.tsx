// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const people = [
  { id: 1, emoji: "👩", name: "Sarah",  rel: "Sister",  health: 82, healthClr: SAGE,     daysNext: 8,  nextEvent: "Anniversary",  action: "Review Draft" },
  { id: 2, emoji: "💛", name: "Mom",    rel: "Mother",  health: 54, healthClr: "#D97706", daysNext: 15, nextEvent: "Mother's Day", action: "Add Details"  },
  { id: 3, emoji: "🤝", name: "Steve",  rel: "Friend",  health: 71, healthClr: SAGE,     daysNext: 3,  nextEvent: "Birthday",     action: "Review Draft" },
  { id: 4, emoji: "🧢", name: "Marcus", rel: "Friend",  health: 42, healthClr: RED,      daysNext: 3,  nextEvent: "Birthday",     action: "Write Card"   },
  { id: 5, emoji: "👔", name: "Dad",    rel: "Father",  health: 78, healthClr: SAGE,     daysNext: 28, nextEvent: "Father's Day", action: "View"         },
];

const TABS = [
  { id: "people",  icon: "👥", label: "People"  },
  { id: "moments", icon: "🗓", label: "Moments" },
  { id: "cards",   icon: "💌", label: "Cards"   },
  { id: "settings",icon: "⚙️", label: "Settings"},
];

function MiniRing({ pct, color }: { pct: number; color: string }) {
  const size = 40, r = 15;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={20} cy={20} r={r} fill="none" stroke={`${color}25`} strokeWidth={5} />
      <circle cx={20} cy={20} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform="rotate(-90 20 20)" />
      <text x={20} y={24} textAnchor="middle" fontSize="9" fontWeight="800" fill={color}>{pct}%</text>
    </svg>
  );
}

export function Mobile() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("people");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", height: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ background: BLACK, padding: "16px 20px 14px", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: WHITE, letterSpacing: "0.06em" }}>YOUR PEOPLE</span>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {people.map(p => (
            <div key={p.id} style={{ background: WHITE, borderRadius: 14, overflow: "hidden", border: `1.5px solid ${BORDER}` }}>
              {/* Row */}
              <div
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
              >
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0, border: `1px solid ${BORDER}` }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.75rem", color: GRAY }}>{p.rel}</div>
                </div>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.healthClr, flexShrink: 0 }} />
                <div style={{ background: p.daysNext <= 7 ? `${RED}18` : BG, color: p.daysNext <= 7 ? RED : GRAY, padding: "4px 9px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 700, flexShrink: 0 }}>
                  {p.daysNext}d
                </div>
              </div>

              {/* Expanded */}
              {expanded === p.id && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: "16px", background: CREAM }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                    <MiniRing pct={p.health} color={p.healthClr} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>Next: {p.nextEvent}</div>
                      <div style={{ fontSize: "0.78rem", color: GRAY }}>in {p.daysNext} days</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ flex: 2, padding: "10px", borderRadius: 9, background: RED, color: WHITE, border: "none", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>{p.action}</button>
                    <button style={{ flex: 1, padding: "10px", borderRadius: 9, background: "transparent", color: SAGE, border: `1.5px solid ${SAGE}`, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Profile</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: `1px solid #333` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ flex: 1, background: "transparent", border: "none", padding: "12px 0 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: activeTab === t.id ? RED : "#ffffff60", letterSpacing: "0.04em" }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
