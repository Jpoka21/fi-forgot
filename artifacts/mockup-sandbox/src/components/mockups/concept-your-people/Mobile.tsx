// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";

type Person = { id: string; emoji: string; name: string; rel: string; healthColor: string; healthPct: number; nextEvent: string; nextDays: number; action: string };

const PEOPLE: Person[] = [
  { id: "sarah", emoji: "👩", name: "Sarah", rel: "Sister", healthColor: "#3A6B4E", healthPct: 92, nextEvent: "Anniversary · Jun 19", nextDays: 8, action: "Review Draft" },
  { id: "mom", emoji: "💛", name: "Mom", rel: "Mother", healthColor: "#D97706", healthPct: 58, nextEvent: "Mother's Day · Jun 26", nextDays: 15, action: "Add Details" },
  { id: "steve", emoji: "🤝", name: "Steve", rel: "Friend", healthColor: SAGE, healthPct: 78, nextEvent: "Birthday · Jun 14", nextDays: 3, action: "Review Draft" },
  { id: "marcus", emoji: "🧢", name: "Marcus", rel: "Friend", healthColor: RED, healthPct: 42, nextEvent: "Birthday · Jun 14", nextDays: 3, action: "Write Card" },
  { id: "dad", emoji: "👔", name: "Dad", rel: "Father", healthColor: SAGE, healthPct: 80, nextEvent: "Father's Day · Jul 9", nextDays: 28, action: "View" },
  { id: "jenny", emoji: "💼", name: "Jenny", rel: "Client", healthColor: "#3A6B4E", healthPct: 94, nextEvent: "Work Anniv · Jul 27", nextDays: 45, action: "View" },
];

function MiniRing({ pct, color }: { pct: number; color: string }) {
  const r = 14; const circ = 2 * Math.PI * r;
  return (
    <svg width={32} height={32} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={16} cy={16} r={r} fill="none" stroke={`${color}25`} strokeWidth={4} />
      <circle cx={16} cy={16} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${(pct / 100) * circ} ${(1 - pct / 100) * circ}`} strokeLinecap="round" />
    </svg>
  );
}

export function Mobile() {
  const [activeTab, setActiveTab] = useState("people");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column" as const }}>
      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: WHITE, letterSpacing: "0.04em" }}>YOUR PEOPLE</span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {PEOPLE.map(p => (
            <div key={p.id}>
              <div
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                style={{ background: WHITE, borderRadius: 14, border: `1px solid ${expandedId === p.id ? p.healthColor : BORDER}`, padding: "14px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "border-color 0.15s" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{p.name}</div>
                  <div style={{ fontSize: "0.72rem", color: GRAY }}>{p.rel}</div>
                </div>
                <div style={{ position: "relative" as const, display: "flex", alignItems: "center", justifyContent: "center", marginRight: 4 }}>
                  <MiniRing pct={p.healthPct} color={p.healthColor} />
                  <span style={{ position: "absolute" as const, fontSize: "0.48rem", fontWeight: 700, color: p.healthColor }}>{p.healthPct}</span>
                </div>
                <span style={{ background: p.nextDays <= 7 ? `${RED}14` : `${GRAY}12`, color: p.nextDays <= 7 ? RED : GRAY, borderRadius: 20, padding: "4px 10px", fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap" as const }}>{p.nextDays}d</span>
              </div>

              {/* Expanded inline */}
              {expandedId === p.id && (
                <div style={{ background: WHITE, borderRadius: "0 0 14px 14px", border: `1px solid ${p.healthColor}`, borderTop: "none", padding: "14px 14px 14px 66px" }}>
                  <div style={{ fontSize: "0.78rem", color: GRAY, marginBottom: 10 }}>Next: {p.nextEvent}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ flex: 1, background: p.action === "Write Card" ? RED : `${p.healthColor}18`, color: p.action === "Write Card" ? WHITE : p.healthColor, border: "none", borderRadius: 8, padding: "9px 0", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>{p.action}</button>
                    <button style={{ flex: 1, background: `${BLACK}08`, color: BLACK, border: "none", borderRadius: 8, padding: "9px 0", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>View Profile</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, display: "flex", borderTop: "1px solid #ffffff14" }}>
        {[{ key: "people", icon: "👥", label: "People" }, { key: "moments", icon: "🗓", label: "Moments" }, { key: "cards", icon: "💌", label: "Cards" }, { key: "settings", icon: "⚙️", label: "Settings" }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, padding: "10px 0 14px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.2rem" }}>{tab.icon}</span>
            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: activeTab === tab.key ? RED : "#ffffff50" }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
