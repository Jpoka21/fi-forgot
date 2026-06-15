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
const AMBER = "#D97706";

const DARK_SAGE = "#3D6B4F";

const personCards = [
  { name: "Sarah",  rel: "Sister", emoji: "👩", health: 82, healthLabel: "Excellent",       ringColor: DARK_SAGE, nextEvent: "Anniversary", daysAway: 8,  action: "Review Draft →", priority: false, lastUpdated: 2  },
  { name: "Mom",    rel: "Mother", emoji: "💛", health: 54, healthLabel: "Needs Attention",  ringColor: AMBER,     nextEvent: "Mother's Day", daysAway: 15, action: "Add Details →",  priority: false, lastUpdated: 14 },
  { name: "Steve",  rel: "Friend", emoji: "🤝", health: 74, healthLabel: "Healthy",          ringColor: SAGE,      nextEvent: "Birthday",     daysAway: 3,  action: "Review Draft →", priority: false, lastUpdated: 5  },
  { name: "Marcus", rel: "Friend", emoji: "🧢", health: 38, healthLabel: "Priority",         ringColor: RED,       nextEvent: "Birthday",     daysAway: 3,  action: "Write Card →",   priority: true,  lastUpdated: 21 },
  { name: "Dad",    rel: "Father", emoji: "👔", health: 70, healthLabel: "Healthy",          ringColor: SAGE,      nextEvent: "Father's Day", daysAway: 28, action: "View →",          priority: false, lastUpdated: 7  },
  { name: "Jenny",  rel: "Client", emoji: "💼", health: 88, healthLabel: "Excellent",        ringColor: DARK_SAGE, nextEvent: "Work Anniv",   daysAway: 45, action: "View →",          priority: false, lastUpdated: 1  },
];

function HealthRing({ pct, color, size = 40 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}22`} strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fill={color}
        style={{ fontSize: size * 0.28, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {pct}%
      </text>
    </svg>
  );
}

export function Dashboard() {
  const [_hover, setHover] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14 }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 32, color: WHITE, letterSpacing: 1 }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "22px 24px 56px" }}>

        {/* Summary strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "12px 18px", background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, display: "inline-block" }} />
            <span style={{ fontSize: 13, color: BLACK, fontWeight: 600 }}>5 people healthy</span>
          </div>
          <span style={{ color: BORDER }}>·</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: RED, display: "inline-block" }} />
            <span style={{ fontSize: 13, color: RED, fontWeight: 700 }}>1 needs attention</span>
          </div>
          <div style={{ flex: 1 }} />
          <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "7px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            + Add Person
          </button>
        </div>

        {/* People grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {personCards.map((p) => (
            <div
              key={p.name}
              onMouseEnter={() => setHover(p.name)}
              onMouseLeave={() => setHover(null)}
              style={{
                background: WHITE,
                borderRadius: 18,
                padding: "22px 22px 18px",
                border: p.priority ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                borderLeft: p.priority ? `4px solid ${RED}` : `1.5px solid ${BORDER}`,
                boxShadow: p.priority ? `0 4px 20px ${RED}18` : "0 1px 4px rgba(0,0,0,0.05)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                    {p.emoji}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: BLACK, lineHeight: 1 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: GRAY, background: `${BLACK}08`, padding: "2px 8px", borderRadius: 20, display: "inline-block", marginTop: 4 }}>{p.rel}</div>
                  </div>
                </div>
                <HealthRing pct={p.health} color={p.ringColor} size={48} />
              </div>

              {/* Health label */}
              <div style={{ fontSize: 11, fontWeight: 700, color: p.ringColor, marginBottom: 10 }}>
                {p.healthLabel}
              </div>

              {/* Next event */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: `${p.ringColor}15`, color: p.ringColor, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                  {p.nextEvent} in {p.daysAway}d
                </div>
              </div>

              {/* Last updated */}
              <div style={{ fontSize: 11, color: GRAY, marginBottom: 14 }}>
                last updated {p.lastUpdated} day{p.lastUpdated !== 1 ? "s" : ""} ago
              </div>

              {/* Action button */}
              <button style={{
                width: "100%", padding: "9px 0",
                background: p.priority ? RED : "transparent",
                color: p.priority ? WHITE : BLACK,
                border: p.priority ? "none" : `1.5px solid ${BORDER}`,
                borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {p.action}
              </button>
            </div>
          ))}

          {/* Add person */}
          <div style={{ borderRadius: 18, border: `2px dashed ${SAGE}50`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 32, cursor: "pointer", minHeight: 180 }}>
            <span style={{ fontSize: 24, color: SAGE }}>+</span>
            <span style={{ fontSize: 14, color: SAGE, fontWeight: 700 }}>Add Person</span>
          </div>
        </div>

      </div>
    </div>
  );
}
