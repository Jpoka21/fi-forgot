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
const AMBER = "#D97706";

const DARK_SAGE = "#3D6B4F";

const people = [
  { id: "sarah",  name: "Sarah",  rel: "Sister", emoji: "👩", health: 82, healthColor: DARK_SAGE, nextEvent: "Anniversary", daysAway: 8  },
  { id: "mom",    name: "Mom",    rel: "Mother", emoji: "💛", health: 54, healthColor: AMBER,     nextEvent: "Mother's Day", daysAway: 15 },
  { id: "steve",  name: "Steve",  rel: "Friend", emoji: "🤝", health: 74, healthColor: SAGE,      nextEvent: "Birthday",     daysAway: 3  },
  { id: "marcus", name: "Marcus", rel: "Friend", emoji: "🧢", health: 38, healthColor: RED,       nextEvent: "Birthday",     daysAway: 3  },
  { id: "dad",    name: "Dad",    rel: "Father", emoji: "👔", health: 70, healthColor: SAGE,      nextEvent: "Father's Day", daysAway: 28 },
];

const navTabs = [
  { id: "people",   label: "People",   icon: "👥" },
  { id: "moments",  label: "Moments",  icon: "🗓" },
  { id: "cards",    label: "Cards",    icon: "💌" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

function SmallRing({ pct, color }: { pct: number; color: string }) {
  const size = 40;
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={20} cy={20} r={r} fill="none" stroke={`${color}25`} strokeWidth={4} />
      <circle cx={20} cy={20} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform="rotate(-90 20 20)" />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fill={color}
        style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {pct}%
      </text>
    </svg>
  );
}

export function Mobile() {
  const [activeTab, setActiveTab] = useState("people");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px 12px" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: WHITE, letterSpacing: 1 }}>YOUR PEOPLE</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>6 people · 1 needs attention</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {people.map((p, i) => {
            const isExpanded = expandedId === p.id;
            return (
              <div key={p.id}>
                {/* Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 0",
                    borderBottom: (!isExpanded && i < people.length - 1) ? `1px solid ${BORDER}` : "none",
                    cursor: "pointer",
                  }}
                >
                  {/* Emoji circle */}
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {p.emoji}
                  </div>
                  {/* Name + rel */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: BLACK, fontSize: 15 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: GRAY }}>{p.rel}</div>
                  </div>
                  {/* Health dot */}
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.healthColor }} />
                  {/* Next event badge */}
                  <div style={{
                    background: p.daysAway <= 7 ? `${RED}12` : CREAM,
                    color: p.daysAway <= 7 ? RED : GRAY,
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, flexShrink: 0,
                  }}>
                    {p.daysAway}d
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div style={{
                    background: WHITE, borderRadius: 14, padding: "16px 18px", marginBottom: 12,
                    border: `1.5px solid ${BORDER}`, borderLeft: `3px solid ${p.healthColor}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                      <SmallRing pct={p.health} color={p.healthColor} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: p.healthColor }}>Health {p.health}%</div>
                        <div style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{p.nextEvent} in {p.daysAway} days</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ flex: 1, padding: "9px 0", background: p.daysAway <= 7 ? RED : SAGE, color: WHITE, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {p.daysAway <= 7 ? "Write Card →" : "Review →"}
                      </button>
                      <button style={{ flex: 1, padding: "9px 0", background: "transparent", color: BLACK, border: `1.5px solid ${BORDER}`, borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Log Moment
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
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: "1px solid #222" }}>
        {navTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: activeTab === t.id ? RED : "rgba(255,255,255,0.4)" }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
