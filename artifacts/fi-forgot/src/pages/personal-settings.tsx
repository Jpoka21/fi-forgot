import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  getPersonalSettings, savePersonalSettings, PersonalSettings,
  TONES, PREVIEW_DAYS_OPTIONS, Tone, PreviewDays,
} from "@/lib/data";
import { Check, Rocket, HandMetal, ChevronLeft } from "lucide-react";

const BEIGE = "#F2E6D3";
const RED   = "#E23B2E";
const BLACK = "#111111";
const WHITE = "#FFFFFF";
const GRAY  = "#6B6B6B";

const TONE_LABELS: Record<Tone, { emoji: string; description: string }> = {
  Sweet:          { emoji: "🥰", description: "Warm and loving. Makes them feel seen." },
  Funny:          { emoji: "😂", description: "Gets a laugh. Still clearly heartfelt." },
  Romantic:       { emoji: "❤️",  description: "For the person who matters most." },
  Simple:         { emoji: "✉️",  description: "Clean and direct. Nothing fussy." },
  Religious:      { emoji: "🙏", description: "Faith-centered and sincere." },
  "From the kids":{ emoji: "👶", description: "Written as if your kids are signing it." },
  "Apology style":{ emoji: "😬", description: "When you're late and you know it." },
};

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.12em", color: BLACK }}>
        {title}
      </div>
      {subtitle && <div style={{ fontSize: "0.78rem", color: GRAY, marginTop: 3, lineHeight: 1.4 }}>{subtitle}</div>}
    </div>
  );
}

