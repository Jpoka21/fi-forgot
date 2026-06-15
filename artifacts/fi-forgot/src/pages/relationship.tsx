import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import AppNav from "@/components/layout/AppNav";
import RelationshipTimeline from "@/components/RelationshipTimeline";
import { useAuth } from "@/lib/auth-context";
import {
  getRecipient,
  getCards,
  getApiHeaders,
  saveRecipient,
  Recipient,
  CustomDate,
  CardOrder,
} from "@/lib/data";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const BG     = "#F2E6D3";
const RED    = "#E23B2E";
const BLACK  = "#111111";
const SAGE   = "#5B8C6B";
const GRAY   = "#6B6B6B";
const BORDER = "#E5E0D8";
const WHITE  = "#FFFFFF";
const CREAM  = "#FDF7EF";
const AMBER  = "#D97706";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FreshUpdate {
  id: string;
  questionKey: string;
  questionText: string;
  answerText: string;
  daysAgo: number;
  ageCategory: "recent" | "mid" | "older";
  createdAt: string;
}

interface NextQuestion {
  fieldKey: string;
  fieldLabel: string;
  category: string;
  priority: string;
  question: string;
  reason: string;
  mode: "profile_gap" | "fresh_update" | "follow_up";
  followUp?: { id: string; originalAnswer: string; category: string };
}

interface HealthScore {
  recipientId: string;
  name: string;
  score: number;
  status: "Excellent" | "Healthy" | "NeedsAttention" | "Priority";
  nextEventLabel: string | null;
  nextEventDaysAway: number | null;
  lastUpdateDaysAgo: number | null;
  pendingFollowUps: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const HOLIDAY_DATES: Record<string, { month: number; day: number }> = {
  "Valentine's Day": { month: 2,  day: 14 },
  "Mother's Day":    { month: 5,  day: 12 },
  "Father's Day":    { month: 6,  day: 16 },
  "Thanksgiving":    { month: 11, day: 28 },
  "Christmas":       { month: 12, day: 25 },
  "Hanukkah":        { month: 12, day: 26 },
  "New Year's":      { month: 1,  day: 1  },
  "Easter":          { month: 4,  day: 20 },
};

const DATE_SENSITIVE_EVENTS = [
  { label: "Birthday",         emoji: "🎂" },
  { label: "Anniversary",      emoji: "💑" },
  { label: "Work Anniversary", emoji: "💼" },
  { label: "Graduation",       emoji: "🎓" },
  { label: "Just Because",     emoji: "💌" },
] as const;

const HOLIDAY_EVENTS = [
  { label: "Valentine's Day", emoji: "💝", flag: "needsValentinesDay"    as const },
  { label: "Mother's Day",    emoji: "👩", flag: "needsMothersDay"       as const },
  { label: "Father's Day",    emoji: "👔", flag: "needsFathersDay"       as const },
  { label: "Thanksgiving",    emoji: "🦃", flag: "needsThanksgiving"     as const },
  { label: "Christmas",       emoji: "🎄", flag: "needsChristmasHanukkah" as const },
  { label: "New Year's",      emoji: "🥂", flag: "needsNewYears"         as const },
  { label: "Easter",          emoji: "🐣", flag: "needsEaster"           as const },
] as const;

function isTrackedEvent(event: string, r: Recipient): boolean {
  if (event === "Birthday") return !!r.birthday;
  if (event === "Anniversary") return !!(r.anniversaryDate ?? r.marriageDate);
  if (event === "Work Anniversary" || event === "Graduation" || event === "Just Because") {
    return (r.selectedEvents ?? []).includes(event);
  }
  const found = HOLIDAY_EVENTS.find(e => e.label === event);
  return found ? !!r[found.flag] : false;
}

function getEventDate(event: string, r: Recipient): string | null {
  const now = new Date(); const year = now.getFullYear();
  const pad = (n: number) => String(n).padStart(2, "0");
  const next = (stored: string) => {
    const p = stored.split("-").map(Number);
    let d = new Date(year, (p[1] ?? 1) - 1, p[2] ?? 1);
    if (d < now) d = new Date(year + 1, (p[1] ?? 1) - 1, p[2] ?? 1);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  if (event === "Birthday" && r.birthday) return next(r.birthday);
  if (event === "Anniversary") {
    const src = (r as any).anniversaryDate ?? (r as any).marriageDate;
    if (src) return next(src);
  }
  const custom = (r as any).customDates?.find((c: any) => c.label === event);
  if (custom?.date) return next(custom.date);
  const fixed = HOLIDAY_DATES[event];
  if (fixed) {
    return next(`${year}-${pad(fixed.month)}-${pad(fixed.day)}`);
  }
  return null;
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr + "T12:00:00");
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}

function daysLabel(n: number): string {
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  return `${n} days`;
}

function formatDaysAgo(n: number): string {
  if (n === 0) return "Today";
  if (n === 1) return "Yesterday";
  if (n < 30) return `${n}d ago`;
  if (n < 60) return "~1 month ago";
  return `${Math.round(n / 30)} months ago`;
}

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map(n => n[0] ?? "").join("").toUpperCase();
}

const INTEREST_LABELS: Record<string, string> = {
  family: "Family & kids",  travel: "Travel & adventure", food: "Food & cooking",
  reading: "Reading",       fitness: "Fitness",           music: "Music & arts",
  animals: "Animals & pets", nature: "Nature & outdoors", movies: "Movies & TV",
  fashion: "Fashion & style",
};

