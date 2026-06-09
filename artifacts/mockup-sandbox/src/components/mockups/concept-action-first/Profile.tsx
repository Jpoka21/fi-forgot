import React, { useState } from "react";
import { ArrowLeft, Send, Clock, CheckCircle2, PenLine, StickyNote, ChevronDown, ChevronUp, Zap } from "lucide-react";

const BG     = "#F2E6D3";
const RED    = "#E23B2E";
const BLACK  = "#111111";
const SAGE   = "#5B8C6B";
const GRAY   = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE  = "#FFFFFF";
const AMBER  = "#D97706";

const DATA_VERSION = "5";

const PENDING_ACTIONS = [
  {
    id: 1, label: "Send Birthday Card",
    description: "His 32nd is in 7 days — needs to be sent today to arrive in time.",
    urgency: "high" as const, dueLabel: "Due today",
  },
  {
    id: 2, label: "Log recent update",
    description: "You mentioned Marcus got promoted 3 weeks ago. Add that memory before it fades.",
    urgency: "medium" as const, dueLabel: "This week",
  },
];

const CONTEXT = [
  {
    id: 1, type: "card", date: "Aug 5, 2024",
    label: "Promotion congrats card",
    note: "So proud of you for landing the Senior Director role. Drinks on me next time, seriously.",
  },
  {
    id: 2, type: "memory", date: "Jul 12, 2024",
    label: "Pour-over coffee obsession",
    note: "He's totally into pour-over coffee now. Might be a perfect gift idea.",
  },
  {
    id: 3, type: "card", date: "Oct 12, 2023",
    label: "31st Birthday card",
    note: "Happy birthday buddy. Another lap around the sun — here's to 31 being your best one yet.",
  },
  {
    id: 4, type: "memory", date: "Jun 1, 2023",
    label: "New apartment",
    note: "Moved to Bushwick. Really loves the neighborhood, close to Prospect Park.",
  },
];

function HealthRing({ score }: { score: number }) {
  const r    = 28;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const col  = score >= 70 ? SAGE : score >= 50 ? AMBER : RED;
  return (
    <svg width="68" height="68" viewBox="0 0 68 68">
      <circle cx="34" cy="34" r={r} fill="none" stroke={`${BLACK}10`} strokeWidth="6" />
      <circle cx="34" cy="34" r={r} fill="none" stroke={col} strokeWidth="6"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 34 34)" />
      <text x="34" y="34" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: "13px", fontWeight: 700, fill: col, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {score}
      </text>
    </svg>
  );
}

