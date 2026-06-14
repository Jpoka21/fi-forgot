// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706", DARKGREEN = "#166534";

const people = [
  { id: "sarah",  emoji: "👩", name: "Sarah",  rel: "Sister", health: DARKGREEN, pct: 92, status: "Excellent",        nextEvent: "Anniversary",   days: 8  },
  { id: "mom",    emoji: "💛", name: "Mom",    rel: "Mother", health: AMBER,     pct: 54, status: "Needs Attention",  nextEvent: "Mother's Day",  days: 15 },
  { id: "steve",  emoji: "🤝", name: "Steve",  rel: "Friend", health: SAGE,      pct: 78, status: "Healthy",          nextEvent: "Birthday",      days: 3  },
  { id: "marcus", emoji: "🧢", name: "Marcus", rel: "Friend", health: RED,       pct: 44, status: "Priority",         nextEvent: "Birthday",      days: 3  },
  { id: "dad",    emoji: "👔", name: "Dad",    rel: "Father", health: SAGE,      pct: 81, status: "Healthy",          nextEvent: "Father's Day",  days: 28 },
  { id: "jenny",  emoji: "💼", name: "Jenny",  rel: "Client", health: DARKGREEN, pct: 95, status: "Excellent",        nextEvent: "Work Anniv",    days: 45 },
];

type NavTab = "people" | "moments" | "cards" | "settings";
const NAV: { id: NavTab; icon: string; label: string }[] = [
  { id: "people",   icon: "👥", label: "People"   },
  { id: "moments",  icon: "🗓", label: "Moments"  },
  { id: "cards",    icon: "💌", label: "Cards"    },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

function Ring({ size, pct, color }: { size: number; pct: number; color: string }) {
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={BORDER} strokeWidth={3} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+4} textAnchor="middle" fontSize={8} fill={color} fontWeight="700">{pct}%</text>
    </svg>
  );
}

export function Mobile() {
  const [activeTab, setActiveTab] = useState<NavTab>("people");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, width: "100%", maxWidth: 390, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px 12px", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: WHITE, letterSpacing: "0.04em" }}>YOUR PEOPLE</span>
      </div>

      {/* Summary bar */}
      <div style={{ background: WHITE, padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: DARKGREEN }} />
          <span style={{ fontSize: "0.74rem", color: GRAY }}>5 healthy</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: RED }} />
          <span style={{ fontSize: "0.74rem", color: GRAY, fontWeight: 600 }}>1 priority</span>
        </div>
      </div>

      {/* People list */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 72 }}>
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          {people.map((p, i) => {
            const isExpanded = expandedId === p.id;
            return (
              <div key={p.id} style={{ background: WHITE, borderRadius: 14, border: `1px solid ${p.id === "marcus" ? RED + "40" : BORDER}`, borderLeft: `3px solid ${p.health}`, overflow: "hidden" }}>
                {/* Main row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  style={{ padding: "13px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{p.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>{p.name}</div>
                    <div style={{ fontSize: "0.72rem", color: GRAY }}>{p.rel}</div>
                  </div>
                  {/* Health dot + days badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.health }} />
                    <div style={{ padding: "3px 8px", borderRadius: 20, background: p.days <= 7 ? `${RED}15` : `${SAGE}15`, color: p.days <= 7 ? RED : SAGE, fontSize: "0.68rem", fontWeight: 700 }}>
                      {p.days}d
                    </div>
                    <span style={{ color: GRAY, fontSize: "0.7rem" }}>{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ paddingTop: 14, display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                      <Ring size={56} pct={p.pct} color={p.health} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.84rem", color: BLACK }}>{p.nextEvent}</div>
                        <div style={{ fontSize: "0.74rem", color: GRAY, marginTop: 2 }}>in {p.days} days</div>
                        <div style={{ padding: "2px 8px", borderRadius: 20, background: `${p.health}15`, color: p.health, fontSize: "0.68rem", fontWeight: 700, marginTop: 5, display: "inline-block" }}>
                          {p.status}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", background: p.id === "marcus" ? RED : BLACK, color: WHITE, fontWeight: 700, fontSize: "0.76rem", cursor: "pointer" }}>
                        {p.id === "marcus" ? "Write Card →" : "Review →"}
                      </button>
                      <button style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.76rem", cursor: "pointer" }}>
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
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, borderTop: `1px solid #ffffff15`, display: "flex", zIndex: 20 }}>
        {NAV.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: "10px 4px 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.2rem" }}>{tab.icon}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: activeTab === tab.id ? RED : "#ffffff50", letterSpacing: "0.04em" }}>{tab.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
