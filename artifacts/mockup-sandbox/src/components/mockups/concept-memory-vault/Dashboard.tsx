import React, { useState } from "react";
import { Plus, BookOpen, Bell, MessageSquare, Send, ChevronRight, Sparkles } from "lucide-react";

const BG     = "#F2E6D3";
const RED    = "#E23B2E";
const BLACK  = "#111111";
const SAGE   = "#5B8C6B";
const GRAY   = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE  = "#FFFFFF";
const AMBER  = "#D97706";

const DATA_VERSION = "5";

const FEED = [
  {
    id: 1, person: "Mom", avatar: "👩‍🦳", relation: "Mother", date: "Today",
    text: "Knee surgery went well, resting at home now. Needs meals delivered next week.",
    type: "health",
    followUp: "Ask about her physical therapy schedule",
    followUpDue: "Tomorrow",
    urgentFollowUp: true,
  },
  {
    id: 2, person: "Marcus", avatar: "🧔", relation: "Best Friend", date: "Yesterday",
    text: "Got the promotion to Senior Director! Finally happened after 2 years of waiting.",
    type: "career",
    followUp: "Send a congratulatory card — he'd love the recognition",
    followUpDue: "This week",
    urgentFollowUp: false,
  },
  {
    id: 3, person: "Steve", avatar: "👨", relation: "Friend", date: "Oct 12",
    text: "Started guitar lessons. Fingers are bleeding but he's completely obsessed.",
    type: "hobby",
    followUp: null,
    followUpDue: null,
    urgentFollowUp: false,
  },
  {
    id: 4, person: "Sarah", avatar: "👱‍♀️", relation: "Sister", date: "Oct 10",
    text: "Kids started soccer — both of them. Weekends are completely chaotic now.",
    type: "family",
    followUp: "Ask how the season is going",
    followUpDue: "Next week",
    urgentFollowUp: false,
  },
  {
    id: 5, person: "Jessica", avatar: "👩‍💼", relation: "Colleague", date: "Sep 29",
    text: "Finally closed the big deal she's been working on for 6 months. She was ecstatic.",
    type: "career",
    followUp: null,
    followUpDue: null,
    urgentFollowUp: false,
  },
];

const TYPE_COLORS: Record<string, string> = {
  health:  "#9333EA",
  career:  SAGE,
  hobby:   "#2563EB",
  family:  AMBER,
};

const TYPE_LABELS: Record<string, string> = {
  health: "Health", career: "Career", hobby: "Hobby", family: "Family",
};

const STATS = [
  { label: "Memories this month", value: "11", icon: "📝" },
  { label: "People updated",      value: "4",  icon: "👥" },
  { label: "Follow-ups due",      value: "3",  icon: "🔔" },
  { label: "Cards sent",          value: "2",  icon: "💌" },
];

