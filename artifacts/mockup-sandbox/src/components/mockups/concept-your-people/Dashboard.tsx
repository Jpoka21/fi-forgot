// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706", DARKGREEN = "#166534";

const people = [
  { emoji: "👩", name: "Sarah",  rel: "Sister",  status: "Excellent",      statusColor: DARKGREEN, ring: DARKGREEN, pct: 92, nextEvent: "Anniversary", daysAway: 8,  action: "Review Draft →",    lastDays: 5 },
  { emoji: "💛", name: "Mom",    rel: "Mother",  status: "Needs Attention", statusColor: AMBER,     ring: AMBER,     pct: 54, nextEvent: "Mother's Day", daysAway: 15, action: "Add Details →",     lastDays: 32, priority: false },
  { emoji: "🤝", name: "Steve",  rel: "Friend",  status: "Healthy",        statusColor: SAGE,      ring: SAGE,      pct: 78, nextEvent: "Birthday",     daysAway: 3,  action: "Review Draft →",    lastDays: 12 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  status: "Priority",       statusColor: RED,       ring: RED,       pct: 44, nextEvent: "Birthday",     daysAway: 3,  action: "Write Card →",      lastDays: 61, isPriority: true },
  { emoji: "👔", name: "Dad",    rel: "Father",  status: "Healthy",        statusColor: SAGE,      ring: SAGE,      pct: 81, nextEvent: "Father's Day", daysAway: 28, action: "View →",            lastDays: 18 },
  { emoji: "💼", name: "Jenny",  rel: "Client",  status: "Excellent",      statusColor: DARKGREEN, ring: DARKGREEN, pct: 95, nextEvent: "Work Anniv",   daysAway: 45, action: "View →",            lastDays: 3 },
];

function Ring({ size, pct, color }: { size: number; pct: number; color: string }) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BORDER} strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={10} fill={color} fontWeight="700">{pct}%</text>
    </svg>
  );
}

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ background: BLACK, height: 56, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: WHITE, letterSpacing: "0.04em" }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 24px" }}>
        {/* Summary strip */}
        <div style={{ background: WHITE, borderRadius: 10, padding: "11px 18px", marginBottom: 22, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: DARKGREEN }} />
            <span style={{ fontSize: "0.82rem", color: GRAY }}>5 people healthy</span>
          </div>
          <div style={{ width: 1, height: 16, background: BORDER }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: RED }} />
            <span style={{ fontSize: "0.82rem", color: GRAY, fontWeight: 600 }}>1 needs attention</span>
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <span style={{ fontSize: "0.76rem", color: GRAY }}>6 people · updated today</span>
          </div>
        </div>

        {/* People grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {people.map((p, i) => (
            <div key={i}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{
                background: WHITE, borderRadius: 14,
                border: `1px solid ${p.isPriority ? RED + "50" : BORDER}`,
                borderLeft: `4px solid ${p.isPriority ? RED : p.ring}`,
                padding: "18px 18px 14px",
                boxShadow: hov === i ? "0 4px 18px rgba(0,0,0,0.08)" : "none",
                transition: "box-shadow 0.15s", cursor: "pointer",
              }}>
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                {/* Avatar */}
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
                  {p.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, lineHeight: 1, marginBottom: 5 }}>{p.name.toUpperCase()}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ padding: "2px 9px", borderRadius: 20, background: CREAM, color: GRAY, fontSize: "0.7rem", fontWeight: 600 }}>{p.rel}</span>
                    <span style={{ padding: "2px 9px", borderRadius: 20, background: `${p.statusColor}15`, color: p.statusColor, fontSize: "0.7rem", fontWeight: 700 }}>{p.status}</span>
                  </div>
                </div>
                {/* Health ring */}
                <Ring size={50} pct={p.pct} color={p.ring} />
              </div>

              {/* Context */}
              <div style={{ padding: "10px 12px", borderRadius: 8, background: BG, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>{p.nextEvent}</span>
                  <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: 20, background: p.daysAway <= 7 ? `${RED}15` : `${SAGE}15`, color: p.daysAway <= 7 ? RED : SAGE, fontWeight: 700 }}>
                    {p.daysAway}d away
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 3 }}>Last updated {p.lastDays}d ago</div>
              </div>

              {/* Action */}
              <button style={{
                width: "100%", padding: "8px", borderRadius: 8, border: `1px solid ${p.isPriority ? RED : BORDER}`,
                background: p.isPriority ? RED : "transparent", color: p.isPriority ? WHITE : BLACK,
                fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
              }}>
                {p.action}
              </button>
            </div>
          ))}

          {/* Add person */}
          <div style={{ borderRadius: 14, border: `2px dashed ${SAGE}60`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", minHeight: 140 }}>
            <div style={{ fontSize: "1.6rem" }}>+</div>
            <div style={{ fontWeight: 700, fontSize: "0.84rem", color: SAGE }}>Add Person</div>
          </div>
        </div>
      </div>
    </div>
  );
}
