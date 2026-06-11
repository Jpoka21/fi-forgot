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

const moments = [
  { name: "Steve",  rel: "Friend",  emoji: "🤝", event: "Birthday",     days: 3,  date: "Jun 14", status: "Draft ready",  statusColor: SAGE },
  { name: "Sarah",  rel: "Sister",  emoji: "👩",  event: "Anniversary",  days: 8,  date: "Jun 19", status: "On track",     statusColor: SAGE },
  { name: "Mom",    rel: "Mother",  emoji: "💛",  event: "Mother's Day", days: 15, date: "Jun 26", status: "Add details",  statusColor: "#D97706" },
  { name: "Marcus", rel: "Friend",  emoji: "🧢",  event: "Just Because", days: 22, date: "Jul 3",  status: "On track",     statusColor: SAGE },
  { name: "Dad",    rel: "Father",  emoji: "👔",  event: "Father's Day", days: 28, date: "Jul 9",  status: "On track",     statusColor: SAGE },
];

const people = [
  { name: "Steve",  rel: "Friend",  emoji: "🤝", events: 4 },
  { name: "Sarah",  rel: "Sister",  emoji: "👩",  events: 6 },
  { name: "Mom",    rel: "Mother",  emoji: "💛",  events: 5 },
  { name: "Marcus", rel: "Friend",  emoji: "🧢",  events: 3 },
  { name: "Dad",    rel: "Father",  emoji: "👔",  events: 4 },
  { name: "Jenny",  rel: "Client",  emoji: "💼",  events: 2 },
];

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: "100vh", color: BLACK }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 58, display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: RED, letterSpacing: "0.06em" }}>F.I. FORGOT</span>
        <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: "rgba(255,255,255,0.55)", flex: 1 }}>your next 30 days</span>
        <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "8px 16px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer", letterSpacing: "0.02em" }}>+ ADD MOMENT</button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>A</div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stat strip */}
        <div style={{ background: BLACK, borderRadius: 16, padding: "20px 28px", display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
          {[
            { val: "5", label: "events coming up", color: RED },
            { val: "3", label: "days to next", color: WHITE },
            { val: "1", label: "draft waiting", color: SAGE },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.6rem", color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{s.label}</div>
              </div>
              {i < 2 && <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />}
            </div>
          ))}
          <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.1)", flexShrink: 0, marginRight: 24 }} />
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem", color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>We've got it handled.</span>
        </div>

        {/* Upcoming Moments */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", letterSpacing: "0.06em", marginBottom: 16, color: BLACK }}>UPCOMING MOMENTS</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {moments.map((m, i) => {
              const urgent = m.days <= 7;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: hovered === i ? "#FFFAF5" : WHITE,
                    borderRadius: 14,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    border: `1.5px solid ${urgent ? RED : BORDER}`,
                    boxShadow: urgent ? `0 2px 18px ${RED}18` : "0 1px 6px rgba(0,0,0,0.04)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{
                    minWidth: 56, height: 56, borderRadius: 12,
                    background: urgent ? RED : CREAM,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                    <span style={{ fontSize: "0.58rem", color: urgent ? "rgba(255,255,255,0.75)" : GRAY, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 1 }}>days</span>
                  </div>

                  <span style={{ fontSize: "1.9rem", flexShrink: 0 }}>{m.emoji}</span>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem", color: BLACK }}>{m.name}</span>
                      <span style={{ fontSize: "0.78rem", color: GRAY }}>{m.rel}</span>
                    </div>
                    <div style={{ fontSize: "0.83rem", color: GRAY }}>{m.event} · {m.date}</div>
                  </div>

                  <span style={{
                    padding: "4px 11px", borderRadius: 20,
                    background: `${m.statusColor}18`,
                    border: `1px solid ${m.statusColor}40`,
                    color: m.statusColor,
                    fontSize: "0.72rem", fontWeight: 600, flexShrink: 0,
                  }}>{m.status}</span>

                  <button style={{
                    padding: "8px 16px", borderRadius: 9,
                    border: `1.5px solid ${urgent ? RED : BORDER}`,
                    background: urgent ? RED : "transparent",
                    color: urgent ? WHITE : BLACK,
                    fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
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
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.55rem", letterSpacing: "0.06em", marginBottom: 16, color: BLACK }}>YOUR PEOPLE</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {people.map((p, i) => (
              <div key={i} style={{ background: WHITE, borderRadius: 14, padding: "18px 16px", border: `1.5px solid ${BORDER}`, textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: "2.2rem", marginBottom: 8 }}>{p.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>{p.name}</div>
                <div style={{ fontSize: "0.75rem", color: GRAY, marginBottom: 6 }}>{p.rel}</div>
                <div style={{ fontSize: "0.7rem", color: GRAY, background: `${BLACK}07`, borderRadius: 6, padding: "2px 8px", display: "inline-block" }}>{p.events} events/yr</div>
              </div>
            ))}
            <div style={{ background: "transparent", borderRadius: 14, padding: "18px 16px", border: `1.5px dashed ${SAGE}50`, textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 110 }}>
              <span style={{ fontSize: "1.6rem", color: SAGE }}>+</span>
              <span style={{ fontSize: "0.82rem", color: SAGE, fontWeight: 600 }}>Add Person</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
