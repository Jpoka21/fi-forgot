import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import AppNav from "@/components/layout/AppNav";
import { getRecipients, getBriefingsForRecipient, getCards, Recipient } from "@/lib/data";

const BEIGE  = "#F2E6D3";
const RED    = "#E23B2E";
const INK    = "#1F1F1F";
const MID    = "#4B5563";
const WHITE  = "#FFFFFF";
const SAGE   = "#5B8C6B";
const BORDER = "#E5E0D8";

/* ── Helpers (shared with dashboard) ─────────────────────────────────────── */
function eventEmoji(event: string): string {
  const map: Record<string, string> = {
    "Birthday": "🎂", "Anniversary": "💕", "Mother's Day": "🌷",
    "Father's Day": "🎩", "Valentine's Day": "❤️", "Christmas": "🎄",
    "Hanukkah": "🕎", "Thanksgiving": "🍂", "Easter": "🐣", "New Year's": "🥂",
  };
  return map[event] ?? "🎉";
}

function relationshipEmoji(rel: string): string {
  const map: Record<string, string> = {
    "Wife": "❤️", "Husband": "❤️", "Girlfriend": "💑", "Boyfriend": "💑",
    "Mom": "👩", "Dad": "👨", "Mother": "👩", "Father": "👨",
    "Sister": "👯", "Brother": "🤜", "Son": "👦", "Daughter": "👧",
    "Friend": "🤝", "Best Friend": "✨",
    "Grandma": "👵", "Grandpa": "👴", "Grandmother": "👵", "Grandfather": "👴",
    "Aunt": "🌸", "Uncle": "🧔", "Boss": "💼", "Coworker": "🤝",
  };
  return map[rel] ?? "🤝";
}

function daysColor(n: number): string {
  if (n <= 7)  return RED;
  if (n <= 14) return "#D97706";
  return MID;
}

const HOLIDAY_DATES: Record<string, { month: number; day: number }> = {
  "Valentine's Day": { month: 2,  day: 14 }, "Mother's Day":  { month: 5,  day: 12 },
  "Father's Day":    { month: 6,  day: 16 }, "Thanksgiving":  { month: 11, day: 28 },
  "Christmas":       { month: 12, day: 25 }, "Hanukkah":      { month: 12, day: 26 },
  "New Year's":      { month: 1,  day: 1  }, "Easter":        { month: 4,  day: 20 },
};

