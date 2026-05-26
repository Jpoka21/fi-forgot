import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  getCards, getRecipients, getBriefingsForRecipient,
  CardOrder, Recipient, getAge,
} from "@/lib/data";
import {
  getCustomerPendingApprovals, customerApproveCard,
  updateDraftApprovedMessage,
  QueueItem, MessageDraft,
} from "@/lib/admin-data";
import { useAuth } from "@/lib/auth-context";
import {
  Users, CheckCircle2, Plus, ClipboardList, ThumbsUp,
  Sparkles, Loader2, ChevronDown, ChevronUp, CalendarDays, Search,
} from "lucide-react";

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
  r,
  upcoming,
}: {
  r: Recipient;
  upcoming: Array<{ event: string; daysAway: number; briefingDone: boolean }>;
}) {
  const nextEvent    = upcoming[0] ?? null;
  const childCount   = r.children?.length ?? 0;
  const yearsMarried = r.marriageDate ? getAge(r.marriageDate) : null;
  const events       = r.selectedEvents ?? [];
  const initials     = r.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  const urgColor = nextEvent
    ? nextEvent.daysAway <= 14 ? RED
      : nextEvent.daysAway <= 30 ? "#c2820a"
      : "#16a34a"
    : GRAY;
  const urgBg = nextEvent
    ? nextEvent.daysAway <= 14 ? `${RED}10`
      : nextEvent.daysAway <= 30 ? "#fef9c3"
      : "#f0fdf4"
    : `${BLACK}06`;

  return (
    <div
      style={{
        background: BEIGE,
        border: `1.5px solid ${BLACK}14`,
        borderRadius: 16,
        padding: "20px 20px 16px",
        display: "flex", flexDirection: "column" as const, gap: 14,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.15s, transform 0.15s",
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = "0 4px 18px rgba(0,0,0,0.10)"; el.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; el.style.transform = "none"; }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: BLACK,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", color: WHITE, letterSpacing: "0.04em" }}>
            {initials}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: BLACK, letterSpacing: "0.04em", lineHeight: 1.1 }}>
            {r.name}
          </div>
          <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 3, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" as const }}>
            <span style={{ background: `${BLACK}10`, color: BLACK, borderRadius: 4, padding: "1px 6px", fontWeight: 600, fontSize: "0.66rem", letterSpacing: "0.04em" }}>
              {r.relationship}
            </span>
            {yearsMarried !== null && yearsMarried > 0 && <span>{yearsMarried} yr{yearsMarried !== 1 ? "s" : ""}</span>}
            {childCount > 0 && <span>{childCount} kid{childCount !== 1 ? "s" : ""}</span>}
          </div>
        </div>
        {/* Next event badge */}
        {nextEvent && (
          <div style={{ flexShrink: 0, textAlign: "right" as const }}>
            <div style={{ background: urgBg, border: `1px solid ${urgColor}35`, borderRadius: 8, padding: "4px 9px", display: "inline-block" }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", color: urgColor, lineHeight: 1 }}>
                {nextEvent.daysAway}d
              </span>
            </div>
            <div style={{ fontSize: "0.6rem", color: GRAY, marginTop: 2 }}>{nextEvent.event}</div>
          </div>
        )}
      </div>

      {/* Event chips */}
      {events.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
          {events.slice(0, 5).map(e => {
            const days  = daysUntilEvent(e, r);
            const isNext = nextEvent?.event === e;
            return (
              <span key={e} style={{
                fontSize: "0.65rem", padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                background: isNext ? `${RED}13` : `${BLACK}07`,
                color: isNext ? RED : "#475569",
                border: `1px solid ${isNext ? `${RED}30` : `${BLACK}10`}`,
              }}>
                {e}{days !== null && days <= 45 ? ` · ${days}d` : ""}
              </span>
            );
          })}
          {events.length > 5 && (
            <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 20, background: `${BLACK}07`, color: GRAY }}>
              +{events.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div style={{
        marginTop: "auto", paddingTop: 10, borderTop: `1px solid ${BLACK}08`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {nextEvent && !nextEvent.briefingDone ? (
          <Link href={`/briefings/${r.id}/${encodeURIComponent(nextEvent.event)}`}>
            <button style={{
              fontSize: "0.7rem", fontWeight: 700, color: RED,
              background: `${RED}10`, border: `1px solid ${RED}28`,
              borderRadius: 6, padding: "4px 10px", cursor: "pointer",
            }}>
              Answer questions →
            </button>
          </Link>
        ) : <span />}
        <Link href={`/recipients/${r.id}`}>
          <button style={{
            fontSize: "0.7rem", fontWeight: 700, color: GRAY,
            background: `${BLACK}06`, border: `1px solid ${BLACK}12`,
            borderRadius: 6, padding: "4px 10px", cursor: "pointer",
          }}>
            Manage →
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

  const { user, logout } = useAuth();
  const [, setLocation]  = useLocation();

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

  const TABS = [
    { key: "people"   as const, label: "Your People",    icon: Users,        count: recipients.length },
    { key: "upcoming" as const, label: "Upcoming Cards", icon: CalendarDays, count: allUpcomingEvents.length },
  ];

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: WHITE, display: "flex", flexDirection: "column" as const, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sticky header ────────────────────────────────────────────────────── */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, flexShrink: 0 }}>

        {/* Main header bar — exact home page nav style */}
        <header style={{
          background: BEIGE,
          borderBottom: `1px solid ${BLACK}1A`,
          padding: "0 32px 0 24px",
          height: 96,
          display: "flex", alignItems: "center", gap: 0,
        }}>
          {/* Logo — identical to landing page */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column" as const, marginRight: 40, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 0, lineHeight: 1 }}>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.6rem", color: RED, fontStyle: "italic", letterSpacing: "0.01em" }}>F*</span>
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.6rem", color: BLACK, letterSpacing: "0.04em", marginLeft: 8 }}>I FORGOT</span>
            </div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.72rem", letterSpacing: "0.22em", color: GRAY, marginTop: -2, fontWeight: 900 }}>
              RELATIONSHIP DAMAGE CONTROL
            </div>
          </Link>

          {/* Nav links — same font/size as landing page */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}>
            {[
              { label: "RECIPIENTS",  href: "/recipients" },
              { label: "REMINDERS",   href: "/settings/reminders" },
              { label: "PLANS",       href: "/signup" },
            ].map(link => (
              <Link key={link.href} href={link.href}
                style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", letterSpacing: "0.1em", color: BLACK, textDecoration: "none", padding: "0 18px", whiteSpace: "nowrap" as const, opacity: 0.85 }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: pending alert + workspace toggle + account */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
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

        {/* Tab bar — slightly darker beige strip */}
        <div style={{
          background: BEIGE,
          borderBottom: `1px solid ${BLACK}12`,
          padding: "0 28px",
          display: "flex", alignItems: "center", gap: 0,
        }}>
          {TABS.map(({ key, label, icon: Icon, count }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "0 20px", height: 44,
                  background: active ? `${BLACK}06` : "transparent",
                  border: "none",
                  borderBottom: active ? `2px solid ${RED}` : "2px solid transparent",
                  cursor: "pointer", transition: "all 0.15s",
                  marginBottom: -1,
                }}
              >
                <Icon size={14} style={{ color: active ? BLACK : `${BLACK}45` }} />
                <span style={{
                  fontFamily: "'Bebas Neue', cursive", fontSize: "0.88rem",
                  letterSpacing: "0.1em",
                  color: active ? BLACK : `${BLACK}45`,
                }}>
                  {label}
                </span>
                {count > 0 && (
                  <span style={{
                    background: active ? `${RED}20` : `${BLACK}10`,
                    color: active ? RED : `${BLACK}50`,
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

      {/* ── Stat strip — sits just below the sticky header ───────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "10px 28px",
        borderBottom: `1px solid ${BLACK}10`,
        background: BEIGE,
      }}>
        {[
          { label: "People covered",   value: recipients.length,    color: BLACK },
          { label: "Events on autopilot", value: disastersAvoided, color: BLACK },
          { label: "Upcoming (90 days)", value: allUpcomingEvents.length, color: allUpcomingEvents.length > 0 ? RED : BLACK },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color, lineHeight: 1 }}>{value}</span>
            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: `${BLACK}50`, letterSpacing: "0.04em" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Alert banners ────────────────────────────────────────────────────── */}
      <div style={{ padding: "0 28px" }}>

        {/* Pending approvals */}
        {pendingApprovals.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <ThumbsUp size={16} style={{ color: RED }} />
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.05em", color: RED }}>
                {pendingApprovals.length === 1 ? "1 card needs your approval" : `${pendingApprovals.length} cards need your approval`}
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
        )}

        {/* Briefings banner */}
        {briefingsNeeded.length > 0 && (
          <div style={{
            marginTop: 20, background: WHITE,
            border: `1.5px solid ${RED}25`, borderRadius: 14, padding: "16px 20px",
            display: "flex", alignItems: "flex-start", gap: 12,
          }}>
            <ClipboardList size={18} style={{ color: RED, marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: BLACK }}>
                {briefingsNeeded.length === 1 ? "1 event briefing coming up" : `${briefingsNeeded.length} event briefings coming up`}
              </div>
              <p style={{ fontSize: "0.75rem", color: GRAY, margin: "3px 0 10px" }}>
                Answer a few quick questions so we write the most personal card possible.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                {briefingsNeeded.slice(0, 4).map((b) => (
                  <Link key={`${b.recipient.id}-${b.event}`} href={`/briefings/${b.recipient.id}/${encodeURIComponent(b.event)}`}>
                    <button style={{
                      display: "flex", alignItems: "center", gap: 6,
                      fontSize: "0.72rem", fontWeight: 700, padding: "5px 12px",
                      borderRadius: 20, background: RED, color: WHITE, border: "none", cursor: "pointer",
                    }}>
                      {b.event} · {b.recipient.name}
                      <span style={{ opacity: 0.7 }}>{b.daysAway}d</span>
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: "24px 28px 48px" }}>

        {/* ─── YOUR PEOPLE ─────────────────────────────────────────────────── */}
        {activeTab === "people" && (
          <div>
            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, position: "relative" as const }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: GRAY, pointerEvents: "none" }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or relationship…"
                  style={{
                    width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                    border: `1.5px solid ${BLACK}16`, borderRadius: 10, fontSize: "0.85rem",
                    fontFamily: "'Inter', sans-serif", outline: "none", background: WHITE, color: BLACK,
                    boxSizing: "border-box" as const,
                  }}
                />
              </div>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {filteredRecipients.map((r) => (
                  <RecipientCard
                    key={r.id}
                    r={r}
                    upcoming={recipientUpcomingMap.get(r.id) ?? []}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── UPCOMING CARDS ──────────────────────────────────────────────── */}
        {activeTab === "upcoming" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.05em", color: BLACK }}>
                Next 90 Days
              </div>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", color: GRAY, background: `${BLACK}10`, borderRadius: 8, padding: "4px 10px" }}>
                {allUpcomingEvents.length} event{allUpcomingEvents.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p style={{ fontSize: "0.82rem", color: GRAY, marginBottom: 20 }}>
              Answer a couple of quick questions and we'll write the most personal card — or skip it and we'll email you when it's close.
            </p>

            {/* Cards awaiting approval */}
            {awaitingApproval.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: GRAY, textTransform: "uppercase" as const, marginBottom: 8 }}>
                  Ready for Review
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {awaitingApproval.map((card) => (
                    <div
                      key={card.id}
                      data-testid={`card-order-${card.id}`}
                      style={{
                        background: WHITE, border: `1.5px solid ${RED}28`, borderRadius: 14,
                        padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
                        boxShadow: "0 2px 6px rgba(226,59,46,0.06)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <CheckCircle2 size={20} style={{ color: RED, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: BLACK }}>
                            {card.holiday} card for {card.recipientName}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 2 }}>
                            Due {card.dueDate} · {card.deliveryPreference}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: "0.75rem", fontWeight: 700, color: RED,
                        background: `${RED}10`, border: `1px solid ${RED}22`,
                        borderRadius: 8, padding: "5px 12px",
                      }}>
                        Pick yours →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming event rows */}
            {allUpcomingEvents.length === 0 ? (
              <div style={{
                background: WHITE, border: `1.5px solid ${BLACK}12`, borderRadius: 16,
                padding: "60px 40px", textAlign: "center" as const,
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
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
                  {recipients.length === 0
                    ? "Add someone to watch over first."
                    : "Cards will appear here as occasions approach."}
                </p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: GRAY, textTransform: "uppercase" as const, marginBottom: 8 }}>
                  Upcoming Events
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {allUpcomingEvents.map((ev) => (
                    <div
                      key={`${ev.recipient.id}-${ev.event}`}
                      style={{
                        background: WHITE,
                        border: `1.5px solid ${ev.briefingDone ? "#22c55e28" : `${BLACK}12`}`,
                        borderRadius: 14, padding: "14px 18px",
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                        <UrgencyBadge days={ev.daysAway} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: BLACK }}>
                            {ev.event}
                            <span style={{ fontWeight: 400, color: GRAY, marginLeft: 6 }}>for {ev.recipient.name}</span>
                          </div>
                          <div style={{ fontSize: "0.72rem", marginTop: 3, display: "flex", alignItems: "center", gap: 8, color: GRAY }}>
                            <span>
                              {new Date(ev.dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                            {ev.briefingDone && (
                              <span style={{ fontWeight: 700, color: "#16a34a" }}>✓ Questions answered</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link href={`/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}`}>
                        <button style={{
                          flexShrink: 0, fontSize: "0.75rem", fontWeight: 700,
                          padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                          background: ev.briefingDone ? `${BLACK}08` : RED,
                          color: ev.briefingDone ? GRAY : WHITE,
                          fontFamily: "'Inter', sans-serif",
                        }}>
                          {ev.briefingDone ? "Update answers" : "Answer now"}
                        </button>
                      </Link>
                    </div>
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
