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
} from "lucide-react";

interface HwFont { id: string; name: string; previewUrl?: string; }
interface CardDesign { id: string; name: string; category?: string; imageUrl?: string; libraryCardId?: string; }

/* ── Brand colours – personal palette ───────────────────────────────────── */
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

/* ── Workspace toggle (Personal active / Business) ───────────────────────── */
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
      {/* Personal — active */}
      <div style={{ padding: "6px 14px", borderRadius: 6, background: RED }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", letterSpacing: "0.1em", color: WHITE }}>
          Personal
        </span>
      </div>
      {/* Business — inactive */}
      <button
        onClick={goBusiness}
        style={{ padding: "6px 14px", borderRadius: 6, background: "transparent", border: "none", cursor: "pointer" }}
        onMouseEnter={e => (e.currentTarget.style.background = `${BLACK}10`)}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.78rem", letterSpacing: "0.1em", color: `${BLACK}70` }}>
          Business
        </span>
      </button>
    </div>
  );
}

/* ── Account avatar + dropdown ───────────────────────────────────────────── */
function AccountMenu({ user, onLogout }: { user: { name: string; email: string } | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
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
            { icon: "🛡️", label: "Admin",             action: () => { setOpen(false); window.location.href = "/admin"; } },
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

/* ── Urgency countdown badge ─────────────────────────────────────────────── */
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

/* ── Recipient profile card ──────────────────────────────────────────────── */
function RecipientCard({
  r, upcoming, plan, onUpgradeClick, isMobile, cardsUsed, cardsTotal,
}: {
  r: Recipient;
  upcoming: Array<{ event: string; daysAway: number; briefingDone: boolean }>;
  plan: Plan;
  onUpgradeClick: () => void;
  isMobile: boolean;
  cardsUsed: number;
  cardsTotal: number;
}) {
  const nextEvent   = upcoming[0] ?? null;
  const needsBrief  = !!(nextEvent && !nextEvent.briefingDone);
  const events      = r.selectedEvents ?? [];
  const initials    = r.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  const urgColor    = nextEvent
    ? nextEvent.daysAway <= 14 ? RED : nextEvent.daysAway <= 30 ? "#c2820a" : "#16a34a"
    : GRAY;

  return (
    <div style={{
      background: WHITE,
      border: `1.5px solid ${needsBrief ? `${RED}28` : `${BLACK}12`}`,
      borderRadius: 16,
      padding: isMobile ? "18px" : "20px",
      display: "flex", flexDirection: "column" as const, gap: 12,
      boxShadow: needsBrief ? `0 2px 16px ${RED}0C` : "0 1px 6px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.15s, transform 0.15s",
    }}
      onMouseEnter={e => { if (!isMobile) { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.10)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}}
      onMouseLeave={e => { if (!isMobile) { (e.currentTarget as HTMLDivElement).style.boxShadow = needsBrief ? `0 2px 16px ${RED}0C` : "0 1px 6px rgba(0,0,0,0.05)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}}
    >
      {/* Avatar + name + relationship */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: isMobile ? 46 : 44, height: isMobile ? 46 : 44,
          borderRadius: 12, background: BLACK, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", color: WHITE, letterSpacing: "0.04em" }}>
            {initials}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "1.2rem" : "1.1rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1.1 }}>
            {r.name}
          </div>
          <span style={{ background: `${BLACK}10`, color: BLACK, borderRadius: 4, padding: "1px 7px", fontWeight: 600, fontSize: "0.67rem", letterSpacing: "0.04em" }}>
            {r.relationship}
          </span>
        </div>
        {/* Per-recipient card count */}
        {events.length > 0 && (
          <div style={{
            flexShrink: 0, display: "flex", flexDirection: "column" as const, alignItems: "center",
            background: `${BLACK}06`, border: `1px solid ${BLACK}12`, borderRadius: 10,
            padding: "4px 10px", lineHeight: 1,
          }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK }}>{events.length}</span>
            <span style={{ fontSize: "0.58rem", fontWeight: 700, color: GRAY, letterSpacing: "0.04em" }}>
              card{events.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Needs attention highlight */}
      {needsBrief && nextEvent && (
        <div style={{ background: `${RED}07`, border: `1px solid ${RED}20`, borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: "0.6rem", fontWeight: 800, color: RED, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 3 }}>Needs Attention</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: isMobile ? "0.92rem" : "0.86rem", color: BLACK }}>{nextEvent.event}</span>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: urgColor, letterSpacing: "0.06em" }}>
              {nextEvent.daysAway}d
            </span>
          </div>
        </div>
      )}

      {/* Event chips */}
      {events.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
          {events.slice(0, 6).map(e => {
            const days   = daysUntilEvent(e, r);
            const isNext = nextEvent?.event === e;
            return (
              <span key={e} style={{
                fontSize: "0.65rem", padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 3,
                background: isNext ? `${RED}13` : `${BLACK}07`,
                color: isNext ? RED : "#475569",
                border: `1px solid ${isNext ? `${RED}30` : `${BLACK}10`}`,
              }}>
                {e}{days !== null && days <= 45 ? ` · ${days}d` : ""}
              </span>
            );
          })}
          {events.length > 6 && (
            <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 20, background: `${BLACK}07`, color: GRAY }}>
              +{events.length - 6}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
        {needsBrief && nextEvent ? (
          <Link href={`/briefings/${r.id}/${encodeURIComponent(nextEvent.event)}`} style={{ flex: 1 }}>
            <button style={{
              width: "100%", padding: isMobile ? "13px 12px" : "9px 14px",
              background: RED, color: WHITE, border: "none", borderRadius: 10,
              fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "1rem" : "0.9rem",
              letterSpacing: "0.08em", cursor: "pointer",
            }}>
              Answer Questions →
            </button>
          </Link>
        ) : <div style={{ flex: 1 }} />}
        <Link href={`/recipients/${r.id}?from=dashboard`}>
          <button style={{
            padding: isMobile ? "13px 16px" : "9px 14px",
            background: `${BLACK}06`, color: BLACK,
            border: `1px solid ${BLACK}14`, borderRadius: 10,
            fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "1rem" : "0.9rem",
            letterSpacing: "0.06em", cursor: "pointer",
          }}>
            Manage
          </button>
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [cards, setCards]                           = useState<CardOrder[]>([]);
  const [recipients, setRecipients]                 = useState<Recipient[]>([]);
  const [upcomingBriefings, setUpcomingBriefings]   = useState<UpcomingBriefing[]>([]);
  const [pendingApprovals, setPendingApprovals]     = useState<PendingApproval[]>([]);
  const [refinedMessages, setRefinedMessages]       = useState<Record<string, string>>({});
  const [refinePrompt, setRefinePrompt]             = useState<Record<string, string>>({});
  const [refiningId, setRefiningId]                 = useState<string | null>(null);
  const [refineOpen, setRefineOpen]                 = useState<string | null>(null);
  const [activeTab, setActiveTab]                   = useState<"people" | "upcoming">("people");
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

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

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
  }, []);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Fetch a card design for each approval card that doesn't have one yet
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

  const QUICK_PROMPTS = [
    { label: "Shorter",        prompt: "Make it significantly shorter and more punchy." },
    { label: "More funny",     prompt: "Make it funnier and add some humor." },
    { label: "Add more heart", prompt: "Make it warmer and more heartfelt." },
    { label: "More personal",  prompt: "Make it feel more personal and specific." },
  ];

  const upcomingWithCardKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const c of cards) {
      if (c.status !== "Needs profile") keys.add(`${c.recipientId}:::${c.holiday}`);
    }
    return keys;
  }, [cards]);

  const approvedPersonalCards = useMemo(() => cards.filter(c => c.status === "Approved"), [cards]);

  const TABS = [
    { key: "people"   as const, label: "Your People",    icon: Users,        count: recipients.length },
    { key: "upcoming" as const, label: "Upcoming Cards", icon: CalendarDays, count: allUpcomingEvents.length },
  ];

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
      // Pull ALL briefings for this recipient to build a cumulative profile
      const allBriefings = getBriefingsForRecipient(ev.recipient.id);
      // Most recent briefing for THIS specific event
      const currentBriefing = allBriefings
        .filter(b => b.event === ev.event)
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
      // All briefings from OTHER events — everything we've ever learned about this person
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
          // Current event briefing — Q&A specific to this card
          eventBriefing:    currentBriefing?.answers ?? [],
          // Everything learned from all past briefings for this person
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

  function updateApprovalTiming(recipientId: string, days: 14 | 21 | 30) {
    const r = recipients.find(rec => rec.id === recipientId);
    if (r) { saveRecipient({ ...r, previewDays: days }); setRecipients(getRecipients()); }
    setTimingPickerOpen(null);
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <>
    <div style={{ minHeight: "100vh", background: WHITE, display: "flex", flexDirection: "column" as const, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sticky header ────────────────────────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, flexShrink: 0 }}>

        {/* Main header bar — responsive */}
        <header style={{
          background: BEIGE,
          borderBottom: `1px solid ${BLACK}1A`,
          padding: isMobile ? "0 16px" : "0 32px 0 24px",
          height: isMobile ? 64 : 96,
          display: "flex", alignItems: "center", justifyContent: "space-between" as const, gap: 0,
        }}>
          {/* Logo + PERSONAL label + section title */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 20 }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "1.9rem" : "3.1rem", color: RED, fontStyle: "italic", letterSpacing: "0.01em", marginRight: 6 }}>F*</span>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "1.9rem" : "3.1rem", color: BLACK, letterSpacing: "0.04em" }}>I FORGOT</span>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "0.65rem" : "1rem", letterSpacing: "0.18em", color: `${BLACK}55`, marginLeft: 10, alignSelf: "flex-end", paddingBottom: isMobile ? 4 : 6 }}>PERSONAL</span>
            </Link>
            {!isMobile && (
              <>
                <div style={{ width: 1, height: 32, background: `${BLACK}18` }} />
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.08em", color: `${BLACK}60` }}>YOUR PEOPLE</span>
              </>
            )}
          </div>

          {/* Right: pending alert + workspace toggle + account */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14, flexShrink: 0 }}>
            {approvalCount > 0 && (
              <button
                onClick={() => setActiveTab("upcoming")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: `${RED}15`, border: `1px solid ${RED}40`,
                  borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: RED, display: "block" }} />
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", letterSpacing: "0.09em", color: RED }}>
                  {approvalCount} AWAITING REVIEW
                </span>
              </button>
            )}
            <WorkspaceToggle />
            <AccountMenu user={user} onLogout={() => { logout(); setLocation("/"); }} />
          </div>
        </header>

        {/* ── Personal Settings Strip ──────────────────────────────────────────── */}
        <div style={{ background: BEIGE, borderBottom: `1px solid ${BLACK}12`, padding: "0 28px", flexShrink: 0 }}>
          <button
            onClick={() => setSettingsOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", background: "none", border: "none", cursor: "pointer", color: `${BLACK}70`, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const }}
          >
            <span style={{ fontSize: "0.9rem" }}>⚙️</span>
            Personal Settings
            <span style={{ fontSize: "0.6rem", marginLeft: 2 }}>{settingsOpen ? "▲" : "▼"}</span>
          </button>

          {settingsOpen && (
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 32, paddingBottom: 18 }}>

              {/* Automation Mode */}
              <div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: `${BLACK}80`, marginBottom: 10 }}>Automation Mode</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {([
                    { value: "autopilot" as const, icon: "🚀", title: "Full Autopilot",   desc: "We write, design, and mail every card automatically. No action needed from you.",  recommended: false },
                    { value: "approve"   as const, icon: "✋", title: "Review & Approve", desc: "We queue the card and notify you. You review and approve before anything ships.",    recommended: true  },
                  ]).map(opt => {
                    const active = personalSettings.automationMode === opt.value;
                    return (
                      <button key={opt.value} onClick={() => updateSettings("automationMode", opt.value)} style={{
                        flex: 1, textAlign: "left" as const, padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                        border: `1.5px solid ${active ? RED : `${BLACK}35`}`,
                        background: active ? `${RED}12` : WHITE,
                        transition: "all 0.12s", minWidth: 160,
                      }}>
                        <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{opt.icon}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <span style={{ fontWeight: 700, fontSize: "0.78rem", color: active ? RED : BLACK, fontFamily: "'Inter', sans-serif" }}>{opt.title}</span>
                          {opt.recommended && <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.05em", background: "#16a34a", color: WHITE, borderRadius: 4, padding: "1px 5px", fontFamily: "'Inter', sans-serif" }}>Recommended</span>}
                        </div>
                        <div style={{ fontSize: "0.67rem", color: `${BLACK}BB`, fontFamily: "'Inter', sans-serif", lineHeight: 1.4 }}>{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Handwriting Style */}
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: `${BLACK}80` }}>Handwriting Style</div>
                <button
                  onClick={async () => {
                    setFontPickerOpen(true);
                    if (hwFonts.length === 0) {
                      setFontsLoading(true);
                      try {
                        const r = await fetch("/api/handwrytten-fonts");
                        const d = await r.json() as { fonts: HwFont[] };
                        setHwFonts(d.fonts ?? []);
                      } catch { /* leave empty */ }
                      setFontsLoading(false);
                    }
                  }}
                  style={{
                    background: WHITE, border: `1px solid ${BLACK}35`,
                    borderRadius: 6, color: BLACK, padding: "7px 12px",
                    fontSize: "0.82rem", cursor: "pointer", textAlign: "left" as const,
                    fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", gap: 8,
                    width: 220,
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>✍️</span>
                  <span style={{ flex: 1 }}>{personalSettings.cardFont ? (hwFonts.find(f => f.id === personalSettings.cardFont)?.name ?? personalSettings.cardFont) : "Choose a style…"}</span>
                  <span style={{ color: `${BLACK}50`, fontSize: "0.75rem" }}>▾</span>
                </button>
                <div style={{ fontSize: "0.67rem", color: `${BLACK}BB`, fontFamily: "'Inter', sans-serif" }}>The handwriting style used on every card.</div>
              </div>

              {/* Card Signature */}
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: `${BLACK}80` }}>Card Signature</div>
                <input
                  value={personalSettings.cardSignature}
                  onChange={e => updateSettings("cardSignature", e.target.value)}
                  placeholder="e.g. Love, James"
                  style={{ background: WHITE, border: `1px solid ${BLACK}35`, borderRadius: 6, color: BLACK, padding: "7px 10px", fontSize: "0.82rem", outline: "none", width: 280, fontFamily: "'Inter', sans-serif" }}
                />
                <div style={{ fontSize: "0.67rem", color: `${BLACK}BB`, fontFamily: "'Inter', sans-serif" }}>We'll close every card with this signature.</div>
              </div>

              {/* Default Tone */}
              <div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: `${BLACK}80`, marginBottom: 8 }}>Default Tone</div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                  {TONES.map(t => (
                    <button key={t} onClick={() => updateSettings("defaultTone", t)} style={{
                      padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                      border: `1.5px solid ${personalSettings.defaultTone === t ? RED : `${BLACK}35`}`,
                      background: personalSettings.defaultTone === t ? `${RED}18` : WHITE,
                      color: personalSettings.defaultTone === t ? RED : BLACK,
                      fontSize: "0.78rem", transition: "all 0.12s",
                      fontFamily: "'Inter', sans-serif",
                    }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Timing */}
              <div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: `${BLACK}80`, marginBottom: 4 }}>
                  Notify Me Before the Card Is Mailed
                </div>
                <div style={{ fontSize: "0.67rem", color: `${BLACK}BB`, marginBottom: 8, fontFamily: "'Inter', sans-serif" }}>
                  Cards are mailed ~7 days before the occasion to ensure delivery. These intervals are before the card leaves — not before the occasion itself.
                </div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                  {(["7 days before it mails", "14 days before it mails", "30 days before it mails"] as const).map(opt => {
                    const active = personalSettings.notifyTiming.includes(opt);
                    return (
                      <button key={opt} onClick={() => {
                        const next = active
                          ? personalSettings.notifyTiming.filter(x => x !== opt)
                          : [...personalSettings.notifyTiming, opt];
                        updateSettings("notifyTiming", next);
                      }} style={{
                        padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                        border: `1.5px solid ${active ? RED : `${BLACK}35`}`,
                        background: active ? `${RED}18` : WHITE,
                        color: active ? RED : BLACK,
                        fontSize: "0.78rem", transition: "all 0.12s", fontFamily: "'Inter', sans-serif",
                      }}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: "0.67rem", color: `${BLACK}BB`, marginTop: 6, fontFamily: "'Inter', sans-serif" }}>Pick one or more. We'll notify you at each chosen interval.</div>
              </div>

              {/* How to Notify You */}
              <div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: `${BLACK}80`, marginBottom: 8 }}>How to Notify You</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {([
                    { value: "email" as const, label: "✉️  Email" },
                    { value: "text"  as const, label: "💬  Text"  },
                    { value: "both"  as const, label: "📲  Both"  },
                  ]).map(opt => (
                    <button key={opt.value} onClick={() => updateSettings("notifyChannel", opt.value)} style={{
                      padding: "5px 14px", borderRadius: 20, cursor: "pointer",
                      border: `1.5px solid ${personalSettings.notifyChannel === opt.value ? RED : `${BLACK}35`}`,
                      background: personalSettings.notifyChannel === opt.value ? `${RED}18` : WHITE,
                      color: personalSettings.notifyChannel === opt.value ? RED : BLACK,
                      fontSize: "0.78rem", transition: "all 0.12s", fontFamily: "'Inter', sans-serif",
                    }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Where to Reach You */}
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: `${BLACK}80` }}>Where to Reach You</div>
                {(personalSettings.notifyChannel === "email" || personalSettings.notifyChannel === "both") && (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
                    <label style={{ fontSize: "0.72rem", color: `${BLACK}BB`, fontFamily: "'Inter', sans-serif" }}>Email address</label>
                    <input
                      type="email"
                      value={personalSettings.notifyEmail}
                      onChange={e => updateSettings("notifyEmail", e.target.value)}
                      placeholder="you@example.com"
                      style={{ background: WHITE, border: `1px solid ${BLACK}35`, borderRadius: 6, color: BLACK, padding: "7px 10px", fontSize: "0.82rem", outline: "none", width: 280, fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>
                )}
                {(personalSettings.notifyChannel === "text" || personalSettings.notifyChannel === "both") && (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 4 }}>
                    <label style={{ fontSize: "0.72rem", color: `${BLACK}BB`, fontFamily: "'Inter', sans-serif" }}>Mobile number</label>
                    <input
                      type="tel"
                      value={personalSettings.notifyPhone}
                      onChange={e => updateSettings("notifyPhone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      style={{ background: WHITE, border: `1px solid ${BLACK}35`, borderRadius: 6, color: BLACK, padding: "7px 10px", fontSize: "0.82rem", outline: "none", width: 280, fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Tab bar — scrollable on mobile */}
        <div style={{
          background: BEIGE,
          borderBottom: `1px solid ${BLACK}12`,
          padding: "0 16px",
          display: "flex", alignItems: "center", gap: 4,
          height: 52,
          overflowX: "auto",
          WebkitOverflowScrolling: "touch" as const,
          scrollbarWidth: "none" as const,
        }}>
          {TABS.map(({ key, label, icon: Icon, count }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "7px 16px",
                  background: active ? RED : "transparent",
                  border: `1.5px solid ${active ? RED : `${BLACK}25`}`,
                  borderRadius: 6,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <Icon size={14} style={{ color: active ? WHITE : BLACK }} />
                <span style={{
                  fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem",
                  letterSpacing: "0.1em",
                  color: active ? WHITE : BLACK,
                }}>
                  {label}
                </span>
                {count > 0 && (
                  <span style={{
                    background: active ? "rgba(255,255,255,0.25)" : `${BLACK}12`,
                    color: active ? WHITE : BLACK,
                    borderRadius: 10, padding: "0 7px",
                    fontSize: "0.65rem", fontWeight: 700, lineHeight: "18px",
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Desktop stat pills (above action center) ─────────────────────────── */}
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 28px 0" }}>
          {[
            { label: "People covered",      value: recipients.length,        color: BLACK },
            { label: "Events on autopilot", value: disastersAvoided,         color: BLACK },
            { label: "Upcoming",            value: allUpcomingEvents.length, color: allUpcomingEvents.length > 0 ? RED : BLACK },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: color === RED ? `${RED}08` : `${BLACK}04`,
              border: `1px solid ${color === RED ? `${RED}25` : `${BLACK}12`}`,
              borderRadius: 20, padding: "4px 14px",
            }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color, lineHeight: 1 }}>{value}</span>
              <span style={{ fontSize: "0.67rem", fontWeight: 700, color: `${BLACK}55`, letterSpacing: "0.03em" }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Needs Your Attention — action center ─────────────────────────────── */}
      {(briefingsNeeded.length > 0 || pendingApprovals.length > 0) && (
        <div style={{ padding: isMobile ? "14px 14px 0" : "20px 28px 0" }}>
          <div style={{
            background: WHITE,
            border: `2px solid ${RED}1E`,
            borderRadius: 16,
            boxShadow: `0 4px 28px ${RED}09`,
            overflow: "hidden" as const,
          }}>
            {/* Header */}
            <div style={{
              padding: "12px 20px",
              background: `${RED}05`,
              borderBottom: `1px solid ${RED}12`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: RED, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", letterSpacing: "0.12em", color: RED }}>
                NEEDS YOUR ATTENTION
              </span>
              <span style={{ marginLeft: "auto", background: `${RED}15`, color: RED, borderRadius: 20, padding: "2px 10px", fontSize: "0.65rem", fontWeight: 800 }}>
                {briefingsNeeded.length + pendingApprovals.length}
              </span>
            </div>

            {/* Briefing items */}
            {briefingsNeeded.map((b) => {
              const urgColor2 = b.daysAway <= 14 ? RED : b.daysAway <= 30 ? "#c2820a" : "#16a34a";
              const ini = b.recipient.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
              return (
                <div key={`${b.recipient.id}-${b.event}`} style={{
                  display: "flex", alignItems: "center", gap: isMobile ? 10 : 14,
                  padding: isMobile ? "13px 14px" : "14px 20px",
                  borderBottom: `1px solid ${BLACK}06`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: BLACK, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontFamily: "'Bebas Neue', cursive", color: WHITE, fontSize: "0.9rem" }}>{ini}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK, lineHeight: 1.2 }}>{b.recipient.name}</div>
                    <div style={{ fontSize: "0.75rem", color: GRAY }}>{b.event}</div>
                  </div>
                  <div style={{ textAlign: "right" as const, flexShrink: 0, marginRight: 4 }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: urgColor2, lineHeight: 1 }}>{b.daysAway}d</div>
                    <div style={{ fontSize: "0.58rem", color: GRAY, letterSpacing: "0.06em" }}>due</div>
                  </div>
                  <Link href={`/briefings/${b.recipient.id}/${encodeURIComponent(b.event)}`}>
                    <button style={{
                      background: RED, color: WHITE, border: "none", borderRadius: 8,
                      padding: isMobile ? "10px 13px" : "8px 18px",
                      fontFamily: "'Bebas Neue', cursive", fontSize: "0.82rem", letterSpacing: "0.08em",
                      cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" as const,
                    }}>
                      {isMobile ? "Go →" : "Answer Questions →"}
                    </button>
                  </Link>
                </div>
              );
            })}

            {/* Pending approval items */}
            {pendingApprovals.length > 0 && (
              <div style={{ marginTop: 0 }}>
                {pendingApprovals.map((item) => {
                  const ini = item.recipientName.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
                  return (
                    <div key={item.id} style={{
                      display: "flex", alignItems: "center", gap: isMobile ? 10 : 14,
                      padding: isMobile ? "13px 14px" : "14px 20px",
                      borderBottom: `1px solid ${BLACK}06`,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, background: `${RED}15`, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontFamily: "'Bebas Neue', cursive", color: RED, fontSize: "0.9rem" }}>{ini}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK, lineHeight: 1.2 }}>{item.recipientName}</div>
                        <div style={{ fontSize: "0.75rem", color: GRAY }}>{item.eventType} card ready</div>
                      </div>
                      <span style={{
                        fontSize: "0.6rem", fontWeight: 800, color: RED, background: `${RED}12`,
                        border: `1px solid ${RED}25`, borderRadius: 20, padding: "2px 8px", flexShrink: 0,
                      }}>REVIEW</span>
                      <button onClick={() => setActiveTab("upcoming")} style={{
                        background: `${RED}10`, color: RED, border: `1px solid ${RED}28`,
                        borderRadius: 8, padding: isMobile ? "10px 13px" : "8px 18px",
                        fontFamily: "'Bebas Neue', cursive", fontSize: "0.82rem", letterSpacing: "0.08em",
                        cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" as const,
                      }}>
                        {isMobile ? "Review →" : "Review Card →"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile stat pills (below action center) ──────────────────────────── */}
      {isMobile && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "12px 14px 0",
          overflowX: "auto", WebkitOverflowScrolling: "touch" as const, scrollbarWidth: "none" as const,
        }}>
          {[
            { label: "People",   value: recipients.length,        color: BLACK },
            { label: "Events",   value: disastersAvoided,         color: BLACK },
            { label: "Upcoming", value: allUpcomingEvents.length, color: allUpcomingEvents.length > 0 ? RED : BLACK },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 5,
              background: color === RED ? `${RED}08` : `${BLACK}04`,
              border: `1px solid ${color === RED ? `${RED}25` : `${BLACK}12`}`,
              borderRadius: 20, padding: "4px 13px", flexShrink: 0,
            }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", color, lineHeight: 1 }}>{value}</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: `${BLACK}55` }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Full admin-approval review UI (separate from the quick action center) */}
      {pendingApprovals.length > 0 && (
      <div style={{ padding: isMobile ? "12px 14px 0" : "20px 28px 0" }}>
        <div style={{ marginTop: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <ThumbsUp size={16} style={{ color: RED }} />
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", letterSpacing: "0.08em", color: RED }}>
                {pendingApprovals.length === 1 ? "1 card ready to review" : `${pendingApprovals.length} cards ready to review`}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
              {pendingApprovals.map((item) => {
                const originalMessage = item.message
                  ? (item.message.approvedMessage ?? item.message.generatedMessage ?? "")
                  : "";
                const currentMessage = refinedMessages[item.id] ?? originalMessage;
                const isRefining     = refiningId === item.id;
                const isRefineOpen   = refineOpen === item.id;

                async function handleApprove() {
                  if (item.message?.id && refinedMessages[item.id]) {
                    updateDraftApprovedMessage(item.message.id, refinedMessages[item.id]);
                  }
                  customerApproveCard(item.id);
                  reloadApprovals();
                  try {
                    await fetch("/api/admin/resolve-customer-approval", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ queueItemId: item.id }),
                    });
                  } catch { /* non-blocking */ }
                }

                async function handleRefine(prompt: string) {
                  if (!prompt.trim() || isRefining) return;
                  setRefiningId(item.id);
                  try {
                    const res = await fetch("/api/admin/refine-message", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        currentMessage, refinementPrompt: prompt,
                        recipientName: item.recipientName, eventType: item.eventType,
                        senderName: item.message?.approvedMessage?.split("—").pop()?.trim() ?? "",
                      }),
                    });
                    if (res.ok) {
                      const { message } = await res.json() as { message: string };
                      setRefinedMessages((prev) => ({ ...prev, [item.id]: message }));
                    }
                  } catch { /* non-blocking */ } finally {
                    setRefiningId(null);
                    setRefinePrompt((prev) => ({ ...prev, [item.id]: "" }));
                  }
                }

                return (
                  <div key={item.id} style={{
                    background: WHITE, border: `1.5px solid ${RED}22`,
                    borderRadius: 14, padding: "20px 22px",
                    boxShadow: "0 2px 8px rgba(226,59,46,0.06)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>
                          {item.eventType} card for <span style={{ color: RED }}>{item.recipientName}</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: GRAY, marginTop: 2 }}>Review and approve below</div>
                      </div>
                      <button
                        onClick={handleApprove}
                        style={{
                          background: RED, color: WHITE, border: "none", borderRadius: 8,
                          padding: "8px 18px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                          fontFamily: "'Bebas Neue', cursive", letterSpacing: "0.08em",
                        }}
                      >
                        Looks great — send it!
                      </button>
                    </div>
                    {currentMessage && (
                      <div style={{
                        background: BEIGE, borderRadius: 10, padding: "14px 16px",
                        fontSize: "0.88rem", color: BLACK, lineHeight: 1.6,
                        fontStyle: "italic", whiteSpace: "pre-wrap",
                      }}>
                        {currentMessage}
                      </div>
                    )}
                    <div style={{ marginTop: 12 }}>
                      <button
                        onClick={() => setRefineOpen(refineOpen === item.id ? null : item.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: "0.78rem", fontWeight: 600, color: GRAY, padding: 0,
                        }}
                      >
                        <Sparkles size={13} style={{ color: RED }} />
                        Want to tweak it with AI?
                        {isRefineOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                      {isRefineOpen && (
                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 10 }}>
                          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                            {QUICK_PROMPTS.map(({ label, prompt }) => (
                              <button
                                key={label}
                                onClick={() => handleRefine(prompt)}
                                disabled={isRefining}
                                style={{
                                  fontSize: "0.75rem", fontWeight: 600, padding: "5px 12px",
                                  borderRadius: 20, border: `1px solid ${RED}35`,
                                  color: RED, background: `${RED}08`, cursor: "pointer",
                                }}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <textarea
                              rows={2}
                              value={refinePrompt[item.id] ?? ""}
                              onChange={(e) => setRefinePrompt((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              placeholder="e.g. Mention the camping trip, skip the age reference…"
                              disabled={isRefining}
                              style={{
                                flex: 1, border: `1px solid ${BLACK}18`, borderRadius: 10,
                                padding: "8px 12px", fontSize: "0.82rem", resize: "none" as const,
                                outline: "none", fontFamily: "'Inter', sans-serif", background: WHITE,
                              }}
                            />
                            <button
                              onClick={() => handleRefine(refinePrompt[item.id] ?? "")}
                              disabled={isRefining || !(refinePrompt[item.id] ?? "").trim()}
                              style={{
                                alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 6,
                                background: RED, color: WHITE, border: "none", borderRadius: 10,
                                padding: "8px 16px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                              }}
                            >
                              {isRefining ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                              Rewrite
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab content ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: isMobile ? "16px 14px 96px" : "24px 28px 56px", position: "relative" as const }}>

        {/* ─── YOUR PEOPLE ─────────────────────────────────────────────────── */}
        {activeTab === "people" && (
          <div>
            {/* Toolbar — one row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, position: "relative" as const }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: GRAY, pointerEvents: "none" }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search people…"
                  style={{
                    width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                    border: `1.5px solid ${BLACK}16`, borderRadius: 10, fontSize: "0.85rem",
                    fontFamily: "'Inter', sans-serif", outline: "none", background: WHITE, color: BLACK,
                    boxSizing: "border-box" as const,
                  }}
                />
              </div>
              {/* Desktop Add Person button — mobile uses FAB */}
              {!isMobile && (
                <Link href="/recipients/new">
                  <button
                    data-testid="link-add-recipient"
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: RED, color: WHITE, border: "none", borderRadius: 10,
                      padding: "9px 18px", fontFamily: "'Bebas Neue', cursive",
                      fontSize: "0.9rem", letterSpacing: "0.1em", cursor: "pointer",
                      whiteSpace: "nowrap" as const, flexShrink: 0,
                    }}
                  >
                    <Plus size={14} />
                    Add Person
                  </button>
                </Link>
              )}
            </div>

            {filteredRecipients.length === 0 ? (
              <div style={{
                background: WHITE, border: `1.5px solid ${BLACK}12`, borderRadius: 16,
                padding: "60px 40px", textAlign: "center" as const,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, background: `${RED}10`,
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                }}>
                  <Users size={26} style={{ color: RED }} />
                </div>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", letterSpacing: "0.04em", color: BLACK, marginBottom: 8 }}>
                  {search ? "No matches found." : "Autopilot needs a target."}
                </div>
                <p style={{ fontSize: "0.85rem", color: GRAY, margin: "0 auto 20px", maxWidth: 360 }}>
                  {search
                    ? "Try a different name or clear your search."
                    : "Add your first person before you're standing in CVS at 9:47 PM pretending you planned this."}
                </p>
                {!search && (
                  <Link href="/recipients/new">
                    <button
                      data-testid="link-add-recipient-empty"
                      style={{
                        background: RED, color: WHITE, border: "none", borderRadius: 10,
                        padding: "10px 24px", fontFamily: "'Bebas Neue', cursive",
                        fontSize: "1rem", letterSpacing: "0.1em", cursor: "pointer",
                      }}
                    >
                      Add First Person
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Card balance box */}
                {(() => {
                  const totalCards = recipients.reduce((sum, r) => sum + (r.selectedEvents?.length ?? 0), 0);
                  const cap = PLANS[plan].maxCardsPerYear;
                  const remaining = Math.max(0, cap - totalCards);
                  const overBy = Math.max(0, totalCards - cap);
                  const atCap = totalCards >= cap;
                  const pct = Math.min(100, (totalCards / cap) * 100);
                  const barColor = overBy > 0 ? RED : atCap ? RED : pct >= 80 ? "#c2820a" : "#16a34a";
                  const statusColor = overBy > 0 ? RED : atCap ? RED : pct >= 80 ? "#c2820a" : "#16a34a";
                  return (
                    <div style={{
                      background: WHITE,
                      border: `1.5px solid ${overBy > 0 ? RED : atCap ? `${RED}50` : `${BLACK}12`}`,
                      borderRadius: 16,
                      padding: "20px 24px 18px",
                      marginBottom: 20,
                      boxShadow: overBy > 0 ? `0 0 0 3px ${RED}18` : "0 1px 4px rgba(0,0,0,0.06)",
                    }}>
                      {/* Top row: label + status badge */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK }}>
                          CARD BALANCE
                        </span>
                        {overBy > 0 ? (
                          <span style={{
                            fontSize: "0.72rem", fontWeight: 700, color: RED,
                            background: `${RED}12`, border: `1px solid ${RED}30`,
                            borderRadius: 20, padding: "3px 10px",
                          }}>
                            {overBy} over limit
                          </span>
                        ) : atCap ? (
                          <span style={{
                            fontSize: "0.72rem", fontWeight: 700, color: RED,
                            background: `${RED}10`, border: `1px solid ${RED}25`,
                            borderRadius: 20, padding: "3px 10px",
                          }}>
                            At limit
                          </span>
                        ) : (
                          <span style={{
                            fontSize: "0.72rem", fontWeight: 600, color: statusColor,
                            background: `${statusColor}12`, border: `1px solid ${statusColor}30`,
                            borderRadius: 20, padding: "3px 10px",
                          }}>
                            {remaining} left
                          </span>
                        )}
                      </div>

                      {/* Big numbers */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                        <span style={{
                          fontFamily: "'Bebas Neue', cursive",
                          fontSize: "3rem",
                          lineHeight: 1,
                          color: overBy > 0 ? RED : BLACK,
                          letterSpacing: "0.02em",
                        }}>
                          {totalCards}
                        </span>
                        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: GRAY, letterSpacing: "0.03em", lineHeight: 1 }}>
                          / {cap}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: GRAY, marginLeft: 4, fontFamily: "'Inter', sans-serif" }}>
                          cards planned this year
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div style={{ height: 8, borderRadius: 8, background: `${BLACK}10`, overflow: "hidden", marginBottom: 10 }}>
                        <div style={{
                          height: "100%", borderRadius: 8,
                          width: `${pct}%`,
                          background: barColor,
                          transition: "width 0.4s ease",
                        }} />
                      </div>

                      {/* Bottom row: message + optional upgrade */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.75rem", color: overBy > 0 ? RED : GRAY, fontFamily: "'Inter', sans-serif" }}>
                          {overBy > 0
                            ? `Remove ${overBy} occasion${overBy !== 1 ? "s" : ""} from your people, or upgrade`
                            : atCap
                            ? "You're at your plan limit"
                            : `${remaining} card${remaining !== 1 ? "s" : ""} still available — add more occasions`}
                        </span>
                        {(overBy > 0 || atCap) && (
                          <button onClick={() => setUpgradeOpen(true)} style={{
                            background: RED, color: WHITE, border: "none",
                            borderRadius: 10, padding: "5px 14px",
                            fontFamily: "'Bebas Neue', cursive",
                            fontSize: "0.8rem", letterSpacing: "0.08em", cursor: "pointer",
                            flexShrink: 0, marginLeft: 12,
                          }}>
                            Upgrade
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(288px, 1fr))",
                  gap: isMobile ? 14 : 16,
                }}>
                  {(() => {
                    const totalCards = recipients.reduce((sum, r) => sum + (r.selectedEvents?.length ?? 0), 0);
                    const cap = PLANS[plan].maxCardsPerYear;
                    return filteredRecipients.map((r) => (
                      <RecipientCard
                        key={r.id}
                        r={r}
                        upcoming={recipientUpcomingMap.get(r.id) ?? []}
                        plan={plan}
                        onUpgradeClick={() => setUpgradeOpen(true)}
                        isMobile={isMobile}
                        cardsUsed={totalCards}
                        cardsTotal={cap}
                      />
                    ));
                  })()}
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── UPCOMING CARDS ──────────────────────────────────────────────── */}
        {activeTab === "upcoming" && (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 32 }}>

            {/* ── Section: Awaiting Your Approval ─────────────────────────── */}
            {awaitingApproval.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: RED, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.12em", color: RED }}>
                    AWAITING YOUR APPROVAL
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
                  {awaitingApproval.map((card) => {
                    const text = editedMessages[card.id] ?? card.approvedMessage ?? "";
                    const isApproving = approvingId === card.id;
                    return (
                      <div key={card.id} data-testid={`card-order-${card.id}`} style={{
                        background: WHITE, border: `1.5px solid ${RED}30`,
                        borderRadius: 14, overflow: "hidden" as const,
                        boxShadow: "0 2px 10px rgba(226,59,46,0.08)",
                      }}>
                        {/* Card header */}
                        <div style={{
                          padding: "14px 18px", borderBottom: `1px solid ${BLACK}08`,
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          background: `${RED}05`,
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: BLACK }}>
                              {card.holiday} card for <span style={{ color: RED }}>{card.recipientName}</span>
                            </div>
                            <div style={{ fontSize: "0.7rem", color: GRAY, marginTop: 2 }}>
                              {card.dueDate
                                ? `Occasion ${new Date(card.dueDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })} · `
                                : ""}
                              {card.deliveryPreference}
                            </div>
                          </div>
                          <span style={{
                            fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em",
                            background: `${RED}15`, color: RED, border: `1px solid ${RED}35`,
                            borderRadius: 6, padding: "4px 10px",
                          }}>
                            READY TO REVIEW
                          </span>
                        </div>

                        {/* Card design picker */}
                        <div style={{ padding: "12px 18px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: GRAY, textTransform: "uppercase" as const, fontFamily: "'Inter', sans-serif" }}>
                              Card Design
                            </span>
                            {(excludedDesignIds[card.id]?.length ?? 0) < 4 && (
                              <button
                                onClick={() => regenCardDesign(card.id, card.holiday, text)}
                                disabled={!!regenLoadingIds[card.id] || !!editActionId}
                                style={{
                                  background: "transparent", border: `1px solid ${BLACK}20`, borderRadius: 20,
                                  color: regenLoadingIds[card.id] ? GRAY : BLACK,
                                  fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", fontWeight: 600,
                                  padding: "3px 10px", cursor: regenLoadingIds[card.id] ? "not-allowed" : "pointer",
                                  display: "flex", alignItems: "center", gap: 5,
                                }}
                              >
                                {regenLoadingIds[card.id]
                                  ? <><Loader2 size={10} className="animate-spin" /> Picking…</>
                                  : "↻ Try another"}
                              </button>
                            )}
                          </div>

                          {regenLoadingIds[card.id] ? (
                            <div style={{ height: 120, borderRadius: 8, background: `${BLACK}05`, border: `1px solid ${BLACK}10`, display: "flex", alignItems: "center", justifyContent: "center", color: GRAY, fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", marginBottom: 12 }}>
                              Finding a card design…
                            </div>
                          ) : cardDesignMap[card.id]?.imageUrl ? (
                            <div
                              onClick={() => setLightboxDesignCard(card.id)}
                              style={{ cursor: "zoom-in", borderRadius: 8, overflow: "hidden", border: `1px solid ${BLACK}14`, position: "relative", marginBottom: 12 }}
                            >
                              <img
                                src={cardDesignMap[card.id].imageUrl}
                                alt={cardDesignMap[card.id].name}
                                style={{ width: "100%", display: "block", maxHeight: 220, objectFit: "contain", background: BEIGE }}
                              />
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "16px 12px 8px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                                <span style={{ color: "#fff", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.78rem" }}>{cardDesignMap[card.id].name}</span>
                                <span style={{ background: "rgba(255,255,255,0.18)", borderRadius: 5, padding: "3px 8px", fontSize: "0.65rem", color: "#fff", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>🔍 Full size</span>
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {/* Lightbox */}
                        {lightboxDesignCard === card.id && cardDesignMap[card.id]?.imageUrl && (
                          <div
                            onClick={() => setLightboxDesignCard(null)}
                            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, cursor: "zoom-out" }}
                          >
                            <img
                              src={cardDesignMap[card.id].imageUrl}
                              alt={cardDesignMap[card.id].name}
                              style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8, boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}
                            />
                            <button
                              onClick={e => { e.stopPropagation(); setLightboxDesignCard(null); }}
                              style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}
                            >✕</button>
                            <div style={{ position: "absolute", bottom: 20, color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}>Click anywhere to close</div>
                          </div>
                        )}

                        {/* Message textarea */}
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
                              { label: "Shorter",    instruction: "Make it significantly shorter and more punchy. Keep only the most impactful lines." },
                              { label: "Funnier",    instruction: "Add genuine humor. Make it funnier without losing the heart." },
                              { label: "More heart", instruction: "Make it warmer and more emotionally resonant." },
                              { label: "Rewrite",    instruction: "Completely rewrite in a fresh way for the same person and occasion." },
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
                                    fontFamily: "'Inter', sans-serif",
                                  }}>
                                  {isLoading
                                    ? <Loader2 size={11} className="animate-spin" />
                                    : <Sparkles size={11} style={{ color: RED }} />}
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
                                <div style={{ padding: "10px 14px", background: `${BLACK}04`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
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
                                    <input
                                      placeholder="Street address"
                                      value={ov.line1 ?? ""}
                                      onChange={e => setOv({ line1: e.target.value })}
                                      style={{ width: "100%", border: `1.5px solid ${BLACK}18`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, fontFamily: "'Inter', sans-serif", outline: "none", boxSizing: "border-box" as const }}
                                    />
                                    <input
                                      placeholder="Apt / Suite (optional)"
                                      value={ov.line2 ?? ""}
                                      onChange={e => setOv({ line2: e.target.value })}
                                      style={{ width: "100%", border: `1.5px solid ${BLACK}18`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, fontFamily: "'Inter', sans-serif", outline: "none", boxSizing: "border-box" as const }}
                                    />
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 58px 84px", gap: 8 }}>
                                      <input placeholder="City" value={ov.city ?? ""} onChange={e => setOv({ city: e.target.value })} style={{ border: `1.5px solid ${BLACK}18`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, fontFamily: "'Inter', sans-serif", outline: "none" }} />
                                      <input placeholder="ST" maxLength={2} value={ov.state ?? ""} onChange={e => setOv({ state: e.target.value.toUpperCase() })} style={{ border: `1.5px solid ${BLACK}18`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, fontFamily: "'Inter', sans-serif", outline: "none" }} />
                                      <input placeholder="Zip" maxLength={10} value={ov.zip ?? ""} onChange={e => setOv({ zip: e.target.value })} style={{ border: `1.5px solid ${BLACK}18`, borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: BLACK, fontFamily: "'Inter', sans-serif", outline: "none" }} />
                                    </div>
                                  </div>
                                )}
                                {!addr && !isOverriding && (
                                  <div style={{ padding: "8px 14px", fontSize: "0.72rem", color: "#b45309", background: "#fffbeb", borderTop: `1px solid #fde68a` }}>
                                    Cards will still be queued — add your address above so we know where to mail them.
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Approve / Reject */}
                          <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
                            <button
                              onClick={() => rejectPersonalCard(card)}
                              style={{
                                fontSize: "0.78rem", fontWeight: 600, padding: "8px 16px",
                                borderRadius: 8, border: `1.5px solid ${BLACK}18`,
                                background: WHITE, color: GRAY, cursor: "pointer",
                                fontFamily: "'Inter', sans-serif",
                              }}>
                              Reject &amp; regenerate
                            </button>
                            <button
                              onClick={() => { setApprovingId(card.id); approvePersonalCard(card); }}
                              disabled={isApproving}
                              style={{
                                fontSize: "0.78rem", fontWeight: 700, padding: "8px 22px",
                                borderRadius: 8, border: "none",
                                background: RED, color: WHITE,
                                cursor: isApproving ? "default" : "pointer",
                                fontFamily: "'Inter', sans-serif",
                                display: "flex", alignItems: "center", gap: 6,
                              }}>
                              {isApproving
                                ? <Loader2 size={13} className="animate-spin" />
                                : <ThumbsUp size={13} />}
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

            {/* ── Section: Coming Up ──────────────────────────────────────── */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.12em", color: BLACK }}>
                  COMING UP — NEXT 90 DAYS
                </span>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: GRAY, background: `${BLACK}09`, borderRadius: 8, padding: "4px 10px" }}>
                  {allUpcomingEvents.length} event{allUpcomingEvents.length !== 1 ? "s" : ""}
                </span>
              </div>

              {allUpcomingEvents.length === 0 ? (
                <div style={{
                  background: WHITE, border: `1.5px solid ${BLACK}12`, borderRadius: 16,
                  padding: "60px 40px", textAlign: "center" as const,
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, background: "#f0fdf4",
                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
                  }}>
                    <CalendarDays size={26} style={{ color: "#22c55e" }} />
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.04em", color: BLACK, marginBottom: 6 }}>
                    {recipients.length === 0 ? "No people, no cards." : "Nothing in the next 90 days."}
                  </div>
                  <p style={{ fontSize: "0.82rem", color: GRAY }}>
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

                    return (
                      <div key={genKey} style={{
                        background: WHITE,
                        border: `1.5px solid ${hasCard ? "#22c55e30" : ev.briefingDone ? `${BLACK}18` : `${BLACK}12`}`,
                        borderRadius: 14, padding: "14px 18px",
                        display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}>
                        <UrgencyBadge days={ev.daysAway} />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: BLACK }}>
                            {ev.event}
                            <span style={{ fontWeight: 400, color: GRAY, marginLeft: 6 }}>for {ev.recipient.name}</span>
                          </div>
                          <div style={{ fontSize: "0.72rem", marginTop: 3, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, color: GRAY }}>
                            <span>{new Date(ev.dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                            {ev.briefingDone && <span style={{ fontWeight: 700, color: "#16a34a" }}>✓ Questions answered</span>}
                            {hasCard && <span style={{ fontWeight: 700, color: RED }}>↑ Needs approval above</span>}
                          </div>
                          {!ev.briefingDone && !hasCard && (
                            <div style={{ fontSize: "0.72rem", marginTop: 5, color: GRAY, fontStyle: "italic", lineHeight: 1.4 }}>
                              3 quick questions so the card sounds like <em style={{ fontStyle: "normal", fontWeight: 600, color: BLACK }}>you</em>, not a template.
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        {hasCard ? (() => {
                          const matchedCard = cards.find(c => c.recipientId === ev.recipient.id && c.holiday === ev.event);
                          const isApproved = matchedCard?.status === "Approved";
                          return isApproved ? (
                            <button
                              onClick={() => setViewingCardId(matchedCard!.id)}
                              style={{
                                fontSize: "0.72rem", fontWeight: 700, padding: "6px 12px",
                                borderRadius: 8, border: "none",
                                background: "#1d4ed8", color: WHITE, cursor: "pointer",
                                fontFamily: "'Inter', sans-serif", flexShrink: 0,
                              }}>
                              ✔ View Approved Card
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveTab("upcoming")}
                              style={{
                                fontSize: "0.72rem", fontWeight: 700, padding: "6px 12px",
                                borderRadius: 8, border: `1px solid ${RED}30`,
                                background: `${RED}08`, color: RED, cursor: "pointer",
                                fontFamily: "'Inter', sans-serif", flexShrink: 0,
                              }}>
                              Review ↑
                            </button>
                          );
                        })() : (
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            <Link href={`/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}`}>
                              <div style={{ position: "relative", display: "inline-block" }}
                                onMouseEnter={() => setHoveredBriefing(genKey)}
                                onMouseLeave={() => setHoveredBriefing(null)}
                              >
                                <button style={{
                                  fontSize: "0.72rem", fontWeight: 700, padding: "6px 12px",
                                  borderRadius: 8, border: `1px solid ${ev.briefingDone ? `${BLACK}18` : RED}`,
                                  background: ev.briefingDone ? `${BLACK}06` : `${RED}10`,
                                  color: ev.briefingDone ? GRAY : RED,
                                  cursor: "pointer", fontFamily: "'Inter', sans-serif",
                                }}>
                                  {ev.briefingDone ? "Edit personalization" : "✦ Personalize"}
                                </button>
                                {hoveredBriefing === genKey && (
                                  <div style={{
                                    position: "absolute", bottom: "calc(100% + 8px)", right: 0,
                                    background: "#1a1a1a", color: WHITE,
                                    fontSize: "0.68rem", lineHeight: 1.5,
                                    padding: "8px 11px", borderRadius: 7,
                                    maxWidth: 220, pointerEvents: "none",
                                    boxShadow: "0 3px 12px rgba(0,0,0,0.2)",
                                    zIndex: 50,
                                  }}>
                                    {ev.briefingDone
                                      ? <>Tell us more about {ev.recipient.name} — every answer makes future cards smarter. Totally optional.</>
                                      : <>A few optional questions about {ev.recipient.name}. The more we know, the more every card feels written just for them — skip anytime.</>}
                                    <div style={{
                                      position: "absolute", top: "100%", right: 14,
                                      border: "5px solid transparent",
                                      borderTopColor: "#1a1a1a",
                                    }} />
                                  </div>
                                )}
                              </div>
                            </Link>
                            <button
                              onClick={() => generateEarly(ev)}
                              disabled={!!generatingFor}
                              style={{
                                fontSize: "0.72rem", fontWeight: 700, padding: "6px 14px",
                                borderRadius: 8, border: "none",
                                background: isGenerating ? `${BLACK}10` : RED,
                                color: isGenerating ? GRAY : WHITE,
                                cursor: isGenerating || !!generatingFor ? "default" : "pointer",
                                display: "flex", alignItems: "center", gap: 5,
                                fontFamily: "'Inter', sans-serif",
                              }}>
                              {isGenerating
                                ? <><Loader2 size={11} className="animate-spin" /> Generating…</>
                                : <><Sparkles size={11} /> Generate Early</>}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Section: Approved & Queued ──────────────────────────────── */}
            {approvedPersonalCards.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.12em", color: "#16a34a" }}>
                    ✓ APPROVED &amp; QUEUED TO MAIL
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {approvedPersonalCards.map(card => (
                    <div key={card.id} style={{
                      background: WHITE, border: "1.5px solid #22c55e28",
                      borderRadius: 12, padding: "12px 18px",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <CheckCircle2 size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.88rem", color: BLACK }}>
                            {card.holiday} · {card.recipientName}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: GRAY, marginTop: 1 }}>
                            {card.deliveryPreference}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em",
                          background: "#f0fdf4", color: "#16a34a", border: "1px solid #22c55e30",
                          borderRadius: 6, padding: "3px 10px",
                        }}>
                          QUEUED TO MAIL
                        </span>
                        <button
                          onClick={() => setViewingCardId(card.id)}
                          style={{
                            fontSize: "0.72rem", fontWeight: 700, padding: "5px 12px",
                            borderRadius: 7, border: "none",
                            background: "#1d4ed8", color: WHITE, cursor: "pointer",
                            fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
                          }}>
                          View Card →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>

      {/* ── Approved Card Viewer Modal ──────────────────────────────────────── */}
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
              {/* Header */}
              <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK, fontFamily: "'Inter', sans-serif" }}>
                    {card.holiday} · {card.recipientName}
                  </div>
                  {mailDate && (
                    <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 3, fontFamily: "'Inter', sans-serif" }}>
                      Mailing on {mailDate}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setViewingCardId(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: GRAY, fontSize: "1.1rem", lineHeight: 1, padding: "2px 6px", flexShrink: 0 }}
                >✕</button>
              </div>

              {/* Approved banner */}
              <div style={{ margin: "14px 20px 0", display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #22c55e30", borderRadius: 8, padding: "10px 14px" }}>
                <CheckCircle2 size={15} style={{ color: "#16a34a", flexShrink: 0 }} />
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#15803d", fontFamily: "'Inter', sans-serif" }}>
                  Card approved — queued to mail
                </span>
              </div>

              {/* Message */}
              <div style={{ padding: "16px 20px 24px" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: GRAY, fontFamily: "'Inter', sans-serif", marginBottom: 8 }}>
                  Approved Message
                </div>
                <div style={{
                  background: BEIGE, border: `1.5px solid ${BLACK}12`, borderRadius: 10,
                  padding: "14px 16px", fontSize: "0.9rem", lineHeight: 1.7,
                  color: BLACK, fontFamily: "Georgia, serif", whiteSpace: "pre-wrap",
                }}>
                  {message || <span style={{ color: GRAY, fontStyle: "italic" }}>No message on file.</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Mobile FAB — Add Person ─────────────────────────────────────────── */}
      {isMobile && activeTab === "people" && (
        <Link href="/recipients/new">
          <button
            data-testid="link-add-recipient"
            style={{
              position: "fixed", bottom: 24, right: 20, zIndex: 200,
              display: "flex", alignItems: "center", gap: 8,
              background: RED, color: WHITE, border: "none",
              borderRadius: 28, padding: "14px 22px",
              fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.1em",
              boxShadow: "0 4px 20px rgba(226,59,46,0.38)",
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
            Add Person
          </button>
        </Link>
      )}

      {/* ── Handwriting Font Picker Modal ────────────────────────────────────── */}
      {fontPickerOpen && (
        <div
          onClick={() => setFontPickerOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: WHITE, borderRadius: 14, padding: "28px 28px 20px", width: 760, maxWidth: "95vw", maxHeight: "88vh", display: "flex", flexDirection: "column" as const, gap: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
          >
            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: BLACK, fontFamily: "'Inter', sans-serif" }}>Choose a Handwriting Style</div>
            <div style={{ fontSize: "0.82rem", color: GRAY, marginTop: -8, fontFamily: "'Inter', sans-serif" }}>
              Every card we send will be handwritten using real pens. Pick the style that feels like you.
            </div>
            {fontsLoading ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: GRAY, fontFamily: "'Inter', sans-serif" }}>Loading styles…</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, overflowY: "auto", paddingRight: 4 }}>
                {hwFonts.map((font, idx) => {
                  const selected = personalSettings.cardFont === font.id;
                  return (
                    <button key={font.id}
                      onClick={() => { updateSettings("cardFont", font.id); setFontPickerOpen(false); }}
                      style={{ border: `2px solid ${selected ? RED : "#e2e8f0"}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", background: selected ? `${RED}08` : WHITE, textAlign: "left" as const, transition: "all 0.12s", display: "flex", flexDirection: "column" as const, gap: 10 }}
                      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.borderColor = "#cbd5e1"; }}
                      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.88rem", color: BLACK, fontFamily: "'Inter', sans-serif" }}>{font.name}</span>
                        {idx === 0  && <span style={{ fontSize: "0.68rem", background: "#f1f5f9", color: GRAY, border: "1px solid #e2e8f0", borderRadius: 20, padding: "1px 7px", fontFamily: "'Inter', sans-serif" }}>Default</span>}
                        {selected   && <span style={{ fontSize: "0.68rem", background: RED, color: WHITE, borderRadius: 20, padding: "1px 7px", fontFamily: "'Inter', sans-serif" }}>Selected</span>}
                      </div>
                      {font.previewUrl
                        ? <img src={font.previewUrl} alt={`${font.name} handwriting sample`} style={{ width: "100%", height: 160, objectFit: "contain", objectPosition: "center center" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.nextSibling as HTMLElement).style.display = "block"; }} />
                        : null}
                      <div style={{ display: font.previewUrl ? "none" : "block", fontFamily: "cursive", fontSize: "1.1rem", color: "#334155", lineHeight: 1.5, paddingTop: 4 }}>Warm wishes and heartfelt thanks!</div>
                    </button>
                  );
                })}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4, borderTop: `1px solid ${BLACK}10` }}>
              {personalSettings.cardFont && (
                <button onClick={() => { updateSettings("cardFont", ""); setFontPickerOpen(false); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: GRAY, fontSize: "0.8rem", fontFamily: "'Inter', sans-serif" }}>
                  Clear selection
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button onClick={() => setFontPickerOpen(false)}
                style={{ background: RED, color: WHITE, border: "none", borderRadius: 7, padding: "8px 20px", cursor: "pointer", fontSize: "0.85rem", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Upgrade Modal ─────────────────────────────────────────────────────── */}
      {upgradeOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setUpgradeOpen(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}
        >
          <div style={{ background: WHITE, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto", padding: "28px 24px 36px" }}>
            <div style={{ width: 40, height: 4, background: `${BLACK}20`, borderRadius: 2, margin: "0 auto 24px" }} />
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.9rem", letterSpacing: "0.04em", color: BLACK, lineHeight: 1, marginBottom: 4 }}>
              NEED MORE CARDS?
            </div>
            <p style={{ fontSize: "0.85rem", color: GRAY, marginBottom: 20, fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>
              You've used all {PLANS[plan].maxCardsPerYear} card slots on your current plan. Upgrade to cover more occasions across your people.
            </p>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
              {(["basic","standard","premium"] as Plan[]).map((key) => {
                const config = PLANS[key];
                const isCurrent = key === plan;
                const orderedPlans: Plan[] = ["basic","standard","premium"];
                const isUpgrade = orderedPlans.indexOf(key) > orderedPlans.indexOf(plan);
                return (
                  <div key={key} style={{ borderRadius: 12, padding: "16px", border: `2px solid ${isCurrent ? `${BLACK}20` : isUpgrade ? `${RED}30` : `${BLACK}08`}`, background: isCurrent ? BEIGE : "#fafafa" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginBottom: 2 }}>
                          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.06em", color: BLACK }}>{config.label}</span>
                          {isCurrent && <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "1px 8px", borderRadius: 10, background: `${BLACK}10`, color: GRAY }}>Current</span>}
                          {key === "standard" && !isCurrent && <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "1px 8px", borderRadius: 10, background: `${RED}12`, color: RED }}>Most Popular</span>}
                        </div>
                        <p style={{ fontSize: "0.72rem", color: GRAY, margin: "0 0 8px", fontFamily: "'Inter', sans-serif" }}>{config.tagline}</p>
                        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 3 }}>
                          {config.perks.map(perk => (
                            <li key={perk} style={{ fontSize: "0.72rem", color: BLACK, display: "flex", alignItems: "center", gap: 5, fontFamily: "'Inter', sans-serif" }}>
                              <span style={{ color: RED, fontWeight: 700 }}>✓</span> {perk}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.7rem", color: BLACK, lineHeight: 1 }}>{config.price}</span>
                        {!isCurrent && (
                          <button
                            onClick={() => { upgradePlan(key); setUpgradeOpen(false); }}
                            style={{ background: isUpgrade ? RED : `${BLACK}10`, color: isUpgrade ? WHITE : GRAY, border: "none", borderRadius: 7, padding: "7px 16px", fontSize: "0.78rem", fontWeight: 700, fontFamily: "'Inter', sans-serif", cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            {isUpgrade ? "Upgrade" : "Downgrade"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: "0.7rem", textAlign: "center", color: `${GRAY}80`, marginTop: 16, fontFamily: "'Inter', sans-serif" }}>
              No relationships were guaranteed in the making of this subscription.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
