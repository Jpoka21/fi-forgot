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
  ChevronDown, ChevronUp, AlertTriangle, Layers,
} from "lucide-react";

const NAVY = "#071A33";
const RED = "#E23B2E";
const GOLD = "#D8A725";
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
  label, value, icon: Icon, accentColor, sub, textColor,
}: {
  label: string; value: string | number; icon: React.ElementType;
  accentColor: string; sub?: string; textColor?: string;
}) {
  return (
    <div
      className="bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: "hsl(40,20%,87%)" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: accentColor + "18" }}
      >
        <Icon size={22} style={{ color: accentColor }} />
      </div>
      <div>
        <div className="text-2xl font-serif font-bold" style={{ color: textColor ?? NAVY }}>{value}</div>
        <div className="text-xs text-[hsl(221,20%,52%)] mt-0.5">{label}</div>
        {sub && <div className="text-xs font-semibold mt-0.5" style={{ color: accentColor }}>{sub}</div>}
      </div>
    </div>
  );
}

/**
 * IllustrationPlaceholder — a styled container for future branded SVG art.
 * Replace the inner content with a real <img> or <svg> when artwork is ready.
 * The outer wrapper dimensions and border-radius are preserved so the layout
 * never needs to change — just swap the children.
 */
function IllustrationPlaceholder({
  size = "md",
  gradient = "gold",
}: {
  size?: "sm" | "md" | "lg";
  gradient?: "gold" | "navy" | "subtle";
}) {
  const dims: Record<string, string> = {
    sm: "h-16 w-20",
    md: "h-24 w-28",
    lg: "h-36 w-44",
  };
  const gradients: Record<string, string> = {
    gold:   "linear-gradient(135deg, rgba(216,167,37,0.14) 0%, rgba(7,26,51,0.07) 100%)",
    navy:   "linear-gradient(135deg, rgba(7,26,51,0.18) 0%, rgba(216,167,37,0.06) 100%)",
    subtle: "linear-gradient(135deg, rgba(216,167,37,0.07) 0%, rgba(180,190,210,0.10) 100%)",
  };
  const borders: Record<string, string> = {
    gold:   "rgba(216,167,37,0.35)",
    navy:   "rgba(7,26,51,0.2)",
    subtle: "rgba(180,190,210,0.4)",
  };

  return (
    /* ── Replace everything inside this div with your SVG illustration ── */
    <div
      className={`${dims[size]} rounded-2xl flex flex-col items-center justify-center gap-1.5 flex-shrink-0 select-none`}
      style={{
        background: gradients[gradient],
        border: `1.5px dashed ${borders[gradient]}`,
      }}
      aria-hidden="true"
    >
      <Layers size={16} style={{ color: borders[gradient], opacity: 0.8 }} />
      <span
        className="text-center leading-tight font-medium"
        style={{ fontSize: "8px", color: "rgba(7,26,51,0.35)", maxWidth: "80px" }}
      >
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
    level === "low"
      ? "No upcoming card emergencies detected."
      : level === "medium"
      ? "A few events coming up — stay alert."
      : "Cards overdue. Panic flowers incoming.";

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "hsl(40,20%,87%)" }}>
      {/* Illustration band — swap for branded SVG art */}
      <div
        className="w-full flex items-center justify-center py-5"
        style={{ background: "linear-gradient(135deg, hsl(40,50%,96%) 0%, hsl(221,30%,95%) 100%)" }}
      >
        <IllustrationPlaceholder size="sm" gradient="subtle" />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-serif font-bold text-sm" style={{ color: NAVY }}>Relationship Risk Meter</div>
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
            style={{ background: color }}
          >
            {label}
          </span>
        </div>
        <div className="relative h-3 rounded-full overflow-hidden mb-2" style={{ background: "hsl(40,20%,90%)" }}>
          <div className="absolute inset-y-0 left-0 flex" style={{ width: "100%" }}>
            <div className="h-full flex-1" style={{ background: "#22c55e", opacity: 0.25 }} />
            <div className="h-full flex-1" style={{ background: "#f59e0b", opacity: 0.25 }} />
            <div className="h-full flex-1" style={{ background: RED, opacity: 0.25 }} />
          </div>
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <div className="flex justify-between text-xs mb-3" style={{ color: "hsl(221,20%,60%)" }}>
          <span>Safe</span>
          <span>Danger Zone</span>
        </div>
        <p className="text-xs" style={{ color: "hsl(221,20%,55%)" }}>
          Current risk: <span className="font-semibold" style={{ color }}>{label}</span> — {reason}
        </p>
      </div>
    </div>
  );
}

