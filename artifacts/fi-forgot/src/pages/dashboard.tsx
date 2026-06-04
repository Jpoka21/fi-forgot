import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  getCards, getRecipients, getBriefingsForRecipient, updateCard,
  CardOrder, Recipient, RecipientAddress, getAge, saveCard, deleteCard, saveRecipient,
  getPersonalSettings, savePersonalSettings, PersonalSettings,
  childrenSummary, getYearsTogether,
  TONES,
} from "@/lib/data";

import {
  getCustomerPendingApprovals, customerApproveCard,
  updateDraftApprovedMessage,
  QueueItem, MessageDraft,
} from "@/lib/admin-data";

import { useAuth } from "@/lib/auth-context";
import { Plan, PLANS } from "@/lib/plan";
import {
  Users, CheckCircle2, Plus, ClipboardList, ThumbsUp,
  Sparkles, Loader2, ChevronDown, ChevronUp, CalendarDays, Search, Clock, Lock,
  TrendingUp, Star, Shield, Target, ArrowRight, Settings, AlertCircle,
} from "lucide-react";

import {
  computeOverallHealth, computeCoverage, getRecommendedAction,
  recordScoreSnapshot, getScoreHistory, CAT_LABELS, CAT_DESCRIPTIONS,
  getScoreMeta, getEventStatus, TIER_LABELS, TIER_COLORS, TIER_WEIGHTS,
  ScoreSnapshot, OverallHealth, RecipientHealth,
} from "@/lib/relationship-health";

interface HwFont   { id: string; name: string; previewUrl?: string; }
interface CardDesign { id: string; name: string; category?: string; imageUrl?: string; libraryCardId?: string; }

/* ── Brand colours ───────────────────────────────────────────────────────── */
const BEIGE = "#F2E6D3";
const RED   = "#E23B2E";
const BLACK = "#111111";
const WHITE = "#FFFFFF";
const GRAY  = "#6B6B6B";

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

function daysUntilEvent(event: string, recipient: Recipient): number | null {
  const today = new Date();
  const year  = today.getFullYear();
  if (event === "Birthday" && recipient.birthday) {
    const [, m, d] = recipient.birthday.split("-").map(Number);
    let next = new Date(year, m - 1, d);
    if (next < today) next = new Date(year + 1, m - 1, d);
    return Math.ceil((next.getTime() - today.getTime()) / 86400000);
  }
  if (event === "Anniversary") {
    const src = recipient.anniversaryDate ?? recipient.marriageDate;
    if (src) {
      const p = src.split("-").map(Number);
      let next = new Date(year, p[1] - 1, p[2]);
      if (next < today) next = new Date(year + 1, p[1] - 1, p[2]);
      return Math.ceil((next.getTime() - today.getTime()) / 86400000);
    }
  }
  const custom = recipient.customDates?.find((c) => c.label === event);
  if (custom?.date) {
    const p = custom.date.split("-").map(Number);
    let next = new Date(year, p[1] - 1, p[2]);
    if (next < today) next = new Date(year + 1, p[1] - 1, p[2]);
    return Math.ceil((next.getTime() - today.getTime()) / 86400000);
  }
  const fixed = HOLIDAY_DATES[event];
  if (fixed) {
    let next = new Date(year, fixed.month - 1, fixed.day);
    if (next < today) next = new Date(year + 1, fixed.month - 1, fixed.day);
    return Math.ceil((next.getTime() - today.getTime()) / 86400000);
  }
  return null;
}

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getEventDate(event: string, recipient: Recipient): string | null {
  const now  = new Date();
  const year = now.getFullYear();
  function nextOcc(stored: string): string {
    const p = stored.split("-").map(Number);
    let next = new Date(year, p[1] - 1, p[2]);
    if (next < now) next = new Date(year + 1, p[1] - 1, p[2]);
    return localDateStr(next);
  }
  if (event === "Birthday" && recipient.birthday) return nextOcc(recipient.birthday);
  if (event === "Anniversary") {
    const src = recipient.anniversaryDate ?? recipient.marriageDate;
    if (src) return nextOcc(src);
  }
  const custom = recipient.customDates?.find((c) => c.label === event);
  if (custom?.date) return nextOcc(custom.date);
  const fixed = HOLIDAY_DATES[event];
  if (fixed) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return nextOcc(`${year}-${pad(fixed.month)}-${pad(fixed.day)}`);
  }
  return null;
}

interface UpcomingBriefing {
  recipient: Recipient;
  event: string;
  daysAway: number;
  briefingDoneThisYear: boolean;
}

type PendingApproval = QueueItem & { message?: MessageDraft };

/* ── Workspace toggle ────────────────────────────────────────────────────── */
function WorkspaceToggle() {
  const { workspaces, switchWorkspace } = useAuth();
  const [, setLocation] = useLocation();
  const biz = workspaces.find(w => w.type === "business");
  function goBusiness() {
    if (biz) { switchWorkspace(biz.id); setLocation("/business/dashboard"); }
    else setLocation("/business/create-workspace");
  }
  return (
    <div style={{ display: "flex", background: `${BLACK}14`, borderRadius: 8, padding: 3, gap: 2 }}>
      <div style={{ padding: "6px 14px", borderRadius: 6, background: RED }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", letterSpacing: "0.1em", color: WHITE }}>Personal</span>
      </div>
      <button
        onClick={goBusiness}
        style={{ padding: "6px 14px", borderRadius: 6, background: "transparent", border: "none", cursor: "pointer" }}
        onMouseEnter={e => (e.currentTarget.style.background = `${BLACK}10`)}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", letterSpacing: "0.1em", color: `${BLACK}70` }}>Business</span>
      </button>
    </div>
  );
}

/* ── Account avatar + dropdown ───────────────────────────────────────────── */
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
          width: 34, height: 34, borderRadius: "50%",
          background: open ? RED : `${BLACK}18`,
          border: `2px solid ${BLACK}20`,
          color: open ? WHITE : BLACK,
          cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Bebas Neue', cursive", transition: "all 0.15s",
        }}
      >
        {initial}
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: WHITE, borderRadius: 12, minWidth: 220,
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)", zIndex: 200,
          border: "1px solid #e5e7eb",
        }}>
          <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #f1f5f9" }}>
            <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, color: BLACK }}>{user?.name}</p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: GRAY }}>{user?.email}</p>
          </div>
          {[
            { icon: "⚙️", label: "Account Settings", action: () => alert("Coming soon") },
            { icon: "💳", label: "Billing & Plan",   action: () => alert("Coming soon") },
            { icon: "🛡️", label: "Admin",             action: () => { setOpen(false); setLocation("/admin"); } },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => { item.action(); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: "0.86rem", color: "#334155" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ width: 20, textAlign: "center" as const }}>{item.icon}</span>{item.label}
            </button>
          ))}
          <div style={{ borderTop: "1px solid #f1f5f9" }}>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              data-testid="btn-logout"
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: "0.86rem", color: RED, fontWeight: 600 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fff5f5")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              <span style={{ width: 20, textAlign: "center" as const }}>🚪</span>Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Urgency badge ───────────────────────────────────────────────────────── */
function UrgencyBadge({ days }: { days: number }) {
  const color = days <= 14 ? RED : days <= 30 ? "#c2820a" : "#16a34a";
  const bg    = days <= 14 ? `${RED}12` : days <= 30 ? "#fef9c3" : "#f0fdf4";
  return (
    <div style={{
      minWidth: 52, height: 52, borderRadius: 12,
      display: "flex", flexDirection: "column" as const,
      alignItems: "center", justifyContent: "center",
      background: bg, border: `1.5px solid ${color}30`, flexShrink: 0,
    }}>
      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color, lineHeight: 1 }}>{days}</span>
      <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.08em", color, textTransform: "uppercase" as const }}>days</span>
    </div>
  );
}

