// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const DARK_SAGE = "#3D6B4F";
const AMBER = "#D97706";

interface Person {
  emoji: string; name: string; rel: string;
  health: "Excellent" | "Healthy" | "Needs Attention" | "Priority";
  pct: number; nextDays: number; nextEvent: string;
}

const PEOPLE: Person[] = [
  { emoji: "👩", name: "Sarah",  rel: "Sister",  health: "Excellent",      pct: 94, nextDays: 8,  nextEvent: "Anniversary" },
  { emoji: "💛", name: "Mom",    rel: "Mother",  health: "Needs Attention", pct: 52, nextDays: 15, nextEvent: "Mother's Day" },
  { emoji: "🤝", name: "Steve",  rel: "Friend",  health: "Healthy",         pct: 76, nextDays: 3,  nextEvent: "Birthday" },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  health: "Priority",        pct: 38, nextDays: 3,  nextEvent: "Birthday" },
  { emoji: "👔", name: "Dad",    rel: "Father",  health: "Healthy",         pct: 80, nextDays: 28, nextEvent: "Father's Day" },
];

function healthColor(h: Person["health"]) {
  if (h === "Excellent")       return DARK_SAGE;
  if (h === "Healthy")         return SAGE;
  if (h === "Needs Attention") return AMBER;
  return RED;
}

function MiniRing({ pct, color }: { pct: number; color: string }) {
  const r = 18, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <svg width={44} height={44}>
      <circle cx={22} cy={22} r={r} fill="none" stroke={`${color}22`} strokeWidth={5} />
      <circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform="rotate(-90 22 22)" />
      <text x={22} y={26} textAnchor="middle" fontSize={9} fontWeight={800} fill={color}>{pct}%</text>
    </svg>
  );
}

const TABS = [
  { icon: "👥", label: "People"  },
  { icon: "🗓", label: "Moments" },
  { icon: "💌", label: "Cards"   },
  { icon: "⚙️", label: "Settings"},
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative" as const, display: "flex", flexDirection: "column" as const }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "0 18px", height: 58, display: "flex", alignItems: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: WHITE, letterSpacing: 3 }}>YOUR PEOPLE</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 14px 80px" }}>
        {PEOPLE.map((p) => {
          const hc = healthColor(p.health);
          const expanded = expandedId === p.name;
          return (
            <div key={p.name} style={{ background: WHITE, borderRadius: 16, marginBottom: 10, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
              {/* Row */}
              <div
                onClick={() => setExpandedId(expanded ? null : p.name)}
                style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", cursor: "pointer" }}
              >
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${hc}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.72rem", color: GRAY }}>{p.rel}</div>
                </div>
                {/* Health dot */}
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: hc, flexShrink: 0 }} />
                {/* Next event badge */}
                <div style={{
                  background: p.nextDays <= 7 ? `${RED}12` : CREAM,
                  color: p.nextDays <= 7 ? RED : GRAY,
                  fontSize: "0.68rem", fontWeight: 700,
                  borderRadius: 20, padding: "4px 10px", flexShrink: 0,
                }}>
                  {p.nextDays}d
                </div>
                <span style={{ color: GRAY, fontSize: "0.8rem" }}>{expanded ? "▲" : "▼"}</span>
              </div>

              {/* Expanded */}
              {expanded && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: "16px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                    <MiniRing pct={p.pct} color={hc} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.82rem", color: hc }}>{p.health}</div>
                      <div style={{ fontSize: "0.75rem", color: BLACK, marginTop: 2 }}>Next: {p.nextEvent} in {p.nextDays} days</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: RED, color: WHITE, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>Send Card</button>
                    <button style={{ flex: 1, padding: "10px", borderRadius: 9, border: `1.5px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>Log Moment</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add person */}
        <div style={{ border: `2px dashed ${SAGE}55`, borderRadius: 16, padding: "18px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", color: SAGE, fontWeight: 700, fontSize: "0.85rem" }}>
          <span>+</span> Add Person
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, height: 64, display: "flex", alignItems: "center", justifyContent: "space-around", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3, padding: "8px 12px" }}>
            <span style={{ fontSize: "1.15rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === i ? RED : "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
