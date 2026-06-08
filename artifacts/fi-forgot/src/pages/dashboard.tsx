import { useState, useEffect, useMemo, useRef } from "react";
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
  Search, ArrowRight, Settings, CheckCircle2, TrendingUp, Target,
} from "lucide-react";
import {
  computeOverallHealth, computeCoverage, getRecommendedAction,
  recordScoreSnapshot, getScoreHistory, CAT_LABELS, CAT_DESCRIPTIONS,
  TIER_WEIGHTS, ScoreSnapshot,
} from "@/lib/relationship-health";
import { useBrowniePoints } from "@/lib/brownie-points-context";
import RelationshipHealthSection from "@/components/RelationshipHealthSection";

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

/* ── Account menu ─────────────────────────────────────────────────────────── */
function AccountMenu({ user, onLogout }: { user: { name: string; email: string } | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} data-testid="btn-account-menu"
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: open ? RED : `${INK}12`, color: open ? WHITE : INK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", transition: "all 0.15s" }}>
          {initial}
        </div>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: INK }}>{user?.name?.split(" ")[0]}</span>
        <ChevronDown size={13} style={{ color: MID }} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: WHITE, borderRadius: 12, minWidth: 210, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 200, border: `1px solid ${BORDER}` }}>
          <div style={{ padding: "14px 18px 12px", borderBottom: `1px solid ${BORDER}` }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: INK }}>{user?.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: MID }}>{user?.email}</p>
          </div>
          {[
            { label: "Recipients",       action: () => { setOpen(false); setLocation("/recipients"); } },
            { label: "Account Settings", action: () => alert("Coming soon") },
            { label: "Admin Panel",      action: () => { setOpen(false); setLocation("/admin"); } },
          ].map(item => (
            <button key={item.label} onClick={() => { item.action(); setOpen(false); }}
              style={{ display: "block", width: "100%", padding: "10px 18px", background: "none", border: "none", cursor: "pointer", fontSize: "0.86rem", color: INK, textAlign: "left" as const }}
              onMouseEnter={e => (e.currentTarget.style.background = BEIGE)}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              {item.label}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${BORDER}` }}>
            <button onClick={() => { setOpen(false); onLogout(); }} data-testid="btn-logout"
              style={{ display: "block", width: "100%", padding: "10px 18px", background: "none", border: "none", cursor: "pointer", fontSize: "0.86rem", color: RED, fontWeight: 700, textAlign: "left" as const }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fff5f5")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [cards, setCards]                       = useState<CardOrder[]>([]);
  const [recipients, setRecipients]             = useState<Recipient[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<(QueueItem & { message?: MessageDraft })[]>([]);
  const [search, setSearch]                     = useState("");
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

  const { user, logout, upgradePlan } = useAuth();
  const [, setLocation] = useLocation();
  const plan = (user?.plan ?? "basic") as Plan;

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

  const { balance: brownieBalance } = useBrowniePoints();

  const planConfig = PLANS[plan];
  const cardsUsed  = approvedCards.length;
  const cardsTotal = planConfig.maxCardsPerYear;
  const cardsLeft  = Math.max(0, cardsTotal - cardsUsed);
  const atLimit    = cardsLeft === 0;
  const usagePct   = Math.min(100, Math.round((cardsUsed / Math.max(cardsTotal, 1)) * 100));
  const px         = isMobile ? 16 : 28;
  const firstName  = user?.name?.split(" ")[0] ?? "there";
  const displayScore = Math.min(health.score, 98);

  const filteredRecipients = recipients.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.relationship.toLowerCase().includes(search.toLowerCase())
  );

  const heroEvents = heroExpanded ? allUpcomingEvents : allUpcomingEvents.slice(0, isMobile ? 3 : 2);

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <>
    <div style={{ minHeight: "100vh", background: BEIGE, fontFamily: "'Inter', sans-serif", color: INK }}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: BEIGE, borderBottom: `1px solid ${BORDER}`, padding: `0 ${px}px`, height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" as const }}>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: RED, fontStyle: "italic", letterSpacing: "0.01em", marginRight: 4 }}>F*</span>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", color: INK, letterSpacing: "0.04em" }}>I FORGOT</span>
          </Link>
          {!isMobile && (
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: MID, marginLeft: 16, paddingBottom: 2 }}>
              We got your important people.
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {approvalCount > 0 && (
            <button onClick={() => setLocation("/cards/review")}
              style={{ display: "flex", alignItems: "center", gap: 6, background: RED, color: WHITE, border: "none", borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>
              {approvalCount} to review →
            </button>
          )}
          {brownieBalance > 0 && (
            <Link href="/brownie-points" style={{ textDecoration: "none" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, background: BEIGE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "5px 12px", fontSize: "0.75rem", fontWeight: 700, color: SAGE, cursor: "pointer", whiteSpace: "nowrap" as const }}>
                🍪 {brownieBalance.toLocaleString()}
              </span>
            </Link>
          )}
          <AccountMenu user={user} onLogout={logout} />
        </div>
      </header>

      {/* ── Settings strip ─────────────────────────────────────────────── */}
      <div style={{ background: `${INK}04`, borderBottom: `1px solid ${BORDER}` }}>
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
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: `32px ${px}px 80px`, boxSizing: "border-box" as const }}>

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

        {recipients.length > 0 && (
          <>
            {/* Page greeting */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "2.1rem" : "2.8rem", letterSpacing: "0.03em", color: INK, margin: 0, lineHeight: 1 }}>
                {allUpcomingEvents.length > 0
                  ? `Here's Who Needs You, ${firstName}.`
                  : `You're All Clear, ${firstName}.`}
              </h1>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: MID, margin: "8px 0 0" }}>
                {allUpcomingEvents.length > 0 ? "Upcoming moments — all covered." : "No occasions in the next 90 days."}
              </p>
            </div>

            {/* ── Two-column layout (desktop) ──────────────────────────── */}
            <div style={{
              display: isMobile ? "block" : "grid",
              gridTemplateColumns: "1fr 360px",
              gap: 28,
              alignItems: "start",
            }}>

              {/* ╔══════════════════════════════════════════════════════════╗
                  ║  LEFT COLUMN — People & Relationships                   ║
                  ╚══════════════════════════════════════════════════════════╝ */}
              <div>

                {/* ── Hero: Upcoming moments ──────────────────────────── */}
                <div style={{ marginBottom: 36 }}>
                  {allUpcomingEvents.length === 0 ? (
                    <div style={{ background: WHITE, borderRadius: 18, padding: "36px 28px", textAlign: "center" as const, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: "2rem", marginBottom: 12 }}>🎉</div>
                      <p style={{ fontSize: "0.95rem", color: MID, margin: "0 0 18px", lineHeight: 1.65 }}>Nothing in the next 90 days. Add more occasions to stay covered year-round.</p>
                      <Link href="/recipients"><button style={{ background: BEIGE, border: `1px solid ${BORDER}`, borderRadius: 9, padding: "10px 20px", fontSize: "0.86rem", fontWeight: 700, color: INK, cursor: "pointer" }}>Review people →</button></Link>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
                        {heroEvents.map(ev => {
                          const genKey       = `${ev.recipient.id}:::${ev.event}`;
                          const isGenerating = generatingFor === genKey;
                          const matchedCard  = cards.find(c => c.recipientId === ev.recipient.id && c.holiday === ev.event);
                          const hasCard      = upcomingWithCardKeys.has(genKey);
                          const isApproved   = matchedCard?.status === "Approved";
                          const rh           = health.recipientHealths.find(h => h.id === ev.recipient.id);
                          const sl           = rh ? personScoreLabel(rh.score) : null;

                          let statusText = ""; let statusColor = MID; let statusGood = false;
                          if (isApproved)             { statusText = "Card approved, on its way";       statusColor = SAGE;      statusGood = true; }
                          else if (hasCard)           { statusText = "Card draft ready to review";      statusColor = "#1d4ed8"; statusGood = true; }
                          else if (ev.briefingDone)   { statusText = "Personalized and on track";       statusColor = SAGE;      statusGood = true; }
                          else if (ev.daysAway <= 7)  { statusText = "Needs attention soon";            statusColor = RED; }
                          else if (ev.daysAway <= 14) { statusText = "Add one more detail to be ready"; statusColor = "#D97706"; }
                          else                        { statusText = "On track — nothing needed yet";   statusColor = SAGE;      statusGood = true; }

                          let ctaLabel = ""; let ctaRed = false; let ctaAction = () => {};
                          if (isApproved)           { ctaLabel = "View card";          ctaRed = false; ctaAction = () => setViewingCardId(matchedCard!.id); }
                          else if (hasCard)         { ctaLabel = "Review card →";      ctaRed = true;  ctaAction = () => setLocation("/cards/review"); }
                          else if (ev.briefingDone) { ctaLabel = "Update details";     ctaRed = false; ctaAction = () => setLocation(`/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}`); }
                          else if (ev.daysAway<=7)  { ctaLabel = "Add details now →"; ctaRed = true;  ctaAction = () => setLocation(`/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}`); }
                          else                      { ctaLabel = "Add a memory";       ctaRed = false; ctaAction = () => setLocation(`/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}`); }

                          return (
                            <div key={genKey} style={{ background: WHITE, borderRadius: 18, padding: "20px 20px 18px", border: `1px solid ${BORDER}`, display: "flex", gap: 16, position: "relative" as const, overflow: "hidden" }}>
                              {ev.daysAway <= 14 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: ev.daysAway <= 7 ? RED : "#D97706", borderRadius: "18px 18px 0 0" }} />}

                              {/* Avatar */}
                              <div style={{ width: 54, height: 54, borderRadius: 13, background: INK, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: WHITE }}>
                                  {ev.recipient.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()}
                                </span>
                              </div>

                              {/* Content */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {/* Person */}
                                <div style={{ marginBottom: 10 }}>
                                  <div style={{ fontWeight: 800, fontSize: "1.15rem", color: INK, lineHeight: 1 }}>{ev.recipient.name}</div>
                                  <div style={{ fontSize: "0.78rem", color: MID, marginTop: 3 }}>{ev.recipient.relationship}</div>
                                  {sl && <span style={{ display: "inline-block", marginTop: 5, fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: `${sl.color}14`, color: sl.color }}>{sl.text}</span>}
                                </div>

                                {/* Event + days */}
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                  <span style={{ fontSize: "1.4rem" }}>{eventEmoji(ev.event)}</span>
                                  <div>
                                    <span style={{ fontWeight: 700, fontSize: "0.96rem", color: INK }}>{ev.event}</span>
                                    <span style={{ fontSize: "0.84rem", fontWeight: 700, color: daysColor(ev.daysAway), marginLeft: 10 }}>{ev.daysAway}d away</span>
                                    <span style={{ fontSize: "0.78rem", color: MID, marginLeft: 6 }}>· {new Date(ev.dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                  </div>
                                </div>

                                {/* Status + CTAs in one row */}
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", fontWeight: 600, color: statusColor }}>
                                    {statusGood
                                      ? <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
                                      : <span style={{ width: 13, height: 13, borderRadius: "50%", border: `2px solid ${statusColor}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.55rem", fontWeight: 900 }}>!</span>}
                                    {statusText}
                                  </div>
                                  <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                                    <button onClick={ctaAction} style={{ padding: "7px 14px", background: ctaRed ? RED : `${INK}08`, color: ctaRed ? WHITE : INK, border: "none", borderRadius: 9, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                                      {ctaLabel}
                                    </button>
                                    {!hasCard && !isApproved && !isGenerating && (
                                      <button onClick={() => generateEarly(ev)} disabled={!!generatingFor}
                                        style={{ padding: "7px 11px", background: "none", border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: "0.76rem", color: MID, cursor: !!generatingFor ? "default" : "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                                        <Sparkles size={11} /> Generate
                                      </button>
                                    )}
                                    {isGenerating && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.76rem", color: MID, padding: "7px 11px" }}><Loader2 size={11} className="animate-spin" /> Writing…</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Show more / Add */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                        {allUpcomingEvents.length > (isMobile ? 3 : 2) && (
                          <button onClick={() => setHeroExpanded(o => !o)}
                            style={{ flex: 1, padding: "9px", background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: "0.82rem", color: MID, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                            {heroExpanded
                              ? <><ChevronUp size={13} /> Show fewer</>
                              : <><ChevronDown size={13} /> {allUpcomingEvents.length - (isMobile ? 3 : 2)} more upcoming</>}
                          </button>
                        )}
                        <Link href="/recipients/new">
                          <button data-testid="link-add-recipient"
                            style={{ padding: "9px 16px", background: "none", border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: "0.82rem", color: MID, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                            <Plus size={12} /> Add person
                          </button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>

                {/* ── Relationship Health ──────────────────────────── */}
                <RelationshipHealthSection isMobile={isMobile} />
              </div>

              {/* ╔══════════════════════════════════════════════════════════╗
                  ║  RIGHT COLUMN — Status, Scores, Wins                    ║
                  ╚══════════════════════════════════════════════════════════╝ */}
              <div style={{ marginTop: isMobile ? 36 : 0 }}>

                {/* ── We Got Your Back ───────────────────────────────── */}
                <div style={{ marginBottom: 28 }}>
                  <SHead text="We Got Your Back" sub="Everything important is being watched." />
                  <div style={{ background: WHITE, borderRadius: 16, padding: "18px 20px", border: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", flexDirection: "column" as const, gap: 13 }}>
                      {weGotYourBack.map((line, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {line.good
                            ? <CheckCircle2 size={17} style={{ color: SAGE, flexShrink: 0 }} />
                            : <div style={{ width: 17, height: 17, borderRadius: "50%", border: `2px solid ${RED}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: "0.6rem", fontWeight: 900, color: RED }}>!</span>
                              </div>}
                          <span style={{ fontSize: "0.9rem", color: INK, fontWeight: line.good ? 500 : 600 }}>{line.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Recommended Next Step ──────────────────────────── */}
                <div style={{ marginBottom: 28 }}>
                  <SHead text="Recommended Next Step" />
                  <div style={{
                    background: recommendedAction.urgency === "high" ? "#FFF5F5" : WHITE,
                    border: `1.5px solid ${recommendedAction.urgency === "high" ? `${RED}25` : BORDER}`,
                    borderRadius: 16, padding: "18px 18px",
                    display: "flex", gap: 14, alignItems: "flex-start",
                  }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: recommendedAction.urgency === "high" ? `${RED}12` : `${SAGE}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.2rem" }}>
                      {recommendedAction.type === "approve_card"     ? "📬"
                      : recommendedAction.type === "answer_briefing" ? "✍️"
                      : recommendedAction.type === "add_person"      ? "👤"
                      :                                                "🌱"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.96rem", color: INK, marginBottom: 5 }}>{recommendedAction.title}</div>
                      <div style={{ fontSize: "0.84rem", color: MID, lineHeight: 1.6, marginBottom: 13 }}>{recommendedAction.description}</div>
                      <button
                        onClick={() => { if (recommendedAction.href.startsWith("/")) setLocation(recommendedAction.href); else window.location.href = recommendedAction.href; }}
                        style={{ background: recommendedAction.urgency === "high" ? RED : INK, color: WHITE, border: "none", borderRadius: 9, padding: "9px 18px", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {recommendedAction.type === "approve_card"     ? "Review cards"
                        : recommendedAction.type === "answer_briefing" ? "Add a personal touch"
                        : recommendedAction.type === "add_person"      ? "Add person"
                        :                                                "Improve profile"}
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Brownie Points ─────────────────────────────────── */}
                {health.score > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <SHead text="Brownie Points" emoji="🍫" />
                    <div style={{ background: WHITE, borderRadius: 16, padding: "20px 20px", border: `1px solid ${BORDER}` }}>
                      {/* Score + label */}
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 14 }}>
                        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "4.2rem", color: health.color, lineHeight: 1, letterSpacing: "-0.02em" }}>{displayScore}</div>
                        <div style={{ paddingBottom: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: health.color }}>{health.label}</div>
                          {scoreDelta !== null && Math.abs(scoreDelta) >= 1 && (
                            <div style={{ marginTop: 5, display: "inline-flex", alignItems: "center", gap: 5, background: scoreDelta > 0 ? `${SAGE}12` : "#FFF5F5", borderRadius: 20, padding: "3px 9px" }}>
                              <TrendingUp size={10} style={{ color: scoreDelta > 0 ? SAGE : RED }} />
                              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: scoreDelta > 0 ? SAGE : RED }}>{scoreDelta > 0 ? "+" : ""}{scoreDelta} this month</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: "0.88rem", color: MID, lineHeight: 1.65, margin: "0 0 16px" }}>{health.tagline}</p>
                      <button onClick={() => {
                        if (health.topInsight) {
                          const rh = health.recipientHealths.find(r => r.name === health.topInsight?.recipientName);
                          setLocation(rh?.topGapHref ?? "/recipients");
                        } else setLocation("/recipients");
                      }}
                        style={{ padding: "8px 16px", background: BEIGE, border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: "0.84rem", fontWeight: 600, color: INK, cursor: "pointer", marginBottom: 14 }}>
                        Improve a profile →
                      </button>

                      {/* Collapsible levels */}
                      <button onClick={() => setLevelsOpen(o => !o)}
                        style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "0.76rem", color: MID }}>
                        {levelsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {levelsOpen ? "Hide levels" : "Show Brownie Points levels"}
                      </button>
                      {levelsOpen && (
                        <div style={{ display: "flex", flexDirection: "column" as const, gap: 4, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                          {[
                            { range: "91–98", label: "Legend Status",           color: "#4CAF50" },
                            { range: "76–90", label: "Thoughtful Human",        color: "#26A69A" },
                            { range: "51–75", label: "Building Momentum",       color: "#FFA726" },
                            { range: "26–50", label: "Staying Out of Trouble",  color: "#FF7043" },
                            { range: "0–25",  label: "Just Surviving",          color: "#9E9E9E" },
                          ].map(level => {
                            const isCurrent = level.label === health.label;
                            return (
                              <div key={level.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: 6, background: isCurrent ? `${level.color}12` : "none" }}>
                                <span style={{ fontSize: "0.68rem", color: level.color, width: 34, flexShrink: 0, fontWeight: isCurrent ? 700 : 400 }}>{level.range}</span>
                                <span style={{ fontSize: "0.76rem", color: isCurrent ? level.color : MID, fontWeight: isCurrent ? 700 : 400 }}>{level.label}</span>
                                {isCurrent && <span style={{ fontSize: "0.65rem", color: level.color, marginLeft: 2 }}>← you</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Recent Wins ────────────────────────────────────── */}
                {wins.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <SHead text="Recent Wins" emoji="🎉" />
                    <div style={{ background: WHITE, borderRadius: 16, overflow: "hidden", border: `1px solid ${BORDER}` }}>
                      {wins.map((win, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "13px 18px", borderBottom: i < wins.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                          <CheckCircle2 size={15} style={{ color: SAGE, flexShrink: 0, marginTop: 1 }} />
                          <span style={{ fontSize: "0.87rem", color: INK, lineHeight: 1.55 }}>{win}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Plan usage ─────────────────────────────────────── */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ background: WHITE, borderRadius: 14, padding: "15px 18px", border: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: INK }}>{planConfig.label} · {cardsUsed}/{cardsTotal} cards</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: atLimit ? RED : MID }}>{cardsLeft} left</span>
                        {plan !== "premium" && (
                          <button onClick={() => setUpgradeOpen(true)}
                            style={{ padding: "5px 11px", borderRadius: 7, border: "none", background: atLimit ? RED : `${INK}08`, color: atLimit ? WHITE : MID, fontSize: "0.76rem", fontWeight: 700, cursor: "pointer" }}>
                            {atLimit ? "Upgrade" : "Plans"}
                          </button>
                        )}
                      </div>
                    </div>
                    <ThinBar pct={usagePct} color={atLimit ? RED : usagePct > 75 ? "#F59E0B" : SAGE} h={4} />
                  </div>
                </div>

                {/* ── Make future cards better ───────────────────────── */}
                <div style={{ marginBottom: 28 }}>
                  <button onClick={() => setInsightsOpen(o => !o)}
                    style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: insightsOpen ? 14 : 0 }}>
                    <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.65rem", letterSpacing: "0.02em", color: INK, margin: 0, lineHeight: 1 }}>Make Cards Better</h2>
                    {insightsOpen ? <ChevronUp size={15} style={{ color: MID }} /> : <ChevronDown size={15} style={{ color: MID }} />}
                  </button>

                  {insightsOpen && (
                    <div style={{ background: WHITE, borderRadius: 16, padding: "18px 20px", border: `1px solid ${BORDER}` }}>
                      <p style={{ fontSize: "0.86rem", color: MID, margin: "0 0 18px", lineHeight: 1.65 }}>
                        The more we know about your people, the more personal your cards become.
                      </p>
                      <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, marginBottom: health.topInsight ? 18 : 0 }}>
                        {Object.entries(
                          health.recipientHealths.reduce<Record<string, { score: number; max: number }>>((acc, rh) => {
                            for (const [k, v] of Object.entries(rh.categories)) {
                              if (!acc[k]) acc[k] = { score: 0, max: 0 };
                              acc[k].score += v.score * TIER_WEIGHTS[rh.tier];
                              acc[k].max   += v.max   * TIER_WEIGHTS[rh.tier];
                            }
                            return acc;
                          }, {})
                        ).map(([catKey, { score, max }]) => {
                          const pct = Math.round((score / Math.max(max, 1)) * 100);
                          const c   = pct >= 65 ? SAGE : pct >= 45 ? "#F59E0B" : "#EF6C00";
                          return (
                            <div key={catKey}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                                <span style={{ fontSize: "0.86rem", fontWeight: 700, color: INK }}>{CAT_LABELS[catKey]}</span>
                                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: c }}>{pct}%</span>
                              </div>
                              <ThinBar pct={pct} color={c} h={4} />
                            </div>
                          );
                        })}
                      </div>
                      {health.topInsight && (
                        <div style={{ marginTop: 18, borderTop: `1px solid ${BORDER}`, paddingTop: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <Target size={15} style={{ color: SAGE, flexShrink: 0, marginTop: 2 }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: INK, marginBottom: 4 }}>{health.topInsight.action}</div>
                            <div style={{ fontSize: "0.8rem", color: MID, lineHeight: 1.6 }}>
                              For <strong>{health.topInsight.recipientName}</strong> — this helps cards sound like they're really from you.
                            </div>
                            <Link href={`/recipients/${health.recipientHealths.find(rh => rh.name === health.topInsight?.recipientName)?.id ?? ""}`}>
                              <button style={{ marginTop: 9, padding: "6px 13px", background: `${INK}07`, color: INK, border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                                Add details →
                              </button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── People You May Be Forgetting ───────────────────── */}
                {coverage.gaps.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <SHead text="People You May Be Forgetting" sub="Make sure the important people in your life are covered." />
                    <div style={{ background: WHITE, borderRadius: 14, padding: "6px 0", border: `1px solid ${BORDER}` }}>
                      {coverage.gaps.map((gap, i, arr) => (
                        <div key={gap.relationship} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                          <div style={{ width: 38, height: 38, borderRadius: 9, background: BEIGE, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>👤</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: INK }}>Your {gap.relationship}</div>
                            <div style={{ fontSize: "0.78rem", color: MID, marginTop: 2 }}>{gap.suggestion}</div>
                          </div>
                          <Link href="/recipients/new">
                            <button style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: `${INK}07`, color: INK, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>+ Add</button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* end right column */}
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center" as const, paddingTop: 20, marginTop: 8 }}>
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
