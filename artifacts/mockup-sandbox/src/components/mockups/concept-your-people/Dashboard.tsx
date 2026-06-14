// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";
const DARK_SAGE = "#3d6b4f";

type HealthRing = { pct: number; color: string; label: string };

function Ring({ pct, color, size = 52 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}22`} strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

const people = [
  { emoji: "👩", name: "Sarah",  rel: "Sister",  status: "Excellent",        statusColor: DARK_SAGE, ring: { pct: 92, color: DARK_SAGE }, nextEvent: "Anniversary in 8 days",  action: "Review Draft →",   priority: false },
  { emoji: "💛", name: "Mom",    rel: "Mother",  status: "Needs Attention",  statusColor: AMBER,     ring: { pct: 54, color: AMBER },     nextEvent: "Mother's Day in 15 days", action: "Add Details →",   priority: false },
  { emoji: "🤝", name: "Steve",  rel: "Friend",  status: "Healthy",          statusColor: SAGE,      ring: { pct: 78, color: SAGE },      nextEvent: "Birthday in 3 days",      action: "Review Draft →",   priority: false },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  status: "Priority",         statusColor: RED,       ring: { pct: 41, color: RED },       nextEvent: "Birthday in 3 days",      action: "Write Card →",     priority: true  },
  { emoji: "👔", name: "Dad",    rel: "Father",  status: "Healthy",          statusColor: SAGE,      ring: { pct: 75, color: SAGE },      nextEvent: "Father's Day in 28 days", action: "View →",           priority: false },
  { emoji: "💼", name: "Jenny",  rel: "Client",  status: "Excellent",        statusColor: DARK_SAGE, ring: { pct: 88, color: DARK_SAGE }, nextEvent: "Work Anniv in 45 days",   action: "View →",           priority: false },
];

export function Dashboard() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: "0.04em" }}>YOUR PEOPLE</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
          <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "7px 14px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>+ ADD</button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 48px" }}>

        {/* Summary strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, padding: "12px 18px", background: WHITE, borderRadius: 12, border: `1.5px solid ${BORDER}` }}>
          {[{ color: DARK_SAGE, label: "Excellent" }, { color: SAGE, label: "Healthy" }, { color: AMBER, label: "Needs Attention" }, { color: RED, label: "Priority" }].map(d => (
            <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: "0.78rem", color: GRAY }}>{d.label}</span>
            </div>
          ))}
          <div style={{ width: 1, height: 16, background: BORDER, margin: "0 4px" }} />
          <span style={{ fontSize: "0.8rem", color: BLACK, fontWeight: 600 }}>5 people healthy · 1 needs attention</span>
        </div>

        {/* People grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {people.map((p) => (
            <div
              key={p.name}
              onMouseEnter={() => setHovered(p.name)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: WHITE,
                borderRadius: 18,
                padding: "20px 22px",
                border: p.priority ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                borderLeft: p.priority ? `5px solid ${RED}` : `1.5px solid ${BORDER}`,
                boxShadow: hovered === p.name ? "0 4px 18px rgba(0,0,0,0.1)" : "none",
                transition: "box-shadow 0.15s",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top row: emoji + health ring */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem" }}>
                    {p.emoji}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, lineHeight: 1, margin: "0 0 4px" }}>{p.name}</h3>
                    <span style={{ padding: "3px 9px", borderRadius: 20, background: `${BLACK}08`, fontSize: "0.72rem", fontWeight: 600, color: GRAY }}>{p.rel}</span>
                  </div>
                </div>
                {/* Health ring */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Ring pct={p.ring.pct} color={p.ring.color} size={54} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, color: p.ring.color }}>{p.ring.pct}%</span>
                  </div>
                </div>
              </div>

              {/* Status chip */}
              <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, background: `${p.statusColor}15`, fontSize: "0.72rem", fontWeight: 700, color: p.statusColor, marginBottom: 10 }}>
                {p.status}
              </div>

              {/* Next event */}
              <div style={{ fontSize: "0.8rem", color: GRAY, marginBottom: 4 }}>{p.nextEvent}</div>
              <div style={{ fontSize: "0.72rem", color: `${GRAY}99` }}>last updated 2 days ago</div>

              {/* Action button */}
              <button style={{
                marginTop: 16, width: "100%", padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
                background: p.priority ? RED : SAGE,
                color: WHITE, fontSize: "0.82rem", fontWeight: 700,
              }}>
                {p.action}
              </button>
            </div>
          ))}

          {/* Add Person card */}
          <div style={{
            background: "transparent", borderRadius: 18, padding: "20px 22px",
            border: `2px dashed ${SAGE}55`, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
            minHeight: 160,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", border: `2px dashed ${SAGE}70`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", color: SAGE }}>+</div>
            <span style={{ fontSize: "0.85rem", color: SAGE, fontWeight: 600 }}>Add Person</span>
          </div>
        </div>

      </div>
    </div>
  );
}
