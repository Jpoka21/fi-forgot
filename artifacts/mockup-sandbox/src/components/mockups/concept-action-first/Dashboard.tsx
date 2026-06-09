import React, { useState } from "react";
import { Send, SkipForward, ChevronRight, Zap, CheckCircle2 } from "lucide-react";

const BG     = "#F2E6D3";
const RED    = "#E23B2E";
const BLACK  = "#111111";
const SAGE   = "#5B8C6B";
const GRAY   = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE  = "#FFFFFF";
const AMBER  = "#D97706";

const DATA_VERSION = "5";

const HERO = {
  person: "Marcus",
  avatar: "🧔",
  relation: "Best Friend",
  event: "32nd Birthday",
  date: "Nov 2",
  daysAway: 7,
  urgency: "high" as const,
  reason: "His birthday is in one week — send a card now so it arrives in time.",
  healthScore: 45,
};

const QUEUE = [
  { id: 1, person: "Mom",     avatar: "👩‍🦳", event: "Check-in after surgery", daysAway: 1,  color: RED,    urgency: "high" as const },
  { id: 2, person: "Sarah",   avatar: "👱‍♀️", event: "New job congrats card",  daysAway: 8,  color: SAGE,   urgency: "medium" as const },
  { id: 3, person: "Steve",   avatar: "👨",   event: "Anniversary — Oct 15",   daysAway: 6,  color: AMBER,  urgency: "medium" as const },
  { id: 4, person: "Jessica", avatar: "👩‍💼", event: "Work anniversary",       daysAway: 53, color: GRAY,   urgency: "low" as const },
];

const STATS = [
  { label: "Actions done this month", value: "9",  icon: <CheckCircle2 size={14} style={{ color: SAGE }} /> },
  { label: "Relationships healthy",   value: "4",  icon: <span style={{ fontSize: "0.9rem" }}>💚</span> },
  { label: "Cards sent",              value: "6",  icon: <span style={{ fontSize: "0.9rem" }}>💌</span> },
];

function HealthRing({ score }: { score: number }) {
  const r    = 30;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const col  = score >= 70 ? SAGE : score >= 50 ? AMBER : RED;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke={`${BLACK}12`} strokeWidth="6" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={col} strokeWidth="6"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 36 36)" />
      <text x="36" y="36" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: "14px", fontWeight: 700, fill: col, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {score}
      </text>
    </svg>
  );
}

