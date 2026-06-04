import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  getCards, getRecipients, getBriefingsForRecipient,
  CardOrder, Recipient, saveCard,
  getPersonalSettings, savePersonalSettings, PersonalSettings,
  childrenSummary, getYearsTogether,
  TONES,
} from "@/lib/data";
import { getCustomerPendingApprovals, QueueItem, MessageDraft } from "@/lib/admin-data";
import { useAuth } from "@/lib/auth-context";
import { Plan, PLANS } from "@/lib/plan";
import {
  Plus, Sparkles, Loader2, ChevronDown, ChevronUp,
  Search, Clock, ArrowRight, Settings, CheckCircle2,
  TrendingUp, Target, ThumbsUp, Shield,
} from "lucide-react";
import {
  computeOverallHealth, computeCoverage, getRecommendedAction,
  recordScoreSnapshot, getScoreHistory, CAT_LABELS, CAT_DESCRIPTIONS,
  getEventStatus, TIER_WEIGHTS,
  ScoreSnapshot,
} from "@/lib/relationship-health";

interface HwFont { id: string; name: string; previewUrl?: string; }

/* ── Brand colours ────────────────────────────────────────────────────────── */
const BEIGE = "#F2E6D3";
const RED   = "#E23B2E";
const BLACK = "#111111";
const WHITE = "#FFFFFF";
const GRAY  = "#6B6B6B";
const SAGE  = "#5B8C6B";

/* ── Event emojis ─────────────────────────────────────────────────────────── */
function eventEmoji(event: string): string {
  const map: Record<string, string> = {
    "Birthday": "🎂", "Anniversary": "💕", "Mother's Day": "🌸",
    "Father's Day": "🎩", "Valentine's Day": "❤️", "Christmas": "🎄",
    "Hanukkah": "🕎", "Thanksgiving": "🍂", "Easter": "🐣", "New Year's": "🥂",
  };
  return map[event] ?? "🎉";
}

/* ── Score → human label ──────────────────────────────────────────────────── */
function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: "Strong Profile",    color: SAGE };
  if (score >= 65) return { text: "Good Foundation",   color: "#26A69A" };
  if (score >= 45) return { text: "Building Up",       color: "#F59E0B" };
  if (score >= 25) return { text: "Just Starting",     color: "#EF6C00" };
  return               { text: "Getting Started",  color: GRAY };
}

/* ── Holiday fixed dates ──────────────────────────────────────────────────── */
const HOLIDAY_DATES: Record<string, { month: number; day: number }> = {
  "Valentine's Day": { month: 2,  day: 14 }, "Mother's Day":  { month: 5,  day: 12 },
  "Father's Day":    { month: 6,  day: 16 }, "Thanksgiving":  { month: 11, day: 28 },
  "Christmas":       { month: 12, day: 25 }, "Hanukkah":      { month: 12, day: 26 },
  "New Year's":      { month: 1,  day: 1  }, "Easter":        { month: 4,  day: 20 },
};

