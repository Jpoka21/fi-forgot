// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const people = [
  { name: "Sarah",  rel: "Sister",  emoji: "👩", status: "Excellent",        ring: SAGE,           ringPct: 92, event: "Anniversary",  days: 8,  action: "Review Draft →",  priority: false },
  { name: "Mom",    rel: "Mother",  emoji: "💛", status: "Needs Attention",  ring: AMBER,          ringPct: 54, event: "Mother's Day", days: 15, action: "Add Details →",   priority: false },
  { name: "Steve",  rel: "Friend",  emoji: "🤝", status: "Healthy",          ring: SAGE,           ringPct: 76, event: "Birthday",     days: 3,  action: "Review Draft →",  priority: false },
  { name: "Marcus", rel: "Friend",  emoji: "🧢", status: "Priority",         ring: RED,            ringPct: 48, event: "Birthday",     days: 3,  action: "Write Card →",    priority: true  },
  { name: "Dad",    rel: "Father",  emoji: "👔", status: "Healthy",          ring: SAGE,           ringPct: 80, event: "Father's Day", days: 28, action: "View →",          priority: false },
  { name: "Jenny",  rel: "Client",  emoji: "💼", status: "Excellent",        ring: "#166534",      ringPct: 94, event: "Work Anniv",   days: 45, action: "View →",          priority: false },
];

function HealthRing({ pct, color, size = 44 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BORDER} strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={9} fontWeight="bold" fill={BLACK}>{pct}%</text>
    </svg>
  );
}

export function Dashboard() {
  const [, setHov] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: WHITE, letterSpacing: "0.04em" }}>YOUR PEOPLE</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: RED, letterSpacing: "0.05em" }}>F.I. FORGOT</span>
      </div>

      {/* Summary strip */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        {[
          { color: SAGE,  label: "5 people healthy" },
          { color: RED,   label: "1 needs attention" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
            <span style={{ fontSize: "0.78rem", color: GRAY, fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>

        {/* People grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {people.map(p => (
            <div
              key={p.name}
              onMouseEnter={() => setHov(p.name)}
              onMouseLeave={() => setHov(null)}
              style={{
                background: WHITE,
                borderRadius: 14,
                border: `1px solid ${p.priority ? RED + "40" : BORDER}`,
                borderLeft: `4px solid ${p.priority ? RED : "transparent"}`,
                padding: "18px 18px 14px",
                cursor: "pointer",
                boxShadow: p.priority ? `0 2px 16px ${RED}14` : "0 1px 6px rgba(0,0,0,0.04)",
              }}
            >
              {/* Top row: emoji + name + ring */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", background: CREAM,
                  border: `3px solid ${p.ring}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem", flexShrink: 0,
                }}>
                  {p.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1.1 }}>{p.name}</div>
                  <span style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "1px 8px", fontSize: "0.68rem", color: GRAY, fontWeight: 600 }}>{p.rel}</span>
                </div>
                <HealthRing pct={p.ringPct} color={p.ring} size={44} />
              </div>

              {/* Event chip */}
              <div style={{
                background: p.days <= 7 ? `${RED}10` : CREAM,
                border: `1px solid ${p.days <= 7 ? RED + "30" : BORDER}`,
                borderRadius: 8, padding: "7px 10px", marginBottom: 8,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: p.days <= 7 ? RED : BLACK }}>{p.event}</span>
                <span style={{ fontSize: "0.72rem", color: p.days <= 7 ? RED : GRAY, fontWeight: 600 }}>{p.days}d</span>
              </div>

              {/* Last updated */}
              <div style={{ fontSize: "0.68rem", color: GRAY, marginBottom: 12 }}>
                Last updated 12 days ago
              </div>

              {/* Action button */}
              <button style={{
                width: "100%", padding: "9px 0", borderRadius: 9, border: "none",
                background: p.priority ? RED : BLACK,
                color: WHITE, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {p.action}
              </button>
            </div>
          ))}

          {/* Add person dashed */}
          <div style={{
            background: "transparent", borderRadius: 14, border: `2px dashed ${SAGE}55`,
            padding: "18px", cursor: "pointer", minHeight: 160,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <div style={{ fontSize: "1.8rem", color: SAGE }}>+</div>
            <div style={{ fontSize: "0.8rem", color: SAGE, fontWeight: 600 }}>Add Person</div>
          </div>
        </div>
      </div>
    </div>
  );
}
