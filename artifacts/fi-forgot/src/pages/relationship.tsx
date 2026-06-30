import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import RelationshipTimeline from "@/components/RelationshipTimeline";
import { useAuth } from "@/lib/auth-context";
import {
  getRecipient,
  getCards,
  getApiHeaders,
  saveRecipient,
  getServerUserId,
  Recipient,
  CustomDate,
  CardOrder,
} from "@/lib/data";

import {
  PB, formatBigDate, occasionPhrase, urgencyAccent,
  isSensitiveOccasion, recipientHasThinMemory,
} from "@/lib/personal-brand";
import { PersonAvatar, SoftCard, PrimaryBtn, AppSection, SecondaryBtn } from "@/components/personal-ui";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

const BG       = PB.cream;
const RED      = PB.red;
const BLACK    = PB.ink;
const CHARCOAL = PB.ink;
const SAGE     = PB.sage;
const GRAY     = PB.mid;
const BORDER   = PB.border;
const WHITE    = PB.white;
const CREAM    = "#FDF7EF";
const AMBER    = PB.amber;

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

const INTEREST_LABELS: Record<string, string> = {
  family: "Family & kids",  travel: "Travel & adventure", food: "Food & cooking",
  reading: "Reading",       fitness: "Fitness",           music: "Music & arts",
  animals: "Animals & pets", nature: "Nature & outdoors", movies: "Movies & TV",
  fashion: "Fashion & style",
};

const serif = "'Lora', Georgia, serif";
const sans  = "'Plus Jakarta Sans', sans-serif";

