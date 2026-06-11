// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B", GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

type HealthLevel = "Excellent" | "Healthy" | "Needs Attention" | "Priority";

const people = [
  { emoji: "👩", name: "Sarah", rel: "Sister", health: 92, level: "Excellent" as HealthLevel, nextEvent: "Anniversary", daysAway: 8, status: "Review Draft" },
  { emoji: "💛", name: "Mom", rel: "Mother", health: 65, level: "Needs Attention" as HealthLevel, nextEvent: "Mother's Day", daysAway: 15, status: "Add Details" },
  { emoji: "🤝", name: "Steve", rel: "Friend", health: 78, level: "Healthy" as HealthLevel, nextEvent: "Birthday", daysAway: 3, status: "Review Draft" },
  { emoji: "🧢", name: "Marcus", rel: "Friend", health: 42, level: "Priority" as HealthLevel, nextEvent: "Birthday", daysAway: 3, status: "Write Card" },
  { emoji: "👔", name: "Dad", rel: "Father", health: 81, level: "Healthy" as HealthLevel, nextEvent: "Father's Day", daysAway: 28, status: "View" },
  { emoji: "💼", name: "Jenny", rel: "Client", health: 89, level: "Excellent" as HealthLevel, nextEvent: "Work Anniv", daysAway: 45, status: "View" },
];

function HealthRing({ score, color, size = 52, strokeWidth = 4 }: { score: number, color: string, size?: number, strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const c = Math.PI * 2 * r;
  const fill = c * (score / 100);
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}20`} strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${fill} ${c - fill}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontFamily="'Bebas Neue', cursive" fontSize={size * 0.25} fill={color}>{score}%</text>
    </svg>
  );
}

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  const getHealthColor = (level: HealthLevel) => {
    switch (level) {
      case "Excellent": return "#2D5A3A"; // Dark Sage
      case "Healthy": return SAGE;
      case "Needs Attention": return "#D97706"; // Amber
      case "Priority": return RED;
      default: return GRAY;
    }
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      {/* Nav */}
      <nav style={{ background: BLACK, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 10 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: WHITE, letterSpacing: "0.05em", margin: 0 }}>YOUR PEOPLE</h1>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: RED }}>F.I. FORGOT</span>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        {/* Summary Strip */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", background: WHITE, padding: "12px 20px", borderRadius: "12px", border: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#2D5A3A" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: SAGE }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#D97706" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: RED }} />
          </div>
          <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>5 people healthy · 1 needs attention</span>
        </div>

        {/* Hero Section: Person Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
          {people.map((p, i) => {
            const color = getHealthColor(p.level);
            const isPriority = p.level === "Priority";
            return (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: WHITE,
                  borderRadius: "20px",
                  padding: "24px",
                  border: `1px solid ${hovered === i ? color : BORDER}`,
                  borderLeft: isPriority ? `6px solid ${RED}` : `1px solid ${hovered === i ? color : BORDER}`,
                  boxShadow: hovered === i ? `0 8px 24px ${color}15` : "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                      {p.emoji}
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", margin: 0, lineHeight: 1 }}>{p.name.toUpperCase()}</h2>
                      <span style={{ fontSize: "0.85rem", background: `${GRAY}15`, color: GRAY, padding: "2px 8px", borderRadius: "99px", fontWeight: 600 }}>{p.rel}</span>
                    </div>
                  </div>
                  <HealthRing score={p.health} color={color} size={60} strokeWidth={5} />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: `${p.daysAway <= 7 ? RED : SAGE}10`, color: p.daysAway <= 7 ? RED : SAGE, padding: "4px 10px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 700 }}>
                    🗓 {p.nextEvent} in {p.daysAway} days
                  </div>
                </div>

                <div style={{ marginTop: "auto" }}>
                  <p style={{ fontSize: "0.8rem", color: GRAY, margin: "0 0 12px" }}>last updated 3 days ago</p>
                  <button style={{
                    width: "100%",
                    height: "44px",
                    background: isPriority ? RED : "transparent",
                    color: isPriority ? WHITE : color,
                    border: `2px solid ${isPriority ? RED : color}`,
                    borderRadius: "10px",
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: "1.2rem",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}>
                    {p.status} →
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Person Dashed Card */}
          <div style={{
            background: "transparent",
            borderRadius: "20px",
            padding: "24px",
            border: `2px dashed ${SAGE}40`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            minHeight: "240px",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = SAGE)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = `${SAGE}40`)}
          >
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${SAGE}15`, color: SAGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: "12px", fontWeight: "bold" }}>+</div>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: SAGE }}>ADD PERSON</span>
          </div>
        </div>
      </div>
    </div>
  );
}
