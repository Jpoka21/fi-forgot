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
  { id: 1, emoji: "🤝", name: "Steve", rel: "Friend", event: "Birthday", date: "Jun 14", days: 3, status: "Draft ready", statusColor: SAGE, action: "Review Draft" },
  { id: 2, emoji: "👩", name: "Sarah", rel: "Sister", event: "Anniversary", date: "Jun 19", days: 8, status: "On track", statusColor: SAGE, action: "View" },
  { id: 3, emoji: "💛", name: "Mom", rel: "Mother", event: "Mother's Day", date: "Jun 26", days: 15, status: "Add details", statusColor: AMBER, action: "Add Details" },
  { id: 4, emoji: "🧢", name: "Marcus", rel: "Friend", event: "Just Because", date: "Jul 3", days: 22, status: "On track", statusColor: SAGE, action: "View" },
  { id: 5, emoji: "👔", name: "Dad", rel: "Father", event: "Father's Day", date: "Jul 9", days: 28, status: "On track", statusColor: SAGE, action: "View" },
];

const people = [
  { emoji: "🤝", name: "Steve", rel: "Friend", events: 3 },
  { emoji: "👩", name: "Sarah", rel: "Sister", events: 4 },
  { emoji: "💛", name: "Mom", rel: "Mother", events: 5 },
  { emoji: "🧢", name: "Marcus", rel: "Friend", events: 2 },
  { emoji: "👔", name: "Dad", rel: "Father", events: 3 },
  { emoji: "💼", name: "Jenny", rel: "Client", events: 2 },
];

export function Dashboard() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Nav */}
      <div style={{ background: BLACK, padding: "0 28px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: RED, letterSpacing: 2 }}>F.I. FORGOT</span>
          <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "rgba(255,255,255,0.55)" }}>your next 30 days</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "8px 16px", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", letterSpacing: 0.5 }}>
            + ADD MOMENT
          </button>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: SAGE, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontWeight: 700, fontSize: "0.85rem" }}>J</div>
        </div>
      </div>

      <div style={{ padding: "22px 28px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Hero stat strip */}
        <div style={{ background: BLACK, borderRadius: 14, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 32 }}>
            {[
              { val: "5", label: "EVENTS COMING UP", color: RED },
              { val: "3", label: "DAYS TO NEXT", color: WHITE },
              { val: "1", label: "DRAFTS WAITING", color: SAGE },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: i > 0 ? 32 : 0 }}>
                {i > 0 && <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.1)", marginRight: 32 }} />}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.2rem", color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.65rem", marginTop: 3, letterSpacing: 0.8 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.3rem", color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>We've got it handled.</div>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          {/* Upcoming Moments */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", color: BLACK, letterSpacing: 1.5, margin: 0 }}>UPCOMING MOMENTS</h2>
              <span style={{ fontSize: "0.72rem", color: GRAY }}>Next 30 days</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {moments.map(m => {
                const urgent = m.days <= 7;
                return (
                  <div
                    key={m.id}
                    onMouseEnter={() => setHovered(m.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      background: WHITE,
                      borderRadius: 12,
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      border: urgent ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                      boxShadow: urgent ? `0 2px 12px rgba(226,59,46,0.14)` : hovered === m.id ? "0 2px 8px rgba(0,0,0,0.07)" : "none",
                      transition: "box-shadow 0.15s",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{
                      minWidth: 50, height: 50, borderRadius: 10,
                      background: urgent ? RED : CREAM,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{m.days}</span>
                      <span style={{ fontSize: "0.58rem", color: urgent ? "rgba(255,255,255,0.8)" : GRAY, letterSpacing: 0.5 }}>DAYS</span>
                    </div>
                    <div style={{ fontSize: "1.7rem", flexShrink: 0 }}>{m.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>{m.name}</span>
                        <span style={{ fontSize: "0.72rem", color: GRAY }}>{m.rel}</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: GRAY, marginTop: 1 }}>{m.event} · {m.date}</div>
                    </div>
                    <div style={{
                      padding: "3px 10px", borderRadius: 20,
                      background: m.statusColor === AMBER ? "rgba(217,119,6,0.1)" : "rgba(91,140,107,0.1)",
                      color: m.statusColor, fontSize: "0.68rem", fontWeight: 600, flexShrink: 0,
                    }}>{m.status}</div>
                    <button style={{
                      padding: "6px 14px", borderRadius: 8,
                      border: urgent ? "none" : `1px solid ${BORDER}`,
                      background: urgent ? RED : WHITE,
                      color: urgent ? WHITE : BLACK,
                      fontWeight: 700, fontSize: "0.72rem", cursor: "pointer", flexShrink: 0,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>{m.action}</button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Your People */}
          <div style={{ width: 252, flexShrink: 0 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", color: BLACK, letterSpacing: 1.5, margin: "0 0 12px 0" }}>YOUR PEOPLE</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {people.map(p => (
                <div key={p.name} style={{ background: WHITE, borderRadius: 10, padding: "11px 8px", border: `1px solid ${BORDER}`, textAlign: "center", cursor: "pointer" }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{p.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.78rem", color: BLACK }}>{p.name}</div>
                  <div style={{ fontSize: "0.65rem", color: GRAY, marginTop: 1 }}>{p.rel}</div>
                  <div style={{ fontSize: "0.62rem", color: SAGE, marginTop: 3, fontWeight: 600 }}>{p.events} events/yr</div>
                </div>
              ))}
              <div style={{
                background: "transparent", borderRadius: 10, padding: "11px 8px",
                border: `2px dashed ${SAGE}`, textAlign: "center", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ fontSize: "1.2rem", color: SAGE, marginBottom: 3 }}>+</div>
                <div style={{ fontSize: "0.72rem", color: SAGE, fontWeight: 600 }}>Add Person</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
