// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B",
  GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

type HealthStatus = "Excellent" | "Healthy" | "Needs Attention" | "Priority";

const people: {
  emoji: string; name: string; rel: string; status: HealthStatus;
  ringPct: number; nextEvent: string; nextDays: number;
  lastUpdated: number; action: string; priority?: boolean;
}[] = [
  { emoji: "👩", name: "Sarah",  rel: "Sister", status: "Excellent",       ringPct: 94, nextEvent: "Anniversary",  nextDays: 8,  lastUpdated: 2,  action: "Review Draft →" },
  { emoji: "💛", name: "Mom",    rel: "Mother", status: "Needs Attention", ringPct: 52, nextEvent: "Mother's Day",  nextDays: 15, lastUpdated: 18, action: "Add Details →" },
  { emoji: "🤝", name: "Steve",  rel: "Friend", status: "Healthy",         ringPct: 78, nextEvent: "Birthday",     nextDays: 3,  lastUpdated: 5,  action: "Review Draft →" },
  { emoji: "🧢", name: "Marcus", rel: "Friend", status: "Priority",        ringPct: 62, nextEvent: "Birthday",     nextDays: 3,  lastUpdated: 30, action: "Write Card →", priority: true },
  { emoji: "👔", name: "Dad",    rel: "Father", status: "Healthy",         ringPct: 81, nextEvent: "Father's Day", nextDays: 28, lastUpdated: 7,  action: "View →" },
  { emoji: "💼", name: "Jenny",  rel: "Client", status: "Excellent",       ringPct: 91, nextEvent: "Work Anniv",   nextDays: 45, lastUpdated: 1,  action: "View →" },
];

function statusRingColor(s: HealthStatus) {
  if (s === "Excellent")       return "#3A7D5A";
  if (s === "Healthy")         return SAGE;
  if (s === "Needs Attention") return "#D97706";
  return RED;
}

function statusBadgeBg(s: HealthStatus) {
  if (s === "Excellent")       return "#3A7D5A22";
  if (s === "Healthy")         return SAGE + "22";
  if (s === "Needs Attention") return "#D9770622";
  return RED + "20";
}

function HealthRing({ pct, color, size = 52 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BORDER} strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

export function Dashboard() {
  const [hov, setHov] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: BLACK, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: WHITE, letterSpacing: 1 }}>YOUR PEOPLE</span>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
        {/* Summary strip */}
        <div style={{ background: WHITE, borderRadius: 10, padding: "11px 18px", border: `1.5px solid ${BORDER}`, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
          <span style={{ fontSize: "0.82rem", color: BLACK, fontWeight: 500 }}>5 people healthy</span>
          <span style={{ color: BORDER }}>·</span>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: RED }} />
          <span style={{ fontSize: "0.82rem", color: BLACK, fontWeight: 500 }}>1 needs attention</span>
        </div>

        {/* People grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {people.map(p => {
            const rc = statusRingColor(p.status);
            return (
              <div
                key={p.name}
                onMouseEnter={() => setHov(p.name)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: WHITE,
                  borderRadius: 13,
                  padding: "18px 18px 16px",
                  border: p.priority ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                  borderLeft: p.priority ? `5px solid ${RED}` : undefined,
                  boxShadow: hov === p.name ? "0 4px 14px rgba(0,0,0,0.09)" : "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  cursor: "pointer",
                  transition: "box-shadow 0.15s",
                  position: "relative",
                }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", border: `2px solid ${rc}` }}>{p.emoji}</div>
                    <div>
                      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.45rem", color: BLACK, letterSpacing: 0.5, lineHeight: 1 }}>{p.name.toUpperCase()}</div>
                      <span style={{ background: statusBadgeBg(p.status), color: rc, borderRadius: 20, padding: "2px 9px", fontSize: "0.68rem", fontWeight: 700 }}>{p.status}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <HealthRing pct={p.ringPct} color={rc} size={48} />
                    <span style={{ fontSize: "0.65rem", color: rc, fontWeight: 700 }}>{p.ringPct}%</span>
                  </div>
                </div>
                {/* Next event */}
                <div style={{ background: CREAM, borderRadius: 7, padding: "7px 10px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.78rem", color: BLACK, fontWeight: 600 }}>{p.nextEvent}</span>
                  <span style={{ fontSize: "0.74rem", color: p.nextDays <= 7 ? RED : GRAY, fontWeight: 700 }}>in {p.nextDays} days</span>
                </div>
                {/* Last updated */}
                <div style={{ fontSize: "0.7rem", color: GRAY, marginBottom: 12 }}>last updated {p.lastUpdated} day{p.lastUpdated !== 1 ? "s" : ""} ago</div>
                {/* Action button */}
                <button style={{ width: "100%", background: p.priority ? RED : "transparent", color: p.priority ? WHITE : BLACK, border: p.priority ? "none" : `1.5px solid ${BORDER}`, borderRadius: 8, padding: "9px 0", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.action}</button>
              </div>
            );
          })}
          {/* Add Person */}
          <div style={{ borderRadius: 13, border: `1.5px dashed ${SAGE}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", minHeight: 180 }}>
            <div style={{ fontSize: "1.6rem", color: SAGE }}>＋</div>
            <div style={{ fontSize: "0.85rem", color: SAGE, fontWeight: 600 }}>Add Person</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 28, fontSize: "0.72rem", color: GRAY }}>6 people tracked · Updated just now</div>
      </div>
    </div>
  );
}
