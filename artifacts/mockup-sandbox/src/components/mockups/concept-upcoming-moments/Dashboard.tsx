// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const MOMENTS = [
  { name: "Steve",  emoji: "🤝", rel: "Friend",  event: "Birthday",     date: "Jun 14", days: 3,  status: "Draft ready",  statusC: SAGE,  action: "Review Draft" },
  { name: "Sarah",  emoji: "👩", rel: "Sister",  event: "Anniversary",  date: "Jun 19", days: 8,  status: "On track",     statusC: SAGE,  action: "View" },
  { name: "Mom",    emoji: "💛", rel: "Mother",  event: "Mother's Day", date: "Jun 26", days: 15, status: "Add details",  statusC: AMBER, action: "Add Details" },
  { name: "Marcus", emoji: "🧢", rel: "Friend",  event: "Just Because", date: "Jul 3",  days: 22, status: "On track",     statusC: SAGE,  action: "View" },
  { name: "Dad",    emoji: "👔", rel: "Father",  event: "Father's Day", date: "Jul 9",  days: 28, status: "On track",     statusC: SAGE,  action: "View" },
];

const PEOPLE = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  evts: 3 },
  { emoji: "👩", name: "Sarah",  rel: "Sister",  evts: 4 },
  { emoji: "💛", name: "Mom",    rel: "Mother",  evts: 5 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  evts: 2 },
  { emoji: "👔", name: "Dad",    rel: "Father",  evts: 3 },
  { emoji: "💼", name: "Jenny",  rel: "Client",  evts: 2 },
];

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky" as const, top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: "0.08em" }}>F.I. FORGOT</span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: "rgba(255,255,255,0.5)" }}>your next 30 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "7px 16px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
            + ADD MOMENT
          </button>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem", fontWeight: 700, color: WHITE }}>JD</div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 24px" }}>
        {/* Hero stat strip */}
        <div style={{ background: BLACK, borderRadius: 18, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ textAlign: "center" as const }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem", color: RED, lineHeight: 1 }}>5</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", marginTop: 3, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Upcoming Events</div>
            </div>
            <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" as const }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem", color: WHITE, lineHeight: 1 }}>3</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", marginTop: 3, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Days to Next</div>
            </div>
            <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ textAlign: "center" as const }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem", color: SAGE, lineHeight: 1 }}>1</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", marginTop: 3, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Draft Waiting</div>
            </div>
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.3rem", color: "rgba(255,255,255,0.35)", textAlign: "right" as const, lineHeight: 1.4 }}>
            We've got it<br />handled.
          </div>
        </div>

        {/* Upcoming Moments */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, letterSpacing: "0.08em", margin: 0 }}>UPCOMING MOMENTS</h2>
          <span style={{ fontSize: "0.75rem", color: GRAY, background: CREAM, padding: "4px 10px", borderRadius: 20, border: `1px solid ${BORDER}` }}>Next 30 days</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 36 }}>
          {MOMENTS.map((m, i) => {
            const urgent = m.days <= 7;
            return (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: WHITE,
                  borderRadius: 14,
                  border: urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                  boxShadow: urgent ? `0 4px 16px ${RED}18` : hovered === i ? "0 3px 10px rgba(0,0,0,0.07)" : "0 1px 4px rgba(0,0,0,0.04)",
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {/* Day badge */}
                <div style={{
                  minWidth: 58, height: 58, borderRadius: 12,
                  background: urgent ? RED : CREAM,
                  border: urgent ? "none" : `1px solid ${BORDER}`,
                  display: "flex", flexDirection: "column" as const,
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                  <span style={{ fontSize: "0.6rem", color: urgent ? "rgba(255,255,255,0.75)" : GRAY, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>days</span>
                </div>

                {/* Emoji avatar */}
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: urgent ? `${RED}10` : `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{m.emoji}</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: "0.95rem", color: BLACK }}>{m.name}</span>
                    <span style={{ fontSize: "0.68rem", color: GRAY, background: `${BLACK}08`, padding: "2px 7px", borderRadius: 20 }}>{m.rel}</span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: GRAY }}>
                    <span style={{ fontWeight: 600, color: urgent ? RED : BLACK }}>{m.event}</span>
                    <span style={{ margin: "0 5px", color: BORDER }}>·</span>
                    <span>{m.date}</span>
                  </div>
                </div>

                {/* Status */}
                <div style={{
                  padding: "5px 12px", borderRadius: 20,
                  background: m.statusC === AMBER ? `${AMBER}15` : `${SAGE}12`,
                  color: m.statusC, fontSize: "0.72rem", fontWeight: 700,
                  letterSpacing: "0.02em", flexShrink: 0,
                }}>{m.status}</div>

                {/* Action button */}
                <button style={{
                  background: urgent ? RED : "transparent",
                  color: urgent ? WHITE : BLACK,
                  border: urgent ? "none" : `1.5px solid ${BORDER}`,
                  borderRadius: 9, padding: "8px 18px",
                  fontWeight: 700, fontSize: "0.78rem",
                  cursor: "pointer", flexShrink: 0,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  whiteSpace: "nowrap" as const,
                  transition: "all 0.15s",
                }}>
                  {m.action} {urgent ? "→" : ""}
                </button>
              </div>
            );
          })}
        </div>

        {/* Your People */}
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, letterSpacing: "0.08em", margin: "0 0 16px" }}>YOUR PEOPLE</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {PEOPLE.map((p, i) => (
            <div key={i} style={{
              background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`,
              padding: "18px 16px", display: "flex", flexDirection: "column" as const,
              alignItems: "center", gap: 5, cursor: "pointer",
              transition: "border-color 0.15s",
            }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${BLACK}08`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: 4 }}>{p.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
              <div style={{ fontSize: "0.72rem", color: GRAY }}>{p.rel}</div>
              <div style={{ fontSize: "0.68rem", color: GRAY, background: CREAM, padding: "2px 9px", borderRadius: 12, marginTop: 4, border: `1px solid ${BORDER}` }}>{p.evts} events/yr</div>
            </div>
          ))}
          <div style={{
            borderRadius: 14, border: `2px dashed ${SAGE}50`,
            padding: "18px", display: "flex", flexDirection: "column" as const,
            alignItems: "center", justifyContent: "center", gap: 6,
            cursor: "pointer", background: `${SAGE}05`,
          }}>
            <div style={{ fontSize: "1.6rem", color: SAGE, lineHeight: 1 }}>+</div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: SAGE }}>Add Person</div>
          </div>
        </div>
      </div>
    </div>
  );
}
