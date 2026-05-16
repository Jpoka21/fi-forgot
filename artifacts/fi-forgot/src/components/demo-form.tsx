import { useState } from "react";
import { B } from "@/components/brand";

const RELATIONSHIP_OPTIONS = [
  "Spouse / Partner",
  "Parent",
  "Child",
  "Sibling",
  "Friend",
  "Coworker",
  "Other",
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

export function DemoFormSection() {
  const [form, setForm] = useState({ email: "", recipientName: "", relationship: "", website: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.recipientName || !form.relationship) {
      setStatus("error");
      setErrorMsg("Please fill in all three fields.");
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
          honeypot: form.website,
        }),
      });
      const data = await res.json() as { message?: string };
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.message ?? "Something went wrong. Try again in a minute.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Try again in a minute.");
    }
  }

  return (
    <section style={{ background: B.black, padding: "72px 24px 80px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>

        {/* Headline */}
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

        {/* Subtext */}
        <p style={{
          fontFamily: "'Inter', Arial, sans-serif",
          fontSize: "1rem",
          color: "rgba(255,255,255,0.6)",
          margin: "0 0 36px",
          lineHeight: 1.6,
        }}>
          Enter your email and who the card is for. We'll send you a sample card you can edit.
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
            }}>
              Check your inbox.
            </p>
            <p style={{
              fontFamily: "'Inter', Arial, sans-serif",
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.6,
              margin: 0,
            }}>
              We just sent you a sample card you can edit.
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

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Email */}
              <div>
                <label htmlFor="demo-email" style={fieldLabel}>Email Address</label>
                <input
                  id="demo-email"
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  required
                  placeholder="you@example.com"
                  style={inputStyle}
                />
              </div>

              {/* Recipient Name */}
              <div>
                <label htmlFor="demo-name" style={fieldLabel}>Recipient's Name</label>
                <input
                  id="demo-name"
                  type="text"
                  value={form.recipientName}
                  onChange={e => set("recipientName", e.target.value)}
                  required
                  placeholder="Sarah"
                  maxLength={100}
                  style={inputStyle}
                />
              </div>

              {/* Relationship */}
              <div>
                <label htmlFor="demo-relationship" style={fieldLabel}>Relationship</label>
                <div style={{ position: "relative" }}>
                  <select
                    id="demo-relationship"
                    value={form.relationship}
                    onChange={e => set("relationship", e.target.value)}
                    required
                    style={{ ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: 36 }}
                  >
                    <option value="">Select a relationship…</option>
                    {RELATIONSHIP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <span style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)", color: "#555", pointerEvents: "none",
                  }}>▾</span>
                </div>
              </div>

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
                  marginTop: 4,
                }}
              >
                {status === "loading" ? "Sending your demo…" : "Send Me the Demo"}
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