export function Profile() {
  const [expanded, setExpanded] = useState<number | null>(1);
  const [actionDone, setActionDone] = useState<Set<number>>(new Set());

  const markDone = (id: number) => {
    const next = new Set(actionDone);
    next.add(id);
    setActionDone(next);
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>

      {/* ── Nav ── */}
      <nav style={{ padding: "1.25rem 2.5rem", display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: `1px solid ${BORDER}` }}>
        <button style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.78rem", background: "none", border: "none", cursor: "pointer", color: BLACK }}>
          <ArrowLeft size={16} /> Action Queue
        </button>
      </nav>

      <main style={{ maxWidth: "820px", margin: "0 auto", padding: "2rem 2rem 5rem" }}>

        {/* ── Person header ── */}
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ width: "5.5rem", height: "5.5rem", borderRadius: "999px", background: WHITE, border: `3px solid ${BLACK}`, boxShadow: `4px 4px 0 ${BLACK}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.75rem", flexShrink: 0 }}>
              🧔
            </div>
            <div>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.3rem", color: SAGE, marginBottom: "-0.3rem" }}>best friend for 8 years</p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "4rem", lineHeight: 0.95, letterSpacing: "0.02em", margin: "0 0 0.5rem" }}>
                MARCUS
              </h1>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.4rem" }}>
                {["Best Friend", "New York, NY", "Coffee nerd", "Newly promoted"].map((t, i) => (
                  <span key={i} style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", border: `2px solid ${i === 0 ? BLACK : BORDER}`, fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", background: i === 0 ? BLACK : "transparent", color: i === 0 ? WHITE : GRAY }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <HealthRing score={45} />
            <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: GRAY, display: "block", marginTop: "0.2rem" }}>Health</span>
          </div>
        </header>

        {/* ── Pending actions ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Zap size={16} fill={RED} style={{ color: RED }} />
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.06em", color: RED, margin: 0 }}>
            PENDING ACTIONS
          </h2>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: GRAY }}>
            · {PENDING_ACTIONS.filter(a => !actionDone.has(a.id)).length} remaining
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
          {PENDING_ACTIONS.map(action => {
            const isDone = actionDone.has(action.id);
            return (
              <div key={action.id} style={{ background: WHITE, borderRadius: "1rem", border: `2px solid ${isDone ? `${SAGE}30` : action.urgency === "high" ? `${RED}35` : BORDER}`, padding: "1.25rem 1.5rem", opacity: isDone ? 0.5 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.1rem" }}>{action.label}</p>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "0.15rem 0.5rem", borderRadius: "999px", background: action.urgency === "high" ? `${RED}12` : `${AMBER}12`, color: action.urgency === "high" ? RED : AMBER }}>
                      {action.dueLabel}
                    </span>
                  </div>
                  {isDone ? (
                    <CheckCircle2 size={20} style={{ color: SAGE, flexShrink: 0 }} />
                  ) : (
                    <button onClick={() => markDone(action.id)} style={{ width: "1.5rem", height: "1.5rem", borderRadius: "999px", border: `2px solid ${BORDER}`, background: "none", cursor: "pointer", flexShrink: 0 }} />
                  )}
                </div>
                <p style={{ fontSize: "0.82rem", color: GRAY, lineHeight: 1.5, marginBottom: isDone ? 0 : "1rem" }}>{action.description}</p>
                {!isDone && (
                  <div style={{ display: "flex", gap: "0.6rem" }}>
                    <button onClick={() => markDone(action.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", background: action.urgency === "high" ? RED : BLACK, color: WHITE, border: "none", borderRadius: "0.625rem", padding: "0.75rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.05em", cursor: "pointer" }}>
                      <Send size={16} />
                      {action.id === 1 ? "Generate Card Now" : "Add Memory"}
                    </button>
                    <button style={{ padding: "0.75rem 1rem", background: "none", border: `2px solid ${BORDER}`, borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.78rem", color: GRAY, cursor: "pointer", whiteSpace: "nowrap" as const }}>
                      Skip
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Context ── */}
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.06em", marginBottom: "1rem" }}>
          RECENT CONTEXT
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {CONTEXT.map((c, i) => (
            <div key={c.id} style={{ background: WHITE, borderRadius: "0.875rem", border: `1px solid ${BORDER}`, overflow: "hidden" }}>
              <div
                style={{ padding: "0.9rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <div style={{ width: "2rem", height: "2rem", borderRadius: "999px", background: c.type === "card" ? `${RED}12` : `${SAGE}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {c.type === "card" ? <Send size={12} style={{ color: RED }} /> : <StickyNote size={12} style={{ color: SAGE }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.88rem" }}>{c.label}</p>
                  <p style={{ fontSize: "0.67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: GRAY, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Clock size={10} /> {c.date}
                  </p>
                </div>
                {expanded === c.id ? <ChevronUp size={14} style={{ color: GRAY, flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: GRAY, flexShrink: 0 }} />}
              </div>
              {expanded === c.id && (
                <div style={{ padding: "0 1.25rem 1rem" }}>
                  <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.35rem", lineHeight: 1.45, color: BLACK, padding: "0.75rem", background: BG, borderRadius: "0.5rem", border: `1px solid ${BORDER}` }}>
                    "{c.note}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "none" }} data-version={DATA_VERSION} />
      </main>
    </div>
  );
}