function DisasterCounter() {
  return (
    <div
      className="rounded-2xl border p-5 shadow-sm text-center"
      style={{ background: NAVY, borderColor: NAVY }}
    >
      <div className="text-5xl font-serif font-bold text-white mb-1">13</div>
      <div className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
        days since last relationship emergency
      </div>
      <div className="mt-2 text-xs" style={{ color: GOLD }}>
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
        const briefingDoneThisYear = briefings.some(
          (b) => b.event === event && b.year === thisYear
        );
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

  // Risk level computation
  const minDaysToEvent = upcomingBriefings.length > 0
    ? Math.min(...upcomingBriefings.map((b) => b.daysAway))
    : 999;
  const riskLevel: "low" | "medium" | "high" =
    pendingApprovals.length > 0 || awaitingApproval.length > 0 ? "medium"
    : minDaysToEvent < 14 ? "medium"
    : "low";

  const today = new Date();
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    d.setDate(d.getDate() - d.getDay() + i);
    return d;
  });
  const cardDates = new Set(cards.map((c) => c.dueDate));

  return (
    <AppLayout>
      <div
        className="min-h-screen"
        style={{ background: "linear-gradient(150deg, #f8f5f0 0%, #edf1f7 55%, #f4efe8 100%)" }}
      >
        <div className="p-6 md:p-8 max-w-6xl mx-auto">

          {/* ── Greeting ───────────────────────────────────────────────── */}
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-bold" style={{ color: NAVY }}>
              {user?.name ? `Hey, ${user.name.split(" ")[0]}.` : "Dashboard"}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "hsl(221,20%,52%)" }}>
              {recipients.length > 0
                ? "Your relationship autopilot is running. Nothing to panic about."
                : "Set up your first recipient and you'll never panic-buy flowers again."}
            </p>
          </div>

          {/* ── Hero status card ────────────────────────────────────────── */}
          <div
            className="relative rounded-2xl px-7 py-6 mb-6 overflow-hidden shadow-lg"
            style={{
              background: `linear-gradient(125deg, ${NAVY} 0%, #0f2d55 60%, #122a4a 100%)`,
              border: `1px solid rgba(216,167,37,0.25)`,
            }}
          >
            {/* subtle glow accent */}
            <div
              className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 pointer-events-none"
              style={{ background: GOLD, filter: "blur(40px)" }}
            />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(216,167,37,0.18)", border: "1px solid rgba(216,167,37,0.3)" }}
                >
                  <Zap size={22} style={{ color: GOLD }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-xl font-bold text-white leading-snug">
                    Relationship Autopilot: Armed
                  </div>
                  <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
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
              {/* Illustration placeholder — swap children for branded SVG art */}
              <div className="hidden sm:block flex-shrink-0">
                <IllustrationPlaceholder size="lg" gradient="gold" />
              </div>
            </div>
            {primaryPreviewDays && (
              <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Preview email: <span className="text-white font-semibold">{primaryPreviewDays} days before</span>
                  <span className="ml-2" style={{ color: "rgba(255,255,255,0.35)" }}>·</span>
                  <span className="ml-2" style={{ color: "rgba(255,255,255,0.45)" }}>You approve every card before it ships</span>
                </div>
                <Link href="/settings/reminders">
                  <button
                    className="text-xs font-semibold px-3 py-1 rounded-lg transition-all hover:opacity-80"
                    style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
                  >
                    Settings
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Pending Customer Approvals ───────────────────────────────── */}
          {pendingApprovals.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp size={18} style={{ color: "#7c3aed" }} />
                <h2 className="font-serif text-lg font-bold" style={{ color: "#7c3aed" }}>
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
                      className="bg-white rounded-2xl border-2 shadow-sm overflow-hidden"
                      style={{ borderColor: "#7c3aed40" }}
                    >
                      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3" style={{ background: "#f5f3ff" }}>
                        <div>
                          <div className="font-bold text-base" style={{ color: NAVY }}>{item.eventType} card for {item.recipientName}</div>
                          <div className="text-xs mt-0.5" style={{ color: "hsl(221,20%,50%)" }}>
                            Mailing {item.scheduledMailDate} · Review and approve so we can mail it
                          </div>
                        </div>
                        <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: "#7c3aed" }}>
                          Needs your OK
                        </span>
                      </div>

                      {originalMessage ? (
                        <div className="px-5 py-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(221,20%,50%)" }}>Card Message</div>
                            {refinedMessages[item.id] && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: "#7c3aed" }}>✨ AI refined</span>
                            )}
                          </div>
                          <div className="relative">
                            <div className={`bg-[#F8EEDC] rounded-xl px-4 py-3 text-sm leading-relaxed font-serif whitespace-pre-wrap border transition-opacity ${isRefining ? "opacity-40" : "opacity-100"}`} style={{ color: NAVY, borderColor: "hsl(40,40%,80%)" }}>
                              {currentMessage}
                            </div>
                            {isRefining && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-lg shadow-sm text-sm font-semibold" style={{ color: "#7c3aed" }}>
                                  <Loader2 size={15} className="animate-spin" /> Rewriting…
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="px-5 py-4 text-sm italic" style={{ color: "hsl(221,20%,50%)" }}>Message not available yet — check back soon.</div>
                      )}

                      <div className="px-5 pb-3">
                        <button
                          onClick={handleApprove}
                          disabled={isRefining}
                          className="w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl text-white hover:opacity-90 disabled:opacity-50 transition-all"
                          style={{ background: NAVY }}
                        >
                          <ThumbsUp size={14} /> Looks great — send it!
                        </button>
                      </div>

                      {originalMessage && (
                        <div className="px-5 pb-4">
                          <button
                            onClick={() => setRefineOpen(isRefineOpen ? null : item.id)}
                            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl border transition-all hover:bg-purple-50"
                            style={{ borderColor: "#7c3aed40", color: "#7c3aed" }}
                          >
                            <Sparkles size={13} />
                            Want to tweak it with AI?
                            {isRefineOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>

                          {isRefineOpen && (
                            <div className="mt-3 space-y-3">
                              <div>
                                <div className="text-xs font-medium mb-2" style={{ color: "hsl(221,20%,55%)" }}>Quick options</div>
                                <div className="flex flex-wrap gap-2">
                                  {QUICK_PROMPTS.map(({ label, prompt }) => (
                                    <button
                                      key={label}
                                      onClick={() => handleRefine(prompt)}
                                      disabled={isRefining}
                                      className="text-xs font-semibold px-3 py-1.5 rounded-full border hover:bg-purple-50 disabled:opacity-50 transition-all"
                                      style={{ borderColor: "#7c3aed60", color: "#7c3aed", background: "#faf5ff" }}
                                    >
                                      {label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-px bg-[hsl(40,20%,88%)]" />
                                <span className="text-xs" style={{ color: "hsl(221,20%,60%)" }}>or write your own</span>
                                <div className="flex-1 h-px bg-[hsl(40,20%,88%)]" />
                              </div>
                              <div className="flex gap-2">
                                <textarea
                                  rows={2}
                                  value={refinePrompt[item.id] ?? ""}
                                  onChange={(e) => setRefinePrompt((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                  placeholder="e.g. Mention the camping trip, add something about her garden, skip the age reference…"
                                  disabled={isRefining}
                                  className="flex-1 border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 disabled:opacity-50"
                                  style={{ borderColor: "hsl(40,30%,80%)", "--tw-ring-color": "#7c3aed" } as React.CSSProperties}
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
                                  style={{ background: "#7c3aed" }}
                                >
                                  {isRefining ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                  Rewrite
                                </button>
                              </div>
                              <p className="text-xs" style={{ color: "hsl(221,20%,60%)" }}>
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

          {/* ── Briefings banner ────────────────────────────────────────── */}
          {briefingsNeeded.length > 0 && (
            <div
              className="mb-6 rounded-2xl border-2 p-5"
              style={{ background: `${GOLD}12`, borderColor: `${GOLD}40` }}
            >
              <div className="flex items-start gap-3">
                <ClipboardList size={20} className="mt-0.5 flex-shrink-0" style={{ color: GOLD }} />
                <div className="flex-1">
                  <div className="font-bold text-sm" style={{ color: NAVY }}>
                    {briefingsNeeded.length === 1 ? "1 event briefing coming up" : `${briefingsNeeded.length} event briefings coming up`}
                  </div>
                  <p className="text-xs mt-0.5 mb-3" style={{ color: "hsl(221,20%,50%)" }}>
                    Answer a few questions so we write the best possible card.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {briefingsNeeded.slice(0, 4).map((b) => (
                      <Link key={`${b.recipient.id}-${b.event}`} href={`/briefings/${b.recipient.id}/${encodeURIComponent(b.event)}`}>
                        <button
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-80 transition-all"
                          style={{ background: NAVY, color: "#fff" }}
                          data-testid={`btn-briefing-${b.event.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {b.event} · {b.recipient.name}
                          <span style={{ opacity: 0.6 }}>{b.daysAway}d away</span>
                        </button>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Stat cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Upcoming cards"    value={upcoming.length}        icon={CalendarDays} accentColor={NAVY} />
            <StatCard label="Recipients covered" value={recipients.length}      icon={Users}        accentColor={GOLD} />
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
              accentColor={awaitingApproval.length > 0 ? RED : "hsl(221,20%,65%)"}
            />
          </div>

          {/* ── Main grid ───────────────────────────────────────────────── */}
          <div className="grid md:grid-cols-3 gap-6">

            {/* Left column */}
            <div className="md:col-span-2">

              {awaitingApproval.length > 0 && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                  <CheckCircle2 size={22} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-amber-900">
                      {awaitingApproval.length === 1 ? "1 card" : `${awaitingApproval.length} cards`} ready for review
                    </div>
                    <p className="text-sm text-amber-700 mt-0.5">We wrote 3 versions. Pick the one that sounds like you.</p>
                  </div>
                </div>
              )}

              {/* Cards section */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-bold" style={{ color: NAVY }}>Your Cards</h2>
              </div>

              {upcoming.length === 0 ? (
                <div
                  className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                  style={{ borderColor: "hsl(40,20%,87%)" }}
                >
                  {/* Illustration band — swap the placeholder for branded art */}
                  <div
                    className="w-full flex items-center justify-center py-8"
                    style={{ background: "linear-gradient(135deg, hsl(40,50%,96%) 0%, hsl(221,30%,95%) 100%)" }}
                  >
                    <IllustrationPlaceholder size="lg" gradient="subtle" />
                  </div>
                  <div className="px-8 pb-8 pt-5 text-center">
                    <p className="font-bold text-lg mb-1" style={{ color: NAVY }}>
                      {recipients.length === 0 ? "Autopilot needs a target." : "Nothing scheduled yet — we'll get to work."}
                    </p>
                    <p className="text-sm mb-5" style={{ color: "hsl(221,20%,52%)" }}>
                      {recipients.length === 0
                        ? "Add your first recipient before you're standing in CVS at 9:47 PM pretending you planned this."
                        : "Cards will appear here as occasions approach."}
                    </p>
                    {recipients.length === 0 && (
                      <Link href="/recipients/new">
                        <button
                          className="text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                          style={{ background: NAVY }}
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
                      className="bg-white rounded-2xl border p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                      style={{ borderColor: "hsl(40,20%,87%)" }}
                      data-testid={`card-order-${card.id}`}
                    >
                      <div>
                        <div className="font-semibold" style={{ color: NAVY }}>{card.holiday} card for {card.recipientName}</div>
                        <div className="text-sm mt-0.5" style={{ color: "hsl(221,20%,52%)" }}>Due {card.dueDate} · {card.deliveryPreference}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={card.status} />
                        {card.status === "Ready for approval" && (
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-lg"
                            style={{ color: RED, background: "#fff1f0", border: `1px solid #fecaca` }}
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
                  <h2 className="font-serif text-xl font-bold" style={{ color: NAVY }}>Recipients</h2>
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
                  <div
                    className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                    style={{ borderColor: "hsl(40,20%,87%)" }}
                  >
                    {/* Illustration band — swap for branded art */}
                    <div
                      className="w-full flex items-center justify-center py-6"
                      style={{ background: "linear-gradient(135deg, hsl(40,50%,96%) 0%, hsl(221,30%,95%) 100%)" }}
                    >
                      <IllustrationPlaceholder size="md" gradient="subtle" />
                    </div>
                    <div className="px-6 pb-6 pt-4 text-center">
                      <p className="font-semibold" style={{ color: NAVY }}>No recipients yet.</p>
                      <p className="text-sm mt-1" style={{ color: "hsl(221,20%,52%)" }}>That is how disasters begin.</p>
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
                            className="bg-white rounded-2xl border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer shadow-sm"
                            style={{ borderColor: "hsl(40,20%,87%)" }}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                style={{ background: NAVY }}
                              >
                                {r.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate" style={{ color: NAVY }}>{r.name}</div>
                                <div className="text-xs" style={{ color: "hsl(221,20%,52%)" }}>
                                  {r.relationship}
                                  {yearsMarried !== null && yearsMarried > 0 && ` · ${yearsMarried} yrs`}
                                  {childCount > 0 && ` · ${childCount} kid${childCount !== 1 ? "s" : ""}`}
                                </div>
                              </div>
                              {r.previewDays && (
                                <Zap size={14} className="text-yellow-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(r.selectedEvents ?? []).slice(0, 4).map((e) => (
                                <span
                                  key={e}
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background: "hsl(40,50%,92%)", color: "hsl(221,47%,30%)" }}
                                >
                                  {e}
                                </span>
                              ))}
                              {(r.selectedEvents ?? []).length > 4 && (
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background: "hsl(40,50%,92%)", color: "hsl(221,47%,30%)" }}
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
                <h2 className="font-serif text-lg font-bold mb-3" style={{ color: NAVY }}>
                  {MONTHS[today.getMonth()]} {today.getFullYear()}
                </h2>
                <div
                  className="bg-white rounded-2xl border p-5 shadow-sm"
                  style={{ borderColor: "hsl(40,20%,87%)" }}
                >
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                      <div key={d} className="text-xs font-semibold" style={{ color: "hsl(221,20%,60%)" }}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((d, i) => {
                      const iso = d.toISOString().split("T")[0];
                      const hasCard = cardDates.has(iso);
                      const isToday = iso === today.toISOString().split("T")[0];
                      const isCurrentMonth = d.getMonth() === today.getMonth();
                      return (
                        <div
                          key={i}
                          className="aspect-square flex items-center justify-center rounded-lg text-xs relative"
                          style={{
                            background: isToday ? NAVY : "transparent",
                            color: isToday ? "#fff" : isCurrentMonth ? NAVY : "hsl(221,20%,72%)",
                            fontWeight: isToday ? 700 : undefined,
                          }}
                          data-testid={`calendar-day-${iso}`}
                        >
                          {d.getDate()}
                          {hasCard && (
                            <span
                              className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                              style={{ background: RED }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs" style={{ borderColor: "hsl(40,20%,88%)", color: "hsl(221,20%,52%)" }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: RED }} />
                    Card due
                  </div>
                </div>
              </div>

              {/* Risk Meter */}
              <RiskMeter level={riskLevel} />

              {/* Days since disaster */}
              <DisasterCounter />

              {/* Plan status */}
              <div
                className="rounded-2xl p-5 border shadow-sm bg-white"
                style={{ borderColor: "hsl(40,20%,87%)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-serif font-bold" style={{ color: NAVY }}>Your Plan</div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: NAVY }}>BASIC</span>
                </div>
                <p className="text-xs mb-3" style={{ color: "hsl(221,20%,52%)" }}>
                  Up to 6 cards/year · {recipients.length} recipient{recipients.length !== 1 ? "s" : ""} active
                </p>
                <Link href="/signup">
                  <button
                    className="block w-full text-center text-xs font-bold py-2 rounded-xl hover:opacity-90 transition-all text-white hover:-translate-y-0.5 hover:shadow-sm"
                    style={{ background: RED }}
                  >
                    Upgrade Plan
                  </button>
                </Link>
              </div>

              {/* Autopilot summary */}
              <div className="rounded-2xl p-5 shadow-sm" style={{ background: NAVY }}>
                <div className="font-serif font-bold text-white mb-3 text-sm">Autopilot Summary</div>
                <div className="space-y-2 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <div className="flex justify-between">
                    <span>Recipients</span>
                    <span className="text-white font-bold">{recipients.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Events covered</span>
                    <span className="text-white font-bold">{disastersAvoided}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Briefings needed</span>
                    <span className="font-bold" style={{ color: briefingsNeeded.length > 0 ? GOLD : "rgba(255,255,255,0.55)" }}>
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
