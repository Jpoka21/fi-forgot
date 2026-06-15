import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  getCards, getRecipients, getBriefingsForRecipient,
  CardOrder, Recipient, saveCard,
  getPersonalSettings, savePersonalSettings, PersonalSettings,
  childrenSummary, getYearsTogether, TONES,
} from "@/lib/data";
import { getCustomerPendingApprovals, QueueItem, MessageDraft } from "@/lib/admin-data";
import { useAuth } from "@/lib/auth-context";
import { Plan, PLANS } from "@/lib/plan";
import {
  Plus, Sparkles, Loader2, ChevronDown, ChevronUp,
  ArrowRight, Settings, CheckCircle2, TrendingUp, Target,
} from "lucide-react";
import AppNav from "@/components/layout/AppNav";
import {
  computeOverallHealth, computeCoverage, getRecommendedAction,
  recordScoreSnapshot, getScoreHistory, CAT_LABELS, CAT_DESCRIPTIONS,
  TIER_WEIGHTS, ScoreSnapshot,
} from "@/lib/relationship-health";
import RelationshipHealthSection, { WGYBSection } from "@/components/RelationshipHealthSection";

interface HwFont { id: string; name: string; previewUrl?: string; }

/* ── Brand colours ────────────────────────────────────────────────────────── */
const BEIGE  = "#F2E6D3";
const RED    = "#E23B2E";
const INK    = "#1F1F1F";
const MID    = "#4B5563";
const WHITE  = "#FFFFFF";
const SAGE   = "#5B8C6B";
const BORDER = "#E5E0D8";

/* ── Helpers ──────────────────────────────────────────────────────────────── */
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
    "Sister": "👯", "Brother": "🤜",
    "Son": "👦", "Daughter": "👧",
    "Friend": "🤝", "Best Friend": "✨",
    "Grandma": "👵", "Grandpa": "👴",
    "Grandmother": "👵", "Grandfather": "👴",
    "Aunt": "🌸", "Uncle": "🧔",
    "Boss": "💼", "Coworker": "🤝",
  };
  return map[rel] ?? "🤝";
}

function daysColor(n: number): string {
  if (n <= 7)  return RED;
  if (n <= 14) return "#D97706";
  return MID;
}

function personScoreLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: "Strong Profile",   color: SAGE };
  if (score >= 65) return { text: "Good Foundation",  color: "#26A69A" };
  if (score >= 45) return { text: "Building Up",      color: "#F59E0B" };
  if (score >= 25) return { text: "Just Starting",    color: "#EF6C00" };
  return               { text: "Getting Started", color: MID };
}

const HOLIDAY_DATES: Record<string, { month: number; day: number }> = {
  "Valentine's Day": { month: 2,  day: 14 },
  "Christmas":       { month: 12, day: 25 }, "Hanukkah":      { month: 12, day: 26 },
  "New Year's":      { month: 1,  day: 1  }, "Easter":        { month: 4,  day: 20 },
};

/** Returns the date of the Nth occurrence of a weekday in a given month/year.
 *  weekday: 0=Sun, 1=Mon … 6=Sat */
function nthWeekday(year: number, month: number, weekday: number, nth: number): Date {
  const d = new Date(year, month - 1, 1);
  const first = d.getDay(); // weekday of the 1st
  const offset = (weekday - first + 7) % 7;
  return new Date(year, month - 1, 1 + offset + (nth - 1) * 7);
}

