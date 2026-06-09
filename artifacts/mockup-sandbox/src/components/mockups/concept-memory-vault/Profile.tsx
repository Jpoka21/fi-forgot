import React, { useState } from "react";
import { ArrowLeft, Plus, Send, Heart, Mail, BookOpen, Bell, ChevronDown, ChevronUp } from "lucide-react";

const BG     = "#F2E6D3";
const RED    = "#E23B2E";
const BLACK  = "#111111";
const SAGE   = "#5B8C6B";
const GRAY   = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE  = "#FFFFFF";
const AMBER  = "#D97706";

const DATA_VERSION = "5";

type EntryType = "memory" | "card" | "followup";

interface TimelineEntry {
  id: number;
  type: EntryType;
  date: string;
  title?: string;
  text: string;
  tag?: string;
  tagColor?: string;
  followUpResolved?: boolean;
}

const TIMELINE: TimelineEntry[] = [
  { id: 1, type: "memory",   date: "Today",    text: "Knee surgery went well, resting at home now. Needs meals delivered next week.", tag: "Health", tagColor: "#9333EA" },
  { id: 2, type: "followup", date: "Today",    text: "Ask about her physical therapy schedule",  followUpResolved: false },
  { id: 3, type: "card",     date: "Oct 10",   title: "'Thinking of You' card", text: "Wishing you the smoothest recovery — we'll get through this together, Mom." },
  { id: 4, type: "memory",   date: "Oct 5",    text: "Nervous about the upcoming procedure but trying to stay positive. Keeping herself busy with crosswords.", tag: "Health", tagColor: "#9333EA" },
  { id: 5, type: "followup", date: "Oct 5",    text: "Send flowers before surgery",  followUpResolved: true },
  { id: 6, type: "memory",   date: "Sep 22",   text: "Had a great lunch at the new Italian place downtown. She loved the tiramisu and wants to go back.", tag: "Family", tagColor: AMBER },
  { id: 7, type: "card",     date: "Sep 4",    title: "Birthday card", text: "Happy birthday to the woman who made me who I am. Love you to the moon." },
  { id: 8, type: "memory",   date: "Aug 18",   text: "Mentioned she's been watching a lot of British baking shows and has started trying recipes herself.", tag: "Hobby", tagColor: "#2563EB" },
];

const NODE_CONFIG: Record<EntryType, { bg: string; border: string; icon: React.ReactNode }> = {
  memory:   { bg: `${SAGE}15`,  border: SAGE,  icon: <Heart size={14} fill={SAGE} style={{ color: SAGE }} /> },
  card:     { bg: `${RED}12`,   border: RED,   icon: <Mail size={14} style={{ color: RED }} /> },
  followup: { bg: `${AMBER}15`, border: AMBER, icon: <Bell size={14} style={{ color: AMBER }} /> },
};