export default function PersonalSettingsPage() {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState<PersonalSettings>(() => getPersonalSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.email && !settings.notifyEmail) {
      setSettings(prev => ({ ...prev, notifyEmail: user.email ?? "" }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  function update<K extends keyof PersonalSettings>(key: K, val: PersonalSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  }

  function handleSave() {
    savePersonalSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? "?").toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: WHITE, display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <header style={{
        background: BEIGE, height: 96, flexShrink: 0,
        borderBottom: `1px solid ${BLACK}12`,
        display: "flex", alignItems: "center", padding: "0 28px",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", flexDirection: "column", marginRight: 40, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 0, lineHeight: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.6rem", color: RED, fontStyle: "italic", letterSpacing: "0.01em" }}>F*</span>
            <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.6rem", color: BLACK, letterSpacing: "0.04em", marginLeft: 8 }}>I FORGOT</span>
          </div>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.72rem", letterSpacing: "0.22em", color: GRAY, marginTop: -2, fontWeight: 900 }}>
            RELATIONSHIP DAMAGE CONTROL
          </div>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}>
          {[
            { label: "RECIPIENTS", href: "/recipients" },
            { label: "SETTINGS",   href: "/settings" },
            { label: "PLANS",      href: "/signup" },
          ].map(link => (
            <Link key={link.href} href={link.href}
              style={{
                fontFamily: "'Bebas Neue', cursive", fontSize: "1.35rem", letterSpacing: "0.1em",
                color: link.href === "/settings" ? RED : BLACK,
                textDecoration: "none", padding: "0 18px", whiteSpace: "nowrap",
                borderBottom: link.href === "/settings" ? `2px solid ${RED}` : "2px solid transparent",
                paddingBottom: 2,
              }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: RED, color: WHITE,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.05em",
            cursor: "pointer",
          }} onClick={logout}>
            {initials}
          </div>
        </div>
      </header>

      {/* ── Page body ── */}
      <div style={{ flex: 1, padding: "32px 28px 64px", maxWidth: 760, width: "100%" }}>

        {/* Back + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 5, textDecoration: "none", color: GRAY, fontSize: "0.78rem", fontWeight: 600 }}>
            <ChevronLeft size={14} /> Dashboard
          </Link>
          <span style={{ color: `${BLACK}30` }}>·</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.5rem", letterSpacing: "0.08em", color: BLACK }}>
            PERSONAL SETTINGS
          </span>
        </div>

        {saved && (
          <div style={{
            marginBottom: 20, background: "#f0fdf4", border: "1.5px solid #22c55e30",
            borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", gap: 8,
            fontSize: "0.85rem", fontWeight: 700, color: "#16a34a",
          }}>
            <Check size={15} style={{ color: "#16a34a" }} />
            Settings saved.
          </div>
        )}

        {/* ── Automation Mode ── */}
        <div style={{ background: WHITE, border: `1.5px solid ${BLACK}12`, borderRadius: 16, padding: "24px 24px 20px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <SectionHeader
            title="Automation Mode"
            subtitle="How much do you want to be involved? You can change this any time."
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {([
              {
                key: "autopilot" as const,
                icon: <Rocket size={22} style={{ color: settings.automationMode === "autopilot" ? WHITE : GRAY }} />,
                title: "Full Autopilot",
                desc: "We write, design, and mail every card automatically. No action needed from you.",
              },
              {
                key: "approve" as const,
                icon: <HandMetal size={22} style={{ color: settings.automationMode === "approve" ? WHITE : GRAY }} />,
                title: "Review & Approve",
                desc: "We queue the card and notify you. You review and approve before anything ships.",
                badge: "RECOMMENDED",
              },
            ]).map(({ key, icon, title, desc, badge }) => {
              const active = settings.automationMode === key;
              return (
                <button key={key} onClick={() => update("automationMode", key)} style={{
                  textAlign: "left", padding: "18px 20px", borderRadius: 12, cursor: "pointer",
                  border: `2px solid ${active ? RED : `${BLACK}18`}`,
                  background: active ? RED : WHITE,
                  transition: "all 0.15s",
                }}>
                  <div style={{ marginBottom: 10 }}>{icon}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: active ? WHITE : BLACK }}>{title}</div>
                    {badge && (
                      <span style={{
                        fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.1em",
                        background: active ? `${WHITE}25` : "#22c55e",
                        color: active ? WHITE : WHITE,
                        borderRadius: 4, padding: "2px 6px",
                      }}>
                        {badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: active ? `${WHITE}CC` : GRAY, lineHeight: 1.45 }}>{desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Default Tone ── */}
        <div style={{ background: WHITE, border: `1.5px solid ${BLACK}12`, borderRadius: 16, padding: "24px 24px 20px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <SectionHeader
            title="Default Card Tone"
            subtitle="The vibe we aim for when writing cards. You can override this per recipient."
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TONES.map(tone => {
              const active = settings.defaultTone === tone;
              const meta = TONE_LABELS[tone];
              return (
                <button key={tone} onClick={() => update("defaultTone", tone as Tone)} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 16px", borderRadius: 22, cursor: "pointer",
                  border: `2px solid ${active ? RED : `${BLACK}18`}`,
                  background: active ? RED : WHITE,
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.15s",
                }}>
                  <span style={{ fontSize: "1rem" }}>{meta.emoji}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: active ? WHITE : BLACK }}>{tone}</span>
                </button>
              );
            })}
          </div>
          {settings.defaultTone && (
            <div style={{ marginTop: 12, fontSize: "0.78rem", color: GRAY, fontStyle: "italic" }}>
              {TONE_LABELS[settings.defaultTone]?.description}
            </div>
          )}
        </div>

        {/* ── Card Signature ── */}
        <div style={{ background: WHITE, border: `1.5px solid ${BLACK}12`, borderRadius: 16, padding: "24px 24px 20px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <SectionHeader
            title="Card Signature"
            subtitle="We'll close every card with this. Usually something like 'Love, James' or 'With love, Dad'."
          />
          <input
            type="text"
            value={settings.cardSignature}
            onChange={e => update("cardSignature", e.target.value)}
            placeholder="e.g. Love, James"
            style={{
              width: "100%", padding: "10px 14px", fontSize: "0.9rem",
              border: `1.5px solid ${BLACK}18`, borderRadius: 10, outline: "none",
              fontFamily: "'Inter', sans-serif", color: BLACK, background: BEIGE,
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* ── Draft Lead Time ── */}
        <div style={{ background: WHITE, border: `1.5px solid ${BLACK}12`, borderRadius: 16, padding: "24px 24px 20px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <SectionHeader
            title="How Early to Draft Cards"
            subtitle="Cards are mailed ~7 days before the occasion. These intervals are before the card leaves — not before the occasion itself."
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PREVIEW_DAYS_OPTIONS.map(opt => {
              const active = settings.previewDays === opt.days;
              return (
                <button key={opt.days} onClick={() => update("previewDays", opt.days as PreviewDays)} style={{
                  textAlign: "left", padding: "14px 18px", borderRadius: 12, cursor: "pointer",
                  border: `2px solid ${active ? RED : `${BLACK}14`}`,
                  background: active ? `${RED}06` : WHITE,
                  display: "flex", alignItems: "flex-start", gap: 14,
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.15s",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                    border: `2px solid ${active ? RED : `${BLACK}25`}`,
                    background: active ? RED : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {active && <Check size={11} style={{ color: WHITE }} />}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: active ? RED : BLACK }}>{opt.label}</span>
                      {opt.badge && (
                        <span style={{
                          fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.1em",
                          background: "#22c55e", color: WHITE, borderRadius: 4, padding: "2px 6px",
                        }}>
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: GRAY, marginTop: 3, lineHeight: 1.4 }}>{opt.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Notification Channel ── */}
        <div style={{ background: WHITE, border: `1.5px solid ${BLACK}12`, borderRadius: 16, padding: "24px 24px 20px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <SectionHeader
            title="How to Notify You"
            subtitle="How do you want to hear from us when a card draft is ready?"
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {([
              { key: "email" as const,  label: "✉ Email" },
              { key: "text"  as const,  label: "💬 Text" },
              { key: "both"  as const,  label: "⚡ Both" },
            ]).map(({ key, label }) => {
              const active = settings.notifyChannel === key;
              return (
                <button key={key} onClick={() => update("notifyChannel", key)} style={{
                  padding: "9px 20px", borderRadius: 22, cursor: "pointer",
                  border: `2px solid ${active ? RED : `${BLACK}18`}`,
                  background: active ? RED : WHITE,
                  fontWeight: 700, fontSize: "0.82rem",
                  color: active ? WHITE : BLACK,
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.15s",
                }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Contact Email ── */}
        <div style={{ background: WHITE, border: `1.5px solid ${BLACK}12`, borderRadius: 16, padding: "24px 24px 20px", marginBottom: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <SectionHeader
            title="Where to Reach You"
            subtitle="We'll send draft notifications and order updates here."
          />
          <input
            type="email"
            value={settings.notifyEmail}
            onChange={e => update("notifyEmail", e.target.value)}
            placeholder="you@example.com"
            style={{
              width: "100%", padding: "10px 14px", fontSize: "0.9rem",
              border: `1.5px solid ${BLACK}18`, borderRadius: 10, outline: "none",
              fontFamily: "'Inter', sans-serif", color: BLACK, background: BEIGE,
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          style={{
            width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
            background: RED, color: WHITE, cursor: "pointer",
            fontFamily: "'Bebas Neue', cursive", fontSize: "1.2rem", letterSpacing: "0.1em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
          {saved ? <><Check size={16} /> Saved</> : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
