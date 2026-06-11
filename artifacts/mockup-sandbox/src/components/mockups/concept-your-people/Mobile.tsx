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

type HealthColor = string;
const healthDot: Record<string, HealthColor> = {
  excellent:        "#2D6A4F",
  healthy:          SAGE,
  "needs-attention": "#D97706",
  priority:         RED,
};

const people = [
  { id: 1, name: "Marcus", rel: "Friend", emoji: "🧢", health: "priority",        nextDays: 3,  nextEvent: "Birthday",     nextDate: "Jun 14", ring: RED,     pct: 38, action: "Write Card" },
  { id: 2, name: "Steve",  rel: "Friend", emoji: "🤝", health: "healthy",          nextDays: 3,  nextEvent: "Birthday",     nextDate: "Jun 14", ring: SAGE,    pct: 74, action: "Review Draft" },
  { id: 3, name: "Sarah",  rel: "Sister", emoji: "👩",  health: "excellent",        nextDays: 8,  nextEvent: "Anniversary",  nextDate: "Jun 19", ring: "#2D6A4F", pct: 92, action: "Review Draft" },
  { id: 4, name: "Mom",    rel: "Mother", emoji: "💛",  health: "needs-attention",  nextDays: 15, nextEvent: "Mother's Day", nextDate: "Jun 26", ring: "#D97706", pct: 48, action: "Add Details" },
  { id: 5, name: "Dad",    rel: "Father", emoji: "👔",  health: "healthy",          nextDays: 28, nextEvent: "Father's Day", nextDate: "Jul 9",  ring: SAGE,    pct: 74, action: "View" },
  { id: 6, name: "Jenny",  rel: "Client", emoji: "💼",  health: "excellent",        nextDays: 45, nextEvent: "Work Anniv",   nextDate: "Jul 25", ring: "#2D6A4F", pct: 92, action: "View" },
];

const tabs = ["People", "Moments", "Cards", "Settings"];

export function Mobile() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, width: 390, minHeight: "100vh", margin: "0 auto", color: BLACK, paddingBottom: 70 }}>
      <div style={{ background: BLACK, padding: "16px 20px", display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: WHITE, flex: 1, letterSpacing: "0.06em" }}>YOUR PEOPLE</span>
        <button style={{ background: SAGE, color: WHITE, border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}>+ Add</button>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ background: WHITE, borderRadius: 16, border: `1.5px solid ${BORDER}`, overflow: "hidden" }}>
          {people.map((p, i) => (
            <div key={p.id}>
              <div
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: `1px solid ${BORDER}`, cursor: "pointer", background: expanded === p.id ? CREAM : WHITE }}
              >
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.75rem", color: GRAY }}>{p.rel}</div>
                </div>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: healthDot[p.health], flexShrink: 0 }} />
                <span style={{ padding: "3px 9px", borderRadius: 20, background: p.nextDays <= 7 ? `${RED}15` : CREAM, border: `1px solid ${p.nextDays <= 7 ? RED : BORDER}`, fontSize: "0.7rem", fontWeight: 700, color: p.nextDays <= 7 ? RED : GRAY, marginLeft: 6 }}>{p.nextDays}d</span>
              </div>

              {expanded === p.id && (
                <div style={{ padding: "14px 16px", borderBottom: i < people.length - 1 ? `1px solid ${BORDER}` : "none", background: CREAM }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                    {/* Mini health ring */}
                    <svg width={56} height={56}>
                      <circle cx={28} cy={28} r={22} fill="none" stroke={`${p.ring}22`} strokeWidth={5} />
                      <circle cx={28} cy={28} r={22} fill="none" stroke={p.ring} strokeWidth={5}
                        strokeDasharray={`${(p.pct / 100) * 2 * Math.PI * 22} 999`} strokeLinecap="round"
                        transform="rotate(-90 28 28)" />
                      <text x={28} y={33} textAnchor="middle" fontSize={10} fill={p.ring} fontWeight="800">{p.pct}%</text>
                    </svg>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", color: BLACK, marginBottom: 2 }}>{p.nextEvent}</div>
                      <div style={{ fontSize: "0.78rem", color: GRAY }}>{p.nextDate} · {p.nextDays} days away</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", background: p.health === "priority" ? RED : SAGE, color: WHITE, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>{p.action} →</button>
                    <button style={{ flex: 1, padding: "9px", borderRadius: 9, border: `1.5px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>Profile</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: activeTab === i ? RED : "rgba(255,255,255,0.45)", letterSpacing: "0.02em", textTransform: "uppercase" }}>{t}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
