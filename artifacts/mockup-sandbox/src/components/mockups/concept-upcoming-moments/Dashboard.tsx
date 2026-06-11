// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

const moments = [
  { id: 1, days: 3,  date: "Jun 14", emoji: "🎂", name: "Steve",  rel: "Friend",  event: "Birthday",     status: "Draft ready", statusClr: SAGE },
  { id: 2, days: 8,  date: "Jun 19", emoji: "💍", name: "Sarah",  rel: "Sister",  event: "Anniversary",  status: "On track",    statusClr: SAGE },
  { id: 3, days: 15, date: "Jun 26", emoji: "💛", name: "Mom",    rel: "Mother",  event: "Mother's Day", status: "Add details", statusClr: "#D97706" },
  { id: 4, days: 22, date: "Jul 3",  emoji: "🧢", name: "Marcus", rel: "Friend",  event: "Just Because", status: "On track",    statusClr: SAGE },
  { id: 5, days: 28, date: "Jul 9",  emoji: "👔", name: "Dad",    rel: "Father",  event: "Father's Day", status: "On track",    statusClr: SAGE },
];

const people = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  events: 4 },
  { emoji: "👩", name: "Sarah",  rel: "Sister",  events: 3 },
  { emoji: "💛", name: "Mom",    rel: "Mother",  events: 5 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  events: 2 },
  { emoji: "👔", name: "Dad",    rel: "Father",  events: 3 },
  { emoji: "💼", name: "Jenny",  rel: "Client",  events: 2 },
];

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Nav ── */}
      <div style={{ background: BLACK, height: 60, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.75rem", color: RED, letterSpacing: "0.04em" }}>F.I. FORGOT</span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "#ffffff70" }}>your next 30 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", letterSpacing: "0.02em" }}>+ ADD MOMENT</button>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>👤</div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>

        {/* ── Hero Stat Strip ── */}
        <div style={{ background: BLACK, borderRadius: 18, padding: "22px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 40 }}>
            {[
              { val: "5", label: "Events this month", color: RED },
              { val: "3", label: "Days to next",      color: WHITE },
              { val: "1", label: "Draft waiting",     color: SAGE },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem", color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "0.68rem", color: "#ffffff55", textTransform: "uppercase", letterSpacing: "0.09em", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.4rem", color: "#ffffff55" }}>We've got it handled.</div>
        </div>

        {/* ── Upcoming Moments ── */}
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 14px" }}>Upcoming Moments</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
          {moments.map(m => {
            const urgent = m.days <= 7;
            return (
              <div
                key={m.id}
                onMouseEnter={() => setHov(m.id)}
                onMouseLeave={() => setHov(null)}
                style={{
                  background: WHITE, borderRadius: 13, padding: "15px 20px",
                  display: "flex", alignItems: "center", gap: 16,
                  border: urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                  boxShadow: urgent ? `0 3px 14px ${RED}22` : "0 1px 4px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  transform: hov === m.id ? "translateX(4px)" : "none",
                  transition: "transform 0.12s ease",
                }}
              >
                {/* Day badge */}
                <div style={{
                  width: 56, height: 56, borderRadius: 11, flexShrink: 0,
                  background: urgent ? RED : CREAM,
                  color: urgent ? WHITE : BLACK,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Bebas Neue', cursive",
                }}>
                  <div style={{ fontSize: "1.5rem", lineHeight: 1 }}>{m.days}</div>
                  <div style={{ fontSize: "0.58rem", letterSpacing: "0.08em", opacity: 0.75 }}>DAYS</div>
                </div>

                <div style={{ fontSize: "1.9rem", flexShrink: 0 }}>{m.emoji}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: BLACK }}>{m.name}</span>
                    <span style={{ fontSize: "0.78rem", color: GRAY }}>{m.rel}</span>
                  </div>
                  <div style={{ fontSize: "0.83rem", color: GRAY, marginTop: 2 }}>{m.event} · {m.date}</div>
                </div>

                <div style={{ background: `${m.statusClr}1A`, color: m.statusClr, padding: "5px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                  {m.status}
                </div>

                <button style={{
                  background: urgent ? RED : "transparent",
                  color: urgent ? WHITE : BLACK,
                  border: urgent ? "none" : `1.5px solid ${BORDER}`,
                  borderRadius: 8, padding: "8px 16px",
                  fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", flexShrink: 0,
                }}>
                  {m.status === "Draft ready" ? "Review Draft" : m.status === "Add details" ? "Add Details" : "View"}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Your People Grid ── */}
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 14px" }}>Your People</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {people.map(p => (
            <div key={p.name} style={{ background: WHITE, borderRadius: 13, padding: "18px 16px", border: `1.5px solid ${BORDER}`, cursor: "pointer" }}>
              <div style={{ fontSize: "1.7rem", marginBottom: 8 }}>{p.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>{p.name}</div>
              <div style={{ fontSize: "0.78rem", color: GRAY, marginTop: 2 }}>{p.rel}</div>
              <div style={{ fontSize: "0.75rem", color: SAGE, marginTop: 7, fontWeight: 600 }}>{p.events} events / yr</div>
            </div>
          ))}
          <div style={{ borderRadius: 13, padding: "18px 16px", border: `2px dashed ${SAGE}55`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", minHeight: 100 }}>
            <div style={{ fontSize: "1.6rem", color: SAGE }}>＋</div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: SAGE }}>Add Person</div>
          </div>
        </div>

      </div>
    </div>
  );
}