function getEventDate(event: string, r: Recipient): string | null {
  const now  = new Date(); const year = now.getFullYear();
  const pad  = (n: number) => String(n).padStart(2, "0");
  const next = (stored: string) => {
    const p = stored.split("-").map(Number);
    let d   = new Date(year, p[1] - 1, p[2]);
    if (d < now) d = new Date(year + 1, p[1] - 1, p[2]);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  if (event === "Birthday" && r.birthday)  return next(r.birthday);
  if (event === "Anniversary") {
    const src = r.anniversaryDate ?? r.marriageDate;
    if (src) return next(src);
  }
  const custom = r.customDates?.find(c => c.label === event);
  if (custom?.date) return next(custom.date);
  const fixed = HOLIDAY_DATES[event];
  if (fixed) return next(`${year}-${pad(fixed.month)}-${pad(fixed.day)}`);
  return null;
}

type UpcomingEvent = {
  recipient: Recipient;
  event:     string;
  daysAway:  number;
  dateStr:   string;
  briefingDone: boolean;
};

type Filter = "all" | "week" | "month" | "birthdays" | "anniversaries";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",          label: "All Moments"   },
  { key: "week",         label: "Next 7 Days"   },
  { key: "month",        label: "Next 30 Days"  },
  { key: "birthdays",    label: "Birthdays"     },
  { key: "anniversaries",label: "Anniversaries" },
];

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function MomentsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [cards, setCards]           = useState(() => getCards());
  const [filter, setFilter]         = useState<Filter>("all");
  const [isMobile, setIsMobile]     = useState(() => window.innerWidth < 768);
  const [, setLocation]             = useLocation();

  useEffect(() => {
    setRecipients(getRecipients());
    setCards(getCards());
  }, []);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const allEvents = useMemo<UpcomingEvent[]>(() => {
    const today    = new Date();
    const cutoff   = new Date(today.getTime() + 90 * 86400000);
    const thisYear = today.getFullYear();
    const result: UpcomingEvent[] = [];

    for (const r of recipients) {
      const briefings = getBriefingsForRecipient(r.id);
      for (const event of r.selectedEvents ?? []) {
        const dateStr = getEventDate(event, r);
        if (!dateStr) continue;
        const d = new Date(dateStr);
        if (d < today || d > cutoff) continue;
        const daysAway     = Math.ceil((d.getTime() - today.getTime()) / 86400000);
        const briefingDone = briefings.some(b => b.event === event && b.year === thisYear);
        result.push({ recipient: r, event, daysAway, dateStr, briefingDone });
      }
    }
    return result.sort((a, b) => a.daysAway - b.daysAway);
  }, [recipients]);

  const filtered = useMemo<UpcomingEvent[]>(() => {
    switch (filter) {
      case "week":          return allEvents.filter(e => e.daysAway <= 7);
      case "month":         return allEvents.filter(e => e.daysAway <= 30);
      case "birthdays":     return allEvents.filter(e => e.event === "Birthday");
      case "anniversaries": return allEvents.filter(e => e.event === "Anniversary");
      default:              return allEvents;
    }
  }, [allEvents, filter]);

  const px = isMobile ? 16 : 28;

  return (
    <div style={{ minHeight: "100vh", background: BEIGE, fontFamily: "'Inter', sans-serif", color: INK }}>
      <AppNav />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: `28px ${px}px 64px`, boxSizing: "border-box" as const }}>

        {/* ── Page heading ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "2rem" : "2.4rem", letterSpacing: "0.03em", color: INK, margin: 0, lineHeight: 1 }}>
            Upcoming Moments
          </h1>
          <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: MID, margin: "4px 0 0" }}>
            Sorted by urgency — most important first.
          </p>
        </div>

        {/* ── Filter chips ────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 20 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                border: `1px solid ${filter === f.key ? INK : BORDER}`,
                background: filter === f.key ? INK : WHITE,
                color: filter === f.key ? WHITE : MID,
                fontSize: "0.78rem", fontWeight: 600,
                transition: "all 0.12s",
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Empty: no recipients ────────────────────────────────────── */}
        {recipients.length === 0 && (
          <div style={{ background: WHITE, borderRadius: 18, padding: "52px 32px", textAlign: "center" as const, border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📅</div>
            <p style={{ fontSize: "0.95rem", color: MID, margin: "0 0 20px", lineHeight: 1.65 }}>
              Add people to start tracking upcoming moments.
            </p>
            <Link href="/people">
              <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 9, padding: "11px 24px", fontSize: "0.86rem", fontWeight: 700, cursor: "pointer" }}>
                Go to Your People →
              </button>
            </Link>
          </div>
        )}

        {/* ── Empty: filter returns nothing ───────────────────────────── */}
        {recipients.length > 0 && filtered.length === 0 && (
          <div style={{ background: WHITE, borderRadius: 14, padding: "40px 24px", textAlign: "center" as const, border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>🎉</div>
            <p style={{ fontSize: "0.9rem", color: MID, margin: 0 }}>Nothing in this window. You're all caught up!</p>
          </div>
        )}

        {/* ── Event list ──────────────────────────────────────────────── */}
        {filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            {filtered.map(ev => {
              const isUrgent = ev.daysAway <= 7;
              const statusText =
                ev.briefingDone   ? "Personalized ✓"
                : isUrgent        ? "Needs attention soon"
                : ev.daysAway <= 14 ? "Coming up"
                : null;
              const statusColor =
                ev.briefingDone ? SAGE
                : isUrgent      ? RED
                : "#D97706";

              return (
                <div key={`${ev.recipient.id}-${ev.event}`}
                  style={{
                    background: WHITE, borderRadius: 12,
                    padding: isMobile ? "12px 13px" : "14px 18px",
                    border: `1px solid ${isUrgent ? `${RED}30` : BORDER}`,
                    display: "flex", gap: 12, alignItems: "center",
                  }}>

                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 11, background: BEIGE,
                    flexShrink: 0, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "1.35rem",
                    border: `1px solid ${BORDER}`,
                  }}>
                    {relationshipEmoji(ev.recipient.relationship)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ marginBottom: 3 }}>
                      <span style={{ fontWeight: 800, fontSize: "0.92rem", color: INK }}>{ev.recipient.name}</span>
                      <span style={{ fontSize: "0.73rem", color: MID, marginLeft: 6 }}>{ev.recipient.relationship}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" as const }}>
                      <span style={{ fontSize: "0.82rem" }}>{eventEmoji(ev.event)}</span>
                      <span style={{ fontWeight: 600, fontSize: "0.8rem", color: INK }}>{ev.event}</span>
                      <span style={{ fontSize: "0.72rem", color: MID }}>
                        · {new Date(ev.dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      {statusText && (
                        <span style={{ fontSize: "0.68rem", fontWeight: 600, color: statusColor }}>
                          · {statusText}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Days counter */}
                  <div style={{ textAlign: "right" as const, flexShrink: 0, marginRight: 4 }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.85rem", color: daysColor(ev.daysAway), lineHeight: 1 }}>
                      {ev.daysAway}
                    </div>
                    <div style={{ fontSize: "0.54rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: daysColor(ev.daysAway) }}>
                      days
                    </div>
                  </div>

                  {/* Actions */}
                  {(() => {
                    const hasCard = cards.some(c =>
                      c.recipientId === ev.recipient.id &&
                      c.holiday === ev.event &&
                      (c.status === "Ready for approval" || c.status === "Approved")
                    );
                    return (
                      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column" as const, gap: 6, alignItems: "flex-end" }}>
                        {hasCard ? (
                          <button
                            onClick={() => setLocation("/cards/review")}
                            style={{
                              padding: "6px 12px",
                              background: SAGE, color: WHITE,
                              border: "none", borderRadius: 7,
                              fontSize: "0.74rem", fontWeight: 700,
                              cursor: "pointer", whiteSpace: "nowrap" as const,
                            }}>
                            Review card →
                          </button>
                        ) : (
                          <button
                            onClick={() => setLocation(`/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}`)}
                            style={{
                              padding: "6px 12px",
                              background: isUrgent ? RED : `${INK}09`,
                              color: isUrgent ? WHITE : INK,
                              border: "none", borderRadius: 7,
                              fontSize: "0.74rem", fontWeight: 700,
                              cursor: "pointer", whiteSpace: "nowrap" as const,
                            }}>
                            {ev.briefingDone ? "Generate Card" : "Add details"}
                          </button>
                        )}
                        <Link href={`/relationship/${ev.recipient.id}`} style={{ textDecoration: "none" }}>
                          <span style={{ fontSize: "0.67rem", color: MID, textDecoration: "underline", textUnderlineOffset: "2px", cursor: "pointer" }}>
                            View Person
                          </span>
                        </Link>
                      </div>
                    );
                  })()}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
