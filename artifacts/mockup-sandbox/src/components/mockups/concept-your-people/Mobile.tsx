// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

type HealthLevel = "Excellent" | "Healthy" | "Needs Attention" | "Priority";

const PEOPLE: { id: string; name: string; emoji: string; rel: string; health: HealthLevel; pct: number; nextEvent: string; nextDays: number }[] = [
  { id: "sarah",  name: "Sarah",  emoji: "👩", rel: "Sister",  health: "Excellent",      pct: 92, nextEvent: "Anniversary",  nextDays: 8  },
  { id: "mom",    name: "Mom",    emoji: "💛", rel: "Mother",  health: "Needs Attention", pct: 58, nextEvent: "Mother's Day", nextDays: 15 },
  { id: "steve",  name: "Steve",  emoji: "🤝", rel: "Friend",  health: "Healthy",         pct: 76, nextEvent: "Birthday",     nextDays: 3  },
  { id: "marcus", name: "Marcus", emoji: "🧢", rel: "Friend",  health: "Priority",        pct: 45, nextEvent: "Birthday",     nextDays: 3  },
  { id: "dad",    name: "Dad",    emoji: "👔", rel: "Father",  health: "Healthy",         pct: 80, nextEvent: "Father's Day", nextDays: 28 },
  { id: "jenny",  name: "Jenny",  emoji: "💼", rel: "Client",  health: "Excellent",       pct: 95, nextEvent: "Work Anniv",   nextDays: 45 },
];

const HEALTH_COLORS: Record<HealthLevel, string> = {
  "Excellent": SAGE, "Healthy": SAGE, "Needs Attention": AMBER, "Priority": RED,
};

const NAV_TABS = [
  { id: "people",   icon: "👥",  label: "People" },
  { id: "moments",  icon: "🗓",  label: "Moments" },
  { id: "cards",    icon: "💌",  label: "Cards" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

function SmallRing({ pct, color, size = 40 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}22`} strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={9} fontWeight={700} fill={color}>{pct}%</text>
    </svg>
  );
}

export function Mobile() {
  const [activeTab, setActiveTab] = useState("people");
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ background: BLACK, padding: "14px 20px 12px", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: WHITE, letterSpacing: "0.05em" }}>YOUR PEOPLE</div>
      </div>

      {/* PEOPLE LIST */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PEOPLE.map(p => {
            const hc = HEALTH_COLORS[p.health];
            const isOpen = expanded === p.id;
            return (
              <div key={p.id} style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, overflow: "hidden" }}>
                {/* Row */}
                <div
                  onClick={() => toggle(p.id)}
                  style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                    <div style={{ fontSize: "0.7rem", color: GRAY }}>{p.rel}</div>
                  </div>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: hc, flexShrink: 0 }} />
                  <div style={{ padding: "4px 10px", borderRadius: 20, background: p.nextDays <= 7 ? `${RED}15` : `${SAGE}15`, color: p.nextDays <= 7 ? RED : SAGE, fontSize: "0.67rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {p.nextDays}d
                  </div>
                  <span style={{ fontSize: "0.7rem", color: GRAY, marginLeft: 4 }}>{isOpen ? "▲" : "▼"}</span>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0 10px" }}>
                      <SmallRing pct={p.pct} color={hc} size={56} />
                      <div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: hc, marginBottom: 3 }}>{p.health}</div>
                        <div style={{ fontSize: "0.72rem", color: GRAY }}>Next: {p.nextEvent}</div>
                        <div style={{ fontSize: "0.7rem", color: p.nextDays <= 7 ? RED : GRAY, fontWeight: p.nextDays <= 7 ? 700 : 400 }}>{p.nextDays} days away</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ flex: 1, padding: "10px 0", borderRadius: 9, background: RED, border: "none", color: WHITE, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Write Card</button>
                      <button style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: `2px solid ${SAGE}`, background: "none", color: SAGE, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>View Profile</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: `1px solid rgba(255,255,255,0.08)`, zIndex: 20 }}>
        {NAV_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === t.id ? RED : "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