export function Profile() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1]));

  const toggle = (id: number) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>

      {/* ── Nav ── */}
      <nav style={{ padding: "1.25rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${BORDER}` }}>
        <button style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.78rem", background: "none", border: "none", cursor: "pointer", color: BLACK }}>
          <ArrowLeft size={16} /> What's New
        </button>
        <button style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.78rem", background: "none", border: "none", cursor: "pointer", opacity: 0.5, color: BLACK }}>
          Edit
        </button>
      </nav>

      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "2rem 2rem 5rem" }}>

        {/* ── Person hero ── */}
        <header style={{ textAlign: "center", marginBottom: "2.25rem" }}>
          <div style={{ width: "6rem", height: "6rem", borderRadius: "999px", background: WHITE, border: `3px solid ${BLACK}`, boxShadow: `4px 4px 0 ${BLACK}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", margin: "0 auto 0.75rem" }}>
            👩‍🦳
          </div>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.4rem", color: SAGE, transform: "rotate(-1.5deg)", marginBottom: "-0.3rem" }}>
            my mom for 34 yearsTogther
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "4.5rem", lineHeight: 0.95, letterSpacing: "0.02em", margin: "0 0 0.75rem" }}>MOM</h1>

          {/* Quick stats */}
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" as const, marginBottom: "1.5rem" }}>
            {["Mother", "8 memories", "4 cards sent", "3 yearsTogther of logs"].map((tag, i) => (
              <span key={i} style={{ padding: "0.25rem 0.75rem", borderRadius: "999px", border: `2px solid ${i === 0 ? BLACK : BORDER}`, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: i === 0 ? BLACK : "transparent", color: i === 0 ? WHITE : GRAY }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem" }}>
            {[
              { icon: <Send size={16} />, label: "Send Card", primary: true },
              { icon: <BookOpen size={16} />, label: "Log Memory", primary: false },
              { icon: <Bell size={16} />, label: "Add Follow-up", primary: false },
            ].map((btn, i) => (
              <button key={i} style={{ padding: "0.85rem", borderRadius: "0.75rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", border: btn.primary ? "none" : `2px solid ${BORDER}`, background: btn.primary ? BLACK : WHITE, color: btn.primary ? WHITE : BLACK }}>
                {btn.icon}
                {btn.label}
              </button>
            ))}
          </div>
        </header>

        {/* ── Timeline label ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.75rem", margin: 0 }}>Memory Timeline</h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            {[
              { color: SAGE, label: "Memory" },
              { color: RED, label: "Card sent" },
              { color: AMBER, label: "Follow-up" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "999px", background: l.color }} />
                <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: GRAY }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Timeline ── */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: "1.2rem", top: "1.5rem", bottom: "0.5rem", width: "2px", background: BORDER }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {TIMELINE.map((entry, i) => {
              const config = NODE_CONFIG[entry.type];
              const isExpanded = expanded.has(entry.id);
              const isCard = entry.type === "card";
              const isFollowup = entry.type === "followup";
              const isMemory = entry.type === "memory";

              return (
                <div key={entry.id} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  {/* Node */}
                  <div style={{ width: "2.4rem", height: "2.4rem", borderRadius: "999px", background: config.bg, border: `2.5px solid ${config.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, marginTop: "0.1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: GRAY }}>{entry.date}</span>
                        {entry.tag && (
                          <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", padding: "0.1rem 0.45rem", borderRadius: "999px", background: `${entry.tagColor}18`, color: entry.tagColor }}>
                            {entry.tag}
                          </span>
                        )}
                        {isFollowup && (
                          <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", padding: "0.1rem 0.45rem", borderRadius: "999px", background: entry.followUpResolved ? `${SAGE}15` : `${AMBER}15`, color: entry.followUpResolved ? SAGE : AMBER }}>
                            {entry.followUpResolved ? "✓ Done" : "Pending"}
                          </span>
                        )}
                      </div>
                      {isMemory && (
                        <button onClick={() => toggle(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", color: GRAY, padding: "0.1rem" }}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                    </div>

                    {isCard && (
                      <div style={{ background: `${RED}07`, border: `1px solid ${RED}20`, borderRadius: "0.65rem", padding: "0.75rem 1rem" }}>
                        <p style={{ fontWeight: 700, fontSize: "0.84rem", marginBottom: "0.35rem" }}>{entry.title}</p>
                        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.35rem", lineHeight: 1.4, color: BLACK }}>"{entry.text}"</p>
                      </div>
                    )}

                    {isFollowup && (
                      <div style={{ background: entry.followUpResolved ? `${SAGE}08` : `${AMBER}08`, border: `1px solid ${entry.followUpResolved ? `${SAGE}20` : `${AMBER}20`}`, borderRadius: "0.65rem", padding: "0.6rem 1rem" }}>
                        <p style={{ fontSize: "0.84rem", color: BLACK, fontWeight: 500, textDecoration: entry.followUpResolved ? "line-through" : "none", opacity: entry.followUpResolved ? 0.5 : 1 }}>
                          {entry.text}
                        </p>
                      </div>
                    )}

                    {isMemory && (
                      <div>
                        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.4rem", lineHeight: 1.45, color: BLACK, overflow: isExpanded ? "visible" : "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical" as const, WebkitLineClamp: isExpanded ? undefined : 2 }}>
                          "{entry.text}"
                        </p>
                        {!isExpanded && (
                          <button onClick={() => toggle(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, color: SAGE, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "0.2rem", padding: 0 }}>
                            Read more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "none" }} data-version={DATA_VERSION} />
      </main>
    </div>
  );
}
