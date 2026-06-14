// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const moments = [
  { days: 3,  date: "Jun 14", emoji: "🤝", name: "Steve",  rel: "Friend",  event: "Birthday",      status: "Draft ready", sc: SAGE  },
  { days: 8,  date: "Jun 19", emoji: "👩", name: "Sarah",  rel: "Sister",  event: "Anniversary",   status: "On track",    sc: SAGE  },
  { days: 15, date: "Jun 26", emoji: "💛", name: "Mom",    rel: "Mother",  event: "Mother's Day",  status: "Add details", sc: AMBER },
  { days: 22, date: "Jul 3",  emoji: "🧢", name: "Marcus", rel: "Friend",  event: "Just Because",  status: "On track",    sc: SAGE  },
  { days: 28, date: "Jul 9",  emoji: "👔", name: "Dad",    rel: "Father",  event: "Father's Day",  status: "On track",    sc: SAGE  },
];

const people = [
  { emoji: "🤝", name: "Steve",  rel: "Friend",  events: 4 },
  { emoji: "👩", name: "Sarah",  rel: "Sister",  events: 6 },
  { emoji: "💛", name: "Mom",    rel: "Mother",  events: 8 },
  { emoji: "🧢", name: "Marcus", rel: "Friend",  events: 3 },
  { emoji: "👔", name: "Dad",    rel: "Father",  events: 5 },
  { emoji: "💼", name: "Jenny",  rel: "Client",  events: 2 },
];

export function Dashboard() {
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh" }}>
      {/* Nav */}
      <div style={{ background: BLACK, height: 56, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "#ffffff70" }}>your next 30 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ padding: "6px 14px", borderRadius: 8, background: SAGE, border: "none", color: WHITE, fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}>+ ADD MOMENT</button>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontWeight: 700, fontSize: "0.8rem" }}>JD</div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "22px 24px" }}>
        {/* Stat strip */}
        <div style={{ background: BLACK, borderRadius: 16, padding: "18px 28px", marginBottom: 26, display: "flex", alignItems: "center" }}>
          {([
            { val: "5", label: "EVENTS COMING", color: RED },
            { val: "3", label: "DAYS TO NEXT",  color: WHITE },
            { val: "1", label: "DRAFT WAITING", color: SAGE },
          ] as const).map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ textAlign: "center", padding: "0 28px" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.4rem", color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "0.62rem", color: "#ffffff50", letterSpacing: "0.08em", marginTop: 3 }}>{s.label}</div>
              </div>
              {i < 2 && <div style={{ width: 1, height: 44, background: "#ffffff12" }} />}
            </div>
          ))}
          <div style={{ flex: 1, textAlign: "right" }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: "#ffffff55" }}>We've got it handled.</span>
          </div>
        </div>

        {/* Upcoming Moments */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", letterSpacing: "0.06em", color: BLACK, margin: 0 }}>UPCOMING MOMENTS</h2>
            <span style={{ fontSize: "0.76rem", color: GRAY }}>Next 30 days</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {moments.map((m, i) => {
              const urgent = m.days <= 7;
              const accentColor = urgent ? RED : m.days <= 14 ? AMBER : SAGE;
              return (
                <div key={i}
                  onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                  style={{
                    background: WHITE, borderRadius: 12,
                    border: `1px solid ${urgent ? RED + "50" : BORDER}`,
                    borderLeft: `4px solid ${accentColor}`,
                    padding: "13px 18px", display: "flex", alignItems: "center", gap: 14,
                    boxShadow: urgent ? `0 3px 16px ${RED}18` : hov === i ? "0 2px 10px rgba(0,0,0,0.06)" : "none",
                    transition: "box-shadow 0.15s", cursor: "pointer",
                  }}>
                  {/* Day badge */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                    background: urgent ? RED : CREAM, border: urgent ? "none" : `1px solid ${BORDER}`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</div>
                    <div style={{ fontSize: "0.58rem", fontWeight: 700, color: urgent ? "#ffffff70" : GRAY, letterSpacing: "0.06em" }}>DAYS</div>
                  </div>

                  <div style={{ fontSize: "2rem", flexShrink: 0 }}>{m.emoji}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.96rem", color: BLACK }}>{m.name}</span>
                      <span style={{ fontSize: "0.74rem", color: GRAY }}>{m.rel}</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: GRAY }}>{m.event} · {m.date}</div>
                  </div>

                  <div style={{ padding: "4px 11px", borderRadius: 20, background: `${m.sc}18`, color: m.sc, fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>
                    {m.status}
                  </div>

                  <button style={{
                    padding: "7px 16px", borderRadius: 8,
                    background: urgent ? RED : "transparent",
                    border: urgent ? "none" : `1px solid ${BORDER}`,
                    color: urgent ? WHITE : BLACK,
                    fontWeight: 700, fontSize: "0.75rem", cursor: "pointer", flexShrink: 0,
                  }}>
                    {m.status === "Draft ready" ? "Review Draft" : m.status === "Add details" ? "Add Details" : "View"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your People */}
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", letterSpacing: "0.06em", color: BLACK, marginBottom: 14 }}>YOUR PEOPLE</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {people.map((p, i) => (
              <div key={i} style={{ background: WHITE, borderRadius: 12, padding: "16px", border: `1px solid ${BORDER}`, cursor: "pointer" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{p.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: "0.74rem", color: GRAY, marginBottom: 8 }}>{p.rel}</div>
                <div style={{ fontSize: "0.7rem", color: SAGE, fontWeight: 600 }}>{p.events} events / yr</div>
              </div>
            ))}
            <div style={{ borderRadius: 12, padding: "16px", border: `2px dashed ${SAGE}60`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: SAGE, fontWeight: 700, fontSize: "0.84rem", gap: 4 }}>
              <div style={{ fontSize: "1.5rem" }}>+</div>
              <div>Add Person</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
