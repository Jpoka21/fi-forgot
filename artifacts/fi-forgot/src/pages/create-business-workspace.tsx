import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";

const RED = "#E23B2E";
const NAVY = "#0D1B35";
const WHITE = "#FFFFFF";

const BUSINESS_TYPES = [
  "Real Estate", "Mortgage", "Insurance",
  "Financial Advisor", "Attorney", "Medical", "Other",
];

export default function CreateBusinessWorkspacePage() {
  const { isLoggedIn, user, workspaces, createBusinessWorkspace, switchWorkspace, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nameErr, setNameErr] = useState("");

  useEffect(() => {
    if (!isLoggedIn) { setLocation("/business/signup"); return; }
    const existingBiz = workspaces.find(w => w.type === "business");
    if (existingBiz) { switchWorkspace(existingBiz.id); setLocation("/business/dashboard"); }
  }, [isLoggedIn, workspaces]);

  if (!isLoggedIn) return null;
  if (workspaces.find(w => w.type === "business")) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) { setNameErr("Business name is required"); return; }
    setNameErr("");
    setSubmitting(true);
    createBusinessWorkspace(businessName.trim(), businessType);
    setLocation("/business/dashboard");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", fontSize: "1rem",
    border: "1.5px solid #e2e8f0", borderRadius: 8,
    outline: "none", background: "#f8fafc", color: "#1a202c",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.78rem", fontWeight: 600,
    letterSpacing: "0.07em", textTransform: "uppercase", color: "#64748b", marginBottom: 6,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <nav style={{ background: "#0a1f3d", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 40px", height: 96, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/business" style={{ textDecoration: "none", display: "flex", alignItems: "baseline" }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.1rem", color: RED, fontStyle: "italic", marginRight: 6 }}>F*</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.1rem", color: WHITE, letterSpacing: "0.05em" }}>I FORGOT</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)", marginLeft: 10, alignSelf: "flex-end", paddingBottom: 6 }}>BUSINESS</span>
        </Link>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.1rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>
          Signed in as {user?.name}
        </span>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <div style={{ background: WHITE, borderRadius: 16, boxShadow: "0 4px 32px rgba(0,0,0,0.10)", padding: "40px" }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", background: "#eff6ff", borderRadius: 20, marginBottom: 16 }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#3b82f6", letterSpacing: "0.04em" }}>WELCOME BACK, {user?.name?.split(" ")[0].toUpperCase()}</span>
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", letterSpacing: "0.05em", color: NAVY, margin: 0, lineHeight: 1 }}>
                Set Up Your Business Workspace
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.92rem", marginTop: 8, lineHeight: 1.6 }}>
                Your existing account stays the same. We'll add a business workspace so you can manage client relationships separately.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Business Name *</label>
                <input
                  value={businessName}
                  onChange={e => { setBusinessName(e.target.value); setNameErr(""); }}
                  placeholder="Smith Realty Group"
                  style={inputStyle}
                  autoFocus
                />
                {nameErr && <p style={{ fontSize: "0.8rem", color: RED, marginTop: 4 }}>{nameErr}</p>}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>What type of business? <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                <select value={businessType} onChange={e => setBusinessType(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select one…</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* What this creates */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", marginBottom: 22 }}>
                <p style={{ margin: "0 0 8px", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8" }}>You'll get access to</p>
                {["Client relationship dashboard", "Automated birthday & holiday cards", "Client notes, tags & anniversaries"].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 900, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "0.88rem", color: "#475569" }}>{item}</span>
                  </div>
                ))}
              </div>

              <button type="submit" disabled={submitting} style={{
                width: "100%", padding: "14px",
                background: submitting ? "#94a3b8" : RED,
                color: WHITE, border: "none", borderRadius: 8,
                fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", letterSpacing: "0.1em",
                cursor: submitting ? "not-allowed" : "pointer",
              }}>
                {submitting ? "CREATING WORKSPACE…" : "CREATE BUSINESS WORKSPACE →"}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/dashboard" style={{ color: "#94a3b8", fontSize: "0.85rem", textDecoration: "underline" }}>
                ← Back to personal dashboard
              </Link>
              <button
                onClick={() => { logout(); setLocation("/business/signup"); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", fontSize: "0.82rem", textDecoration: "underline", padding: 0 }}
              >
                Not {user?.name?.split(" ")[0]}? Sign out and create a new account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
