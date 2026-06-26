import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  getCards, getRecipients, getBriefingsForRecipient, getServerUserId,
  CardOrder, Recipient,
  getPersonalSettings, savePersonalSettings, PersonalSettings,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import {
  PB, getEventDateForRecipient, getNextOccasion,
  formatBigDate, urgencyAccent, isSensitiveOccasion,
} from "@/lib/personal-brand";
import { getCustomerPendingApprovals } from "@/lib/admin-data";
import { PersonAvatar, SectionTitle, SoftCard, PrimaryBtn } from "@/components/personal-ui";
import { Plan, PLANS } from "@/lib/plan";
import {
  Plus, ArrowRight, CheckCircle2,
} from "lucide-react";
import AppNav from "@/components/layout/AppNav";
import {
  computeOverallHealth,
  recordScoreSnapshot,
} from "@/lib/relationship-health";

interface HwFont { id: string; name: string; previewUrl?: string; }

const BEIGE  = PB.beige;
const CREAM  = PB.cream;
const RED    = PB.red;
const INK    = PB.ink;
const MID    = PB.mid;
const WHITE  = PB.white;
const SAGE   = PB.sage;
const AMBER  = PB.amber;
const BORDER = PB.border;

type UpcomingEvent = { recipient: Recipient; event: string; daysAway: number; dateStr: string; briefingDone: boolean };

type AttentionItem = {
  id: string;
  title: string;
  detail?: string;
  actionLabel: string;
  onAction: () => void;
};