/* ── Score ring SVG ──────────────────────────────────────────────────────── */
function ScoreRing({ score, size = 100, strokeWidth = 9, color, bg = `${BLACK}0E` }: {
  score: number; size?: number; strokeWidth?: number; color: string; bg?: string;
}) {
  const r    = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (Math.max(0, Math.min(100, score)) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={off}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

/* ── Thin category progress bar ──────────────────────────────────────────── */
function CatBar({ score, max, color }: { score: number; max: number; color: string }) {
  return (
    <div style={{ height: 5, background: `${BLACK}0C`, borderRadius: 3, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${(score / max) * 100}%`,
        background: color, borderRadius: 3,
        transition: "width 0.5s ease",
      }} />
    </div>
  );
}

/* ── Section header ──────────────────────────────────────────────────────── */
function SectionHead({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.92rem", letterSpacing: "0.14em", color: `${BLACK}70` }}>
        {label}
      </span>
      {right}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  // ── All preserved state ─────────────────────────────────────────────────
  const [cards, setCards]                           = useState<CardOrder[]>([]);
  const [recipients, setRecipients]                 = useState<Recipient[]>([]);
  const [upcomingBriefings, setUpcomingBriefings]   = useState<UpcomingBriefing[]>([]);
  const [pendingApprovals, setPendingApprovals]     = useState<PendingApproval[]>([]);
  const [refinedMessages, setRefinedMessages]       = useState<Record<string, string>>({});
  const [refinePrompt, setRefinePrompt]             = useState<Record<string, string>>({});
  const [refiningId, setRefiningId]                 = useState<string | null>(null);
  const [refineOpen, setRefineOpen]                 = useState<string | null>(null);
  const [search, setSearch]                         = useState("");
  const [settingsOpen, setSettingsOpen]             = useState(false);
  const [personalSettings, setPersonalSettings]     = useState<PersonalSettings>(() => getPersonalSettings());
  const [hwFonts,        setHwFonts]                = useState<HwFont[]>([]);
  const [fontsLoading,   setFontsLoading]            = useState(false);
  const [fontPickerOpen, setFontPickerOpen]          = useState(false);
  const [generatingFor, setGeneratingFor]           = useState<string | null>(null);
  const [approvingId, setApprovingId]               = useState<string | null>(null);
  const [editedMessages, setEditedMessages]         = useState<Record<string, string>>({});
  const [editActionId, setEditActionId]             = useState<string | null>(null);
  const [showAddrOverride, setShowAddrOverride]     = useState<Record<string, boolean>>({});
  const [addrOverride, setAddrOverride]             = useState<Record<string, Partial<RecipientAddress>>>({});
  const [timingPickerOpen, setTimingPickerOpen]     = useState<string | null>(null);
  const [hoveredBriefing, setHoveredBriefing]       = useState<string | null>(null);
  const [viewingCardId, setViewingCardId]           = useState<string | null>(null);
  const [cardDesignMap, setCardDesignMap]           = useState<Record<string, CardDesign>>({});
  const [regenLoadingIds, setRegenLoadingIds]       = useState<Record<string, boolean>>({});
  const [excludedDesignIds, setExcludedDesignIds]   = useState<Record<string, string[]>>({});
  const [lightboxDesignCard, setLightboxDesignCard] = useState<string | null>(null);
  const [shareLoadingIds, setShareLoadingIds]       = useState<Record<string, boolean>>({});
  const [shareCopiedIds, setShareCopiedIds]         = useState<Record<string, boolean>>({});
  const [shareUrlIds, setShareUrlIds]               = useState<Record<string, string>>({});
  const [expandedScoreRecipient, setExpandedScoreRecipient] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [scoreHistory, setScoreHistory] = useState<ScoreSnapshot[]>([]);

  const { user, logout, upgradePlan } = useAuth();
  const [, setLocation]  = useLocation();
  const plan = (user?.plan ?? "basic") as Plan;
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  function reloadApprovals() {
    if (user?.email) setPendingApprovals(getCustomerPendingApprovals(user.email));
  }

  useEffect(() => {
    const rs = getRecipients();
    const cs = getCards();
    setCards(cs);
    setRecipients(rs);
    reloadApprovals();

    const thisYear = new Date().getFullYear();
    const pending: UpcomingBriefing[] = [];
    for (const r of rs) {
      for (const event of r.selectedEvents ?? []) {
        const days = daysUntilEvent(event, r);
        if (days === null || days > 45 || days < 0) continue;
        const briefings = getBriefingsForRecipient(r.id);
        const done      = briefings.some((b) => b.event === event && b.year === thisYear);
        pending.push({ recipient: r, event, daysAway: days, briefingDoneThisYear: done });
      }
    }
    pending.sort((a, b) => a.daysAway - b.daysAway);
    setUpcomingBriefings(pending);
    setScoreHistory(getScoreHistory());
  }, []);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const appCards = cards.filter(c => c.status === "Ready for approval");
    for (const card of appCards) {
      if (cardDesignMap[card.id] || regenLoadingIds[card.id]) continue;
      setRegenLoadingIds(prev => ({ ...prev, [card.id]: true }));
      const params = new URLSearchParams({ eventType: card.holiday });
      if (card.approvedMessage) params.set("cardMessage", card.approvedMessage);
      fetch(`/api/personal-cards/pick-card?${params.toString()}`)
        .then(r => r.json())
        .then((d: { card?: CardDesign }) => {
          if (d.card) setCardDesignMap(prev => ({ ...prev, [card.id]: d.card! }));
        })
        .catch(() => {})
        .finally(() => setRegenLoadingIds(prev => ({ ...prev, [card.id]: false })));
    }
  }, [cards]);

  // ── Scoring computations ────────────────────────────────────────────────
  const health   = useMemo(() => computeOverallHealth(recipients), [recipients]);
  const coverage = useMemo(() => computeCoverage(recipients), [recipients]);

  // Record score snapshot once per day
  useEffect(() => {
    if (health.score > 0) {
      recordScoreSnapshot(health.score);
      setScoreHistory(getScoreHistory());
    }
  }, [health.score]);

  // ── All preserved computed values ───────────────────────────────────────
  const awaitingApproval  = cards.filter((c) => c.status === "Ready for approval");
  const disastersAvoided  = recipients.reduce((sum, r) => sum + (r.selectedEvents?.length ?? 0), 0);
  const briefingsNeeded   = upcomingBriefings.filter((b) => !b.briefingDoneThisYear);
  const approvalCount     = awaitingApproval.length + pendingApprovals.length;

  const allUpcomingEvents = useMemo(() => {
    const today  = new Date();
    const cutoff = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    const thisYear = today.getFullYear();
    const result: Array<{
      recipient: Recipient; event: string;
      daysAway: number; dateStr: string; briefingDone: boolean;
    }> = [];
    for (const r of recipients) {
      const briefings = getBriefingsForRecipient(r.id);
      for (const event of r.selectedEvents ?? []) {
        const dateStr = getEventDate(event, r);
        if (!dateStr) continue;
        const d = new Date(dateStr);
        if (d < today || d > cutoff) continue;
        const daysAway    = Math.ceil((d.getTime() - today.getTime()) / 86400000);
        const briefingDone = briefings.some((b) => b.event === event && b.year === thisYear);
        result.push({ recipient: r, event, daysAway, dateStr, briefingDone });
      }
    }
    return result.sort((a, b) => a.daysAway - b.daysAway);
  }, [recipients]);

  const recipientUpcomingMap = useMemo(() => {
    const m = new Map<string, typeof allUpcomingEvents>();
    for (const ev of allUpcomingEvents) {
      const list = m.get(ev.recipient.id) ?? [];
      list.push(ev);
      m.set(ev.recipient.id, list);
    }
    return m;
  }, [allUpcomingEvents]);

  const filteredRecipients = recipients.filter(r =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.relationship.toLowerCase().includes(search.toLowerCase())
  );

  const upcomingWithCardKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const c of cards) {
      if (c.status !== "Needs profile") keys.add(`${c.recipientId}:::${c.holiday}`);
    }
    return keys;
  }, [cards]);

  const approvedPersonalCards = useMemo(() => cards.filter(c => c.status === "Approved"), [cards]);

  // Recommended next action
  const recommendedAction = useMemo(() => getRecommendedAction(
    recipients,
    approvalCount,
    allUpcomingEvents.filter(ev => !ev.briefingDone),
    health,
  ), [recipients, approvalCount, allUpcomingEvents, health]);

  // ── All preserved functions ─────────────────────────────────────────────
  function updateSettings<K extends keyof PersonalSettings>(key: K, val: PersonalSettings[K]) {
    setPersonalSettings(prev => {
      const next = { ...prev, [key]: val };
      savePersonalSettings(next);
      return next;
    });
  }

  async function generateEarly(ev: { recipient: Recipient; event: string; daysAway: number; dateStr: string; briefingDone: boolean }) {
    const key = `${ev.recipient.id}:::${ev.event}`;
    setGeneratingFor(key);
    try {
      const allBriefings = getBriefingsForRecipient(ev.recipient.id);
      const currentBriefing = allBriefings
        .filter(b => b.event === ev.event)
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
      const recipientHistory = allBriefings
        .filter(b => b.event !== ev.event)
        .map(b => ({ event: b.event, year: b.year, answers: b.answers }));

      const res = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName:    ev.recipient.name,
          relationship:     ev.recipient.relationship,
          holiday:          ev.event,
          tonePreference:   ev.recipient.tonePreference,
          senderName:       ev.recipient.senderName,
          personalityNotes: ev.recipient.personalityNotes,
          thingsToAvoid:    ev.recipient.thingsToAvoid,
          favoriteMemories: ev.recipient.favoriteMemories,
          insideJokes:      ev.recipient.insideJokes,
          emotionalLevel:   ev.recipient.emotionalLevel,
          kidsNames:        childrenSummary(ev.recipient.children),
          yearsTogther:     ev.recipient.marriageDate
                              ? String(getYearsTogether(ev.recipient.marriageDate))
                              : undefined,
          eventBriefing:    currentBriefing?.answers ?? [],
          recipientHistory,
        }),
      });
      const data = await res.json() as { cards?: { tone: string; text: string }[] };
      const generated = data.cards ?? [];
      if (generated.length > 0) {
        const match = generated.find(c => c.tone === ev.recipient.tonePreference) ?? generated[0];
        const newCard: CardOrder = {
          id: `personal-${Date.now()}`,
          recipientId: ev.recipient.id,
          recipientName: ev.recipient.name,
          holiday: ev.event,
          dueDate: ev.dateStr,
          status: "Ready for approval",
          approvedMessage: match.text,
          deliveryPreference: ev.recipient.deliveryPreference,
        };
        saveCard(newCard);
        setCards(getCards());
      }
    } catch { /* non-blocking */ }
    finally { setGeneratingFor(null); }
  }

  function approvePersonalCard(card: CardOrder) {
    const message = editedMessages[card.id] ?? card.approvedMessage ?? "";
    const override = addrOverride[card.id];
    const hasOverride = showAddrOverride[card.id] &&
      override?.line1?.trim() && override?.city?.trim() && override?.state?.trim() && override?.zip?.trim();
    const overrideAddress: RecipientAddress | undefined = hasOverride
      ? { line1: override!.line1!, line2: override!.line2, city: override!.city!, state: override!.state!, zip: override!.zip! }
      : undefined;
    updateCard({ ...card, status: "Approved", approvedMessage: message, overrideAddress });
    setCards(getCards());
    setApprovingId(null);
  }

  function rejectPersonalCard(card: CardOrder) {
    deleteCard(card.id);
    setCards(getCards());
  }

  async function shareCardPreview(card: CardOrder) {
    const design = cardDesignMap[card.id];
    if (!design?.imageUrl) return;
    const message = editedMessages[card.id] ?? card.approvedMessage ?? "";
    setShareLoadingIds(prev => ({ ...prev, [card.id]: true }));
    try {
      const res = await fetch("/api/card-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl:      design.imageUrl,
          cardName:      design.name ?? "",
          messageText:   message,
          recipientName: card.recipientName,
          eventType:     card.holiday,
        }),
      });
      const data = await res.json() as { url: string };
      setShareUrlIds(prev => ({ ...prev, [card.id]: data.url }));
    } catch { /* fetch failed */ }
    finally { setShareLoadingIds(prev => ({ ...prev, [card.id]: false })); }
  }

  async function quickEditPersonalCard(card: CardOrder, instruction: string, label: string) {
    const currentText = editedMessages[card.id] ?? card.approvedMessage ?? "";
    const actionKey = `${card.id}-${label}`;
    setEditActionId(actionKey);
    try {
      const res = await fetch("/api/edit-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientName: card.recipientName, holiday: card.holiday, currentCardText: currentText, instruction }),
      });
      if (res.ok) {
        const data = await res.json() as { card?: string };
        if (data.card) setEditedMessages(prev => ({ ...prev, [card.id]: data.card! }));
      }
    } catch { /* non-blocking */ }
    finally { setEditActionId(null); }
  }

  async function regenCardDesign(cardId: string, holiday: string, message: string) {
    const current = cardDesignMap[cardId];
    const prevExcluded = excludedDesignIds[cardId] ?? [];
    const newExcluded = current ? [...prevExcluded, String(current.id)] : prevExcluded;
    setExcludedDesignIds(prev => ({ ...prev, [cardId]: newExcluded }));
    setRegenLoadingIds(prev => ({ ...prev, [cardId]: true }));
    setCardDesignMap(prev => { const n = { ...prev }; delete n[cardId]; return n; });
    try {
      const params = new URLSearchParams({ eventType: holiday });
      if (message) params.set("cardMessage", message);
      if (newExcluded.length) params.set("excludeIds", newExcluded.join(","));
      const r = await fetch(`/api/personal-cards/pick-card?${params.toString()}`);
      const d = await r.json() as { card?: CardDesign };
      if (d.card) setCardDesignMap(prev => ({ ...prev, [cardId]: d.card! }));
    } catch {}
    setRegenLoadingIds(prev => ({ ...prev, [cardId]: false }));
  }

  function updateApprovalTiming(recipientId: string, days: 14 | 21 | 30) {
    const r = recipients.find(rec => rec.id === recipientId);
    if (r) { saveRecipient({ ...r, previewDays: days }); setRecipients(getRecipients()); }
    setTimingPickerOpen(null);
  }

  // Load fonts lazily when font picker opens
  useEffect(() => {
    if (!fontPickerOpen || hwFonts.length > 0) return;
    setFontsLoading(true);
    fetch("/api/handwrytten-fonts")
      .then(r => r.json())
      .then((d: { fonts?: HwFont[] }) => { if (d.fonts) setHwFonts(d.fonts); })
      .catch(() => {})
      .finally(() => setFontsLoading(false));
  }, [fontPickerOpen]);

  /* ── Plan info ─────────────────────────────────────────────────────────── */
  const planConfig  = PLANS[plan];
  const cardsUsed   = approvedPersonalCards.length;
  const cardsTotal  = planConfig.maxCardsPerYear;
  const cardsLeft   = Math.max(0, cardsTotal - cardsUsed);
  const usagePct    = Math.min(100, Math.round((cardsUsed / Math.max(cardsTotal, 1)) * 100));
  const atLimit     = cardsLeft === 0;

  /* ── Recent progress stats ─────────────────────────────────────────────── */
  const past30Score = useMemo(() => {
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const old = scoreHistory.filter(s => s.date <= cutoff);
    return old.length > 0 ? old[old.length - 1].score : null;
  }, [scoreHistory]);
  const scoreDelta = past30Score !== null ? health.score - past30Score : null;

  /* ── Padding shorthand ─────────────────────────────────────────────────── */
  const px = isMobile ? 14 : 32;

  /* ═══════════════════════════════════════════════════════════════════════ */
  /* RENDER                                                                   */
  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <>
    <div style={{ minHeight: "100vh", background: BEIGE, display: "flex", flexDirection: "column" as const, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: BEIGE, borderBottom: `1px solid ${BLACK}18`,
        padding: `0 ${px}px`,
        height: isMobile ? 60 : 72,
        display: "flex", alignItems: "center", justifyContent: "space-between" as const,
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "1.7rem" : "2.2rem", color: RED, fontStyle: "italic", letterSpacing: "0.01em", marginRight: 5 }}>F*</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "1.7rem" : "2.2rem", color: BLACK, letterSpacing: "0.04em" }}>I FORGOT</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.65rem", letterSpacing: "0.18em", color: `${BLACK}50`, marginLeft: 8, alignSelf: "flex-end", paddingBottom: 4 }}>PERSONAL</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14 }}>
          {approvalCount > 0 && (
            <a href="#review" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                background: `${RED}15`, border: `1px solid ${RED}40`,
                borderRadius: 8, padding: "5px 10px", cursor: "pointer",
              }}>
                <AlertCircle size={13} style={{ color: RED }} />
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.8rem", letterSpacing: "0.08em", color: RED }}>
                  {approvalCount} to review
                </span>
              </div>
            </a>
          )}
          {!isMobile && <WorkspaceToggle />}
          <AccountMenu user={user} onLogout={logout} />
        </div>
      </header>

      {/* ── Settings strip (collapsible) ────────────────────────────────────── */}
      <div style={{ background: `${BLACK}06`, borderBottom: `1px solid ${BLACK}0E` }}>
        <button
          onClick={() => setSettingsOpen(o => !o)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: `10px ${px}px`, background: "none", border: "none", cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Settings size={13} style={{ color: GRAY }} />
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.75rem", letterSpacing: "0.14em", color: GRAY }}>
              AUTOPILOT SETTINGS
            </span>
            <span style={{ fontSize: "0.7rem", color: GRAY }}>·</span>
            <span style={{ fontSize: "0.72rem", color: GRAY }}>
              {personalSettings.automationMode === "autopilot" ? "Fully automatic" : "Approval required"}
            </span>
          </div>
          {settingsOpen ? <ChevronUp size={14} style={{ color: GRAY }} /> : <ChevronDown size={14} style={{ color: GRAY }} />}
        </button>

        {settingsOpen && (
          <div style={{ padding: `0 ${px}px 20px`, display: "flex", flexDirection: "column" as const, gap: 14 }}>
            {/* Automation mode */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" as const }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: BLACK }}>Automation Mode</div>
                <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 1 }}>
                  {personalSettings.automationMode === "autopilot"
                    ? "Cards generate and send automatically — no action needed."
                    : "You'll receive a preview before each card is mailed."}
                </div>
              </div>
              <div style={{ display: "flex", background: `${BLACK}10`, borderRadius: 8, padding: 3, gap: 2 }}>
                {(["autopilot", "approve"] as const).map(level => (
                  <button key={level} onClick={() => updateSettings("automationMode", level)} style={{
                    padding: "6px 14px", borderRadius: 6, border: "none",
                    background: personalSettings.automationMode === level ? BLACK : "transparent",
                    color: personalSettings.automationMode === level ? WHITE : GRAY,
                    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer",
                  }}>
                    {level === "autopilot" ? "Automatic" : "Manual"}
                  </button>
                ))}
              </div>
            </div>

            {/* Font + Signature + Tone + Timing grid */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12 }}>
              {/* Handwriting style */}
              <button
                onClick={() => setFontPickerOpen(true)}
                style={{
                  textAlign: "left" as const, padding: "10px 14px", borderRadius: 10,
                  border: `1px solid ${BLACK}14`, background: WHITE, cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 2 }}>HANDWRITING STYLE</div>
                <div style={{ fontWeight: 600, fontSize: "0.82rem", color: BLACK }}>
                  {personalSettings.cardFont
                    ? (hwFonts.find(f => f.id === personalSettings.cardFont)?.name ?? "Custom")
                    : "Default style"}
                </div>
              </button>

              {/* Card signature */}
              <div style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${BLACK}14`, background: WHITE }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 4 }}>SIGNED AS</div>
                <input
                  value={personalSettings.cardSignature ?? ""}
                  onChange={e => updateSettings("cardSignature", e.target.value)}
                  placeholder="e.g. Love, Mom"
                  style={{ width: "100%", border: "none", background: "none", fontWeight: 600, fontSize: "0.82rem", color: BLACK, outline: "none", fontFamily: "'Inter', sans-serif", boxSizing: "border-box" as const }}
                />
              </div>

              {/* Default tone */}
              <div style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${BLACK}14`, background: WHITE }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 4 }}>DEFAULT TONE</div>
                <select
                  value={personalSettings.defaultTone ?? ""}
                  onChange={e => updateSettings("defaultTone", e.target.value as import("@/lib/data").Tone)}
                  style={{ width: "100%", border: "none", background: "none", fontWeight: 600, fontSize: "0.82rem", color: BLACK, outline: "none", fontFamily: "'Inter', sans-serif", cursor: "pointer" }}
                >
                  <option value="">No preference</option>
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Privacy note */}
            <div style={{ fontSize: "0.67rem", color: GRAY, display: "flex", alignItems: "center", gap: 5 }}>
              <Shield size={11} />
              Profile details are private and used only to personalize your reminders and cards. We never share them.
            </div>
          </div>
        )}
      </div>

      {/* ── Main scrollable content ─────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: `28px ${px}px 60px`, maxWidth: 1000, margin: "0 auto", width: "100%", boxSizing: "border-box" as const }}>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 1 — RELATIONSHIP HEALTH HERO                             */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div style={{
          background: WHITE, borderRadius: 20, padding: isMobile ? "24px 20px" : "28px 32px",
          marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          {recipients.length === 0 ? (
            /* FTUE empty state */
            <div style={{ textAlign: "center" as const, padding: "8px 0 4px" }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "2rem" : "2.6rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1.1, marginBottom: 10 }}>
                RELATIONSHIP HEALTH
              </div>
              <p style={{ fontSize: "0.9rem", color: GRAY, maxWidth: 380, margin: "0 auto 20px", lineHeight: 1.6 }}>
                Not enough information yet. Add your first important person and we'll build your health score as you go.
              </p>
              <Link href="/recipients/new">
                <button
                  data-testid="link-add-recipient"
                  style={{
                    background: RED, color: WHITE, border: "none", borderRadius: 10,
                    padding: "12px 28px", fontFamily: "'Bebas Neue', cursive",
                    fontSize: "1rem", letterSpacing: "0.1em", cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 8,
                  }}>
                  <Plus size={15} /> Add someone you care about
                </button>
              </Link>
            </div>
          ) : (
            /* Scored state */
            <div style={{ display: "flex", gap: isMobile ? 18 : 32, flexWrap: "wrap" as const, alignItems: "flex-start" }}>
              {/* Score ring + number */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <ScoreRing score={health.score} size={isMobile ? 96 : 110} strokeWidth={10} color={health.color} />
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column" as const,
                  alignItems: "center", justifyContent: "center",
                  pointerEvents: "none",
                }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "1.8rem" : "2.1rem", color: BLACK, lineHeight: 1 }}>
                    {health.score}
                  </span>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, color: health.color, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                    {health.label}
                  </span>
                </div>
              </div>

              {/* Right: label + tagline + category bars */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "1.4rem" : "1.7rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1, marginBottom: 4 }}>
                  RELATIONSHIP HEALTH
                </div>
                <p style={{ fontSize: "0.82rem", color: GRAY, margin: "0 0 16px", lineHeight: 1.5 }}>
                  {health.tagline}
                </p>

                {/* 5 category bars */}
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {Object.entries(health.recipientHealths.length > 0
                    ? health.recipientHealths.reduce<Record<string, { score: number; max: number }>>((acc, rh) => {
                        for (const [k, v] of Object.entries(rh.categories)) {
                          if (!acc[k]) acc[k] = { score: 0, max: 0 };
                          acc[k].score += v.score * TIER_WEIGHTS[rh.tier];
                          acc[k].max   += v.max   * TIER_WEIGHTS[rh.tier];
                        }
                        return acc;
                      }, {})
                    : {}
                  ).map(([catKey, { score, max }]) => (
                    <div key={catKey}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, color: BLACK }}>{CAT_LABELS[catKey]}</span>
                        <span style={{ fontSize: "0.68rem", color: GRAY }}>{Math.round((score / Math.max(max, 1)) * 100)}%</span>
                      </div>
                      <CatBar score={score} max={max} color={getScoreMeta(Math.round((score / Math.max(max, 1)) * 100)).color} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Score delta chip (if history exists) */}
              {scoreDelta !== null && Math.abs(scoreDelta) >= 1 && (
                <div style={{
                  alignSelf: "flex-start",
                  background: scoreDelta > 0 ? "#f0fdf4" : "#fff5f5",
                  border: `1px solid ${scoreDelta > 0 ? "#22c55e30" : `${RED}20`}`,
                  borderRadius: 8, padding: "5px 10px",
                  fontSize: "0.72rem", fontWeight: 700,
                  color: scoreDelta > 0 ? "#16a34a" : RED,
                  display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
                }}>
                  <TrendingUp size={11} />
                  {scoreDelta > 0 ? "+" : ""}{scoreDelta} this month
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 2 — RECOMMENDED NEXT STEP                                */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {recipients.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHead label="RECOMMENDED NEXT STEP" />
            <div style={{
              background: recommendedAction.urgency === "high" ? `${RED}08` : WHITE,
              border: `1.5px solid ${recommendedAction.urgency === "high" ? `${RED}28` : `${BLACK}12`}`,
              borderRadius: 16, padding: "18px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" as const,
              boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: recommendedAction.urgency === "high" ? `${RED}15` : `${BLACK}07`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {recommendedAction.type === "approve_card"    && <ThumbsUp size={17} style={{ color: RED }} />}
                  {recommendedAction.type === "answer_briefing" && <Sparkles size={17} style={{ color: recommendedAction.urgency === "high" ? RED : "#1d4ed8" }} />}
                  {recommendedAction.type === "improve_profile" && <Target size={17} style={{ color: "#26A69A" }} />}
                  {recommendedAction.type === "add_person"      && <Plus size={17} style={{ color: GRAY }} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK, marginBottom: 2 }}>{recommendedAction.title}</div>
                  <div style={{ fontSize: "0.78rem", color: GRAY, lineHeight: 1.4 }}>{recommendedAction.description}</div>
                  {recommendedAction.daysUntil !== undefined && (
                    <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={10} style={{ color: recommendedAction.urgency === "high" ? RED : "#c2820a" }} />
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: recommendedAction.urgency === "high" ? RED : "#c2820a" }}>
                        {recommendedAction.daysUntil} days away
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <a
                href={recommendedAction.href}
                style={{ textDecoration: "none", flexShrink: 0 }}
                {...(recommendedAction.href.startsWith("#") ? {} : { onClick: (e: React.MouseEvent) => { e.preventDefault(); setLocation(recommendedAction.href); } })}
              >
                <button style={{
                  background: recommendedAction.urgency === "high" ? RED : BLACK,
                  color: WHITE, border: "none", borderRadius: 9,
                  padding: "9px 18px", fontFamily: "'Bebas Neue', cursive",
                  fontSize: "0.85rem", letterSpacing: "0.08em", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {recommendedAction.type === "approve_card" ? "Review Cards" :
                   recommendedAction.type === "answer_briefing" ? "Personalize" :
                   recommendedAction.type === "add_person" ? "Add Person" : "Improve Profile"}
                  <ArrowRight size={13} />
                </button>
              </a>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 3 — REVIEW & APPROVE (only when items pending)           */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {(awaitingApproval.length > 0 || pendingApprovals.length > 0) && (
          <div id="review" style={{ marginBottom: 20 }}>
            <SectionHead
              label="REVIEW & APPROVE"
              right={
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: RED, background: `${RED}12`, borderRadius: 8, padding: "3px 10px" }}>
                  {approvalCount} waiting
                </span>
              }
            />

            <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>

              {/* ── Admin pending approvals ── */}
              {pendingApprovals.map(pa => {
                const msgText = refinedMessages[pa.id] ?? pa.message?.approvedMessage ?? pa.message?.generatedMessage ?? "";
                return (
                  <div key={pa.id} style={{
                    background: WHITE, border: `1.5px solid ${BLACK}18`,
                    borderRadius: 16, overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}>
                    <div style={{ padding: "14px 18px 10px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${BLACK}0E` }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: WHITE, fontSize: "0.85rem" }}>✉</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{pa.eventType} · {pa.recipientName}</div>
                        <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 1 }}>{pa.eventDate ? new Date(pa.eventDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</div>
                      </div>
                    </div>
                    <div style={{ padding: "14px 18px" }}>
                      <textarea
                        value={msgText}
                        onChange={e => setRefinedMessages(prev => ({ ...prev, [pa.id]: e.target.value }))}
                        style={{
                          width: "100%", minHeight: 120, border: `1.5px solid ${BLACK}14`,
                          borderRadius: 10, padding: "12px 14px", fontSize: "0.88rem",
                          fontFamily: "'Inter', sans-serif", lineHeight: 1.7, color: BLACK,
                          background: BEIGE, resize: "vertical" as const, boxSizing: "border-box" as const, outline: "none",
                        }}
                      />
                      <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => { const t = refinedMessages[pa.id]; if (t) updateDraftApprovedMessage(pa.id, t); reloadApprovals(); }}
                          style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${BLACK}18`, background: WHITE, color: GRAY, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.78rem" }}>
                          Save edits
                        </button>
                        <button
                          onClick={() => { const t = refinedMessages[pa.id]; if (t) updateDraftApprovedMessage(pa.id, t); customerApproveCard(pa.id); reloadApprovals(); }}
                          style={{ padding: "8px 22px", borderRadius: 8, border: "none", background: RED, color: WHITE, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 6 }}>
                          <ThumbsUp size={13} /> Approve &amp; Send
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ── Personal card approval cards ── */}
              {awaitingApproval.map((card) => {
                const isApproving = approvingId === card.id;
                const text = editedMessages[card.id] ?? card.approvedMessage ?? "";
                const design = cardDesignMap[card.id];
                const isRegenning = regenLoadingIds[card.id];

                return (
                  <div key={card.id} style={{
                    background: WHITE, border: `1.5px solid ${BLACK}18`,
                    borderRadius: 16, overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}>
                    {/* Card header */}
                    <div style={{ padding: "14px 18px 10px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${BLACK}0E` }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${RED}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: RED, fontSize: "0.85rem" }}>✦</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>{card.holiday} · {card.recipientName}</div>
                        <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 1 }}>{card.dueDate ? `Mailing ${new Date(card.dueDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}</div>
                      </div>
                      <span style={{
                        fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em",
                        background: `${RED}10`, color: RED, borderRadius: 6, padding: "3px 9px",
                      }}>
                        NEEDS REVIEW
                      </span>
                    </div>

                    {/* Card design preview */}
                    {(design || isRegenning) && (
                      <div style={{ position: "relative", background: BEIGE }}>
                        {isRegenning ? (
                          <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <Loader2 size={18} className="animate-spin" style={{ color: GRAY }} />
                            <span style={{ fontSize: "0.8rem", color: GRAY }}>Finding a card design…</span>
                          </div>
                        ) : design?.imageUrl ? (
                          <>
                            <img
                              src={design.imageUrl}
                              alt={design.name}
                              onClick={() => setLightboxDesignCard(card.id)}
                              style={{ width: "100%", display: "block", maxHeight: 220, objectFit: "contain", background: BEIGE, cursor: "zoom-in" }}
                            />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.5))", padding: "16px 12px 8px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                              <span style={{ color: WHITE, fontWeight: 600, fontSize: "0.76rem" }}>{design.name}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <button
                                  onClick={() => regenCardDesign(card.id, card.holiday, text)}
                                  style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.12)", color: WHITE, fontSize: "0.65rem", fontWeight: 600, cursor: "pointer" }}>
                                  Try another →
                                </button>
                              </div>
                            </div>
                          </>
                        ) : null}
                      </div>
                    )}

                    {/* Lightbox */}
                    {lightboxDesignCard === card.id && design?.imageUrl && (
                      <div
                        onClick={() => setLightboxDesignCard(null)}
                        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "zoom-out" }}
                      >
                        <img src={design.imageUrl} alt={design.name} style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 0 60px rgba(0,0,0,0.8)" }} />
                        <button onClick={e => { e.stopPropagation(); setLightboxDesignCard(null); }} style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: WHITE, fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        <div style={{ position: "absolute", bottom: 20, color: "rgba(255,255,255,0.35)", fontSize: "0.72rem" }}>Click anywhere to close</div>
                      </div>
                    )}

                    {/* Message + actions */}
                    <div style={{ padding: "16px 18px" }}>
                      <textarea
                        value={text}
                        onChange={e => setEditedMessages(prev => ({ ...prev, [card.id]: e.target.value }))}
                        style={{
                          width: "100%", minHeight: 140,
                          border: `1.5px solid ${BLACK}14`, borderRadius: 10,
                          padding: "12px 14px", fontSize: "0.9rem",
                          fontFamily: "'Inter', sans-serif", lineHeight: 1.7, color: BLACK,
                          background: BEIGE, resize: "vertical" as const,
                          boxSizing: "border-box" as const, outline: "none",
                        }}
                      />

                      {/* Quick AI edits */}
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginTop: 10 }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: GRAY, alignSelf: "center", marginRight: 2 }}>AI edits:</span>
                        {([
                          { label: "Shorter",    instruction: "Make it significantly shorter and more punchy." },
                          { label: "Funnier",    instruction: "Add genuine humor without losing the heart." },
                          { label: "More heart", instruction: "Make it warmer and more emotionally resonant." },
                          { label: "Rewrite",    instruction: "Completely rewrite in a fresh way." },
                        ] as const).map(({ label, instruction }) => {
                          const actionKey = `${card.id}-${label}`;
                          const isLoading = editActionId === actionKey;
                          return (
                            <button key={label}
                              onClick={() => quickEditPersonalCard(card, instruction, label)}
                              disabled={!!editActionId}
                              style={{
                                fontSize: "0.72rem", fontWeight: 700, padding: "5px 12px", borderRadius: 8,
                                border: `1px solid ${BLACK}18`,
                                background: isLoading ? `${BLACK}06` : WHITE,
                                color: isLoading ? GRAY : BLACK,
                                cursor: editActionId ? "default" : "pointer",
                                display: "flex", alignItems: "center", gap: 5,
                              }}>
                              {isLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} style={{ color: RED }} />}
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Mailing address */}
                      {(() => {
                        const addr = user?.mailingAddress;
                        const isOverriding = showAddrOverride[card.id] ?? false;
                        const ov = addrOverride[card.id] ?? {};
                        const setOv = (patch: Partial<RecipientAddress>) =>
                          setAddrOverride(prev => ({ ...prev, [card.id]: { ...prev[card.id], ...patch } }));
                        return (
                          <div style={{ marginTop: 14, borderRadius: 10, border: `1px solid ${BLACK}12`, overflow: "hidden" }}>
                            <div style={{ padding: "10px 14px", background: `${BLACK}04`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <span style={{ fontSize: "0.9rem" }}>📬</span>
                                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: BLACK }}>
                                  {isOverriding
                                    ? "Sending to a custom address"
                                    : addr
                                      ? `Mailing to: ${addr.line1}${addr.line2 ? ` ${addr.line2}` : ""}, ${addr.city}, ${addr.state} ${addr.zip}`
                                      : "No mailing address on file"}
                                </span>
                              </div>
                              <button
                                onClick={() => setShowAddrOverride(prev => ({ ...prev, [card.id]: !isOverriding }))}
                                style={{ fontSize: "0.7rem", fontWeight: 600, color: isOverriding ? GRAY : RED, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                                {isOverriding ? "← Use my address" : addr ? "Send somewhere else" : "Add my address"}
                              </button>
                            </div>
                            {isOverriding && (
                              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column" as const, gap: 8 }}>
                                <input placeholder="Street address" value={ov.line1 ?? ""} onChange={e => setOv({ line1: e.target.value })} style={{ width: "100%", border: `1.5px solid ${BLACK}18`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, outline: "none", boxSizing: "border-box" as const }} />
                                <input placeholder="Apt / Suite (optional)" value={ov.line2 ?? ""} onChange={e => setOv({ line2: e.target.value })} style={{ width: "100%", border: `1.5px solid ${BLACK}18`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, outline: "none", boxSizing: "border-box" as const }} />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 58px 84px", gap: 8 }}>
                                  <input placeholder="City" value={ov.city ?? ""} onChange={e => setOv({ city: e.target.value })} style={{ border: `1.5px solid ${BLACK}18`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, outline: "none" }} />
                                  <input placeholder="ST" maxLength={2} value={ov.state ?? ""} onChange={e => setOv({ state: e.target.value.toUpperCase() })} style={{ border: `1.5px solid ${BLACK}18`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, outline: "none" }} />
                                  <input placeholder="Zip" maxLength={10} value={ov.zip ?? ""} onChange={e => setOv({ zip: e.target.value })} style={{ border: `1.5px solid ${BLACK}18`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, outline: "none" }} />
                                </div>
                              </div>
                            )}
                            {!addr && !isOverriding && (
                              <div style={{ padding: "8px 14px", fontSize: "0.72rem", color: "#b45309", background: "#fffbeb", borderTop: `1px solid #fde68a` }}>
                                Cards will still be queued — add your address so we know where to mail them.
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Share preview */}
                      {design?.imageUrl && (
                        <div style={{ marginTop: 14 }}>
                          {!shareUrlIds[card.id] ? (
                            <button
                              onClick={() => shareCardPreview(card)}
                              disabled={shareLoadingIds[card.id]}
                              style={{
                                width: "100%", fontSize: "0.78rem", fontWeight: 600, padding: "9px 16px",
                                borderRadius: 8, border: `1.5px solid ${BLACK}18`,
                                background: WHITE, color: BLACK,
                                cursor: shareLoadingIds[card.id] ? "default" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                              }}>
                              {shareLoadingIds[card.id] ? <Loader2 size={13} className="animate-spin" /> : "🔗"}
                              {shareLoadingIds[card.id] ? "Creating link…" : "Share preview via text"}
                            </button>
                          ) : (
                            <div style={{ borderRadius: 8, border: `1.5px solid ${BLACK}18`, background: WHITE, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: BLACK, textTransform: "uppercase" as const }}>📬 Copy &amp; text this link to {card.recipientName}</div>
                              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <input readOnly value={shareUrlIds[card.id]} onFocus={e => e.target.select()} style={{ flex: 1, fontSize: "0.72rem", padding: "6px 8px", borderRadius: 6, border: `1px solid ${BLACK}18`, background: "#f8f5f0", color: BLACK, outline: "none", minWidth: 0 }} />
                                <button
                                  onClick={async () => { await navigator.clipboard.writeText(shareUrlIds[card.id]); setShareCopiedIds(prev => ({ ...prev, [card.id]: true })); setTimeout(() => setShareCopiedIds(prev => ({ ...prev, [card.id]: false })), 2500); }}
                                  style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 6, border: "none", background: shareCopiedIds[card.id] ? "#22c55e" : BLACK, color: WHITE, fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}>
                                  {shareCopiedIds[card.id] ? "Copied!" : "Copy"}
                                </button>
                              </div>
                              <button onClick={() => setShareUrlIds(prev => { const n = { ...prev }; delete n[card.id]; return n; })} style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#aaa", fontSize: "0.68rem", cursor: "pointer", padding: 0 }}>
                                ✕ Close
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Approve / Reject */}
                      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => rejectPersonalCard(card)}
                          style={{ fontSize: "0.78rem", fontWeight: 600, padding: "9px 18px", borderRadius: 8, border: `1.5px solid ${BLACK}18`, background: WHITE, color: GRAY, cursor: "pointer" }}>
                          Reject &amp; regenerate
                        </button>
                        <button
                          onClick={() => { setApprovingId(card.id); approvePersonalCard(card); }}
                          disabled={isApproving}
                          style={{
                            fontSize: "0.78rem", fontWeight: 700, padding: "9px 24px",
                            borderRadius: 8, border: "none",
                            background: RED, color: WHITE,
                            cursor: isApproving ? "default" : "pointer",
                            display: "flex", alignItems: "center", gap: 6,
                          }}>
                          {isApproving ? <Loader2 size={13} className="animate-spin" /> : <ThumbsUp size={13} />}
                          Approve &amp; Send
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 4 — UPCOMING MOMENTS                                     */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 20 }}>
          <SectionHead
            label="UPCOMING MOMENTS — NEXT 90 DAYS"
            right={
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: GRAY, background: `${BLACK}09`, borderRadius: 8, padding: "3px 10px" }}>
                {allUpcomingEvents.length} event{allUpcomingEvents.length !== 1 ? "s" : ""}
              </span>
            }
          />

          {allUpcomingEvents.length === 0 ? (
            <div style={{ background: WHITE, border: `1.5px solid ${BLACK}12`, borderRadius: 16, padding: "48px 32px", textAlign: "center" as const, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <CalendarDays size={22} style={{ color: "#22c55e" }} />
              </div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.04em", color: BLACK, marginBottom: 6 }}>
                {recipients.length === 0 ? "No people, no occasions." : "Nothing in the next 90 days."}
              </div>
              <p style={{ fontSize: "0.82rem", color: GRAY, margin: 0 }}>
                {recipients.length === 0 ? "Add someone to watch over first." : "Cards will appear here as occasions approach."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {allUpcomingEvents.map((ev) => {
                const genKey = `${ev.recipient.id}:::${ev.event}`;
                const isGenerating = generatingFor === genKey;
                const hasCard = upcomingWithCardKeys.has(genKey);
                const recip = recipients.find(r => r.id === ev.recipient.id);
                const previewDays = recip?.previewDays ?? 14;
                const timingKey = `${ev.recipient.id}-${ev.event}`;
                const isTimingOpen = timingPickerOpen === timingKey;
                const matchedCard = cards.find(c => c.recipientId === ev.recipient.id && c.holiday === ev.event);
                const isApproved = matchedCard?.status === "Approved";
                const status = getEventStatus(ev.daysAway, ev.briefingDone, hasCard, !!isApproved);

                return (
                  <div key={genKey} style={{
                    background: WHITE,
                    border: `1.5px solid ${hasCard && !isApproved ? `${RED}28` : `${BLACK}10`}`,
                    borderRadius: 14, padding: "14px 18px",
                    display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                  }}>
                    <UrgencyBadge days={ev.daysAway} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                        <span style={{ fontWeight: 600, fontSize: "0.9rem", color: BLACK }}>{ev.event}</span>
                        <span style={{ fontWeight: 400, color: GRAY, fontSize: "0.88rem" }}>for {ev.recipient.name}</span>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.72rem", marginTop: 3, color: GRAY }}>
                        {new Date(ev.dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {ev.briefingDone && <span style={{ marginLeft: 8, fontWeight: 700, color: "#16a34a" }}>✓ Personalized</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    {hasCard ? (
                      isApproved ? (
                        <button onClick={() => setViewingCardId(matchedCard!.id)} style={{ fontSize: "0.72rem", fontWeight: 700, padding: "7px 14px", borderRadius: 8, border: "none", background: "#1d4ed8", color: WHITE, cursor: "pointer", flexShrink: 0 }}>
                          ✔ View Approved
                        </button>
                      ) : (
                        <a href="#review" style={{ textDecoration: "none" }}>
                          <button style={{ fontSize: "0.72rem", fontWeight: 700, padding: "7px 14px", borderRadius: 8, border: `1px solid ${RED}30`, background: `${RED}08`, color: RED, cursor: "pointer", flexShrink: 0 }}>
                            Review ↑
                          </button>
                        </a>
                      )
                    ) : (
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <div style={{ position: "relative" }}
                          onMouseEnter={() => setHoveredBriefing(genKey)}
                          onMouseLeave={() => setHoveredBriefing(null)}
                        >
                          <Link href={`/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}`}>
                            <button style={{
                              fontSize: "0.72rem", fontWeight: 700, padding: "7px 12px",
                              borderRadius: 8, border: `1px solid ${ev.briefingDone ? `${BLACK}18` : RED}`,
                              background: ev.briefingDone ? `${BLACK}06` : `${RED}10`,
                              color: ev.briefingDone ? GRAY : RED, cursor: "pointer",
                            }}>
                              {ev.briefingDone ? "Edit personalization" : "✦ Personalize"}
                            </button>
                          </Link>
                          {hoveredBriefing === genKey && (
                            <div style={{
                              position: "absolute", bottom: "calc(100% + 8px)", right: 0,
                              background: "#1a1a1a", color: WHITE, fontSize: "0.68rem", lineHeight: 1.5,
                              padding: "8px 11px", borderRadius: 7, maxWidth: 220, pointerEvents: "none",
                              boxShadow: "0 3px 12px rgba(0,0,0,0.2)", zIndex: 50,
                            }}>
                              {ev.briefingDone
                                ? <>Tell us more — every answer makes future cards smarter.</>
                                : <>A few optional questions. The more we know, the more personal every card.</>}
                              <div style={{ position: "absolute", top: "100%", right: 14, border: "5px solid transparent", borderTopColor: "#1a1a1a" }} />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => generateEarly(ev)}
                          disabled={!!generatingFor}
                          style={{
                            fontSize: "0.72rem", fontWeight: 700, padding: "7px 14px",
                            borderRadius: 8, border: "none",
                            background: isGenerating ? `${BLACK}10` : RED,
                            color: isGenerating ? GRAY : WHITE,
                            cursor: isGenerating || !!generatingFor ? "default" : "pointer",
                            display: "flex", alignItems: "center", gap: 5,
                          }}>
                          {isGenerating ? <><Loader2 size={11} className="animate-spin" /> Generating…</> : <><Sparkles size={11} /> Generate Early</>}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Approved & queued strip ───────────────────────────────────────── */}
        {approvedPersonalCards.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.92rem", letterSpacing: "0.14em", color: "#16a34a" }}>
                ✓ APPROVED &amp; QUEUED TO MAIL
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 7 }}>
              {approvedPersonalCards.map(card => (
                <div key={card.id} style={{
                  background: WHITE, border: "1.5px solid #22c55e28",
                  borderRadius: 12, padding: "11px 16px",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={15} style={{ color: "#16a34a", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.86rem", color: BLACK }}>{card.holiday} · {card.recipientName}</div>
                      <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 1 }}>{card.deliveryPreference}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "#f0fdf4", color: "#16a34a", border: "1px solid #22c55e30", borderRadius: 6, padding: "3px 9px" }}>QUEUED</span>
                    <button onClick={() => setViewingCardId(card.id)} style={{ fontSize: "0.72rem", fontWeight: 700, padding: "5px 12px", borderRadius: 7, border: "none", background: "#1d4ed8", color: WHITE, cursor: "pointer" }}>
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 5 — YOUR RELATIONSHIPS                                   */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 20 }}>
          <SectionHead
            label="YOUR RELATIONSHIPS"
            right={
              <Link href="/recipients/new">
                <button
                  data-testid="link-add-recipient"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: RED, color: WHITE, border: "none",
                    borderRadius: 8, padding: "6px 14px",
                    fontFamily: "'Bebas Neue', cursive", fontSize: "0.8rem", letterSpacing: "0.08em", cursor: "pointer",
                  }}>
                  <Plus size={12} /> Add Person
                </button>
              </Link>
            }
          />

          {/* Search (only if ≥ 4 recipients) */}
          {recipients.length >= 4 && (
            <div style={{ position: "relative", marginBottom: 12 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: GRAY, pointerEvents: "none" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or relationship…"
                style={{
                  width: "100%", border: `1.5px solid ${BLACK}14`, borderRadius: 10,
                  padding: "10px 12px 10px 34px",
                  fontSize: "0.85rem", color: BLACK, background: WHITE, outline: "none",
                  boxSizing: "border-box" as const,
                }}
              />
            </div>
          )}

          {recipients.length === 0 ? (
            <div style={{ background: WHITE, border: `1.5px dashed ${BLACK}20`, borderRadius: 16, padding: "40px 24px", textAlign: "center" as const }}>
              <div style={{ fontSize: "2rem", marginBottom: 10 }}>👥</div>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: BLACK, letterSpacing: "0.04em", marginBottom: 8 }}>No one added yet</div>
              <p style={{ fontSize: "0.82rem", color: GRAY, margin: "0 0 18px" }}>Start with someone whose birthday you always forget.</p>
              <Link href="/recipients/new">
                <button data-testid="link-add-recipient" style={{ background: RED, color: WHITE, border: "none", borderRadius: 9, padding: "11px 24px", fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.1em", cursor: "pointer" }}>
                  Add Your First Person
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {/* Sort: core first, then important, then occasional; within tier: lowest score first */}
              {filteredRecipients
                .slice()
                .sort((a, b) => {
                  const rhA = health.recipientHealths.find(r => r.id === a.id);
                  const rhB = health.recipientHealths.find(r => r.id === b.id);
                  const tierDiff = (TIER_WEIGHTS[rhB?.tier ?? "occasional"] ?? 1) - (TIER_WEIGHTS[rhA?.tier ?? "occasional"] ?? 1);
                  if (tierDiff !== 0) return tierDiff;
                  return (rhA?.score ?? 50) - (rhB?.score ?? 50); // lowest score first in tier (needs most help)
                })
                .map(r => {
                  const rh = health.recipientHealths.find(h => h.id === r.id);
                  const upcoming = recipientUpcomingMap.get(r.id) ?? [];
                  const nextEv = upcoming[0];
                  const tierColor = TIER_COLORS[rh?.tier ?? "occasional"];
                  const scoreColor = getScoreMeta(rh?.score ?? 15).color;
                  const isExpanded = expandedScoreRecipient === r.id;

                  return (
                    <div key={r.id} style={{
                      background: WHITE,
                      border: `1.5px solid ${BLACK}10`,
                      borderRadius: 14,
                      overflow: "hidden",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}>
                      {/* Main row */}
                      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Avatar */}
                        <div style={{
                          width: 40, height: 40, borderRadius: 10, background: BLACK, flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: WHITE, letterSpacing: "0.04em" }}>
                            {r.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                          </span>
                        </div>

                        {/* Name + relationship + tier */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" as const }}>
                            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK, whiteSpace: "nowrap" as const }}>{r.name}</span>
                            <span style={{ fontSize: "0.65rem", fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: `${BLACK}09`, color: GRAY }}>
                              {r.relationship}
                            </span>
                            {rh && (
                              <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "1px 7px", borderRadius: 20, background: `${tierColor}18`, color: tierColor, border: `1px solid ${tierColor}30` }}>
                                {TIER_LABELS[rh.tier]}
                              </span>
                            )}
                          </div>
                          {/* Health bar + score */}
                          {rh && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                              <div style={{ flex: 1, height: 5, background: `${BLACK}0C`, borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${rh.score}%`, background: scoreColor, borderRadius: 3, transition: "width 0.5s" }} />
                              </div>
                              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: scoreColor, minWidth: 24, textAlign: "right" as const }}>{rh.score}</span>
                            </div>
                          )}
                          {/* Next event */}
                          {nextEv && (
                            <div style={{ marginTop: 3, fontSize: "0.68rem", color: GRAY }}>
                              Next: <span style={{ fontWeight: 600, color: nextEv.daysAway <= 14 ? RED : BLACK }}>{nextEv.event}</span>
                              <span> in {nextEv.daysAway}d</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                          {rh && rh.pointsAvailable > 0 && (
                            <button
                              onClick={() => setExpandedScoreRecipient(isExpanded ? null : r.id)}
                              style={{
                                fontSize: "0.68rem", fontWeight: 600, padding: "5px 10px", borderRadius: 7,
                                border: `1px solid ${BLACK}14`, background: WHITE, color: GRAY, cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 4,
                              }}>
                              +{rh.pointsAvailable}pts {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            </button>
                          )}
                          <Link href={`/recipients/${r.id}?from=dashboard`}>
                            <button style={{
                              padding: "6px 12px", background: `${BLACK}06`, color: BLACK,
                              border: `1px solid ${BLACK}14`, borderRadius: 8,
                              fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", letterSpacing: "0.06em", cursor: "pointer",
                            }}>
                              Manage
                            </button>
                          </Link>
                        </div>
                      </div>

                      {/* Expandable score breakdown */}
                      {isExpanded && rh && (
                        <div style={{ borderTop: `1px solid ${BLACK}0E`, padding: "14px 16px", background: BEIGE }}>
                          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: GRAY, marginBottom: 10, letterSpacing: "0.06em" }}>
                            SCORE BREAKDOWN · {rh.score}/100
                          </div>
                          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                            {Object.entries(rh.categories).map(([key, cat]) => {
                              const catPct = cat.score / cat.max;
                              return (
                                <div key={key}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: BLACK }}>{CAT_LABELS[key]}</span>
                                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: getScoreMeta(Math.round(catPct * 100)).color }}>
                                      {cat.score}/{cat.max}
                                    </span>
                                  </div>
                                  <CatBar score={cat.score} max={cat.max} color={getScoreMeta(Math.round(catPct * 100)).color} />
                                  {cat.gaps.length > 0 && (
                                    <div style={{ marginTop: 3, fontSize: "0.68rem", color: GRAY }}>
                                      → {cat.gaps[0]}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <Link href={`/recipients/${r.id}?from=dashboard`}>
                            <button style={{
                              marginTop: 12, width: "100%", padding: "9px", background: RED, color: WHITE,
                              border: "none", borderRadius: 8, fontFamily: "'Bebas Neue', cursive",
                              fontSize: "0.85rem", letterSpacing: "0.08em", cursor: "pointer",
                            }}>
                              Update {r.name}'s Profile →
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 6 — WHY YOUR SCORE IS WHAT IT IS                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {health.score > 0 && health.topInsight && (
          <div style={{ marginBottom: 20 }}>
            <SectionHead label="TOP IMPROVEMENT OPPORTUNITY" />
            <div style={{
              background: WHITE, borderRadius: 16, padding: "18px 20px",
              border: `1.5px solid ${BLACK}10`, boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
              display: "flex", gap: 14, alignItems: "flex-start",
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: "#e0f7fa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Target size={17} style={{ color: "#00897B" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK, marginBottom: 4 }}>
                  {health.topInsight.action}
                </div>
                <div style={{ fontSize: "0.78rem", color: GRAY, lineHeight: 1.5, marginBottom: 10 }}>
                  For <strong>{health.topInsight.recipientName}</strong> · {health.topInsight.category} category · worth up to +{health.topInsight.pointsGain} points
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  {Object.entries(CAT_LABELS).map(([key, label]) => {
                    const avgCatScore = health.recipientHealths.length === 0 ? 0 : Math.round(
                      health.recipientHealths.reduce((s, rh) => {
                        const cat = rh.categories[key as keyof typeof rh.categories];
                        return s + (cat ? cat.score / cat.max : 0);
                      }, 0) / health.recipientHealths.length * 100
                    );
                    return (
                      <div key={key} style={{ fontSize: "0.7rem", padding: "4px 10px", borderRadius: 20, background: `${BLACK}06`, color: BLACK, display: "flex", gap: 5, alignItems: "center" }}>
                        <span style={{ fontWeight: 600 }}>{label}</span>
                        <span style={{ color: getScoreMeta(avgCatScore).color, fontWeight: 700 }}>{avgCatScore}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 7 — RECENT PROGRESS                                      */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {scoreHistory.length >= 2 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHead label="RECENT PROGRESS" />
            <div style={{
              background: WHITE, borderRadius: 16, padding: "18px 20px",
              border: `1.5px solid ${BLACK}10`, boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", gap: isMobile ? 16 : 28, flexWrap: "wrap" as const }}>
                {/* Score sparkline */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 8 }}>SCORE TREND</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40 }}>
                    {scoreHistory.slice(-14).map((s, i) => {
                      const maxS = Math.max(...scoreHistory.slice(-14).map(x => x.score), 1);
                      return (
                        <div key={i} style={{
                          flex: 1, borderRadius: "2px 2px 0 0",
                          height: `${(s.score / maxS) * 100}%`,
                          background: getScoreMeta(s.score).color,
                          opacity: i === scoreHistory.slice(-14).length - 1 ? 1 : 0.4,
                          minHeight: 3,
                        }} title={`${s.date}: ${s.score}`} />
                      );
                    })}
                  </div>
                </div>

                {/* Stats */}
                {[
                  { label: "Current Score",    value: String(health.score),       sub: health.label },
                  { label: "People Covered",   value: String(coverage.coveredCount), sub: `of ${coverage.totalActive} active` },
                  { label: "Occasions Tracked", value: String(disastersAvoided), sub: "total events" },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: "center" as const, minWidth: 80 }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: BLACK, lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 2 }}>{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 8 — RELATIONSHIP COVERAGE                                */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {recipients.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SectionHead label="RELATIONSHIP COVERAGE" />
            <div style={{
              background: WHITE, borderRadius: 16, padding: "18px 20px",
              border: `1.5px solid ${BLACK}10`, boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            }}>
              {/* Coverage bar */}
              <div style={{ marginBottom: coverage.gaps.length > 0 ? 16 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>
                    {coverage.coveredCount} of {coverage.totalActive} people have occasions set
                  </span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: getScoreMeta(coverage.score).color }}>
                    {coverage.score}%
                  </span>
                </div>
                <CatBar score={coverage.score} max={100} color={getScoreMeta(coverage.score).color} />
              </div>

              {/* Coverage gaps */}
              {coverage.gaps.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {coverage.gaps.map(gap => (
                    <div key={gap.relationship} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", borderRadius: 10, background: BEIGE,
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: `${TIER_COLORS[gap.tier]}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.8rem" }}>👤</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.82rem", color: BLACK }}>Consider adding a {gap.relationship}</div>
                        <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 1 }}>{gap.suggestion}</div>
                      </div>
                      <Link href="/recipients/new">
                        <button style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: `${BLACK}08`, color: BLACK, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" as const }}>
                          + Add
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SECTION 9 — PLAN USAGE                                           */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 4 }}>
          <SectionHead label="PLAN USAGE" />
          <div style={{
            background: WHITE, borderRadius: 16, padding: "18px 20px",
            border: `1.5px solid ${atLimit ? `${RED}30` : `${BLACK}10`}`,
            boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: BLACK }}>
                    {planConfig.label} Plan — {cardsUsed} of {cardsTotal} cards used
                  </span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: atLimit ? RED : GRAY }}>
                    {cardsLeft} left
                  </span>
                </div>
                <div style={{ height: 7, background: `${BLACK}0C`, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${usagePct}%`,
                    background: atLimit ? RED : usagePct > 75 ? "#FFA726" : "#26A69A",
                    borderRadius: 4, transition: "width 0.5s",
                  }} />
                </div>
                {atLimit && (
                  <div style={{ marginTop: 6, fontSize: "0.72rem", color: RED, fontWeight: 600 }}>
                    You've used all your card slots. Upgrade to cover more occasions.
                  </div>
                )}
              </div>

              {plan !== "premium" && (
                <button
                  onClick={() => setUpgradeOpen(true)}
                  style={{
                    padding: "8px 18px", borderRadius: 9, border: "none",
                    background: atLimit ? RED : `${BLACK}08`,
                    color: atLimit ? WHITE : BLACK,
                    fontFamily: "'Bebas Neue', cursive", fontSize: "0.82rem", letterSpacing: "0.08em",
                    cursor: "pointer", flexShrink: 0,
                  }}>
                  {atLimit ? "Upgrade Plan" : "See All Plans"}
                </button>
              )}
            </div>
          </div>
        </div>

      </div> {/* end main content */}
    </div>

    {/* ── Mobile FAB – Add Person ──────────────────────────────────────────── */}
    {isMobile && recipients.length === 0 && (
      <Link href="/recipients/new">
        <button
          data-testid="link-add-recipient"
          style={{
            position: "fixed", bottom: 24, right: 20, zIndex: 200,
            display: "flex", alignItems: "center", gap: 8,
            background: RED, color: WHITE, border: "none",
            borderRadius: 28, padding: "14px 22px",
            fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em",
            boxShadow: "0 4px 20px rgba(226,59,46,0.38)", cursor: "pointer",
          }}>
          <Plus size={16} /> Add Person
        </button>
      </Link>
    )}

    {/* ── Approved Card Viewer Modal ───────────────────────────────────────── */}
    {viewingCardId && (() => {
      const card = cards.find(c => c.id === viewingCardId);
      if (!card) return null;
      const message = editedMessages[card.id] ?? card.approvedMessage ?? "";
      const mailDate = card.dueDate
        ? new Date(card.dueDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : null;
      return (
        <div
          onClick={() => setViewingCardId(null)}
          style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: WHITE, borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
          >
            <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>{card.holiday} · {card.recipientName}</div>
                {mailDate && <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 3 }}>Mailing on {mailDate}</div>}
              </div>
              <button onClick={() => setViewingCardId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: GRAY, fontSize: "1.1rem", lineHeight: 1, padding: "2px 6px", flexShrink: 0 }}>✕</button>
            </div>
            <div style={{ margin: "14px 20px 0", display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #22c55e30", borderRadius: 8, padding: "10px 14px" }}>
              <CheckCircle2 size={15} style={{ color: "#16a34a", flexShrink: 0 }} />
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#15803d" }}>Card approved — queued to mail</span>
            </div>
            <div style={{ padding: "16px 20px 24px" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, marginBottom: 8 }}>Approved Message</div>
              <div style={{ background: BEIGE, border: `1.5px solid ${BLACK}12`, borderRadius: 10, padding: "14px 16px", fontSize: "0.9rem", lineHeight: 1.7, color: BLACK, fontFamily: "Georgia, serif", whiteSpace: "pre-wrap" }}>
                {message || <span style={{ color: GRAY, fontStyle: "italic" }}>No message on file.</span>}
              </div>
            </div>
          </div>
        </div>
      );
    })()}

    {/* ── Handwriting Font Picker Modal ────────────────────────────────────── */}
    {fontPickerOpen && (
      <div onClick={() => setFontPickerOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: 14, padding: "28px 28px 20px", width: 760, maxWidth: "95vw", maxHeight: "88vh", display: "flex", flexDirection: "column" as const, gap: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", color: BLACK }}>Choose a Handwriting Style</div>
          <div style={{ fontSize: "0.82rem", color: GRAY, marginTop: -8 }}>Every card we send will be handwritten using real pens. Pick the style that feels like you.</div>
          {fontsLoading ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: GRAY }}>Loading styles…</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, overflowY: "auto", paddingRight: 4 }}>
              {hwFonts.map((font, idx) => {
                const selected = personalSettings.cardFont === font.id;
                return (
                  <button key={font.id} onClick={() => { updateSettings("cardFont", font.id); setFontPickerOpen(false); }}
                    style={{ border: `2px solid ${selected ? RED : "#e2e8f0"}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", background: selected ? `${RED}08` : WHITE, textAlign: "left" as const, transition: "all 0.12s", display: "flex", flexDirection: "column" as const, gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK }}>{font.name}</span>
                      {idx === 0 && <span style={{ fontSize: "0.68rem", background: "#f1f5f9", color: GRAY, border: "1px solid #e2e8f0", borderRadius: 20, padding: "1px 7px" }}>Default</span>}
                      {selected && <span style={{ fontSize: "0.68rem", background: RED, color: WHITE, borderRadius: 20, padding: "1px 7px" }}>Selected</span>}
                    </div>
                    {font.previewUrl
                      ? <img src={font.previewUrl} alt={`${font.name} handwriting sample`} style={{ width: "100%", height: 160, objectFit: "contain", objectPosition: "center center" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      : <div style={{ fontFamily: "cursive", fontSize: "1.1rem", color: "#334155", lineHeight: 1.5, paddingTop: 4 }}>Warm wishes and heartfelt thanks!</div>}
                  </button>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, borderTop: `1px solid ${BLACK}10` }}>
            {personalSettings.cardFont && (
              <button onClick={() => { updateSettings("cardFont", ""); setFontPickerOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: GRAY, fontSize: "0.8rem" }}>
                Clear selection
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button onClick={() => setFontPickerOpen(false)} style={{ background: RED, color: WHITE, border: "none", borderRadius: 7, padding: "8px 20px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>Done</button>
          </div>
        </div>
      </div>
    )}

    {/* ── Upgrade Modal ─────────────────────────────────────────────────────── */}
    {upgradeOpen && (
      <div onClick={(e) => { if (e.target === e.currentTarget) setUpgradeOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
        <div style={{ background: WHITE, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto", padding: "28px 24px 36px" }}>
          <div style={{ width: 40, height: 4, background: `${BLACK}20`, borderRadius: 2, margin: "0 auto 24px" }} />
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", letterSpacing: "0.04em", color: BLACK, lineHeight: 1, marginBottom: 4 }}>NEED MORE CARDS?</div>
          <p style={{ fontSize: "0.85rem", color: GRAY, marginBottom: 20, lineHeight: 1.5 }}>
            You've used all {PLANS[plan].maxCardsPerYear} card slots on your current plan. Upgrade to cover more occasions.
          </p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {(["basic", "standard", "premium"] as Plan[]).map((key) => {
              const config = PLANS[key];
              const isCurrent = key === plan;
              const orderedPlans: Plan[] = ["basic", "standard", "premium"];
              const isUpgrade = orderedPlans.indexOf(key) > orderedPlans.indexOf(plan);
              return (
                <div key={key} style={{ borderRadius: 12, padding: 16, border: `2px solid ${isCurrent ? `${BLACK}20` : isUpgrade ? `${RED}30` : `${BLACK}08`}`, background: isCurrent ? BEIGE : "#fafafa" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 2 }}>
                        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK }}>{config.label}</span>
                        {isCurrent && <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "1px 8px", borderRadius: 10, background: `${BLACK}10`, color: GRAY }}>Current</span>}
                        {key === "standard" && !isCurrent && <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "1px 8px", borderRadius: 10, background: `${RED}12`, color: RED }}>Most Popular</span>}
                      </div>
                      <p style={{ fontSize: "0.72rem", color: GRAY, margin: "0 0 8px" }}>{config.tagline}</p>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 3 }}>
                        {config.perks.map(perk => (
                          <li key={perk} style={{ fontSize: "0.72rem", color: BLACK, display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ color: RED, fontWeight: 700 }}>✓</span> {perk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: BLACK, lineHeight: 1 }}>{config.price}</span>
                      {!isCurrent && (
                        <button onClick={() => { upgradePlan(key); setUpgradeOpen(false); }} style={{ background: isUpgrade ? RED : `${BLACK}10`, color: isUpgrade ? WHITE : GRAY, border: "none", borderRadius: 7, padding: "7px 16px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const }}>
                          {isUpgrade ? "Upgrade" : "Downgrade"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: "0.7rem", textAlign: "center" as const, color: `${GRAY}80`, marginTop: 16 }}>
            No relationships were guaranteed in the making of this subscription.
          </p>
        </div>
      </div>
    )}
    </>
  );
}
