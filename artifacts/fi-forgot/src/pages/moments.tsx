import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import AppNav from "@/components/layout/AppNav";
import { getRecipients, getBriefingsForRecipient, getCards, Recipient } from "@/lib/data";

const BG     = "#FAF7F2";
const RED    = "#E23B2E";
const INK    = "#1F1F1F";
const MID    = "#6B7280";
const WHITE  = "#FFFFFF";
const SAGE   = "#5B8C6B";
const BORDER = "#E5E0D8";
const AMBER  = "#C97A0A";

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function eventEmoji(event: string): string {
  const map: Record<string, string> = {
    "Birthday": "🎂", "Anniversary": "💕", "Mother's Day": "🌷",
    "Father's Day": "🎩", "Valentine's Day": "❤️", "Christmas": "🎄",
    "Hanukkah": "🕎", "Thanksgiving": "🍂", "Easter": "🐣", "New Year's": "🥂",
  };
  return map[event] ?? "🎉";
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
}

const AVATAR_PALETTES = [
  { bg: "#F2E6D3", fg: "#8B5E3C" },
  { bg: "#E4EDE7", fg: "#3D6B50" },
  { bg: "#EDE8F5", fg: "#5E4B8B" },
  { bg: "#FDEAEA", fg: "#8B3030" },
  { bg: "#E5EDF8", fg: "#2D5087" },
  { bg: "#FDF3E1", fg: "#7A5C00" },
];
function avatarPalette(name: string) {
  return AVATAR_PALETTES[name.charCodeAt(0) % AVATAR_PALETTES.length];
}

function urgencyColor(n: number): string {
  if (n <= 7)  return RED;
  if (n <= 14) return AMBER;
  return MID;
}

function urgencyLabel(n: number): string {
  if (n === 0) return "TODAY";
  if (n === 1) return "TOMORROW";
  return String(n);
}

type ActionStatus = "card-ready" | "briefing-done" | "not-started";

function actionStatus(briefingDone: boolean, hasCard: boolean): ActionStatus {
  if (hasCard)        return "card-ready";
  if (briefingDone)   return "briefing-done";
  return "not-started";
}

function statusDot(s: ActionStatus): string {
  if (s === "card-ready")    return SAGE;
  if (s === "briefing-done") return AMBER;
  return RED;
}

function statusText(s: ActionStatus): string {
  if (s === "card-ready")    return "Card Ready";
  if (s === "briefing-done") return "Needs Card";
  return "Not Started";
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
  recipient:    Recipient;
  event:        string;
  daysAway:     number;
  dateStr:      string;
  briefingDone: boolean;
  hasCard:      boolean;
};

type Filter = "all" | "week" | "month" | "birthdays" | "anniversaries";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",           label: "All"          },
  { key: "week",          label: "Next 7 Days"  },
  { key: "month",         label: "Next 30 Days" },
  { key: "birthdays",     label: "Birthdays"    },
  { key: "anniversaries", label: "Anniversaries"},
];

