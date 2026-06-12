// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

type Health = "Excellent" | "Healthy" | "Needs Attention" | "Priority";

const people = [
  { id: 1, emoji: "🤝", name: "Steve",  rel: "Friend",  health: "Healthy"        as Health, dot: SAGE,       next: "Birthday",     days: 3,  action1: "Review Draft", action2: "Add Memory" },
  { id: 2, emoji: "👩", name: "Sarah",  rel: "Sister",  health: "Excellent"      as Health, dot: "#3d7a59",  next: "Anniversary",  days: 8,  action1: "Review Draft", action2: "Add Memory" },
  { id: 3, emoji: "💛", name: "Mom",    rel: "Mother",  health: "Needs Attention"as Health, dot: "#B45309",  next: "Mother's Day", days: 15, action1: "Add Details",  action2: "Write Card" },
  { id: 4, emoji: "🧢", name: "Marcus", rel: "Friend",  health: "Priority"       as Health, dot: RED,        next: "Birthday",     days: 3,  action1: "Write Card",   action2: "Answer Q" },
  { id: 5, emoji: "👔", name: "Dad",    rel: "Father",  health: "Healthy"        as Health, dot: SAGE,       next: "Father's Day", days: 28, action1: "View",         action2: "Add Memory" },
  { id: 6, emoji: "💼", name: "Jenny",  rel: "Client",  health: "Excellent"      as Health, dot: "#3d7a59",  next: "Work Anniv",   days: 45, action1: "View",         action2: "Log Moment" },
];

function SmallRing({ pct, color }: { pct: number; color: string }) {
  const r = 18, cx = 22, cy = 22, circ = 2 * Math.PI * r;
  return (
    <svg width={44} height={44}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${color}22`} strokeWidth={4} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="8" fontWeight="700" fill={color} fontFamily="'Plus Jakarta Sans', sans-serif">{pct}%</text>
    </svg>
  );
}

const ringPct: Record<string, number> = { Steve: 74, Sarah: 82, Mom: 51, Marcus: 68, Dad: 77, Jenny: 90 };

const navTabs = [
  { icon: "👥", label: "People" },
  { icon: "🗓", label: "Moments" },
  { icon: "💌", label: "Cards" },
  { icon: "⚙️", label: "Settings" },
];

export function Mobile() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ width: 390, minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ background: BLACK, padding: "14px 18px 12px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: WHITE, letterSpacing: "0.04em" }}>YOUR PEOPLE</span>
      </div>

      {/* People list */}
      <div style={{ padding: "14px 14px 100px", display: "flex", flexDirection: "column", gap: 8 }}>
        {people.map(p => (
          <div key={p.id} style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, overflow: "hidden" }}>
            {/* Row */}
            <div
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
            >
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 1 }}>{p.rel}</div>
              </div>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.dot, flexShrink: 0 }} />
              <div style={{
                padding: "3px 9px", borderRadius: 20, fontSize: "0.65rem", fontWeight: 700, flexShrink: 0,
                background: p.days <= 7 ? `${RED}12` : `${BLACK}08`,
                color: p.days <= 7 ? RED : GRAY,
                border: `1px solid ${p.days <= 7 ? `${RED}40` : BORDER}`,
              }}>
                {p.days}d
              </div>
            </div>

            {/* Expanded */}
            {expanded === p.id && (
              <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${BORDER}` }}>
                <div style={{ paddingTop: 12, display: "flex", alignItems: "center", gap: 14 }}>
                  <SmallRing pct={ringPct[p.name] ?? 75} color={p.dot} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 600, color: BLACK }}>{p.health}</div>
                    <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 2 }}>Next: {p.next} · {p.days} days</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button style={{ flex: 1, padding: "9px 0", borderRadius: 9, background: p.days <= 7 ? RED : BLACK, border: "none", color: WHITE, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>{p.action1}</button>
                  <button style={{ flex: 1, padding: "9px 0", borderRadius: 9, background: "none", border: `1.5px solid ${BORDER}`, color: BLACK, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>{p.action2}</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 390, background: BLACK, display: "flex", borderTop: `1px solid ${WHITE}10` }}>
        {navTabs.map((t, i) => (
          <button key={t.label} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: "10px 0 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.58rem", fontWeight: 700, color: activeTab === i ? RED : `${WHITE}50`, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
