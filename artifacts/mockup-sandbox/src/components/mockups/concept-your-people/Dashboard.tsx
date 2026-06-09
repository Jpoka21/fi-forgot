import React from "react";
import { Plus, Clock, TrendingUp, TrendingDown, Minus, Heart } from "lucide-react";

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
  {
    id: 1,
    name: "Mom",
    relation: "Mother",
    avatar: "👩‍🦳",
    health: 88,
    trend: "up",
    nextEvent: "Birthday",
    nextDate: "Oct 12",
    daysUntil: 3,
    lastContact: "2 weeks ago",
    tags: ["Caring", "Family"],
    urgent: true,
  },
  {
    id: 2,
    name: "Sarah",
    relation: "Sister",
    avatar: "👱‍♀️",
    health: 92,
    trend: "up",
    nextEvent: "New Job",
    nextDate: "Oct 28",
    daysUntil: 19,
    lastContact: "3 days ago",
    tags: ["Adventurous", "Creative"],
    urgent: false,
  },
  {
    id: 3,
    name: "Marcus",
    relation: "Best Friend",
    avatar: "🧔",
    health: 45,
    trend: "down",
    nextEvent: "Birthday",
    nextDate: "Nov 2",
    daysUntil: 24,
    lastContact: "3 months ago",
    tags: ["Funny", "Loyal"],
    urgent: false,
  },
  {
    id: 4,
    name: "Steve",
    relation: "Friend",
    avatar: "👨",
    health: 67,
    trend: "flat",
    nextEvent: "Anniversary",
    nextDate: "Oct 15",
    daysUntil: 6,
    lastContact: "1 month ago",
    tags: ["Outdoorsy", "Tech"],
    urgent: true,
  },
  {
    id: 5,
    name: "Jessica",
    relation: "Colleague",
    avatar: "👩‍💼",
    health: 31,
    trend: "down",
    nextEvent: "Work Anniv",
    nextDate: "Dec 1",
    daysUntil: 53,
    lastContact: "6 months ago",
    tags: ["Professional"],
    urgent: false,
  },
  {
    id: 6,
    name: "Dave",
    relation: "Husband",
    avatar: "🧑",
    health: 95,
    trend: "up",
    nextEvent: "Date Night",
    nextDate: "Oct 20",
    daysUntil: 11,
    lastContact: "Today",
    tags: ["Partner", "Funny"],
    urgent: false,
  },
];

function HealthRing({ score }: { score: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 70 ? BRAND.SAGE : score >= 50 ? "#D97706" : BRAND.RED;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="28" cy="28" r={r} fill="none" stroke={BRAND.BORDER} strokeWidth="5" />
      <circle
        cx="28" cy="28" r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
      />
      <text
        x="28" y="28"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: "12px", fontWeight: 700, fill: color, transform: "rotate(90deg)", transformOrigin: "28px 28px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {score}
      </text>
    </svg>
  );
}

export function Dashboard() {
  const needsAttention = PEOPLE.filter(p => p.health < 60).length;
  const healthy = PEOPLE.filter(p => p.health >= 70).length;

  return (
    <div style={{ backgroundColor: BRAND.BG, minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: BRAND.BLACK, paddingBottom: "4rem" }}>
      {/* Header */}
      <header style={{ padding: "2.5rem 3rem 2rem", borderBottom: `1px solid ${BRAND.BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.4rem", color: BRAND.SAGE, marginBottom: "-0.4rem", transform: "rotate(-1.5deg)", display: "block" }}>
            checking in on…
          </p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "4.5rem", lineHeight: 1, letterSpacing: "0.02em" }}>
            YOUR PEOPLE
          </h1>
          <p style={{ fontSize: "0.95rem", color: BRAND.GRAY, fontWeight: 600, marginTop: "0.5rem" }}>
            <span style={{ color: BRAND.RED }}>{needsAttention} need{needsAttention === 1 ? "s" : ""} attention</span>
            {" · "}
            {healthy} healthy
            {" · "}
            {PEOPLE.length} total
          </p>
        </div>
        <button style={{ backgroundColor: BRAND.BLACK, color: BRAND.BG, padding: "0.85rem 1.75rem", borderRadius: "999px", fontWeight: 700, fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.5rem", border: "none", cursor: "pointer" }}>
          <Plus size={20} /> Add Person
        </button>
      </header>

      <main style={{ padding: "2.5rem 3rem", maxWidth: "1400px" }}>
        {/* People Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {PEOPLE.map(person => (
            <div
              key={person.id}
              style={{
                backgroundColor: BRAND.WHITE,
                borderRadius: "1.25rem",
                border: `2px solid ${person.urgent ? BRAND.RED : BRAND.BORDER}`,
                boxShadow: person.urgent ? `4px 4px 0 ${BRAND.RED}30` : "2px 2px 0 rgba(0,0,0,0.06)",
                padding: "1.75rem",
                cursor: "pointer",
                transition: "transform 0.15s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {person.urgent && (
                <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", backgroundColor: BRAND.RED, color: "#fff", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "0.2rem 0.6rem", borderRadius: "999px" }}>
                  Soon
                </div>
              )}

              {/* Top row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
                  <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "999px", backgroundColor: BRAND.BG, border: `2px solid ${BRAND.BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem" }}>
                    {person.avatar}
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", lineHeight: 1, letterSpacing: "0.03em" }}>{person.name}</h2>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: BRAND.SAGE, marginTop: "0.15rem" }}>{person.relation}</p>
                  </div>
                </div>
                <HealthRing score={person.health} />
              </div>

              {/* Tags */}
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.1rem" }}>
                {person.tags.map(tag => (
                  <span key={tag} style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "0.2rem 0.6rem", borderRadius: "999px", backgroundColor: BRAND.BG, border: `1px solid ${BRAND.BORDER}`, color: BRAND.GRAY }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Next event */}
              <div style={{ borderTop: `1px solid ${BRAND.BORDER}`, paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: BRAND.GRAY, marginBottom: "0.2rem" }}>Next Moment</p>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                    {person.nextEvent}
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", marginLeft: "0.4rem", color: person.daysUntil <= 7 ? BRAND.RED : BRAND.GRAY }}>
                      {person.nextDate}
                    </span>
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", fontWeight: 600, color: BRAND.GRAY }}>
                  <Clock size={13} />
                  {person.lastContact}
                </div>
              </div>
            </div>
          ))}

          {/* Add Person Card */}
          <div style={{ borderRadius: "1.25rem", border: `2px dashed ${BRAND.BLACK}`, padding: "1.75rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "14rem", cursor: "pointer", gap: "0.75rem" }}>
            <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "999px", border: `2px solid ${BRAND.BLACK}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Plus size={22} />
            </div>
            <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.03em" }}>Add Person</p>
          </div>
        </div>

        <div className="hidden" data-version={DATA_VERSION} />
      </main>
    </div>
  );
}
