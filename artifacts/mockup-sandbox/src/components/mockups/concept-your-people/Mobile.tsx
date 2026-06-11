// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B", GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const people = [
  { id: 1, emoji: "🤝", name: "Steve", rel: "Friend", health: 82, level: "Healthy", next: "Birthday", days: 3 },
  { id: 2, emoji: "👩", name: "Sarah", rel: "Sister", health: 94, level: "Excellent", next: "Anniversary", days: 8 },
  { id: 3, emoji: "💛", name: "Mom", rel: "Mother", health: 71, level: "Healthy", next: "Mother's Day", days: 15 },
  { id: 4, emoji: "🧢", name: "Marcus", rel: "Friend", health: 38, level: "Priority", next: "Birthday", days: 3 },
  { id: 5, emoji: "👔", name: "Dad", rel: "Father", health: 65, level: "Needs Attention", next: "Father's Day", days: 28 },
];

function HealthRing({ score, size = 40, strokeWidth = 3, color = SAGE }: { score: number, size?: number, strokeWidth?: number, color?: string }) {
  const r = (size - strokeWidth) / 2;
  const c = Math.PI * 2 * r;
  const fill = c * (score / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}20`} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${fill} ${c - fill}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span style={{ position: "absolute", fontFamily: "'Bebas Neue', cursive", fontSize: size * 0.3, color }}>{score}</span>
    </div>
  );
}

export function Mobile() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getHealthColor = (level: string) => {
    switch (level) {
      case "Excellent": return "#2D5A3A";
      case "Healthy": return SAGE;
      case "Needs Attention": return "#D97706";
      case "Priority": return RED;
      default: return GRAY;
    }
  };

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ background: BLACK, height: 60, display: "flex", alignItems: "center", padding: "0 20px" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: WHITE, margin: 0 }}>YOUR PEOPLE</h1>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {people.map((p) => {
            const isExpanded = expandedId === p.id;
            const color = getHealthColor(p.level);

            return (
              <div
                key={p.id}
                style={{
                  background: WHITE,
                  borderRadius: "16px",
                  border: `1px solid ${isExpanded ? color : BORDER}`,
                  overflow: "hidden",
                  transition: "all 0.2s ease"
                }}
              >
                <div
                  style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                    {p.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>{p.name}</div>
                    <div style={{ fontSize: "0.8rem", color: GRAY }}>{p.rel}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />
                    <div style={{ background: `${RED}10`, color: RED, padding: "2px 8px", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700 }}>{p.days}d</div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${BORDER}`, background: CREAM }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 0" }}>
                      <HealthRing score={p.health} color={color} size={60} strokeWidth={5} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.9rem" }}>{p.next}</div>
                        <div style={{ fontSize: "0.8rem", color: GRAY }}>June 19 · 8 days away</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{ flex: 1, height: "40px", background: color, color: WHITE, border: "none", borderRadius: "8px", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem" }}>
                        ACTION →
                      </button>
                      <button style={{ flex: 1, height: "40px", background: WHITE, color: BLACK, border: `1px solid ${BORDER}`, borderRadius: "8px", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem" }}>
                        PROFILE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={{ background: WHITE, height: 70, borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-around", alignItems: "center", paddingBottom: "10px" }}>
        {[
          { label: "People", icon: "👥", active: true },
          { label: "Moments", icon: "🗓", active: false },
          { label: "Cards", icon: "💌", active: false },
          { label: "Settings", icon: "⚙️", active: false }
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", opacity: item.active ? 1 : 0.4 }}>
            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: item.active ? RED : BLACK }}>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
