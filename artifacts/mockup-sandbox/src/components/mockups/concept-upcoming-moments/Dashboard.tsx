// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";
const AMBER = "#D97706";

const MOMENTS = [
  { name: "Steve",  emoji: "🤝", rel: "Friend",  event: "Birthday",     date: "Jun 14", days: 3,  status: "Draft ready",  statusC: SAGE  },
  { name: "Sarah",  emoji: "👩", rel: "Sister",  event: "Anniversary",  date: "Jun 19", days: 8,  status: "On track",     statusC: SAGE  },
  { name: "Mom",    emoji: "💛", rel: "Mother",  event: "Mother's Day", date: "Jun 26", days: 15, status: "Add details",  statusC: AMBER },
  { name: "Marcus", emoji: "🧢", rel: "Friend",  event: "Just Because", date: "Jul 3",  days: 22, status: "On track",     statusC: SAGE  },
  { name: "Dad",    emoji: "👔", rel: "Father",  event: "Father's Day", date: "Jul 9",  days: 28, status: "On track",     statusC: SAGE  },
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
  const [hov, setHov] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "0 32px", height: 62, display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: RED, letterSpacing: 2, flexShrink: 0 }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem", color: "rgba(255,255,255,0.45)", flex: 1 }}>your next 30 days</span>
        <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", letterSpacing: "0.03em" }}>+ ADD MOMENT</button>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>🙂</div>
      </nav>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "30px 28px" }}>
        {/* Hero stat strip */}
        <div style={{ background: BLACK, borderRadius: 18, padding: "22px 32px", display: "flex", alignItems: "center", gap: 36, marginBottom: 32 }}>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3rem", color: RED, lineHeight: 1 }}>5</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.1em", marginTop: 2 }}>EVENTS COMING</div>
          </div>
          <div style={{ width: 1, height: 52, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ textAlign: "center" as const }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3rem", color: WHITE, lineHeight: 1 }}>3</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.1em", marginTop: 2 }}>DAYS TO NEXT</div>
          </div>
          <div style={{ width: 1, height: 52, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ textAlign: "center" as const }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3rem", color: SAGE, lineHeight: 1 }}>1</div>
            <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.1em", marginTop: 2 }}>DRAFT WAITING</div>
          </div>
          <div style={{ flex: 1, textAlign: "right" as const }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.4rem", color: "rgba(255,255,255,0.55)" }}>We've got it handled.</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 296px", gap: 28 }}>
          {/* Upcoming Moments timeline */}
          <div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", color: BLACK, letterSpacing: "0.12em", marginBottom: 16 }}>UPCOMING MOMENTS</div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {MOMENTS.map((m, i) => {
                const urgent = m.days <= 7;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHov(i)}
                    onMouseLeave={() => setHov(null)}
                    style={{
                      background: WHITE,
                      borderRadius: 14,
                      padding: "14px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      border: urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                      boxShadow: urgent
                        ? `0 4px 20px ${RED}22`
                        : hov === i ? "0 4px 14px rgba(0,0,0,0.07)" : "0 1px 4px rgba(0,0,0,0.04)",
                      cursor: "pointer",
                      transition: "box-shadow 0.15s",
                    }}
                  >
                    {/* Day badge */}
                    <div style={{
                      minWidth: 56, height: 56, borderRadius: 13,
                      background: urgent ? RED : CREAM,
                      display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.65rem", color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                      <span style={{ fontSize: "0.58rem", fontWeight: 700, color: urgent ? "rgba(255,255,255,0.75)" : GRAY, letterSpacing: "0.08em" }}>DAYS</span>
                    </div>
                    {/* Emoji */}
                    <div style={{ fontSize: "2rem", flexShrink: 0 }}>{m.emoji}</div>
                    {/* Name + event */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                        <span style={{ fontWeight: 800, fontSize: "1rem", color: BLACK }}>{m.name}</span>
                        <span style={{ fontSize: "0.72rem", color: GRAY, fontWeight: 500 }}>{m.rel}</span>
                      </div>
                      <div style={{ fontSize: "0.82rem", color: GRAY, marginTop: 2 }}>{m.event} · {m.date}</div>
                    </div>
                    {/* Status chip */}
                    <div style={{
                      background: `${m.statusC}18`,
                      color: m.statusC,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      borderRadius: 20,
                      padding: "4px 11px",
                      flexShrink: 0,
                      letterSpacing: "0.03em",
                    }}>{m.status}</div>
                    {/* Action */}
                    <button style={{
                      background: urgent ? RED : "transparent",
                      color: urgent ? WHITE : BLACK,
                      border: urgent ? "none" : `1.5px solid ${BLACK}22`,
                      borderRadius: 9,
                      padding: "9px 15px",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      flexShrink: 0,
                      whiteSpace: "nowrap" as const,
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
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", color: BLACK, letterSpacing: "0.12em", marginBottom: 16 }}>YOUR PEOPLE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {PEOPLE.map((p, i) => (
                <div key={i} style={{
                  background: WHITE, borderRadius: 13, padding: "14px 8px",
                  textAlign: "center" as const, border: `1.5px solid ${BORDER}`,
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}>
                  <div style={{ fontSize: "1.7rem" }}>{p.emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: "0.78rem", color: BLACK, marginTop: 6 }}>{p.name}</div>
                  <div style={{ fontSize: "0.65rem", color: GRAY, marginTop: 1 }}>{p.rel}</div>
                  <div style={{ fontSize: "0.62rem", color: SAGE, marginTop: 5, fontWeight: 700 }}>{p.evts} events/yr</div>
                </div>
              ))}
              <div style={{
                borderRadius: 13, padding: "14px 8px",
                textAlign: "center" as const,
                border: `2px dashed ${SAGE}55`,
                cursor: "pointer",
                display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", minHeight: 90,
              }}>
                <div style={{ fontSize: "1.5rem", color: SAGE, lineHeight: 1 }}>+</div>
                <div style={{ fontSize: "0.65rem", color: SAGE, fontWeight: 700, marginTop: 4 }}>Add Person</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
