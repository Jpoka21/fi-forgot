// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF", CREAM="#FDF7EF";

function HealthRing({ h, size = 48, stroke = 4 }: { h: number, size?: number, stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = Math.PI * 2 * r;
  const fill = c * (h / 100);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${SAGE}20`} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={SAGE}
          strokeWidth={stroke}
          strokeDasharray={`${fill} ${c - fill}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Bebas Neue', cursive",
        fontSize: size * 0.3,
        color: SAGE
      }}>
        {h}%
      </div>
    </div>
  );
}

export function Dashboard() {
  const [done, setDone] = useState(false);

  const nextActions = [
    { id: 2, text: "Answer follow-up about Steve's guitar lessons", chip: "2 min", chipBg: SAGE, chipColor: WHITE },
    { id: 3, text: "Review Sarah's anniversary card draft", chip: "Draft ready", chipBg: "#f59e0b", chipColor: WHITE },
    { id: 4, text: "Add details for Mom's Mother's Day card", chip: "15 days", chipBg: GRAY, chipColor: WHITE },
  ];

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: RED, letterSpacing: "0.05em" }}>F.I. FORGOT</span>
        </div>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "#ffffff70" }}>We got your important people</span>
      </nav>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
        {/* Giant Hero Action Card */}
        <div style={{
          background: BLACK,
          borderRadius: 24,
          padding: "40px",
          color: WHITE,
          position: "relative",
          marginBottom: 32,
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div style={{ background: RED, color: WHITE, fontSize: "0.75rem", fontWeight: 700, padding: "4px 12px", borderRadius: 4, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "0.05em" }}>
              TODAY · ACTION 1 OF 4
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <HealthRing h={76} size={48} stroke={4} />
              <span style={{ fontSize: "0.6rem", color: "#ffffff60", textTransform: "uppercase" }}>Ambient</span>
            </div>
          </div>

          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", lineHeight: 1, margin: "0 0 8px", letterSpacing: "0.02em" }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </h1>
          
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.3rem", color: "#ffffff80", margin: "0 0 32px" }}>
            Birthday · June 14 · 3 days away
          </p>

          <button 
            onClick={() => setDone(!done)}
            style={{
              width: "100%",
              height: 52,
              background: RED,
              color: WHITE,
              border: "none",
              borderRadius: 12,
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "1.3rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "transform 0.1s"
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {done ? "CARD SENT! ✅" : "Write His Card →"}
          </button>
        </div>

        {/* Next Actions Queue */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {nextActions.map((action) => (
            <div key={action.id} style={{
              background: WHITE,
              borderRadius: 16,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              cursor: "pointer",
              border: "1px solid transparent"
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = BORDER}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "transparent"}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: BLACK,
                color: WHITE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
                fontWeight: 700,
                flexShrink: 0
              }}>
                {action.id}
              </div>
              <div style={{ flex: 1, fontSize: "0.95rem", fontWeight: 500 }}>
                {action.text}
              </div>
              <div style={{
                background: action.chipBg,
                color: action.chipColor,
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 99,
                whiteSpace: "nowrap"
              }}>
                {action.chip}
              </div>
              <div style={{ color: GRAY, fontSize: "1.2rem" }}>→</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer style={{ textAlign: "center", paddingBottom: 40 }}>
          <p style={{ color: GRAY, fontSize: "0.75rem", letterSpacing: "0.02em" }}>
            6 people · 5 healthy · 1 priority
          </p>
        </footer>
      </main>
    </div>
  );
}
