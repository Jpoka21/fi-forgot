// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

export function Mobile() {
  const BG = "#F2E6D3";
  const RED = "#E23B2E";
  const BLACK = "#111111";
  const SAGE = "#5B8C6B";
  const GRAY = "#6B6B6B";
  const BORDER = "#E5E0D8";
  const WHITE = "#FFFFFF";
  const CREAM = "#FDF7EF";

  const moments = [
    { name: "Steve", event: "Birthday", date: "Jun 14", days: 3, emoji: "🤝", urgent: true },
    { name: "Sarah", event: "Anniversary", date: "Jun 19", days: 8, emoji: "👩", urgent: false },
    { name: "Mom", event: "Mother's Day", date: "Jun 26", days: 15, emoji: "💛", urgent: false },
    { name: "Marcus", event: "Just Because", date: "Jul 3", days: 22, emoji: "🧢", urgent: false },
  ];

  const people = [
    { name: "Steve", rel: "Friend", emoji: "🤝", next: "3 days" },
    { name: "Sarah", rel: "Sister", emoji: "👩", next: "8 days" },
    { name: "Mom", rel: "Mother", emoji: "💛", next: "15 days" },
    { name: "Marcus", rel: "Friend", emoji: "🧢", next: "22 days" },
    { name: "Dad", rel: "Father", emoji: "👔", next: "28 days" },
  ];

  return (
    <div style={{ 
      width: "390px", 
      height: "844px", 
      backgroundColor: BG, 
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: BLACK,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      margin: "0 auto",
      border: "8px solid #333",
      borderRadius: "48px",
      position: "relative"
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: BLACK, 
        padding: "48px 20px 20px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "24px", color: RED, letterSpacing: "1px" }}>F.I. FORGOT</span>
        <div style={{ backgroundColor: RED, color: WHITE, padding: "4px 10px", borderRadius: "4px", fontFamily: "'Bebas Neue', cursive", fontSize: "14px" }}>30 DAYS</div>
      </header>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "100px" }}>
        {/* Horizontal Scroll Moments */}
        <div style={{ padding: "24px 0 32px" }}>
          <div style={{ display: "flex", overflowX: "auto", padding: "0 20px", gap: "16px", scrollbarWidth: "none" }}>
            {moments.map((m, i) => (
              <div key={i} style={{ 
                minWidth: "280px", 
                backgroundColor: WHITE, 
                borderRadius: "20px", 
                padding: "24px", 
                border: m.urgent ? `2px solid ${RED}` : `1px solid ${BORDER}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                position: "relative"
              }}>
                <div style={{ 
                  backgroundColor: m.urgent ? RED : CREAM, 
                  color: m.urgent ? WHITE : BLACK, 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "10px", 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  justifyContent: "center",
                  position: "absolute",
                  top: "24px",
                  right: "24px"
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "18px", lineHeight: 1 }}>{m.days}</span>
                  <span style={{ fontSize: "8px", fontWeight: "800", textTransform: "uppercase" }}>Days</span>
                </div>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>{m.emoji}</div>
                <div style={{ fontWeight: "800", fontSize: "20px" }}>{m.name}</div>
                <div style={{ color: GRAY, fontSize: "16px" }}>{m.event}</div>
                <div style={{ color: GRAY, fontSize: "14px", marginTop: "4px" }}>{m.date}</div>
                <button style={{ 
                  marginTop: "20px", 
                  width: "100%", 
                  backgroundColor: m.urgent ? RED : BLACK, 
                  color: WHITE, 
                  border: "none", 
                  padding: "12px", 
                  borderRadius: "10px", 
                  fontWeight: "700",
                  fontSize: "14px"
                }}>{m.urgent ? "Review Draft" : "View Details"}</button>
              </div>
            ))}
            <div style={{ minWidth: "40px" }}></div> {/* Peeking padding */}
          </div>
        </div>

        {/* Your People List */}
        <div style={{ padding: "0 20px" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "24px", marginBottom: "16px" }}>YOUR PEOPLE</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {people.map((p, i) => (
              <div key={i} style={{ 
                backgroundColor: WHITE, 
                padding: "16px", 
                borderRadius: "16px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                border: `1px solid ${BORDER}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "24px", width: "40px", height: "40px", backgroundColor: CREAM, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{p.emoji}</div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "15px" }}>{p.name}</div>
                    <div style={{ color: GRAY, fontSize: "13px" }}>{p.rel}</div>
                  </div>
                </div>
                <div style={{ backgroundColor: CREAM, padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: "700", color: BLACK }}>
                  Next: {p.next}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={{ 
        backgroundColor: BLACK, 
        padding: "16px 20px 32px", 
        display: "flex", 
        justifyContent: "space-around", 
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0
      }}>
        {[
          { label: "Moments", icon: "🗓", active: true },
          { label: "People", icon: "👥", active: false },
          { label: "Cards", icon: "💌", active: false },
          { label: "Settings", icon: "⚙️", active: false }
        ].map((t, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer" }}>
            <span style={{ fontSize: "20px" }}>{t.icon}</span>
            <span style={{ 
              fontSize: "10px", 
              fontWeight: "700", 
              color: t.active ? RED : WHITE, 
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>{t.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
