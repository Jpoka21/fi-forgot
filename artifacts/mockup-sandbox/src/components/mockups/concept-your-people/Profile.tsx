import React, { useState } from "react";
import { ArrowLeft, Send, BookOpen, HelpCircle, Plus, Clock, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";

const BRAND = {
  BG: "#F2E6D3",
  RED: "#E23B2E",
  BLACK: "#111111",
  SAGE: "#5B8C6B",
  GRAY: "#6B6B6B",
  BORDER: "#E5E0D8",
  WHITE: "#FFFFFF",
};

const DATA_VERSION = "5";

const CARDS_SENT = [
  { id: 1, occasion: "Birthday 2024", date: "Mar 12, 2024", emoji: "🎂", note: "Hope this year brings you as much joy as you give to others!", status: "Delivered" },
  { id: 2, occasion: "Just Because", date: "Oct 4, 2023", emoji: "🍺", note: "Thinking of you and that time we got lost in Kyoto. Miss you!", status: "Delivered" },
  { id: 3, occasion: "Holiday", date: "Dec 20, 2022", emoji: "🎄", note: "Wishing you all the cozy things this season.", status: "Delivered" },
];

const UPCOMING = [
  { id: 1, event: "Birthday", date: "Mar 10", daysUntil: 12, urgent: true },
  { id: 2, event: "Friendiversary", date: "Jul 4", daysUntil: 145, urgent: false },
];

const HEALTH_DIMS = [
  { label: "Recency", score: 80, note: "Last card 6 months ago", color: BRAND.SAGE },
  { label: "Consistency", score: 92, note: "3 cards this year", color: BRAND.SAGE },
  { label: "Effort", score: 40, note: "Auto-generated only", color: BRAND.RED },
];

export function Profile() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const overallHealth = Math.round(HEALTH_DIMS.reduce((s, d) => s + d.score, 0) / HEALTH_DIMS.length);

  return (
    <div style={{ backgroundColor: BRAND.BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BRAND.BLACK }}>
      {/* Nav */}
      <nav style={{ padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.8rem", background: "none", border: "none", cursor: "pointer" }}>
          <ArrowLeft size={17} /> Your People
        </button>
        <button style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.8rem", background: "none", border: "none", cursor: "pointer", opacity: 0.6 }}>Edit</button>
      </nav>

      <main style={{ maxWidth: "820px", margin: "0 auto", padding: "0 2rem 5rem" }}>
        {/* Person Header */}
        <header style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ width: "7rem", height: "7rem", borderRadius: "999px", backgroundColor: BRAND.WHITE, border: `3px solid ${BRAND.BLACK}`, boxShadow: `4px 4px 0 ${BRAND.BLACK}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3.5rem", marginBottom: "1rem" }}>
            👱‍♀️
          </div>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.4rem", color: BRAND.SAGE, transform: "rotate(-1.5deg)", marginBottom: "-0.2rem" }}>
            my little sister for 28 years
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "5rem", lineHeight: 0.9, letterSpacing: "0.02em" }}>SARAH</h1>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            {["Sister", "Austin, TX", "Adventurous", "Creative"].map(tag => (
              <span key={tag} style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", border: `2px solid ${BRAND.BLACK}`, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "2.5rem" }}>
          <button style={{ backgroundColor: BRAND.BLACK, color: BRAND.BG, padding: "1rem", borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.85rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", border: "none", cursor: "pointer" }}>
            <Send size={20} />
            Send Card
          </button>
          <button style={{ backgroundColor: BRAND.WHITE, color: BRAND.BLACK, padding: "1rem", borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.85rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", border: `2px solid ${BRAND.BORDER}`, cursor: "pointer" }}>
            <BookOpen size={20} />
            Log Moment
          </button>
          <button style={{ backgroundColor: BRAND.WHITE, color: BRAND.BLACK, padding: "1rem", borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.85rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", border: `2px solid ${BRAND.BORDER}`, cursor: "pointer" }}>
            <HelpCircle size={20} />
            Ask Question
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "1.5rem" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Health Score */}
            <div style={{ backgroundColor: BRAND.WHITE, borderRadius: "1.25rem", border: `2px solid ${BRAND.BORDER}`, padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.75rem" }}>Relationship Health</h2>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.25rem", lineHeight: 1, color: overallHealth >= 70 ? BRAND.SAGE : BRAND.RED }}>{overallHealth}</p>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: BRAND.GRAY }}>/100</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {HEALTH_DIMS.map(dim => (
                  <div key={dim.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: BRAND.GRAY }}>{dim.label}</span>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: dim.color }}>{dim.score}%</span>
                    </div>
                    <div style={{ height: "6px", borderRadius: "999px", backgroundColor: BRAND.BG, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${dim.score}%`, borderRadius: "999px", backgroundColor: dim.color, transition: "width 0.5s" }} />
                    </div>
                    <p style={{ fontSize: "0.65rem", color: BRAND.GRAY, marginTop: "0.2rem" }}>{dim.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Up */}
            <div style={{ backgroundColor: BRAND.WHITE, borderRadius: "1.25rem", border: `2px solid ${BRAND.BORDER}`, padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.75rem" }}>Upcoming</h2>
                <button style={{ background: "none", border: `2px solid ${BRAND.BLACK}`, borderRadius: "999px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Plus size={14} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {UPCOMING.map(item => (
                  <div key={item.id} style={{ padding: "0.85rem", borderRadius: "0.75rem", border: `2px solid ${item.urgent ? BRAND.RED : BRAND.BORDER}`, backgroundColor: item.urgent ? `${BRAND.RED}08` : "transparent" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{item.event}</p>
                      {item.urgent && <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", padding: "0.15rem 0.5rem", borderRadius: "999px", backgroundColor: BRAND.RED, color: "#fff" }}>Soon</span>}
                    </div>
                    <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", marginTop: "0.15rem", color: item.urgent ? BRAND.RED : BRAND.BLACK }}>{item.date}</p>
                    <p style={{ fontSize: "0.7rem", color: BRAND.GRAY, fontWeight: 600 }}>In {item.daysUntil} days</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — Card History */}
          <div style={{ backgroundColor: BRAND.WHITE, borderRadius: "1.25rem", border: `2px solid ${BRAND.BORDER}`, padding: "1.5rem" }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.75rem", marginBottom: "1.25rem" }}>Card History</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {CARDS_SENT.map((card, i) => (
                <div key={card.id}>
                  <div
                    style={{ display: "flex", gap: "1rem", alignItems: "flex-start", cursor: "pointer" }}
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <div style={{ width: "3.25rem", height: "4.5rem", borderRadius: "0.5rem", backgroundColor: BRAND.BG, border: `1px solid ${BRAND.BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                      {card.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{card.occasion}</h3>
                        {expanded === i ? <ChevronUp size={16} style={{ flexShrink: 0, opacity: 0.4 }} /> : <ChevronDown size={16} style={{ flexShrink: 0, opacity: 0.4 }} />}
                      </div>
                      <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: BRAND.GRAY, marginTop: "0.2rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Clock size={12} /> {card.date}
                      </p>
                      {expanded === i && (
                        <div style={{ marginTop: "0.6rem", padding: "0.75rem", borderRadius: "0.5rem", backgroundColor: BRAND.BG, border: `1px solid ${BRAND.BORDER}` }}>
                          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.25rem", lineHeight: 1.4, color: BRAND.BLACK }}>
                            "{card.note}"
                          </p>
                          <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", padding: "0.15rem 0.5rem", borderRadius: "999px", backgroundColor: `${BRAND.SAGE}20`, color: BRAND.SAGE, marginTop: "0.5rem", display: "inline-block" }}>{card.status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {i < CARDS_SENT.length - 1 && <div style={{ height: "1px", backgroundColor: BRAND.BORDER, margin: "1.1rem 0 0" }} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden" data-version={DATA_VERSION} />
      </main>
    </div>
  );
}
