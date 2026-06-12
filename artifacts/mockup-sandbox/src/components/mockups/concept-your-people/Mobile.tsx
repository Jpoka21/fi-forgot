// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const DARK_SAGE = "#3d6b4f";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";
const CREAM = "#FDF7EF";
const AMBER = "#D97706";

const people = [
  { id: "sarah", emoji: "👩", name: "Sarah", rel: "Sister", healthDot: DARK_SAGE, healthPct: 90, nextEvent: "Anniversary", nextDays: 8, health: "Excellent", action1: "Review Draft", action2: "View Profile" },
  { id: "mom", emoji: "💛", name: "Mom", rel: "Mother", healthDot: AMBER, healthPct: 42, nextEvent: "Mother's Day", nextDays: 15, health: "Needs Attention", action1: "Add Details", action2: "View Profile" },
  { id: "steve", emoji: "🤝", name: "Steve", rel: "Friend", healthDot: SAGE, healthPct: 76, nextEvent: "Birthday", nextDays: 3, health: "Healthy", action1: "Review Draft", action2: "View Profile" },
  { id: "marcus", emoji: "🧢", name: "Marcus", rel: "Friend", healthDot: RED, healthPct: 58, nextEvent: "Birthday", nextDays: 3, health: "Priority", action1: "Write Card", action2: "View Profile" },
  { id: "dad", emoji: "👔", name: "Dad", rel: "Father", healthDot: SAGE, healthPct: 80, nextEvent: "Father's Day", nextDays: 28, health: "Healthy", action1: "View", action2: "View Profile" },
  { id: "jenny", emoji: "💼", name: "Jenny", rel: "Client", healthDot: DARK_SAGE, healthPct: 92, nextEvent: "Work Anniv", nextDays: 45, health: "Excellent", action1: "View", action2: "View Profile" },
];

function MiniRing({ pct, color }: { pct: number; color: string }) {
  const size = 32;
  const r = 13;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BORDER} strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4} strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "0.5rem", fontWeight: 800, color }}>{pct}</span>
      </div>
    </div>
  );
}

export function Mobile() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("people");

  const tabs = [
    { id: "people", label: "People", icon: "👥" },
    { id: "moments", label: "Moments", icon: "🗓" },
    { id: "cards", label: "Cards", icon: "💌" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: WHITE, letterSpacing: 2 }}>YOUR PEOPLE</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 88px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {people.map(p => (
            <div key={p.id}>
              <div
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                style={{
                  background: WHITE, borderRadius: expanded === p.id ? "12px 12px 0 0" : 12,
                  padding: "13px 14px", display: "flex", alignItems: "center", gap: 12,
                  border: `1px solid ${BORDER}`,
                  borderBottom: expanded === p.id ? "none" : `1px solid ${BORDER}`,
                  cursor: "pointer",
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0, border: `1px solid ${BORDER}` }}>{p.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 1 }}>{p.rel}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.healthDot, flexShrink: 0 }} />
                  <div style={{ background: p.nextDays <= 7 ? "rgba(226,59,46,0.1)" : CREAM, color: p.nextDays <= 7 ? RED : GRAY, borderRadius: 20, padding: "3px 9px", fontSize: "0.65rem", fontWeight: 700 }}>
                    {p.nextDays}d
                  </div>
                  <span style={{ fontSize: "0.75rem", color: GRAY }}>{expanded === p.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {expanded === p.id && (
                <div style={{
                  background: WHITE, borderRadius: "0 0 12px 12px",
                  padding: "14px", border: `1px solid ${BORDER}`, borderTop: `1px solid ${BORDER}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <MiniRing pct={p.healthPct} color={p.healthDot} />
                    <div>
                      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: p.healthDot }}>{p.health}</div>
                      <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 2 }}>Next: {p.nextEvent} in {p.nextDays}d</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: RED, color: WHITE, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.action1} →</button>
                    <button style={{ flex: 1, padding: "9px", borderRadius: 8, border: `1px solid ${BORDER}`, background: CREAM, color: BLACK, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.action2} →</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add person */}
          <div style={{ background: "transparent", borderRadius: 12, padding: "16px", border: `2px dashed ${SAGE}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
            <span style={{ color: SAGE, fontSize: "1.2rem" }}>+</span>
            <span style={{ color: SAGE, fontWeight: 700, fontSize: "0.82rem" }}>Add Person</span>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: `1px solid rgba(255,255,255,0.1)` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, background: "transparent", border: "none", padding: "10px 0 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === t.id ? RED : "rgba(255,255,255,0.45)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
