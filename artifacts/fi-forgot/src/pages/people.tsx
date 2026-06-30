import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { getRecipients, getArchivedRecipients, restoreRecipient, Recipient } from "@/lib/data";
import { computeOverallHealth, type RecipientHealth } from "@/lib/relationship-health";
import { PB, recipientHasThinMemory } from "@/lib/personal-brand";
import { PersonAvatar, SoftCard, PrimaryBtn, AppSection } from "@/components/personal-ui";
import { Plus, Search, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const CREAM  = PB.cream;
const RED    = PB.red;
const INK    = PB.ink;
const MID    = PB.mid;
const WHITE  = PB.white;
const SAGE   = PB.sage;
const BORDER = PB.border;
const AMBER  = PB.amber;

const serif = "'Lora', Georgia, serif";
const sans = "'Plus Jakarta Sans', sans-serif";

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

function healthDot(score: number): string {
  if (score >= 80) return SAGE;
  if (score >= 65) return "#26A69A";
  if (score >= 45) return AMBER;
  if (score >= 25) return "#EF6C00";
  return MID;
}

function occasionLine(event: string, daysAway: number): string {
  if (daysAway === 0) return `${event} is today`;
  if (daysAway === 1) return `${event} is tomorrow`;
  if (daysAway <= 14) return `${event} in ${daysAway} days`;
  return `Next: ${event}`;
}

function warmHint(health: RecipientHealth | undefined, r: Recipient): string | null {
  if (recipientHasThinMemory(r)) {
    return "Help us make future cards better";
  }
  if (!health || health.topGap === "Profile looks great!") return null;
  const gap = health.topGap.toLowerCase();
  if (gap.includes("memory") || gap.includes("memories")) {
    return "A memory or two helps us sound like you";
  }
  if (gap.includes("occasion") || gap.includes("event") || gap.includes("birthday")) {
    return "Add their important dates when you have a moment";
  }
  if (gap.includes("address") || gap.includes("mailing")) {
    return "We'll need an address before we can send";
  }
  return "Help us make future cards better";
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

  const healthById = useMemo(() => {
    if (recipients.length === 0) return new Map<string, RecipientHealth>();
    const h = computeOverallHealth(recipients);
    return new Map(h.recipientHealths.map(rh => [rh.id ?? rh.name, rh]));
  }, [recipients]);

  const filtered = useMemo(() => {
    if (!search.trim()) return recipients;
    const q = search.toLowerCase();
    return recipients.filter(r =>
      r.name.toLowerCase().includes(q) || r.relationship.toLowerCase().includes(q)
    );
  }, [recipients, search]);

  const comingUpSoon = useMemo(() => {
    return filtered
      .map(r => ({ r, next: getNextEventDate(r) }))
      .filter((x): x is { r: Recipient; next: { event: string; daysAway: number } } =>
        x.next != null && x.next.daysAway <= 14)
      .sort((a, b) => a.next.daysAway - b.next.daysAway);
  }, [filtered]);

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

  function PersonCard({ r }: { r: Recipient }) {
    const next   = getNextEventDate(r);
    const health = healthById.get(r.id) ?? healthById.get(r.name);
    const score  = health?.score ?? 0;
    const dot    = healthDot(score);
    const urgent = next && next.daysAway <= 7;
    const hint   = warmHint(health, r);

    return (
      <Link href={`/relationship/${r.id}`} style={{ textDecoration: "none", display: "block" }}>
        <SoftCard
          style={{
            padding: isMobile ? "16px" : "18px 20px",
            cursor: "pointer",
            border: `1px solid ${urgent ? `${RED}25` : BORDER}`,
            transition: "box-shadow 0.15s ease, border-color 0.15s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <PersonAvatar name={r.name} size={isMobile ? 52 : 56} />
              <div style={{
                position: "absolute", bottom: 0, right: 0,
                width: 11, height: 11, borderRadius: "50%",
                background: dot, border: `2px solid ${WHITE}`,
              }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: serif, fontWeight: 600, fontSize: "1.05rem",
                color: INK, lineHeight: 1.25, marginBottom: 4,
              }}>
                {r.name}
              </div>
              <div style={{ fontSize: "0.84rem", color: MID, marginBottom: 8 }}>
                {r.relationship}
              </div>

              {next ? (
                <div style={{
                  display: "inline-block",
                  fontSize: "0.82rem", fontWeight: 500,
                  color: urgent ? RED : INK,
                  background: urgent ? `${RED}08` : `${SAGE}10`,
                  borderRadius: 8, padding: "5px 10px",
                }}>
                  {occasionLine(next.event, next.daysAway)}
                </div>
              ) : (r.selectedEvents?.length ?? 0) > 0 ? (
                <div style={{ fontSize: "0.82rem", color: MID }}>
                  {r.selectedEvents!.length} occasion{r.selectedEvents!.length === 1 ? "" : "s"} on file
                </div>
              ) : (
                <div style={{ fontSize: "0.82rem", color: MID }}>
                  No occasions yet — easy to add
                </div>
              )}

              {hint && (
                <p style={{
                  fontSize: "0.78rem", color: SAGE, margin: "10px 0 0",
                  lineHeight: 1.45, fontWeight: 500,
                }}>
                  {hint}
                </p>
              )}
            </div>

            <ArrowRight size={18} style={{ color: MID, flexShrink: 0, marginTop: 4, opacity: 0.5 }} />
          </div>
        </SoftCard>
      </Link>
    );
  }

  function Group({ title, people }: { title: string; people: Recipient[] }) {
    if (people.length === 0) return null;
    return (
      <section style={{ marginBottom: 32 }}>
        <h2 style={{
          fontFamily: sans, fontSize: "0.72rem", fontWeight: 600,
          letterSpacing: "0.12em", textTransform: "uppercase" as const,
          color: MID, margin: "0 0 12px",
        }}>
          {title}
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 12,
        }}>
          {people.map(r => <PersonCard key={r.id} r={r} />)}
        </div>
      </section>
    );
  }

  return (
    <AppShell>
      <PageShell>

        {/* Header */}
        <header style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginBottom: 28, gap: 16, flexWrap: "wrap" as const,
        }}>
          <div>
            <h1 style={{
              fontFamily: serif, fontSize: isMobile ? "1.75rem" : "2rem",
              fontWeight: 600, color: INK, margin: 0, lineHeight: 1.2,
            }}>
              Your People
            </h1>
            <p style={{ fontSize: "0.95rem", color: MID, margin: "8px 0 0", lineHeight: 1.5 }}>
              The people who matter most.
            </p>
          </div>
          <Link href="/recipients/new">
            <span data-testid="link-add-recipient" style={{ display: "inline-flex" }}>
              <PrimaryBtn style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Plus size={16} /> Add someone
              </PrimaryBtn>
            </span>
          </Link>
        </header>

        {/* Search */}
        {recipients.length > 0 && (
          <div style={{ position: "relative" as const, marginBottom: 28 }}>
            <Search size={16} style={{
              position: "absolute", left: 14, top: "50%",
              transform: "translateY(-50%)", color: MID, pointerEvents: "none",
            }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or relationship…"
              aria-label="Search your people"
              style={{
                width: "100%", padding: "14px 16px 14px 42px",
                background: WHITE, border: `1px solid ${BORDER}`,
                borderRadius: 14, fontSize: "0.9rem", color: INK,
                outline: "none", boxSizing: "border-box" as const,
                fontFamily: sans,
              }}
            />
          </div>
        )}

        {/* Empty state */}
        {recipients.length === 0 && (
          <SoftCard style={{ padding: isMobile ? "48px 24px" : "56px 40px", textAlign: "center" as const }}>
            <div style={{ margin: "0 auto 20px", width: "100%", maxWidth: isMobile ? 220 : 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src="/illustrations/people/005_people_empty_state.webp"
                alt="A warm illustration of a memory box and keepsakes inviting you to add your first person"
                style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
              />
            </div>
            <h2 style={{
              fontFamily: serif, fontSize: "1.5rem", fontWeight: 600,
              color: INK, margin: "0 0 12px",
            }}>
              Add your first person
            </h2>
            <p style={{
              fontSize: "0.95rem", color: MID, maxWidth: 320,
              margin: "0 auto 28px", lineHeight: 1.55,
            }}>
              Start with someone you never want to forget. We'll quietly help you stay connected.
            </p>
            <Link href="/recipients/new">
              <PrimaryBtn>Add your first person</PrimaryBtn>
            </Link>
          </SoftCard>
        )}

        {/* No search results */}
        {recipients.length > 0 && filtered.length === 0 && (
          <SoftCard style={{ padding: "40px 24px", textAlign: "center" as const }}>
            <p style={{ color: MID, fontSize: "0.92rem", margin: 0, lineHeight: 1.5 }}>
              No one matches &ldquo;{search}&rdquo;. Try another name or relationship.
            </p>
          </SoftCard>
        )}

        {/* Coming up soon */}
        {filtered.length > 0 && comingUpSoon.length > 0 && (
          <AppSection title="Coming up soon" sub="A few moments on the horizon.">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {comingUpSoon.map(({ r, next }) => (
                <Link key={`soon-${r.id}`} href={`/relationship/${r.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 12,
                    background: WHITE, border: `1px solid ${BORDER}`,
                  }}>
                    <PersonAvatar name={r.name} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: INK }}>{r.name}</div>
                      <div style={{ fontSize: "0.82rem", color: next.daysAway <= 7 ? RED : MID }}>
                        {occasionLine(next.event, next.daysAway)}
                      </div>
                    </div>
                    <ArrowRight size={16} style={{ color: MID, opacity: 0.4 }} />
                  </div>
                </Link>
              ))}
            </div>
          </AppSection>
        )}

        {/* Grouped lists */}
        {filtered.length > 0 && (
          <>
            <Group title="Family" people={family} />
            <Group title="Friends" people={friends} />
            <Group title="Others" people={other} />
          </>
        )}

        {/* Archived */}
        {archived.length > 0 && (
          <section style={{ marginTop: 40, paddingTop: 28, borderTop: `1px solid ${BORDER}` }}>
            <button
              type="button"
              onClick={() => setShowArchived(s => !s)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "none", border: "none", cursor: "pointer",
                padding: 0, marginBottom: 16, fontFamily: sans,
              }}
            >
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: MID }}>
                Archived ({archived.length})
              </span>
              {showArchived
                ? <ChevronUp size={16} style={{ color: MID }} />
                : <ChevronDown size={16} style={{ color: MID }} />}
            </button>

            {showArchived && (
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 12,
              }}>
                {archived.map(r => (
                  <SoftCard
                    key={r.id}
                    style={{
                      padding: "14px 16px", opacity: 0.85,
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    <PersonAvatar name={r.name} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: INK }}>{r.name}</div>
                      <div style={{ fontSize: "0.78rem", color: MID }}>{r.relationship}</div>
                    </div>
                    <PrimaryBtn
                      variant="outline"
                      accent={SAGE}
                      disabled={restoring === r.id}
                      onClick={() => {
                        setRestoring(r.id);
                        restoreRecipient(r.id);
                        reload();
                        setRestoring(null);
                      }}
                      style={{
                        padding: "8px 14px", fontSize: "0.78rem",
                        borderRadius: 20, flexShrink: 0, fontFamily: sans,
                      }}
                    >
                      {restoring === r.id ? "Restoring…" : "Restore"}
                    </PrimaryBtn>
                  </SoftCard>
                ))}
              </div>
            )}
          </section>
        )}

      </PageShell>
    </AppShell>
  );
}
