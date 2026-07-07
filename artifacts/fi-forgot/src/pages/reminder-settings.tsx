import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import AppShell from "@/components/layout/AppShell";
import PageShell from "@/components/layout/PageShell";
import { SoftCard, PrimaryBtn, AppSection, SecondaryBtn } from "@/components/personal-ui";
import { PB } from "@/lib/personal-brand";
import {
  getPersonalSettings, savePersonalSettings, PersonalSettings, TONES, Tone,
  RecipientAddress,
} from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { hasConciergeMembership, PLANS, resolveUserPlan, type Plan } from "@/lib/plan";
import { getHandwrittenCardPriceLabel, resolvePlanDisplayPrice } from "@/app/pricing";
import { Bell, Check, LogOut, MapPin, PenLine, CreditCard } from "lucide-react";

const CREAM  = PB.cream;
const RED    = PB.red;
const INK    = PB.ink;
const MID    = PB.mid;
const WHITE  = PB.white;
const SAGE   = PB.sage;
const BORDER = PB.border;

const serif = "'Lora', Georgia, serif";
const sans  = "'Plus Jakarta Sans', sans-serif";

type Channel = "Text message" | "Email" | "Both";
type Timing = "30 days before" | "14 days before" | "7 days before" | "2 days before" | "Day of";

const TIMINGS: Timing[] = [
  "30 days before",
  "14 days before",
  "7 days before",
  "2 days before",
  "Day of",
];

const TIMING_DESCRIPTIONS: Record<Timing, string> = {
  "30 days before": "Plenty of notice — we'll remind you early.",
  "14 days before": "A comfortable window to review your card.",
  "7 days before": "One week out — still time to make it personal.",
  "2 days before": "A gentle nudge when it's getting close.",
  "Day of": "A last reminder on the day itself.",
};

interface HwFont { id: string; name: string; previewUrl?: string; }

function OptionButton({
  active,
  onClick,
  testId,
  children,
}: {
  active: boolean;
  onClick: () => void;
  testId?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 14,
        padding: "14px 16px", borderRadius: 14, textAlign: "left" as const,
        border: `1.5px solid ${active ? RED : BORDER}`,
        background: active ? `${RED}06` : WHITE,
        cursor: "pointer", fontFamily: sans, transition: "border-color 0.15s ease",
      }}
    >
      {children}
      {active && <Check size={18} style={{ marginLeft: "auto", color: RED, flexShrink: 0 }} />}
    </button>
  );
}