// ── Small sub-components ──────────────────────────────────────────────────────

function SectionHead({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: 12,
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem",
        letterSpacing: "0.08em", color: BLACK,
      }}>
        {title}
      </div>
      {right}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function OutlineBtn({ children, onClick, href }: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
}) {
  const style: React.CSSProperties = {
    padding: "5px 12px", borderRadius: 7,
    border: `1px solid ${BORDER}`, background: "none",
    color: GRAY, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
  };
  if (href) {
    return <Link href={href}><button style={style}>{children}</button></Link>;
  }
  return <button style={style} onClick={onClick}>{children}</button>;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function RelationshipPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [, setLocation] = useLocation();
  const { authReady } = useAuth();

  // ── State ───────────────────────────────────────────────────────────────────
  const [recipient, setRecipient]         = useState<Recipient | undefined>();
  const [cards, setCards]                 = useState<CardOrder[]>([]);
  const [freshUpdates, setFreshUpdates]   = useState<FreshUpdate[]>([]);
  const [freshLoading, setFreshLoading]   = useState(true);
  const [nextQuestion, setNextQuestion]   = useState<NextQuestion | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [healthScore, setHealthScore]     = useState<HealthScore | null>(null);
  const [showAllMemories, setShowAllMemories] = useState(false);
  const [showTimeline, setShowTimeline]       = useState(false);

  // Add event
  const [showAddEvent, setShowAddEvent]     = useState(false);
  const [selectedEventChip, setSelectedEventChip] = useState<string | null>(null);
  const [newEventDate, setNewEventDate]           = useState("");
  const [savingEvent, setSavingEvent]             = useState(false);

  // Add memory
  const [memoryText, setMemoryText]       = useState("");
  const [savingMemory, setSavingMemory]   = useState(false);
  const [memorySaved, setMemorySaved]     = useState(false);

  // Question answer
  const [answerText, setAnswerText]       = useState("");
  const [savingAnswer, setSavingAnswer]   = useState(false);
  const [answerSaved, setAnswerSaved]     = useState(false);
  const [questionSkipped, setQuestionSkipped] = useState(false);

  // ── Load local data (recipient blob + cards) ────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const r = getRecipient(id);
    setRecipient(r);
    const all = getCards().filter(c => String(c.recipientId) === String(id));
    all.sort((a, b) => {
      const o: Record<string, number> = { "Ready for approval": 0, "Approved": 1 };
      return (o[a.status] ?? 2) - (o[b.status] ?? 2);
    });
    setCards(all);
  }, [id]);

  // ── Fresh updates ───────────────────────────────────────────────────────────
  function loadFreshUpdates() {
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"] || !id) { setFreshLoading(false); return; }
    setFreshLoading(true);
    fetch(`/api/v2/recipients/${id}/fresh-updates`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((d: { freshUpdates: FreshUpdate[] }) => setFreshUpdates(d.freshUpdates ?? []))
      .catch(() => setFreshUpdates([]))
      .finally(() => setFreshLoading(false));
  }
  useEffect(() => { loadFreshUpdates(); }, [id]);

  // ── Next question ───────────────────────────────────────────────────────────
  function loadNextQuestion() {
    const headers = getApiHeaders() as Record<string, string>;
    if (!id) return;
    if (!headers["x-user-id"]) {
      console.debug("[relationship] loadNextQuestion: x-user-id not ready yet, will retry when authReady");
      return;
    }
    fetch(`/api/v2/recipients/${id}/next-question`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((d: { nextQuestion: NextQuestion | null; profileComplete: boolean }) => {
        setNextQuestion(d.nextQuestion ?? null);
        setProfileComplete(d.profileComplete ?? false);
      })
      .catch((err: unknown) => {
        console.warn("[relationship] loadNextQuestion failed:", err);
      });
  }
  // Re-run whenever id changes OR authReady flips — authReady becoming true means
  // _serverUserId has been stamped into data.ts and getApiHeaders() now has x-user-id.
  useEffect(() => { loadNextQuestion(); }, [id, authReady]);

  // ── Health score ────────────────────────────────────────────────────────────
  useEffect(() => {
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"] || !recipient?.name) return;
    fetch("/api/v2/recipient-health", { headers })
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then((d: { scores: HealthScore[] }) => {
        const m = d.scores.find(s =>
          s.name.trim().toLowerCase() === recipient.name.trim().toLowerCase()
        );
        setHealthScore(m ?? null);
      })
      .catch(() => {});
  }, [recipient?.name]);

  // ── Add event ────────────────────────────────────────────────────────────────
  function handleAddHolidayEvent(label: string, flag: keyof Recipient) {
    if (!recipient) return;
    const sel = recipient.selectedEvents ?? [];
    const updated: Recipient = {
      ...recipient,
      [flag]: true,
      selectedEvents: sel.includes(label) ? sel : [...sel, label],
    };
    saveRecipient(updated);
    setRecipient(updated);
    setShowAddEvent(false);
    setSelectedEventChip(null);
  }

  function handleRemoveEvent(label: string) {
    if (!recipient) return;
    const holidayEntry = HOLIDAY_EVENTS.find(e => e.label === label);
    const updated: Recipient = {
      ...recipient,
      ...(holidayEntry ? { [holidayEntry.flag]: false } : {}),
      selectedEvents: (recipient.selectedEvents ?? []).filter(e => e !== label),
    };
    saveRecipient(updated);
    setRecipient(updated);
  }

  function handleAddDateEvent() {
    if (!recipient || !selectedEventChip || !newEventDate) return;
    setSavingEvent(true);
    const event = selectedEventChip;
    const sel = recipient.selectedEvents ?? [];
    let updated: Recipient = { ...recipient };

    if (event === "Birthday") {
      updated = { ...updated, birthday: newEventDate,
        selectedEvents: sel.includes("Birthday") ? sel : [...sel, "Birthday"] };
    } else if (event === "Anniversary") {
      updated = { ...updated, anniversaryDate: newEventDate, marriageDate: newEventDate,
        selectedEvents: sel.includes("Anniversary") ? sel : [...sel, "Anniversary"] };
    } else {
      const cd: CustomDate = {
        id: `${event.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        label: event, date: newEventDate,
      };
      updated = { ...updated,
        customDates: [...(recipient.customDates ?? []), cd],
        selectedEvents: sel.includes(event) ? sel : [...sel, event],
      };
    }

    saveRecipient(updated);
    setRecipient(updated);
    setNewEventDate("");
    setSelectedEventChip(null);
    setShowAddEvent(false);
    setSavingEvent(false);
  }

  // ── Save memory ─────────────────────────────────────────────────────────────
  async function handleSaveMemory() {
    if (!memoryText.trim() || !id) return;
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;
    setSavingMemory(true);
    try {
      const res = await fetch(`/api/v2/recipients/${id}/answer-question`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          fieldKey:     "freeform_memory",
          questionText: `What would you like us to remember about ${firstName}?`,
          answerText:   memoryText.trim(),
          triggerType:  "fresh_update",
        }),
      });
      if (res.ok) {
        setMemoryText("");
        setMemorySaved(true);
        setTimeout(() => setMemorySaved(false), 3000);
        loadFreshUpdates();
        window.dispatchEvent(new Event("recipient-answer-saved"));
      }
    } catch { /* non-fatal */ }
    finally { setSavingMemory(false); }
  }

  // ── Save question answer ────────────────────────────────────────────────────
  async function handleSaveAnswer() {
    if (!answerText.trim() || !nextQuestion || !id) return;
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;
    setSavingAnswer(true);
    try {
      const body: Record<string, string> = {
        fieldKey:     nextQuestion.fieldKey,
        questionText: nextQuestion.question,
        answerText:   answerText.trim(),
        triggerType:  nextQuestion.mode === "follow_up" ? "follow_up" : nextQuestion.mode,
      };
      if (nextQuestion.mode === "follow_up" && nextQuestion.followUp?.id) {
        body.followUpId = nextQuestion.followUp.id;
      }
      const res = await fetch(`/api/v2/recipients/${id}/answer-question`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setAnswerSaved(true);
        setTimeout(() => {
          setAnswerText("");
          setAnswerSaved(false);
          setNextQuestion(null);
          setQuestionSkipped(false);
          loadNextQuestion();
          if (nextQuestion.mode === "fresh_update") loadFreshUpdates();
          window.dispatchEvent(new Event("recipient-answer-saved"));
        }, 1400);
      }
    } catch { /* non-fatal */ }
    finally { setSavingAnswer(false); }
  }

  // ── Computed ────────────────────────────────────────────────────────────────
  const firstName = recipient?.name.split(" ")[0] ?? "them";

  const allTrackedEventData = (() => {
    if (!recipient) return [];
    const today = new Date();
    const withDate: { event: string; dateStr: string; daysAway: number }[] = [];
    const noDate:   { event: string; dateStr: null; daysAway: null }[] = [];
    for (const event of (recipient.selectedEvents ?? [])) {
      const dateStr = getEventDate(event, recipient);
      if (!dateStr) { noDate.push({ event, dateStr: null, daysAway: null }); continue; }
      const d = new Date(dateStr + "T12:00:00");
      if (d < today) continue;
      withDate.push({ event, dateStr, daysAway: daysUntil(dateStr) });
    }
    withDate.sort((a, b) => a.daysAway - b.daysAway);
    return [...withDate, ...noDate];
  })();

  const upcomingEvents  = allTrackedEventData.filter((e): e is { event: string; dateStr: string; daysAway: number } => e.daysAway !== null && e.daysAway <= 60);
  const futureEvents    = allTrackedEventData.filter((e): e is { event: string; dateStr: string; daysAway: number } => e.daysAway !== null && e.daysAway > 60);
  const eventsNeedingDate = allTrackedEventData.filter(e => e.daysAway === null);

  const nextEvent = upcomingEvents[0] ?? futureEvents[0] ?? null;

  const statusColor = healthScore
    ? { Excellent: "#166534", Healthy: SAGE, NeedsAttention: AMBER, Priority: RED }[healthScore.status] ?? SAGE
    : GRAY;

  const displayedMemories = showAllMemories ? freshUpdates : freshUpdates.slice(0, 4);

  const ageBorderColor = (cat: FreshUpdate["ageCategory"]) =>
    cat === "recent" ? SAGE : cat === "mid" ? AMBER : GRAY;

  // ── Profile fields for What We Know ────────────────────────────────────────
  const profileFields = recipient ? [
    {
      key: "THINGS TO AVOID",
      value: (recipient as any).thingsToAvoid as string | undefined,
      highlight: true,
    },
    {
      key: "TONE",
      value: (recipient as any).tonePreference as string | undefined,
    },
    {
      key: "INTERESTS",
      value: Array.isArray((recipient as any).interests) && (recipient as any).interests.length > 0
        ? ((recipient as any).interests as string[]).map(i => INTEREST_LABELS[i] ?? i).join(", ")
        : undefined,
    },
    {
      key: "FAVORITE MEMORIES",
      value: (recipient as any).favoriteMemories as string | undefined,
    },
    {
      key: "INSIDE JOKES",
      value: (recipient as any).insideJokes as string | undefined,
    },
    {
      key: "ALWAYS INCLUDE",
      value: ((recipient as any).alwaysInclude ?? (recipient as any).thingsToAlwaysInclude) as string | undefined,
    },
    {
      key: "DELIVERY",
      value: (recipient as any).deliveryPreference as string | undefined,
    },
  ].filter(f => f.value) : [];

  // ── Loading state ───────────────────────────────────────────────────────────
  if (!recipient) {
    return (
      <>
        <AppNav />
        <div style={{
          background: BG, minHeight: "100vh", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem", color: GRAY }}>
            Loading…
          </div>
        </div>
      </>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <AppNav />
      <div style={{ background: BG, minHeight: "100vh" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px 80px", boxSizing: "border-box" as const }}>

          {/* ── Back ──────────────────────────────────────────────────────────── */}
          <div style={{ padding: "16px 0 8px" }}>
            <Link href="/dashboard">
              <button style={{
                background: "none", border: "none", cursor: "pointer",
                color: GRAY, fontSize: "0.8rem", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4, padding: 0,
              }}>
                ← Dashboard
              </button>
            </Link>
          </div>

          {/* ══ 1. HERO ══════════════════════════════════════════════════════════ */}
          <div style={{
            background: BLACK, borderRadius: 20, padding: "26px 22px",
            marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              {/* Avatar */}
              <div style={{
                width: 62, height: 62, borderRadius: "50%",
                background: `${RED}22`, border: `2px solid ${RED}50`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: WHITE }}>
                  {initials(recipient.name)}
                </span>
              </div>

              {/* Name + badges */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Bebas Neue', cursive", fontSize: "2.1rem",
                  color: WHITE, lineHeight: 1, letterSpacing: "0.02em",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
                }}>
                  {recipient.name.toUpperCase()}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginTop: 5 }}>
                  <span style={{
                    padding: "2px 10px", borderRadius: 20,
                    background: `${WHITE}10`, color: `${WHITE}80`,
                    fontSize: "0.76rem", fontWeight: 600,
                  }}>
                    {(recipient as any).relationship}
                  </span>
                  {nextEvent && (
                    <span style={{
                      padding: "2px 10px", borderRadius: 20,
                      background: nextEvent.daysAway <= 14 ? `${RED}25` : `${WHITE}08`,
                      border: nextEvent.daysAway <= 14 ? `1px solid ${RED}50` : "none",
                      color: nextEvent.daysAway <= 14 ? RED : `${WHITE}60`,
                      fontSize: "0.74rem", fontWeight: 700,
                    }}>
                      {nextEvent.event} · {daysLabel(nextEvent.daysAway)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
              <button
                onClick={() => {
                  const el = document.getElementById("add-memory-input");
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                  setTimeout(() => (el as HTMLTextAreaElement | null)?.focus(), 400);
                }}
                style={{
                  padding: "9px 18px", borderRadius: 9, border: "none",
                  background: SAGE, color: WHITE, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
                }}
              >
                ✨ Personalize
              </button>
              <Link href={`/recipients/${id}?edit=1`}>
                <button style={{
                  padding: "9px 18px", borderRadius: 9,
                  border: `1px solid ${WHITE}20`, background: "transparent",
                  color: `${WHITE}70`, fontWeight: 600,
                  fontSize: "0.82rem", cursor: "pointer",
                }}>
                  Card Questions
                </button>
              </Link>
            </div>
          </div>

          {/* ══ 0. WE'LL SEND CARDS FOR THESE OCCASIONS ═══════════════════════════ */}
          <div style={{ marginBottom: 24 }}>
            <SectionHead
              title="WE'LL SEND CARDS FOR THESE OCCASIONS"
              right={
                <button
                  onClick={() => { setShowAddEvent(v => !v); setSelectedEventChip(null); setNewEventDate(""); }}
                  style={{ fontSize: "0.76rem", fontWeight: 700, color: SAGE, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  {showAddEvent ? "Done" : "+ Add Occasion"}
                </button>
              }
            />

            {/* Tracked occasion chips — always visible */}
            {(() => {
              const allOccasions = [
                ...DATE_SENSITIVE_EVENTS,
                ...HOLIDAY_EVENTS.map(e => ({ label: e.label, emoji: e.emoji })),
              ];
              const tracked = allOccasions.filter(e => isTrackedEvent(e.label, recipient));
              if (tracked.length === 0 && !showAddEvent) {
                return (
                  <div style={{ background: WHITE, borderRadius: 12, border: `1px dashed ${BORDER}`, padding: "20px 16px", textAlign: "center" as const }}>
                    <div style={{ fontSize: "0.84rem", color: GRAY, marginBottom: 10 }}>
                      No occasions added yet.
                    </div>
                    <button
                      onClick={() => setShowAddEvent(true)}
                      style={{ fontSize: "0.78rem", color: SAGE, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
                    >
                      + Add Occasion
                    </button>
                  </div>
                );
              }
              if (tracked.length === 0) return null;
              return (
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: showAddEvent ? 12 : 0 }}>
                  {tracked.map(e => (
                    <div key={e.label} style={{
                      padding: "7px 14px", borderRadius: 20,
                      background: SAGE, border: `1.5px solid ${SAGE}`,
                      color: WHITE, fontWeight: 600, fontSize: "0.82rem",
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      {e.emoji} {e.label}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Occasion picker — shown when adding */}
            {showAddEvent && recipient && (
              <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "16px", marginTop: 4 }}>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: selectedEventChip ? 16 : 0 }}>
                  {DATE_SENSITIVE_EVENTS.map(e => {
                    const tracked = isTrackedEvent(e.label, recipient);
                    const selecting = selectedEventChip === e.label;
                    return (
                      <button
                        key={e.label}
                        onClick={() => {
                          if (tracked) { handleRemoveEvent(e.label); }
                          else { setSelectedEventChip(selecting ? null : e.label); setNewEventDate(""); }
                        }}
                        style={{
                          padding: "7px 14px", borderRadius: 20,
                          border: `1.5px solid ${tracked ? SAGE : selecting ? BLACK : BORDER}`,
                          background: tracked ? SAGE : selecting ? BLACK : CREAM,
                          color: tracked || selecting ? WHITE : BLACK,
                          fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 4,
                        }}
                      >
                        {e.emoji} {e.label}
                        {tracked && <span style={{ fontSize: "0.65rem", opacity: 0.8 }}>✓</span>}
                      </button>
                    );
                  })}
                  {HOLIDAY_EVENTS.map(e => {
                    const tracked = isTrackedEvent(e.label, recipient);
                    return (
                      <button
                        key={e.label}
                        onClick={() => {
                          if (tracked) { handleRemoveEvent(e.label); }
                          else { handleAddHolidayEvent(e.label, e.flag); }
                        }}
                        style={{
                          padding: "7px 14px", borderRadius: 20,
                          border: `1.5px solid ${tracked ? SAGE : BORDER}`,
                          background: tracked ? SAGE : CREAM,
                          color: tracked ? WHITE : BLACK,
                          fontWeight: 600, fontSize: "0.82rem", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 4,
                        }}
                      >
                        {e.emoji} {e.label}
                        {tracked && <span style={{ fontSize: "0.65rem", opacity: 0.8 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
                {selectedEventChip && (
                  <div>
                    <div style={{ fontSize: "0.78rem", color: GRAY, marginBottom: 8 }}>
                      When is their {selectedEventChip}?
                    </div>
                    <input
                      type="date"
                      value={newEventDate}
                      onChange={e => setNewEventDate(e.target.value)}
                      style={{
                        padding: "9px 12px", borderRadius: 8, border: `1px solid ${BORDER}`,
                        fontSize: "0.86rem", fontFamily: "'Plus Jakarta Sans', sans-serif",
                        outline: "none", width: "100%", boxSizing: "border-box" as const,
                        background: CREAM, marginBottom: 12,
                      }}
                    />
                    <button
                      onClick={handleAddDateEvent}
                      disabled={!newEventDate || savingEvent}
                      style={{
                        width: "100%", padding: "10px", borderRadius: 8, border: "none",
                        background: !newEventDate ? `${SAGE}50` : SAGE,
                        color: WHITE, fontWeight: 700, fontSize: "0.84rem",
                        cursor: !newEventDate ? "not-allowed" : "pointer",
                      }}
                    >
                      {savingEvent ? "Saving…" : `Add ${selectedEventChip}`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ══ 1. UPCOMING MOMENTS ══════════════════════════════════════════════ */}
          <div style={{ marginBottom: 24 }}>
            <SectionHead title="UPCOMING MOMENTS" />

            {/* ── Upcoming soon (≤ 60 days) ─────────────────────────────────── */}
            {upcomingEvents.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 12 }}>
                {upcomingEvents.map(ev => {
                  const urgent = ev.daysAway <= 7;
                  const near   = ev.daysAway <= 14;
                  const accent = urgent ? RED : near ? AMBER : SAGE;
                  return (
                    <div key={ev.event} style={{
                      background: WHITE, borderRadius: 12,
                      border: `1px solid ${near ? RED + "30" : BORDER}`,
                      borderLeft: `4px solid ${accent}`,
                      padding: "12px 16px",
                      display: "flex", alignItems: "center", gap: 14,
                      boxShadow: urgent ? `0 2px 10px ${RED}15` : "none",
                    }}>
                      {/* Day badge */}
                      <div style={{
                        width: 50, height: 50, borderRadius: 10, flexShrink: 0,
                        background: urgent ? RED : CREAM,
                        border: urgent ? "none" : `1px solid ${BORDER}`,
                        display: "flex", flexDirection: "column" as const,
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", color: urgent ? WHITE : BLACK, lineHeight: 1 }}>{ev.daysAway}</div>
                        <div style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.06em", color: urgent ? "#ffffff80" : GRAY }}>DAYS</div>
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.94rem", color: BLACK }}>{ev.event}</div>
                        <div style={{ fontSize: "0.76rem", color: GRAY, marginTop: 3 }}>{fmtDate(ev.dateStr)}</div>
                      </div>
                      {/* Actions */}
                      <div style={{ display: "flex", flexDirection: "column" as const, gap: 5, alignItems: "flex-end", flexShrink: 0 }}>
                        <button
                          onClick={() => setLocation(`/briefings/${id}/${encodeURIComponent(ev.event)}`)}
                          style={{
                            padding: "6px 13px", borderRadius: 7, cursor: "pointer",
                            border: "none", background: accent,
                            color: WHITE, fontWeight: 700, fontSize: "0.7rem", whiteSpace: "nowrap" as const,
                          }}
                        >
                          Write Card ✦
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── On the calendar (> 60 days) ───────────────────────────────── */}
            {futureEvents.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: "0.66rem", fontWeight: 700, color: GRAY, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 7 }}>
                  On the calendar
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                  {futureEvents.map(ev => (
                    <div key={ev.event} style={{
                      background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`,
                      padding: "9px 14px", display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <div style={{ flex: 1, fontWeight: 600, fontSize: "0.86rem", color: BLACK }}>{ev.event}</div>
                      <div style={{ fontSize: "0.76rem", color: GRAY }}>{fmtDate(ev.dateStr)}</div>
                      <div style={{ fontSize: "0.72rem", color: `${BLACK}40`, minWidth: 50, textAlign: "right" as const }}>{ev.daysAway}d</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Needs a date ──────────────────────────────────────────────── */}
            {eventsNeedingDate.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: "0.66rem", fontWeight: 700, color: AMBER, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 7 }}>
                  Needs a date
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                  {eventsNeedingDate.map(ev => (
                    <div key={ev.event} style={{
                      background: `${AMBER}08`, borderRadius: 10, border: `1px solid ${AMBER}30`,
                      padding: "9px 14px", display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <div style={{ flex: 1, fontWeight: 600, fontSize: "0.86rem", color: BLACK }}>{ev.event}</div>
                      <button
                        onClick={() => { setShowAddEvent(true); setSelectedEventChip(ev.event); setNewEventDate(""); }}
                        style={{
                          padding: "5px 11px", borderRadius: 7, cursor: "pointer",
                          border: `1.5px solid ${AMBER}`, background: "transparent",
                          color: AMBER, fontWeight: 700, fontSize: "0.7rem", whiteSpace: "nowrap" as const,
                        }}
                      >
                        Set Date →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Empty state ───────────────────────────────────────────────── */}
            {upcomingEvents.length === 0 && futureEvents.length === 0 && eventsNeedingDate.length === 0 && (
              <div style={{ background: WHITE, borderRadius: 12, border: `1px dashed ${BORDER}`, padding: "20px 16px", textAlign: "center" as const }}>
                <div style={{ fontSize: "0.84rem", color: GRAY }}>Add occasions above to see upcoming moments here.</div>
              </div>
            )}

          </div>

          {/* ══ 2. RECENT MEMORIES ═══════════════════════════════════════════════ */}
          <div style={{ marginBottom: 24 }}>
            <SectionHead title="RECENT MEMORIES" />

            {/* Add memory box */}
            <Card style={{ padding: "16px", marginBottom: 10 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: GRAY, marginBottom: 8, letterSpacing: "0.04em" }}>
                WHAT'S NEW WITH {firstName.toUpperCase()}?
              </div>
              <textarea
                id="add-memory-input"
                value={memoryText}
                onChange={e => setMemoryText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSaveMemory(); }}
                placeholder={
                  `${firstName} started a new job.\n` +
                  `We took a trip to Vermont.\n` +
                  `${firstName}'s daughter graduated.\n` +
                  `We had a great dinner together last week.`
                }
                rows={3}
                style={{
                  width: "100%", borderRadius: 8, border: `1px solid ${BORDER}`,
                  padding: "10px 12px", fontSize: "0.9rem", lineHeight: 1.6,
                  background: CREAM, resize: "vertical" as const, outline: "none",
                  fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK,
                  boxSizing: "border-box" as const,
                }}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: "0.71rem", color: memorySaved ? SAGE : GRAY, fontWeight: memorySaved ? 600 : 400 }}>
                  {memorySaved
                    ? `✓ Saved — we'll use this in ${firstName}'s next card.`
                    : "This improves all future cards for this person."}
                </span>
                <button
                  onClick={handleSaveMemory}
                  disabled={savingMemory || !memoryText.trim()}
                  style={{
                    padding: "7px 16px", borderRadius: 8, border: "none",
                    background: memoryText.trim() ? SAGE : `${SAGE}40`,
                    color: WHITE, fontWeight: 700, fontSize: "0.78rem",
                    cursor: memoryText.trim() ? "pointer" : "default",
                    flexShrink: 0,
                  }}
                >
                  {savingMemory ? "Saving…" : "Save"}
                </button>
              </div>
            </Card>

            {/* Memory list */}
            {freshLoading ? (
              <div style={{ padding: "12px 0", fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY }}>
                Loading memories…
              </div>
            ) : freshUpdates.length === 0 ? (
              <Card style={{ padding: "20px 16px", textAlign: "center" as const }}>
                <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, lineHeight: 1.7 }}>
                  No memories yet. Add one above<br />and it'll show up in {firstName}'s next card.
                </div>
              </Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                {displayedMemories.map(m => (
                  <div
                    key={m.id}
                    style={{
                      background: WHITE, borderRadius: 10,
                      border: `1px solid ${BORDER}`,
                      borderLeft: `3px solid ${ageBorderColor(m.ageCategory)}`,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{
                      fontFamily: "'Caveat', cursive",
                      fontSize: "1rem", color: BLACK, lineHeight: 1.65,
                    }}>
                      {m.answerText}
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      marginTop: 7, fontSize: "0.71rem", color: GRAY,
                    }}>
                      <span>{formatDaysAgo(m.daysAgo)}</span>
                      {m.ageCategory === "recent" && (
                        <span style={{
                          padding: "1px 7px", borderRadius: 10,
                          background: `${SAGE}15`, color: SAGE,
                          fontWeight: 700, fontSize: "0.67rem",
                        }}>
                          Used in cards
                        </span>
                      )}
                      {m.ageCategory === "mid" && (
                        <span style={{
                          padding: "1px 7px", borderRadius: 10,
                          background: `${AMBER}15`, color: AMBER,
                          fontWeight: 600, fontSize: "0.67rem",
                        }}>
                          Aging out soon
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {freshUpdates.length > 4 && (
                  <button
                    onClick={() => setShowAllMemories(v => !v)}
                    style={{
                      background: "none", border: `1px solid ${BORDER}`,
                      borderRadius: 8, padding: "8px",
                      fontSize: "0.78rem", color: GRAY, cursor: "pointer", fontWeight: 600,
                    }}
                  >
                    {showAllMemories
                      ? "Show fewer"
                      : `Show all ${freshUpdates.length} memories`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ══ 3. SUGGESTED QUESTION ════════════════════════════════════════════ */}
          {nextQuestion && !questionSkipped && (
            <div style={{
              background: WHITE, borderRadius: 14, padding: "18px",
              border: `1.5px solid ${nextQuestion.mode === "follow_up" ? "#7C3AED35" : `${RED}25`}`,
              marginBottom: 24,
            }}>
              {/* Header row */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 10,
              }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY }}>
                  {nextQuestion.mode === "follow_up"
                    ? "FOLLOW UP"
                    : profileComplete
                      ? "KEEP IT FRESH"
                      : "WANT TO MAKE THE NEXT CARD EVEN BETTER?"}
                </div>
                <button
                  onClick={() => setQuestionSkipped(true)}
                  style={{
                    background: "none", border: "none", color: GRAY,
                    cursor: "pointer", fontSize: "0.78rem", padding: 0, fontWeight: 600,
                  }}
                >
                  Skip
                </button>
              </div>

              {/* Follow-up context */}
              {nextQuestion.mode === "follow_up" && nextQuestion.followUp && (
                <div style={{
                  background: "#7C3AED0A", borderRadius: 8, padding: "8px 12px",
                  marginBottom: 10, fontSize: "0.78rem",
                  color: "#7C3AED", fontStyle: "italic", lineHeight: 1.5,
                }}>
                  You mentioned: "{nextQuestion.followUp.originalAnswer.slice(0, 80)}{nextQuestion.followUp.originalAnswer.length > 80 ? "…" : ""}"
                </div>
              )}

              {/* Question text */}
              <div style={{
                fontSize: "1rem", fontWeight: 700, color: BLACK,
                marginBottom: 5, lineHeight: 1.5,
              }}>
                {nextQuestion.question}
              </div>
              <div style={{
                fontSize: "0.77rem", color: GRAY, marginBottom: 12,
                fontStyle: "italic", lineHeight: 1.5,
              }}>
                {nextQuestion.reason}
              </div>

              {/* Answer input */}
              {!answerSaved ? (
                <>
                  <textarea
                    value={answerText}
                    onChange={e => setAnswerText(e.target.value)}
                    placeholder="Your answer…"
                    rows={3}
                    style={{
                      width: "100%", borderRadius: 8, border: `1px solid ${BORDER}`,
                      padding: "10px 12px", fontSize: "0.9rem", lineHeight: 1.6,
                      background: CREAM, resize: "vertical" as const, outline: "none",
                      fontFamily: "'Plus Jakarta Sans', sans-serif", color: BLACK,
                      boxSizing: "border-box" as const, marginBottom: 8,
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button
                      onClick={() => setQuestionSkipped(true)}
                      style={{
                        padding: "7px 14px", borderRadius: 8,
                        border: `1px solid ${BORDER}`, background: "transparent",
                        color: GRAY, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer",
                      }}
                    >
                      Not now
                    </button>
                    <button
                      onClick={handleSaveAnswer}
                      disabled={savingAnswer || !answerText.trim()}
                      style={{
                        padding: "7px 16px", borderRadius: 8, border: "none",
                        background: answerText.trim() ? RED : `${RED}40`,
                        color: WHITE, fontWeight: 700, fontSize: "0.78rem",
                        cursor: answerText.trim() ? "pointer" : "default",
                      }}
                    >
                      {savingAnswer ? "Saving…" : "Save Answer"}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{
                  padding: "12px", borderRadius: 8, background: `${SAGE}12`,
                  color: SAGE, fontWeight: 700, fontSize: "0.86rem", textAlign: "center" as const,
                }}>
                  ✓ Saved — this will improve {firstName}'s next card.
                </div>
              )}
            </div>
          )}

          {/* ══ 4. WHAT WE KNOW ══════════════════════════════════════════════════ */}
          <div style={{ marginBottom: 24 }}>
            <SectionHead
              title="WHAT WE KNOW"
              right={<OutlineBtn href={`/recipients/${id}?edit=1`}>Edit Profile</OutlineBtn>}
            />
            <Card>
              {profileFields.length === 0 ? (
                <div style={{ padding: "20px 16px", textAlign: "center" as const }}>
                  <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: GRAY, marginBottom: 12 }}>
                    No profile details yet.
                  </div>
                  <Link href={`/recipients/${id}?edit=1`}>
                    <button style={{
                      padding: "7px 16px", borderRadius: 8,
                      border: `1px solid ${BORDER}`, background: "none",
                      color: BLACK, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer",
                    }}>
                      Add Profile Details →
                    </button>
                  </Link>
                </div>
              ) : (
                profileFields.map((f, i) => (
                  <div
                    key={f.key}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 16px",
                      borderBottom: i < profileFields.length - 1 ? `1px solid ${BORDER}` : "none",
                      background: f.highlight ? `${RED}04` : "transparent",
                    }}
                  >
                    <div style={{
                      width: 112, flexShrink: 0, fontSize: "0.67rem",
                      fontWeight: 700, letterSpacing: "0.07em",
                      color: f.highlight ? RED : GRAY, paddingTop: 2,
                    }}>
                      {f.key}
                    </div>
                    <div style={{ fontSize: "0.88rem", color: BLACK, lineHeight: 1.6 }}>
                      {String(f.value)}
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>

          {/* ══ 6. CARD HISTORY ══════════════════════════════════════════════════ */}
          {cards.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <SectionHead title="CARD HISTORY" />
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                {cards.slice(0, 5).map(card => {
                  const sc =
                    card.status === "Approved" ? SAGE :
                    card.status === "Ready for approval" ? AMBER : GRAY;
                  const msg = (card as any).approvedMessage ?? (card as any).messageOriginal ?? "";
                  return (
                    <Card key={card.id} style={{ padding: "12px 16px" }}>
                      <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", marginBottom: msg ? 6 : 0,
                      }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>
                          {(card as any).holiday}
                        </div>
                        <span style={{
                          padding: "2px 9px", borderRadius: 10, fontSize: "0.67rem",
                          fontWeight: 700, letterSpacing: "0.04em",
                          background: `${sc}15`, color: sc,
                          textTransform: "uppercase" as const,
                        }}>
                          {card.status}
                        </span>
                      </div>
                      {msg && (
                        <div style={{
                          fontFamily: "'Caveat', cursive", fontSize: "0.9rem",
                          color: GRAY, lineHeight: 1.55,
                          display: "-webkit-box" as const,
                          WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                          overflow: "hidden",
                        }}>
                          {msg.slice(0, 140)}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ 7. TIMELINE ══════════════════════════════════════════════════════ */}
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setShowTimeline(v => !v)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "space-between", background: WHITE,
                border: `1px solid ${BORDER}`, borderRadius: 12,
                padding: "14px 16px", cursor: "pointer", marginBottom: showTimeline ? 8 : 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1rem" }}>📋</span>
                <span style={{
                  fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem",
                  letterSpacing: "0.1em", color: BLACK,
                }}>FULL HISTORY</span>
                <span style={{ fontSize: "0.74rem", color: GRAY }}>— complete memory ledger</span>
              </div>
              <span style={{ fontSize: "0.8rem", color: GRAY }}>{showTimeline ? "▲ collapse" : "▼ expand"}</span>
            </button>
            {showTimeline && <RelationshipTimeline recipientId={id} />}
          </div>

          {/* ══ 8. RELATIONSHIP HEALTH (supporting, not hero) ════════════════════ */}
          {healthScore && (
            <div style={{
              background: WHITE, borderRadius: 12,
              border: `1px solid ${BORDER}`, padding: "14px 16px",
              marginBottom: 24,
            }}>
              <div style={{
                fontFamily: "'Bebas Neue', cursive", fontSize: "0.82rem",
                letterSpacing: "0.1em", color: GRAY, marginBottom: 10,
              }}>
                RELATIONSHIP HEALTH
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ flex: 1, height: 5, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${healthScore.score}%`,
                    background: statusColor, borderRadius: 3,
                    transition: "width 0.5s ease",
                  }} />
                </div>
                <div style={{
                  fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem",
                  color: statusColor, flexShrink: 0,
                }}>
                  {healthScore.score}
                </div>
                <div style={{
                  padding: "2px 10px", borderRadius: 20,
                  background: `${statusColor}15`, color: statusColor,
                  fontSize: "0.72rem", fontWeight: 700,
                }}>
                  {healthScore.status === "NeedsAttention" ? "Needs Attention" : healthScore.status}
                </div>
              </div>
              {healthScore.pendingFollowUps > 0 && (
                <div style={{ fontSize: "0.75rem", color: AMBER, marginTop: 8, fontWeight: 600 }}>
                  ↻ {healthScore.pendingFollowUps} follow-up{healthScore.pendingFollowUps > 1 ? "s" : ""} waiting
                </div>
              )}
              {healthScore.lastUpdateDaysAgo !== null && healthScore.lastUpdateDaysAgo > 90 && (
                <div style={{ fontSize: "0.75rem", color: GRAY, marginTop: 6 }}>
                  No memory update in {Math.round(healthScore.lastUpdateDaysAgo / 30)} months
                  — add one above to improve cards.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
