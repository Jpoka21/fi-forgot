import React, { useState } from "react";
import { Plus, Calendar, Users, Settings, ChevronRight, Clock, Send } from "lucide-react";

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

const PEOPLE = [
  { id: 1, name: "Mom", relation: "Mother", avatar: "👩‍🦳", health: 88, nextEvent: "Birthday", daysUntil: 3, urgent: true, lastContact: "2 wks ago" },
  { id: 2, name: "Sarah", relation: "Sister", avatar: "👱‍♀️", health: 92, nextEvent: "New Job", daysUntil: 19, urgent: false, lastContact: "3 days ago" },
  { id: 3, name: "Marcus", relation: "Best Friend", avatar: "🧔", health: 45, nextEvent: "Birthday", daysUntil: 24, urgent: false, lastContact: "3 mos ago" },
  { id: 4, name: "Steve", relation: "Friend", avatar: "👨", health: 67, nextEvent: "Anniversary", daysUntil: 6, urgent: true, lastContact: "1 mo ago" },
  { id: 5, name: "Dave", relation: "Husband", avatar: "🧑", health: 95, nextEvent: "Date Night", daysUntil: 11, urgent: false, lastContact: "Today" },
  { id: 6, name: "Jessica", relation: "Colleague", avatar: "👩‍💼", health: 31, nextEvent: "Work Anniv", daysUntil: 53, urgent: false, lastContact: "6 mos ago" },
];

function HealthDot({ score }: { score: number }) {
  const color = score >= 70 ? BRAND.SAGE : score >= 50 ? "#D97706" : BRAND.RED;
  return (
    <div style={{ position: "relative", width: "46px", height: "46px", flexShrink: 0 }}>
      <svg width="46" height="46" viewBox="0 0 46 46" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="23" cy="23" r="18" fill="none" stroke={BRAND.BORDER} strokeWidth="4" />
        <circle
          cx="23" cy="23" r="18" fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={`${(score / 100) * 2 * Math.PI * 18} ${2 * Math.PI * 18}`}
          strokeLinecap="round"
        />
      </svg>
      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color }}>
        {score}
      </span>
    </div>
  );
}

export function Mobile() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const needsAttention = PEOPLE.filter(p => p.health < 60).length;

  return (
    <div
      className="relative mx-auto border-8 border-black rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
      style={{ width: "390px", height: "844px", backgroundColor: BRAND.BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: BRAND.BLACK }}
    >
      {/* Status Bar */}
      <div style={{ height: "3rem", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", fontSize: "0.75rem", fontWeight: 600 }}>
        <span>9:41</span>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          <div style={{ width: "16px", height: "11px", backgroundColor: BRAND.BLACK, borderRadius: "2px" }} />
          <div style={{ width: "11px", height: "11px", backgroundColor: BRAND.BLACK, borderRadius: "50%" }} />
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "0.5rem 1.5rem 1rem", borderBottom: `1px solid ${BRAND.BORDER}` }}>
        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem", color: BRAND.SAGE, transform: "rotate(-1.5deg)", display: "block", marginBottom: "-0.2rem" }}>
          checking in on…
        </p>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.75rem", lineHeight: 1, letterSpacing: "0.02em" }}>YOUR PEOPLE</h1>
        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: BRAND.GRAY, marginTop: "0.25rem" }}>
          <span style={{ color: BRAND.RED }}>{needsAttention} need attention</span>
          {" · "}
          {PEOPLE.length} total
        </p>
      </div>

      {/* People List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem 1rem 6rem" }}>
        {PEOPLE.map((person, i) => (
          <div key={person.id}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 0.5rem", cursor: "pointer" }}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div style={{ width: "2.75rem", height: "2.75rem", borderRadius: "999px", backgroundColor: BRAND.WHITE, border: `2px solid ${person.urgent ? BRAND.RED : BRAND.BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.35rem", flexShrink: 0 }}>
                {person.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", lineHeight: 1 }}>{person.name}</h3>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: BRAND.SAGE }}>{person.relation}</span>
                </div>
                <p style={{ fontSize: "0.75rem", color: BRAND.GRAY, fontWeight: 600, marginTop: "0.1rem" }}>
                  {person.nextEvent}
                  <span style={{ color: person.urgent ? BRAND.RED : BRAND.GRAY }}> · in {person.daysUntil}d</span>
                </p>
              </div>
              <HealthDot score={person.health} />
            </div>

            {/* Expanded inline */}
            {expanded === i && (
              <div style={{ margin: "0 0.5rem 0.75rem", padding: "1rem", borderRadius: "0.75rem", backgroundColor: BRAND.WHITE, border: `1px solid ${BRAND.BORDER}`, display: "flex", gap: "0.6rem" }}>
                <button style={{ flex: 1, backgroundColor: BRAND.BLACK, color: BRAND.BG, borderRadius: "0.5rem", padding: "0.6rem", fontWeight: 700, fontSize: "0.75rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
                  <Send size={13} /> Send Card
                </button>
                <button style={{ flex: 1, backgroundColor: "transparent", color: BRAND.BLACK, borderRadius: "0.5rem", padding: "0.6rem", fontWeight: 700, fontSize: "0.75rem", border: `2px solid ${BRAND.BORDER}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
                  <ChevronRight size={13} /> View Profile
                </button>
              </div>
            )}

            {i < PEOPLE.length - 1 && <div style={{ height: "1px", backgroundColor: BRAND.BORDER, margin: "0 0.5rem" }} />}
          </div>
        ))}
      </div>

      {/* FAB */}
      <div style={{ position: "absolute", bottom: "5.5rem", right: "1.25rem" }}>
        <button style={{ width: "3.5rem", height: "3.5rem", borderRadius: "999px", backgroundColor: BRAND.RED, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(226,59,46,0.4)" }}>
          <Plus size={26} strokeWidth={3} />
        </button>
      </div>

      {/* Bottom Nav */}
      <nav style={{ position: "absolute", bottom: 0, width: "100%", backgroundColor: BRAND.WHITE, borderTop: `2px solid ${BRAND.BORDER}`, display: "flex", justifyContent: "space-around", padding: "0.85rem 0 1.5rem" }}>
        <button style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", opacity: 0.4, background: "none", border: "none", cursor: "pointer" }}>
          <Calendar size={22} strokeWidth={2} />
          <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Timeline</span>
        </button>
        <button style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", color: BRAND.BLACK, background: "none", border: "none", cursor: "pointer" }}>
          <Users size={22} strokeWidth={2.5} />
          <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>People</span>
        </button>
        <button style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", opacity: 0.4, background: "none", border: "none", cursor: "pointer" }}>
          <Settings size={22} strokeWidth={2} />
          <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Settings</span>
        </button>
      </nav>

      <div className="hidden" data-version={DATA_VERSION} />
    </div>
  );
}
