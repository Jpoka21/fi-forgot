// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";
const DARK_SAGE = "#3d6b4f";

const people = [
  { id: 1, emoji: "👩", name: "Sarah",  rel: "Sister",  healthColor: DARK_SAGE, healthPct: 92, nextDays: 8,  nextEvent: "Anniversary in 8 days",   action: "Review Draft"   },
  { id: 2, emoji: "💛", name: "Mom",    rel: "Mother",  healthColor: AMBER,     healthPct: 54, nextDays: 15, nextEvent: "Mother's Day in 15 days", action: "Add Details"    },
  { id: 3, emoji: "🤝", name: "Steve",  rel: "Friend",  healthColor: SAGE,      healthPct: 78, nextDays: 3,  nextEvent: "Birthday in 3 days",      action: "Review Draft"   },
  { id: 4, emoji: "🧢", name: "Marcus", rel: "Friend",  healthColor: RED,       healthPct: 41, nextDays: 3,  nextEvent: "Birthday in 3 days",      action: "Write Card"     },
  { id: 5, emoji: "👔", name: "Dad",    rel: "Father",  healthColor: SAGE,      healthPct: 75, nextDays: 28, nextEvent: "Father's Day in 28 days", action: "View"           },
  { id: 6, emoji: "💼", name: "Jenny",  rel: "Client",  healthColor: DARK_SAGE, healthPct: 88, nextDays: 45, nextEvent: "Work Anniv in 45 days",   action: "View"           },
];

const tabs = ["👥", "🗓", "💌", "⚙️"];
const tabLabels = ["People", "Moments", "Cards", "Settings"];

function SmallRing({ pct, color, size = 36 }: { pct: number; color: string; size?: number }) {
  const r = (size - 5) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}22`} strokeWidth={3.5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3.5}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.52rem", fontWeight: 700, color }}>{pct}%</span>
      </div>
    </div>
  );
}

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", background: "#ddd", padding: "20px 0" }}>
      <div style={{ width: 390, background: BG, borderRadius: 28, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", position: "relative", minHeight: 780 }}>

        {/* Header */}
        <div style={{ background: BLACK, padding: "16px 20px" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: WHITE }}>YOUR PEOPLE</span>
        </div>

        {/* People list */}
        <div style={{ padding: "12px 16px 80px", display: "flex", flexDirection: "column", gap: 10 }}>
          {people.map((p) => {
            const isExp = expanded === p.id;
            return (
              <div key={p.id} style={{ background: WHITE, borderRadius: 16, border: `1.5px solid ${BORDER}`, overflow: "hidden" }}>
                {/* Row */}
                <div
                  onClick={() => setExpanded(isExp ? null : p.id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
                    {p.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>{p.name}</div>
                    <div style={{ fontSize: "0.75rem", color: GRAY }}>{p.rel}</div>
                  </div>
                  {/* Health dot */}
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.healthColor, flexShrink: 0 }} />
                  {/* Next event badge */}
                  <div style={{ padding: "3px 9px", borderRadius: 20, background: p.nextDays <= 7 ? `${RED}12` : `${BLACK}08`, fontSize: "0.7rem", fontWeight: 700, color: p.nextDays <= 7 ? RED : GRAY, flexShrink: 0 }}>
                    {p.nextDays}d
                  </div>
                  <span style={{ color: GRAY, fontSize: "0.8rem" }}>{isExp ? "▲" : "▼"}</span>
                </div>
                {/* Expanded panel */}
                {isExp && (
                  <div style={{ borderTop: `1px solid ${BORDER}`, padding: "14px 16px", background: CREAM }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                      <SmallRing pct={p.healthPct} color={p.healthColor} size={52} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: BLACK, marginBottom: 2 }}>{p.nextEvent}</div>
                        <div style={{ fontSize: "0.75rem", color: GRAY }}>Last card: 2 months ago</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ flex: 1, padding: "9px", borderRadius: 10, background: p.healthColor === RED ? RED : SAGE, color: WHITE, border: "none", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                        {p.action}
                      </button>
                      <button style={{ flex: 1, padding: "9px", borderRadius: 10, background: WHITE, color: BLACK, border: `1.5px solid ${BORDER}`, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
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
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: BLACK, display: "flex" }}>
          {tabs.map((icon, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 12px", border: "none", background: "none", cursor: "pointer", gap: 3 }}>
              <span style={{ fontSize: "1.2rem" }}>{icon}</span>
              <span style={{ fontSize: "0.62rem", fontWeight: 600, color: activeTab === i ? RED : "rgba(255,255,255,0.45)" }}>{tabLabels[i]}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
