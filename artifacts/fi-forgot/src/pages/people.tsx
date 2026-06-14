import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import AppNav from "@/components/layout/AppNav";
import { getRecipients, getArchivedRecipients, restoreRecipient, Recipient } from "@/lib/data";
import { computeOverallHealth } from "@/lib/relationship-health";
import { Plus, Search } from "lucide-react";

const BEIGE  = "#F2E6D3";
const RED    = "#E23B2E";
const INK    = "#1F1F1F";
const MID    = "#4B5563";
const WHITE  = "#FFFFFF";
const SAGE   = "#5B8C6B";
const BORDER = "#E5E0D8";

const HOLIDAY_DATES: Record<string, { month: number; day: number }> = {
  "Valentine's Day": { month: 2,  day: 14 }, "Mother's Day":  { month: 5,  day: 12 },
  "Father's Day":    { month: 6,  day: 16 }, "Thanksgiving":  { month: 11, day: 28 },
  "Christmas":       { month: 12, day: 25 }, "Hanukkah":      { month: 12, day: 26 },
  "New Year's":      { month: 1,  day: 1  }, "Easter":        { month: 4,  day: 20 },
};

function getNextEventDate(r: Recipient): { event: string; daysAway: number } | null {
  const now  = new Date();
  const year = now.getFullYear();
  const pad  = (n: number) => String(n).padStart(2, "0");
  const next = (stored: string) => {
    const p = stored.split("-").map(Number);
    let d   = new Date(year, p[1] - 1, p[2]);
    if (d <= now) d = new Date(year + 1, p[1] - 1, p[2]);
    return d;
  };

  let best: { event: string; date: Date } | null = null;
  for (const event of r.selectedEvents ?? []) {
    let d: Date | null = null;
    if (event === "Birthday" && r.birthday) {
      d = next(r.birthday);
    } else if (event === "Anniversary") {
      const src = r.anniversaryDate ?? r.marriageDate;
      if (src) d = next(src);
    } else {
      const custom = r.customDates?.find(c => c.label === event);
      if (custom?.date) {
        d = next(custom.date);
      } else {
        const fixed = HOLIDAY_DATES[event];
        if (fixed) d = next(`${year}-${pad(fixed.month)}-${pad(fixed.day)}`);
      }
    }
    if (d && (!best || d < best.date)) best = { event, date: d };
  }
  if (!best) return null;
  const daysAway = Math.ceil((best.date.getTime() - now.getTime()) / 86400000);
  return { event: best.event, daysAway };
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

function eventEmoji(event: string): string {
  const map: Record<string, string> = {
    "Birthday": "🎂", "Anniversary": "💕", "Mother's Day": "🌷",
    "Father's Day": "🎩", "Valentine's Day": "❤️", "Christmas": "🎄",
    "Hanukkah": "🕎", "Thanksgiving": "🍂", "Easter": "🐣", "New Year's": "🥂",
  };
  return map[event] ?? "🎉";
}

function healthDot(score: number): string {
  if (score >= 80) return SAGE;
  if (score >= 65) return "#26A69A";
  if (score >= 45) return "#F59E0B";
  if (score >= 25) return "#EF6C00";
  return MID;
}

const FAMILY_REL = new Set(["Wife", "Husband", "Girlfriend", "Boyfriend", "Mom", "Dad", "Mother", "Father",
  "Sister", "Brother", "Son", "Daughter", "Grandma", "Grandpa", "Grandmother", "Grandfather",
  "Aunt", "Uncle", "Niece", "Nephew"]);

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function PeoplePage() {
  const [recipients, setRecipients]     = useState<Recipient[]>([]);
  const [archived, setArchived]         = useState<Recipient[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [restoring, setRestoring]       = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [isMobile, setIsMobile]         = useState(() => window.innerWidth < 768);

  function reload() {
    setRecipients(getRecipients());
    setArchived(getArchivedRecipients());
  }

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const healthData = useMemo(() => {
    if (recipients.length === 0) return new Map<string, number>();
    const h = computeOverallHealth(recipients);
    return new Map(h.recipientHealths.map(rh => [rh.id ?? rh.name, rh.score]));
  }, [recipients]);

  const filtered = useMemo(() => {
    if (!search.trim()) return recipients;
    const q = search.toLowerCase();
    return recipients.filter(r =>
      r.name.toLowerCase().includes(q) || r.relationship.toLowerCase().includes(q)
    );
  }, [recipients, search]);

  const { family, friends, other } = useMemo(() => {
    const family:  Recipient[] = [];
    const friends: Recipient[] = [];
    const other:   Recipient[] = [];
    for (const r of filtered) {
      if (FAMILY_REL.has(r.relationship))       family.push(r);
      else if (r.relationship === "Friend" || (r.relationship as string) === "Best Friend") friends.push(r);
      else other.push(r);
    }
    return { family, friends, other };
  }, [filtered]);

  const px = isMobile ? 16 : 28;

  function PersonCard({ r }: { r: Recipient }) {
    const next    = getNextEventDate(r);
    const score   = healthData.get(r.id) ?? healthData.get(r.name) ?? 0;
    const dot     = healthDot(score);
    const urgent  = next && next.daysAway <= 7;

    return (
      <Link href={`/recipients/${r.id}`} style={{ textDecoration: "none" }}>
        <div
          style={{
            background: WHITE, borderRadius: 12, padding: "13px 15px",
            border: `1px solid ${urgent ? `${RED}30` : BORDER}`,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
            transition: "box-shadow 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 3px 12px rgba(0,0,0,0.07)";
            (e.currentTarget as HTMLDivElement).style.borderColor = urgent ? RED : INK;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            (e.currentTarget as HTMLDivElement).style.borderColor = urgent ? `${RED}30` : BORDER;
          }}
        >
          {/* Avatar */}
          <div style={{
            width: 46, height: 46, borderRadius: 12, background: BEIGE, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", border: `1px solid ${BORDER}`, position: "relative" as const,
          }}>
            {relationshipEmoji(r.relationship)}
            {/* Health dot */}
            <div style={{
              position: "absolute", bottom: -3, right: -3,
              width: 10, height: 10, borderRadius: "50%",
              background: dot, border: "2px solid #F2E6D3",
            }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: INK, lineHeight: 1.2, marginBottom: 2 }}>
              {r.name}
            </div>
            <div style={{ fontSize: "0.72rem", color: MID }}>{r.relationship}</div>
          </div>

          {/* Next event chip */}
          {next ? (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              background: urgent ? `${RED}10` : BEIGE,
              borderRadius: 8, padding: "4px 9px",
              fontSize: "0.7rem", fontWeight: 600,
              color: urgent ? RED : MID, flexShrink: 0,
            }}>
              {eventEmoji(next.event)} {next.daysAway}d
            </div>
          ) : (r.selectedEvents?.length ?? 0) > 0 ? (
            <div style={{ fontSize: "0.68rem", color: MID, flexShrink: 0 }}>
              {r.selectedEvents!.length} occasions
            </div>
          ) : (
            <div style={{ fontSize: "0.68rem", color: MID, flexShrink: 0 }}>No events</div>
          )}
        </div>
      </Link>
    );
  }

  function Group({ title, people }: { title: string; people: Recipient[] }) {
    if (people.length === 0) return null;
    return (
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", letterSpacing: "0.14em", color: MID, marginBottom: 10 }}>
          {title}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
          {people.map(r => <PersonCard key={r.id} r={r} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BEIGE, fontFamily: "'Inter', sans-serif", color: INK }}>
      <AppNav />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: `28px ${px}px 64px`, boxSizing: "border-box" as const }}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, gap: 12, flexWrap: "wrap" as const }}>
          <div>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "2rem" : "2.4rem", letterSpacing: "0.03em", color: INK, margin: 0, lineHeight: 1 }}>
              Your People
            </h1>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: MID, margin: "4px 0 0" }}>
              Everyone who matters to you.
            </p>
          </div>
          <Link href="/recipients/new">
            <button data-testid="link-add-recipient"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: RED, color: WHITE, border: "none",
                borderRadius: 10, padding: "10px 18px",
                fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem",
                letterSpacing: "0.06em", cursor: "pointer", flexShrink: 0,
              }}>
              <Plus size={14} /> Add Person
            </button>
          </Link>
        </div>

        {/* ── Search ──────────────────────────────────────────────────── */}
        <div style={{ position: "relative" as const, marginBottom: 24 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: MID }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your people…"
            style={{
              width: "100%", padding: "10px 12px 10px 36px",
              background: WHITE, border: `1px solid ${BORDER}`,
              borderRadius: 10, fontSize: "0.84rem", color: INK,
              outline: "none", boxSizing: "border-box" as const,
            }}
          />
        </div>

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {recipients.length === 0 && (
          <div style={{ background: WHITE, borderRadius: 20, padding: "60px 32px", textAlign: "center" as const, border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: "3rem", marginBottom: 14 }}>👥</div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: INK, letterSpacing: "0.04em", marginBottom: 10 }}>
              Add Your First Person
            </div>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: MID, maxWidth: 320, margin: "0 auto 24px" }}>
              We'll help you stay connected and never miss a moment.
            </p>
            <Link href="/recipients/new">
              <button style={{ background: RED, color: WHITE, border: "none", borderRadius: 10, padding: "12px 28px", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", cursor: "pointer" }}>
                Add Your First Person
              </button>
            </Link>
          </div>
        )}

        {/* ── No results ──────────────────────────────────────────────── */}
        {recipients.length > 0 && filtered.length === 0 && (
          <div style={{ background: WHITE, borderRadius: 14, padding: "36px 24px", textAlign: "center" as const, border: `1px solid ${BORDER}` }}>
            <p style={{ color: MID, fontSize: "0.9rem", margin: 0 }}>No one matches "{search}".</p>
          </div>
        )}

        {/* ── Grouped lists ───────────────────────────────────────────── */}
        {filtered.length > 0 && (
          <>
            <Group title="Family" people={family} />
            <Group title="Friends" people={friends} />
            <Group title="Others" people={other} />
          </>
        )}

        {/* ── Archived People ─────────────────────────────────────────── */}
        {archived.length > 0 && (
          <div style={{ marginTop: 40, borderTop: `1px solid ${BORDER}`, paddingTop: 28 }}>
            <button
              onClick={() => setShowArchived(s => !s)}
              style={{
                display: "flex", alignItems: "center", gap: 8, background: "none",
                border: "none", cursor: "pointer", padding: 0, marginBottom: 16,
              }}
            >
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", letterSpacing: "0.14em", color: MID }}>
                Archived ({archived.length})
              </span>
              <span style={{ fontSize: "0.7rem", color: MID }}>{showArchived ? "▲ hide" : "▼ show"}</span>
            </button>

            {showArchived && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
                {archived.map(r => (
                  <div
                    key={r.id}
                    style={{
                      background: WHITE, borderRadius: 12, padding: "13px 15px",
                      border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12,
                      opacity: 0.7,
                    }}
                  >
                    <div style={{
                      width: 46, height: 46, borderRadius: 12, background: BEIGE, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.5rem", border: `1px solid ${BORDER}`,
                    }}>
                      {relationshipEmoji(r.relationship)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem", color: INK }}>{r.name}</div>
                      <div style={{ fontSize: "0.72rem", color: MID }}>{r.relationship}</div>
                    </div>
                    <button
                      disabled={restoring === r.id}
                      onClick={() => {
                        setRestoring(r.id);
                        restoreRecipient(r.id);
                        reload();
                        setRestoring(null);
                      }}
                      style={{
                        background: SAGE, color: WHITE, border: "none", borderRadius: 8,
                        padding: "7px 14px", fontSize: "0.76rem", fontWeight: 600,
                        cursor: restoring === r.id ? "wait" : "pointer", flexShrink: 0,
                        fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.06em",
                      }}
                    >
                      {restoring === r.id ? "Restoring…" : "Restore"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
