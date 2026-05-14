import { useState, useEffect } from "react";
import { Link } from "wouter";
import AppLayout from "@/components/layout/AppLayout";
import {
  getCards, getRecipients, getBriefingsForRecipient,
  STATUS_COLORS, CardOrder, Recipient, getAge,
} from "@/lib/data";
import {
  getCustomerPendingApprovals, customerApproveCard,
  updateDraftApprovedMessage,
  QueueItem, MessageDraft,
} from "@/lib/admin-data";
import { useAuth } from "@/lib/auth-context";
import {
  CalendarDays, Users, Zap, CheckCircle2, Plus, ShieldCheck,
  Clock, ClipboardList, ThumbsUp, Sparkles, Loader2,
  ChevronDown, ChevronUp, AlertTriangle, Layers, ChevronLeft, ChevronRight,
} from "lucide-react";

const NAVY  = "#071A33";
const RED   = "#E23B2E";
const BLACK = "#111111";
const BEIGE = "#F2E6D3";
const GRAY  = "#6B6B6B";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const HOLIDAY_DATES: Record<string, { month: number; day: number }> = {
  "Valentine's Day": { month: 2, day: 14 },
  "Mother's Day":    { month: 5, day: 12 },
  "Father's Day":    { month: 6, day: 16 },
  "Thanksgiving":    { month: 11, day: 28 },
  "Christmas":       { month: 12, day: 25 },
  "Hanukkah":        { month: 12, day: 26 },
  "New Year's":      { month: 1, day: 1 },
  "Easter":          { month: 4, day: 20 },
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

  if (event === "Anniversary" && recipient.marriageDate) {
    const [, m, d] = recipient.marriageDate.split("-").map(Number);
    let next = new Date(year, m - 1, d);
    if (next < today) next = new Date(year + 1, m - 1, d);
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

/** Format a local Date as YYYY-MM-DD without UTC conversion drift */
function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getEventDate(event: string, recipient: Recipient): string | null {
  const now = new Date();
  const year = now.getFullYear();

  // Helper: given a stored ISO date string (any year), return next occurrence
  function nextOccurrence(stored: string): string {
    const parts = stored.split("-").map(Number);
    const m = parts[1];
    const d = parts[2];
    let next = new Date(year, m - 1, d);
    if (next < now) next = new Date(year + 1, m - 1, d);
    return localDateStr(next);
  }

  if (event === "Birthday" && recipient.birthday)
    return nextOccurrence(recipient.birthday);

  // Anniversary may come from anniversaryDate (onboarding) or marriageDate (manual edit)
  if (event === "Anniversary") {
    const src = recipient.anniversaryDate ?? recipient.marriageDate;
    if (src) return nextOccurrence(src);
  }

  // Custom dates: Work Anniversary, Graduation, Just Because, etc.
  const custom = recipient.customDates?.find((c) => c.label === event);
  if (custom?.date) return nextOccurrence(custom.date);

  // Fixed holidays
  const fixed = HOLIDAY_DATES[event];
  if (fixed) {
    let next = new Date(year, fixed.month - 1, fixed.day);
    if (next < now) next = new Date(year + 1, fixed.month - 1, fixed.day);
    return localDateStr(next);
  }

  return null;
}

interface UpcomingBriefing {
  recipient: Recipient;
  event: string;
  daysAway: number;
  briefingDoneThisYear: boolean;
}

function StatusBadge({ status }: { status: CardOrder["status"] }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
}

function StatCard({
  label, value, icon: Icon, accentColor, sub,
}: {
  label: string; value: string | number; icon: React.ElementType;
  accentColor: string; sub?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5"
      style={{ background: "#fff", border: `1.5px solid ${BLACK}18`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accentColor}15` }}
      >
        <Icon size={20} style={{ color: accentColor }} />
      </div>
      <div>
        <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.8rem", color: BLACK, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "0.75rem", color: GRAY, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: "0.7rem", fontWeight: 700, marginTop: 2, color: accentColor }}>{sub}</div>}
      </div>
    </div>
  );
}

function IllustrationPlaceholder({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const dims: Record<string, string> = { sm: "h-16 w-20", md: "h-24 w-28", lg: "h-36 w-44" };
  return (
    <div
      className={`${dims[size]} rounded-2xl flex flex-col items-center justify-center gap-1.5 flex-shrink-0 select-none`}
      style={{ background: `${RED}08`, border: `1.5px dashed ${RED}30` }}
      aria-hidden="true"
    >
      <Layers size={16} style={{ color: `${RED}50` }} />
      <span style={{ fontSize: "8px", color: `${BLACK}40`, maxWidth: "80px", textAlign: "center", lineHeight: 1.3, fontWeight: 500 }}>
        Custom illustration area
      </span>
    </div>
  );
}

function RiskMeter({ level }: { level: "low" | "medium" | "high" }) {
  const pct = level === "low" ? 15 : level === "medium" ? 52 : 82;
  const color = level === "low" ? "#22c55e" : level === "medium" ? "#f59e0b" : RED;
  const label = level === "low" ? "Low" : level === "medium" ? "Medium" : "High";
  const reason =
    level === "low"   ? "No upcoming card emergencies detected."
    : level === "medium" ? "A few events coming up — stay alert."
    : "Cards overdue. Panic flowers incoming.";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1.5px solid ${BLACK}18`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div className="w-full flex items-center justify-center py-5" style={{ background: BEIGE }}>
        <IllustrationPlaceholder size="sm" />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.05em", color: BLACK }}>Relationship Risk Meter</div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white" style={{ background: color }}>
            {label}
          </span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden mb-2" style={{ background: `${BLACK}12` }}>
          <div className="absolute inset-y-0 left-0 flex" style={{ width: "100%" }}>
            <div className="h-full flex-1" style={{ background: "#22c55e", opacity: 0.2 }} />
            <div className="h-full flex-1" style={{ background: "#f59e0b", opacity: 0.2 }} />
            <div className="h-full flex-1" style={{ background: RED, opacity: 0.2 }} />
          </div>
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
        </div>
        <div className="flex justify-between text-xs mb-3" style={{ color: GRAY }}>
          <span>Safe</span>
          <span>Danger Zone</span>
        </div>
        <p className="text-xs" style={{ color: GRAY }}>
          Current risk: <span className="font-semibold" style={{ color }}>{label}</span> — {reason}
        </p>
      </div>
    </div>
  );
}

function DisasterCounter() {
  return (
    <div className="rounded-2xl p-5 text-center" style={{ background: BLACK }}>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.5rem", color: "#fff", lineHeight: 1 }}>13</div>
      <div className="text-xs font-semibold mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
        days since last relationship emergency
      </div>
      <div className="mt-2 text-xs font-semibold" style={{ color: RED }}>
        Keep it up. You're doing great.
      </div>
    </div>
  );
}

type PendingApproval = QueueItem & { message?: MessageDraft };

export default function DashboardPage() {
  const [cards, setCards] = useState<CardOrder[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [upcomingBriefings, setUpcomingBriefings] = useState<UpcomingBriefing[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [refinedMessages, setRefinedMessages] = useState<Record<string, string>>({});
  const [refinePrompt, setRefinePrompt] = useState<Record<string, string>>({});
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [refineOpen, setRefineOpen] = useState<string | null>(null);
  const { user } = useAuth();

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

  const upcoming = cards.filter((c) => !["Delivered", "Given"].includes(c.status));
  const awaitingApproval = cards.filter((c) => c.status === "Ready for approval");
  const disastersAvoided = recipients.reduce((sum, r) => sum + (r.selectedEvents?.length ?? 0), 0);
  const primaryPreviewDays = recipients[0]?.previewDays ?? null;
  const briefingsNeeded = upcomingBriefings.filter((b) => !b.briefingDoneThisYear);

  const minDaysToEvent = upcomingBriefings.length > 0
    ? Math.min(...upcomingBriefings.map((b) => b.daysAway))
    : 999;
  const riskLevel: "low" | "medium" | "high" =
    pendingApprovals.length > 0 || awaitingApproval.length > 0 ? "medium"
    : minDaysToEvent < 14 ? "medium"
    : "low";

  const today = new Date();
  const [calMonth, setCalMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1);
    d.setDate(d.getDate() - d.getDay() + i);
    return d;
  });

  // All event dates across every recipient
  const allEventDates = new Set<string>();
  for (const r of recipients) {
    for (const event of r.selectedEvents ?? []) {
      const date = getEventDate(event, r);
      if (date) allEventDates.add(date);
    }
  }
  // Also mark card due dates
  const cardDueDates = new Set(cards.map((c) => c.dueDate));
  for (const d of cardDueDates) allEventDates.add(d);

  return (
    <AppLayout>
      <div className="min-h-screen" style={{ background: BEIGE }}>
        <div className="p-6 md:p-8 max-w-6xl mx-auto">

          {/* ── Greeting ─────────────────────────────────────────────────── */}
          <div className="mb-6">
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", color: BLACK, lineHeight: 1 }}>
              {user?.name ? `Hey, ${user.name.split(" ")[0]}.` : "Dashboard"}
            </h1>
            <p className="mt-1" style={{ fontSize: "1rem", color: GRAY }}>
              {recipients.length > 0
                ? "Your relationship autopilot is running. Nothing to panic about."
                : "Set up your first recipient and you'll never panic-buy flowers again."}
            </p>
          </div>

          {/* ── Hero status card ─────────────────────────────────────────── */}
          <div
            className="relative rounded-2xl px-7 py-6 mb-6 overflow-hidden"
            style={{
              background: `linear-gradient(125deg, ${BLACK} 0%, #1a1a1a 60%, #111 100%)`,
              border: `1px solid ${RED}30`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {/* Red glow accent */}
            <div
              className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15 pointer-events-none"
              style={{ background: RED, filter: "blur(40px)" }}
            />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${RED}20`, border: `1px solid ${RED}40` }}
                >
                  <Zap size={22} style={{ color: RED }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", letterSpacing: "0.05em", color: "#fff", lineHeight: 1.1 }}>
                    Relationship Autopilot: Armed
                  </div>
                  <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                    No panic flowers. No gas station cards. No couch sleeping.
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: "rgba(34,197,94,0.18)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    Crisis level: Low
                  </div>
                </div>
              </div>
              <div className="hidden sm:block flex-shrink-0">
                <IllustrationPlaceholder size="lg" />
              </div>
            </div>
            {primaryPreviewDays && (
              <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                  First heads-up: <span className="text-white font-semibold">{primaryPreviewDays} days before</span>
                  <span className="ml-2 mr-2" style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>Daily reminders until you act or we do</span>
                </div>
                <Link href="/settings/reminders">
                  <button
                    className="text-xs font-semibold px-3 py-1 rounded-lg transition-all hover:opacity-80"
                    style={{ background: `${RED}20`, color: "rgba(255,255,255,0.7)", border: `1px solid ${RED}30` }}
                  >
                    Settings
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Pending Customer Approvals ────────────────────────────────── */}
          {pendingApprovals.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp size={18} style={{ color: RED }} />
                <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.05em", color: RED }}>
                  {pendingApprovals.length === 1 ? "1 card needs your approval" : `${pendingApprovals.length} cards need your approval`}
                </h2>
              </div>
              <div className="space-y-4">
                {pendingApprovals.map((item) => {
                  const originalMessage = item.message
                    ? (item.message.approvedMessage ?? item.message.generatedMessage ?? "")
                    : "";
                  const currentMessage = refinedMessages[item.id] ?? originalMessage;
                  const isRefining = refiningId === item.id;
                  const isRefineOpen = refineOpen === item.id;

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

                  const QUICK_PROMPTS = [
                    { label: "✂️ Shorter", prompt: "Make it shorter — cut it to 2–3 sentences max." },
                    { label: "😄 Funnier", prompt: "Add a bit more humor and lightness while keeping it genuine." },
                    { label: "❤️ More heartfelt", prompt: "Make it deeper and more emotionally sincere." },
                    { label: "✍️ More specific", prompt: "Make it feel more specific and personal to this person." },
                    { label: "🌟 More casual", prompt: "Make the tone more casual and relaxed, less formal." },
                  ];

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border-2 overflow-hidden"
                      style={{ background: "#fff", borderColor: `${RED}35`, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
                    >
                      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3" style={{ background: `${RED}08` }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "1rem", color: BLACK }}>{item.eventType} card for {item.recipientName}</div>
                          <div className="text-xs mt-0.5" style={{ color: GRAY }}>
                            Mailing {item.scheduledMailDate} · Review and approve so we can mail it
                          </div>
                        </div>
                        <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: RED }}>
                          Needs your OK
                        </span>
                      </div>

                      {originalMessage ? (
                        <div className="px-5 py-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: GRAY }}>Card Message</div>
                            {refinedMessages[item.id] && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: RED }}>✨ AI refined</span>
                            )}
                          </div>
                          <div className="relative">
                            <div
                              className={`rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap border transition-opacity ${isRefining ? "opacity-40" : "opacity-100"}`}
                              style={{ background: BEIGE, color: BLACK, borderColor: `${BLACK}18`, fontFamily: "'Caveat', cursive", fontSize: "1.05rem" }}
                            >
                              {currentMessage}
                            </div>
                            {isRefining && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-lg shadow-sm text-sm font-semibold" style={{ color: RED }}>
                                  <Loader2 size={15} className="animate-spin" /> Rewriting…
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="px-5 py-4 text-sm italic" style={{ color: GRAY }}>Message not available yet — check back soon.</div>
                      )}

                      <div className="px-5 pb-3">
                        <button
                          onClick={handleApprove}
                          disabled={isRefining}
                          className="w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl text-white hover:opacity-90 disabled:opacity-50 transition-all"
                          style={{ background: RED }}
                        >
                          <ThumbsUp size={14} /> Looks great — send it!
                        </button>
                      </div>

                      {originalMessage && (
                        <div className="px-5 pb-4">
                          <button
                            onClick={() => setRefineOpen(isRefineOpen ? null : item.id)}
                            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border transition-all"
                            style={{ borderColor: `${BLACK}18`, color: GRAY }}
                          >
                            <Sparkles size={13} />
                            Want to tweak it with AI?
                            {isRefineOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>

                          {isRefineOpen && (
                            <div className="mt-3 space-y-3">
                              <div>
                                <div className="text-xs font-medium mb-2" style={{ color: GRAY }}>Quick options</div>
                                <div className="flex flex-wrap gap-2">
                                  {QUICK_PROMPTS.map(({ label, prompt }) => (
                                    <button
                                      key={label}
                                      onClick={() => handleRefine(prompt)}
                                      disabled={isRefining}
                                      className="text-xs font-semibold px-3 py-1.5 rounded-full border hover:opacity-80 disabled:opacity-50 transition-all"
                                      style={{ borderColor: `${RED}40`, color: RED, background: `${RED}08` }}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-px" style={{ background: `${BLACK}12` }} />
                                <span className="text-xs" style={{ color: GRAY }}>or write your own</span>
                                <div className="flex-1 h-px" style={{ background: `${BLACK}12` }} />
                              </div>
                              <div className="flex gap-2">
                                <textarea
                                  rows={2}
                                  value={refinePrompt[item.id] ?? ""}
                                  onChange={(e) => setRefinePrompt((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                  placeholder="e.g. Mention the camping trip, add something about her garden, skip the age reference…"
                                  disabled={isRefining}
                                  className="flex-1 border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none disabled:opacity-50"
                                  style={{ borderColor: `${BLACK}18` }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleRefine(refinePrompt[item.id] ?? "");
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => handleRefine(refinePrompt[item.id] ?? "")}
                                  disabled={isRefining || !(refinePrompt[item.id] ?? "").trim()}
                                  className="self-end flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all hover:opacity-90"
                                  style={{ background: RED }}
                                >
                                  {isRefining ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                  Rewrite
                                </button>
                              </div>
                              <p className="text-xs" style={{ color: GRAY }}>
                                Hit "Rewrite" as many times as you want — when it looks right, click "Looks great — send it!" above.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Briefings banner ──────────────────────────────────────────── */}
          {briefingsNeeded.length > 0 && (
            <div
              className="mb-6 rounded-2xl border-2 p-5"
              style={{ background: `${RED}08`, borderColor: `${RED}30` }}
            >
              <div className="flex items-start gap-3">
                <ClipboardList size={20} className="mt-0.5 flex-shrink-0" style={{ color: RED }} />
                <div className="flex-1">
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: BLACK }}>
                    {briefingsNeeded.length === 1 ? "1 event briefing coming up" : `${briefingsNeeded.length} event briefings coming up`}
                  </div>
                  <p className="text-xs mt-0.5 mb-3" style={{ color: GRAY }}>
                    Answer a few questions so we write the best possible card.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {briefingsNeeded.slice(0, 4).map((b) => (
                      <Link key={`${b.recipient.id}-${b.event}`} href={`/briefings/${b.recipient.id}/${encodeURIComponent(b.event)}`}>
                        <button
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-80 transition-all"
                          style={{ background: RED, color: "#fff" }}
                          data-testid={`btn-briefing-${b.event.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {b.event} · {b.recipient.name}
                          <span style={{ opacity: 0.65 }}>{b.daysAway}d away</span>
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Stat cards ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Upcoming cards"     value={upcoming.length}       icon={CalendarDays} accentColor={BLACK} />
            <StatCard label="Recipients covered"  value={recipients.length}     icon={Users}        accentColor={RED} />
            <StatCard
              label="Disasters avoided"
              value={disastersAvoided}
              icon={ShieldCheck}
              accentColor="#22c55e"
              sub={disastersAvoided > 0 ? "events on autopilot" : undefined}
            />
            <StatCard
              label="Awaiting approval"
              value={awaitingApproval.length}
              icon={Clock}
              accentColor={awaitingApproval.length > 0 ? RED : GRAY}
            />
          </div>

          {/* ── Main grid ─────────────────────────────────────────────────── */}
          <div className="grid md:grid-cols-3 gap-6">

            {/* Left column */}
            <div className="md:col-span-2">

              {awaitingApproval.length > 0 && (
                <div className="mb-6 rounded-2xl p-5 flex items-start gap-4" style={{ background: `${RED}08`, border: `1.5px solid ${RED}30` }}>
                  <CheckCircle2 size={22} className="mt-0.5 flex-shrink-0" style={{ color: RED }} />
                  <div>
                    <div style={{ fontWeight: 700, color: BLACK }}>
                      {awaitingApproval.length === 1 ? "1 card" : `${awaitingApproval.length} cards`} ready for review
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: GRAY }}>We wrote 3 versions. Pick the one that sounds like you.</p>
                  </div>
                </div>
              )}

              {/* Cards section */}
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", letterSpacing: "0.05em", color: BLACK }}>Your Cards</h2>
              </div>

              {upcoming.length === 0 ? (
                <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1.5px solid ${BLACK}15`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div className="w-full flex items-center justify-center py-8" style={{ background: BEIGE }}>
                    <IllustrationPlaceholder size="lg" />
                  </div>
                  <div className="px-8 pb-8 pt-5 text-center">
                    <p style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", letterSpacing: "0.04em", color: BLACK, marginBottom: 4 }}>
                      {recipients.length === 0 ? "Autopilot needs a target." : "Nothing scheduled yet — we'll get to work."}
                    </p>
                    <p className="text-sm mb-5" style={{ color: GRAY }}>
                      {recipients.length === 0
                        ? "Add your first recipient before you're standing in CVS at 9:47 PM pretending you planned this."
                        : "Cards will appear here as occasions approach."}
                    </p>
                    {recipients.length === 0 && (
                      <Link href="/recipients/new">
                        <button
                          className="text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all"
                          style={{ background: RED }}
                          data-testid="link-add-recipient-empty"
                        >
                          Add first recipient
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((card) => (
                    <div
                      key={card.id}
                      className="rounded-2xl p-5 flex items-center justify-between transition-all hover:-translate-y-0.5"
                      style={{ background: "#fff", border: `1.5px solid ${BLACK}15`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                      data-testid={`card-order-${card.id}`}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: BLACK }}>{card.holiday} card for {card.recipientName}</div>
                        <div className="text-sm mt-0.5" style={{ color: GRAY }}>Due {card.dueDate} · {card.deliveryPreference}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={card.status} />
                        {card.status === "Ready for approval" && (
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-lg"
                            style={{ color: RED, background: `${RED}10`, border: `1px solid ${RED}25` }}
                          >Pick yours →</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recipients section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem", letterSpacing: "0.05em", color: BLACK }}>Recipients</h2>
                  <Link href="/recipients/new">
                    <button
                      className="flex items-center gap-1.5 text-sm font-semibold hover:underline transition-all"
                      style={{ color: RED }}
                      data-testid="link-add-recipient"
                    >
                      <Plus size={14} /> Add recipient
                    </button>
                  </Link>
                </div>

                {recipients.length === 0 ? (
                  <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: `1.5px solid ${BLACK}15`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    <div className="w-full flex items-center justify-center py-6" style={{ background: BEIGE }}>
                      <IllustrationPlaceholder size="md" />
                    </div>
                    <div className="px-6 pb-6 pt-4 text-center">
                      <p style={{ fontWeight: 600, color: BLACK }}>No recipients yet.</p>
                      <p className="text-sm mt-1" style={{ color: GRAY }}>That is how disasters begin.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {recipients.map((r) => {
                      const childCount = r.children?.length ?? 0;
                      const yearsMarried = r.marriageDate ? getAge(r.marriageDate) : null;
                      return (
                        <Link key={r.id} href={`/recipients/${r.id}`} data-testid={`card-recipient-${r.id}`}>
                          <div
                            className="rounded-2xl p-5 hover:-translate-y-0.5 transition-all cursor-pointer"
                            style={{ background: "#fff", border: `1.5px solid ${BLACK}15`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                style={{ background: RED, fontFamily: "'Bebas Neue', cursive", fontSize: "1rem" }}
                              >
                                {r.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div style={{ fontWeight: 600, color: BLACK }} className="truncate">{r.name}</div>
                                <div className="text-xs" style={{ color: GRAY }}>
                                  {r.relationship}
                                  {yearsMarried !== null && yearsMarried > 0 && ` · ${yearsMarried} yrs`}
                                  {childCount > 0 && ` · ${childCount} kid${childCount !== 1 ? "s" : ""}`}
                                </div>
                              </div>
                              {r.previewDays && (
                                <Zap size={14} style={{ color: RED, flexShrink: 0 }} />
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(r.selectedEvents ?? []).slice(0, 4).map((e) => (
                                <span
                                  key={e}
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background: `${RED}10`, color: RED, fontWeight: 600 }}
                                >
                                  {e}
                                </span>
                              ))}
                              {(r.selectedEvents ?? []).length > 4 && (
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background: `${BLACK}08`, color: GRAY }}
                                >
                                  +{(r.selectedEvents ?? []).length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">

              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.3rem", letterSpacing: "0.05em", color: BLACK }}>
                    {MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}
                  </h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                      style={{ background: `${BLACK}08` }}
                    >
                      <ChevronLeft size={14} style={{ color: BLACK }} />
                    </button>
                    <button
                      onClick={() => setCalMonth(new Date(today.getFullYear(), today.getMonth(), 1))}
                      className="px-2 h-7 rounded-lg text-xs font-semibold transition-all hover:opacity-70"
                      style={{ background: `${BLACK}08`, color: GRAY }}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
                      style={{ background: `${BLACK}08` }}
                    >
                      <ChevronRight size={14} style={{ color: BLACK }} />
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1.5px solid ${BLACK}15`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                      <div key={d} className="text-xs font-semibold" style={{ color: GRAY }}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((d, i) => {
                      const iso = localDateStr(d);
                      const hasEvent = allEventDates.has(iso);
                      const isToday = iso === localDateStr(today);
                      const isCalMonth = d.getMonth() === calMonth.getMonth();
                      return (
                        <div
                          key={i}
                          className="aspect-square flex items-center justify-center rounded-lg text-xs relative"
                          style={{
                            background: isToday ? RED : hasEvent && isCalMonth ? `${RED}10` : "transparent",
                            color: isToday ? "#fff" : isCalMonth ? BLACK : `${BLACK}35`,
                            fontWeight: isToday || (hasEvent && isCalMonth) ? 700 : undefined,
                            border: hasEvent && isCalMonth && !isToday ? `1.5px solid ${RED}35` : undefined,
                          }}
                          data-testid={`calendar-day-${iso}`}
                        >
                          {d.getDate()}
                          {hasEvent && isCalMonth && !isToday && (
                            <span
                              className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                              style={{ background: RED }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs" style={{ borderColor: `${BLACK}10`, color: GRAY }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: RED }} />
                    Occasion / card date
                  </div>
                </div>
              </div>

              {/* Risk Meter */}
              <RiskMeter level={riskLevel} />

              {/* Days since disaster */}
              <DisasterCounter />

              {/* Plan status */}
              <div className="rounded-2xl p-5" style={{ background: "#fff", border: `1.5px solid ${BLACK}15`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.05em", color: BLACK }}>Your Plan</div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: BLACK }}>BASIC</span>
                </div>
                <p className="text-xs mb-3" style={{ color: GRAY }}>
                  Up to 6 cards/year · {recipients.length} recipient{recipients.length !== 1 ? "s" : ""} active
                </p>
                <Link href="/signup">
                  <button
                    className="block w-full text-center text-xs font-bold py-2 rounded-xl hover:opacity-90 transition-all text-white"
                    style={{ background: RED }}
                  >
                    Upgrade Plan
                  </button>
                </Link>
              </div>

              {/* Autopilot summary */}
              <div className="rounded-2xl p-5" style={{ background: BLACK }}>
                <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.05em", color: "#fff", marginBottom: 12 }}>Autopilot Summary</div>
                <div className="space-y-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <div className="flex justify-between">
                    <span>Recipients</span>
                    <span className="font-bold" style={{ color: "#fff" }}>{recipients.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Events covered</span>
                    <span className="font-bold" style={{ color: "#fff" }}>{disastersAvoided}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Briefings needed</span>
                    <span className="font-bold" style={{ color: briefingsNeeded.length > 0 ? RED : "rgba(255,255,255,0.5)" }}>
                      {briefingsNeeded.length}
                    </span>
                  </div>
                  {upcomingBriefings.filter((b) => b.briefingDoneThisYear).length > 0 && (
                    <div className="flex justify-between">
                      <span>Briefings done</span>
                      <span className="font-bold text-green-400">
                        {upcomingBriefings.filter((b) => b.briefingDoneThisYear).length}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
