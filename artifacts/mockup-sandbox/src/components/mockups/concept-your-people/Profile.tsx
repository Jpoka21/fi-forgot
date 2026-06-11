// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B", GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

function HealthRing({ score, label, size = 96, strokeWidth = 8, color = SAGE }: { score: number, label?: string, size?: number, strokeWidth?: number, color?: string }) {
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
      <div style={{ position: "absolute", textAlign: "center", display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: size * 0.22, lineHeight: 1, color }}>{score}%</span>
        {label && <span style={{ fontSize: size * 0.1, fontWeight: 700, color: GRAY, textTransform: "uppercase" }}>{label}</span>}
      </div>
    </div>
  );
}

function ProgressBar({ label, score, color = SAGE }: { label: string, score: number, color?: string }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 700, marginBottom: "4px" }}>
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <div style={{ width: "100%", height: "8px", background: `${BLACK}10`, borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: "4px" }} />
      </div>
    </div>
  );
}

export function Profile() {
  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      {/* Header/Nav */}
      <nav style={{ padding: "16px 24px" }}>
        <button style={{ background: "none", border: "none", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
          ← Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 64px" }}>
        {/* Profile Hero */}
        <div style={{ background: WHITE, borderRadius: "24px", padding: "32px", border: `1px solid ${BORDER}`, marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
            <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                👩
              </div>
              <div>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.2rem", margin: 0, lineHeight: 1 }}>SARAH</h1>
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <span style={{ fontSize: "0.9rem", background: `${GRAY}15`, color: GRAY, padding: "2px 12px", borderRadius: "99px", fontWeight: 600 }}>Sister</span>
                </div>
              </div>
            </div>
            <HealthRing score={82} label="Excellent" size={110} />
          </div>

          <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
            <div>
              <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.05em", color: GRAY, marginBottom: "16px" }}>HEALTH SCORE BREAKDOWN</h3>
              <ProgressBar label="RECENCY" score={90} />
              <ProgressBar label="CONSISTENCY" score={85} />
              <ProgressBar label="CARD QUALITY" score={78} />
              <ProgressBar label="PROFILE DEPTH" score={82} />
            </div>
            <div style={{ background: CREAM, borderRadius: "16px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", margin: 0 }}>NEXT MOMENT</h3>
                <span style={{ fontSize: "0.75rem", background: `${SAGE}20`, color: SAGE, padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>ON TRACK</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Anniversary</div>
              <div style={{ color: GRAY, fontSize: "0.9rem", marginBottom: "16px" }}>June 19 · 8 days away</div>
              <button style={{ width: "100%", height: "40px", background: BLACK, color: WHITE, borderRadius: "8px", fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", border: "none", cursor: "pointer" }}>
                REVIEW DRAFT →
              </button>
            </div>
          </div>
        </div>

        {/* Card History */}
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", marginBottom: "16px" }}>CARD HISTORY</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { event: "Anniversary 2023", date: "June 19, 2023", excerpt: "Four years and I'd choose you every time. Happy anniversary, sis — you two are everything." },
              { event: "Birthday 2023", date: "Feb 14, 2023", excerpt: "You're officially closer to 30 than to 20. On behalf of me, I'm so sorry. Happy birthday!" },
              { event: "Christmas 2022", date: "Dec 22, 2022", excerpt: "Being your brother is the gift I didn't know I needed. Merry Christmas. Love you." }
            ].map((card, i) => (
              <div key={i} style={{ background: WHITE, padding: "16px 20px", borderRadius: "12px", border: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 800 }}>{card.event}</span>
                  <span style={{ color: GRAY, fontSize: "0.85rem" }}>{card.date}</span>
                </div>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", margin: 0, color: BLACK }}>"{card.excerpt}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <button style={{ flex: 1, height: "48px", background: RED, color: WHITE, border: "none", borderRadius: "10px", fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", cursor: "pointer" }}>SEND CARD</button>
          <button style={{ flex: 1, height: "48px", background: "transparent", color: SAGE, border: `2px solid ${SAGE}`, borderRadius: "10px", fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", cursor: "pointer" }}>LOG MOMENT</button>
          <button style={{ flex: 1, height: "48px", background: "transparent", color: GRAY, border: `2px solid ${BORDER}`, borderRadius: "10px", fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", cursor: "pointer" }}>ASK QUESTION</button>
        </div>

        {/* Profile Completeness */}
        <div style={{ background: WHITE, borderRadius: "12px", padding: "16px", border: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem", fontWeight: 700 }}>
            <span>PROFILE COMPLETENESS</span>
            <span>88%</span>
          </div>
          <div style={{ width: "100%", height: "6px", background: `${BLACK}10`, borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}>
            <div style={{ width: "88%", height: "100%", background: BLACK }} />
          </div>
          <div style={{ fontSize: "0.8rem", color: RED, fontWeight: 600 }}>Missing: mailing address</div>
        </div>
      </div>
    </div>
  );
}
