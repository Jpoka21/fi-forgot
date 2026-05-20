import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const NAVY = "#0D1B35";
const RED = "#C8102E";
const WHITE = "#FFFFFF";

const schema = z.object({
  name: z.string().min(1, "Full name is required"),
  businessName: z.string().min(1, "Business name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  businessType: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const BUSINESS_TYPES = [
  "Real Estate",
  "Mortgage",
  "Insurance",
  "Financial Advisor",
  "Attorney",
  "Medical",
  "Other",
];

function generateId() {
  return crypto.randomUUID();
}

export default function BusinessSignupPage() {
  const [, setLocation] = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", businessName: "", email: "", password: "", businessType: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  function onSubmit(data: FormData) {
    setSubmitting(true);
    const businessId = generateId();
    const profile = {
      businessId,
      name: data.name,
      businessName: data.businessName,
      email: data.email,
      businessType: data.businessType || "",
    };
    localStorage.setItem("fi_forgot_business", JSON.stringify(profile));
    setLocation("/business/dashboard");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    fontSize: "1rem",
    border: "1.5px solid #e2e8f0",
    borderRadius: 8,
    outline: "none",
    background: "#f8fafc",
    color: "#1a202c",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 600,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 6,
  };

  const fieldStyle: React.CSSProperties = { marginBottom: 18 };

  const errStyle: React.CSSProperties = {
    fontSize: "0.8rem",
    color: RED,
    marginTop: 4,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", flexDirection: "column" }}>
      {/* Top nav */}
      <header style={{
        background: NAVY, padding: "0 32px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/business" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: "'Bebas Neue', cursive", fontSize: "1.6rem",
            color: WHITE, letterSpacing: "0.05em",
          }}>
            <span style={{ color: RED }}>F*</span>I FORGOT
          </span>
          <span style={{
            fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.45)", textTransform: "uppercase", paddingBottom: 2,
          }}>FOR BUSINESS</span>
        </Link>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", margin: 0 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "underline" }}>Sign in</Link>
        </p>
      </header>

      {/* Main */}
      <main style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 20px",
      }}>
        <div style={{ width: "100%", maxWidth: 940, display: "flex", gap: 60, alignItems: "flex-start" }}>

          {/* Left: pitch */}
          <div style={{ flex: 1, minWidth: 0, display: "none" }} className="biz-signup-left">
            <h1 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(2.4rem, 4vw, 3.6rem)",
              color: NAVY, lineHeight: 1.08, marginBottom: 20,
            }}>
              Your Clients Will<br />
              <span style={{ color: RED }}>Never Feel Forgotten.</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#475569", lineHeight: 1.7, marginBottom: 32 }}>
              F* I Forgot automatically sends real handwritten cards to your clients
              at the right moment — birthdays, anniversaries, holidays — so you stay
              top of mind without lifting a finger.
            </p>
            {[
              "Real handwritten cards — not printed labels",
              "Automatically mailed at exactly the right time",
              "Optional approval before anything ships",
              "Built for real estate, mortgage, insurance & more",
            ].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%", background: RED,
                  color: WHITE, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 900, flexShrink: 0, marginTop: 2,
                }}>✓</span>
                <span style={{ color: "#334155", fontSize: "1rem", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Right: form card */}
          <div style={{
            flex: "0 0 460px", maxWidth: "100%",
            background: WHITE, borderRadius: 16,
            boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
            padding: "40px 40px 36px",
          }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "2rem", letterSpacing: "0.05em",
                color: NAVY, margin: 0, lineHeight: 1,
              }}>
                Create Your Account
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.92rem", marginTop: 6 }}>
                Free to start — no credit card required.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    {...register("name")}
                    placeholder="Jane Smith"
                    style={inputStyle}
                    autoFocus
                  />
                  {errors.name && <p style={errStyle}>{errors.name.message}</p>}
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Business Name *</label>
                  <input
                    {...register("businessName")}
                    placeholder="Smith Realty Group"
                    style={inputStyle}
                  />
                  {errors.businessName && <p style={errStyle}>{errors.businessName.message}</p>}
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Email *</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="jane@smithrealty.com"
                  style={inputStyle}
                />
                {errors.email && <p style={errStyle}>{errors.email.message}</p>}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Password *</label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  style={inputStyle}
                />
                {errors.password && <p style={errStyle}>{errors.password.message}</p>}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>What type of business? <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                <select
                  {...register("businessType")}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Select one…</option>
                  {BUSINESS_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%", padding: "14px",
                  background: submitting ? "#94a3b8" : RED,
                  color: WHITE, border: "none", borderRadius: 8,
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "1.15rem", letterSpacing: "0.1em",
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                  marginTop: 4,
                }}
              >
                {submitting ? "CREATING ACCOUNT…" : "START REMEMBERING CLIENTS →"}
              </button>
            </form>

            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", marginTop: 18 }}>
              By signing up, you agree to our terms of service.
            </p>

            <div style={{
              marginTop: 20, paddingTop: 20,
              borderTop: "1px solid #f1f5f9",
              textAlign: "center",
            }}>
              <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: RED, fontWeight: 600, textDecoration: "underline" }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
