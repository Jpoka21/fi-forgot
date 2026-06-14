// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const people = [
  { id: 1, emoji: "👩", name: "Sarah",  rel: "Sister", healthDot: "#3A7D5A", pct: 94, nextEvent: "Anniversary",  nextDays: 8  },
  { id: 2, emoji: "💛", name: "Mom",    rel: "Mother", healthDot: "#D97706", pct: 52, nextEvent: "Mother's Day",  nextDays: 15 },
  { id: 3, emoji: "🤝", name: "Steve",  rel: "Friend", healthDot: SAGE,      pct: 78, nextEvent: "Birthday",     nextDays: 3  },
  { id: 4, emoji: "🧢", name: "Marcus", rel: "Friend", healthDot: RED,       pct: 62, nextEvent: "Birthday",     nextDays: 3  },
  { id: 5, emoji: "👔", name: "Dad",    rel: "Father", healthDot: SAGE,      pct: 81, nextEvent: "Father's Day", nextDays: 28 },
  { id: 6, emoji: "💼", name: "Jenny",  rel: "Client", healthDot: "#3A7D5A", pct: 91, nextEvent: "Work Anniv",   nextDays: 45 },
];

const tabs = ["👥", "🗓", "💌", "⚙️"];
const tabLabels = ["People", "Moments", "Cards", "Settings"];

function SmallRing({ pct, color }: { pct: number; color: string }) {
  const size = 40, r = 15, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BORDER} strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: "0 auto", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: WHITE, letterSpacing: 1 }}>YOUR PEOPLE</span>
      </div>

      {/* People list */}
      <div style={{ padding: "18px 16px 80px", display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", flex: 1 }}>
        {people.map(p => (
          <div key={p.id}>
            {/* Row */}
            <div
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              style={{
                background: WHITE,
                borderRadius: expanded === p.id ? "11px 11px 0 0" : 11,
                padding: "13px 14px",
                border: `1.5px solid ${expanded === p.id ? p.healthDot : BORDER}`,
                borderBottom: expanded === p.id ? "none" : undefined,
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
              }}
            >
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", border: `2px solid ${p.healthDot}` }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: "0.73rem", color: GRAY }}>{p.rel}</div>
              </div>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.healthDot, flexShrink: 0 }} />
              <div style={{ background: p.nextDays <= 7 ? RED + "18" : CREAM, color: p.nextDays <= 7 ? RED : GRAY, borderRadius: 20, padding: "2px 9px", fontSize: "0.7rem", fontWeight: 700, whiteSpace: "nowrap" }}>{p.nextDays}d</div>
            </div>
            {/* Expanded */}
            {expanded === p.id && (
              <div style={{ background: WHITE, borderRadius: "0 0 11px 11px", padding: "14px 16px 16px", border: `1.5px solid ${p.healthDot}`, borderTop: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <SmallRing pct={p.pct} color={p.healthDot} />
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: p.healthDot }}>{p.pct}% health score</div>
                    <div style={{ fontSize: "0.74rem", color: GRAY, marginTop: 2 }}>Next: {p.nextEvent} in {p.nextDays} days</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ flex: 1, background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "9px 0", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Send Card</button>
                  <button style={{ flex: 1, background: "transparent", color: SAGE, border: `1.5px solid ${SAGE}`, borderRadius: 8, padding: "9px 0", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Log Moment</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {tabs.map((icon, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.2rem" }}>{icon}</span>
            <span style={{ fontSize: "0.62rem", color: activeTab === i ? RED : "rgba(255,255,255,0.45)", fontWeight: activeTab === i ? 700 : 400, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{tabLabels[i]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