function getEventDate(event: string, r: Recipient): string | null {
  const now = new Date(); const year = now.getFullYear();
  const pad  = (n: number) => String(n).padStart(2, "0");
  const next = (stored: string) => {
    const p = stored.split("-").map(Number);
    let d = new Date(year, p[1] - 1, p[2]);
    if (d < now) d = new Date(year + 1, p[1] - 1, p[2]);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  if (event === "Birthday"    && r.birthday)  return next(r.birthday);
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

type PendingApproval = QueueItem & { message?: MessageDraft };

/* ── Thin bar ─────────────────────────────────────────────────────────────── */
function ThinBar({ pct, color = SAGE, h = 4 }: { pct: number; color?: string; h?: number }) {
  return (
    <div style={{ height: h, background: `${BLACK}0C`, borderRadius: h, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: color, borderRadius: h, transition: "width 0.6s ease" }} />
    </div>
  );
}

/* ── Warm account menu ────────────────────────────────────────────────────── */
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
      <button
        onClick={() => setOpen(o => !o)}
        data-testid="btn-account-menu"
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 8,
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: open ? RED : `${BLACK}15`,
          color: open ? WHITE : BLACK,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem",
          transition: "all 0.15s",
        }}>{initial}</div>
        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: BLACK }}>
          {user?.name?.split(" ")[0]}
        </span>
        <ChevronDown size={13} style={{ color: GRAY }} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: WHITE, borderRadius: 12, minWidth: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 200, border: `1px solid ${BLACK}0C` }}>
          <div style={{ padding: "12px 16px 10px", borderBottom: `1px solid ${BLACK}07` }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.86rem", color: BLACK }}>{user?.name}</p>
            <p style={{ margin: 0, fontSize: "0.72rem", color: GRAY }}>{user?.email}</p>
          </div>
          {[
            { label: "Account Settings", action: () => alert("Coming soon") },
            { label: "Billing & Plan",   action: () => alert("Coming soon") },
            { label: "Admin Panel",      action: () => { setOpen(false); setLocation("/admin"); } },
          ].map(item => (
            <button key={item.label} onClick={() => { item.action(); setOpen(false); }}
              style={{ display: "block", width: "100%", padding: "9px 16px", background: "none", border: "none", cursor: "pointer", fontSize: "0.84rem", color: "#334155", textAlign: "left" as const }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              {item.label}
            </button>
          ))}
          <div style={{ borderTop: `1px solid ${BLACK}07` }}>
            <button onClick={() => { setOpen(false); onLogout(); }} data-testid="btn-logout"
              style={{ display: "block", width: "100%", padding: "9px 16px", background: "none", border: "none", cursor: "pointer", fontSize: "0.84rem", color: RED, fontWeight: 600, textAlign: "left" as const }}
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
  const [cards, setCards]                           = useState<CardOrder[]>([]);
  const [recipients, setRecipients]                 = useState<Recipient[]>([]);
  const [pendingApprovals, setPendingApprovals]     = useState<PendingApproval[]>([]);
  const [search, setSearch]                         = useState("");
  const [settingsOpen, setSettingsOpen]             = useState(false);
  const [personalSettings, setPersonalSettings]     = useState<PersonalSettings>(() => getPersonalSettings());
  const [hwFonts, setHwFonts]                       = useState<HwFont[]>([]);
  const [fontsLoading, setFontsLoading]             = useState(false);
  const [fontPickerOpen, setFontPickerOpen]         = useState(false);
  const [generatingFor, setGeneratingFor]           = useState<string | null>(null);
  const [viewingCardId, setViewingCardId]           = useState<string | null>(null);
  const [isMobile, setIsMobile]                     = useState(() => window.innerWidth < 768);
  const [scoreHistory, setScoreHistory]             = useState<ScoreSnapshot[]>([]);
  const [upgradeOpen, setUpgradeOpen]               = useState(false);
  const [scoreBreakdownOpen, setScoreBreakdownOpen] = useState(false);
  const [comingUpExpanded, setComingUpExpanded]     = useState(false);

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

  const approvedCards     = useMemo(() => cards.filter(c => c.status === "Approved"), [cards]);
  const awaitingApproval  = cards.filter(c => c.status === "Ready for approval");
  const approvalCount     = awaitingApproval.length + pendingApprovals.length;
  const disastersAvoided  = recipients.reduce((s, r) => s + (r.selectedEvents?.length ?? 0), 0);

  const allUpcomingEvents = useMemo(() => {
    const today = new Date();
    const cutoff = new Date(today.getTime() + 90 * 86400000);
    const thisYear = today.getFullYear();
    const result: Array<{ recipient: Recipient; event: string; daysAway: number; dateStr: string; briefingDone: boolean }> = [];
    for (const r of recipients) {
      const briefings = getBriefingsForRecipient(r.id);
      for (const event of r.selectedEvents ?? []) {
        const dateStr = getEventDate(event, r);
        if (!dateStr) continue;
        const d = new Date(dateStr);
        if (d < today || d > cutoff) continue;
        const daysAway = Math.ceil((d.getTime() - today.getTime()) / 86400000);
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
    const old = scoreHistory.filter(s => s.date <= cutoff);
    return old.length > 0 ? old[old.length - 1].score : null;
  }, [scoreHistory]);
  const scoreDelta = past30Score !== null ? health.score - past30Score : null;

  /* Wins */
  const wins = useMemo(() => {
    const list: string[] = [];
    for (const c of approvedCards) list.push(`${c.recipientName}'s ${c.holiday} card is approved and on its way`);
    for (const ev of allUpcomingEvents) {
      if (ev.briefingDone && ev.daysAway > 7 && !approvedCards.find(c => c.recipientId === ev.recipient.id && c.holiday === ev.event))
        list.push(`${ev.recipient.name}'s ${ev.event} is personalized and on track`);
    }
    const momentsAtRisk = allUpcomingEvents.filter(e => e.daysAway <= 14 && !e.briefingDone && !upcomingWithCardKeys.has(`${e.recipient.id}:::${e.event}`)).length;
    if (momentsAtRisk === 0 && recipients.length > 0) list.push("No important moments are at risk right now");
    if (scoreDelta && scoreDelta > 0) list.push(`Relationship health improved ${scoreDelta} point${scoreDelta > 1 ? "s" : ""} this month`);
    return list.slice(0, 4);
  }, [approvedCards, allUpcomingEvents, recipients, scoreDelta, upcomingWithCardKeys]);

  /* Moments at risk count */
  const momentsAtRisk = useMemo(() =>
    allUpcomingEvents.filter(e => e.daysAway <= 14 && !e.briefingDone && !upcomingWithCardKeys.has(`${e.recipient.id}:::${e.event}`)).length,
  [allUpcomingEvents, upcomingWithCardKeys]);

  /* People protected count */
  const peopleProtected = useMemo(() =>
    recipients.filter(r => {
      const evts = allUpcomingEvents.filter(e => e.recipient.id === r.id);
      return evts.some(e => e.briefingDone || upcomingWithCardKeys.has(`${r.id}:::${e.event}`));
    }).length,
  [recipients, allUpcomingEvents, upcomingWithCardKeys]);

  function updateSettings<K extends keyof PersonalSettings>(key: K, val: PersonalSettings[K]) {
    setPersonalSettings(prev => { const next = { ...prev, [key]: val }; savePersonalSettings(next); return next; });
  }

  async function generateEarly(ev: { recipient: Recipient; event: string; daysAway: number; dateStr: string; briefingDone: boolean }) {
    const key = `${ev.recipient.id}:::${ev.event}`;
    setGeneratingFor(key);
    try {
      const allBriefings = getBriefingsForRecipient(ev.recipient.id);
      const currentBriefing = allBriefings.filter(b => b.event === ev.event).sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
      const res = await fetch("/api/generate-card", {
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
        const match = generated.find(c => c.tone === ev.recipient.tonePreference) ?? generated[0];
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
  const px = isMobile ? 16 : 28;

  const filteredRecipients = recipients.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.relationship.toLowerCase().includes(search.toLowerCase())
  );

  const comingUpToShow = comingUpExpanded ? allUpcomingEvents : allUpcomingEvents.slice(0, 4);

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <>
    <div style={{ minHeight: "100vh", background: BEIGE, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40, background: BEIGE,
        borderBottom: `1px solid ${BLACK}10`, padding: `0 ${px}px`,
        height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" as const,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "1.6rem" : "2rem", color: RED, fontStyle: "italic", letterSpacing: "0.01em", marginRight: 4 }}>F*</span>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "1.6rem" : "2rem", color: BLACK, letterSpacing: "0.04em" }}>I FORGOT</span>
          </Link>
          {!isMobile && (
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: `${BLACK}55`, marginLeft: 16, paddingBottom: 2 }}>
              We got your important people.
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {approvalCount > 0 && (
            <button onClick={() => setLocation("/cards/review")} style={{ display: "flex", alignItems: "center", gap: 5, background: RED, color: WHITE, border: "none", borderRadius: 20, padding: "5px 12px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}>
              {approvalCount} card{approvalCount > 1 ? "s" : ""} to review →
            </button>
          )}
          <AccountMenu user={user} onLogout={logout} />
        </div>
      </header>

      {/* ── Settings strip ───────────────────────────────────────────────── */}
      <div style={{ background: `${BLACK}04`, borderBottom: `1px solid ${BLACK}08` }}>
        <button onClick={() => setSettingsOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: `8px ${px}px`, background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Settings size={11} style={{ color: GRAY }} />
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.68rem", letterSpacing: "0.14em", color: GRAY }}>AUTOPILOT SETTINGS</span>
            <span style={{ fontSize: "0.7rem", color: `${GRAY}70` }}>·</span>
            <span style={{ fontSize: "0.7rem", color: GRAY }}>{personalSettings.automationMode === "autopilot" ? "Fully automatic" : "Approval required"}</span>
          </div>
          {settingsOpen ? <ChevronUp size={12} style={{ color: GRAY }} /> : <ChevronDown size={12} style={{ color: GRAY }} />}
        </button>
        {settingsOpen && (
          <div style={{ padding: `0 ${px}px 18px`, display: "flex", flexDirection: "column" as const, gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.8rem", color: BLACK }}>Automation Mode</div>
                <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 1 }}>{personalSettings.automationMode === "autopilot" ? "Cards generate and send automatically." : "You'll preview each card before it mails."}</div>
              </div>
              <div style={{ display: "flex", background: `${BLACK}10`, borderRadius: 7, padding: 3, gap: 2 }}>
                {(["autopilot", "approve"] as const).map(m => (
                  <button key={m} onClick={() => updateSettings("automationMode", m)} style={{ padding: "5px 12px", borderRadius: 5, border: "none", background: personalSettings.automationMode === m ? BLACK : "transparent", color: personalSettings.automationMode === m ? WHITE : GRAY, fontWeight: 600, fontSize: "0.75rem", cursor: "pointer" }}>
                    {m === "autopilot" ? "Automatic" : "Manual"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
              <button onClick={() => setFontPickerOpen(true)} style={{ textAlign: "left" as const, padding: "9px 12px", borderRadius: 9, border: `1px solid ${BLACK}10`, background: WHITE, cursor: "pointer" }}>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 1 }}>HANDWRITING STYLE</div>
                <div style={{ fontWeight: 600, fontSize: "0.8rem", color: BLACK }}>{personalSettings.cardFont ? (hwFonts.find(f => f.id === personalSettings.cardFont)?.name ?? "Custom") : "Default style"}</div>
              </button>
              <div style={{ padding: "9px 12px", borderRadius: 9, border: `1px solid ${BLACK}10`, background: WHITE }}>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 3 }}>SIGNED AS</div>
                <input value={personalSettings.cardSignature ?? ""} onChange={e => updateSettings("cardSignature", e.target.value)} placeholder="e.g. Love, Mom" style={{ width: "100%", border: "none", background: "none", fontWeight: 600, fontSize: "0.8rem", color: BLACK, outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box" as const }} />
              </div>
              <div style={{ padding: "9px 12px", borderRadius: 9, border: `1px solid ${BLACK}10`, background: WHITE }}>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 3 }}>DEFAULT TONE</div>
                <select value={personalSettings.defaultTone ?? ""} onChange={e => updateSettings("defaultTone", e.target.value as import("@/lib/data").Tone)} style={{ width: "100%", border: "none", background: "none", fontWeight: 600, fontSize: "0.8rem", color: BLACK, outline: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  <option value="">No preference</option>
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: `24px ${px}px 64px`, boxSizing: "border-box" as const }}>

        {/* ── Empty state ── */}
        {recipients.length === 0 && (
          <div style={{ background: WHITE, borderRadius: 20, padding: "56px 32px", textAlign: "center" as const, boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "3rem", marginBottom: 14 }}>💌</div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: BLACK, letterSpacing: "0.04em", marginBottom: 8 }}>THOUGHTFUL CARDS. STRONGER RELATIONSHIPS.</div>
            <p style={{ fontSize: "0.95rem", color: GRAY, maxWidth: 380, margin: "0 auto 28px", lineHeight: 1.65 }}>
              Start by adding the people who matter most. We'll handle the cards — you get the credit.
            </p>
            <Link href="/recipients/new">
              <button data-testid="link-add-recipient" style={{ background: RED, color: WHITE, border: "none", borderRadius: 12, padding: "14px 32px", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Plus size={15} /> Add your first person
              </button>
            </Link>
          </div>
        )}

        {recipients.length > 0 && (
          <>
            {/* ════════════════════════════════════════════════════════════ */}
            {/* YOU'RE COVERED — reassurance strip                          */}
            {/* ════════════════════════════════════════════════════════════ */}
            <div style={{ background: WHITE, borderRadius: 16, padding: "18px 22px", marginBottom: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${SAGE}14`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "1.2rem" }}>🛡️</span>
                </div>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", letterSpacing: "0.04em", color: BLACK }}>
                    {momentsAtRisk === 0 ? "You're covered." : `${momentsAtRisk} moment${momentsAtRisk > 1 ? "s" : ""} need attention.`}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 1 }}>
                    {momentsAtRisk === 0 ? "No important moments are at risk right now." : "Check the upcoming events below to take action."}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: isMobile ? 12 : 28, flexWrap: "wrap" as const }}>
                {[
                  { value: recipients.length,                label: "people covered",     emoji: "👥" },
                  { value: approvalCount,                    label: "cards to review",    emoji: "📬" },
                  { value: disastersAvoided,                 label: "occasions tracked",  emoji: "📅" },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: "center" as const }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: stat.value > 0 && stat.label === "cards to review" ? RED : BLACK, lineHeight: 1 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: GRAY, marginTop: 1, whiteSpace: "nowrap" as const }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════ */}
            {/* 2-COLUMN LAYOUT                                             */}
            {/* ════════════════════════════════════════════════════════════ */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row" as const, gap: 20, alignItems: "flex-start" }}>

              {/* ── LEFT: Your People ───────────────────────────────────── */}
              <div style={{ flex: isMobile ? "none" : "0 0 52%", width: "100%", boxSizing: "border-box" as const }}>

                {/* People header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.88rem", letterSpacing: "0.16em", color: `${BLACK}50` }}>YOUR PEOPLE</span>
                    <span style={{ fontSize: "0.9rem" }}>❤️</span>
                  </div>
                  <Link href="/recipients/new">
                    <button data-testid="link-add-recipient" style={{ display: "flex", alignItems: "center", gap: 4, background: RED, color: WHITE, border: "none", borderRadius: 7, padding: "5px 11px", fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.08em", cursor: "pointer" }}>
                      <Plus size={10} /> Add
                    </button>
                  </Link>
                </div>

                {recipients.length >= 5 && (
                  <div style={{ position: "relative", marginBottom: 10 }}>
                    <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: GRAY, pointerEvents: "none" }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ width: "100%", border: `1px solid ${BLACK}10`, borderRadius: 8, padding: "8px 10px 8px 28px", fontSize: "0.82rem", color: BLACK, background: WHITE, outline: "none", boxSizing: "border-box" as const }} />
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {filteredRecipients
                    .slice().sort((a, b) => (TIER_WEIGHTS[health.recipientHealths.find(r => r.id === b.id)?.tier ?? "occasional"] ?? 1) - (TIER_WEIGHTS[health.recipientHealths.find(r => r.id === a.id)?.tier ?? "occasional"] ?? 1))
                    .map(r => {
                      const rh = health.recipientHealths.find(h => h.id === r.id);
                      const nextEv = allUpcomingEvents.find(e => e.recipient.id === r.id);
                      const protectedCard = approvedCards.find(c => c.recipientId === r.id);
                      const hasCard = nextEv && upcomingWithCardKeys.has(`${r.id}:::${nextEv.event}`);
                      const sl = rh ? scoreLabel(rh.score) : null;
                      const pct = rh ? (rh.score / 100) * 100 : 0;
                      const barColor = rh ? (rh.score >= 65 ? SAGE : rh.score >= 45 ? "#F59E0B" : "#EF6C00") : GRAY;

                      return (
                        <div key={r.id} style={{ background: WHITE, borderRadius: 14, padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
                          {/* Avatar */}
                          <div style={{ width: 44, height: 44, borderRadius: 11, background: BLACK, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: WHITE }}>
                              {r.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                            </span>
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>{r.name}</span>
                              {sl && <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "1px 7px", borderRadius: 10, background: `${sl.color}15`, color: sl.color }}>{sl.text}</span>}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: GRAY, marginBottom: 6 }}>{r.relationship}</div>

                            {/* Outcome line */}
                            {protectedCard && (
                              <div style={{ fontSize: "0.72rem", color: SAGE, display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                                <CheckCircle2 size={11} /> {protectedCard.holiday} card approved
                              </div>
                            )}
                            {!protectedCard && nextEv && (
                              <div style={{ fontSize: "0.72rem", color: hasCard ? "#1d4ed8" : nextEv.daysAway <= 14 ? RED : GRAY, display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                                {eventEmoji(nextEv.event)} {nextEv.event} in {nextEv.daysAway} day{nextEv.daysAway !== 1 ? "s" : ""}
                                {hasCard && <span style={{ color: "#1d4ed8", fontWeight: 700 }}>· draft ready</span>}
                                {!hasCard && nextEv.briefingDone && <span style={{ color: SAGE, fontWeight: 700 }}>· on track</span>}
                              </div>
                            )}

                            {/* Score bar */}
                            {rh && <ThinBar pct={pct} color={barColor} h={3} />}
                          </div>

                          {/* Manage button */}
                          <Link href={`/recipients/${r.id}?from=dashboard`}>
                            <button style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${BLACK}10`, background: `${BLACK}04`, color: BLACK, fontSize: "0.74rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const }}>
                              Manage
                            </button>
                          </Link>
                        </div>
                      );
                    })}
                </div>

                {/* Health summary — compact, below people on desktop */}
                {!isMobile && health.score > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <HealthCompact
                      score={health.score} label={health.label} explanation={health.explanation}
                      color={health.color} scoreDelta={scoreDelta} scoreHistory={scoreHistory}
                      onImprove={() => {
                        if (health.topInsight) {
                          const rh = health.recipientHealths.find(r => r.name === health.topInsight?.recipientName);
                          setLocation(rh?.topGapHref ?? "/recipients");
                        } else setLocation("/recipients");
                      }}
                    />
                  </div>
                )}
              </div>

              {/* ── RIGHT: Coming Up + Recommended + Wins ────────────────── */}
              <div style={{ flex: 1, minWidth: 0, width: "100%" }}>

                {/* COMING UP */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.88rem", letterSpacing: "0.16em", color: `${BLACK}50` }}>COMING UP</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: GRAY, background: `${BLACK}07`, borderRadius: 20, padding: "3px 10px" }}>{allUpcomingEvents.length} in 90 days</span>
                  </div>

                  {allUpcomingEvents.length === 0 ? (
                    <div style={{ background: WHITE, borderRadius: 14, padding: "28px 20px", textAlign: "center" as const }}>
                      <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>🗓️</div>
                      <p style={{ fontSize: "0.84rem", color: GRAY, margin: 0 }}>Nothing in the next 90 days. Cards will appear as occasions approach.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                      {comingUpToShow.map(ev => {
                        const genKey = `${ev.recipient.id}:::${ev.event}`;
                        const isGenerating = generatingFor === genKey;
                        const matchedCard = cards.find(c => c.recipientId === ev.recipient.id && c.holiday === ev.event);
                        const hasCard = upcomingWithCardKeys.has(genKey);
                        const isApproved = matchedCard?.status === "Approved";
                        const urgentColor = ev.daysAway <= 7 ? RED : ev.daysAway <= 14 ? "#D97706" : `${BLACK}30`;

                        let statusText = ""; let statusColor = GRAY;
                        if (isApproved)             { statusText = "Card approved, on its way";       statusColor = SAGE; }
                        else if (hasCard)           { statusText = "Card draft ready!";               statusColor = "#1d4ed8"; }
                        else if (ev.briefingDone)   { statusText = "Personalized and on track";       statusColor = SAGE; }
                        else if (ev.daysAway <= 7)  { statusText = "Needs attention soon";            statusColor = RED; }
                        else if (ev.daysAway <= 14) { statusText = "Add one detail to be ready";      statusColor = "#D97706"; }
                        else                        { statusText = "On track";                        statusColor = SAGE; }

                        let ctaLabel = ""; let ctaAction = () => {};
                        if (isApproved)           { ctaLabel = "View card"; ctaAction = () => setViewingCardId(matchedCard!.id); }
                        else if (hasCard)          { ctaLabel = "Review →"; ctaAction = () => setLocation("/cards/review"); }
                        else if (ev.briefingDone)  { ctaLabel = "Update details"; ctaAction = () => setLocation(`/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}`); }
                        else                       { ctaLabel = `Update ${ev.recipient.name.split(" ")[0]}`; ctaAction = () => setLocation(`/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}`); }

                        return (
                          <div key={genKey} style={{ background: WHITE, borderRadius: 14, padding: "14px 15px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
                            {/* Emoji */}
                            <div style={{ width: 44, height: 44, borderRadius: 11, background: BEIGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.4rem" }}>
                              {eventEmoji(ev.event)}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK, marginBottom: 1 }}>
                                {ev.recipient.name}'s {ev.event}
                              </div>
                              <div style={{ fontSize: "0.72rem", marginBottom: 3 }}>
                                <span style={{ fontWeight: 700, color: urgentColor }}>{ev.daysAway} day{ev.daysAway !== 1 ? "s" : ""} away</span>
                                <span style={{ color: GRAY }}>  ·  {new Date(ev.dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                              </div>
                              <div style={{ fontSize: "0.7rem", fontWeight: 600, color: statusColor }}>
                                {(isApproved || hasCard || ev.briefingDone) && "✓ "}{statusText}
                              </div>
                            </div>

                            {/* CTA */}
                            <div style={{ display: "flex", flexDirection: "column" as const, gap: 4, flexShrink: 0, alignItems: "flex-end" }}>
                              <button onClick={ctaAction} style={{ background: isApproved ? "#1d4ed8" : hasCard ? RED : `${BLACK}07`, color: isApproved || hasCard ? WHITE : BLACK, border: "none", borderRadius: 8, padding: "7px 12px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const }}>
                                {ctaLabel}
                              </button>
                              {!hasCard && !isGenerating && (
                                <button onClick={() => generateEarly(ev)} disabled={!!generatingFor} style={{ background: "none", border: "none", cursor: !!generatingFor ? "default" : "pointer", fontSize: "0.65rem", color: GRAY, display: "flex", alignItems: "center", gap: 3, padding: "2px 4px" }}>
                                  <Sparkles size={9} /> Generate card
                                </button>
                              )}
                              {isGenerating && <span style={{ fontSize: "0.65rem", color: GRAY, display: "flex", alignItems: "center", gap: 3 }}><Loader2 size={9} className="animate-spin" /> Generating…</span>}
                            </div>
                          </div>
                        );
                      })}
                      {allUpcomingEvents.length > 4 && (
                        <button onClick={() => setComingUpExpanded(o => !o)} style={{ width: "100%", padding: "9px", background: WHITE, border: `1px solid ${BLACK}0C`, borderRadius: 10, fontSize: "0.78rem", color: GRAY, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                          {comingUpExpanded ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> {allUpcomingEvents.length - 4} more upcoming</>}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* RECOMMENDED NEXT STEP */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.88rem", letterSpacing: "0.16em", color: `${BLACK}50`, marginBottom: 12 }}>RECOMMENDED NEXT STEP</div>
                  <div style={{ background: recommendedAction.urgency === "high" ? `${RED}08` : WHITE, border: `1.5px solid ${recommendedAction.urgency === "high" ? `${RED}20` : `${BLACK}08`}`, borderRadius: 14, padding: "16px 16px", display: "flex", gap: 12, alignItems: "flex-start", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: recommendedAction.urgency === "high" ? `${RED}14` : `${SAGE}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1.1rem" }}>
                      {recommendedAction.type === "approve_card" ? "📬" : recommendedAction.type === "answer_briefing" ? "✍️" : recommendedAction.type === "add_person" ? "👤" : "🌱"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK, marginBottom: 3 }}>{recommendedAction.title}</div>
                      <div style={{ fontSize: "0.76rem", color: GRAY, lineHeight: 1.5, marginBottom: 10 }}>{recommendedAction.description}</div>
                      <button onClick={() => { if (recommendedAction.href.startsWith("/")) setLocation(recommendedAction.href); else window.location.href = recommendedAction.href; }}
                        style={{ background: recommendedAction.urgency === "high" ? RED : BLACK, color: WHITE, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
                        {recommendedAction.type === "approve_card" ? "Review Cards" : recommendedAction.type === "answer_briefing" ? "Add a personal touch" : recommendedAction.type === "add_person" ? "Add person" : "Improve profile"}
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* RECENT WINS */}
                {wins.length > 0 && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.88rem", letterSpacing: "0.16em", color: `${BLACK}50` }}>RECENT WINS</span>
                      <span style={{ fontSize: "0.85rem" }}>🎉</span>
                    </div>
                    <div style={{ background: WHITE, borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                      {wins.map((win, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", borderBottom: i < wins.length - 1 ? `1px solid ${BLACK}06` : "none" }}>
                          <CheckCircle2 size={14} style={{ color: SAGE, flexShrink: 0, marginTop: 1 }} />
                          <span style={{ fontSize: "0.81rem", color: `${BLACK}80`, lineHeight: 1.5 }}>{win}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Health compact (mobile only — desktop is left column) */}
            {isMobile && health.score > 0 && (
              <div style={{ marginTop: 20 }}>
                <HealthCompact
                  score={health.score} label={health.label} explanation={health.explanation}
                  color={health.color} scoreDelta={scoreDelta} scoreHistory={scoreHistory}
                  onImprove={() => {
                    if (health.topInsight) {
                      const rh = health.recipientHealths.find(r => r.name === health.topInsight?.recipientName);
                      setLocation(rh?.topGapHref ?? "/recipients");
                    } else setLocation("/recipients");
                  }}
                />
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* SCORE BREAKDOWN — collapsed                                 */}
            {/* ════════════════════════════════════════════════════════════ */}
            <div style={{ marginTop: 20 }}>
              <button onClick={() => setScoreBreakdownOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: scoreBreakdownOpen ? 12 : 0 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.82rem", letterSpacing: "0.14em", color: `${BLACK}45` }}>WHY YOUR SCORE IS WHAT IT IS</span>
                {scoreBreakdownOpen ? <ChevronUp size={12} style={{ color: `${BLACK}40` }} /> : <ChevronDown size={12} style={{ color: `${BLACK}40` }} />}
              </button>

              {scoreBreakdownOpen && (
                <div style={{ background: WHITE, borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
                  {/* Category bars */}
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
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                            <div>
                              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: BLACK }}>{CAT_LABELS[catKey]}</span>
                              {CAT_DESCRIPTIONS?.[catKey] && <span style={{ fontSize: "0.68rem", color: GRAY, marginLeft: 8 }}>{CAT_DESCRIPTIONS[catKey]}</span>}
                            </div>
                            <span style={{ fontSize: "0.73rem", fontWeight: 700, color: c, minWidth: 34, textAlign: "right" as const }}>{pct}%</span>
                          </div>
                          <ThinBar pct={pct} color={c} h={5} />
                        </div>
                      );
                    })}
                  </div>
                  {/* Biggest opportunity */}
                  {health.topInsight && (
                    <div style={{ marginTop: 16, borderTop: `1px solid ${BLACK}07`, paddingTop: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <Target size={15} style={{ color: SAGE, flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 3 }}>BIGGEST OPPORTUNITY</div>
                        <div style={{ fontWeight: 700, fontSize: "0.86rem", color: BLACK, marginBottom: 2 }}>{health.topInsight.action}</div>
                        <div style={{ fontSize: "0.73rem", color: GRAY, lineHeight: 1.5 }}>For <strong>{health.topInsight.recipientName}</strong> · {health.topInsight.category} · will make future cards feel much more personal</div>
                        <Link href={`/recipients/${health.recipientHealths.find(rh => rh.name === health.topInsight?.recipientName)?.id ?? ""}`}>
                          <button style={{ marginTop: 8, padding: "6px 13px", background: `${BLACK}06`, color: BLACK, border: `1px solid ${BLACK}10`, borderRadius: 7, fontSize: "0.73rem", fontWeight: 600, cursor: "pointer" }}>Improve profile →</button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ════════════════════════════════════════════════════════════ */}
            {/* MOMENTS PROTECTED                                            */}
            {/* ════════════════════════════════════════════════════════════ */}
            {coverage.gaps.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.82rem", letterSpacing: "0.14em", color: `${BLACK}45`, marginBottom: 12 }}>MOMENTS PROTECTED</div>
                <div style={{ background: WHITE, borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.78rem", color: BLACK, fontWeight: 600 }}>{coverage.coveredCount} of {coverage.totalActive} people have occasions set</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: SAGE }}>{coverage.score}%</span>
                  </div>
                  <ThinBar pct={coverage.score} color={SAGE} h={5} />
                  {coverage.gaps.length > 0 && (
                    <div style={{ marginTop: 14, display: "flex", flexDirection: "column" as const, gap: 8 }}>
                      {coverage.gaps.map(gap => (
                        <div key={gap.relationship} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, background: BEIGE }}>
                          <span style={{ fontSize: "1.1rem" }}>👤</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.8rem", color: BLACK }}>Consider adding your {gap.relationship}</div>
                            <div style={{ fontSize: "0.69rem", color: GRAY, marginTop: 1 }}>{gap.suggestion}</div>
                          </div>
                          <Link href="/recipients/new">
                            <button style={{ padding: "5px 11px", borderRadius: 6, border: "none", background: `${BLACK}07`, color: BLACK, fontSize: "0.7rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const }}>+ Add</button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* PLAN USAGE                                                   */}
            {/* ════════════════════════════════════════════════════════════ */}
            <div style={{ marginTop: 20 }}>
              <div style={{ background: WHITE, borderRadius: 14, padding: "14px 18px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" as const }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.76rem", fontWeight: 600, color: BLACK }}>{planConfig.label} · {cardsUsed} of {cardsTotal} cards used</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: atLimit ? RED : GRAY }}>{cardsLeft} left</span>
                  </div>
                  <ThinBar pct={usagePct} color={atLimit ? RED : usagePct > 75 ? "#F59E0B" : SAGE} h={5} />
                </div>
                {plan !== "premium" && (
                  <button onClick={() => setUpgradeOpen(true)} style={{ padding: "7px 15px", borderRadius: 8, border: "none", background: atLimit ? RED : `${BLACK}08`, color: atLimit ? WHITE : BLACK, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" as const }}>
                    {atLimit ? "Upgrade Plan" : "View Plans"}
                  </button>
                )}
              </div>
            </div>

            {/* ── Footer tagline ── */}
            <div style={{ marginTop: 40, textAlign: "center" as const }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: `${BLACK}40` }}>
                Thoughtful cards. Stronger relationships. That's what we're all about. ❤️
              </span>
            </div>
          </>
        )}
      </div>
    </div>

    {/* ── Mobile FAB ─────────────────────────────────────────────────────── */}
    {isMobile && recipients.length === 0 && (
      <Link href="/recipients/new">
        <button data-testid="link-add-recipient" style={{ position: "fixed", bottom: 24, right: 20, zIndex: 200, display: "flex", alignItems: "center", gap: 8, background: RED, color: WHITE, border: "none", borderRadius: 28, padding: "13px 22px", fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em", boxShadow: "0 4px 20px rgba(226,59,46,0.35)", cursor: "pointer" }}>
          <Plus size={16} /> Add Person
        </button>
      </Link>
    )}

    {/* ── Card Viewer Modal ───────────────────────────────────────────────── */}
    {viewingCardId && (() => {
      const card = cards.find(c => c.id === viewingCardId);
      if (!card) return null;
      const mailDate = card.dueDate ? new Date(card.dueDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;
      return (
        <div onClick={() => setViewingCardId(null)} style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "86vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>{card.holiday} · {card.recipientName}</div>
                {mailDate && <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 3 }}>Mailing on {mailDate}</div>}
              </div>
              <button onClick={() => setViewingCardId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: GRAY, fontSize: "1rem", padding: "2px 6px" }}>✕</button>
            </div>
            <div style={{ margin: "12px 20px 0", display: "flex", gap: 8, background: `${SAGE}10`, border: `1px solid ${SAGE}25`, borderRadius: 8, padding: "10px 13px", alignItems: "center" }}>
              <CheckCircle2 size={13} style={{ color: SAGE }} />
              <span style={{ fontSize: "0.76rem", fontWeight: 700, color: SAGE }}>Approved — queued to mail</span>
            </div>
            <div style={{ padding: "16px 20px 24px" }}>
              <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 8 }}>MESSAGE</div>
              <div style={{ background: BEIGE, borderRadius: 10, padding: "14px 16px", fontSize: "0.9rem", lineHeight: 1.75, color: BLACK, fontFamily: "Georgia, serif", whiteSpace: "pre-wrap" }}>
                {card.approvedMessage || <span style={{ color: GRAY, fontStyle: "italic" }}>No message on file.</span>}
              </div>
            </div>
          </div>
        </div>
      );
    })()}

    {/* ── Font Picker Modal ───────────────────────────────────────────────── */}
    {fontPickerOpen && (
      <div onClick={() => setFontPickerOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: 14, padding: "24px 24px 18px", width: 680, maxWidth: "94vw", maxHeight: "86vh", display: "flex", flexDirection: "column" as const, gap: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.22)" }}>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: BLACK }}>Choose a Handwriting Style</div>
          <div style={{ fontSize: "0.8rem", color: GRAY, marginTop: -8 }}>Every card is handwritten with a real pen. Pick the style that feels most like you.</div>
          {fontsLoading ? (
            <div style={{ textAlign: "center" as const, padding: "28px 0", color: GRAY }}>Loading styles…</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 9, overflowY: "auto", paddingRight: 2 }}>
              {hwFonts.map((font, idx) => {
                const selected = personalSettings.cardFont === font.id;
                return (
                  <button key={font.id} onClick={() => { updateSettings("cardFont", font.id); setFontPickerOpen(false); }}
                    style={{ border: `2px solid ${selected ? RED : `${BLACK}10`}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", background: selected ? `${RED}07` : WHITE, textAlign: "left" as const, display: "flex", flexDirection: "column" as const, gap: 9 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.86rem", color: BLACK }}>{font.name}</span>
                      {idx === 0 && <span style={{ fontSize: "0.62rem", background: `${BLACK}07`, color: GRAY, borderRadius: 20, padding: "1px 7px" }}>Default</span>}
                      {selected && <span style={{ fontSize: "0.62rem", background: RED, color: WHITE, borderRadius: 20, padding: "1px 7px" }}>Selected</span>}
                    </div>
                    {font.previewUrl
                      ? <img src={font.previewUrl} alt={`${font.name} sample`} style={{ width: "100%", height: 140, objectFit: "contain" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      : <div style={{ fontFamily: "cursive", fontSize: "1rem", color: "#334155", lineHeight: 1.5 }}>Warm wishes and heartfelt thanks!</div>}
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, borderTop: `1px solid ${BLACK}09` }}>
            {personalSettings.cardFont && <button onClick={() => { updateSettings("cardFont", ""); setFontPickerOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: GRAY, fontSize: "0.78rem" }}>Clear selection</button>}
            <div style={{ flex: 1 }} />
            <button onClick={() => setFontPickerOpen(false)} style={{ background: RED, color: WHITE, border: "none", borderRadius: 7, padding: "8px 18px", cursor: "pointer", fontSize: "0.83rem", fontWeight: 600 }}>Done</button>
          </div>
        </div>
      </div>
    )}

    {/* ── Upgrade Modal ──────────────────────────────────────────────────── */}
    {upgradeOpen && (
      <div onClick={e => { if (e.target === e.currentTarget) setUpgradeOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
        <div style={{ background: WHITE, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", padding: "24px 22px 32px" }}>
          <div style={{ width: 32, height: 4, background: `${BLACK}15`, borderRadius: 2, margin: "0 auto 20px" }} />
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", letterSpacing: "0.04em", color: BLACK, marginBottom: 4 }}>NEED MORE CARDS?</div>
          <p style={{ fontSize: "0.83rem", color: GRAY, marginBottom: 18, lineHeight: 1.55 }}>You've used {cardsUsed} of {cardsTotal} card slots. Upgrade to cover more occasions.</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 9 }}>
            {(["basic", "standard", "premium"] as Plan[]).map(key => {
              const cfg = PLANS[key]; const isCurrent = key === plan;
              const orderedPlans: Plan[] = ["basic", "standard", "premium"];
              const isUpgrade = orderedPlans.indexOf(key) > orderedPlans.indexOf(plan);
              return (
                <div key={key} style={{ borderRadius: 11, padding: 14, border: `2px solid ${isCurrent ? `${BLACK}15` : isUpgrade ? `${RED}25` : `${BLACK}07`}`, background: isCurrent ? BEIGE : WHITE }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.06em", color: BLACK }}>{cfg.label}</span>
                        {isCurrent && <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: `${BLACK}09`, color: GRAY }}>Current</span>}
                        {key === "standard" && !isCurrent && <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px", borderRadius: 10, background: `${RED}10`, color: RED }}>Popular</span>}
                      </div>
                      <ul style={{ margin: "0 0 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 2 }}>
                        {cfg.perks.map(perk => <li key={perk} style={{ fontSize: "0.7rem", color: BLACK, display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: SAGE }}>✓</span>{perk}</li>)}
                      </ul>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", color: BLACK, lineHeight: 1 }}>{cfg.price}</span>
                      {!isCurrent && <button onClick={() => { upgradePlan(key); setUpgradeOpen(false); }} style={{ background: isUpgrade ? RED : `${BLACK}08`, color: isUpgrade ? WHITE : GRAY, border: "none", borderRadius: 7, padding: "5px 12px", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer" }}>{isUpgrade ? "Upgrade" : "Downgrade"}</button>}
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

/* ── Health compact card (shared between desktop left col + mobile) ────────── */
function HealthCompact({ score, label, explanation, color, scoreDelta, scoreHistory, onImprove }: {
  score: number; label: string; explanation: string; color: string;
  scoreDelta: number | null; scoreHistory: ScoreSnapshot[]; onImprove: () => void;
}) {
  const BLACK = "#111111"; const SAGE = "#5B8C6B"; const BEIGE = "#F2E6D3"; const WHITE = "#FFFFFF"; const GRAY = "#6B6B6B"; const RED = "#E23B2E";
  return (
    <div style={{ background: WHITE, borderRadius: 16, padding: "20px 20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", letterSpacing: "0.2em", color: `${BLACK}45`, marginBottom: 14 }}>RELATIONSHIP HEALTH</div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
        {/* Big score */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.5rem", color, lineHeight: 1, letterSpacing: "-0.02em" }}>{score}</div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color, marginTop: 2 }}>{label}</div>
          {scoreDelta !== null && Math.abs(scoreDelta) >= 1 && (
            <div style={{ marginTop: 5, display: "inline-flex", alignItems: "center", gap: 4, background: scoreDelta > 0 ? `${SAGE}12` : `${RED}08`, borderRadius: 20, padding: "3px 10px" }}>
              <TrendingUp size={10} style={{ color: scoreDelta > 0 ? SAGE : RED }} />
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: scoreDelta > 0 ? SAGE : RED }}>{scoreDelta > 0 ? "+" : ""}{scoreDelta} this month</span>
            </div>
          )}
        </div>
        {/* Sparkline */}
        {scoreHistory.length >= 2 && (
          <div style={{ flex: 1, paddingTop: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 36 }}>
              {scoreHistory.slice(-12).map((s, i, arr) => (
                <div key={i} style={{ flex: 1, borderRadius: "2px 2px 0 0", height: `${(s.score / Math.max(...arr.map(x => x.score), 1)) * 100}%`, background: SAGE, opacity: i === arr.length - 1 ? 1 : 0.25, minHeight: 3 }} />
              ))}
            </div>
            <div style={{ fontSize: "0.6rem", color: GRAY, marginTop: 4 }}>12-day trend</div>
          </div>
        )}
      </div>
      <p style={{ fontSize: "0.78rem", color: `${BLACK}70`, lineHeight: 1.6, margin: "0 0 14px" }}>{explanation}</p>
      <button onClick={onImprove} style={{ width: "100%", padding: "9px", background: BEIGE, border: "none", borderRadius: 9, fontSize: "0.78rem", fontWeight: 600, color: BLACK, cursor: "pointer" }}>
        Improve a profile →
      </button>
    </div>
  );
}
