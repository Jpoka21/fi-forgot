import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  getCards, getRecipients, getBriefingsForRecipient, getServerUserId, getApiHeaders,
  CardOrder, Recipient,
  getPersonalSettings, savePersonalSettings, PersonalSettings,
  TONES,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import {
  PB, buildHomeHeroSubline, getEventDateForRecipient, getNextOccasion,
  formatBigDate, occasionPhrase, urgencyAccent, personStatusLine, recipientHasThinMemory,
  isSensitiveOccasion,
} from "@/lib/personal-brand";
import { PersonAvatar, SectionTitle, SoftCard, PrimaryBtn } from "@/components/personal-ui";
import { Plan, PLANS } from "@/lib/plan";
import {
  Plus, ChevronDown, ChevronUp,
  ArrowRight, Settings, CheckCircle2,
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

type FeedMemory = {
  id: string;
  recipientId: string;
  recipientName: string;
  answerText: string;
  daysAgo: number;
};

/* ── Thin bar ─────────────────────────────────────────────────────────────── */
function ThinBar({ pct, color = SAGE, h = 4 }: { pct: number; color?: string; h?: number }) {
  return (
    <div style={{ height: h, background: BORDER, borderRadius: h, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: color, borderRadius: h, transition: "width 0.6s ease" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [cards, setCards]                       = useState<CardOrder[]>([]);
  const [recipients, setRecipients]             = useState<Recipient[]>([]);
  const [settingsOpen, setSettingsOpen]         = useState(false);
  const [personalSettings, setPersonalSettings] = useState<PersonalSettings>(() => getPersonalSettings());
  const [hwFonts, setHwFonts]                   = useState<HwFont[]>([]);
  const [fontsLoading, setFontsLoading]         = useState(false);
  const [fontPickerOpen, setFontPickerOpen]     = useState(false);
  const [viewingCardId, setViewingCardId]       = useState<string | null>(null);
  const [isMobile, setIsMobile]                 = useState(() => window.innerWidth < 768);
  const [upgradeOpen, setUpgradeOpen]           = useState(false);
  const [feedMemories, setFeedMemories]         = useState<FeedMemory[]>([]);
  const [memoriesLoading, setMemoriesLoading]   = useState(false);

  const { user, upgradePlan, authReady } = useAuth();
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

  useEffect(() => {
    if (!authReady || recipients.length === 0) return;
    const headers = getApiHeaders() as Record<string, string>;
    if (!headers["x-user-id"]) return;
    let cancelled = false;
    setMemoriesLoading(true);
    Promise.all(
      recipients.slice(0, 8).map(async r => {
        try {
          const res = await fetch(`/api/v2/recipients/${r.id}/fresh-updates`, { headers });
          if (!res.ok) return [];
          const d = await res.json() as { freshUpdates?: { id: string; answerText: string; daysAgo: number }[] };
          return (d.freshUpdates ?? []).slice(0, 2).map(m => ({
            id: m.id,
            recipientId: r.id,
            recipientName: r.name,
            answerText: m.answerText,
            daysAgo: m.daysAgo,
          }));
        } catch {
          return [];
        }
      }),
    ).then(rows => {
      if (cancelled) return;
      const merged = rows.flat().sort((a, b) => a.daysAgo - b.daysAgo).slice(0, 5);
      if (merged.length > 0) {
        setFeedMemories(merged);
      } else {
        const local: FeedMemory[] = [];
        for (const r of recipients) {
          const snippet = r.favoriteMemories?.trim() || r.insideJokes?.trim();
          if (snippet) {
            local.push({
              id: `local-${r.id}`,
              recipientId: r.id,
              recipientName: r.name,
              answerText: snippet.slice(0, 120) + (snippet.length > 120 ? "…" : ""),
              daysAgo: 99,
            });
          }
          if (local.length >= 4) break;
        }
        setFeedMemories(local);
      }
    }).finally(() => { if (!cancelled) setMemoriesLoading(false); });
    return () => { cancelled = true; };
  }, [authReady, recipients]);

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
  const usagePct   = Math.min(100, Math.round((cardsUsed / Math.max(cardsTotal, 1)) * 100));
  const px         = isMobile ? 16 : 28;
  const firstName  = user?.name?.split(" ")[0] ?? "there";
  const heroSubline = buildHomeHeroSubline(
    upcoming60.length,
    upcoming60[0] ? { name: upcoming60[0].recipient.name, event: upcoming60[0].event, daysAway: upcoming60[0].daysAway } : undefined,
  );

  function recipientHasUpcomingCard(recipientId: string): boolean {
    for (const key of upcomingWithCardKeys) {
      if (key.startsWith(`${recipientId}:::`)) return true;
    }
    return false;
  }

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

  const autopilotSettings = (
    <div style={{ background: `${INK}02`, borderTop: `1px solid ${BORDER}` }}>
      <button onClick={() => setSettingsOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: `12px ${px}px`, background: "none", border: "none", cursor: "pointer" }}>
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
                style={{ width: "100%", border: "none", background: "none", fontWeight: 600, fontSize: "0.84rem", color: INK, outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE }}>
              <div style={{ fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", color: MID, marginBottom: 4 }}>DEFAULT TONE</div>
              <select value={personalSettings.defaultTone ?? ""} onChange={e => updateSettings("defaultTone", e.target.value as import("@/lib/data").Tone)}
                style={{ width: "100%", border: "none", background: "none", fontWeight: 600, fontSize: "0.84rem", color: INK, outline: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <option value="">No preference</option>
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <>
    <AppNav />
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: "'Plus Jakarta Sans', sans-serif", color: INK }}>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: `24px ${px}px 32px`, boxSizing: "border-box" as const }}>

        {/* ══ EMPTY STATE ══════════════════════════════════════════════════ */}
        {recipients.length === 0 && (
          <div style={{ background: WHITE, borderRadius: 24, padding: "72px 36px", textAlign: "center" as const, boxShadow: "0 2px 16px rgba(0,0,0,0.05)", border: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 18 }}>💌</div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "2rem" : "2.6rem", color: INK, letterSpacing: "0.04em", marginBottom: 12, lineHeight: 1.1 }}>
              Add Your People
            </div>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem", color: MID, maxWidth: 360, margin: "0 auto 32px", lineHeight: 1.6 }}>
              We remember who matters, write thoughtful cards, and help you not look like a forgetful idiot.
            </p>
            <Link href="/recipients/new">
              <button data-testid="link-add-recipient"
                style={{ background: RED, color: WHITE, border: "none", borderRadius: 12, padding: "14px 36px", fontFamily: "'Bebas Neue', cursive", fontSize: "1.05rem", letterSpacing: "0.06em", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Plus size={16} /> Add Your First Person
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
                <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: isMobile ? "1.8rem" : "2.2rem", letterSpacing: "0.03em", color: INK, margin: 0, lineHeight: 1 }}>
                  Good start.
                </h1>
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: MID, margin: "4px 0 0" }}>
                  You've got {r.name} covered.
                </p>
              </div>

              <div style={{ background: SAGE, borderRadius: 12, padding: "14px 20px", marginBottom: 20, color: WHITE, display: "flex", alignItems: "center", gap: 12 }}>
                <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.08em" }}>FIRST CARD READY</div>
                  <div style={{ fontSize: "0.82rem", opacity: 0.85 }}>
                    {c ? `${c.holiday} card for ${r.name} is ${c.status === "Approved" ? "approved and queued" : "ready for your approval"}.` : "Your card is being prepared."}
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
                <div style={{ background: `${RED}08`, borderRadius: 12, padding: "16px 20px", marginBottom: 16, border: `1px solid ${RED}20`, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>📬</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: INK, marginBottom: 3 }}>Add an address so we can send {r.name}'s card</div>
                    <div style={{ fontSize: "0.82rem", color: MID }}>Without one, the card stays in draft. Takes 30 seconds.</div>
                  </div>
                  <button
                    onClick={() => setLocation(`/relationship/${r.id}`)}
                    style={{ flexShrink: 0, padding: "9px 18px", borderRadius: 9, background: RED, color: WHITE, border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                    Add it →
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
            <div style={{ marginBottom: 28, padding: "4px 0 8px" }}>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: isMobile ? "1.55rem" : "1.85rem",
                fontWeight: 700,
                color: INK,
                margin: "0 0 8px",
                lineHeight: 1.25,
              }}>
                Hey {firstName}.
              </h1>
              <p style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "1.2rem",
                color: MID,
                margin: 0,
                lineHeight: 1.5,
                maxWidth: 520,
              }}>
                {heroSubline}
              </p>
              <p style={{ fontSize: "0.72rem", color: MID, margin: "6px 0 0", letterSpacing: "0.04em" }}>
                SYNC TEST 1
              </p>
            </div>

            {/* ── Section 1: Cards Coming Up ─────────────────────────────── */}
            <div style={{ marginBottom: 28 }}>
              <SectionTitle
                title="Cards Coming Up"
                sub="The next few cards we'll help you nail."
                right={upcoming60.length > 3 ? (
                  <Link href="/moments" style={{ fontSize: "0.8rem", fontWeight: 600, color: SAGE, textDecoration: "none", flexShrink: 0 }}>
                    See all →
                  </Link>
                ) : undefined}
              />

              {dashboardMoments.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                  {dashboardMoments.map(ev => {
                    const big = formatBigDate(ev.dateStr);
                    const accent = urgencyAccent(ev.daysAway);
                    const sincere = isSensitiveOccasion(ev.event);
                    const cta = upcomingCta(ev);

                    return (
                      <SoftCard key={`${ev.recipient.id}-${ev.event}`} style={{ borderLeft: `3px solid ${accent}`, padding: "16px 18px" }}>
                        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                          <div style={{
                            width: 64, flexShrink: 0, textAlign: "center" as const,
                            padding: "8px 0", borderRadius: 12,
                            background: sincere ? `${SAGE}12` : `${accent}10`,
                          }}>
                            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.75rem", color: accent, lineHeight: 1 }}>{big.day}</div>
                            <div style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", color: MID }}>{big.month}</div>
                            <div style={{ fontSize: "0.68rem", color: MID, marginTop: 2 }}>{big.weekday}</div>
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <button
                              type="button"
                              onClick={() => setLocation(`/relationship/${ev.recipient.id}`)}
                              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" as const }}
                            >
                              <div style={{ fontWeight: 700, fontSize: "1.05rem", color: INK }}>{ev.recipient.name}</div>
                              <div style={{ fontSize: "0.78rem", color: MID, marginTop: 2 }}>{ev.recipient.relationship} · {ev.event}</div>
                            </button>
                            <p style={{ fontSize: "0.88rem", color: INK, margin: "10px 0 14px", lineHeight: 1.45 }}>
                              {occasionPhrase(ev.event, ev.daysAway, ev.dateStr, sincere)}
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
                <SoftCard style={{ padding: "28px 24px", textAlign: "center" as const }}>
                  <div style={{ fontSize: "2rem", marginBottom: 10 }}>✉️</div>
                  <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.15rem", color: MID, margin: 0, lineHeight: 1.5 }}>
                    Nothing on the calendar. Enjoy the calm — we'll tap you when it's time.
                  </p>
                </SoftCard>
              )}
            </div>

            {/* ── Section 2: Your People ─────────────────────────────────── */}
            <div style={{ marginBottom: 28 }}>
              <SectionTitle
                title="Your People"
                sub="Everyone you're staying out of trouble with."
                right={recipients.length > 4 ? (
                  <Link href="/people" style={{ fontSize: "0.8rem", fontWeight: 600, color: SAGE, textDecoration: "none", flexShrink: 0 }}>
                    See all →
                  </Link>
                ) : undefined}
              />
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                {recipients.slice(0, 4).map(r => {
                  const next = getNextOccasion(r);
                  const status = personStatusLine(r, {
                    daysAway: next?.daysAway ?? null,
                    hasCard: recipientHasUpcomingCard(r.id),
                    memoryThin: recipientHasThinMemory(r),
                  });
                  return (
                    <Link key={r.id} href={`/relationship/${r.id}`} style={{ textDecoration: "none" }}>
                      <SoftCard style={{ padding: "14px 16px", cursor: "pointer", height: "100%" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <PersonAvatar name={r.name} size={40} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: INK }}>{r.name}</div>
                            <div style={{ fontSize: "0.75rem", color: MID, marginTop: 2 }}>{r.relationship}</div>
                            {next && (
                              <div style={{ fontSize: "0.78rem", color: INK, marginTop: 8 }}>
                                {next.event} · {next.daysAway === 0 ? "today" : next.daysAway === 1 ? "tomorrow" : `${next.daysAway}d`}
                              </div>
                            )}
                            <div style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", color: SAGE, marginTop: 6, lineHeight: 1.35 }}>
                              {status}
                            </div>
                          </div>
                        </div>
                      </SoftCard>
                    </Link>
                  );
                })}
              </div>
              <Link href="/recipients/new">
                <button style={{
                  width: "100%", marginTop: 10, padding: "12px", borderRadius: 12,
                  border: `2px dashed ${BORDER}`, background: "transparent", color: MID,
                  fontSize: "0.88rem", fontWeight: 600, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <Plus size={16} style={{ color: RED }} /> Add a Person
                </button>
              </Link>
            </div>

            {/* ── Section 3: Stuff Worth Remembering ───────────────────────── */}
            <div style={{ marginBottom: 28 }}>
              <SectionTitle
                title="Stuff Worth Remembering"
                sub="Little details that make cards sound like you actually know them."
              />
              {memoriesLoading ? (
                <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: MID }}>Loading memories…</p>
              ) : feedMemories.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {feedMemories.map(m => (
                    <SoftCard key={m.id} style={{ padding: "12px 16px", borderLeft: `3px solid ${SAGE}` }}>
                      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: INK, lineHeight: 1.55 }}>{m.answerText}</div>
                      <div style={{ fontSize: "0.72rem", color: MID, marginTop: 6 }}>
                        About {m.recipientName}
                        {m.daysAgo < 30 && m.daysAgo < 90 ? ` · ${m.daysAgo === 0 ? "today" : `${m.daysAgo}d ago`}` : ""}
                      </div>
                    </SoftCard>
                  ))}
                </div>
              ) : (
                <SoftCard style={{ padding: "20px 18px", textAlign: "center" as const }}>
                  <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.05rem", color: MID, margin: "0 0 12px", lineHeight: 1.5 }}>
                    No memories saved yet. Drop one on a person's page and we'll use it in their next card.
                  </p>
                </SoftCard>
              )}
              <Link href={recipients[0] ? `/relationship/${recipients[0].id}` : "/recipients/new"}>
                <button style={{
                  marginTop: 10, padding: "10px 18px", borderRadius: 9, border: `1.5px solid ${SAGE}`,
                  background: WHITE, color: SAGE, fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                }}>
                  Add something they'll love →
                </button>
              </Link>
            </div>

            {/* ── Quick Card (secondary) ─────────────────────────────────── */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                background: WHITE, borderRadius: 12, padding: "16px 18px",
                border: `1px solid ${BORDER}`,
              }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', cursive", fontSize: "1rem",
                    letterSpacing: "0.08em", color: INK, marginBottom: 3,
                  }}>
                    Need a Card Right Now?
                  </div>
                  <div style={{ fontSize: "0.8rem", color: MID, marginBottom: 11, lineHeight: 1.4 }}>
                    Create a personalized card for anyone.
                  </div>
                  <Link href="/quick-card">
                    <button style={{
                      background: RED, color: WHITE, border: "none", borderRadius: 8,
                      padding: "8px 16px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                    }}>
                      Create Quick Card
                    </button>
                  </Link>
                  <div style={{ fontSize: "0.72rem", color: MID, marginTop: 7 }}>
                    No recipient setup required.
                  </div>
                </div>
              </div>
            </div>

            {/* ── Plan usage — subtle ──────────────────────────────────── */}
            <div style={{
              background: WHITE, borderRadius: 10, padding: "10px 14px",
              border: `1px solid ${BORDER}`, marginBottom: 16,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 5,
                }}>
                  <span style={{ fontSize: "0.76rem", fontWeight: 600, color: MID }}>
                    {planConfig.label} · {cardsUsed}/{cardsTotal} cards used
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: atLimit ? RED : MID }}>
                      {cardsLeft} left
                    </span>
                    {plan !== "premium" && (
                      <button onClick={() => setUpgradeOpen(true)}
                        style={{
                          padding: "3px 9px", borderRadius: 6, border: "none",
                          background: atLimit ? RED : `${INK}08`,
                          color: atLimit ? WHITE : MID,
                          fontSize: "0.7rem", fontWeight: 700, cursor: "pointer",
                        }}>
                        {atLimit ? "Upgrade" : "Plans"}
                      </button>
                    )}
                  </div>
                </div>
                <ThinBar pct={usagePct} color={atLimit ? RED : usagePct > 75 ? "#F59E0B" : SAGE} h={3} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center" as const, paddingTop: 8, marginTop: 4 }}>
              <span style={{ fontFamily: "'Caveat', cursive", fontSize: "1.1rem", color: MID }}>
                Thoughtful cards. Zero panic. That's the whole job. ❤️
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Autopilot Settings (moved below main content) ───────────────── */}
      {recipients.length > 0 && autopilotSettings}
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
