// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3";
const RED = "#E23B2E";
const BLACK = "#111111";
const SAGE = "#5B8C6B";
const DARK_SAGE = "#3d6b4f";
const GRAY = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE = "#FFFFFF";
const CREAM = "#FDF7EF";
const AMBER = "#D97706";

const people = [
  { emoji: "👩", name: "Sarah", rel: "Sister", health: "Excellent", healthPct: 90, ring: DARK_SAGE, nextEvent: "Anniversary", daysAway: 8, action: "Review Draft →", lastUpdated: 2, priority: false },
  { emoji: "💛", name: "Mom", rel: "Mother", health: "Needs Attention", healthPct: 42, ring: AMBER, nextEvent: "Mother's Day", daysAway: 15, action: "Add Details →", lastUpdated: 14, priority: false },
  { emoji: "🤝", name: "Steve", rel: "Friend", health: "Healthy", healthPct: 76, ring: SAGE, nextEvent: "Birthday", daysAway: 3, action: "Review Draft →", lastUpdated: 5, priority: false },
  { emoji: "🧢", name: "Marcus", rel: "Friend", health: "Priority", healthPct: 58, ring: RED, nextEvent: "Birthday", daysAway: 3, action: "Write Card →", lastUpdated: 7, priority: true },
  { emoji: "👔", name: "Dad", rel: "Father", health: "Healthy", healthPct: 80, ring: SAGE, nextEvent: "Father's Day", daysAway: 28, action: "View →", lastUpdated: 3, priority: false },
  { emoji: "💼", name: "Jenny", rel: "Client", health: "Excellent", healthPct: 92, ring: DARK_SAGE, nextEvent: "Work Anniv", daysAway: 45, action: "View →", lastUpdated: 1, priority: false },
];

function HealthRing({ pct, color, size = 44 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BORDER} strokeWidth={5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5} strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
}

export function Dashboard() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: WHITE, letterSpacing: 2 }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: 1.5 }}>F.I. FORGOT</span>
      </div>

      <div style={{ padding: "20px 28px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Summary strip */}
        <div style={{ background: WHITE, borderRadius: 10, padding: "10px 20px", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, marginBottom: 22, fontSize: "0.82rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: SAGE }} />
            <span style={{ color: BLACK, fontWeight: 600 }}>5 people healthy</span>
          </div>
          <div style={{ width: 1, height: 16, background: BORDER }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: AMBER }} />
            <span style={{ color: AMBER, fontWeight: 600 }}>1 needs attention</span>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 7, padding: "6px 14px", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+ Add Person</button>
          </div>
        </div>

        {/* Person cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {people.map(p => (
            <div
              key={p.name}
              onMouseEnter={() => setHovered(p.name)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: WHITE,
                borderRadius: 14,
                padding: "18px 18px 14px",
                border: p.priority ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                borderLeft: p.priority ? `4px solid ${RED}` : `1px solid ${BORDER}`,
                boxShadow: hovered === p.name ? "0 4px 16px rgba(0,0,0,0.1)" : p.priority ? "0 2px 10px rgba(226,59,46,0.12)" : "none",
                cursor: "pointer",
                transition: "box-shadow 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0, border: `1px solid ${BORDER}` }}>
                  {p.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, letterSpacing: 1 }}>{p.name}</span>
                    <span style={{ background: "rgba(0,0,0,0.07)", color: GRAY, borderRadius: 20, padding: "2px 9px", fontSize: "0.68rem", fontWeight: 600 }}>{p.rel}</span>
                  </div>
                  <div style={{ fontSize: "0.7rem", color: GRAY }}>last updated {p.lastUpdated}d ago</div>
                </div>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <HealthRing pct={p.healthPct} color={p.ring} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "0.58rem", fontWeight: 700, color: p.ring }}>{p.healthPct}%</span>
                  </div>
                </div>
              </div>

              <div style={{ background: CREAM, borderRadius: 8, padding: "8px 12px", marginBottom: 12, border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.8rem", color: BLACK }}>{p.nextEvent}</div>
                    <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 1 }}>in {p.daysAway} days</div>
                  </div>
                  <div style={{
                    fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem",
                    color: p.daysAway <= 7 ? RED : BLACK, lineHeight: 1,
                  }}>{p.daysAway}d</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: "0.68rem", fontWeight: 700,
                  color: p.ring === AMBER ? AMBER : p.ring === RED ? RED : SAGE,
                  background: p.ring === AMBER ? "rgba(217,119,6,0.1)" : p.ring === RED ? "rgba(226,59,46,0.1)" : "rgba(91,140,107,0.1)",
                  padding: "3px 9px", borderRadius: 20,
                }}>{p.health}</span>
                <button style={{
                  background: p.priority ? RED : BLACK, color: WHITE,
                  border: "none", borderRadius: 7, padding: "6px 14px",
                  fontWeight: 700, fontSize: "0.72rem", cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>{p.action}</button>
              </div>
            </div>
          ))}

          {/* Add Person dashed */}
          <div style={{
            background: "transparent", borderRadius: 14, padding: "18px",
            border: `2px dashed ${SAGE}`, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", cursor: "pointer", minHeight: 160,
          }}>
            <div style={{ fontSize: "2rem", color: SAGE, marginBottom: 8 }}>+</div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: SAGE, letterSpacing: 1 }}>ADD PERSON</div>
            <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 4, textAlign: "center" }}>Start caring for someone new</div>
          </div>
        </div>
      </div>
    </div>
  );
}
