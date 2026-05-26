import { useState, useEffect } from "react";
import { B } from "@/components/brand";
import { HOLIDAYS } from "@/lib/data";

const RELATIONSHIP_OPTIONS = [
  "Spouse / Partner",
  "Parent",
  "Child",
  "Sibling",
  "Friend",
  "Coworker",
  "Other",
];

const AGE_RANGE_OPTIONS = [
  "Young child (under 12)",
  "Teenager (13–17)",
  "Young adult (18–25)",
  "Adult (26+)",
];

const AGE_RANGE_RELATIONSHIPS = ["Child", "Parent", "Sibling"];

// Father's Day / Mother's Day only make sense when the recipient is a parent figure
// For the demo form, "Parent" covers Mom/Dad and "Spouse / Partner" covers Wife/Husband
const FATHERS_DAY_DEMO_RELS = ["Parent", "Spouse / Partner"];
const MOTHERS_DAY_DEMO_RELS = ["Parent", "Spouse / Partner"];

function availableDemoOccasions(relationship: string): string[] {
  return HOLIDAYS.filter(h => {
    if (h === "Father's Day" && !FATHERS_DAY_DEMO_RELS.includes(relationship)) return false;
    if (h === "Mother's Day" && !MOTHERS_DAY_DEMO_RELS.includes(relationship)) return false;
    return true;
  });
}

const PERSONALITY_OPTIONS = [
  "Sentimental & Heartfelt",
  "Funny & Witty",
  "Warm & Nurturing",
  "Down-to-Earth & Practical",
];

type Status = "idle" | "loading" | "success" | "error";

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontFamily: "'Bebas Neue', cursive",
  fontSize: "0.8rem",
  letterSpacing: "0.12em",
  color: B.red,
  marginBottom: 6,
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#1e1e1e",
  color: "#f0ece4",
  border: "1px solid #333",
  borderRadius: 6,
  padding: "13px 14px",
  fontSize: "1rem",
  fontFamily: "'Inter', Arial, sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  cursor: "pointer",
  paddingRight: 36,
};

function SelectField({ id, label, value, onChange, options, placeholder }: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} style={fieldLabel}>{label}</label>
      <div style={{ position: "relative" }}>
        <select id={id} value={value} onChange={e => onChange(e.target.value)} required style={selectStyle}>
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }}>▾</span>
      </div>
    </div>
  );
}