function calmOccasionLine(event: string, daysAway: number, dateStr: string, sincere: boolean): string {
  const longDate = new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric",
  });
  if (sincere) {
    if (daysAway === 0) return `${event} is today.`;
    if (daysAway === 1) return `${event} is tomorrow.`;
    if (daysAway <= 14) return `${event} in ${daysAway} days.`;
    return `${event} on ${longDate}.`;
  }
  if (daysAway === 0) return `${event} is today.`;
  if (daysAway === 1) return `${event} is tomorrow.`;
  if (daysAway <= 14) return `${event} in ${daysAway} days.`;
  return `${event} on ${longDate}.`;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [cards, setCards]                       = useState<CardOrder[]>([]);
  const [recipients, setRecipients]             = useState<Recipient[]>([]);
  const [personalSettings, setPersonalSettings] = useState<PersonalSettings>(() => getPersonalSettings());
  const [hwFonts, setHwFonts]                   = useState<HwFont[]>([]);
  const [fontsLoading, setFontsLoading]         = useState(false);
  const [fontPickerOpen, setFontPickerOpen]     = useState(false);
  const [viewingCardId, setViewingCardId]       = useState<string | null>(null);
  const [isMobile, setIsMobile]                 = useState(() => window.innerWidth < 768);
  const [upgradeOpen, setUpgradeOpen]           = useState(false);

  const { user, upgradePlan } = useAuth();
  const [, setLocation] = useLocation();
  const plan = (user?.plan ?? "basic") as Plan;

  const [firstTimeDismissed, setFirstTimeDismissed] = useState(() => !!localStorage.getItem("fi_forgot_first_time_seen"));
  const isFirstTimeState = !firstTimeDismissed && recipients.length === 1 && cards.some(c => c.recipientId === recipients[0]?.id);

  useEffect(() => {
    const rs = getRecipients(); const cs = getCards();
    setCards(cs); setRecipients(rs);
  }, []);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const health = useMemo(() => computeOverallHealth(recipients), [recipients]);

  useEffect(() => {
    if (health.score > 0) recordScoreSnapshot(health.score);
  }, [health.score]);

  const approvedCards = useMemo(() => cards.filter(c => c.status === "Approved"), [cards]);

  const allUpcomingEvents = useMemo(() => {
    const today  = new Date(); const cutoff = new Date(today.getTime() + 90 * 86400000);
    const thisYear = today.getFullYear(); const result: UpcomingEvent[] = [];
    for (const r of recipients) {
      const briefings = getBriefingsForRecipient(r.id);
      for (const event of r.selectedEvents ?? []) {
        const dateStr = getEventDateForRecipient(event, r);
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

  const upcoming60 = useMemo(
    () => allUpcomingEvents.filter(e => e.daysAway <= 60),
    [allUpcomingEvents],
  );

  const dashboardMoments = useMemo(
    () => upcoming60.slice(0, 3),
    [upcoming60],
  );

  const upcomingWithCardKeys = useMemo(() => {
    const serverUserId = getServerUserId();
    const keys = new Set<string>();
    for (const c of cards) {
      if (c.status !== "Needs profile" && (serverUserId ? c.userId === serverUserId : true)) {
        keys.add(`${c.recipientId}:::${c.holiday}`);
      }
    }
    return keys;
  }, [cards]);

  const upcomingCardById = useMemo(() => {
    const serverUserId = getServerUserId();
    const map = new Map<string, string>();
    for (const c of cards) {
      if (
        (c.status === "Ready for approval" || c.status === "Approved") &&
        (serverUserId ? c.userId === serverUserId : true)
      ) {
        map.set(`${c.recipientId}:::${c.holiday}`, c.id);
      }
    }
    return map;
  }, [cards]);

  function updateSettings<K extends keyof PersonalSettings>(key: K, val: PersonalSettings[K]) {
    setPersonalSettings(prev => { const next = { ...prev, [key]: val }; savePersonalSettings(next); return next; });
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
  const px         = isMobile ? 16 : 28;
  const firstName  = user?.name?.split(" ")[0] ?? "there";

  const pendingReviewCount = useMemo(() => {
    const waiting = cards.filter(c => c.status === "Ready for approval").length;
    const pending = user?.email ? getCustomerPendingApprovals(user.email).length : 0;
    return waiting + pending;
  }, [cards, user?.email]);

  const attentionItems = useMemo(() => {
    const items: AttentionItem[] = [];
    const seen = new Set<string>();

    if (atLimit) {
      items.push({
        id: "plan-limit",
        title: "You've used all cards included in your plan",
        detail: "Upgrade if you need more occasions covered this year.",
        actionLabel: "View plans",
        onAction: () => setUpgradeOpen(true),
      });
    }

    for (const ev of upcoming60) {
      const r = ev.recipient;
      if (!r.mailingAddress?.line1?.trim()) {
        const key = `addr-${r.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          items.push({
            id: key,
            title: `Mailing address needed for ${r.name}`,
            detail: "We can't mail a card without it.",
            actionLabel: "Add address",
            onAction: () => setLocation(`/relationship/${r.id}`),
          });
        }
      }
    }

    for (const r of recipients) {
      if (!(r.selectedEvents?.length)) {
        const key = `events-${r.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          items.push({
            id: key,
            title: `No occasions on file for ${r.name}`,
            detail: "Add a birthday or anniversary so we know when to send.",
            actionLabel: "Add occasion",
            onAction: () => setLocation(`/relationship/${r.id}`),
          });
        }
      }
    }

    return items.slice(0, 5);
  }, [pendingReviewCount, atLimit, upcoming60, recipients, setLocation]);

  function upcomingCta(ev: UpcomingEvent) {
    const evKey = `${ev.recipient.id}:::${ev.event}`;
    const hasCard = upcomingWithCardKeys.has(evKey);
    const cardId = upcomingCardById.get(evKey);
    const card = cardId ? cards.find(c => c.id === cardId) : undefined;
    const briefingPath = cardId
      ? `/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}?rewrite=1`
      : `/briefings/${ev.recipient.id}/${encodeURIComponent(ev.event)}`;

    if (hasCard && card?.status === "Approved") {
      return { label: "Send it", action: () => setViewingCardId(cardId!) };
    }
    if (hasCard && card?.status === "Ready for approval") {
      return { label: "Send it", action: () => setLocation("/cards/review") };
    }
    if (ev.briefingDone) {
      return { label: "Write the card", action: () => setLocation(briefingPath) };
    }
    return { label: "Add a detail", action: () => setLocation(briefingPath) };
  }

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <>
    <AppNav />
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "'Plus Jakarta Sans', sans-serif", color: INK }}>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: `24px ${px}px 32px`, boxSizing: "border-box" as const }}>

        {/* ══ EMPTY STATE ══════════════════════════════════════════════════ */}
        {recipients.length === 0 && (
          <div style={{
            background: WHITE, borderRadius: 20, padding: isMobile ? "48px 24px" : "64px 40px",
            textAlign: "center" as const, border: `1px solid ${BORDER}`,
          }}>
            <h1 style={{ fontSize: isMobile ? "1.5rem" : "1.75rem", fontWeight: 700, color: INK, margin: "0 0 12px", lineHeight: 1.3 }}>
              Add someone important
            </h1>
            <p style={{ fontSize: "0.95rem", color: MID, maxWidth: 380, margin: "0 auto 28px", lineHeight: 1.6 }}>
              Tell us who matters. We'll track their occasions and handle the cards.
            </p>
            <Link href="/recipients/new">
              <button data-testid="link-add-recipient"
                style={{
                  background: RED, color: WHITE, border: "none", borderRadius: 10,
                  padding: "12px 28px", fontWeight: 700, fontSize: "0.9rem",
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
                }}>
                <Plus size={16} /> Add someone important
              </button>
            </Link>
          </div>
        )}

        {/* ══ FIRST-TIME SUCCESS STATE ═════════════════════════════════════ */}
        {isFirstTimeState && (() => {
          const r = recipients[0];
          const c = cards.find(cc => cc.recipientId === r.id);
          const cardHasAddress = !!c?.overrideAddress?.line1?.trim();
          const recipientHasAddress = !!r.mailingAddress?.line1?.trim();
          const needsAddressNudge = !cardHasAddress && !recipientHasAddress;
          return (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: isMobile ? "1.5rem" : "1.75rem", fontWeight: 700, color: INK, margin: 0, lineHeight: 1.3 }}>
                  You're all set for {r.name}
                </h1>
                <p style={{ fontSize: "0.95rem", color: MID, margin: "8px 0 0", lineHeight: 1.5 }}>
                  We'll take it from here.
                </p>
              </div>

              <div style={{ background: `${SAGE}12`, borderRadius: 12, padding: "14px 18px", marginBottom: 20, border: `1px solid ${SAGE}30`, display: "flex", alignItems: "flex-start", gap: 12 }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0, color: SAGE, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: INK }}>First card prepared</div>
                  <div style={{ fontSize: "0.84rem", color: MID, marginTop: 4, lineHeight: 1.5 }}>
                    {c ? `${c.holiday} for ${r.name} is ${c.status === "Approved" ? "approved and queued to mail" : "ready for your review"}.` : "Your card is being prepared."}
                  </div>
                </div>
              </div>

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

              {needsAddressNudge && (
                <div style={{ background: WHITE, borderRadius: 12, padding: "16px 18px", marginBottom: 16, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: INK, marginBottom: 4 }}>Mailing address needed for {r.name}</div>
                    <div style={{ fontSize: "0.84rem", color: MID, lineHeight: 1.5 }}>We can't mail a card without it.</div>
                  </div>
                  <button
                    onClick={() => setLocation(`/relationship/${r.id}`)}
                    style={{ flexShrink: 0, padding: "9px 18px", borderRadius: 9, background: RED, color: WHITE, border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                    Add address
                  </button>
                </div>
              )}

              <Link href="/recipients/new">
                <button style={{ width: "100%", padding: "15px", borderRadius: 12, border: `2px dashed ${BORDER}`,
                  background: "transparent", color: MID, fontSize: "1rem", fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <Plus size={18} style={{ color: RED }} />
                  Add another person
                </button>
              </Link>

              <div style={{ textAlign: "center" as const, marginTop: 16 }}>
                <button
                  onClick={() => {
                    localStorage.setItem("fi_forgot_first_time_seen", "1");
                    setFirstTimeDismissed(true);
                  }}
                  style={{ background: "none", border: "none", color: MID, fontSize: "0.82rem", cursor: "pointer",
                    textDecoration: "underline", opacity: 0.6 }}>
                  Show me the full home page
                </button>
              </div>
            </div>
          );
        })()}

        {recipients.length > 0 && !isFirstTimeState && (
          <>
            {/* ── Hero ───────────────────────────────────────────────────── */}
            <div style={{ marginBottom: 32, padding: "4px 0 0" }}>
              <h1 style={{
                fontSize: isMobile ? "1.5rem" : "1.75rem",
                fontWeight: 700, color: INK, margin: "0 0 10px", lineHeight: 1.3,
              }}>
                {pendingReviewCount > 0
                  ? `Hi ${firstName}. A card needs you.`
                  : `Hi ${firstName}. Everything's on track.`}
              </h1>
              <p style={{ fontSize: "0.95rem", color: MID, margin: "0 0 20px", lineHeight: 1.6, maxWidth: 520 }}>
                {pendingReviewCount > 0
                  ? "Review it when you're ready. We'll handle the rest."
                  : upcoming60.length > 0
                    ? `We're watching ${upcoming60.length} upcoming occasion${upcoming60.length === 1 ? "" : "s"} for you.`
                    : "Add the people who matter and we'll keep track from here."}
              </p>
              {pendingReviewCount > 0 ? (
                <PrimaryBtn onClick={() => setLocation("/cards/review")}>
                  Review next card
                </PrimaryBtn>
              ) : (
                <PrimaryBtn onClick={() => setLocation("/recipients/new")}>
                  Add someone important
                </PrimaryBtn>
              )}
            </div>

            {/* ── Needs attention ─────────────────────────────────────────── */}
            {attentionItems.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <SectionTitle title="Needs attention" sub="Only what requires a quick step from you." />
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {attentionItems.map(item => (
                    <SoftCard key={item.id} style={{ padding: "14px 16px", borderLeft: `3px solid ${RED}` }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const }}>
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.92rem", color: INK, lineHeight: 1.4 }}>{item.title}</div>
                          {item.detail && (
                            <div style={{ fontSize: "0.84rem", color: MID, marginTop: 4, lineHeight: 1.5 }}>{item.detail}</div>
                          )}
                        </div>
                        <PrimaryBtn onClick={item.onAction} variant="outline" style={{ flexShrink: 0 }}>
                          {item.actionLabel}
                        </PrimaryBtn>
                      </div>
                    </SoftCard>
                  ))}
                </div>
              </div>
            )}

            {/* ── Coming up ───────────────────────────────────────────────── */}
            <div style={{ marginBottom: 28 }}>
              <SectionTitle
                title="Coming up"
                sub="The next few occasions we're preparing for."
                right={upcoming60.length > 3 ? (
                  <Link href="/moments" style={{ fontSize: "0.8rem", fontWeight: 600, color: SAGE, textDecoration: "none", flexShrink: 0 }}>
                    View all
                  </Link>
                ) : undefined}
              />

              {dashboardMoments.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {dashboardMoments.map(ev => {
                    const big = formatBigDate(ev.dateStr);
                    const accent = urgencyAccent(ev.daysAway);
                    const sincere = isSensitiveOccasion(ev.event);
                    const cta = upcomingCta(ev);

                    return (
                      <SoftCard key={`${ev.recipient.id}-${ev.event}`} style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                          <div style={{
                            width: 52, flexShrink: 0, textAlign: "center" as const,
                            padding: "6px 0", borderRadius: 10, background: `${accent}10`,
                          }}>
                            <div style={{ fontSize: "1.35rem", fontWeight: 700, color: accent, lineHeight: 1 }}>{big.day}</div>
                            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em", color: MID }}>{big.month}</div>
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <button
                              type="button"
                              onClick={() => setLocation(`/relationship/${ev.recipient.id}`)}
                              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" as const }}
                            >
                              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: INK }}>{ev.recipient.name}</div>
                              <div style={{ fontSize: "0.78rem", color: MID, marginTop: 2 }}>{ev.event}</div>
                            </button>
                            <p style={{ fontSize: "0.86rem", color: MID, margin: "8px 0 12px", lineHeight: 1.45 }}>
                              {calmOccasionLine(ev.event, ev.daysAway, ev.dateStr, sincere)}
                            </p>
                            <PrimaryBtn onClick={cta.action} accent={accent} variant={cta.label === "Send it" ? "outline" : "fill"}>
                              {cta.label}
                            </PrimaryBtn>
                          </div>
                        </div>
                      </SoftCard>
                    );
                  })}
                </div>
              ) : (
                <SoftCard style={{ padding: "24px 20px" }}>
                  <p style={{ fontSize: "0.92rem", color: MID, margin: 0, lineHeight: 1.6 }}>
                    Nothing on the calendar right now. We'll let you know when something needs you.
                  </p>
                </SoftCard>
              )}
            </div>

            {/* ── Your important people ───────────────────────────────────── */}
            <div style={{ marginBottom: 28 }}>
              <SectionTitle
                title="Your important people"
                sub="A quick look at who we're caring for."
                right={recipients.length > 3 ? (
                  <Link href="/people" style={{ fontSize: "0.8rem", fontWeight: 600, color: SAGE, textDecoration: "none", flexShrink: 0 }}>
                    View all
                  </Link>
                ) : undefined}
              />
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                {recipients.slice(0, 3).map(r => {
                  const next = getNextOccasion(r);
                  return (
                    <Link key={r.id} href={`/relationship/${r.id}`} style={{ textDecoration: "none" }}>
                      <SoftCard style={{ padding: "12px 14px", cursor: "pointer" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <PersonAvatar name={r.name} size={36} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: INK }}>{r.name}</div>
                            <div style={{ fontSize: "0.78rem", color: MID, marginTop: 2 }}>
                              {r.relationship}
                              {next ? ` · ${next.event} ${next.daysAway === 0 ? "today" : next.daysAway === 1 ? "tomorrow" : `in ${next.daysAway} days`}` : ""}
                            </div>
                          </div>
                        </div>
                      </SoftCard>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ── Service status ──────────────────────────────────────────── */}
            <SoftCard style={{ padding: "16px 18px", marginBottom: 8, background: `${INK}02` }}>
              <SectionTitle title="Service status" sub="Quiet reassurance — no action needed unless we say otherwise." style={{ marginBottom: 12 }} />
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, fontSize: "0.88rem", color: MID, lineHeight: 1.55 }}>
                <p style={{ margin: 0, color: INK }}>
                  {personalSettings.automationMode === "autopilot"
                    ? "Cards are prepared and mailed automatically when ready."
                    : "We'll show you each card before it mails."}
                </p>
                <p style={{ margin: 0 }}>
                  {upcoming60.length > 0
                    ? `${upcoming60.length} occasion${upcoming60.length === 1 ? "" : "s"} on your calendar.`
                    : "Your calendar is clear for now."}
                </p>
                <p style={{ margin: 0 }}>
                  {cardsLeft} card{cardsLeft === 1 ? "" : "s"} remaining on your {planConfig.label} plan this year.
                </p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const, marginTop: 4 }}>
                  <Link href="/settings/reminders" style={{ fontSize: "0.8rem", fontWeight: 600, color: SAGE, textDecoration: "none" }}>
                    Reminder preferences
                  </Link>
                  <button
                    type="button"
                    onClick={() => setFontPickerOpen(true)}
                    style={{ background: "none", border: "none", padding: 0, fontSize: "0.8rem", fontWeight: 600, color: SAGE, cursor: "pointer" }}
                  >
                    Card style & signature
                  </button>
                </div>
              </div>
            </SoftCard>
          </>
        )}
      </div>
    </div>

    {/* ── Mobile FAB ────────────────────────────────────────────────────── */}
    {isMobile && recipients.length === 0 && (
      <Link href="/recipients/new">
        <button data-testid="link-add-recipient"
          style={{ position: "fixed", bottom: 24, right: 20, zIndex: 200, display: "flex", alignItems: "center", gap: 8, background: RED, color: WHITE, border: "none", borderRadius: 28, padding: "14px 24px", fontWeight: 700, fontSize: "0.9rem", boxShadow: "0 4px 20px rgba(226,59,46,0.25)", cursor: "pointer" }}>
          <Plus size={16} /> Add someone
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
          <div style={{ fontWeight: 700, fontSize: "1.05rem", color: INK }}>Card style & signature</div>
          <div style={{ fontSize: "0.86rem", color: MID, marginTop: -8, lineHeight: 1.5 }}>
            Choose how your cards are signed and handwritten.
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: MID, marginBottom: 6 }}>Signed as</label>
            <input
              value={personalSettings.cardSignature ?? ""}
              onChange={e => updateSettings("cardSignature", e.target.value)}
              placeholder="e.g. Love, James"
              style={{
                width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8,
                padding: "10px 12px", fontSize: "0.9rem", color: INK, outline: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: "border-box" as const,
              }}
            />
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: MID, letterSpacing: "0.04em" }}>Handwriting style</div>
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

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PHASE 1 LEGACY UI — preserved for reference (relationship-assistant-redesign)
 * Removed from render: KPI summary strip, bubble filters, status-first rows.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KPI strip showed: People | Upcoming | Cards Ready | At Risk
 *
 * Bubble filter row: "Next 30 Days" + per-event pills with counts,
 * expanding into status-first rows with day-count badges and
 * "Write Card ✦" / "Card Ready ✓" CTAs.
 *
 * See git history for full JSX if needed for Phase 2 restoration.
 */
