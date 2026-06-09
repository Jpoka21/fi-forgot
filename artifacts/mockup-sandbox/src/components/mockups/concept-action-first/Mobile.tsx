import React, { useState } from "react";
import { Send, SkipForward, CheckCircle2, ChevronRight, Bell, Sparkles } from "lucide-react";

const BG     = "#F2E6D3";
const RED    = "#E23B2E";
const BLACK  = "#111111";
const SAGE   = "#5B8C6B";
const GRAY   = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE  = "#FFFFFF";
const AMBER  = "#D97706";

const DATA_VERSION = "5";

const ACTIONS = [
  {
    id: 1, person: "Marcus",  avatar: "🧔",   relation: "Best Friend",
    action: "Send Birthday Card",
    context: "His 32nd is in 7 days. Send today so it arrives in time.",
    daysLeft: 7, urgency: "high" as const,
  },
  {
    id: 2, person: "Mom",     avatar: "👩‍🦳", relation: "Mother",
    action: "Check in after surgery",
    context: "Her knee surgery was 2 days ago. A card would mean the world.",
    daysLeft: 1, urgency: "high" as const,
  },
  {
    id: 3, person: "Sarah",   avatar: "👱‍♀️", relation: "Sister",
    action: "Congrats on new job",
    context: "She started at the new company last Monday. Acknowledge it!",
    daysLeft: 8, urgency: "medium" as const,
  },
];

function HealthRing({ score }: { score: number }) {
  const r    = 22;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const col  = score >= 70 ? SAGE : score >= 50 ? AMBER : RED;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke={`${WHITE}30`} strokeWidth="4.5" />
      <circle cx="26" cy="26" r={r} fill="none" stroke={WHITE} strokeWidth="4.5"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 26 26)" />
      <text x="26" y="26" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: "11px", fontWeight: 700, fill: WHITE, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {score}
      </text>
    </svg>
  );
}

export function Mobile() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [done, setDone]                 = useState(false);

  const current    = ACTIONS[currentIndex];
  const isLast     = currentIndex === ACTIONS.length - 1;
  const remaining  = ACTIONS.length - currentIndex;

  const advance = () => {
    if (isLast) setDone(true);
    else setCurrentIndex(i => i + 1);
  };

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
      <div style={{ padding: "0 1.5rem 1rem", flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.75rem", lineHeight: 1, letterSpacing: "0.02em", margin: 0 }}>
          F*I FORGOT
        </h1>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: SAGE, margin: "0.1rem 0 0" }}>
          We got your important people.
        </p>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 1.25rem 1.25rem", gap: "0.75rem" }}>

        {!done ? (
          <>
            {/* Queue progress */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", color: RED }}>
                NEXT ACTION
              </span>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: GRAY }}>
                {currentIndex + 1} of {ACTIONS.length}
              </span>
            </div>

            {/* Progress dots */}
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {ACTIONS.map((_, i) => (
                <div key={i} style={{ flex: 1, height: "3px", borderRadius: "999px", background: i <= currentIndex ? RED : BORDER }} />
              ))}
            </div>

            {/* Hero action card */}
            <div style={{ flex: 1, background: BLACK, borderRadius: "1.25rem", padding: "1.5rem", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

              {/* Urgency badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <span style={{ display: "inline-block", background: current.urgency === "high" ? RED : AMBER, color: WHITE, fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0.25rem 0.6rem", borderRadius: "999px" }}>
                  {current.daysLeft === 1 ? "Due tomorrow" : `${current.daysLeft} days left`}
                </span>
                <HealthRing score={45} />
              </div>

              {/* Person */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginBottom: "1rem" }}>
                <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "999px", background: `${WHITE}15`, border: `2px solid ${WHITE}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", flexShrink: 0 }}>
                  {current.avatar}
                </div>
                <div>
                  <p style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: `${WHITE}60`, marginBottom: "0.1rem" }}>{current.relation}</p>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", lineHeight: 0.95, color: WHITE, margin: 0 }}>{current.person}</h2>
                </div>
              </div>

              {/* Action */}
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: WHITE, lineHeight: 1.15, marginBottom: "0.6rem", letterSpacing: "0.02em" }}>
                {current.action}
              </p>

              {/* Context */}
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem", color: `${WHITE}75`, lineHeight: 1.4, flex: 1 }}>
                {current.context}
              </p>
            </div>

            {/* Action buttons */}
            <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", background: RED, color: WHITE, border: "none", borderRadius: "0.875rem", padding: "1rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.35rem", letterSpacing: "0.06em", cursor: "pointer", boxShadow: `0 4px 20px ${RED}45` }}
              onClick={advance}>
              <Sparkles size={18} />
              Generate Card Now
            </button>

            <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "none", border: `2px solid ${BORDER}`, borderRadius: "0.875rem", padding: "0.8rem", fontWeight: 700, fontSize: "0.82rem", color: GRAY, cursor: "pointer" }}
              onClick={advance}>
              <SkipForward size={15} />
              Skip for now
            </button>
          </>
        ) : (
          /* All done */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" as const }}>
            <div style={{ width: "5rem", height: "5rem", borderRadius: "999px", background: `${SAGE}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <CheckCircle2 size={40} style={{ color: SAGE }} />
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3rem", letterSpacing: "0.03em", marginBottom: "0.5rem" }}>
              Queue Empty!
            </h2>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.4rem", color: GRAY, marginBottom: "2rem", lineHeight: 1.4 }}>
              You're an amazing friend today. All done.
            </p>
            <button onClick={() => { setCurrentIndex(0); setDone(false); }} style={{ background: BLACK, color: WHITE, border: "none", borderRadius: "999px", padding: "0.75rem 1.75rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.05em", cursor: "pointer" }}>
              Reset Demo
            </button>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav style={{ flexShrink: 0, background: WHITE, borderTop: `2px solid ${BORDER}`, display: "flex", justifyContent: "space-around", padding: "0.75rem 0 1.25rem" }}>
        {[
          { icon: "⚡", label: "Actions", active: true  },
          { icon: "👥", label: "People",  active: false },
          { icon: "🔔", label: "Alerts",  active: false },
          { icon: "👤", label: "Me",      active: false },
        ].map(item => (
          <button key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem", background: "none", border: "none", cursor: "pointer", opacity: item.active ? 1 : 0.35 }}>
            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
            <span style={{ fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: BLACK }}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ display: "none" }} data-version={DATA_VERSION} />
    </div>
  );
}
