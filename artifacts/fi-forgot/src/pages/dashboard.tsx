import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import AppLayout from "@/components/layout/AppLayout";
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
  Users, Zap, CheckCircle2, Plus, ShieldCheck,
  Clock, ClipboardList, ThumbsUp, Sparkles, Loader2,
  ChevronDown, ChevronUp, CalendarDays, Search,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const NAVY  = "#071A33";
const RED   = "#E23B2E";
const WHITE = "#FFFFFF";
const GRAY  = "#94a3b8";
const LIGHT = "#f1f5f9";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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
  const year = today.getFullYear();
  if (event === "Birthday" && recipient.birthday) {
    const [, m, d] = recipient.birthday.split("-").map(Number);
    let next = new Date(year, m - 1, d);
    if (next < today) next = new Date(year + 1, m - 1, d);
    return Math.ceil((next.getTime() - today.getTime()) / 86400000);
  }
  if (event === "Anniversary") {
    const src = recipient.anniversaryDate ?? recipient.marriageDate;
    if (src) {
      const parts = src.split("-").map(Number);
      let next = new Date(year, parts[1] - 1, parts[2]);
      if (next < today) next = new Date(year + 1, parts[1] - 1, parts[2]);
      return Math.ceil((next.getTime() - today.getTime()) / 86400000);
    }
  }
  const custom = recipient.customDates?.find((c) => c.label === event);
  if (custom?.date) {
    const parts = custom.date.split("-").map(Number);
    let next = new Date(year, parts[1] - 1, parts[2]);
    if (next < today) next = new Date(year + 1, parts[1] - 1, parts[2]);
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
  const now = new Date();
  const year = now.getFullYear();
  function nextOccurrence(stored: string): string {
    const parts = stored.split("-").map(Number);
    const m = parts[1]; const d = parts[2];
    let next = new Date(year, m - 1, d);
    if (next < now) next = new Date(year + 1, m - 1, d);
    return localDateStr(next);
  }
  if (event === "Birthday" && recipient.birthday) return nextOccurrence(recipient.birthday);
  if (event === "Anniversary") {
    const src = recipient.anniversaryDate ?? recipient.marriageDate;
    if (src) return nextOccurrence(src);
  }
  const custom = recipient.customDates?.find((c) => c.label === event);
  if (custom?.date) return nextOccurrence(custom.date);
  const fixed = HOLIDAY_DATES[event];
  if (fixed) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const stored = `${year}-${pad(fixed.month)}-${pad(fixed.day)}`;
    return nextOccurrence(stored);
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

function UrgencyBadge({ days }: { days: number }) {
  const urgent = days <= 14;
  const soon   = days <= 30;
  const bg    = urgent ? RED       : soon ? "#f59e0b" : "#22c55e";
  const light = urgent ? `${RED}15` : soon ? "#fef3c715" : "#dcfce715";
  return (
    <div
      style={{
        minWidth: 52, height: 52, borderRadius: 12,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: light, border: `1.5px solid ${bg}40`, flexShrink: 0,
      }}
    >
      <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", color: bg, lineHeight: 1 }}>{days}</span>
      <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.08em", color: bg, textTransform: "uppercase" as const }}>days</span>
    </div>
  );
}

function RecipientCard({ r, upcoming }: { r: Recipient; upcoming: { event: string; daysAway: number; briefingDone: boolean }[] }) {
  const nextEvent = upcoming[0] ?? null;
  const childCount = r.children?.length ?? 0;
  const yearsMarried = r.marriageDate ? getAge(r.marriageDate) : null;
  const events = r.selectedEvents ?? [];

  const initials = r.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();

  return (
    <div
      style={{
        background: WHITE,
        border: "1.5px solid #e2e8f0",
        borderRadius: 16,
        padding: "20px 20px 16px",
        display: "flex",
        flexDirection: "column" as const,
        gap: 14,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.15s, transform 0.15s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 18px rgba(0,0,0,0.10)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)"; (e.currentTarget as HTMLDivElement).style.transform = "none"; }}
    >
      {/* Top row: avatar + name + next event badge */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 46, height: 46, borderRadius: 12,
            background: NAVY, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", color: WHITE, letterSpacing: "0.04em" }}>{initials}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", color: NAVY, letterSpacing: "0.04em", lineHeight: 1.1 }}>
            {r.name}
          </div>
          <div style={{ fontSize: "0.75rem", color: GRAY, marginTop: 2, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" as const }}>
            <span style={{ background: `${NAVY}12`, color: NAVY, borderRadius: 4, padding: "1px 6px", fontWeight: 600, fontSize: "0.68rem", letterSpacing: "0.05em" }}>
              {r.relationship}
            </span>
            {yearsMarried !== null && yearsMarried > 0 && (
              <span>{yearsMarried} yr{yearsMarried !== 1 ? "s" : ""}</span>
            )}
            {childCount > 0 && (
              <span>{childCount} kid{childCount !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>
        {nextEvent && (
          <div style={{ flexShrink: 0, textAlign: "right" as const }}>
            <div style={{
              background: nextEvent.daysAway <= 14 ? `${RED}12` : nextEvent.daysAway <= 30 ? "#fef3c7" : "#f0fdf4",
              border: `1px solid ${nextEvent.daysAway <= 14 ? RED : nextEvent.daysAway <= 30 ? "#f59e0b" : "#22c55e"}40`,
              borderRadius: 8, padding: "4px 8px", display: "inline-block",
            }}>
              <span style={{
                fontFamily: "'Bebas Neue', cursive", fontSize: "1rem",
                color: nextEvent.daysAway <= 14 ? RED : nextEvent.daysAway <= 30 ? "#b45309" : "#16a34a",
                lineHeight: 1,
              }}>
                {nextEvent.daysAway}d
              </span>
            </div>
            <div style={{ fontSize: "0.6rem", color: GRAY, marginTop: 2, textAlign: "right" as const }}>
              {nextEvent.event}
            </div>
          </div>
        )}
      </div>

      {/* Event chips */}
      {events.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
          {events.slice(0, 5).map(e => {
            const days = daysUntilEvent(e, r);
            const isNext = nextEvent?.event === e;
            return (
              <span
                key={e}
                style={{
                  fontSize: "0.65rem", padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                  background: isNext ? `${RED}15` : "#f1f5f9",
                  color: isNext ? RED : "#475569",
                  border: `1px solid ${isNext ? `${RED}35` : "#e2e8f0"}`,
                }}
              >
                {e}{days !== null && days <= 45 ? ` · ${days}d` : ""}
              </span>
            );
          })}
          {events.length > 5 && (
            <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: 20, background: "#f1f5f9", color: GRAY }}>
              +{events.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Footer: manage button */}
      <div style={{ marginTop: "auto", paddingTop: 4, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {nextEvent && !nextEvent.briefingDone ? (
          <Link href={`/briefings/${r.id}/${encodeURIComponent(nextEvent.event)}`}>
            <button style={{
              fontSize: "0.7rem", fontWeight: 700, color: RED, background: `${RED}10`,
              border: `1px solid ${RED}30`, borderRadius: 6, padding: "4px 10px", cursor: "pointer",
              fontFamily: "'Inter', sans-serif", letterSpacing: "0.03em",
            }}>
              Answer questions →
            </button>
          </Link>
        ) : (
          <span />
        )}
        <Link href={`/recipients/${r.id}`}>
          <button style={{
            fontSize: "0.7rem", fontWeight: 700, color: "#475569", background: "#f8fafc",
            border: "1px solid #e2e8f0", borderRadius: 6, padding: "4px 10px", cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}>
            Manage →
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [cards, setCards]                     = useState<CardOrder[]>([]);
  const [recipients, setRecipients]           = useState<Recipient[]>([]);
  const [upcomingBriefings, setUpcomingBriefings] = useState<UpcomingBriefing[]>([]);
  const [pendingApprovals, setPendingApprovals]   = useState<PendingApproval[]>([]);
  const [refinedMessages, setRefinedMessages] = useState<Record<string, string>>({});
  const [refinePrompt, setRefinePrompt]       = useState<Record<string, string>>({});
  const [refiningId, setRefiningId]           = useState<string | null>(null);
  const [refineOpen, setRefineOpen]           = useState<string | null>(null);
  const [activeTab, setActiveTab]             = useState<"people" | "upcoming">("people");
  const [search, setSearch]                   = useState("");

  const { user } = useAuth();
  const [, setLocation] = useLocation();

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
        const briefingDoneThisYear = briefings.some((b) => b.event === event && b.year === thisYear);
        pending.push({ recipient: r, event, daysAway: days, briefingDoneThisYear });
      }
    }
    pending.sort((a, b) => a.daysAway - b.daysAway);
    setUpcomingBriefings(pending);
  }, []);

  const upcoming      = cards.filter((c) => !["Delivered", "Given"].includes(c.status));
  const awaitingApproval = cards.filter((c) => c.status === "Ready for approval");
  const disastersAvoided = recipients.reduce((sum, r) => sum + (r.selectedEvents?.length ?? 0), 0);

  const allUpcomingEvents = useMemo(() => {
    const today = new Date();
    const cutoff = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    const thisYear = today.getFullYear();
    const result: Array<{
      recipient: Recipient;
      event: string;
      daysAway: number;
      dateStr: string;
      briefingDone: boolean;
    }> = [];
    for (const r of recipients) {
      const briefings = getBriefingsForRecipient(r.id);
      for (const event of r.selectedEvents ?? []) {
        const dateStr = getEventDate(event, r);
        if (!dateStr) continue;
        const d = new Date(dateStr);
        if (d < today || d > cutoff) continue;
        const daysAway = Math.ceil((d.getTime() - today.getTime()) / 86400000);
        const briefingDone = briefings.some((b) => b.event === event && b.year === thisYear);
        result.push({ recipient: r, event, daysAway, dateStr, briefingDone });
      }
    }
    result.sort((a, b) => a.daysAway - b.daysAway);
    return result;
  }, [recipients]);

  const briefingsNeeded = upcomingBriefings.filter((b) => !b.briefingDoneThisYear);
  const approvalCount = awaitingApproval.length + pendingApprovals.length;

  // Per-recipient upcoming events map
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
    !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.relationship.toLowerCase().includes(search.toLowerCase())
  );

  const QUICK_PROMPTS = [
    { label: "Shorter",        prompt: "Make it significantly shorter and more punchy." },
    { label: "More funny",     prompt: "Make it funnier and add some humor." },
    { label: "Add more heart", prompt: "Make it warmer and more heartfelt." },
    { label: "More personal",  prompt: "Make it feel more personal and specific." },
  ];

  // ── Tab definitions ──────────────────────────────────────────────────────────
  const TABS = [
    { key: "people" as const,   label: "Your People",     icon: Users,       count: recipients.length },
    { key: "upcoming" as const, label: "Upcoming Cards",  icon: CalendarDays, count: allUpcomingEvents.length },
  ];

  return (
    <AppLayout>
      <div style={{ minHeight: "100vh", background: LIGHT, display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>

        {/* ── Sticky header ──────────────────────────────────────────────────── */}
        <div style={{ position: "sticky", top: 0, zIndex: 40, flexShrink: 0 }}>

          {/* Main header bar */}
          <div style={{
            background: NAVY,
            padding: "0 28px",
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
          }}>
            {/* Left: title */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: RED, fontStyle: "italic", marginRight: 5 }}>F*</span>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", color: WHITE, letterSpacing: "0.05em" }}>I FORGOT</span>
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.8rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginLeft: 10, alignSelf: "flex-end", paddingBottom: 4 }}>PERSONAL</span>
                </div>
              </div>
              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.12)" }} />
              <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.9rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>
                {user?.name ? `HEY, ${user.name.split(" ")[0].toUpperCase()}.` : "DASHBOARD"}
              </span>
            </div>

            {/* Right: stat pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {approvalCount > 0 && (
                <button
                  onClick={() => { setActiveTab("upcoming"); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: `${RED}25`, border: `1px solid ${RED}50`,
                    borderRadius: 8, padding: "5px 12px", cursor: "pointer",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: RED, display: "block" }} />
                  <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.8rem", letterSpacing: "0.1em", color: "#fff" }}>
                    {approvalCount} AWAITING REVIEW
                  </span>
                </button>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "People", value: recipients.length },
                  { label: "Events", value: disastersAvoided },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: "center" as const, padding: "4px 12px", background: "rgba(255,255,255,0.07)", borderRadius: 8 }}>
                    <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", color: WHITE, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ background: "#0a1f3d", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 28px", display: "flex", alignItems: "center", gap: 0 }}>
            {TABS.map(({ key, label, icon: Icon, count }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "0 20px", height: 44,
                    background: active ? "rgba(255,255,255,0.07)" : "transparent",
                    border: "none", borderBottom: active ? `2px solid ${RED}` : "2px solid transparent",
                    cursor: "pointer", transition: "all 0.15s",
                    marginBottom: -1,
                  }}
                >
                  <Icon size={14} style={{ color: active ? WHITE : "rgba(255,255,255,0.4)" }} />
                  <span style={{
                    fontFamily: "'Bebas Neue', cursive", fontSize: "0.88rem",
                    letterSpacing: "0.1em", color: active ? WHITE : "rgba(255,255,255,0.4)",
                  }}>
                    {label}
                  </span>
                  {count > 0 && (
                    <span style={{
                      background: active ? `${RED}30` : "rgba(255,255,255,0.08)",
                      color: active ? WHITE : "rgba(255,255,255,0.35)",
                      borderRadius: 10, padding: "0 7px", fontSize: "0.65rem", fontWeight: 700, lineHeight: "18px",
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Alert banners ──────────────────────────────────────────────────── */}
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
                  const isRefining    = refiningId === item.id;
                  const isRefineOpen  = refineOpen === item.id;

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
                          currentMessage,
                          refinementPrompt: prompt,
                          recipientName: item.recipientName,
                          eventType: item.eventType,
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
                    <div
                      key={item.id}
                      id={`approval-${item.id}`}
                      style={{
                        background: WHITE, border: `1.5px solid ${RED}25`,
                        borderRadius: 14, padding: "20px 22px",
                        boxShadow: "0 2px 8px rgba(226,59,46,0.08)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1e293b" }}>
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
                          background: LIGHT, borderRadius: 10, padding: "14px 16px",
                          fontSize: "0.88rem", color: "#1e293b", lineHeight: 1.6,
                          fontStyle: "italic",
                          whiteSpace: "pre-wrap",
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
                            fontSize: "0.78rem", fontWeight: 600, color: "#64748b",
                            padding: 0,
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
                                    borderRadius: 20, border: `1px solid ${RED}40`, color: RED,
                                    background: `${RED}08`, cursor: "pointer",
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
                                placeholder="e.g. Mention the camping trip, add her garden, skip the age reference…"
                                disabled={isRefining}
                                style={{
                                  flex: 1, border: "1px solid #e2e8f0", borderRadius: 10,
                                  padding: "8px 12px", fontSize: "0.82rem", resize: "none" as const,
                                  outline: "none", fontFamily: "'Inter', sans-serif",
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
              border: `1.5px solid ${RED}30`, borderRadius: 14, padding: "16px 20px",
              display: "flex", alignItems: "flex-start", gap: 12,
            }}>
              <ClipboardList size={18} style={{ color: RED, marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }}>
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

        {/* ── Tab content ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: "24px 28px 40px" }}>

          {/* ─── YOUR PEOPLE ─────────────────────────────────────────────────── */}
          {activeTab === "people" && (
            <div>
              {/* Toolbar */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, position: "relative" as const }}>
                  <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: GRAY }} />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name or relationship…"
                    style={{
                      width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                      border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: "0.85rem",
                      fontFamily: "'Inter', sans-serif", outline: "none", background: WHITE,
                      color: "#1e293b",
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

              {/* Cards grid */}
              {filteredRecipients.length === 0 ? (
                <div style={{
                  background: WHITE, border: "1.5px solid #e2e8f0", borderRadius: 16,
                  padding: "60px 40px", textAlign: "center" as const,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `${RED}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Users size={26} style={{ color: RED }} />
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", letterSpacing: "0.04em", color: "#1e293b", marginBottom: 8 }}>
                    {search ? "No matches found." : "Autopilot needs a target."}
                  </div>
                  <p style={{ fontSize: "0.85rem", color: GRAY, marginBottom: 20, maxWidth: 360, margin: "0 auto 20px" }}>
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
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.05em", color: "#1e293b" }}>
                  Next 90 Days
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", color: GRAY, background: "#e2e8f0", borderRadius: 8, padding: "4px 10px" }}>
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
                          background: WHITE, border: `1.5px solid ${RED}30`, borderRadius: 14,
                          padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
                          boxShadow: "0 2px 8px rgba(226,59,46,0.07)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <CheckCircle2 size={20} style={{ color: RED, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>
                              {card.holiday} card for {card.recipientName}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: GRAY, marginTop: 2 }}>
                              Due {card.dueDate} · {card.deliveryPreference}
                            </div>
                          </div>
                        </div>
                        <span style={{
                          fontSize: "0.75rem", fontWeight: 700, color: RED,
                          background: `${RED}10`, border: `1px solid ${RED}25`,
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
                  background: WHITE, border: "1.5px solid #e2e8f0", borderRadius: 16,
                  padding: "60px 40px", textAlign: "center" as const,
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <CalendarDays size={26} style={{ color: "#22c55e" }} />
                  </div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.04em", color: "#1e293b", marginBottom: 6 }}>
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
                          border: `1.5px solid ${ev.briefingDone ? "#22c55e30" : "#e2e8f0"}`,
                          borderRadius: 14, padding: "14px 18px",
                          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                          <UrgencyBadge days={ev.daysAway} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>
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
                            background: ev.briefingDone ? "#f1f5f9" : RED,
                            color: ev.briefingDone ? "#64748b" : WHITE,
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
    </AppLayout>
  );
}
