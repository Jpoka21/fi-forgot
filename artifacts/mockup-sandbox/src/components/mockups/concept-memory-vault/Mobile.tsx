import React, { useState } from "react";
import { Plus, Home, Users, Bell, User, Send, BookOpen, ChevronRight, Heart, Mail } from "lucide-react";

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
    id: 1, person: "Mom", avatar: "👩‍🦳", date: "Today",
    text: "Knee surgery went well, resting at home now.",
    tag: "Health", tagColor: "#9333EA",
    followUp: "Ask about PT schedule",
    followUpUrgent: true,
  },
  {
    id: 2, person: "Marcus", avatar: "🧔", date: "Yesterday",
    text: "Got the promotion to Senior Director!",
    tag: "Career", tagColor: SAGE,
    followUp: "Send congratulatory card",
    followUpUrgent: false,
  },
  {
    id: 3, person: "Steve", avatar: "👨", date: "Oct 12",
    text: "Started guitar lessons. Fingers are bleeding but he loves it.",
    tag: "Hobby", tagColor: "#2563EB",
    followUp: null,
    followUpUrgent: false,
  },
  {
    id: 4, person: "Sarah", avatar: "👱‍♀️", date: "Oct 10",
    text: "Kids started soccer — weekends are chaos now.",
    tag: "Family", tagColor: AMBER,
    followUp: "Ask how the season is going",
    followUpUrgent: false,
  },
];

export function Mobile() {
  const [activeTab, setActiveTab] = useState(0);
  const followUpCount = FEED.filter(f => f.followUp).length;

  return (
    <div style={{
      width: "390px", height: "844px",
      background: BG,
      fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK,
      borderRadius: "3rem", overflow: "hidden", border: `8px solid ${BLACK}`,
      boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>

      {/* Status bar */}
      <div style={{ height: "3rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", fontSize: "0.75rem", fontWeight: 600, flexShrink: 0 }}>
        <span>9:41</span>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <div style={{ width: "16px", height: "11px", background: BLACK, borderRadius: "2px" }} />
          <div style={{ width: "11px", height: "11px", background: BLACK, borderRadius: "50%" }} />
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "0 1.5rem 0.85rem", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: SAGE, transform: "rotate(-2deg)", marginBottom: "-0.3rem" }}>
              what's going on…
            </p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.75rem", lineHeight: 1, letterSpacing: "0.02em", margin: 0 }}>
              WHAT'S NEW
            </h1>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ width: "2.6rem", height: "2.6rem", borderRadius: "999px", background: WHITE, border: `2px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bell size={16} />
            </div>
            {followUpCount > 0 && (
              <div style={{ position: "absolute", top: "-3px", right: "-3px", width: "1.1rem", height: "1.1rem", borderRadius: "999px", background: RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "0.55rem", fontWeight: 700, color: WHITE }}>{followUpCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Urgent banner */}
        <div style={{ marginTop: "0.75rem", background: `${RED}10`, border: `1px solid ${RED}25`, borderRadius: "0.6rem", padding: "0.55rem 0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Bell size={12} style={{ color: RED, flexShrink: 0 }} />
          <p style={{ fontSize: "0.74rem", fontWeight: 700, color: RED, flex: 1 }}>
            Follow up with Mom today — PT schedule
          </p>
          <ChevronRight size={12} style={{ color: RED, flexShrink: 0 }} />
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0.25rem 1.25rem 7rem" }}>
        {FEED.map((item, i) => (
          <div key={item.id} style={{ marginBottom: "1rem" }}>
            {/* Memory card */}
            <div style={{ background: WHITE, borderRadius: "1rem", border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              {/* Card header */}
              <div style={{ padding: "0.7rem 1rem 0.6rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>{item.avatar}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{item.person}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", background: `${item.tagColor}18`, color: item.tagColor }}>
                    {item.tag}
                  </span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 600, color: GRAY }}>{item.date}</span>
                </div>
              </div>

              {/* Memory text */}
              <div style={{ padding: "0.8rem 1rem" }}>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.4rem", lineHeight: 1.4, color: BLACK, margin: 0 }}>
                  "{item.text}"
                </p>
              </div>

              {/* Follow-up */}
              {item.followUp && (
                <div style={{ margin: "0 0.85rem 0.75rem", padding: "0.5rem 0.75rem", background: item.followUpUrgent ? `${RED}08` : BG, borderRadius: "0.5rem", border: `1px solid ${item.followUpUrgent ? `${RED}20` : BORDER}`, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Bell size={11} style={{ color: item.followUpUrgent ? RED : AMBER, flexShrink: 0 }} />
                  <p style={{ fontSize: "0.74rem", color: BLACK, fontWeight: 500, flex: 1 }}>{item.followUp}</p>
                  <ChevronRight size={11} style={{ color: GRAY, flexShrink: 0 }} />
                </div>
              )}

              {/* Actions */}
              <div style={{ padding: "0.55rem 1rem", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "0.5rem" }}>
                <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <BookOpen size={11} /> Add
                </button>
                <div style={{ width: "1px", background: BORDER }} />
                <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <Send size={11} /> Card
                </button>
                <div style={{ width: "1px", background: BORDER }} />
                <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", background: "none", border: "none", cursor: "pointer", fontSize: "0.68rem", fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <User size={11} /> Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div style={{ position: "absolute", bottom: "6rem", right: "1.25rem", zIndex: 20 }}>
        <button style={{ width: "3.75rem", height: "3.75rem", borderRadius: "999px", background: RED, color: WHITE, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(226,59,46,0.45)" }}>
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      {/* Bottom nav */}
      <nav style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: WHITE, borderTop: `2px solid ${BORDER}`, display: "flex", justifyContent: "space-around", padding: "0.75rem 0 1.25rem", zIndex: 10 }}>
        {[
          { icon: <Home size={22} />, label: "Feed",   active: true  },
          { icon: <Users size={22} />, label: "People", active: false },
          { icon: <Bell size={22} />, label: "Alerts", active: false },
          { icon: <User size={22} />, label: "Me",     active: false },
        ].map(item => (
          <button key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem", background: "none", border: "none", cursor: "pointer", opacity: item.active ? 1 : 0.35, color: item.active ? BLACK : GRAY }}>
            {item.icon}
            <span style={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ display: "none" }} data-version={DATA_VERSION} />
    </div>
  );
}
