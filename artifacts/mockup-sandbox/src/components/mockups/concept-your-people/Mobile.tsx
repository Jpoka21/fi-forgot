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

type Ring = "excellent" | "needs-attention" | "healthy" | "priority";
const ringColors: Record<Ring, string> = {
  excellent: "#3D7A56",
  healthy: SAGE,
  "needs-attention": "#D97706",
  priority: RED,
};

const people = [
  { id: 1, emoji: "👩",  name: "Sarah",  rel: "Sister",  health: "excellent" as Ring,        pct: 88, nextDays: 8,  nextEvent: "Anniversary",  action1: "Review Draft", action2: "View Profile" },
  { id: 2, emoji: "💛",  name: "Mom",    rel: "Mother",  health: "needs-attention" as Ring,  pct: 54, nextDays: 15, nextEvent: "Mother's Day", action1: "Add Details",  action2: "View Profile" },
  { id: 3, emoji: "🤝",  name: "Steve",  rel: "Friend",  health: "healthy" as Ring,          pct: 72, nextDays: 3,  nextEvent: "Birthday",     action1: "Review Draft", action2: "View Profile" },
  { id: 4, emoji: "🧢",  name: "Marcus", rel: "Friend",  health: "priority" as Ring,         pct: 60, nextDays: 3,  nextEvent: "Birthday",     action1: "Write Card",   action2: "View Profile" },
  { id: 5, emoji: "👔",  name: "Dad",    rel: "Father",  health: "healthy" as Ring,          pct: 76, nextDays: 28, nextEvent: "Father's Day", action1: "View",          action2: "View Profile" },
  { id: 6, emoji: "💼",  name: "Jenny",  rel: "Client",  health: "excellent" as Ring,        pct: 91, nextDays: 45, nextEvent: "Work Anniv",   action1: "View",          action2: "View Profile" },
];

function MiniRing({ pct, ring, size = 36 }: { pct: number; ring: Ring; size?: number }) {
  const r = (size - 5) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const col = ringColors[ring];
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={BORDER} strokeWidth={4} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />
      </div>
    </div>
  );
}

export function Mobile() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  void activeTab;

  return (
    <div style={{ width: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative" }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 20px 12px" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: WHITE, letterSpacing: 2 }}>YOUR PEOPLE</div>
        <div style={{ fontFamily: "'Caveat', cursive", fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>6 people · 5 healthy · 1 priority</div>
      </div>

      {/* People list */}
      <div style={{ padding: "16px 16px 100px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {people.map((p) => {
            const isExpanded = expanded === p.id;
            const col = ringColors[p.health];
            return (
              <div
                key={p.id}
                style={{
                  background: WHITE,
                  borderRadius: 14,
                  border: p.health === "priority" ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                  overflow: "hidden",
                  boxShadow: isExpanded ? "0 4px 16px rgba(0,0,0,0.1)" : "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "box-shadow 0.2s",
                }}
              >
                {/* Row */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : p.id)}
                  style={{
                    padding: "13px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                    {p.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: BLACK }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: GRAY }}>{p.rel}</div>
                  </div>
                  <MiniRing pct={p.pct} ring={p.health} size={32} />
                  <div style={{
                    background: p.nextDays <= 7 ? RED + "15" : CREAM,
                    color: p.nextDays <= 7 ? RED : GRAY,
                    borderRadius: 20,
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}>
                    {p.nextDays}d
                  </div>
                  <div style={{ color: GRAY, fontSize: 14, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div style={{ borderTop: `1px solid ${BORDER}`, padding: "14px 16px", background: CREAM }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                      {/* Health ring */}
                      <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
                        <svg width={56} height={56} style={{ transform: "rotate(-90deg)" }}>
                          <circle cx={28} cy={28} r={22} fill="none" stroke={BORDER} strokeWidth={6} />
                          <circle cx={28} cy={28} r={22} fill="none" stroke={col} strokeWidth={6}
                            strokeDasharray={`${(p.pct / 100) * 2 * Math.PI * 22} ${2 * Math.PI * 22}`} strokeLinecap="round" />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 14, color: col, lineHeight: 1 }}>{p.pct}%</div>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: BLACK }}>{p.nextEvent}</div>
                        <div style={{ fontSize: 12, color: p.nextDays <= 7 ? RED : GRAY, fontWeight: 600, marginTop: 2 }}>{p.nextDays} days away</div>
                        <div style={{ fontSize: 11, color: GRAY, marginTop: 2, fontFamily: "'Caveat', cursive" }}>
                          {p.health === "excellent" ? "Excellent shape" : p.health === "needs-attention" ? "Needs attention" : p.health === "priority" ? "Priority" : "Healthy"}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ flex: 1, background: p.health === "priority" ? RED : SAGE, color: WHITE, border: "none", borderRadius: 9, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {p.action1}
                      </button>
                      <button style={{ flex: 1, background: "transparent", border: `1.5px solid ${BORDER}`, color: BLACK, borderRadius: 9, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {p.action2}
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
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 390,
        background: BLACK,
        display: "flex",
        padding: "10px 0 20px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
      }}>
        {[
          { icon: "👥", label: "People",   active: true  },
          { icon: "🗓", label: "Moments",  active: false },
          { icon: "💌", label: "Cards",    active: false },
          { icon: "⚙️", label: "Settings", active: false },
        ].map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: t.active ? RED : "rgba(255,255,255,0.45)", fontWeight: 700 }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