function floatingHolidayDate(event: string, year: number): Date | null {
  if (event === "Mother's Day")  return nthWeekday(year, 5,  0, 2); // 2nd Sunday of May
  if (event === "Father's Day")  return nthWeekday(year, 6,  0, 3); // 3rd Sunday of June
  if (event === "Thanksgiving")  return nthWeekday(year, 11, 4, 4); // 4th Thursday of November
  return null;
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getEventDate(event: string, r: Recipient): string | null {
  const now  = new Date(); const year = now.getFullYear();
  const pad  = (n: number) => String(n).padStart(2, "0");
  const fmt  = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const next = (stored: string) => {
    const p = stored.split("-").map(Number);
    let d   = new Date(year, p[1] - 1, p[2]);
    if (d < now) d = new Date(year + 1, p[1] - 1, p[2]);
    return fmt(d);
  };
  if (event === "Birthday" && r.birthday)  return next(r.birthday);
  if (event === "Anniversary") {
    const src = r.anniversaryDate ?? r.marriageDate;
    if (src) return next(src);
  }
  const custom = r.customDates?.find(c => c.label === event);
  if (custom?.date) return next(custom.date);
  // Floating holidays (recalculated each year)
  const floating = floatingHolidayDate(event, year);
  if (floating) {
    if (floating < now) {
      const next1 = floatingHolidayDate(event, year + 1)!;
      return fmt(next1);
    }
    return fmt(floating);
  }
  const fixed = HOLIDAY_DATES[event];
  if (fixed) return next(`${year}-${pad(fixed.month)}-${pad(fixed.day)}`);
  return null;
}

type UpcomingEvent = { recipient: Recipient; event: string; daysAway: number; dateStr: string; briefingDone: boolean };

/* ── Thin bar ─────────────────────────────────────────────────────────────── */
function ThinBar({ pct, color = SAGE, h = 4 }: { pct: number; color?: string; h?: number }) {
  return (
    <div style={{ height: h, background: BORDER, borderRadius: h, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: color, borderRadius: h, transition: "width 0.6s ease" }} />
    </div>
  );
}

/* ── Section headline ─────────────────────────────────────────────────────── */
function SHead({ text, sub, emoji }: { text: string; sub?: string; emoji?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.65rem", letterSpacing: "0.02em", color: INK, margin: 0, lineHeight: 1 }}>
          {text}
        </h2>
        {emoji && <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{emoji}</span>}
      </div>
      {sub && <p style={{ margin: "6px 0 0", fontSize: "0.88rem", color: MID, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [cards, setCards]                       = useState<CardOrder[]>([]);
  const [recipients, setRecipients]             = useState<Recipient[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<(QueueItem & { message?: MessageDraft })[]>([]);
  const [settingsOpen, setSettingsOpen]         = useState(false);
  const [personalSettings, setPersonalSettings] = useState<PersonalSettings>(() => getPersonalSettings());
  const [hwFonts, setHwFonts]                   = useState<HwFont[]>([]);
  const [fontsLoading, setFontsLoading]         = useState(false);
  const [fontPickerOpen, setFontPickerOpen]     = useState(false);
  const [generatingFor, setGeneratingFor]       = useState<string | null>(null);
  const [viewingCardId, setViewingCardId]       = useState<string | null>(null);
  const [isMobile, setIsMobile]                 = useState(() => window.innerWidth < 768);
  const [scoreHistory, setScoreHistory]         = useState<ScoreSnapshot[]>([]);
  const [upgradeOpen, setUpgradeOpen]           = useState(false);
  const [insightsOpen, setInsightsOpen]         = useState(false);
  const [heroExpanded, setHeroExpanded]         = useState(false);
  const [levelsOpen, setLevelsOpen]             = useState(false);
  const [expandedEvents, setExpandedEvents]     = useState<Set<string>>(new Set(["__next30__"]));

  const { user, logout, upgradePlan } = useAuth();
  const [, setLocation] = useLocation();
  const plan = (user?.plan ?? "basic") as Plan;

  const [firstTimeDismissed, setFirstTimeDismissed] = useState(() => !!localStorage.getItem("fi_forgot_first_time_seen"));
  const isFirstTimeState = !firstTimeDismissed && recipients.length === 1 && cards.some(c => c.recipientId === recipients[0]?.id);

  useEffect(() => {
    const rs = getRecipients(); const cs = getCards();
    setCards(cs); setRecipients(rs);
    if (user?.email) setPendingApprovals(getCustomerPendingApprovals(user.email));
    setScoreHistory(getScoreHistory());
  }, []);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const health   = useMemo(() => computeOverallHealth(recipients), [recipients]);
  const coverage = useMemo(() => computeCoverage(recipients), [recipients]);

  useEffect(() => {
    if (health.score > 0) { recordScoreSnapshot(health.score); setScoreHistory(getScoreHistory()); }
  }, [health.score]);

  const approvedCards    = useMemo(() => cards.filter(c => c.status === "Approved"), [cards]);
  const awaitingApproval = cards.filter(c => c.status === "Ready for approval");
  const approvalCount    = awaitingApproval.length + pendingApprovals.length;
  const disastersAvoided = recipients.reduce((s, r) => s + (r.selectedEvents?.length ?? 0), 0);

  const allUpcomingEvents = useMemo(() => {
    const today  = new Date(); const cutoff = new Date(today.getTime() + 90 * 86400000);
    const thisYear = today.getFullYear(); const result: UpcomingEvent[] = [];
    const pad    = (n: number) => String(n).padStart(2, "0");
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

  const upcomingWithCardKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const c of cards) { if (c.status !== "Needs profile") keys.add(`${c.recipientId}:::${c.holiday}`); }
    return keys;
  }, [cards]);

  const recommendedAction = useMemo(() => getRecommendedAction(
    recipients, approvalCount,
    allUpcomingEvents.filter(ev => !ev.briefingDone),
    health,
  ), [recipients, approvalCount, allUpcomingEvents, health]);

  const past30Score = useMemo(() => {
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const old    = scoreHistory.filter(s => s.date <= cutoff);
    return old.length > 0 ? old[old.length - 1].score : null;
  }, [scoreHistory]);
  const scoreDelta = past30Score !== null ? health.score - past30Score : null;

  const momentsAtRisk = useMemo(() =>
    allUpcomingEvents.filter(e => e.daysAway <= 14 && !e.briefingDone && !upcomingWithCardKeys.has(`${e.recipient.id}:::${e.event}`)).length,
  [allUpcomingEvents, upcomingWithCardKeys]);

  const wins = useMemo(() => {
    const list: string[] = [];
    for (const c of approvedCards) list.push(`${c.recipientName}'s ${c.holiday} card is approved and ready to mail`);
    for (const ev of allUpcomingEvents) {
      if (ev.briefingDone && ev.daysAway > 7 && !approvedCards.find(c => c.recipientId === ev.recipient.id && c.holiday === ev.event))
        list.push(`${ev.recipient.name}'s ${ev.event} is personalized and on track`);
    }
    if (momentsAtRisk === 0 && recipients.length > 0) list.push("No important moments missed this month");
    if (scoreDelta && scoreDelta > 0) list.push(`Brownie Points improved ${scoreDelta} point${scoreDelta > 1 ? "s" : ""} this month`);
    return list.slice(0, 4);
  }, [approvedCards, allUpcomingEvents, recipients, scoreDelta, momentsAtRisk]);

  /* "We Got Your Back" checklist */
  const weGotYourBack = useMemo(() => {
    const lines: { text: string; good: boolean }[] = [];
    for (const ev of allUpcomingEvents.slice(0, 2)) {
      const hasCard = upcomingWithCardKeys.has(`${ev.recipient.id}:::${ev.event}`);
      if (ev.briefingDone || hasCard) lines.push({ text: `${ev.recipient.name}'s ${ev.event} is on track`, good: true });
    }
    if (approvalCount > 0) lines.push({ text: `${approvalCount} card${approvalCount > 1 ? "s" : ""} ready for your review`, good: true });
    if (momentsAtRisk === 0) lines.push({ text: "No important moments at risk", good: true });
    else                     lines.push({ text: `${momentsAtRisk} moment${momentsAtRisk > 1 ? "s" : ""} need${momentsAtRisk === 1 ? "s" : ""} attention`, good: false });
    if (disastersAvoided > 0) lines.push({ text: `${disastersAvoided} occasion${disastersAvoided !== 1 ? "s" : ""} being watched`, good: true });
    return lines;
  }, [allUpcomingEvents, upcomingWithCardKeys, approvalCount, momentsAtRisk, disastersAvoided]);

  function updateSettings<K extends keyof PersonalSettings>(key: K, val: PersonalSettings[K]) {
    setPersonalSettings(prev => { const next = { ...prev, [key]: val }; savePersonalSettings(next); return next; });
  }

  async function generateEarly(ev: UpcomingEvent) {
    const key = `${ev.recipient.id}:::${ev.event}`;
    setGeneratingFor(key);
    try {
      const allBriefings    = getBriefingsForRecipient(ev.recipient.id);
      const currentBriefing = allBriefings.filter(b => b.event === ev.event).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
      const res  = await fetch("/api/generate-card", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: ev.recipient.name, relationship: ev.recipient.relationship, holiday: ev.event,
          tonePreference: ev.recipient.tonePreference, senderName: ev.recipient.senderName,
          personalityNotes: ev.recipient.personalityNotes, thingsToAvoid: ev.recipient.thingsToAvoid,
          favoriteMemories: ev.recipient.favoriteMemories, insideJokes: ev.recipient.insideJokes,
          emotionalLevel: ev.recipient.emotionalLevel, kidsNames: childrenSummary(ev.recipient.children),
          yearsTogther: ev.recipient.marriageDate ? String(getYearsTogether(ev.recipient.marriageDate)) : undefined,
          eventBriefing: currentBriefing?.answers ?? [],
          recipientHistory: allBriefings.filter(b => b.event !== ev.event).map(b => ({ event: b.event, year: b.year, answers: b.answers })),
        }),
      });
      const data = await res.json() as { cards?: { tone: string; text: string }[] };
      const generated = data.cards ?? [];
      if (generated.length > 0) {
        const match   = generated.find(c => c.tone === ev.recipient.tonePreference) ?? generated[0];
        const newCard: CardOrder = {
          id: `personal-${Date.now()}`, recipientId: ev.recipient.id, recipientName: ev.recipient.name,
          holiday: ev.event, dueDate: ev.dateStr, status: "Ready for approval",
          approvedMessage: match.text, deliveryPreference: ev.recipient.deliveryPreference,
        };
        saveCard(newCard); setCards(getCards());
      }
    } catch { /**/ } finally { setGeneratingFor(null); }
  }

  useEffect(() => {
    if (!fontPickerOpen || hwFonts.length > 0) return;
    setFontsLoading(true);
    fetch("/api/handwrytten-fonts").then(r => r.json()).then((d: { fonts?: HwFont[] }) => { if (d.fonts) setHwFonts(d.fonts); }).catch(() => {}).finally(() => setFontsLoading(false));
  }, [fontPickerOpen]);


  const planConfig = PLANS[plan];
  const cardsUsed  = approvedCards.length;
  const cardsTotal = planConfig.maxCardsPerYear;
  const cardsLeft  = Math.max(0, cardsTotal - cardsUsed);
  const atLimit    = cardsLeft === 0;
  const usagePct   = Math.min(100, Math.round((cardsUsed / Math.max(cardsTotal, 1)) * 100));
  const px         = isMobile ? 16 : 28;
  const firstName  = user?.name?.split(" ")[0] ?? "there";
  const displayScore = Math.min(health.score, 98);


  const heroEvents = heroExpanded ? allUpcomingEvents : allUpcomingEvents.slice(0, isMobile ? 3 : 2);

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <>
    <AppNav />
    <div style={{ minHeight: "100vh", background: BEIGE, fontFamily: "'Inter', sans-serif", color: INK }}>

      {/* ── Settings strip ─────────────────────────────────────────────── */}
      <div style={{ background: `${INK}02` }}>
        <button onClick={() => setSettingsOpen(o => !o)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: `9px ${px}px`, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Settings size={12} style={{ color: MID }} />
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.72rem", letterSpacing: "0.12em", color: MID }}>Autopilot Settings</span>
            <span style={{ fontSize: "0.78rem", color: MID }}>·</span>
            <span style={{ fontSize: "0.78rem", color: MID }}>{personalSettings.automationMode === "autopilot" ? "Fully automatic" : "Approval required"}</span>
          </div>
          {settingsOpen ? <ChevronUp size={12} style={{ color: MID }} /> : <ChevronDown size={12} style={{ color: MID }} />}
        </button>
        {settingsOpen && (
          <div style={{ padding: `0 ${px}px 20px`, display: "flex", flexDirection: "column" as const, gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.86rem", color: INK }}>Automation Mode</div>
                <div style={{ fontSize: "0.8rem", color: MID, marginTop: 2 }}>{personalSettings.automationMode === "autopilot" ? "Cards generate and send automatically." : "You'll preview each card before it mails."}</div>
              </div>
              <div style={{ display: "flex", background: `${INK}10`, borderRadius: 8, padding: 3, gap: 2 }}>
                {(["autopilot", "approve"] as const).map(m => (
                  <button key={m} onClick={() => updateSettings("automationMode", m)}
                    style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: personalSettings.automationMode === m ? INK : "transparent", color: personalSettings.automationMode === m ? WHITE : MID, fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>
                    {m === "autopilot" ? "Automatic" : "Manual"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
              <button onClick={() => setFontPickerOpen(true)}
                style={{ textAlign: "left" as const, padding: "10px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, cursor: "pointer" }}>
                <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", color: MID, marginBottom: 2 }}>HANDWRITING STYLE</div>
                <div style={{ fontWeight: 600, fontSize: "0.84rem", color: INK }}>{personalSettings.cardFont ? (hwFonts.find(f => f.id === personalSettings.cardFont)?.name ?? "Custom") : "Default style"}</div>
              </button>
              <div style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE }}>
                <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", color: MID, marginBottom: 4 }}>SIGNED AS</div>
                <input value={personalSettings.cardSignature ?? ""} onChange={e => updateSettings("cardSignature", e.target.value)} placeholder="e.g. Love, Mom"
                  style={{ width: "100%", border: "none", background: "none", fontWeight: 600, fontSize: "0.84rem", color: INK, outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box" as const }} />
              </div>
              <div style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE }}>
                <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", color: MID, marginBottom: 4 }}>DEFAULT TONE</div>
                <select value={personalSettings.defaultTone ?? ""} onChange={e => updateSettings("defaultTone", e.target.value as import("@/lib/data").Tone)}
                  style={{ width: "100%", border: "none", background: "none", fontWeight: 600, fontSize: "0.84rem", color: INK, outline: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  <option value="">No preference</option>
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: `20px ${px}px 48px`, boxSizing: "border-box" as const }}>

        {/* ══ EMPTY STATE ══════════════════════════════════════════════════ */}
        {recipients.length === 0 && (
          <div style={{ background: WHITE, borderRadius: 24, padding: "72px 36px", textAlign: "center" as const, boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 18 }}>💌</div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "2rem" : "2.6rem", color: INK, letterSpacing: "0.04em", marginBottom: 12, lineHeight: 1.1 }}>
              Add the People<br />Who Matter Most
            </div>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem", color: MID, maxWidth: 360, margin: "0 auto 32px", lineHeight: 1.6 }}>
              We'll handle the cards — you get the credit.
            </p>
            <Link href="/recipients/new">
              <button data-testid="link-add-recipient"
                style={{ background: RED, color: WHITE, border: "none", borderRadius: 12, padding: "14px 36px", fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", letterSpacing: "0.06em", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Plus size={16} /> Add Your First Person
              </button>
            </Link>
          </div>
        )}

        {/* ══ FIRST-TIME SUCCESS STATE ═════════════════════════════════════ */}
        {isFirstTimeState && (() => {
          const r = recipients[0];
          const c = cards.find(cc => cc.recipientId === r.id);
          // Address nudge: check card-level override first, then recipient's stored address.
          // The sender's user-profile address is irrelevant here — we need to know
          // whether we have a valid delivery address for this specific recipient/card.
          const cardHasAddress = !!c?.overrideAddress?.line1?.trim();
          const recipientHasAddress = !!r.mailingAddress?.line1?.trim();
          const needsAddressNudge = !cardHasAddress && !recipientHasAddress;
          return (
            <div>
              {/* Header */}
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "1.8rem" : "2.2rem", letterSpacing: "0.03em", color: INK, margin: 0, lineHeight: 1 }}>
                  Good start.
                </h1>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: MID, margin: "4px 0 0" }}>
                  You've got {r.name} covered.
                </p>
              </div>

              {/* Success strip */}
              <div style={{ background: SAGE, borderRadius: 12, padding: "14px 20px", marginBottom: 20, color: WHITE, display: "flex", alignItems: "center", gap: 12 }}>
                <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.08em" }}>FIRST CARD READY</div>
                  <div style={{ fontSize: "0.82rem", opacity: 0.85 }}>
                    {c ? `${c.holiday} card for ${r.name} is ${c.status === "Approved" ? "approved and queued" : "ready for your approval"}.` : "Your card is being prepared."}
                  </div>
                </div>
              </div>

              {/* Recipient + card tile */}
              <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: "22px 24px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${RED}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 700, color: RED, flexShrink: 0 }}>
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem", color: INK }}>{r.name}</div>
                    <div style={{ fontSize: "0.85rem", color: MID }}>{r.relationship}</div>
                  </div>
                  {c && (
                    <div style={{ marginLeft: "auto", padding: "5px 12px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 700,
                      background: c.status === "Approved" ? `${SAGE}20` : `${RED}15`,
                      color: c.status === "Approved" ? SAGE : RED, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>
                      {c.status}
                    </div>
                  )}
                </div>

                {c && (
                  <div style={{ padding: "14px 16px", borderRadius: 10, background: BEIGE, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: MID, marginBottom: 6 }}>
                      {c.holiday} · {c.dueDate}
                    </div>
                    {c.approvedMessage && (
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: INK, lineHeight: 1.6,
                        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                        {c.approvedMessage}
                      </div>
                    )}
                    <button
                      onClick={() => setViewingCardId(c.id)}
                      style={{ marginTop: 10, fontSize: "0.82rem", fontWeight: 600, color: RED, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                      View full card <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Address nudge */}
              {needsAddressNudge && (
                <div style={{ background: `${RED}08`, borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: `1px solid ${RED}20`, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>📬</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: INK, marginBottom: 3 }}>Add an address so we can send {r.name}'s card</div>
                    <div style={{ fontSize: "0.82rem", color: MID }}>Without one, the card stays in draft. Takes 30 seconds.</div>
                  </div>
                  <button
                    onClick={() => setLocation(`/relationship/${r.id}`)}
                    style={{ flexShrink: 0, padding: "9px 18px", borderRadius: 9, background: RED, color: WHITE, border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                    Add it →
                  </button>
                </div>
              )}

              {/* Add another person CTA */}
              <Link href="/recipients/new">
                <button style={{ width: "100%", padding: "15px", borderRadius: 12, border: `2px dashed ${BORDER}`,
                  background: "transparent", color: MID, fontSize: "1rem", fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <Plus size={18} style={{ color: RED }} />
                  Add another person
                </button>
              </Link>

              {/* Dismiss — prevents re-showing on future visits */}
              <div style={{ textAlign: "center" as const, marginTop: 16 }}>
                <button
                  onClick={() => {
                    localStorage.setItem("fi_forgot_first_time_seen", "1");
                    setFirstTimeDismissed(true);
                  }}
                  style={{ background: "none", border: "none", color: MID, fontSize: "0.82rem", cursor: "pointer",
                    textDecoration: "underline", opacity: 0.6 }}>
                  Show me the full dashboard
                </button>
              </div>
            </div>
          );
        })()}

        {recipients.length > 0 && !isFirstTimeState && (
          <>
            {/* ── Summary banner ───────────────────────────────────────── */}
            {(() => {
              const upcoming60 = allUpcomingEvents.filter(e => e.daysAway <= 60);
              const cardsReady = upcoming60.filter(ev => upcomingWithCardKeys.has(`${ev.recipient.id}:::${ev.event}`)).length;
              const stats = [
                { label: "People", value: recipients.length, color: INK },
                { label: "Upcoming", value: upcoming60.length, color: INK },
                { label: "Cards Ready", value: cardsReady, color: SAGE },
                { label: "At Risk", value: momentsAtRisk, color: momentsAtRisk > 0 ? RED : SAGE },
              ];
              return (
                <div style={{
                  background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`,
                  padding: "14px 18px", marginBottom: 24,
                  display: "grid", gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 0,
                }}>
                  {stats.map((s, i) => (
                    <div key={s.label} style={{
                      textAlign: "center" as const,
                      borderRight: i < stats.length - 1 ? `1px solid ${BORDER}` : "none",
                      padding: "2px 8px",
                    }}>
                      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", color: MID, marginTop: 2, textTransform: "uppercase" as const }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* ── Section 1: Need a Card Right Now? ───────────────────── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                background: WHITE, borderRadius: 12, padding: "16px 18px",
                border: `1px solid ${BORDER}`,
              }}>
                <div style={{
                  display: "flex", alignItems: "flex-start",
                  justifyContent: "space-between", gap: 16,
                  flexWrap: "wrap" as const,
                }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{
                      fontFamily: "'Bebas Neue', cursive", fontSize: "1rem",
                      letterSpacing: "0.08em", color: INK, marginBottom: 3,
                    }}>
                      Need a Card Right Now?
                    </div>
                    <div style={{ fontSize: "0.8rem", color: MID, marginBottom: 11, lineHeight: 1.4 }}>
                      Create a personalized card for anyone.
                    </div>
                    <Link href="/quick-card">
                      <button style={{
                        background: RED, color: WHITE, border: "none", borderRadius: 8,
                        padding: "8px 16px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                      }}>
                        Create Quick Card
                      </button>
                    </Link>
                    <div style={{ fontSize: "0.72rem", color: MID, marginTop: 7 }}>
                      No recipient setup required.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 3: Upcoming Occasions ────────────────────────── */}
            {(() => {
              const upcoming60 = allUpcomingEvents.filter(e => e.daysAway <= 60);
              if (upcoming60.length === 0) return null;

              // Group by event name, preserving soonest-first order
              const grouped = new Map<string, typeof upcoming60>();
              for (const ev of upcoming60) {
                if (!grouped.has(ev.event)) grouped.set(ev.event, []);
                grouped.get(ev.event)!.push(ev);
              }

              const next30 = upcoming60.filter(e => e.daysAway <= 30);
              const activeEvent = expandedEvents.size > 0 ? Array.from(expandedEvents)[0] : null;
              const activeEntries = activeEvent === "__next30__"
                ? next30
                : activeEvent ? (grouped.get(activeEvent) ?? []) : [];

              const toggleBubble = (key: string) => setExpandedEvents(() => {
                const s = new Set<string>();
                if (!expandedEvents.has(key)) s.add(key);
                return s;
              });

              return (
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: isMobile ? "1.6rem" : "1.9rem",
                    letterSpacing: "0.03em", color: INK, margin: "0 0 14px", lineHeight: 1,
                  }}>
                    Upcoming Occasions — We Got Your Back
                  </h2>

                  {/* Bubble row */}
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: activeEvent ? 14 : 0 }}>

                    {/* ── Next 30 Days pill (always first) ── */}
                    {(() => {
                      const isActive = expandedEvents.has("__next30__");
                      const n30ready = next30.filter(ev => upcomingWithCardKeys.has(`${ev.recipient.id}:::${ev.event}`)).length;
                      return (
                        <button onClick={() => toggleBubble("__next30__")} style={{
                          display: "inline-flex", alignItems: "center", gap: 7,
                          padding: "9px 15px", borderRadius: 999, cursor: "pointer",
                          border: `2px solid ${isActive ? INK : BORDER}`,
                          background: isActive ? INK : WHITE,
                          color: isActive ? WHITE : INK,
                          fontWeight: 700, fontSize: "0.88rem",
                          boxShadow: isActive ? `0 2px 10px ${INK}30` : "none",
                        }}>
                          <span>Next 30 Days</span>
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 22, height: 22, borderRadius: "50%",
                            background: isActive ? "rgba(255,255,255,0.2)" : `${INK}12`,
                            color: isActive ? WHITE : INK,
                            fontSize: "0.75rem", fontWeight: 800,
                          }}>{next30.length}</span>
                          {next30.length > 0 && n30ready === next30.length && (
                            <span style={{ fontSize: "0.78rem", opacity: 0.85 }}>✓</span>
                          )}
                        </button>
                      );
                    })()}

                    {/* ── Per-event bubbles ── */}
                    {Array.from(grouped.entries()).map(([eventName, entries]) => {
                      const soonest    = entries[0];
                      const urgent     = soonest.daysAway <= 7;
                      const near       = soonest.daysAway <= 14;
                      const accent     = urgent ? RED : near ? AMBER : SAGE;
                      const total      = entries.length;
                      const readyCount = entries.filter(ev => upcomingWithCardKeys.has(`${ev.recipient.id}:::${ev.event}`)).length;
                      const isActive   = expandedEvents.has(eventName);

                      return (
                        <button key={eventName} onClick={() => toggleBubble(eventName)} style={{
                          display: "inline-flex", alignItems: "center", gap: 7,
                          padding: "9px 15px", borderRadius: 999, cursor: "pointer",
                          border: `2px solid ${isActive ? accent : BORDER}`,
                          background: isActive ? accent : WHITE,
                          color: isActive ? WHITE : INK,
                          fontWeight: 700, fontSize: "0.88rem",
                          boxShadow: isActive ? `0 2px 10px ${accent}40` : "none",
                          transition: "all 0.15s",
                        }}>
                          <span>{eventName}</span>
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 22, height: 22, borderRadius: "50%",
                            background: isActive ? "rgba(255,255,255,0.25)" : `${accent}18`,
                            color: isActive ? WHITE : accent,
                            fontSize: "0.75rem", fontWeight: 800,
                          }}>{total}</span>
                          {readyCount === total && (
                            <span style={{ fontSize: "0.78rem", opacity: 0.85 }}>✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Expanded recipient list */}
                  {activeEvent && activeEntries.length > 0 && (
                    <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                      {activeEntries.map((ev, idx) => {
                        const urgent  = ev.daysAway <= 7;
                        const near    = ev.daysAway <= 14;
                        const accent  = urgent ? RED : near ? AMBER : SAGE;
                        const hasCard = upcomingWithCardKeys.has(`${ev.recipient.id}:::${ev.event}`);
                        return (
                          <div key={`${ev.recipient.id}-${ev.event}`} style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "12px 16px",
                            borderBottom: idx < activeEntries.length - 1 ? `1px solid ${BORDER}` : "none",
                          }}>
                            {/* Avatar */}
                            <div style={{
                              width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                              background: INK, display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", color: WHITE, letterSpacing: "0.04em" }}>
                                {ev.recipient.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()}
                              </span>
                            </div>
                            {/* Name + event + date */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                <div
                                  onClick={() => setLocation(`/relationship/${ev.recipient.id}`)}
                                  style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.25rem", color: INK, cursor: "pointer", letterSpacing: "0.02em", lineHeight: 1, display: "inline-flex", alignItems: "center", gap: 5 }}
                                >
                                  {ev.recipient.name.toUpperCase()}
                                  <span style={{ fontSize: "0.7rem", color: MID, fontWeight: 400, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>↗</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                                  <span style={{
                                    display: "inline-flex", alignItems: "center", gap: 3,
                                    fontSize: "0.68rem", fontWeight: 600,
                                    background: BEIGE, border: `1px solid ${BORDER}`,
                                    borderRadius: 999, padding: "2px 7px", color: INK,
                                  }}>
                                    {eventEmoji(ev.event)} {ev.event}
                                  </span>
                                  <span style={{ fontSize: "0.72rem", color: MID, whiteSpace: "nowrap" as const }}>{fmtDate(ev.dateStr)}</span>
                                </div>
                              </div>
                            </div>
                            {/* Day badge */}
                            <div style={{
                              width: 46, height: 46, borderRadius: 9, flexShrink: 0,
                              background: urgent ? RED : "#F8F3EC",
                              border: urgent ? "none" : `1px solid ${BORDER}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <div style={{ textAlign: "center" as const, lineHeight: 1 }}>
                                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: urgent ? WHITE : INK, lineHeight: 1 }}>{ev.daysAway}</div>
                                <div style={{ fontSize: "0.5rem", fontWeight: 800, letterSpacing: "0.07em", color: urgent ? "rgba(255,255,255,0.7)" : MID, lineHeight: 1, marginTop: 3, textTransform: "uppercase" as const }}>days</div>
                              </div>
                            </div>
                            {/* Action */}
                            <button
                              onClick={() => setLocation(`/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}`)}
                              style={{
                                padding: "6px 13px", borderRadius: 8, cursor: "pointer", flexShrink: 0,
                                border: "none",
                                background: hasCard ? `${SAGE}20` : accent,
                                color: hasCard ? SAGE : WHITE,
                                fontWeight: 700, fontSize: "0.72rem", whiteSpace: "nowrap" as const,
                              }}
                            >
                              {hasCard ? "Card Ready ✓" : "Write Card ✦"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── Section 4: Your Important People ────────────────────── */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 14, gap: 12,
              }}>
                <h1 style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: isMobile ? "1.6rem" : "1.9rem",
                  letterSpacing: "0.03em", color: INK, margin: 0, lineHeight: 1,
                }}>
                  Your Important People
                </h1>
                <Link href="/recipients/new" style={{ textDecoration: "none", flexShrink: 0 }}>
                  <button style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "none", border: `1px solid ${BORDER}`, borderRadius: 8,
                    padding: "6px 12px", fontSize: "0.76rem", fontWeight: 600,
                    color: MID, cursor: "pointer",
                  }}>
                    <Plus size={12} /> Add Person
                  </button>
                </Link>
              </div>
              <RelationshipHealthSection isMobile={isMobile} />
            </div>

            {/* ── Plan usage — subtle ──────────────────────────────────── */}
            <div style={{
              background: WHITE, borderRadius: 10, padding: "10px 14px",
              border: `1px solid ${BORDER}`, marginBottom: 16,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 5,
                }}>
                  <span style={{ fontSize: "0.76rem", fontWeight: 600, color: MID }}>
                    {planConfig.label} · {cardsUsed}/{cardsTotal} cards used
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: atLimit ? RED : MID }}>
                      {cardsLeft} left
                    </span>
                    {plan !== "premium" && (
                      <button onClick={() => setUpgradeOpen(true)}
                        style={{
                          padding: "3px 9px", borderRadius: 6, border: "none",
                          background: atLimit ? RED : `${INK}08`,
                          color: atLimit ? WHITE : MID,
                          fontSize: "0.7rem", fontWeight: 700, cursor: "pointer",
                        }}>
                        {atLimit ? "Upgrade" : "Plans"}
                      </button>
                    )}
                  </div>
                </div>
                <ThinBar pct={usagePct} color={atLimit ? RED : usagePct > 75 ? "#F59E0B" : SAGE} h={3} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center" as const, paddingTop: 16, marginTop: 8 }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: MID }}>
                Thoughtful cards. Stronger relationships. That's what we're here for. ❤️
              </span>
            </div>
          </>
        )}
      </div>
    </div>

    {/* ── Mobile FAB ────────────────────────────────────────────────────── */}
    {isMobile && recipients.length === 0 && (
      <Link href="/recipients/new">
        <button data-testid="link-add-recipient"
          style={{ position: "fixed", bottom: 24, right: 20, zIndex: 200, display: "flex", alignItems: "center", gap: 8, background: RED, color: WHITE, border: "none", borderRadius: 28, padding: "14px 24px", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.08em", boxShadow: "0 4px 20px rgba(226,59,46,0.35)", cursor: "pointer" }}>
          <Plus size={16} /> Add Person
        </button>
      </Link>
    )}

    {/* ── Card viewer modal ─────────────────────────────────────────────── */}
    {viewingCardId && (() => {
      const card = cards.find(c => c.id === viewingCardId);
      if (!card) return null;
      const mailDate = card.dueDate ? new Date(card.dueDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;
      return (
        <div onClick={() => setViewingCardId(null)} style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: 18, width: "100%", maxWidth: 480, maxHeight: "86vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ padding: "20px 22px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: INK }}>{card.holiday} · {card.recipientName}</div>
                {mailDate && <div style={{ fontSize: "0.78rem", color: MID, marginTop: 3 }}>Mailing on {mailDate}</div>}
              </div>
              <button onClick={() => setViewingCardId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: MID, fontSize: "1rem", padding: "2px 6px" }}>✕</button>
            </div>
            <div style={{ margin: "14px 22px 0", display: "flex", gap: 8, background: `${SAGE}10`, border: `1px solid ${SAGE}25`, borderRadius: 8, padding: "10px 14px", alignItems: "center" }}>
              <CheckCircle2 size={14} style={{ color: SAGE }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: SAGE }}>Approved — queued to mail</span>
            </div>
            <div style={{ padding: "18px 22px 28px" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", color: MID, marginBottom: 10 }}>MESSAGE</div>
              <div style={{ background: BEIGE, borderRadius: 10, padding: "16px 18px", fontSize: "0.92rem", lineHeight: 1.8, color: INK, fontFamily: "Georgia, serif", whiteSpace: "pre-wrap" }}>
                {card.approvedMessage || <span style={{ color: MID, fontStyle: "italic" }}>No message on file.</span>}
              </div>
            </div>
          </div>
        </div>
      );
    })()}

    {/* ── Font picker modal ──────────────────────────────────────────────── */}
    {fontPickerOpen && (
      <div onClick={() => setFontPickerOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: 16, padding: "26px 26px 20px", width: 680, maxWidth: "94vw", maxHeight: "86vh", display: "flex", flexDirection: "column" as const, gap: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.22)" }}>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", color: INK }}>Choose a Handwriting Style</div>
          <div style={{ fontSize: "0.86rem", color: MID, marginTop: -8, lineHeight: 1.5 }}>Every card is handwritten with a real pen. Pick the style that feels most like you.</div>
          {fontsLoading ? (
            <div style={{ textAlign: "center" as const, padding: "32px 0", color: MID }}>Loading styles…</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, overflowY: "auto" }}>
              {hwFonts.map((font, idx) => {
                const selected = personalSettings.cardFont === font.id;
                return (
                  <button key={font.id} onClick={() => { updateSettings("cardFont", font.id); setFontPickerOpen(false); }}
                    style={{ border: `2px solid ${selected ? RED : BORDER}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", background: selected ? `${RED}07` : WHITE, textAlign: "left" as const, display: "flex", flexDirection: "column" as const, gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem", color: INK }}>{font.name}</span>
                      {idx === 0 && <span style={{ fontSize: "0.65rem", background: `${INK}08`, color: MID, borderRadius: 20, padding: "2px 8px" }}>Default</span>}
                      {selected && <span style={{ fontSize: "0.65rem", background: RED, color: WHITE, borderRadius: 20, padding: "2px 8px" }}>Selected</span>}
                    </div>
                    {font.previewUrl
                      ? <img src={font.previewUrl} alt={`${font.name} sample`} style={{ width: "100%", height: 140, objectFit: "contain" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      : <div style={{ fontFamily: "cursive", fontSize: "1rem", color: MID, lineHeight: 1.5 }}>Warm wishes and heartfelt thanks!</div>}
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6, borderTop: `1px solid ${BORDER}` }}>
            {personalSettings.cardFont && (
              <button onClick={() => { updateSettings("cardFont", ""); setFontPickerOpen(false); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: MID, fontSize: "0.82rem" }}>
                Clear selection
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button onClick={() => setFontPickerOpen(false)}
              style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontSize: "0.86rem", fontWeight: 700 }}>
              Done
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── Upgrade modal ─────────────────────────────────────────────────── */}
    {upgradeOpen && (
      <div onClick={e => { if (e.target === e.currentTarget) setUpgradeOpen(false); }}
        style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
        <div style={{ background: WHITE, borderRadius: "22px 22px 0 0", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", padding: "26px 24px 36px" }}>
          <div style={{ width: 36, height: 4, background: `${INK}15`, borderRadius: 2, margin: "0 auto 22px" }} />
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", letterSpacing: "0.04em", color: INK, marginBottom: 6 }}>Need More Cards?</div>
          <p style={{ fontSize: "0.88rem", color: MID, marginBottom: 20, lineHeight: 1.6 }}>You've used {cardsUsed} of {cardsTotal} card slots. Upgrade to cover more occasions.</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {(["basic", "standard", "premium"] as Plan[]).map(key => {
              const cfg = PLANS[key]; const isCurrent = key === plan;
              const orderedPlans: Plan[] = ["basic", "standard", "premium"];
              const isUpgrade = orderedPlans.indexOf(key) > orderedPlans.indexOf(plan);
              return (
                <div key={key} style={{ borderRadius: 12, padding: 16, border: `2px solid ${isCurrent ? `${INK}15` : isUpgrade ? `${RED}25` : BORDER}`, background: isCurrent ? BEIGE : WHITE }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", letterSpacing: "0.06em", color: INK }}>{cfg.label}</span>
                        {isCurrent && <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: `${INK}09`, color: MID }}>Current</span>}
                        {key === "standard" && !isCurrent && <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: `${RED}10`, color: RED }}>Popular</span>}
                      </div>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 3 }}>
                        {cfg.perks.map(perk => <li key={perk} style={{ fontSize: "0.78rem", color: INK, display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: SAGE }}>✓</span>{perk}</li>)}
                      </ul>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", color: INK, lineHeight: 1 }}>{cfg.price}</span>
                      {!isCurrent && (
                        <button onClick={() => { upgradePlan(key); setUpgradeOpen(false); }}
                          style={{ background: isUpgrade ? RED : `${INK}08`, color: isUpgrade ? WHITE : MID, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                          {isUpgrade ? "Upgrade" : "Downgrade"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