export function DemoFormSection() {
  const [form, setForm] = useState({
    email: "", recipientName: "", relationship: "",
    occasion: "", personality: "", ageRange: "", website: "",
  });
  const showAgeRange = AGE_RANGE_RELATIONSHIPS.includes(form.relationship);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const occasionOptions = availableDemoOccasions(form.relationship);

  // Clear occasion (and ageRange) whenever relationship changes and current values are no longer valid
  useEffect(() => {
    const updates: Partial<typeof form> = {};
    if (form.occasion && !availableDemoOccasions(form.relationship).includes(form.occasion)) {
      updates.occasion = "";
    }
    if (form.ageRange && !AGE_RANGE_RELATIONSHIPS.includes(form.relationship)) {
      updates.ageRange = "";
    }
    if (Object.keys(updates).length) setForm(f => ({ ...f, ...updates }));
  }, [form.relationship]); // eslint-disable-line react-hooks/exhaustive-deps

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.recipientName || !form.relationship || !form.occasion || !form.personality) {
      setStatus("error");
      setErrorMsg("Please fill in all fields.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/demo-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          recipientName: form.recipientName,
          relationship: form.relationship,
          occasion: form.occasion,
          personality: form.personality,
          ageRange: form.ageRange || undefined,
          honeypot: form.website,
        }),
      });
      const data = await res.json() as { message?: string; previewUrl?: string };
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.message ?? "Something went wrong. Try again in a minute.");
        return;
      }
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Try again in a minute.");
    }
  }

  return (
    <section style={{ background: B.black, padding: "72px 24px 80px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>

        <h1 style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "clamp(2.6rem, 7vw, 4rem)",
          color: "#ffffff",
          letterSpacing: "0.02em",
          lineHeight: 0.95,
          margin: "0 0 14px",
        }}>
          See how it works.
        </h1>

        <p style={{
          fontFamily: "'Inter', Arial, sans-serif",
          fontSize: "1rem",
          color: "rgba(255,255,255,0.6)",
          margin: "0 0 36px",
          lineHeight: 1.6,
        }}>
          One name. That's all we need. We'll handle the card, the words, and the mailing. You handle looking like you had this planned all along.
        </p>

        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 18 }}>📬</div>
            <p style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "1.8rem",
              color: "#ffffff",
              letterSpacing: "0.05em",
              margin: "0 0 12px",
            }}>Check your inbox.</p>
            <p style={{
              fontFamily: "'Inter', Arial, sans-serif",
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.6,
              margin: "0 0 16px",
            }}>
              We sent you a personalized sample card and broke down exactly how we made it.
            </p>
            <div style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: "12px 16px",
              fontFamily: "'Inter', Arial, sans-serif",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.5,
            }}>
              ⚠️ Don't see it? Check your <strong style={{ color: "rgba(255,255,255,0.75)" }}>spam or promotions folder</strong> — it probably landed there.
            </div>
            {previewUrl && (
              <div style={{ marginTop: 20 }}>
                <p style={{
                  fontFamily: "'Inter', Arial, sans-serif",
                  fontSize: "0.8rem",
                  color: "rgba(255,255,255,0.5)",
                  margin: "0 0 10px",
                }}>
                  Or skip the inbox — view your card now:
                </p>
                <a href={previewUrl} style={{
                  display: "block",
                  background: "#E23B2E",
                  color: "#fff",
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "1rem",
                  letterSpacing: "0.12em",
                  padding: "13px 20px",
                  borderRadius: 6,
                  textDecoration: "none",
                  textAlign: "center",
                }}>
                  VIEW YOUR CARD PREVIEW →
                </a>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <input type="text" name="website" value={form.website}
              onChange={e => set("website", e.target.value)}
              style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              <div>
                <label htmlFor="demo-email" style={fieldLabel}>Your Email Address</label>
                <input id="demo-email" type="email" value={form.email}
                  onChange={e => set("email", e.target.value)}
                  required placeholder="you@example.com" style={inputStyle} />
                <p style={{
                  fontFamily: "'Inter', Arial, sans-serif",
                  fontSize: "0.75rem",
                  color: "#666",
                  margin: "7px 0 0",
                  lineHeight: 1.5,
                }}>
                  ⚠️ Heads up — this will likely land in your spam folder. Check there first.
                </p>
              </div>

              <div>
                <label htmlFor="demo-name" style={fieldLabel}>Recipient's First Name</label>
                <input id="demo-name" type="text" value={form.recipientName}
                  onChange={e => set("recipientName", e.target.value)}
                  required placeholder="Sarah" maxLength={100} style={inputStyle} />
              </div>

              <SelectField id="demo-relationship" label="Your Relationship to Them"
                value={form.relationship} onChange={v => set("relationship", v)}
                options={RELATIONSHIP_OPTIONS} placeholder="Select a relationship…" />

              {showAgeRange && (
                <div>
                  <SelectField id="demo-age-range" label={`How old is ${form.recipientName || "them"}?`}
                    value={form.ageRange} onChange={v => set("ageRange", v)}
                    options={AGE_RANGE_OPTIONS} placeholder="Select an age range…" />
                  <p style={{
                    fontFamily: "'Inter', Arial, sans-serif",
                    fontSize: "0.75rem",
                    color: "#555",
                    margin: "7px 0 0",
                    lineHeight: 1.5,
                  }}>
                    Age changes everything — the AI writes very differently for a 6-year-old vs. a 32-year-old.
                  </p>
                </div>
              )}

              <SelectField id="demo-occasion" label="Upcoming Occasion"
                value={form.occasion} onChange={v => set("occasion", v)}
                options={occasionOptions} placeholder="Select an occasion…" />

              <SelectField id="demo-personality" label="How Would You Describe Them?"
                value={form.personality} onChange={v => set("personality", v)}
                options={PERSONALITY_OPTIONS} placeholder="Choose their personality…" />

              {status === "error" && errorMsg && (
                <div style={{
                  background: "rgba(226,59,46,0.12)", border: "1px solid rgba(226,59,46,0.3)",
                  borderRadius: 6, padding: "10px 14px",
                  fontFamily: "'Inter', Arial, sans-serif", fontSize: "0.9rem", color: "#ff7b70",
                }}>
                  {errorMsg}
                </div>
              )}

              <button type="submit" disabled={status === "loading"} style={{
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
                marginTop: 4,
              }}>
                {status === "loading" ? "Building your sample card…" : "Build My Sample Card"}
              </button>

              <p style={{
                fontFamily: "'Inter', Arial, sans-serif",
                fontSize: "0.75rem",
                color: "#444",
                textAlign: "center",
                lineHeight: 1.5,
                margin: 0,
              }}>
                This is a sample card only. Nothing gets printed or mailed.
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
