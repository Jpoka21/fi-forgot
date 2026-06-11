// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

export function Dashboard() {
  const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF", CREAM="#FDF7EF";

  const entries = [
    {
      id: 1,
      emoji: "🧢",
      name: "Marcus",
      text: "Got promoted to VP of Sales — big deal for him",
      date: "2 weeks ago",
      followUp: true,
      usedInCard: "Marcus's Birthday Card",
      borderColor: RED
    },
    {
      id: 2,
      emoji: "💛",
      name: "Mom",
      text: "Knee surgery went really well, recovering at home",
      date: "1 week ago",
      followUp: false,
      usedInCard: null,
      borderColor: SAGE
    },
    {
      id: 3,
      emoji: "🤝",
      name: "Steve",
      text: "Started taking guitar lessons — always wanted to learn",
      date: "3 weeks ago",
      followUp: true,
      usedInCard: null,
      borderColor: BLACK
    },
    {
      id: 4,
      emoji: "👩",
      name: "Sarah",
      text: "Her daughter just started kindergarten, emotional week",
      date: "4 weeks ago",
      followUp: false,
      usedInCard: null,
      borderColor: RED
    },
    {
      id: 5,
      emoji: "👔",
      name: "Dad",
      text: "Officially retired last month, adjusting to the new rhythm",
      date: "5 weeks ago",
      followUp: true,
      usedInCard: null,
      borderColor: SAGE
    },
    {
      id: 6,
      emoji: "💼",
      name: "Jenny",
      text: "Just closed her biggest deal of the year",
      date: "1 week ago",
      followUp: false,
      usedInCard: null,
      borderColor: BLACK
    }
  ];

  const upcoming = [
    { name: "Marcus", event: "Birthday", days: 3 },
    { name: "Mom", event: "Mother's Day", days: 15 },
    { name: "Sarah", event: "Anniversary", days: 8 }
  ];

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>
      {/* Nav */}
      <nav style={{ background: BLACK, padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontFamily: "'Bebas Neue', cursive", color: WHITE, fontSize: "2rem", margin: 0, letterSpacing: "1px" }}>WHAT'S NEW</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
           <span style={{ fontFamily: "'Bebas Neue', cursive", color: RED, fontSize: "1.2rem" }}>F.I. FORGOT</span>
        </div>
      </nav>

      {/* Warning Strip */}
      <div style={{ background: "#FFB000", padding: "8px 24px", textAlign: "center", fontWeight: "600", fontSize: "0.9rem" }}>
        ↻ 3 follow-ups waiting — answer them before cards are written
      </div>

      <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 24px", display: "flex", gap: "40px" }}>
        {/* Left Feed */}
        <div style={{ flex: "0 0 65%", display: "flex", flexDirection: "column", gap: "16px" }}>
          {entries.map(entry => (
            <div key={entry.id} style={{ 
              background: WHITE, 
              padding: "24px", 
              borderRadius: "8px", 
              borderLeft: `3px solid ${entry.borderColor}`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              position: "relative"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ background: CREAM, padding: "4px 12px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "8px", border: `1px solid ${BORDER}` }}>
                  <span style={{ fontSize: "1.2rem" }}>{entry.emoji}</span>
                  <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{entry.name}</span>
                </div>
                <span style={{ color: GRAY, fontSize: "0.85rem" }}>{entry.date}</span>
              </div>
              
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.3rem", margin: "12px 0", lineHeight: "1.4" }}>
                "{entry.text}"
              </p>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {entry.followUp && (
                  <span style={{ background: "#FFF4E5", color: "#B7791F", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700", border: "1px solid #F6AD55" }}>
                    ↻ Follow-up due
                  </span>
                )}
                {entry.usedInCard && (
                  <span style={{ background: `${SAGE}15`, color: SAGE, padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "700", border: `1px solid ${SAGE}40` }}>
                    ✓ Used in {entry.usedInCard}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar */}
        <div style={{ flex: "0 0 35%" }}>
          <div style={{ background: WHITE, padding: "24px", borderRadius: "12px", border: `1px solid ${BORDER}`, position: "sticky", top: "24px" }}>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", marginBottom: "20px" }}>Upcoming</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              {upcoming.map((u, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: `1px solid ${BORDER}` }}>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>{u.name}</div>
                    <div style={{ fontSize: "0.85rem", color: GRAY }}>{u.event}</div>
                  </div>
                  <div style={{ fontWeight: "700", color: u.days <= 7 ? RED : BLACK }}>{u.days} days</div>
                </div>
              ))}
            </div>
            <button style={{ 
              width: "100%", 
              background: SAGE, 
              color: WHITE, 
              border: "none", 
              padding: "14px", 
              borderRadius: "8px", 
              fontFamily: "'Bebas Neue', cursive", 
              fontSize: "1.1rem", 
              cursor: "pointer",
              letterSpacing: "0.5px"
            }}>
              LOG A MOMENT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
