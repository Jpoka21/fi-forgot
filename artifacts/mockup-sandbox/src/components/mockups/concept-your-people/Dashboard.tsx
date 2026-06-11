// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const people = [
  { emoji: "👩", name: "Sarah",  rel: "Sister",  health: 82, ring: SAGE,    ringLabel: "Excellent",      daysNext: 8,  nextEvent: "Anniversary",  action: "Review Draft →",  priority: false },
  { emoji: "💛", name: "Mom",    rel: "Mother",  health: 54, ring: "#D97706",ringLabel: "Needs Attention",daysNext: 15, nextEvent: "Mother's Day",  action: "Add Details →",   priority: false },
  { emoji: "🤝", name: "Steve",  rel: "Friend",  health: 71, ring: SAGE,    ringLabel: "Healthy",        daysNext: 3,  nextEvent: "Birthday",      action: "Review Draft →",  priority: false },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  health: 42, ring: RED,     ringLabel: "Priority",       daysNext: 3,  nextEvent: "Birthday",      action: "Write Card →",    priority: true  },
  { emoji: "👔", name: "Dad",    rel: "Father",  health: 78, ring: SAGE,    ringLabel: "Healthy",        daysNext: 28, nextEvent: "Father's Day",  action: "View →",          priority: false },
  { emoji: "💼", name: "Jenny",  rel: "Client",  health: 91, ring: "#3B6E5B",ringLabel: "Excellent",     daysNext: 45, nextEvent: "Work Anniv.",   action: "View →",          priority: false },
];

function HealthRing({ pct, color, size = 44 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}22`} strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>{pct}%</text>
    </svg>
  );
}

export function Dashboard() {
  const [hov, setHov] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, height: 60, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: WHITE, letterSpacing: "0.06em" }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: RED, letterSpacing: "0.04em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>

        {/* Summary strip */}
        <div style={{ background: WHITE, borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, marginBottom: 24, border: `1.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: BLACK }}>5 people healthy</span>
          </div>
          <span style={{ color: BORDER }}>·</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: RED }} />
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: RED }}>1 needs attention</span>
          </div>
        </div>

        {/* Person cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
          {people.map(p => (
            <div
              key={p.name}
              onMouseEnter={() => setHov(p.name)}
              onMouseLeave={() => setHov(null)}
              style={{
                background: WHITE, borderRadius: 16, padding: "20px",
                border: p.priority ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                borderLeft: p.priority ? `4px solid ${RED}` : `1.5px solid ${BORDER}`,
                boxShadow: p.priority ? `0 3px 16px ${RED}18` : hov === p.name ? "0 4px 16px rgba(0,0,0,0.1)" : "0 1px 4px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "box-shadow 0.12s",
                display: "flex", flexDirection: "column", gap: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", border: `1.5px solid ${BORDER}` }}>{p.emoji}</div>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1 }}>{p.name}</div>
                    <span style={{ background: `${SAGE}18`, color: SAGE, padding: "2px 9px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 700 }}>{p.rel}</span>
                  </div>
                </div>
                <HealthRing pct={p.health} color={p.ring} size={48} />
              </div>

              <div style={{ fontSize: "0.72rem", color: GRAY, marginBottom: 8 }}>last updated 12 days ago</div>

              <div style={{ background: BG, borderRadius: 8, padding: "8px 12px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: BLACK }}>{p.nextEvent}</span>
                <span style={{ fontSize: "0.75rem", background: p.daysNext <= 7 ? `${RED}18` : `${SAGE}18`, color: p.daysNext <= 7 ? RED : SAGE, padding: "3px 8px", borderRadius: 8, fontWeight: 700 }}>in {p.daysNext}d</span>
              </div>

              <button style={{
                width: "100%", padding: "10px", borderRadius: 9,
                background: p.priority ? RED : SAGE,
                color: WHITE, border: "none",
                fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
              }}>
                {p.action}
              </button>
            </div>
          ))}

          {/* Add Person */}
          <div style={{ borderRadius: 16, border: `2px dashed ${SAGE}55`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", minHeight: 160 }}>
            <div style={{ fontSize: "2rem", color: SAGE }}>＋</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: SAGE }}>Add Person</div>
          </div>
        </div>

      </div>
    </div>
  );
}