/* ── Row component ────────────────────────────────────────────────────────── */
function OccasionRow({
  ev, isMobile, onWriteCard, onReviewCard,
}: {
  ev: UpcomingEvent;
  isMobile: boolean;
  onWriteCard: () => void;
  onReviewCard: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const palette  = avatarPalette(ev.recipient.name);
  const status   = actionStatus(ev.briefingDone, ev.hasCard);
  const urgColor = urgencyColor(ev.daysAway);
  const isUrgent = ev.daysAway <= 7;
  const dateFormatted = new Date(ev.dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#FDFAF7" : WHITE,
        borderRadius: 10,
        padding: isMobile ? "12px 13px" : "13px 16px",
        border: `1px solid ${isUrgent ? `${RED}30` : hovered ? "#C8C0B4" : BORDER}`,
        display: "flex",
        gap: isMobile ? 11 : 14,
        alignItems: "center",
        transition: "border-color 0.12s, background 0.1s",
      }}>

      {/* Circular initials avatar */}
      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        background: palette.bg, color: palette.fg,
        flexShrink: 0, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "0.78rem", fontWeight: 800,
        letterSpacing: "0.03em", userSelect: "none",
      }}>
        {initials(ev.recipient.name)}
      </div>

      {/* Name + relationship */}
      <div style={{ flexShrink: 0, width: isMobile ? undefined : 130, minWidth: 90 }}>
        <div style={{ fontWeight: 700, fontSize: "0.875rem", color: INK, lineHeight: 1.2 }}>
          {ev.recipient.name}
        </div>
        {ev.recipient.relationship && (
          <div style={{ fontSize: "0.7rem", color: MID, marginTop: 2 }}>
            {ev.recipient.relationship}
          </div>
        )}
      </div>

      {/* Occasion + date */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "0.855rem", color: INK, lineHeight: 1.2, display: "flex", alignItems: "center", gap: 5 }}>
          <span>{eventEmoji(ev.event)}</span>
          <span>{ev.event}</span>
        </div>
        <div style={{ fontSize: "0.71rem", color: MID, marginTop: 2 }}>{dateFormatted}</div>
      </div>

      {/* Status badge — hide on narrow mobile */}
      {!isMobile && (
        <div style={{ flexShrink: 0, width: 118, display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: statusDot(status), flexShrink: 0,
          }} />
          <span style={{ fontSize: "0.71rem", fontWeight: 600, color: statusDot(status) }}>
            {statusText(status)}
          </span>
        </div>
      )}

      {/* Days counter */}
      <div style={{ flexShrink: 0, textAlign: "center", minWidth: isMobile ? 52 : 64 }}>
        <div style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: ev.daysAway <= 1 ? "1.1rem" : "1.7rem",
          color: urgColor, lineHeight: 1, fontWeight: 400,
        }}>
          {urgencyLabel(ev.daysAway)}
        </div>
        {ev.daysAway > 1 && (
          <div style={{
            fontSize: "0.5rem", fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.12em",
            color: urgColor, marginTop: 1,
          }}>
            DAYS
          </div>
        )}
      </div>

      {/* Action button */}
      <div style={{ flexShrink: 0 }}>
        {ev.hasCard ? (
          <button onClick={onReviewCard} style={{
            padding: "7px 12px",
            background: SAGE, color: WHITE,
            border: "none", borderRadius: 7,
            fontSize: "0.73rem", fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
          }}>
            Review →
          </button>
        ) : (
          <button onClick={onWriteCard} style={{
            padding: "7px 12px",
            background: isUrgent ? RED : ev.briefingDone ? INK : `${INK}11`,
            color: isUrgent ? WHITE : ev.briefingDone ? WHITE : INK,
            border: "none", borderRadius: 7,
            fontSize: "0.73rem", fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
          }}>
            {ev.briefingDone ? "Generate" : "Write Card"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Section header ───────────────────────────────────────────────────────── */
function SectionHeader({ label, count, accent }: { label: string; count: number; accent: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, marginTop: 4 }}>
      <div style={{ width: 3, height: 16, borderRadius: 2, background: accent, flexShrink: 0 }} />
      <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: INK }}>
        {label}
      </span>
      <span style={{
        fontSize: "0.66rem", fontWeight: 700, color: WHITE,
        background: accent, borderRadius: 10, padding: "1px 7px",
      }}>
        {count}
      </span>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function MomentsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [cards, setCards]           = useState(() => getCards());
  const [filter, setFilter]         = useState<Filter>("all");
  const [isMobile, setIsMobile]     = useState(() => window.innerWidth < 680);
  const [, setLocation]             = useLocation();

  useEffect(() => {
    setRecipients(getRecipients());
    setCards(getCards());
  }, []);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 680);
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
        const hasCard      = cards.some(c =>
          c.recipientId === r.id &&
          c.holiday === event &&
          (c.status === "Ready for approval" || c.status === "Approved")
        );
        result.push({ recipient: r, event, daysAway, dateStr, briefingDone, hasCard });
      }
    }
    return result.sort((a, b) => a.daysAway - b.daysAway);
  }, [recipients, cards]);

  const filtered = useMemo<UpcomingEvent[]>(() => {
    switch (filter) {
      case "week":          return allEvents.filter(e => e.daysAway <= 7);
      case "month":         return allEvents.filter(e => e.daysAway <= 30);
      case "birthdays":     return allEvents.filter(e => e.event === "Birthday");
      case "anniversaries": return allEvents.filter(e => e.event === "Anniversary");
      default:              return allEvents;
    }
  }, [allEvents, filter]);

  /* action-first grouping: needs attention first, then ready */
  const needsAction = filtered.filter(e => !e.hasCard);
  const readyToGo   = filtered.filter(e => e.hasCard);

  const urgentCount = needsAction.filter(e => e.daysAway <= 7).length;

  const px = isMobile ? 14 : 28;

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Inter', sans-serif", color: INK }}>
      <AppNav />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: `26px ${px}px 72px`, boxSizing: "border-box" }}>

        {/* ── Page heading ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 22 }}>
          <h1 style={{
            fontFamily: "'Inter', sans-serif", fontSize: isMobile ? "1.45rem" : "1.75rem",
            fontWeight: 800, color: INK, margin: 0, letterSpacing: "-0.02em",
          }}>
            Upcoming Occasions
          </h1>
          {urgentCount > 0 && (
            <p style={{ fontSize: "0.8rem", color: RED, margin: "5px 0 0", fontWeight: 600 }}>
              {urgentCount} occasion{urgentCount !== 1 ? "s" : ""} need{urgentCount === 1 ? "s" : ""} attention this week
            </p>
          )}
          {urgentCount === 0 && filtered.length > 0 && (
            <p style={{ fontSize: "0.8rem", color: MID, margin: "5px 0 0" }}>
              Nothing urgent — you're ahead of the game.
            </p>
          )}
        </div>

        {/* ── Filter chips ────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 22 }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                padding: "5px 13px", borderRadius: 20, cursor: "pointer",
                border: `1px solid ${filter === f.key ? INK : BORDER}`,
                background: filter === f.key ? INK : WHITE,
                color: filter === f.key ? WHITE : MID,
                fontSize: "0.76rem", fontWeight: 600,
                transition: "all 0.12s",
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Empty: no recipients ────────────────────────────────────── */}
        {recipients.length === 0 && (
          <div style={{
            background: WHITE, borderRadius: 12, padding: "52px 32px",
            textAlign: "center", border: `1px solid ${BORDER}`,
          }}>
            <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>📅</div>
            <p style={{ fontSize: "0.92rem", color: MID, margin: "0 0 20px", lineHeight: 1.65 }}>
              Add people to start tracking upcoming occasions.
            </p>
            <Link href="/people">
              <button style={{
                background: RED, color: WHITE, border: "none", borderRadius: 9,
                padding: "10px 22px", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer",
              }}>
                Go to Your People →
              </button>
            </Link>
          </div>
        )}

        {/* ── Empty: filter returns nothing ───────────────────────────── */}
        {recipients.length > 0 && filtered.length === 0 && (
          <div style={{
            background: WHITE, borderRadius: 12, padding: "40px 24px",
            textAlign: "center", border: `1px solid ${BORDER}`,
          }}>
            <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>🎉</div>
            <p style={{ fontSize: "0.88rem", color: MID, margin: 0 }}>Nothing in this window. You're all caught up!</p>
          </div>
        )}

        {/* ── Grouped event list ───────────────────────────────────────── */}
        {filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Needs attention group */}
            {needsAction.length > 0 && (
              <div>
                <SectionHeader label="Needs Attention" count={needsAction.length} accent={RED} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {needsAction.map(ev => (
                    <OccasionRow
                      key={`${ev.recipient.id}-${ev.event}`}
                      ev={ev}
                      isMobile={isMobile}
                      onWriteCard={() => setLocation(`/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}`)}
                      onReviewCard={() => setLocation("/cards/review")}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Ready to go group */}
            {readyToGo.length > 0 && (
              <div>
                <SectionHeader label="Ready to Go" count={readyToGo.length} accent={SAGE} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {readyToGo.map(ev => (
                    <OccasionRow
                      key={`${ev.recipient.id}-${ev.event}`}
                      ev={ev}
                      isMobile={isMobile}
                      onWriteCard={() => setLocation(`/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}`)}
                      onReviewCard={() => setLocation("/cards/review")}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
