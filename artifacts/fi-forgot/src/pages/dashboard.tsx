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
  isSensitiveOccasion,
} from "@/lib/personal-brand";
import { getCustomerPendingApprovals } from "@/lib/admin-data";
import { PersonAvatar, SoftCard, PrimaryBtn, AppSection, TextLink } from "@/components/personal-ui";
import { Plan, PLANS } from "@/lib/plan";
import {
  Plus, ArrowRight, CheckCircle2, Heart, PenLine, Users, Sparkles,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";

interface HwFont { id: string; name: string; previewUrl?: string; }

const RED    = PB.red;
const INK    = PB.ink;
const MID    = PB.mid;
const WHITE  = PB.white;
const SAGE   = PB.sage;
const BORDER = PB.border;
const BEIGE  = PB.beige;

const serif = "'Lora', Georgia, serif";
const sans = "'Plus Jakarta Sans', sans-serif";

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

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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

  const relationshipHighlights = useMemo(() => {
    const highlights: { id: string; title: string; detail: string; onClick: () => void }[] = [];
    const sortedApproved = [...approvedCards].sort((a, b) => {
      const ta = a.id.match(/personal-(\d+)/)?.[1] ?? "0";
      const tb = b.id.match(/personal-(\d+)/)?.[1] ?? "0";
      return Number(tb) - Number(ta);
    });
    for (const c of sortedApproved.slice(0, 2)) {
      highlights.push({
        id: `card-${c.id}`,
        title: `${c.holiday} for ${c.recipientName}`,
        detail: cardOutcomeLabel(c.status),
        onClick: () => setViewingCardId(c.id),
      });
    }
    for (const r of recipients) {
      if (highlights.length >= 3) break;
      const next = getNextOccasion(r);
      if (next && next.daysAway <= 30) {
        highlights.push({
          id: `next-${r.id}`,
          title: `${r.name}'s ${next.event}`,
          detail: next.daysAway === 0 ? "Today" : next.daysAway === 1 ? "Tomorrow" : `In ${next.daysAway} days`,
          onClick: () => setLocation(`/relationship/${r.id}`),
        });
      }
    }
    return highlights.slice(0, 3);
  }, [approvedCards, recipients, setLocation]);

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

  function upcomingOutcome(ev: UpcomingEvent): { line: string; viewCardId?: string } {
    const evKey = `${ev.recipient.id}:::${ev.event}`;
    const cardId = upcomingCardById.get(evKey);
    const card = cardId ? cards.find(c => c.id === cardId) : undefined;

    if (card?.status === "Approved") {
      return { line: "Queued to mail", viewCardId: cardId };
    }
    if (card?.status === "Ready for approval") {
      return { line: "Ready for your review" };
    }
    return { line: "We'll prepare this for you" };
  }

  function cardOutcomeLabel(status: CardOrder["status"]): string {
    if (status === "Approved") return "Queued to mail";
    if (status === "Ready for approval") return "Ready for your review";
    return "We'll prepare this for you";
  }

  const timeGreeting = greetingForHour(new Date().getHours());
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const quickActions: { label: string; icon: typeof Plus; href: string; testId?: string }[] = [
    { label: "Add someone", icon: Plus, href: "/recipients/new", testId: "link-add-recipient" },
    { label: "Log a memory", icon: Heart, href: recipients.length === 1 ? `/relationship/${recipients[0].id}` : "/people" },
    { label: "Write a card", icon: PenLine, href: "/quick-card" },
    { label: "Your people", icon: Users, href: "/people" },
  ];

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <AppShell>
      <PageShell>

        {/* ══ EMPTY STATE ══════════════════════════════════════════════════ */}
        {recipients.length === 0 && (
          <SoftCard style={{ padding: isMobile ? "48px 28px" : "64px 40px", textAlign: "center" as const }}>
            <div style={{ margin: "0 auto 20px", width: "100%", maxWidth: isMobile ? 220 : 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src="/illustrations/dashboard/004_dashboard_empty_state.webp"
                alt="A warm illustration inviting you to add someone important to your circle"
                style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
              />
            </div>
            <h1 style={{ fontFamily: serif, fontSize: isMobile ? "1.5rem" : "1.75rem", fontWeight: 600, color: INK, margin: "0 0 12px", lineHeight: 1.3 }}>
              Add someone important
            </h1>
            <p style={{ fontSize: "1rem", color: MID, maxWidth: 360, margin: "0 auto 28px", lineHeight: 1.65 }}>
              Tell us who matters. We'll track their occasions and handle the cards.
            </p>
            <Link href="/recipients/new">
              <span data-testid="link-add-recipient" style={{ display: "inline-flex" }}>
                <PrimaryBtn style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Plus size={18} /> Add someone important
                </PrimaryBtn>
              </span>
            </Link>
          </SoftCard>
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
              <header style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: serif, fontSize: isMobile ? "1.5rem" : "1.85rem", fontWeight: 600, color: INK, margin: 0, lineHeight: 1.25 }}>
                  You're all set for {r.name}
                </h1>
                <p style={{ fontSize: "1rem", color: MID, margin: "10px 0 0", lineHeight: 1.6 }}>
                  We'll take it from here.
                </p>
              </header>

              <SoftCard style={{ padding: "18px 20px", marginBottom: 20, background: `${SAGE}08`, border: `1px solid ${SAGE}25` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <CheckCircle2 size={20} style={{ flexShrink: 0, color: SAGE, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", color: INK }}>First card prepared</div>
                    <div style={{ fontSize: "0.9rem", color: MID, marginTop: 6, lineHeight: 1.55 }}>
                      {c ? `${c.holiday} for ${r.name} — ${cardOutcomeLabel(c.status).toLowerCase()}.` : "Your card is being prepared."}
                    </div>
                  </div>
                </div>
              </SoftCard>

              <SoftCard style={{ padding: "22px 24px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: c ? 18 : 0 }}>
                  <PersonAvatar name={r.name} size={52} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "1.1rem", color: INK }}>{r.name}</div>
                    <div style={{ fontSize: "0.88rem", color: MID, marginTop: 4 }}>{r.relationship}</div>
                  </div>
                  {c && (
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: c.status === "Approved" ? SAGE : MID, textAlign: "right" as const, maxWidth: 140, lineHeight: 1.4 }}>
                      {cardOutcomeLabel(c.status)}
                    </span>
                  )}
                </div>

                {c && (
                  <div style={{ padding: "16px 18px", borderRadius: 12, background: BEIGE, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: MID, marginBottom: 8 }}>
                      {c.holiday} · {c.dueDate}
                    </div>
                    {c.approvedMessage && (
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: INK, lineHeight: 1.6,
                        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                        {c.approvedMessage}
                      </div>
                    )}
                    <button
                      onClick={() => setViewingCardId(c.id)}
                      style={{ marginTop: 12, fontSize: "0.85rem", fontWeight: 600, color: RED, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4, fontFamily: sans }}>
                      View full card <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </SoftCard>

              {needsAddressNudge && (
                <SoftCard style={{ padding: "18px 20px", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", color: INK, marginBottom: 4 }}>Mailing address needed for {r.name}</div>
                      <div style={{ fontSize: "0.88rem", color: MID, lineHeight: 1.55 }}>We can't mail a card without it.</div>
                    </div>
                    <TextLink onClick={() => setLocation(`/relationship/${r.id}`)}>
                      Add address
                    </TextLink>
                  </div>
                </SoftCard>
              )}

              <Link href="/recipients/new">
                <button style={{ width: "100%", padding: "16px", borderRadius: 12, border: `2px dashed ${BORDER}`,
                  background: "transparent", color: MID, fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: sans }}>
                  <Plus size={18} style={{ color: RED }} />
                  Add another person
                </button>
              </Link>

              <div style={{ textAlign: "center" as const, marginTop: 20 }}>
                <button
                  onClick={() => {
                    localStorage.setItem("fi_forgot_first_time_seen", "1");
                    setFirstTimeDismissed(true);
                  }}
                  style={{ background: "none", border: "none", color: MID, fontSize: "0.85rem", cursor: "pointer",
                    textDecoration: "underline", opacity: 0.7, fontFamily: sans }}>
                  Show me the full home page
                </button>
              </div>
            </div>
          );
        })()}

        {recipients.length > 0 && !isFirstTimeState && (
          <>
            {/* ── Welcome ───────────────────────────────────────────────── */}
            <header style={{ marginBottom: 36 }}>
              <p style={{ fontSize: "0.8rem", fontWeight: 500, color: MID, margin: "0 0 8px", letterSpacing: "0.02em" }}>
                {todayLabel}
              </p>
              <h1 style={{
                fontFamily: serif,
                fontSize: isMobile ? "1.65rem" : "2rem",
                fontWeight: 600, color: INK, margin: "0 0 12px", lineHeight: 1.2,
              }}>
                {pendingReviewCount > 0
                  ? `${timeGreeting}, ${firstName}.`
                  : upcoming60.length > 0
                    ? `${timeGreeting}, ${firstName}.`
                    : `Everything looks good today, ${firstName}.`}
              </h1>
              <p style={{ fontSize: "1rem", color: MID, margin: 0, lineHeight: 1.65, maxWidth: 520 }}>
                {pendingReviewCount > 0
                  ? "One card is ready when you are. Everything else is handled."
                  : upcoming60.length > 0
                    ? "Here's what's coming up. Everything else is handled."
                    : "Nothing needs your attention right now. We're quietly taking care of things."}
              </p>
            </header>

            {/* ── Coming up ─────────────────────────────────────────────── */}
            <AppSection
              title="Coming up"
              sub="Who needs you next."
              right={upcoming60.length > 3 ? (
                <Link href="/moments" style={{ fontSize: "0.85rem", fontWeight: 600, color: SAGE, textDecoration: "none", flexShrink: 0, paddingTop: 4 }}>
                  View all
                </Link>
              ) : undefined}
            >
              {dashboardMoments.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                  {dashboardMoments.map(ev => {
                    const sincere = isSensitiveOccasion(ev.event);
                    const outcome = upcomingOutcome(ev);
                    const cta = upcomingCta(ev);
                    const daysLabel = ev.daysAway === 0 ? "Today" : ev.daysAway === 1 ? "Tomorrow" : `${ev.daysAway} days`;

                    return (
                      <SoftCard key={`${ev.recipient.id}-${ev.event}`} style={{ padding: "18px 20px" }}>
                        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                          <PersonAvatar name={ev.recipient.name} size={52} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <button
                              type="button"
                              onClick={() => setLocation(`/relationship/${ev.recipient.id}`)}
                              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" as const, width: "100%" }}
                            >
                              <div style={{ fontWeight: 600, fontSize: "1.05rem", color: INK }}>{ev.recipient.name}</div>
                              <div style={{ fontSize: "0.88rem", color: MID, marginTop: 4 }}>{ev.event}</div>
                            </button>
                            <p style={{ fontSize: "0.9rem", color: MID, margin: "10px 0 0", lineHeight: 1.5 }}>
                              {calmOccasionLine(ev.event, ev.daysAway, ev.dateStr, sincere)}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" as const }}>
                              <span style={{
                                fontSize: "0.78rem", fontWeight: 600, color: SAGE,
                                background: `${SAGE}12`, padding: "4px 10px", borderRadius: 20,
                              }}>
                                {outcome.line}
                              </span>
                              <span style={{ fontSize: "0.78rem", color: MID }}>{daysLabel}</span>
                            </div>
                            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" as const }}>
                              <TextLink onClick={cta.action}>{cta.label}</TextLink>
                              {outcome.viewCardId && (
                                <TextLink onClick={() => setViewingCardId(outcome.viewCardId!)}>View card</TextLink>
                              )}
                            </div>
                          </div>
                        </div>
                      </SoftCard>
                    );
                  })}
                </div>
              ) : (
                <SoftCard style={{ padding: "28px 24px" }}>
                  <p style={{ fontSize: "0.95rem", color: MID, margin: 0, lineHeight: 1.65 }}>
                    Nothing on the calendar right now. We'll let you know when something needs you.
                  </p>
                </SoftCard>
              )}
            </AppSection>

            {/* ── Cards waiting for approval ────────────────────────────── */}
            <AppSection title="Cards waiting for you">
              {pendingReviewCount > 0 ? (
                <SoftCard style={{ padding: "24px", background: `${RED}06`, border: `1px solid ${RED}20` }}>
                  <p style={{ fontSize: "0.95rem", color: INK, margin: "0 0 18px", lineHeight: 1.6 }}>
                    {pendingReviewCount === 1
                      ? "One card is ready for your review."
                      : `${pendingReviewCount} cards are ready for your review.`}
                  </p>
                  <PrimaryBtn onClick={() => setLocation("/cards/review")}>
                    Review cards
                  </PrimaryBtn>
                </SoftCard>
              ) : (
                <SoftCard style={{ padding: "24px", background: `${SAGE}06`, border: `1px solid ${SAGE}20` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <CheckCircle2 size={22} style={{ color: SAGE, flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontSize: "1rem", fontWeight: 600, color: INK, margin: "0 0 6px" }}>
                        You're all caught up.
                      </p>
                      <p style={{ fontSize: "0.9rem", color: MID, margin: 0, lineHeight: 1.55 }}>
                        We'll reach out when a card needs you.
                      </p>
                    </div>
                  </div>
                </SoftCard>
              )}
            </AppSection>

            {/* ── Quick actions ───────────────────────────────────────────── */}
            <AppSection title="Quick actions" sub="The easiest next step.">
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
                gap: 12,
              }}>
                {quickActions.map(({ label, icon: Icon, href, testId }) => (
                  <Link key={label} href={href} style={{ textDecoration: "none" }} {...(testId ? { "data-testid": testId } : {})}>
                    <SoftCard style={{
                      padding: "20px 16px", cursor: "pointer", height: "100%",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", gap: 10, textAlign: "center" as const,
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, background: `${RED}10`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={20} color={RED} strokeWidth={1.75} />
                      </div>
                      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: INK }}>{label}</span>
                    </SoftCard>
                  </Link>
                ))}
              </div>
            </AppSection>

            {/* ── Relationship highlights ───────────────────────────────── */}
            {relationshipHighlights.length > 0 && (
              <AppSection title="Recently handled" sub="What we've already taken care of.">
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                  {relationshipHighlights.map(h => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={h.onClick}
                      style={{
                        background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14,
                        padding: "16px 18px", cursor: "pointer", textAlign: "left" as const,
                        boxShadow: "0 2px 16px rgba(31,31,31,0.04)", width: "100%",
                        fontFamily: sans,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Sparkles size={18} color={SAGE} style={{ flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.92rem", color: INK }}>{h.title}</div>
                          <div style={{ fontSize: "0.84rem", color: MID, marginTop: 4 }}>{h.detail}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </AppSection>
            )}

            {/* ── Everything else (attention items) ─────────────────────── */}
            {attentionItems.length > 0 && (
              <AppSection title="Before we send" sub="A small detail helps us take care of it.">
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                  {attentionItems.map(item => (
                    <SoftCard key={item.id} style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" as const }}>
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.92rem", color: INK, lineHeight: 1.45 }}>{item.title}</div>
                          {item.detail && (
                            <div style={{ fontSize: "0.86rem", color: MID, marginTop: 6, lineHeight: 1.5 }}>{item.detail}</div>
                          )}
                        </div>
                        <TextLink onClick={item.onAction} style={{ flexShrink: 0 }}>
                          {item.actionLabel}
                        </TextLink>
                      </div>
                    </SoftCard>
                  ))}
                </div>
              </AppSection>
            )}

            {/* ── Quiet reassurance ─────────────────────────────────────── */}
            <SoftCard style={{ padding: "20px 22px", background: `${INK}02` }}>
              <p style={{ fontSize: "0.92rem", color: INK, margin: "0 0 8px", fontWeight: 500, lineHeight: 1.55 }}>
                {personalSettings.automationMode === "autopilot"
                  ? "Cards go out automatically once they're ready."
                  : "You'll see each card before it goes out."}
              </p>
              <p style={{ fontSize: "0.88rem", color: MID, margin: 0, lineHeight: 1.55 }}>
                Everything important is under control.
              </p>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const, marginTop: 14 }}>
                <Link href="/settings/reminders" style={{ fontSize: "0.85rem", fontWeight: 600, color: SAGE, textDecoration: "none" }}>
                  Reminder preferences
                </Link>
                <button
                  type="button"
                  onClick={() => setFontPickerOpen(true)}
                  style={{ background: "none", border: "none", padding: 0, fontSize: "0.85rem", fontWeight: 600, color: SAGE, cursor: "pointer", fontFamily: sans }}
                >
                  Card style & signature
                </button>
              </div>
            </SoftCard>
          </>
        )}
      </PageShell>

    {/* ── Mobile FAB ────────────────────────────────────────────────────── */}
    {isMobile && recipients.length === 0 && (
      <Link href="/recipients/new">
        <button data-testid="link-add-recipient"
          style={{ position: "fixed", bottom: 24, right: 20, zIndex: 200, display: "flex", alignItems: "center", gap: 8, background: RED, color: WHITE, border: "none", borderRadius: 28, padding: "14px 24px", fontWeight: 600, fontSize: "0.9rem", boxShadow: "0 4px 20px rgba(226,59,46,0.2)", cursor: "pointer", fontFamily: sans }}>
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
                <div style={{ fontWeight: 600, fontSize: "1rem", color: INK, fontFamily: serif }}>{card.holiday} · {card.recipientName}</div>
                {mailDate && <div style={{ fontSize: "0.78rem", color: MID, marginTop: 4 }}>Mailing on {mailDate}</div>}
              </div>
              <button onClick={() => setViewingCardId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: MID, fontSize: "1.1rem", padding: "2px 6px" }} aria-label="Close">✕</button>
            </div>
            <div style={{ margin: "14px 22px 0", display: "flex", gap: 8, background: `${SAGE}10`, border: `1px solid ${SAGE}25`, borderRadius: 8, padding: "10px 14px", alignItems: "center" }}>
              <CheckCircle2 size={14} style={{ color: SAGE }} />
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: SAGE }}>Queued to mail</span>
            </div>
            <div style={{ padding: "18px 22px 28px" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: MID, marginBottom: 10 }}>Message</div>
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
          <div style={{ fontWeight: 600, fontSize: "1.05rem", color: INK, fontFamily: serif }}>Card style & signature</div>
          <div style={{ fontSize: "0.86rem", color: MID, marginTop: -8, lineHeight: 1.5 }}>
            Choose how your cards are signed and handwritten.
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: MID, marginBottom: 6 }}>Signed as</label>
            <input
              value={personalSettings.cardSignature ?? ""}
              onChange={e => updateSettings("cardSignature", e.target.value)}
              placeholder="e.g. Love, James"
              style={{
                width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8,
                padding: "10px 12px", fontSize: "0.9rem", color: INK, outline: "none",
                fontFamily: sans, boxSizing: "border-box" as const,
              }}
            />
          </div>
          <div style={{ fontSize: "0.72rem", fontWeight: 600, color: MID, letterSpacing: "0.04em" }}>Handwriting style</div>
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
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: INK }}>{font.name}</span>
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
                style={{ background: "none", border: "none", cursor: "pointer", color: MID, fontSize: "0.82rem", fontFamily: sans }}>
                Clear selection
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button onClick={() => setFontPickerOpen(false)}
              style={{ background: RED, color: WHITE, border: "none", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontSize: "0.86rem", fontWeight: 600, fontFamily: sans }}>
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
          <div style={{ fontFamily: serif, fontSize: "1.5rem", fontWeight: 600, color: INK, marginBottom: 8 }}>Need more cards?</div>
          <p style={{ fontSize: "0.9rem", color: MID, marginBottom: 20, lineHeight: 1.6 }}>You've used {cardsUsed} of {cardsTotal} card slots. Upgrade to cover more occasions.</p>
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
                        <span style={{ fontFamily: serif, fontSize: "1.05rem", fontWeight: 600, color: INK }}>{cfg.label}</span>
                        {isCurrent && <span style={{ fontSize: "0.62rem", fontWeight: 600, padding: "2px 7px", borderRadius: 10, background: `${INK}09`, color: MID }}>Current</span>}
                        {key === "standard" && !isCurrent && <span style={{ fontSize: "0.62rem", fontWeight: 600, padding: "2px 7px", borderRadius: 10, background: `${RED}10`, color: RED }}>Popular</span>}
                      </div>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 3 }}>
                        {cfg.perks.map(perk => <li key={perk} style={{ fontSize: "0.78rem", color: INK, display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: SAGE }}>✓</span>{perk}</li>)}
                      </ul>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontFamily: serif, fontSize: "1.5rem", fontWeight: 700, color: INK, lineHeight: 1 }}>{cfg.price}</span>
                      {!isCurrent && (
                        <button onClick={() => { upgradePlan(key); setUpgradeOpen(false); }}
                          style={{ background: isUpgrade ? RED : `${INK}08`, color: isUpgrade ? WHITE : MID, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: sans }}>
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
    </AppShell>
  );
}