export function Dashboard() {
  const [done, setDone] = useState(false);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK }}>

      {/* ── Header ── */}
      <header style={{ padding: "2rem 3rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "4rem", lineHeight: 1, letterSpacing: "0.02em", margin: 0 }}>
            F*I FORGOT
          </h1>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.3rem", color: SAGE, margin: "0.2rem 0 0" }}>
            We got your important people.
          </p>
        </div>
        {/* Health ring ambient indicator */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
          <HealthRing score={72} />
          <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: GRAY }}>Relationship health</span>
        </div>
      </header>

      {/* ── Stats ── */}
      <div style={{ background: BLACK, padding: "0.85rem 3rem", display: "flex", gap: "2.5rem" }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {s.icon}
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", color: WHITE, lineHeight: 1 }}>{s.value}</span>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: `${WHITE}55` }}>{s.label}</span>
          </div>
        ))}
      </div>

      <main style={{ maxWidth: "820px", margin: "0 auto", padding: "2.5rem 2rem 5rem" }}>

        {/* ── Section label ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
          <Zap size={18} fill={RED} style={{ color: RED }} />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.08em", color: RED }}>TODAY'S ACTION</span>
        </div>

        {!done ? (
          /* ── Hero action card ── */
          <div style={{ background: WHITE, borderRadius: "1.5rem", border: `2px solid ${RED}30`, boxShadow: `0 8px 40px ${RED}18`, marginBottom: "2.5rem", overflow: "hidden", position: "relative" }}>

            {/* Urgency bar */}
            <div style={{ background: RED, padding: "0.6rem 1.5rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: WHITE }}>⚠️ {HERO.daysAway} days left — act now</span>
            </div>

            <div style={{ padding: "1.75rem 2rem" }}>
              {/* Person */}
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
                <div style={{ width: "5rem", height: "5rem", borderRadius: "999px", background: BG, border: `3px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", flexShrink: 0 }}>
                  {HERO.avatar}
                </div>
                <div>
                  <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: GRAY, marginBottom: "0.2rem" }}>{HERO.relation}</p>
                  <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3.25rem", lineHeight: 0.95, letterSpacing: "0.02em", margin: 0 }}>{HERO.person}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.35rem" }}>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: RED }}>{HERO.event}</span>
                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: GRAY, display: "inline-block" }} />
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: GRAY }}>{HERO.date}</span>
                  </div>
                </div>
                {/* Health ring */}
                <div style={{ marginLeft: "auto", textAlign: "center" }}>
                  <HealthRing score={HERO.healthScore} />
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: GRAY, display: "block", marginTop: "0.25rem" }}>Health</span>
                </div>
              </div>

              {/* Reason */}
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.5rem", color: BLACK, lineHeight: 1.4, marginBottom: "1.5rem", padding: "0.75rem 1rem", background: BG, borderRadius: "0.75rem", border: `1px solid ${BORDER}` }}>
                "{HERO.reason}"
              </p>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setDone(true)}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", background: RED, color: WHITE, border: "none", borderRadius: "0.875rem", padding: "1.1rem 1.5rem", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.35rem", letterSpacing: "0.06em", cursor: "pointer", boxShadow: `0 4px 16px ${RED}40` }}>
                  <Send size={20} />
                  Generate &amp; Send Card
                </button>
                <button style={{ padding: "1.1rem 1.5rem", background: "none", border: `2px solid ${BORDER}`, borderRadius: "0.875rem", fontWeight: 700, fontSize: "0.85rem", color: GRAY, cursor: "pointer", whiteSpace: "nowrap" as const }}>
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Done state */
          <div style={{ background: WHITE, borderRadius: "1.5rem", border: `2px solid ${SAGE}30`, marginBottom: "2.5rem", padding: "3rem 2rem", textAlign: "center" as const }}>
            <div style={{ width: "4rem", height: "4rem", borderRadius: "999px", background: `${SAGE}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <CheckCircle2 size={32} style={{ color: SAGE }} />
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", letterSpacing: "0.03em", marginBottom: "0.5rem" }}>Card sent!</h2>
            <p style={{ color: GRAY, marginBottom: "1.5rem" }}>You're an amazing friend. On to the next one.</p>
            <button onClick={() => setDone(false)} style={{ background: "none", border: `2px solid ${BORDER}`, borderRadius: "999px", padding: "0.6rem 1.5rem", fontWeight: 700, fontSize: "0.8rem", color: GRAY, cursor: "pointer" }}>
              Reset demo
            </button>
          </div>
        )}

        {/* ── Up next queue ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.08em", color: BLACK }}>UP NEXT</span>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: GRAY }}>· {QUEUE.length} actions queued</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {QUEUE.map((item, i) => (
            <div key={item.id} style={{ background: WHITE, borderRadius: "0.875rem", border: `1.5px solid ${i === 0 ? `${item.color}40` : BORDER}`, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer", boxShadow: i === 0 ? `0 2px 12px ${item.color}15` : "none" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "999px", background: `${item.color}15`, border: `2px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                {item.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{item.person}</span>
                  <span style={{ fontSize: "0.78rem", color: GRAY }}>{item.event}</span>
                </div>
                <p style={{ fontSize: "0.72rem", color: item.urgency === "high" ? RED : GRAY, fontWeight: 600, marginTop: "0.1rem" }}>
                  {item.daysAway === 1 ? "Due tomorrow" : `In ${item.daysAway} days`}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: GRAY, flexShrink: 0 }} />
            </div>
          ))}
        </div>

        <div style={{ display: "none" }} data-version={DATA_VERSION} />
      </main>
    </div>
  );
}