function RelationshipProfileHeaderIllustration() {
  return (
    <div style={{ margin: "0 0 20px", width: "100%", maxWidth: 280, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
      <img
        src="/illustrations/relationship/009_relationship_profile_header.webp"
        alt="A warm illustration of shared keepsakes and memories that celebrate an ongoing relationship"
        style={{ width: "100%", height: "auto", maxHeight: 220, display: "block", objectFit: "contain" }}
      />
    </div>
  );
}

function LoadingRememberingIllustration() {
  return (
    <div style={{ width: "100%", maxWidth: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src="/assets/illustrations/loading/010_loading_remembering.webp"
        alt="Dave quietly remembering the details of your relationship"
        style={{ width: "100%", height: "auto", maxHeight: 220, display: "block", objectFit: "contain" }}
      />
    </div>
  );
}

// ── Small sub-components ──────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <SoftCard style={style}>
      {children}
    </SoftCard>
  );
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
    const serverUserId = getServerUserId();
    const all = getCards().filter(c =>
      String(c.recipientId) === String(id) &&
      (serverUserId ? c.userId === serverUserId : true)
    );
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

  // Map event name → existing ready/approved card for this recipient
  const cardByEvent = new Map(
    cards
      .filter(c => c.status === "Ready for approval" || c.status === "Approved")
      .map(c => [c.holiday, c])
  );

  const statusColor = healthScore
    ? { Excellent: "#166534", Healthy: SAGE, NeedsAttention: AMBER, Priority: RED }[healthScore.status] ?? SAGE
    : GRAY;

  const displayedMemories = showAllMemories ? freshUpdates : freshUpdates.slice(0, 4);

  const ageBorderColor = (cat: FreshUpdate["ageCategory"]) =>
    cat === "recent" ? SAGE : cat === "mid" ? AMBER : GRAY;

  // ── Profile fields for What We Know ────────────────────────────────────────
  const profileFields = recipient ? [
    {
      key: "Tone",
      value: (recipient as any).tonePreference as string | undefined,
    },
    {
      key: "Interests",
      value: Array.isArray((recipient as any).interests) && (recipient as any).interests.length > 0
        ? ((recipient as any).interests as string[]).map(i => INTEREST_LABELS[i] ?? i).join(", ")
        : undefined,
    },
    {
      key: "Favorite memories",
      value: (recipient as any).favoriteMemories as string | undefined,
    },
    {
      key: "Inside jokes",
      value: (recipient as any).insideJokes as string | undefined,
    },
    {
      key: "Always include",
      value: ((recipient as any).alwaysInclude ?? (recipient as any).thingsToAlwaysInclude) as string | undefined,
    },
    {
      key: "Delivery",
      value: (recipient as any).deliveryPreference as string | undefined,
    },
  ].filter(f => f.value) : [];

  // ── Loading state ───────────────────────────────────────────────────────────
  if (!recipient) {
    return (
      <AppShell>
        <div style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: sans,
          gap: 16,
          padding: "48px 24px",
        }}>
          <LoadingRememberingIllustration />
          <p style={{ fontSize: "0.95rem", color: GRAY, margin: 0 }}>Loading…</p>
        </div>
      </AppShell>
    );
  }

  const questionModeLabel =
    nextQuestion?.mode === "follow_up"
      ? "Following up"
      : profileComplete
        ? "A quick check-in"
        : "Help future cards sound more like you";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <PageShell style={{ paddingTop: 16 }}>

        {/* Back */}
        <div style={{ padding: "16px 0 8px", display: "flex", gap: 16 }}>
          <Link href="/people">
            <button type="button" style={{
              background: "none", border: "none", cursor: "pointer", color: GRAY,
              fontSize: "0.88rem", fontWeight: 500, display: "flex", alignItems: "center", gap: 6, padding: 0,
              fontFamily: sans,
            }}>
              <ArrowLeft size={16} /> Your people
            </button>
          </Link>
          <Link href="/dashboard">
            <button type="button" style={{
              background: "none", border: "none", cursor: "pointer", color: GRAY,
              fontSize: "0.88rem", fontWeight: 500, padding: 0, fontFamily: sans, opacity: 0.7,
            }}>
              Home
            </button>
          </Link>
        </div>

        {/* Relationship summary */}
        <SoftCard style={{ padding: "24px 20px", marginBottom: 24 }}>
          <RelationshipProfileHeaderIllustration />
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
            <PersonAvatar name={recipient.name} size={64} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: serif, fontSize: "1.75rem", fontWeight: 600, color: CHARCOAL,
                margin: 0, lineHeight: 1.2,
              }}>
                {recipient.name}
              </h1>
              <div style={{ fontSize: "0.9rem", color: GRAY, marginTop: 6 }}>
                {(recipient as any).relationship}
              </div>
              {nextEvent && (
                <p style={{
                  marginTop: 12, fontSize: "0.95rem", lineHeight: 1.5,
                  color: nextEvent.daysAway <= 7 ? RED : CHARCOAL, fontWeight: 500,
                }}>
                  {occasionPhrase(
                    nextEvent.event,
                    nextEvent.daysAway,
                    nextEvent.dateStr,
                    isSensitiveOccasion(nextEvent.event),
                  )}
                </p>
              )}
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10 }}>
            {upcomingEvents[0] && (() => {
              const ev = upcomingEvents[0];
              const existingCard = cardByEvent.get(ev.event);
              return (
                <PrimaryBtn
                  onClick={() => setLocation(
                    existingCard
                      ? `/briefings/${id}/${encodeURIComponent(ev.event)}?rewrite=1`
                      : `/briefings/${id}/${encodeURIComponent(ev.event)}`,
                  )}
                  accent={RED}
                  style={{ padding: "11px 20px", borderRadius: 24, fontSize: "0.88rem", fontFamily: sans }}
                >
                  {existingCard ? "Review the card" : "Write the card"}
                </PrimaryBtn>
              );
            })()}
            <PrimaryBtn
              variant="outline"
              accent={SAGE}
              onClick={() => {
                const el = document.getElementById("memory-input");
                el?.focus();
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              style={{ padding: "11px 20px", borderRadius: 24, fontSize: "0.88rem", fontFamily: sans }}
            >
              Add a memory
            </PrimaryBtn>
            <SecondaryBtn href={`/recipients/${id}?edit=1`}>Edit details</SecondaryBtn>
          </div>
        </SoftCard>

        {/* Occasions we remember */}
        <AppSection title="Occasions we remember" sub="We'll watch the calendar so you don't have to.">
          <SoftCard style={{ padding: "16px 18px", background: BG }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: "0.82rem", color: GRAY }}>Tracked occasions</span>
              <button type="button" onClick={() => { setShowAddEvent(v => !v); setSelectedEventChip(null); setNewEventDate(""); }}
                style={{ fontSize: "0.82rem", fontWeight: 600, color: SAGE, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: sans }}>
                {showAddEvent ? "Done" : "+ Add occasion"}
              </button>
            </div>

            {(() => {
              const allOccasions = [...DATE_SENSITIVE_EVENTS, ...HOLIDAY_EVENTS.map(e => ({ label: e.label, emoji: e.emoji }))];
              const tracked = allOccasions.filter(e => isTrackedEvent(e.label, recipient));
              if (tracked.length === 0 && !showAddEvent) {
                return (
                  <div style={{ borderRadius: 12, border: `1px dashed ${BORDER}`, padding: "20px 16px", textAlign: "center" as const }}>
                    <p style={{ fontSize: "0.88rem", color: GRAY, margin: "0 0 12px", lineHeight: 1.5 }}>
                      Add a birthday, anniversary, or holiday when you're ready.
                    </p>
                    <button type="button" onClick={() => setShowAddEvent(true)} style={{ fontSize: "0.82rem", color: SAGE, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: sans }}>
                      + Add occasion
                    </button>
                  </div>
                );
              }
              if (tracked.length === 0) return null;
              return (
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: showAddEvent ? 14 : 0 }}>
                  {tracked.map(e => (
                    <div key={e.label} style={{
                      padding: "6px 14px", borderRadius: 20, background: `${SAGE}12`,
                      color: SAGE, fontWeight: 600, fontSize: "0.8rem",
                      border: `1px solid ${SAGE}25`,
                    }}>
                      {e.label}
                    </div>
                  ))}
                </div>
              );
            })()}

            {showAddEvent && recipient && (
              <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "16px", marginTop: 8 }}>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: selectedEventChip ? 14 : 0 }}>
                  {DATE_SENSITIVE_EVENTS.map(e => {
                    const tracked = isTrackedEvent(e.label, recipient);
                    const selecting = selectedEventChip === e.label;
                    return (
                      <button key={e.label} type="button" onClick={() => { if (tracked) { handleRemoveEvent(e.label); } else { setSelectedEventChip(selecting ? null : e.label); setNewEventDate(""); } }}
                        style={{
                          padding: "8px 14px", borderRadius: 20,
                          border: `1.5px solid ${tracked ? SAGE : selecting ? CHARCOAL : BORDER}`,
                          background: tracked ? SAGE : selecting ? CHARCOAL : CREAM,
                          color: tracked || selecting ? WHITE : CHARCOAL,
                          fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", fontFamily: sans,
                        }}>
                        {e.label}{tracked && " ✓"}
                      </button>
                    );
                  })}
                  {HOLIDAY_EVENTS.map(e => {
                    const tracked = isTrackedEvent(e.label, recipient);
                    return (
                      <button key={e.label} type="button" onClick={() => { if (tracked) { handleRemoveEvent(e.label); } else { handleAddHolidayEvent(e.label, e.flag); } }}
                        style={{
                          padding: "8px 14px", borderRadius: 20,
                          border: `1.5px solid ${tracked ? SAGE : BORDER}`,
                          background: tracked ? SAGE : CREAM,
                          color: tracked ? WHITE : CHARCOAL,
                          fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", fontFamily: sans,
                        }}>
                        {e.label}{tracked && " ✓"}
                      </button>
                    );
                  })}
                </div>
                {selectedEventChip && (
                  <div>
                    <p style={{ fontSize: "0.82rem", color: GRAY, margin: "0 0 10px" }}>When is their {selectedEventChip}?</p>
                    <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)}
                      style={{ padding: "12px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: "0.9rem", fontFamily: sans, outline: "none", width: "100%", boxSizing: "border-box" as const, background: CREAM, marginBottom: 12 }} />
                    <button type="button" onClick={handleAddDateEvent} disabled={!newEventDate || savingEvent}
                      style={{ width: "100%", padding: "12px", borderRadius: 24, border: "none", background: !newEventDate ? `${SAGE}50` : SAGE, color: WHITE, fontWeight: 600, fontSize: "0.88rem", cursor: !newEventDate ? "not-allowed" : "pointer", fontFamily: sans }}>
                      {savingEvent ? "Saving…" : `Add ${selectedEventChip}`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </SoftCard>
        </AppSection>

        {/* Coming up next */}
        <AppSection title="Coming up next" sub={`For ${firstName} — we'll remind you before it matters.`}>
          {upcomingEvents[0] && (() => {
            const ev = upcomingEvents[0];
            const accent = urgencyAccent(ev.daysAway);
            const big = formatBigDate(ev.dateStr);
            const existingCard = cardByEvent.get(ev.event);
            return (
              <SoftCard style={{ padding: "20px", borderLeft: `3px solid ${accent}`, marginBottom: upcomingEvents.length > 1 ? 10 : 0 }}>
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <div style={{ width: 68, textAlign: "center" as const, padding: "10px 0", borderRadius: 12, background: `${accent}10` }}>
                    <div style={{ fontFamily: serif, fontSize: "1.65rem", fontWeight: 600, color: accent, lineHeight: 1 }}>{big.day}</div>
                    <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", color: GRAY, marginTop: 2 }}>{big.month}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "1.05rem", color: CHARCOAL, fontFamily: serif }}>{ev.event}</div>
                    <p style={{ fontSize: "0.88rem", color: GRAY, margin: "6px 0 0", lineHeight: 1.5 }}>
                      {occasionPhrase(ev.event, ev.daysAway, ev.dateStr, isSensitiveOccasion(ev.event))}
                    </p>
                  </div>
                </div>
                <PrimaryBtn
                  onClick={() => setLocation(
                    existingCard
                      ? `/briefings/${id}/${encodeURIComponent(ev.event)}?rewrite=1`
                      : `/briefings/${id}/${encodeURIComponent(ev.event)}`,
                  )}
                  accent={existingCard ? SAGE : accent}
                  variant={existingCard ? "outline" : "fill"}
                  style={{ padding: "10px 20px", borderRadius: 24, fontSize: "0.86rem", fontFamily: sans }}
                >
                  {existingCard ? "Review the card" : "Write the card"}
                </PrimaryBtn>
              </SoftCard>
            );
          })()}

          {upcomingEvents.length > 1 && (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginTop: 10 }}>
              {upcomingEvents.slice(1).map(ev => {
                const urgent = ev.daysAway <= 7;
                const near   = ev.daysAway <= 14;
                const accent = urgent ? RED : near ? AMBER : SAGE;
                const existingCard = cardByEvent.get(ev.event);
                return (
                  <SoftCard key={ev.event} style={{ padding: "14px 16px", borderLeft: `3px solid ${accent}`, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.92rem", color: CHARCOAL }}>{ev.event}</div>
                      <div style={{ fontSize: "0.8rem", color: GRAY, marginTop: 4 }}>
                        {fmtDate(ev.dateStr)} · {daysLabel(ev.daysAway)}
                      </div>
                    </div>
                    <PrimaryBtn
                      onClick={() => setLocation(
                        existingCard
                          ? `/briefings/${id}/${encodeURIComponent(ev.event)}?rewrite=1`
                          : `/briefings/${id}/${encodeURIComponent(ev.event)}`,
                      )}
                      variant={existingCard ? "outline" : "fill"}
                      accent={existingCard ? SAGE : RED}
                      style={{ padding: "8px 14px", fontSize: "0.76rem", borderRadius: 20, flexShrink: 0, fontFamily: sans }}
                    >
                      {existingCard ? "Review" : "Write card"}
                    </PrimaryBtn>
                  </SoftCard>
                );
              })}
            </div>
          )}

          {futureEvents.length > 0 && (
            <div style={{ marginTop: upcomingEvents.length > 0 ? 14 : 0 }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, color: GRAY, letterSpacing: "0.1em", textTransform: "uppercase" as const, margin: "0 0 8px" }}>
                On the calendar
              </p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                {futureEvents.map(ev => (
                  <div key={ev.event} style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, fontWeight: 500, fontSize: "0.88rem", color: CHARCOAL }}>{ev.event}</div>
                    <div style={{ fontSize: "0.8rem", color: GRAY }}>{fmtDate(ev.dateStr)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {eventsNeedingDate.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, color: AMBER, letterSpacing: "0.08em", textTransform: "uppercase" as const, margin: "0 0 8px" }}>
                Add a date when you can
              </p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                {eventsNeedingDate.map(ev => (
                  <div key={ev.event} style={{ background: `${AMBER}06`, borderRadius: 12, border: `1px solid ${AMBER}25`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, fontWeight: 500, fontSize: "0.88rem", color: CHARCOAL }}>{ev.event}</div>
                    <button type="button" onClick={() => { setShowAddEvent(true); setSelectedEventChip(ev.event); setNewEventDate(""); }}
                      style={{ padding: "6px 14px", borderRadius: 20, cursor: "pointer", border: `1px solid ${AMBER}`, background: "transparent", color: AMBER, fontWeight: 600, fontSize: "0.78rem", whiteSpace: "nowrap" as const, fontFamily: sans }}>
                      Set date
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcomingEvents.length === 0 && futureEvents.length === 0 && eventsNeedingDate.length === 0 && (
            <SoftCard style={{ padding: "24px 20px", textAlign: "center" as const, border: `1px dashed ${BORDER}` }}>
              <p style={{ fontSize: "0.9rem", color: GRAY, margin: 0, lineHeight: 1.55 }}>
                Add an occasion above and we'll quietly watch the calendar for you.
              </p>
            </SoftCard>
          )}
        </AppSection>

        {/* Timeline */}
        <AppSection title="Your story together" sub="Memories, cards, and moments over time.">
          <button type="button" onClick={() => setShowTimeline(v => !v)} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14,
            padding: "16px 18px", cursor: "pointer", marginBottom: showTimeline ? 10 : 0,
            fontFamily: sans,
          }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: CHARCOAL }}>
              {showTimeline ? "Hide timeline" : "View full timeline"}
            </span>
            {showTimeline ? <ChevronUp size={18} color={GRAY} /> : <ChevronDown size={18} color={GRAY} />}
          </button>
          {showTimeline && <RelationshipTimeline recipientId={id} />}
        </AppSection>

        {/* Memories */}
        <AppSection title="Memories" sub={`Little details that make ${firstName}'s cards feel personal.`}>
          <SoftCard style={{ padding: "16px 18px", marginBottom: 14 }}>
            <textarea
              id="memory-input"
              value={memoryText}
              onChange={e => setMemoryText(e.target.value)}
              placeholder={`Something ${firstName} would love you remembered…`}
              rows={3}
              style={{
                width: "100%", borderRadius: 10, border: `1px solid ${BORDER}`, padding: "12px 14px",
                fontSize: "0.9rem", lineHeight: 1.6, background: CREAM, resize: "vertical" as const,
                outline: "none", fontFamily: sans, color: CHARCOAL,
                boxSizing: "border-box" as const, marginBottom: 12,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <PrimaryBtn
                onClick={handleSaveMemory}
                disabled={savingMemory || !memoryText.trim()}
                accent={SAGE}
                style={{ padding: "10px 20px", borderRadius: 24, fontSize: "0.86rem", fontFamily: sans }}
              >
                {savingMemory ? "Saving…" : memorySaved ? "Saved ✓" : "Save memory"}
              </PrimaryBtn>
            </div>
          </SoftCard>

          {freshLoading ? (
            <p style={{ padding: "8px 0", fontSize: "0.9rem", color: GRAY }}>Loading memories…</p>
          ) : freshUpdates.length === 0 ? (
            <SoftCard style={{ padding: "24px 20px", textAlign: "center" as const }}>
              <p style={{ fontSize: "0.92rem", color: GRAY, lineHeight: 1.6, margin: 0 }}>
                Every great relationship has stories. Add one above — we'll weave it into the next card.
              </p>
            </SoftCard>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {displayedMemories.map(m => (
                <SoftCard key={m.id} style={{ padding: "14px 16px", borderLeft: `3px solid ${ageBorderColor(m.ageCategory)}` }}>
                  <p style={{ fontSize: "0.95rem", color: CHARCOAL, lineHeight: 1.65, margin: 0, fontFamily: serif }}>
                    {m.answerText}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: "0.75rem", color: GRAY }}>
                    <span>{formatDaysAgo(m.daysAgo)}</span>
                    {m.ageCategory === "recent" && (
                      <span style={{ padding: "2px 8px", borderRadius: 10, background: `${SAGE}12`, color: SAGE, fontWeight: 600, fontSize: "0.68rem" }}>
                        In your cards
                      </span>
                    )}
                    {m.ageCategory === "mid" && (
                      <span style={{ padding: "2px 8px", borderRadius: 10, background: `${AMBER}12`, color: AMBER, fontWeight: 600, fontSize: "0.68rem" }}>
                        Still fresh
                      </span>
                    )}
                  </div>
                </SoftCard>
              ))}
              {freshUpdates.length > 4 && (
                <button type="button" onClick={() => setShowAllMemories(v => !v)} style={{
                  background: "none", border: `1px solid ${BORDER}`, borderRadius: 12,
                  padding: "10px", fontSize: "0.82rem", color: GRAY, cursor: "pointer", fontWeight: 600, fontFamily: sans,
                }}>
                  {showAllMemories ? "Show fewer" : `Show all ${freshUpdates.length} memories`}
                </button>
              )}
            </div>
          )}
        </AppSection>

        {/* Improve future cards */}
        {nextQuestion && !questionSkipped && (
          <AppSection title="Improve future cards" sub="One thoughtful question — only when it helps.">
            <SoftCard style={{
              padding: "20px 18px",
              border: `1px solid ${nextQuestion.mode === "follow_up" ? "#7C3AED25" : `${RED}20`}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", color: GRAY, textTransform: "uppercase" as const }}>
                  {questionModeLabel}
                </span>
                <button type="button" onClick={() => setQuestionSkipped(true)} style={{ background: "none", border: "none", color: GRAY, cursor: "pointer", fontSize: "0.8rem", padding: 0, fontWeight: 500, fontFamily: sans }}>
                  Skip for now
                </button>
              </div>
              {nextQuestion.mode === "follow_up" && nextQuestion.followUp && (
                <div style={{ background: "#7C3AED08", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: "0.82rem", color: "#7C3AED", fontStyle: "italic", lineHeight: 1.5 }}>
                  You mentioned: &ldquo;{nextQuestion.followUp.originalAnswer.slice(0, 80)}{nextQuestion.followUp.originalAnswer.length > 80 ? "…" : ""}&rdquo;
                </div>
              )}
              <p style={{ fontSize: "1.02rem", fontWeight: 600, color: CHARCOAL, margin: "0 0 8px", lineHeight: 1.5, fontFamily: serif }}>
                {nextQuestion.question}
              </p>
              <p style={{ fontSize: "0.82rem", color: GRAY, margin: "0 0 14px", lineHeight: 1.5 }}>
                {nextQuestion.reason}
              </p>
              {!answerSaved ? (
                <>
                  <textarea value={answerText} onChange={e => setAnswerText(e.target.value)} placeholder="Your answer…" rows={3}
                    style={{ width: "100%", borderRadius: 10, border: `1px solid ${BORDER}`, padding: "12px 14px", fontSize: "0.9rem", lineHeight: 1.6, background: CREAM, resize: "vertical" as const, outline: "none", fontFamily: sans, color: CHARCOAL, boxSizing: "border-box" as const, marginBottom: 10 }} />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button type="button" onClick={() => setQuestionSkipped(true)} style={{ padding: "9px 16px", borderRadius: 20, border: `1px solid ${BORDER}`, background: "transparent", color: GRAY, fontWeight: 500, fontSize: "0.82rem", cursor: "pointer", fontFamily: sans }}>
                      Not now
                    </button>
                    <PrimaryBtn onClick={handleSaveAnswer} disabled={savingAnswer || !answerText.trim()} style={{ padding: "9px 18px", borderRadius: 20, fontSize: "0.82rem", fontFamily: sans }}>
                      {savingAnswer ? "Saving…" : "Save answer"}
                    </PrimaryBtn>
                  </div>
                </>
              ) : (
                <div style={{ padding: "14px", borderRadius: 10, background: `${SAGE}10`, color: SAGE, fontWeight: 600, fontSize: "0.88rem", textAlign: "center" as const }}>
                  Saved — this will make {firstName}&apos;s next card feel more like you.
                </div>
              )}
            </SoftCard>
          </AppSection>
        )}

        {/* What we know */}
        <AppSection
          title="What we know about them"
          sub="Thoughtful notes that shape future cards."
          right={<SecondaryBtn href={`/recipients/${id}?edit=1`}>Edit details</SecondaryBtn>}
        >
          <Card>
            {profileFields.length === 0 ? (
              <div style={{ padding: "28px 20px", textAlign: "center" as const }}>
                <p style={{ fontSize: "0.92rem", color: GRAY, margin: "0 0 16px", lineHeight: 1.55 }}>
                  {recipientHasThinMemory(recipient)
                    ? "A memory or two helps us write cards that sound like you."
                    : "Tell us what makes them tick — we'll remember for you."}
                </p>
                <SecondaryBtn href={`/recipients/${id}?edit=1`}>Add details</SecondaryBtn>
              </div>
            ) : (
              profileFields.map((f, i) => (
                <div key={f.key} style={{
                  display: "flex", flexDirection: "column" as const, gap: 4,
                  padding: "14px 18px",
                  borderBottom: i < profileFields.length - 1 ? `1px solid ${BORDER}` : "none",
                }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", color: GRAY, textTransform: "uppercase" as const }}>
                    {f.key}
                  </div>
                  <div style={{ fontSize: "0.92rem", color: CHARCOAL, lineHeight: 1.6 }}>{String(f.value)}</div>
                </div>
              ))
            )}
          </Card>
        </AppSection>

        {(recipient as any).thingsToAvoid && (
          <AppSection title="Handle with care" sub="Sensitive topics — we'll tread gently.">
            <SoftCard style={{ padding: "16px 18px", borderLeft: `3px solid ${RED}`, background: `${RED}04` }}>
              <p style={{ fontSize: "0.92rem", color: CHARCOAL, lineHeight: 1.65, margin: 0 }}>
                {(recipient as any).thingsToAvoid}
              </p>
            </SoftCard>
          </AppSection>
        )}

        {/* Cards you've sent */}
        {cards.length > 0 && (
          <AppSection title="Cards you've sent" sub="Your relationship history — not a transaction log.">
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {cards.slice(0, 5).map(card => {
                const sc = card.status === "Approved" ? SAGE : card.status === "Ready for approval" ? AMBER : GRAY;
                const msg = (card as any).approvedMessage ?? (card as any).messageOriginal ?? "";
                const statusLabel = card.status === "Approved" ? "Sent" : card.status === "Ready for approval" ? "Ready for you" : card.status;
                return (
                  <Card key={card.id} style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: msg ? 8 : 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.92rem", color: CHARCOAL, fontFamily: serif }}>
                        {(card as any).holiday}
                      </div>
                      <span style={{
                        padding: "3px 10px", borderRadius: 12, fontSize: "0.68rem", fontWeight: 600,
                        background: `${sc}12`, color: sc,
                      }}>
                        {statusLabel}
                      </span>
                    </div>
                    {msg && (
                      <p style={{
                        fontSize: "0.88rem", color: GRAY, lineHeight: 1.55, margin: 0,
                        display: "-webkit-box" as const, WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                        fontFamily: serif, fontStyle: "italic",
                      }}>
                        {msg.slice(0, 140)}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </AppSection>
        )}

        {/* Quiet health reassurance */}
        {healthScore && (
          <SoftCard style={{ padding: "16px 18px", marginBottom: 16, background: `${SAGE}06`, border: `1px solid ${SAGE}20` }}>
            <p style={{ fontSize: "0.88rem", fontWeight: 600, color: CHARCOAL, margin: "0 0 10px" }}>
              {healthScore.score >= 70 ? "We're in good shape for upcoming cards." : "A little more detail would help future cards shine."}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 4, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${healthScore.score}%`, background: statusColor, borderRadius: 2, transition: "width 0.5s ease" }} />
              </div>
            </div>
            {healthScore.pendingFollowUps > 0 && (
              <p style={{ fontSize: "0.8rem", color: AMBER, margin: "10px 0 0", fontWeight: 500 }}>
                {healthScore.pendingFollowUps} quick follow-up{healthScore.pendingFollowUps > 1 ? "s" : ""} would help — answer above when you have a moment.
              </p>
            )}
            {healthScore.lastUpdateDaysAgo !== null && healthScore.lastUpdateDaysAgo > 90 && (
              <p style={{ fontSize: "0.8rem", color: GRAY, margin: "8px 0 0" }}>
                It's been a while since you added a memory. Drop one above before the next card.
              </p>
            )}
          </SoftCard>
        )}

      </PageShell>
    </AppShell>
  );
}
