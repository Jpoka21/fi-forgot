// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const MOMENTS = [
  { id: 1, name: "Steve",  rel: "Friend",  event: "Birthday",     days: 3,  date: "Jun 14", emoji: "🤝", status: "Draft ready",  sc: SAGE },
  { id: 2, name: "Sarah",  rel: "Sister",  event: "Anniversary",  days: 8,  date: "Jun 19", emoji: "👩", status: "On track",      sc: SAGE },
  { id: 3, name: "Mom",    rel: "Mother",  event: "Mother's Day", days: 15, date: "Jun 26", emoji: "💛", status: "Add details",   sc: AMBER },
  { id: 4, name: "Marcus", rel: "Friend",  event: "Just Because", days: 22, date: "Jul 3",  emoji: "🧢", status: "On track",      sc: SAGE },
  { id: 5, name: "Dad",    rel: "Father",  event: "Father's Day", days: 28, date: "Jul 9",  emoji: "👔", status: "On track",      sc: SAGE },
];

const PEOPLE = [
  { name: "Steve",  rel: "Friend",  emoji: "🤝", epy: 3 },
  { name: "Sarah",  rel: "Sister",  emoji: "👩", epy: 4 },
  { name: "Mom",    rel: "Mother",  emoji: "💛", epy: 5 },
  { name: "Marcus", rel: "Friend",  emoji: "🧢", epy: 2 },
  { name: "Dad",    rel: "Father",  emoji: "👔", epy: 3 },
  { name: "Jenny",  rel: "Client",  emoji: "💼", epy: 2 },
];

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* NAV */}
      <div style={{ background: BLACK, padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "rgba(255,255,255,0.45)", marginTop: 3 }}>your next 30 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ padding: "7px 15px", borderRadius: 8, background: RED, border: "none", color: WHITE, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em" }}>
            + ADD MOMENT
          </button>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700, color: WHITE, border: `2px solid rgba(255,255,255,0.15)` }}>J</div>
        </div>
      </div>

      <div style={{ padding: "24px 24px 40px", maxWidth: 780, margin: "0 auto" }}>

        {/* HERO STAT STRIP */}
        <div style={{ background: BLACK, borderRadius: 18, padding: "22px 28px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 40 }}>
            {[
              { val: "5",  label: "Events ahead",  color: RED },
              { val: "3",  label: "Days to next",   color: WHITE },
              { val: "1",  label: "Draft waiting",  color: SAGE },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.4rem", color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", marginTop: 4, letterSpacing: "0.07em", textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: "rgba(255,255,255,0.38)", textAlign: "right", lineHeight: 1.4 }}>
            We've got it<br />handled.
          </div>
        </div>

        {/* UPCOMING MOMENTS */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, letterSpacing: "0.05em", margin: 0 }}>UPCOMING MOMENTS</h2>
            <span style={{ fontSize: "0.72rem", color: GRAY, fontWeight: 500 }}>Next 30 days</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MOMENTS.map(m => {
              const urgent = m.days <= 7;
              return (
                <div
                  key={m.id}
                  onMouseEnter={() => setHov(m.id)}
                  onMouseLeave={() => setHov(null)}
                  style={{
                    background: WHITE,
                    borderRadius: 14,
                    padding: "15px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    border: urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                    boxShadow: urgent ? `0 3px 16px ${RED}25` : hov === m.id ? "0 2px 14px rgba(0,0,0,0.07)" : "none",
                    transition: "all 0.15s",
                    cursor: "pointer",
                  }}
                >
                  {/* Day badge */}
                  <div style={{
                    width: 54, height: 54, borderRadius: 12, flexShrink: 0,
                    background: urgent ? RED : CREAM,
                    border: urgent ? "none" : `1.5px solid ${BORDER}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</div>
                    <div style={{ fontSize: "0.55rem", color: urgent ? "rgba(255,255,255,0.75)" : GRAY, textTransform: "uppercase", letterSpacing: "0.06em" }}>days</div>
                  </div>
                  <div style={{ fontSize: "1.7rem", flexShrink: 0 }}>{m.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>{m.name}</span>
                      <span style={{ fontSize: "0.7rem", color: GRAY, fontWeight: 500 }}>{m.rel}</span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: GRAY }}>{m.event} · {m.date}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ padding: "4px 10px", borderRadius: 20, background: `${m.sc}18`, color: m.sc, fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.04em" }}>
                      {m.status}
                    </span>
                    <button style={{
                      padding: "8px 16px", borderRadius: 9,
                      background: urgent ? RED : "none",
                      border: urgent ? "none" : `1.5px solid ${BORDER}`,
                      color: urgent ? WHITE : BLACK,
                      fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      whiteSpace: "nowrap",
                    }}>
                      {m.status === "Draft ready" ? "Review Draft" : m.status === "Add details" ? "Add Details" : "View →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* YOUR PEOPLE */}
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, letterSpacing: "0.05em", margin: "0 0 16px" }}>YOUR PEOPLE</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {PEOPLE.map(p => (
              <div key={p.name} style={{ background: WHITE, borderRadius: 14, padding: "18px 14px", border: `1.5px solid ${BORDER}`, textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: "1.9rem", marginBottom: 7 }}>{p.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK, marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: "0.72rem", color: GRAY, marginBottom: 7 }}>{p.rel}</div>
                <div style={{ fontSize: "0.65rem", color: SAGE, fontWeight: 700, background: `${SAGE}12`, padding: "3px 8px", borderRadius: 20, display: "inline-block" }}>{p.epy} events/yr</div>
              </div>
            ))}
            <div style={{ borderRadius: 14, padding: "18px 14px", border: `2px dashed ${SAGE}60`, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 6, minHeight: 110 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: `2px dashed ${SAGE}80`, display: "flex", alignItems: "center", justifyContent: "center", color: SAGE, fontSize: "1.2rem", fontWeight: 700 }}>+</div>
              <div style={{ fontSize: "0.72rem", color: SAGE, fontWeight: 600 }}>Add Person</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
