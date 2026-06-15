// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const people = [
  { id: "sarah",  name: "Sarah",  rel: "Sister",  emoji: "👩", healthColor: SAGE,  healthPct: 92, event: "Anniversary",  days: 8  },
  { id: "mom",    name: "Mom",    rel: "Mother",  emoji: "💛", healthColor: AMBER, healthPct: 54, event: "Mother's Day", days: 15 },
  { id: "steve",  name: "Steve",  rel: "Friend",  emoji: "🤝", healthColor: SAGE,  healthPct: 76, event: "Birthday",     days: 3  },
  { id: "marcus", name: "Marcus", rel: "Friend",  emoji: "🧢", healthColor: RED,   healthPct: 48, event: "Birthday",     days: 3  },
  { id: "dad",    name: "Dad",    rel: "Father",  emoji: "👔", healthColor: SAGE,  healthPct: 80, event: "Father's Day", days: 28 },
  { id: "jenny",  name: "Jenny",  rel: "Client",  emoji: "💼", healthColor: SAGE,  healthPct: 94, event: "Work Anniv",   days: 45 },
];

const navTabs = [
  { icon: "👥", label: "People",   id: "people" },
  { icon: "🗓", label: "Moments",  id: "moments" },
  { icon: "💌", label: "Cards",    id: "cards" },
  { icon: "⚙️", label: "Settings", id: "settings" },
];

function SmallRing({ pct, color }: { pct: number; color: string }) {
  const r = 18, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={44} height={44}>
      <circle cx={22} cy={22} r={r} fill="none" stroke={BORDER} strokeWidth={4} />
      <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 22 22)" />
      <text x={22} y={26} textAnchor="middle" fontSize={8} fontWeight="bold" fill={BLACK}>{pct}%</text>
    </svg>
  );
}

export function Mobile() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("people");

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: 72 }}>

      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px 12px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: WHITE, letterSpacing: "0.04em" }}>YOUR PEOPLE</span>
      </div>

      {/* People list */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {people.map(p => (
            <div key={p.id} style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
              {/* Row */}
              <div
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
              >
                <div style={{ fontSize: "1.5rem" }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.72rem", color: GRAY }}>{p.rel}</div>
                </div>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%", background: p.healthColor, flexShrink: 0,
                }} />
                <div style={{
                  background: p.days <= 7 ? `${RED}15` : CREAM,
                  color: p.days <= 7 ? RED : GRAY,
                  fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                }}>
                  {p.days}d
                </div>
                <span style={{ color: GRAY, fontSize: "0.8rem" }}>{expandedId === p.id ? "▲" : "▼"}</span>
              </div>

              {/* Expanded detail */}
              {expandedId === p.id && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: "14px 16px", background: CREAM }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                    <SmallRing pct={p.healthPct} color={p.healthColor} />
                    <div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: BLACK, marginBottom: 2 }}>{p.event}</div>
                      <div style={{ fontSize: "0.73rem", color: GRAY }}>{p.days} days away</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: BLACK, color: WHITE, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Write Card
                    </button>
                    <button style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Log Moment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: 390, background: BLACK, display: "flex", borderTop: `1px solid #ffffff15`,
      }}>
        {navTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, padding: "10px 0", border: "none", background: "transparent", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.62rem", fontWeight: 600, color: activeTab === t.id ? RED : "#ffffff55" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
