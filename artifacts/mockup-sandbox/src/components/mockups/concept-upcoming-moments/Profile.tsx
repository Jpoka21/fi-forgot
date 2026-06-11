// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

const BG = "#F2E6D3", RED = "#E23B2E", BLACK = "#111111", SAGE = "#5B8C6B";
const GRAY = "#6B6B6B", BORDER = "#E5E0D8", WHITE = "#FFFFFF", CREAM = "#FDF7EF";

export function Profile() {
  const [tab, setTab] = useState<"moments" | "cards">("moments");

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <div style={{ background: BLACK, height: 60, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.75rem", color: RED, letterSpacing: "0.04em" }}>F.I. FORGOT</span>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px" }}>

        {/* Back */}
        <div style={{ marginBottom: 20 }}>
          <a href="#" style={{ fontSize: "0.88rem", color: GRAY, textDecoration: "none", fontWeight: 600 }}>← Dashboard</a>
        </div>

        {/* Header card */}
        <div style={{ background: WHITE, borderRadius: 18, padding: "28px 28px 24px", border: `1.5px solid ${BORDER}`, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>🤝</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", color: BLACK, margin: 0, letterSpacing: "0.04em" }}>STEVE</h1>
                <span style={{ background: SAGE, color: WHITE, padding: "4px 12px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700 }}>Friend</span>
                <span style={{ background: `${SAGE}18`, color: SAGE, padding: "4px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600 }}>Active</span>
              </div>
              {/* Stats */}
              <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
                {[
                  { val: "5", label: "Cards Sent" },
                  { val: "2", label: "Upcoming Events" },
                  { val: "4", label: "Years Known" },
                ].map(s => (
                  <div key={s.label} style={{ background: BG, borderRadius: 10, padding: "10px 18px", textAlign: "center", border: `1px solid ${BORDER}` }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: BLACK, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Moments for Steve */}
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 12px" }}>Upcoming Moments</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {[
            { days: 3,  date: "Jun 14", emoji: "🎂", event: "Birthday",     urgent: true,  status: "Draft ready" },
            { days: 22, date: "Jul 3",  emoji: "🎉", event: "Just Because", urgent: false, status: "On track" },
          ].map((m, i) => (
            <div key={i} style={{
              background: WHITE, borderRadius: 12, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 14,
              border: m.urgent ? `2px solid ${RED}` : `1.5px solid ${BORDER}`,
              boxShadow: m.urgent ? `0 3px 12px ${RED}20` : "none",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 10, flexShrink: 0,
                background: m.urgent ? RED : CREAM, color: m.urgent ? WHITE : BLACK,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                fontFamily: "'Bebas Neue', cursive",
              }}>
                <div style={{ fontSize: "1.35rem", lineHeight: 1 }}>{m.days}</div>
                <div style={{ fontSize: "0.56rem", letterSpacing: "0.08em", opacity: 0.75 }}>DAYS</div>
              </div>
              <div style={{ fontSize: "1.7rem" }}>{m.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>{m.event}</div>
                <div style={{ fontSize: "0.8rem", color: GRAY, marginTop: 1 }}>{m.date}</div>
              </div>
              <button style={{
                background: m.urgent ? RED : "transparent",
                color: m.urgent ? WHITE : BLACK,
                border: m.urgent ? "none" : `1.5px solid ${BORDER}`,
                borderRadius: 8, padding: "7px 14px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
              }}>
                {m.status === "Draft ready" ? "Review Draft" : "View"}
              </button>
            </div>
          ))}
        </div>

        {/* Past Cards */}
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: BLACK, letterSpacing: "0.06em", margin: "0 0 12px" }}>Past Cards Sent</h2>
        <div style={{ background: WHITE, borderRadius: 14, border: `1.5px solid ${BORDER}`, overflow: "hidden", marginBottom: 24 }}>
          {[
            { date: "Dec 2023", event: "Christmas",     excerpt: "Merry Christmas brother, hope this year brought you everything…" },
            { date: "Jun 2023", event: "Birthday",      excerpt: "Wishing you the best birthday yet — you deserve every good thing…" },
            { date: "Feb 2024", event: "Just Because",  excerpt: "Thinking of you and everything you've been up to lately…" },
          ].map((c, i) => (
            <div key={i} style={{ padding: "14px 20px", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none", display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: SAGE, marginTop: 6, flexShrink: 0 }} />
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: BLACK }}>{c.event}</span>
                  <span style={{ fontSize: "0.75rem", color: GRAY }}>{c.date}</span>
                </div>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, lineHeight: 1.5 }}>"{c.excerpt}"</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: `2px solid ${SAGE}`, background: "transparent", color: SAGE, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>Add a Moment</button>
          <button style={{ flex: 1, padding: "12px", borderRadius: 10, border: `2px solid ${BORDER}`, background: "transparent", color: BLACK, fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>Edit Profile</button>
        </div>

      </div>
    </div>
  );
}
