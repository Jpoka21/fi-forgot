// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

export function Mobile() {
  const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF", CREAM="#FDF7EF";

  const entries = [
    {
      id: 1,
      emoji: "🧢",
      name: "Marcus",
      text: "Got promoted to VP of Sales — big deal for him",
      date: "2w",
      followUp: true,
      usedInCard: "Birthday Card"
    },
    {
      id: 2,
      emoji: "💛",
      name: "Mom",
      text: "Knee surgery went really well, recovering at home",
      date: "1w",
      followUp: false
    },
    {
      id: 3,
      emoji: "🤝",
      name: "Steve",
      text: "Started taking guitar lessons — always wanted to learn",
      date: "3w",
      followUp: true
    },
    {
      id: 4,
      emoji: "👩",
      name: "Sarah",
      text: "Her daughter just started kindergarten, emotional week",
      date: "4w",
      followUp: false
    }
  ];

  return (
    <div style={{ maxWidth: "390px", margin: "0 auto", background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK, position: "relative", paddingBottom: "80px" }}>
      {/* Header */}
      <header style={{ background: BLACK, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", color: WHITE, fontSize: "1.5rem", margin: 0, letterSpacing: "1px" }}>WHAT'S NEW</h1>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: RED, display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, fontWeight: "bold", fontSize: "0.8rem" }}>JD</div>
      </header>

      {/* Feed */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {entries.map(entry => (
          <div key={entry.id} style={{ 
            background: WHITE, 
            padding: "16px", 
            borderRadius: "12px", 
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: `1px solid ${BORDER}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ background: CREAM, padding: "2px 10px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "6px", border: `1px solid ${BORDER}` }}>
                <span>{entry.emoji}</span>
                <span style={{ fontWeight: "700", fontSize: "0.8rem" }}>{entry.name}</span>
              </div>
              <span style={{ color: GRAY, fontSize: "0.75rem" }}>{entry.date}</span>
            </div>
            
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", margin: "8px 0", lineHeight: "1.4" }}>
              "{entry.text}"
            </p>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "12px" }}>
              {entry.followUp && (
                <span style={{ background: "#FFF4E5", color: "#B7791F", padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "700", border: "1px solid #F6AD55" }}>
                  ↻ Follow-up
                </span>
              )}
              {entry.usedInCard && (
                <span style={{ background: `${SAGE}10`, color: SAGE, padding: "2px 6px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "700", border: `1px solid ${SAGE}30` }}>
                  ✓ In Card
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button style={{ 
        position: "fixed", 
        bottom: "100px", 
        right: "20px", 
        width: "56px", 
        height: "56px", 
        background: RED, 
        color: WHITE, 
        border: "none", 
        borderRadius: "50%", 
        fontSize: "1.5rem", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(226, 59, 46, 0.4)",
        cursor: "pointer",
        zIndex: 20
      }}>
        ＋
      </button>

      {/* Bottom Nav */}
      <nav style={{ 
        position: "fixed", 
        bottom: 0, 
        left: 0, 
        right: 0, 
        maxWidth: "390px", 
        margin: "0 auto", 
        background: BLACK, 
        display: "flex", 
        justifyContent: "space-around", 
        padding: "12px 0 24px 0",
        zIndex: 30
      }}>
        {[
          { label: "Feed", icon: "📱", active: true },
          { label: "People", icon: "👥" },
          { label: "Moments", icon: "🗓️" },
          { label: "Settings", icon: "⚙️" }
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", opacity: item.active ? 1 : 0.5 }}>
            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
            <span style={{ color: item.active ? RED : WHITE, fontSize: "0.65rem", fontWeight: "600" }}>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