export default function ReminderSettingsPage() {
  const { user, logout, updateMailingAddress } = useAuth();
  const [, setLocation] = useLocation();
  const plan = resolveUserPlan(user?.plan);
  const planConfig = PLANS[plan];

  /* Reminder preferences — preserved as-is */
  const [channel, setChannel] = useState<Channel>("Email");
  const [timings, setTimings] = useState<Set<Timing>>(new Set(["14 days before", "7 days before"]));
  const [reminderSaved, setReminderSaved] = useState(false);

  /* Personal settings — same persistence as dashboard */
  const [personalSettings, setPersonalSettings] = useState<PersonalSettings>(() => getPersonalSettings());
  const [hwFonts, setHwFonts] = useState<HwFont[]>([]);
  const [fontsLoading, setFontsLoading] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  /* Mailing address */
  const [address, setAddress] = useState<RecipientAddress>(() => ({
    line1: user?.mailingAddress?.line1 ?? "",
    line2: user?.mailingAddress?.line2 ?? "",
    city: user?.mailingAddress?.city ?? "",
    state: user?.mailingAddress?.state ?? "",
    zip: user?.mailingAddress?.zip ?? "",
  }));
  const [addressSaved, setAddressSaved] = useState(false);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    setFontsLoading(true);
    fetch("/api/handwrytten-fonts")
      .then(r => r.json())
      .then((d: { fonts?: HwFont[] }) => { if (d.fonts) setHwFonts(d.fonts); })
      .catch(() => {})
      .finally(() => setFontsLoading(false));
  }, []);

  function updateSettings<K extends keyof PersonalSettings>(key: K, val: PersonalSettings[K]) {
    setPersonalSettings(prev => {
      const next = { ...prev, [key]: val };
      savePersonalSettings(next);
      return next;
    });
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2500);
  }

  function toggleTiming(t: Timing) {
    setTimings((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
    setReminderSaved(false);
  }

  function handleSaveReminders() {
    setReminderSaved(true);
    setTimeout(() => setReminderSaved(false), 3000);
  }

  function saveMailingAddress() {
    updateMailingAddress(address);
    setAddressSaved(true);
    setTimeout(() => setAddressSaved(false), 3000);
  }

  function handleSignOut() {
    logout();
    setLocation("/");
  }

  return (
    <AppShell>
      <PageShell>
        <header style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: serif, fontSize: isMobile ? "1.75rem" : "2rem", fontWeight: 600, color: INK, margin: 0, lineHeight: 1.2 }}>
            Account
          </h1>
          <p style={{ fontSize: "0.95rem", color: MID, margin: "8px 0 0", lineHeight: 1.55 }}>
            Personalize how F.I. Forgot works for you.
          </p>
        </header>

        {(reminderSaved || prefsSaved || addressSaved) && (
          <div style={{
            marginBottom: 20, background: `${SAGE}10`, border: `1px solid ${SAGE}25`,
            color: SAGE, borderRadius: 14, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 10, fontSize: "0.88rem", fontWeight: 600,
          }}>
            <Check size={16} /> Saved — you're all set.
          </div>
        )}

        {/* Profile */}
        <AppSection card title="Your account" sub="The basics we use to keep your service personal.">
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", color: MID, textTransform: "uppercase" as const, marginBottom: 4 }}>
                Name
              </div>
              <div style={{ fontSize: "0.95rem", color: INK, fontWeight: 500 }}>{user?.name ?? "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", color: MID, textTransform: "uppercase" as const, marginBottom: 4 }}>
                Email
              </div>
              <div style={{ fontSize: "0.95rem", color: INK }}>{user?.email ?? "—"}</div>
            </div>
          </div>
        </AppSection>

        {/* Reminders */}
        <AppSection card
          title="How we reach you"
          sub="We'll only nudge you when something meaningful needs your attention."
          icon={<Bell size={18} />}
        >
          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: INK, margin: "0 0 10px" }}>Preferred channel</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 22 }}>
            {(["Text message", "Email", "Both"] as Channel[]).map((c) => (
              <OptionButton
                key={c}
                active={channel === c}
                onClick={() => { setChannel(c); setReminderSaved(false); }}
                testId={`button-channel-${c.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: channel === c ? RED : `${INK}06`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bell size={16} style={{ color: channel === c ? WHITE : MID }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: INK }}>{c}</div>
                  <div style={{ fontSize: "0.82rem", color: MID, marginTop: 2 }}>
                    {c === "Text message" && "A friendly text when something needs you."}
                    {c === "Email" && "A calm email when a card is ready."}
                    {c === "Both" && "We'll use whichever reaches you best."}
                  </div>
                </div>
              </OptionButton>
            ))}
          </div>

          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: INK, margin: "0 0 10px" }}>When to remind you</p>
          <p style={{ fontSize: "0.82rem", color: MID, margin: "0 0 12px", lineHeight: 1.5 }}>
            Choose one or more. We'll remind you at each interval you select.
          </p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 18 }}>
            {TIMINGS.map((t) => {
              const active = timings.has(t);
              return (
                <OptionButton
                  key={t}
                  active={active}
                  onClick={() => toggleTiming(t)}
                  testId={`button-timing-${t.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${active ? RED : BORDER}`,
                    background: active ? RED : WHITE,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {active && <Check size={12} style={{ color: WHITE }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: INK }}>{t}</div>
                    <div style={{ fontSize: "0.82rem", color: MID, marginTop: 2 }}>{TIMING_DESCRIPTIONS[t]}</div>
                  </div>
                </OptionButton>
              );
            })}
          </div>

          <p style={{
            fontSize: "0.82rem", color: MID, lineHeight: 1.55, margin: "0 0 18px",
            padding: "12px 14px", background: CREAM, borderRadius: 10,
          }}>
            We'll reach out gently at the times you choose — only when something needs your attention.
          </p>

          <span data-testid="button-save-settings" style={{ display: "block" }}>
            <PrimaryBtn
              onClick={handleSaveReminders}
              style={{ width: "100%", padding: "14px", borderRadius: 24, fontSize: "0.9rem", fontFamily: sans }}
            >
              Save reminder preferences
            </PrimaryBtn>
          </span>
        </AppSection>

        {/* Card handling */}
        <AppSection card
          title="How cards are handled"
          sub="You're always in control of what goes out."
          icon={<PenLine size={18} />}
        >
          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: INK, margin: "0 0 10px" }}>Before a card mails</p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 22 }}>
            {([
              { key: "approve" as const, label: "I'll review each card", sub: "You'll see every card before it goes out." },
              { key: "autopilot" as const, label: "Send when ready", sub: "We prepare cards and mail them on schedule." },
            ]).map(opt => (
              <OptionButton
                key={opt.key}
                active={personalSettings.automationMode === opt.key}
                onClick={() => updateSettings("automationMode", opt.key)}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: INK }}>{opt.label}</div>
                  <div style={{ fontSize: "0.82rem", color: MID, marginTop: 2 }}>{opt.sub}</div>
                </div>
              </OptionButton>
            ))}
          </div>

          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: INK, margin: "0 0 10px" }}>Default tone for new cards</p>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {TONES.map(tone => (
              <button
                key={tone}
                type="button"
                onClick={() => updateSettings("defaultTone", tone as Tone)}
                style={{
                  padding: "8px 16px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 600,
                  border: `1.5px solid ${personalSettings.defaultTone === tone ? RED : BORDER}`,
                  background: personalSettings.defaultTone === tone ? `${RED}08` : WHITE,
                  color: personalSettings.defaultTone === tone ? RED : INK,
                  cursor: "pointer", fontFamily: sans,
                }}
              >
                {tone}
              </button>
            ))}
          </div>
        </AppSection>

        {/* Handwriting */}
        <AppSection card
          title="Handwriting & signature"
          sub="How your cards are signed and handwritten."
          icon={<PenLine size={18} />}
        >
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: MID, marginBottom: 8 }}>
            Signed as
          </label>
          <input
            value={personalSettings.cardSignature ?? ""}
            onChange={e => updateSettings("cardSignature", e.target.value)}
            placeholder="e.g. Love, James"
            style={{
              width: "100%", border: `1px solid ${BORDER}`, borderRadius: 12,
              padding: "12px 14px", fontSize: "0.9rem", color: INK, outline: "none",
              fontFamily: sans, boxSizing: "border-box" as const, marginBottom: 20,
              background: CREAM,
            }}
          />

          <p style={{ fontSize: "0.78rem", fontWeight: 600, color: MID, margin: "0 0 12px" }}>Handwriting style</p>
          {fontsLoading ? (
            <p style={{ fontSize: "0.88rem", color: MID, textAlign: "center" as const, padding: "24px 0" }}>Loading styles…</p>
          ) : hwFonts.length === 0 ? (
            <p style={{ fontSize: "0.88rem", color: MID, lineHeight: 1.5 }}>
              Handwriting styles will appear here when connected.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {hwFonts.map((font, idx) => {
                const selected = personalSettings.cardFont === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => updateSettings("cardFont", font.id)}
                    style={{
                      border: `2px solid ${selected ? RED : BORDER}`, borderRadius: 12,
                      padding: "14px 16px", cursor: "pointer",
                      background: selected ? `${RED}06` : WHITE,
                      textAlign: "left" as const, fontFamily: sans,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: font.previewUrl ? 10 : 0 }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: INK }}>{font.name}</span>
                      {idx === 0 && (
                        <span style={{ fontSize: "0.65rem", background: `${INK}08`, color: MID, borderRadius: 20, padding: "2px 8px" }}>
                          Default
                        </span>
                      )}
                      {selected && (
                        <span style={{ fontSize: "0.65rem", background: RED, color: WHITE, borderRadius: 20, padding: "2px 8px" }}>
                          Selected
                        </span>
                      )}
                    </div>
                    {font.previewUrl ? (
                      <img src={font.previewUrl} alt={`${font.name} sample`} style={{ width: "100%", height: 120, objectFit: "contain" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div style={{ fontFamily: "cursive", fontSize: "1rem", color: MID }}>Warm wishes and heartfelt thanks!</div>
                    )}
                  </button>
                );
              })}
              {personalSettings.cardFont && (
                <button
                  type="button"
                  onClick={() => updateSettings("cardFont", "")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: MID, fontSize: "0.82rem", fontFamily: sans, textAlign: "left" as const, padding: "4px 0" }}
                >
                  Clear handwriting selection
                </button>
              )}
            </div>
          )}
        </AppSection>

        {/* Mailing address */}
        <AppSection card
          title="Where cards are mailed"
          sub="Your default return address for cards we send on your behalf."
          icon={<MapPin size={18} />}
        >
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            <input placeholder="Street address" value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
              style={inputStyle} />
            <input placeholder="Apt / Suite (optional)" value={address.line2 ?? ""} onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
              style={inputStyle} />
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 72px 100px", gap: 10 }}>
              <input placeholder="City" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} style={inputStyle} />
              <input placeholder="ST" maxLength={2} value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value.toUpperCase() }))} style={inputStyle} />
              <input placeholder="Zip" maxLength={10} value={address.zip} onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))} style={inputStyle} />
            </div>
            <PrimaryBtn onClick={saveMailingAddress} accent={SAGE}
              style={{ marginTop: 6, padding: "12px", borderRadius: 24, fontSize: "0.88rem", fontFamily: sans, width: "100%" }}>
              Save mailing address
            </PrimaryBtn>
          </div>
        </AppSection>

        {/* Plan */}
        <AppSection card
          title="Your plan"
          sub="Simple, transparent — change anytime."
          icon={<CreditCard size={18} />}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" as const }}>
            <div>
              <div style={{ fontFamily: serif, fontSize: "1.1rem", fontWeight: 600, color: INK, marginBottom: 4 }}>
                {planConfig.label}
              </div>
              <div style={{ fontSize: "0.88rem", color: MID, lineHeight: 1.5, marginBottom: 8 }}>
                {planConfig.tagline}
              </div>
              <div style={{ fontSize: "0.82rem", color: MID }}>
                {planConfig.maxRecipients === Infinity ? "Unlimited people" : `Up to ${planConfig.maxRecipients} people`}
                {!Number.isFinite(planConfig.maxCardsPerYear) ? null : (
                  <>
                    {" · "}
                    {planConfig.maxCardsPerYear} cards per year
                  </>
                )}
              </div>
              <div style={{ fontSize: "0.82rem", color: MID, marginTop: 6 }}>
                {getHandwrittenCardPriceLabel(hasConciergeMembership(plan))}
              </div>
            </div>
            <div style={{ fontFamily: serif, fontSize: "1.4rem", fontWeight: 600, color: INK, flexShrink: 0 }}>
              {resolvePlanDisplayPrice(plan)}
            </div>
          </div>
          <Link href="/subscribe">
            <PrimaryBtn variant="outline" accent={SAGE}
              style={{ marginTop: 18, width: "100%", padding: "12px", borderRadius: 24, fontSize: "0.88rem", fontFamily: sans }}>
              View or change plan
            </PrimaryBtn>
          </Link>
        </AppSection>

        {/* Sign out */}
        <AppSection card title="Sign out" sub="Leave your account on this device.">
          <SecondaryBtn onClick={handleSignOut} accent={RED} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <LogOut size={18} /> Sign out
          </SecondaryBtn>
        </AppSection>

      </PageShell>
    </AppShell>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: `1px solid ${BORDER}`,
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: "0.9rem",
  color: INK,
  outline: "none",
  fontFamily: sans,
  boxSizing: "border-box",
  background: CREAM,
};
