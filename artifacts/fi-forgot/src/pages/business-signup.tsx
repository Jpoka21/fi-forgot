import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const RED = "#E23B2E";
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
  "Real Estate", "Mortgage", "Insurance",
  "Financial Advisor", "Attorney", "Medical", "Other",
];

export default function BusinessSignupPage() {
  const { isLoggedIn, workspaces, businessSignup, createBusinessWorkspace } = useAuth();
  const [, setLocation] = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", businessName: "", email: "", password: "", businessType: "" },
  });

  // Already logged in: redirect to the right place
  useEffect(() => {
    if (isLoggedIn) {
      const hasBusiness = workspaces.some(w => w.type === "business");
      setLocation(hasBusiness ? "/business/dashboard" : "/business/create-workspace");
    }
  }, [isLoggedIn, workspaces]);

  if (isLoggedIn) return null;

  function onSubmit(data: FormData) {
    setSubmitting(true);
    businessSignup(data.name, data.email, data.businessName, data.businessType || "");
    setLocation("/business/dashboard");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", fontSize: "1rem",
    border: "1.5px solid #e2e8f0", borderRadius: 8,
    outline: "none", background: "#f8fafc", color: "#1a202c",
    boxSizing: "border-box", transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.78rem", fontWeight: 600,
    letterSpacing: "0.07em", textTransform: "uppercase",
    color: "#64748b", marginBottom: 6,
  };

  const errStyle: React.CSSProperties = { fontSize: "0.8rem", color: RED, marginTop: 4 };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", flexDirection: "column" }}>
      <style>{`
        .biz-su-desktop-nav { display: flex; }
        .biz-su-mobile-nav  { display: none; }
        @media (max-width: 767px) {
          .biz-su-desktop-nav { display: none; }
          .biz-su-mobile-nav  { display: block; }
        }
      `}</style>

      {/* ── Desktop nav ── */}
      <nav className="biz-su-desktop-nav sticky top-0 z-50 items-center justify-between"
        style={{ background: "#0a1f3d", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 40px", height: 96 }}>
        <Link href="/business" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.1rem", color: RED, fontStyle: "italic", marginRight: 6 }}>F*</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "3.1rem", color: WHITE, letterSpacing: "0.05em" }}>I FORGOT</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)", marginLeft: 10, alignSelf: "flex-end", paddingBottom: 6 }}>BUSINESS</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link href="/" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.56rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>Personal</Link>
          <Link href="/login" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.56rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>SIGN IN</Link>
        </div>
      </nav>

      {/* ── Mobile nav ── */}
      <nav className="biz-su-mobile-nav sticky top-0 z-50"
        style={{ background: "#0a1f3d", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px" }}>
          <Link href="/business" style={{ textDecoration: "none" }}>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1.4rem", color: WHITE, lineHeight: 0.95 }}>
              <span style={{ color: RED, fontStyle: "italic" }}>F*</span>{" "}I FORGOT
            </div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.38rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", marginTop: 1 }}>BUSINESS</div>
          </Link>
          <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
            style={{ background: "none", border: "none", padding: "6px 4px", cursor: "pointer", color: WHITE, display: "flex", alignItems: "center" }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div style={{ background: "#0a1f3d", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8px 0 12px" }}>
            <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: "block", fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)", padding: "9px 20px", textDecoration: "none" }}>← PERSONAL SITE</Link>
            <Link href="/login" onClick={() => setMenuOpen(false)} style={{ display: "block", fontFamily: "'Bebas Neue', cursive", fontSize: "0.95rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.6)", padding: "9px 20px", textDecoration: "none" }}>SIGN IN</Link>
          </div>
        )}
      </nav>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>
          <div style={{ background: WHITE, borderRadius: 16, boxShadow: "0 4px 32px rgba(0,0,0,0.10)", padding: "40px 40px 36px" }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2rem", letterSpacing: "0.05em", color: "#0D1B35", margin: 0, lineHeight: 1 }}>
                Create Your Account
              </h2>
              <p style={{ color: "#64748b", fontSize: "0.92rem", marginTop: 6 }}>Free to start — no credit card required.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Full Name *</label>
                  <input {...register("name")} placeholder="Jane Smith" style={inputStyle} autoFocus />
                  {errors.name && <p style={errStyle}>{errors.name.message}</p>}
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Business Name *</label>
                  <input {...register("businessName")} placeholder="Smith Realty Group" style={inputStyle} />
                  {errors.businessName && <p style={errStyle}>{errors.businessName.message}</p>}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Email *</label>
                <input {...register("email")} type="email" placeholder="jane@smithrealty.com" style={inputStyle} />
                {errors.email && <p style={errStyle}>{errors.email.message}</p>}
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Password *</label>
                <input {...register("password")} type="password" placeholder="••••••••" style={inputStyle} />
                {errors.password && <p style={errStyle}>{errors.password.message}</p>}
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>What type of business? <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
                <select {...register("businessType")} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select one…</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <button type="submit" disabled={submitting} style={{
                width: "100%", padding: "14px",
                background: submitting ? "#94a3b8" : RED,
                color: WHITE, border: "none", borderRadius: 8,
                fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem", letterSpacing: "0.1em",
                cursor: submitting ? "not-allowed" : "pointer", marginTop: 4,
              }}>
                {submitting ? "CREATING ACCOUNT…" : "START REMEMBERING CLIENTS →"}
              </button>
            </form>

            <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", marginTop: 18 }}>
              By signing up, you agree to our terms of service.
            </p>

            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
              <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
                Already have an account?{" "}
                <Link href="/business/login" style={{ color: RED, fontWeight: 600, textDecoration: "underline" }}>Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
