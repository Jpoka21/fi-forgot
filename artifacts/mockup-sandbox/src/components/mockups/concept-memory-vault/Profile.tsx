// DATA_VERSION="5" CONTEXT_VERSION=1
import { useState } from "react";

export function Profile() {
  const [activeTab, setActiveTab] = useState("All");
  const BG="#F2E6D3", RED="#E23B2E", BLACK="#111111", SAGE="#5B8C6B", GRAY="#6B6B6B", BORDER="#E5E0D8", WHITE="#FFFFFF", CREAM="#FDF7EF";

  const timelineItems = [
    {
      type: "Card sent",
      title: "Mother's Day Card 2024",
      content: "You've always known exactly how to make a house feel like home...",
      date: "May 2024",
      icon: "💌",
      isItalic: true
    },
    {
      type: "Memory",
      content: "Knee surgery — recovering well at home",
      date: "May 2025",
      badge: "↻ Follow-up due",
      icon: "🧠"
    },
    {
      type: "Follow-up",
      title: "You mentioned her recovery — How is she feeling now?",
      date: "Today",
      isAmberCard: true,
      icon: "↻"
    },
    {
      type: "Memory",
      content: "Started her garden again after years away",
      date: "March 2025",
      icon: "🧠"
    },
    {
      type: "Card sent",
      title: "Birthday Card 2024",
      date: "January 2024",
      icon: "💌"
    },
    {
      type: "Memory",
      content: "Celebrated 40 years with Dad",
      date: "October 2024",
      icon: "🧠"
    }
  ];

  const filteredItems = timelineItems.filter(item => {
    if (activeTab === "All") return true;
    if (activeTab === "Memories") return item.type === "Memory";
    if (activeTab === "Cards") return item.type === "Card sent";
    if (activeTab === "Follow-ups") return item.type === "Follow-up" || item.badge;
    return true;
  });

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK, paddingBottom: "100px" }}>
      {/* Header */}
      <div style={{ padding: "40px 24px", maxWidth: "800px", margin: "0 auto" }}>
        <button style={{ background: "none", border: "none", color: GRAY, fontSize: "0.9rem", cursor: "pointer", marginBottom: "24px", display: "flex", alignItems: "center", gap: "4px" }}>
          ← Dashboard
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
          <div style={{ width: "68px", height: "68px", background: BLACK, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
            💛
          </div>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.5rem", margin: 0, lineHeight: "1" }}>MOM</h1>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <span style={{ background: BLACK, color: WHITE, padding: "2px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600" }}>Mother</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "24px", borderBottom: `1px solid ${BORDER}`, marginBottom: "32px" }}>
          {["All", "Memories", "Cards", "Follow-ups"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                padding: "12px 4px",
                fontSize: "0.9rem",
                fontWeight: activeTab === tab ? "700" : "500",
                color: activeTab === tab ? BLACK : GRAY,
                borderBottom: activeTab === tab ? `2px solid ${RED}` : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: "relative", paddingLeft: "32px" }}>
          <div style={{ position: "absolute", left: "15px", top: "0", bottom: "0", width: "2px", background: BORDER }}></div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {filteredItems.map((item, i) => (
              <div key={i} style={{ position: "relative" }}>
                {/* Dot */}
                <div style={{ 
                  position: "absolute", 
                  left: "-22px", 
                  top: "4px", 
                  width: "12px", 
                  height: "12px", 
                  borderRadius: "50%", 
                  background: item.isAmberCard ? "#FFB000" : item.type === "Card sent" ? RED : SAGE,
                  border: `3px solid ${BG}`,
                  zIndex: 2
                }}></div>

                {item.isAmberCard ? (
                  <div style={{ background: "#FFF4E5", padding: "20px", borderRadius: "12px", border: "1px solid #F6AD55" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#B7791F", marginBottom: "8px" }}>ACTION REQUIRED</div>
                    <div style={{ fontWeight: "700", fontSize: "1rem", marginBottom: "12px" }}>{item.title}</div>
                    <button style={{ background: "#FFB000", color: BLACK, border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "700", fontSize: "0.85rem", cursor: "pointer" }}>
                      Answer →
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: "700", color: GRAY, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                        {item.type} {item.icon}
                      </span>
                      <span style={{ fontSize: "0.85rem", color: GRAY }}>{item.date}</span>
                    </div>
                    {item.title && <div style={{ fontWeight: "700", fontSize: "1.1rem", marginBottom: "4px" }}>{item.title}</div>}
                    <div style={{ 
                      fontFamily: item.isItalic || item.type === "Memory" ? "'Caveat', cursive" : "inherit",
                      fontSize: item.isItalic || item.type === "Memory" ? "1.2rem" : "1rem",
                      fontStyle: item.isItalic ? "italic" : "normal",
                      color: BLACK,
                      lineHeight: "1.4"
                    }}>
                      {item.content}
                    </div>
                    {item.badge && (
                      <span style={{ display: "inline-block", marginTop: "8px", background: "#FFF4E5", color: "#B7791F", padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "700", border: "1px solid #F6AD55" }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Action Button */}
      <div style={{ position: "fixed", bottom: "0", left: "0", right: "0", padding: "24px", background: `linear-gradient(transparent, ${BG} 40%)`, display: "flex", justifyContent: "center" }}>
        <button style={{ 
          maxWidth: "800px",
          width: "100%", 
          background: SAGE, 
          color: WHITE, 
          border: "none", 
          padding: "16px", 
          borderRadius: "12px", 
          fontFamily: "'Bebas Neue', cursive", 
          fontSize: "1.2rem", 
          cursor: "pointer",
          letterSpacing: "1px",
          boxShadow: "0 4px 12px rgba(91, 140, 107, 0.3)"
        }}>
          LOG A MOMENT
        </button>
      </div>
    </div>
  );
}