export function Dashboard() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>

      {/* ── Header ── */}
      <header style={{ padding: "2.5rem 3rem 2rem", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.5rem", color: SAGE, transform: "rotate(-2deg)", marginBottom: "-0.4rem", display: "block" }}>
            keeping up with…
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "4.5rem", lineHeight: 1, letterSpacing: "0.02em", margin: 0 }}>
            WHAT'S NEW
          </h1>
          <p style={{ fontSize: "0.9rem", color: GRAY, marginTop: "0.4rem", fontWeight: 600 }}>
            Recent life moments from your people.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.5rem", borderRadius: "999px", background: WHITE, border: `2px solid ${BORDER}`, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", color: BLACK }}>
            <Bell size={16} />
            3 follow-ups
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.8rem 1.75rem", borderRadius: "999px", background: BLACK, color: BG, fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "0.05em", cursor: "pointer", border: "none" }}>
            <Plus size={18} strokeWidth={3} />
            Log Memory
          </button>
        </div>
      </header>

      {/* ── Stats strip ── */}
      <div style={{ background: BLACK, padding: "0.9rem 3rem", display: "flex", gap: "2.5rem", alignItems: "center" }}>
        {STATS.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1rem" }}>{s.icon}</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", color: WHITE, lineHeight: 1 }}>{s.value}</span>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: `${WHITE}60` }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Main ── */}
      <main style={{ maxWidth: "780px", margin: "0 auto", padding: "2.5rem 2rem 5rem" }}>

        {/* Urgent follow-up banner */}
        <div style={{ background: `${RED}10`, border: `2px solid ${RED}30`, borderRadius: "1rem", padding: "1rem 1.25rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "999px", background: `${RED}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bell size={18} style={{ color: RED }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: "0.88rem", color: RED, marginBottom: "0.1rem" }}>Urgent follow-up — Mom</p>
            <p style={{ fontSize: "0.8rem", color: GRAY }}>Ask about her physical therapy schedule → due tomorrow</p>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: RED, color: WHITE, border: "none", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", whiteSpace: "nowrap" as const }}>
            Send Card <ChevronRight size={13} />
          </button>
        </div>

        {/* Memory feed */}
        <div style={{ position: "relative" }}>
          {/* Vertical timeline line */}
          <div style={{ position: "absolute", left: "1.35rem", top: "2.5rem", bottom: "2rem", width: "2px", background: BORDER }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {FEED.map((item, i) => (
              <div key={item.id} style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                {/* Timeline node */}
                <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "999px", background: WHITE, border: `3px solid ${TYPE_COLORS[item.type] ?? SAGE}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0, zIndex: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  {item.avatar}
                </div>

                {/* Card */}
                <div style={{ flex: 1, background: WHITE, borderRadius: "1rem", border: `1px solid ${BORDER}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
                  {/* Card header */}
                  <div style={{ padding: "0.9rem 1.25rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem" }}>{item.person}</span>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: GRAY, opacity: 0.7 }}>{item.relation}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ padding: "0.2rem 0.65rem", borderRadius: "999px", fontSize: "0.64rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: `${TYPE_COLORS[item.type]}18`, color: TYPE_COLORS[item.type] }}>
                        {TYPE_LABELS[item.type]}
                      </span>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: GRAY }}>{item.date}</span>
                    </div>
                  </div>

                  {/* Memory text */}
                  <div style={{ padding: "1rem 1.25rem" }}>
                    <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.5rem", lineHeight: 1.45, color: BLACK, margin: 0 }}>
                      "{item.text}"
                    </p>
                  </div>

                  {/* Follow-up */}
                  {item.followUp && (
                    <div style={{ margin: "0 1.25rem 1rem", padding: "0.75rem 1rem", background: item.urgentFollowUp ? `${RED}08` : BG, borderRadius: "0.6rem", border: `1px solid ${item.urgentFollowUp ? `${RED}25` : BORDER}`, display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                      <div style={{ width: "1.6rem", height: "1.6rem", borderRadius: "999px", background: item.urgentFollowUp ? `${RED}15` : `${SAGE}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Bell size={12} style={{ color: item.urgentFollowUp ? RED : SAGE }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: item.urgentFollowUp ? RED : SAGE, marginBottom: "0.15rem" }}>
                          Follow-up · {item.followUpDue}
                        </p>
                        <p style={{ fontSize: "0.82rem", color: BLACK, fontWeight: 500 }}>{item.followUp}</p>
                      </div>
                      <button style={{ background: "none", border: "none", cursor: "pointer", padding: "0.2rem" }}>
                        <Send size={13} style={{ color: GRAY }} />
                      </button>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div style={{ padding: "0.65rem 1.25rem", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "0.75rem" }}>
                    <button style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <BookOpen size={12} /> Add detail
                    </button>
                    <button style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <Send size={12} /> Send card
                    </button>
                    <button style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: "0.05em", marginLeft: "auto" }}>
                      <MessageSquare size={12} /> {item.person}'s profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load more */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "2.5rem" }}>
          <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: `2px solid ${BORDER}`, borderRadius: "999px", padding: "0.75rem 1.75rem", fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em", color: GRAY, cursor: "pointer" }}>
            Load older memories <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: "none" }} data-version={DATA_VERSION} />
      </main>
    </div>
  );
}
