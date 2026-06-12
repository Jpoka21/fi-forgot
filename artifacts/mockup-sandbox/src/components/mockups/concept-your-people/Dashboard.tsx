// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";
const DARK_SAGE = "#3D6B50";

type HealthLevel = "excellent" | "healthy" | "needs-attention" | "priority";
const HEALTH_COLOR: Record<HealthLevel, string> = {
  excellent: DARK_SAGE,
  healthy: SAGE,
  "needs-attention": AMBER,
  priority: RED,
};
const HEALTH_LABEL: Record<HealthLevel, string> = {
  excellent: "Excellent",
  healthy: "Healthy",
  "needs-attention": "Needs Attention",
  priority: "Priority",
};

const PEOPLE = [
  { emoji: "👩", name: "Sarah",  rel: "Sister",  health: "excellent" as HealthLevel,   pct: 88, nextEvent: "Anniversary in 8 days",   action: "Review Draft →",  urgent: false },
  { emoji: "💛", name: "Mom",    rel: "Mother",  health: "needs-attention" as HealthLevel, pct: 54, nextEvent: "Mother's Day in 15 days", action: "Add Details →",   urgent: false },
  { emoji: "🤝", name: "Steve",  rel: "Friend",  health: "healthy" as HealthLevel,     pct: 74, nextEvent: "Birthday in 3 days",      action: "Review Draft →",  urgent: true  },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  health: "priority" as HealthLevel,    pct: 42, nextEvent: "Birthday in 3 days",      action: "Write Card →",    urgent: true  },
  { emoji: "👔", name: "Dad",    rel: "Father",  health: "healthy" as HealthLevel,     pct: 76, nextEvent: "Father's Day in 28 days", action: "View →",          urgent: false },
  { emoji: "💼", name: "Jenny",  rel: "Client",  health: "excellent" as HealthLevel,   pct: 91, nextEvent: "Work Anniv in 45 days",   action: "View →",          urgent: false },
];

function HealthRing({ pct, color, size = 44 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}20`} strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
}

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: WHITE, letterSpacing: "0.08em" }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px" }}>
        {/* Summary strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: "12px 20px", background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}` }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: DARK_SAGE, display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE, display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: AMBER, display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: RED, display: "inline-block" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: DARK_SAGE, display: "inline-block" }} />
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: BLACK, fontWeight: 600 }}>
            5 people healthy &nbsp;·&nbsp; <span style={{ color: RED }}>1 needs attention</span>
          </p>
          <div style={{ marginLeft: "auto" }}>
            <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              + Add Person
            </button>
          </div>
        </div>

        {/* People grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {PEOPLE.map((p, i) => {
            const hc = HEALTH_COLOR[p.health];
            const isPriority = p.health === "priority";
            return (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: WHITE,
                  borderRadius: 18,
                  border: isPriority ? `2px solid ${RED}40` : `1.5px solid ${BORDER}`,
                  borderLeft: isPriority ? `4px solid ${RED}` : undefined,
                  boxShadow: hovered === i ? "0 4px 16px rgba(0,0,0,0.1)" : "0 1px 4px rgba(0,0,0,0.04)",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s",
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>{p.emoji}</div>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1 }}>{p.name.toUpperCase()}</div>
                      <span style={{ background: `${BLACK}08`, color: GRAY, fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{p.rel}</span>
                    </div>
                  </div>
                  {/* Health ring */}
                  <div style={{ position: "relative" as const, flexShrink: 0 }}>
                    <HealthRing pct={p.pct} color={hc} size={44} />
                    <div style={{ position: "absolute" as const, inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "0.6rem", fontWeight: 800, color: hc }}>{p.pct}%</span>
                    </div>
                  </div>
                </div>

                {/* Health label */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${hc}12`, padding: "3px 10px", borderRadius: 20, marginBottom: 10, alignSelf: "flex-start" as const }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: hc, display: "inline-block" }} />
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: hc }}>{HEALTH_LABEL[p.health]}</span>
                </div>

                {/* Next event */}
                <div style={{ fontSize: "0.8rem", color: GRAY, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: p.urgent ? RED : BLACK }}>{p.nextEvent}</span>
                </div>
                <div style={{ fontSize: "0.7rem", color: GRAY, marginBottom: 16 }}>Last updated 5 days ago</div>

                {/* Action */}
                <button style={{
                  marginTop: "auto",
                  background: isPriority ? RED : p.urgent ? `${BLACK}08` : "transparent",
                  color: isPriority ? WHITE : BLACK,
                  border: isPriority ? "none" : `1.5px solid ${BORDER}`,
                  borderRadius: 10, padding: "9px 16px",
                  fontWeight: 700, fontSize: "0.8rem",
                  cursor: "pointer", width: "100%",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {p.action}
                </button>
              </div>
            );
          })}

          {/* Add person dashed */}
          <div style={{
            borderRadius: 18, border: `2px dashed ${SAGE}40`,
            display: "flex", flexDirection: "column" as const,
            alignItems: "center", justifyContent: "center", gap: 8,
            padding: "32px", cursor: "pointer", background: `${SAGE}04`,
            minHeight: 200,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: `2px dashed ${SAGE}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: SAGE }}>+</div>
            <span style={{ fontWeight: 700, color: SAGE, fontSize: "0.85rem" }}>Add a Person</span>
          </div>
        </div>
      </div>
    </div>
  );
}
