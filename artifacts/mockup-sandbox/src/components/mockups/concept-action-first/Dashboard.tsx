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

const queue = [
  { num: 2, text: "Answer follow-up about Steve's guitar lessons",  chip: "2 min",       chipColor: SAGE,      chipBg: SAGE + "22"      },
  { num: 3, text: "Review Sarah's anniversary card draft",          chip: "Draft ready",  chipColor: "#D97706", chipBg: "#FEF3C7"        },
  { num: 4, text: "Add details for Mom's Mother's Day card",        chip: "15 days",      chipColor: GRAY,      chipBg: CREAM            },
];

function HeroRing({ pct, size = 48 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={SAGE} strokeWidth={4}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 1 }}>{pct}%</div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: 18, color: "rgba(255,255,255,0.55)" }}>We got your important people</span>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px" }}>
        {/* Giant hero action card */}
        <div style={{
          background: BLACK,
          borderRadius: 24,
          padding: "28px 30px 26px",
          marginBottom: 16,
          position: "relative",
        }}>
          {/* Top row: chip + ring */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ background: RED, color: WHITE, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 800, letterSpacing: 0.8 }}>
              TODAY · ACTION 1 OF 4
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Marcus</span>
              <HeroRing pct={76} size={48} />
            </div>
          </div>

          {/* Hero name */}
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 46, color: WHITE, lineHeight: 1.05, letterSpacing: 1, marginBottom: 10 }}>
            SEND MARCUS A<br />BIRTHDAY CARD
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: 20, color: "rgba(255,255,255,0.6)", marginBottom: 26 }}>
            Birthday · June 14 · 3 days away
          </div>

          {/* CTA button */}
          <button style={{
            width: "100%",
            height: 54,
            background: RED,
            color: WHITE,
            border: "none",
            borderRadius: 12,
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 22,
            letterSpacing: 1.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: "0 4px 20px rgba(226,59,46,0.4)",
          }}>
            Write His Card →
          </button>
        </div>

        {/* Queue */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {queue.map((q, i) => (
            <div
              key={i}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              style={{
                background: WHITE,
                borderRadius: 14,
                padding: "16px 20px",
                border: `1.5px solid ${hov === i ? "#C8C0B4" : BORDER}`,
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
                boxShadow: hov === i ? "0 4px 16px rgba(0,0,0,0.09)" : "0 1px 4px rgba(0,0,0,0.05)",
                transition: "box-shadow 0.18s",
              }}
            >
              {/* Number badge */}
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: BLACK,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: WHITE,
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 18,
                flexShrink: 0,
              }}>
                {q.num}
              </div>

              {/* Text */}
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: BLACK }}>{q.text}</div>

              {/* Chip */}
              <div style={{
                background: q.chipBg,
                color: q.chipColor,
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
                border: `1px solid ${q.chipColor}44`,
              }}>
                {q.chip}
              </div>

              {/* Arrow */}
              <div style={{ color: GRAY, fontSize: 18, flexShrink: 0 }}>→</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: 12, color: GRAY, fontWeight: 500 }}>
          6 people · 5 healthy · 1 priority
        </div>
      </div>
    </div>
  );
}
