import { useState } from "react";
import { B } from "@/components/brand";

const RECIPIENT_OPTIONS = ["Mom","Wife","Girlfriend","Fiancée","Dad","Husband","Boyfriend","Grandmother","Mother-in-law","Sister","Daughter","Friend","Other"];
const OCCASION_OPTIONS = ["Birthday","Anniversary","Mother's Day","Valentine's Day","Thank You","Apology","Just Because","Congratulations","I'm in trouble and need a card"];
const VIBE_OPTIONS = ["Funny","Sweet","Romantic","Heartfelt","Classy","Apologetic","Please don't make me sleep outside"];

type Status = "idle" | "loading" | "success" | "error";

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontFamily: "'Bebas Neue', cursive",
  fontSize: "0.85rem",
  letterSpacing: "0.1em",
  color: B.red,
  marginBottom: 6,
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  background: "#262626",
  color: "#f0ece4",
  border: "1px solid #3a3a3a",
  borderRadius: 6,
  padding: "12px 14px",
  fontSize: "0.95rem",
  fontFamily: "'Inter', Arial, sans-serif",
  appearance: "none" as const,
  cursor: "pointer",
  outline: "none",
};

const inputStyle: React.CSSProperties = {
  ...selectStyle,
  cursor: "text",
};

export function DemoFormSection() {
  const [form, setForm] = useState({
    recipientType: "",
    occasionType: "",
    vibe: "",
    personalDetail: "",
    email: "",
    marketingConsent: false,
    website: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.recipientType || !form.occasionType || !form.vibe) {
      setStatus("error");
      setErrorMsg("Dave skipped a step. Don't be Dave.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/demo-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientType: form.recipientType,
          occasionType: form.occasionType,
          vibe: form.vibe,
          personalDetail: form.personalDetail || null,
          email: form.email,
          marketingConsent: form.marketingConsent,
          honeypot: form.website,
        }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.message ?? "Something broke. Probably Dave. Try again in a minute.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something broke. Probably Dave. Try again in a minute.");
    }
  }

  return (
    <section
      id="send-yourself-the-save"
      style={{ background: B.black, padding: "80px 24px" }}
    >
      <div style={{ maxWidth: 660, margin: "0 auto" }}>

        {/* Section tag */}
        <div style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "0.8rem",
          letterSpacing: "0.2em",
          color: B.red,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span style={{ flex: 1, maxWidth: 48, height: 1, background: B.red, display: "inline-block" }} />
          SEND YOURSELF THE SAVE
          <span style={{ flex: 1, maxWidth: 48, height: 1, background: B.red, display: "inline-block" }} />
        </div>

        {/* Headline */}
        <h2 style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "clamp(2.4rem, 6vw, 4rem)",
          color: "#ffffff",
          letterSpacing: "0.02em",
          lineHeight: 0.95,
          margin: "0 0 16px",
        }}>
          Try the Email That Saves Your Ass
        </h2>

        {/* Subheadline */}
        <p style={{
          fontFamily: "'Inter', Arial, sans-serif",
          fontSize: "1.05rem",
          color: B.gray,
          margin: "0 0 12px",
          lineHeight: 1.5,
        }}>
          Let's fake-save you before you need the real thing.
        </p>

        {/* Body copy */}
        <p style={{
          fontFamily: "'Inter', Arial, sans-serif",
          fontSize: "0.95rem",
          color: "rgba(255,255,255,0.6)",
          margin: "0 0 32px",
          lineHeight: 1.6,
        }}>
          Answer a few quick questions and we'll send you a sample F.I. Forgot approval email.
          You'll see the card we picked, the message we wrote, and how you can approve it or fix it
          before anything gets mailed.
        </p>

        {/* Form card */}
        {status === "success" ? (
          <div style={{
            background: "#1a1a1a",
            borderRadius: 12,
            padding: "48px 36px",
            textAlign: "center",
            border: "1px solid #2e2e2e",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>📬</div>
            <div style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "1.8rem",
              color: "#ffffff",
              letterSpacing: "0.05em",
              marginBottom: 12,
            }}>
              Check your inbox.
            </div>
            <p style={{
              fontFamily: "'Inter', Arial, sans-serif",
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.6,
              margin: "0 0 10px",
            }}>
              We just sent you a fake emergency.
            </p>
            <p style={{
              fontFamily: "'Inter', Arial, sans-serif",
              fontSize: "0.9rem",
              color: B.gray,
              lineHeight: 1.5,
              margin: "0 0 8px",
            }}>
              Open it to see how F.I. Forgot picks the card, writes the message, and lets you approve
              or change everything before anything gets mailed.
            </p>
            <p style={{
              fontFamily: "'Inter', Arial, sans-serif",
              fontSize: "0.8rem",
              color: "#555",
              margin: 0,
              lineHeight: 1.5,
            }}>
              No actual moms, wives, girlfriends, anniversaries, or dinner reservations were harmed in this demo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Honeypot */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={e => set("website", e.target.value)}
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div style={{
              background: "#1a1a1a",
              borderRadius: 12,
              padding: "32px",
              border: "1px solid #2e2e2e",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}>

              {/* Field 1 */}
              <div>
                <label htmlFor="recipientType" style={fieldLabel}>
                  Who are we saving you from disappointing?
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    id="recipientType"
                    value={form.recipientType}
                    onChange={e => set("recipientType", e.target.value)}
                    required
                    style={selectStyle}
                  >
                    <option value="">Select someone…</option>
                    {RECIPIENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#666", pointerEvents: "none" }}>▾</span>
                </div>
              </div>

              {/* Field 2 */}
              <div>
                <label htmlFor="occasionType" style={fieldLabel}>
                  What are we pretending you remembered?
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    id="occasionType"
                    value={form.occasionType}
                    onChange={e => set("occasionType", e.target.value)}
                    required
                    style={selectStyle}
                  >
                    <option value="">Select an occasion…</option>
                    {OCCASION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#666", pointerEvents: "none" }}>▾</span>
                </div>
              </div>

              {/* Field 3 */}
              <div>
                <label htmlFor="vibe" style={fieldLabel}>
                  What vibe keeps you alive?
                </label>
                <div style={{ position: "relative" }}>
                  <select
                    id="vibe"
                    value={form.vibe}
                    onChange={e => set("vibe", e.target.value)}
                    required
                    style={selectStyle}
                  >
                    <option value="">Select a vibe…</option>
                    {VIBE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#666", pointerEvents: "none" }}>▾</span>
                </div>
              </div>

              {/* Field 4 — optional */}
              <div>
                <label htmlFor="personalDetail" style={{ ...fieldLabel, display: "flex", alignItems: "center", gap: 8 }}>
                  Got one detail we can weaponize?
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.7rem", color: "#555", fontWeight: 400, letterSpacing: 0, textTransform: "none" }}>optional</span>
                </label>
                <textarea
                  id="personalDetail"
                  value={form.personalDetail}
                  onChange={e => set("personalDetail", e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Inside joke, nickname, recent trip, favorite memory, or thing you forgot last year…"
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: 64,
                    lineHeight: 1.5,
                  }}
                />
              </div>

              {/* Field 5 — email */}
              <div>
                <label htmlFor="email" style={fieldLabel}>
                  Where should we send the fake emergency?
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  required
                  placeholder="Your email address"
                  style={inputStyle}
                />
              </div>

              {/* Field 6 — marketing consent */}
              <label style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  checked={form.marketingConsent}
                  onChange={e => set("marketingConsent", e.target.checked)}
                  style={{ marginTop: 3, accentColor: B.red, flexShrink: 0, width: 16, height: 16 }}
                />
                <span style={{
                  fontFamily: "'Inter', Arial, sans-serif",
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: 1.5,
                }}>
                  Also send me occasional reminders, offers, and relationship-saving propaganda.
                </span>
              </label>

              {/* Error */}
              {status === "error" && errorMsg && (
                <div style={{
                  background: "rgba(226,59,46,0.12)",
                  border: "1px solid rgba(226,59,46,0.3)",
                  borderRadius: 6,
                  padding: "10px 14px",
                  fontFamily: "'Inter', Arial, sans-serif",
                  fontSize: "0.9rem",
                  color: "#ff7b70",
                  lineHeight: 1.4,
                }}>
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  background: status === "loading" ? "#a02a20" : B.red,
                  color: "#ffffff",
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "1.1rem",
                  letterSpacing: "0.1em",
                  padding: "16px 24px",
                  borderRadius: 6,
                  border: "none",
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                  width: "100%",
                  transition: "background 0.15s",
                }}
              >
                {status === "loading" ? "Sending your fake emergency…" : "Send Me the Save"}
              </button>

              {/* Disclaimer under button */}
              <p style={{
                fontFamily: "'Inter', Arial, sans-serif",
                fontSize: "0.75rem",
                color: "#4a4a4a",
                textAlign: "center",
                lineHeight: 1.5,
                margin: 0,
              }}>
                This is a demo. No card will be printed, purchased, mailed, or sent to anyone.
                No girlfriend will be alerted. No mother-in-law will be notified. Dave remains the only casualty.
              </p>
            </div>
          </form>
        )}

        {/* Trust line */}
        <p style={{
          fontFamily: "'Inter', Arial, sans-serif",
          fontSize: "0.8rem",
          color: "#444",
          textAlign: "center",
          lineHeight: 1.5,
          margin: "16px 0 0",
        }}>
          We'll send the demo email you asked for. Marketing emails are optional. Being Dave is also optional.
        </p>

      </div>
    </section>
  );
}
