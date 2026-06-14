// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3"; const RED = "#E23B2E"; const BLACK = "#111111";
const SAGE = "#5B8C6B"; const GRAY = "#6B6B6B"; const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF"; const CREAM = "#FDF7EF";

type Person = {
  id: number; name: string; rel: string; emoji: string;
  healthPct: number; healthColor: string; healthLabel: string;
  nextEvent: string; daysAway: number; urgent: boolean;
};

const people: Person[] = [
  { id: 1, name: "Steve",  rel: "Friend",  emoji: "🤝", healthPct: 74, healthColor: SAGE,      healthLabel: "Healthy",    nextEvent: "Birthday",   daysAway: 3,  urgent: true  },
  { id: 2, name: "Sarah",  rel: "Sister",  emoji: "👩", healthPct: 82, healthColor: SAGE,      healthLabel: "Excellent",  nextEvent: "Anniversary",daysAway: 8,  urgent: false },
  { id: 3, name: "Mom",    rel: "Mother",  emoji: "💛", healthPct: 55, healthColor: "#F59E0B", healthLabel: "Needs Attn", nextEvent: "Mother's Day",daysAway: 15, urgent: false },
  { id: 4, name: "Marcus", rel: "Friend",  emoji: "🧢", healthPct: 41, healthColor: RED,       healthLabel: "Priority",   nextEvent: "Birthday",   daysAway: 3,  urgent: true  },
  { id: 5, name: "Dad",    rel: "Father",  emoji: "👔", healthPct: 68, healthColor: SAGE,      healthLabel: "Healthy",    nextEvent: "Father's Day",daysAway: 28, urgent: false },
  { id: 6, name: "Jenny",  rel: "Client",  emoji: "💼", healthPct: 88, healthColor: "#1B6B4E", healthLabel: "Excellent",  nextEvent: "Work Anniv", daysAway: 45, urgent: false },
];

const tabs = ["People", "Moments", "Cards", "Settings"];

function SmallRing({ pct, color, size = 40 }: { pct: number; color: string; size?: number }) {
  const r = size * 0.36; const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  const cx = size / 2; const cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}22`} strokeWidth={size * 0.1} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.1}
        strokeDasharray={`${c}`} strokeDashoffset={`${offset}`} strokeLinecap="round" />
    </svg>
  );
}

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(1);

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK, position: "relative" as const }}>
      {/* HEADER */}
      <div style={{ background: BLACK, padding: "0 18px", height: 54, display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: WHITE, letterSpacing: "0.04em" }}>YOUR PEOPLE</span>
      </div>

      {/* PEOPLE LIST */}
      <div style={{ padding: "16px 14px 80px", display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {people.map(p => {
          const isExp = expandedId === p.id;
          return (
            <div key={p.id} style={{ background: WHITE, borderRadius: 14, border: `1px solid ${p.urgent ? `${RED}40` : BORDER}`, overflow: "hidden" }}>
              {/* Row */}
              <div onClick={() => setExpandedId(isExp ? null : p.id)} style={{ padding: "13px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", border: `1px solid ${BORDER}`, flexShrink: 0 }}>
                  {p.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.7rem", color: GRAY }}>{p.rel}</div>
                </div>
                <SmallRing pct={p.healthPct} color={p.healthColor} size={32} />
                <div style={{ background: p.urgent ? `${RED}12` : CREAM, borderRadius: 20, padding: "3px 9px", fontSize: "0.68rem", fontWeight: 700, color: p.urgent ? RED : GRAY, flexShrink: 0, marginLeft: 4 }}>
                  {p.daysAway}d
                </div>
                <span style={{ fontSize: "0.7rem", color: GRAY, marginLeft: 2 }}>{isExp ? "▲" : "▼"}</span>
              </div>
              {/* Expanded */}
              {isExp && (
                <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0" }}>
                    <SmallRing pct={p.healthPct} color={p.healthColor} size={52} />
                    <div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: p.healthColor, marginBottom: 2 }}>{p.healthLabel} · {p.healthPct}%</div>
                      <div style={{ fontSize: "0.75rem", color: BLACK, fontWeight: 600 }}>{p.nextEvent}</div>
                      <div style={{ fontSize: "0.7rem", color: GRAY }}>{p.daysAway} days away</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", background: p.urgent ? RED : BLACK, color: WHITE, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {p.urgent ? "Write Card" : "View Profile"}
                    </button>
                    <button style={{ flex: 1, padding: "9px", borderRadius: 9, border: `1px solid ${BORDER}`, background: WHITE, color: BLACK, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Log Moment
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BOTTOM NAV */}
      <div style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: BLACK, height: 64, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 3, padding: "8px 12px" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: i === activeTab ? RED : "rgba(255,255,255,0.45)", letterSpacing: "0.04em" }}>{t.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
