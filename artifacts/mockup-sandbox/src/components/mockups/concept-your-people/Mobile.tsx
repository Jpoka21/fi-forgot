// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706", DARK_SAGE = "#3D6B50";

type Tab = "people" | "moments" | "cards" | "settings";
type HealthLevel = "excellent" | "healthy" | "needs-attention" | "priority";

const HEALTH_COLOR: Record<HealthLevel, string> = {
  excellent: DARK_SAGE, healthy: SAGE, "needs-attention": AMBER, priority: RED,
};

const PEOPLE = [
  { emoji: "👩", name: "Sarah",  rel: "Sister",  health: "excellent" as HealthLevel,      pct: 88, nextDays: 8,  nextEvent: "Anniversary in 8 days",   nextAction: "Review Draft →" },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  health: "priority" as HealthLevel,       pct: 42, nextDays: 3,  nextEvent: "Birthday in 3 days",      nextAction: "Write Card →"   },
  { emoji: "🤝", name: "Steve",  rel: "Friend",  health: "healthy" as HealthLevel,        pct: 74, nextDays: 3,  nextEvent: "Birthday in 3 days",      nextAction: "Review Draft →" },
  { emoji: "💛", name: "Mom",    rel: "Mother",  health: "needs-attention" as HealthLevel, pct: 54, nextDays: 15, nextEvent: "Mother's Day in 15 days", nextAction: "Add Details →"  },
  { emoji: "👔", name: "Dad",    rel: "Father",  health: "healthy" as HealthLevel,        pct: 76, nextDays: 28, nextEvent: "Father's Day in 28 days", nextAction: "View →"         },
  { emoji: "💼", name: "Jenny",  rel: "Client",  health: "excellent" as HealthLevel,      pct: 91, nextDays: 45, nextEvent: "Work Anniv in 45 days",   nextAction: "View →"         },
];

function SmallRing({ pct, color }: { pct: number; color: string }) {
  const r = 16; const circ = 2 * Math.PI * r;
  return (
    <svg width={38} height={38} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={19} cy={19} r={r} fill="none" stroke={`${color}20`} strokeWidth={4} />
      <circle cx={19} cy={19} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round" />
    </svg>
  );
}

export function Mobile() {
  const [tab, setTab] = useState<Tab>("people");
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: WHITE, letterSpacing: "0.08em" }}>YOUR PEOPLE</span>
          <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>6 people</span>
        </div>
        <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Caveat', cursive" }}>5 healthy · 1 needs attention</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 70 }}>
        <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {PEOPLE.map((p) => {
            const hc = HEALTH_COLOR[p.health];
            const isExp = expanded === p.name;
            return (
              <div key={p.name} style={{ background: WHITE, borderRadius: 14, border: isExp ? `1.5px solid ${hc}40` : `1.5px solid ${BORDER}`, overflow: "hidden", transition: "border-color 0.2s" }}>
                {/* Row */}
                <div
                  onClick={() => setExpanded(isExp ? null : p.name)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", cursor: "pointer" }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                    <div style={{ fontSize: "0.7rem", color: GRAY }}>{p.rel}</div>
                  </div>
                  {/* Health dot */}
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: hc, flexShrink: 0 }} />
                  {/* Next event badge */}
                  <div style={{
                    background: p.nextDays <= 7 ? `${RED}12` : CREAM,
                    color: p.nextDays <= 7 ? RED : GRAY,
                    border: `1px solid ${p.nextDays <= 7 ? RED + "30" : BORDER}`,
                    borderRadius: 20, padding: "3px 9px",
                    fontSize: "0.68rem", fontWeight: 700, flexShrink: 0,
                  }}>{p.nextDays}d</div>
                  <span style={{ fontSize: "0.72rem", color: GRAY, transform: isExp ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                </div>

                {/* Expanded panel */}
                {isExp && (
                  <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0" }}>
                      {/* Ring */}
                      <div style={{ position: "relative" as const }}>
                        <SmallRing pct={p.pct} color={hc} />
                        <div style={{ position: "absolute" as const, inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "0.58rem", fontWeight: 800, color: hc }}>{p.pct}%</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>{p.nextEvent}</div>
                        <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 2 }}>Last updated 5 days ago</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ flex: 2, padding: "9px", borderRadius: 10, border: "none", background: hc, color: WHITE, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {p.nextAction}
                      </button>
                      <button style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1.5px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        Profile
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
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", height: 64, zIndex: 20 }}>
        {[
          { id: "people" as Tab, icon: "👥", label: "People" },
          { id: "moments" as Tab, icon: "🗓", label: "Moments" },
          { id: "cards" as Tab, icon: "💌", label: "Cards" },
          { id: "settings" as Tab, icon: "⚙️", label: "Settings" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 3 }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: tab === t.id ? RED : "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
