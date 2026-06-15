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
const AMBER = "#D97706";

const moments = [
  { name: "Steve",  rel: "Friend",  emoji: "🤝", event: "Birthday",      date: "Jun 14", days: 3,  status: "Draft ready", statusColor: SAGE  },
  { name: "Sarah",  rel: "Sister",  emoji: "👩", event: "Anniversary",   date: "Jun 19", days: 8,  status: "On track",    statusColor: SAGE  },
  { name: "Mom",    rel: "Mother",  emoji: "💛", event: "Mother's Day",  date: "Jun 26", days: 15, status: "Add details", statusColor: AMBER },
  { name: "Marcus", rel: "Friend",  emoji: "🧢", event: "Just Because",  date: "Jul 3",  days: 22, status: "On track",    statusColor: SAGE  },
  { name: "Dad",    rel: "Father",  emoji: "👔", event: "Father's Day",  date: "Jul 9",  days: 28, status: "On track",    statusColor: SAGE  },
];

const people = [
  { name: "Steve",  rel: "Friend",  emoji: "🤝", evtsYr: 3 },
  { name: "Sarah",  rel: "Sister",  emoji: "👩", evtsYr: 4 },
  { name: "Mom",    rel: "Mother",  emoji: "💛", evtsYr: 5 },
  { name: "Marcus", rel: "Friend",  emoji: "🧢", evtsYr: 2 },
  { name: "Dad",    rel: "Father",  emoji: "👔", evtsYr: 3 },
  { name: "Jenny",  rel: "Client",  emoji: "💼", evtsYr: 2 },
];

export function Dashboard() {
  const [_hover, setHover] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14 }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 30, color: RED, letterSpacing: 1 }}>F.I. FORGOT</span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: 17, color: "rgba(255,255,255,0.5)" }}>your next 30 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "8px 16px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: 0.3 }}>
            + ADD MOMENT
          </button>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#2a2a2a", border: "2px solid #444", display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontWeight: 700, fontSize: 13 }}>M</div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 24px 56px" }}>

        {/* Hero stat strip */}
        <div style={{ background: BLACK, borderRadius: 18, padding: "20px 30px", display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
          {[
            { value: "5", label: "events coming",  color: RED },
            { value: "3", label: "days to next",   color: WHITE },
            { value: "1", label: "draft waiting",  color: SAGE },
          ].map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.1)", margin: "0 28px" }} />}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 46, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontFamily: "'Caveat', cursive", fontSize: 22, color: "rgba(255,255,255,0.65)", lineHeight: 1.3 }}>We've got it<br />handled.</div>
          </div>
        </div>

        {/* Upcoming Moments */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: BLACK, letterSpacing: 1 }}>UPCOMING MOMENTS</h2>
            <span style={{ fontSize: 12, color: GRAY, fontWeight: 500 }}>Next 30 days · 5 events</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {moments.map((m) => {
              const urgent = m.days <= 7;
              const id = m.name + m.event;
              return (
                <div
                  key={id}
                  onMouseEnter={() => setHover(id)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    background: WHITE,
                    borderRadius: 14,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    border: urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
                    boxShadow: urgent ? `0 4px 16px ${RED}20` : "0 1px 4px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.15s",
                    cursor: "pointer",
                  }}
                >
                  {/* Day badge */}
                  <div style={{
                    minWidth: 54, height: 54, borderRadius: 12,
                    background: urgent ? RED : CREAM,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                    <span style={{ fontSize: 9, color: urgent ? "rgba(255,255,255,0.75)" : GRAY, textTransform: "uppercase", letterSpacing: 0.8 }}>days</span>
                  </div>

                  {/* Emoji */}
                  <span style={{ fontSize: 30 }}>{m.emoji}</span>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: BLACK }}>{m.name}</span>
                      <span style={{ fontSize: 11, color: GRAY, background: `${BLACK}08`, padding: "2px 8px", borderRadius: 20 }}>{m.rel}</span>
                    </div>
                    <div style={{ fontSize: 13, color: GRAY }}>{m.event} · {m.date}</div>
                  </div>

                  {/* Status chip */}
                  <div style={{ background: `${m.statusColor}15`, color: m.statusColor, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, letterSpacing: 0.2, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {m.status}
                  </div>

                  {/* Action button */}
                  <button style={{
                    background: urgent ? RED : WHITE,
                    color: urgent ? WHITE : BLACK,
                    border: urgent ? "none" : `1.5px solid ${BORDER}`,
                    borderRadius: 8, padding: "9px 18px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12,
                    cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', cursive", fontSize: 24, color: BLACK, letterSpacing: 1 }}>YOUR PEOPLE</h2>
            <button style={{ fontSize: 12, color: SAGE, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>View all →</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {people.map((p) => (
              <div key={p.name} style={{ background: WHITE, borderRadius: 14, padding: "20px 16px", border: `1.5px solid ${BORDER}`, textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>{p.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: 11, color: GRAY, marginTop: 3 }}>{p.rel}</div>
                <div style={{ fontSize: 11, color: SAGE, marginTop: 8, fontWeight: 700 }}>{p.evtsYr} events/yr</div>
              </div>
            ))}
            <div style={{ background: "transparent", borderRadius: 14, padding: "20px 16px", border: `2px dashed ${SAGE}50`, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", minHeight: 110 }}>
              <span style={{ fontSize: 22, color: SAGE }}>+</span>
              <span style={{ fontSize: 13, color: SAGE, fontWeight: 700 }}>Add Person</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
