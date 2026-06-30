import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { PB } from "@/lib/personal-brand";
import { SoftCard, PrimaryBtn } from "@/components/personal-ui";
import { Check, Heart, Mail, Shield } from "lucide-react";

// ── Schemas ───────────────────────────────────────────────────────────────────

const signupSchema = z.object({
  name:     z.string().min(1, "Name is required"),
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signinSchema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type SignupData = z.infer<typeof signupSchema>;
type SigninData = z.infer<typeof signinSchema>;

const perks = [
  { icon: Mail, text: "Handwritten cards, written and mailed for you" },
  { icon: Heart, text: "Gentle reminders before the moments that matter" },
  { icon: Shield, text: "You stay in control before anything is sent" },
  { icon: Check, text: "Cancel anytime — no contracts, no pressure" },
];

const serif = "'Lora', Georgia, serif";
const sans = "'Plus Jakarta Sans', sans-serif";

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  initialMode?: "signup" | "signin";
}

export default function PersonalAuthPage({ initialMode = "signup" }: Props) {
  const { signup, login } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);

  useEffect(() => {
    setLocation(mode === "signup" ? "/signup" : "/login", { replace: true });
  }, [mode]);

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  function onSignup(data: SignupData) {
    signup(data.name, data.email);
    setLocation("/onboarding");
  }

  const signinForm = useForm<SigninData>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSignin(data: SigninData) {
    login(data.email);
    setLocation("/dashboard");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: 12,
    border: `1px solid ${PB.border}`,
    background: PB.white,
    fontSize: "0.95rem",
    padding: "12px 14px",
    outline: "none",
    fontFamily: sans,
    color: PB.ink,
    boxSizing: "border-box",
    transition: "border-color 0.15s ease",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: sans,
    fontSize: "0.82rem",
    fontWeight: 600,
    color: PB.mid,
    marginBottom: 6,
  };

  const errStyle: React.CSSProperties = {
    fontSize: "0.82rem",
    color: PB.red,
    marginTop: 6,
    fontFamily: sans,
    lineHeight: 1.4,
  };

  const isSignup = mode === "signup";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: PB.cream,
        fontFamily: sans,
        color: PB.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px 48px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: 960 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 40,
          alignItems: "start",
        }}
          className="auth-layout-grid"
        >
          {/* ── Warm pitch — desktop only ─────────────────────────────────── */}
          <div className="auth-pitch" style={{ display: "none", paddingTop: 8 }}>
            <Link href="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: 32 }}>
              <div style={{ fontFamily: serif, fontSize: "1.35rem", fontWeight: 700, color: PB.ink, letterSpacing: "0.02em", lineHeight: 1.1 }}>
                F.I. FORGOT
              </div>
              <div style={{ fontFamily: sans, fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.16em", color: PB.mid, marginTop: 4 }}>
                RELATIONSHIP CONCIERGE
              </div>
            </Link>

            <h1 style={{
              fontFamily: serif,
              fontSize: "clamp(1.85rem, 4vw, 2.5rem)",
              fontWeight: 600,
              color: PB.ink,
              lineHeight: 1.2,
              margin: "0 0 16px",
            }}>
              Everything important is about to be taken care of.
            </h1>

            <p style={{
              fontSize: "1rem",
              color: PB.mid,
              lineHeight: 1.65,
              margin: "0 0 32px",
              maxWidth: 440,
            }}>
              Start with one person who matters. We&apos;ll help you remember the moments,
              write the cards, and handle the rest — calmly, in the background.
            </p>

            <div style={{ margin: "0 0 28px", width: "100%", maxWidth: 440, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src="/illustrations/auth/006_auth_relationship_hero.webp"
                alt="A warm still life of tied letters, a leather journal, and a framed photograph in soft afternoon light"
                style={{ width: "100%", height: "auto", maxHeight: 220, display: "block", objectFit: "contain" }}
              />
            </div>

            <ul style={{ listStyle: "none", margin: "0 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              {perks.map(({ icon: Icon, text }) => (
                <li key={text} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `${PB.sage}12`, color: PB.sage,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span style={{ fontSize: "0.92rem", color: PB.ink, lineHeight: 1.5, paddingTop: 6 }}>
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Form column ─────────────────────────────────────────────── */}
          <div style={{ width: "100%", maxWidth: 440, margin: "0 auto" }}>
            {/* Mobile brand */}
            <div className="auth-mobile-brand" style={{ textAlign: "center", marginBottom: 28 }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <div style={{ fontFamily: serif, fontSize: "1.2rem", fontWeight: 700, color: PB.ink, letterSpacing: "0.02em" }}>
                  F.I. FORGOT
                </div>
                <div style={{ fontFamily: sans, fontSize: "0.55rem", fontWeight: 600, letterSpacing: "0.16em", color: PB.mid, marginTop: 4 }}>
                  RELATIONSHIP CONCIERGE
                </div>
              </Link>
            </div>

            <SoftCard style={{ padding: "clamp(28px, 6vw, 36px)" }}>
              {/* Mode toggle */}
              <div style={{
                display: "flex",
                gap: 8,
                marginBottom: 24,
                padding: 4,
                background: `${PB.ink}04`,
                borderRadius: 24,
                border: `1px solid ${PB.border}`,
              }}>
                {(["signup", "signin"] as const).map(m => {
                  const active = mode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 20,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: sans,
                        fontSize: "0.88rem",
                        fontWeight: active ? 600 : 500,
                        color: active ? PB.ink : PB.mid,
                        background: active ? PB.white : "transparent",
                        boxShadow: active ? "0 1px 6px rgba(31,31,31,0.06)" : "none",
                        transition: "background 0.15s ease, color 0.15s ease",
                      }}
                    >
                      {m === "signup" ? "Get started" : "Sign in"}
                    </button>
                  );
                })}
              </div>

              {isSignup ? (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{
                      fontFamily: serif,
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: PB.ink,
                      margin: "0 0 8px",
                      lineHeight: 1.25,
                    }}>
                      Start with one person
                    </h2>
                    <p style={{ fontSize: "0.92rem", color: PB.mid, margin: 0, lineHeight: 1.55 }}>
                      We&apos;ll help you from there. No pressure, no complicated setup.
                    </p>
                  </div>

                  <form onSubmit={signupForm.handleSubmit(onSignup)} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div>
                      <label style={labelStyle} htmlFor="signup-name">Your name</label>
                      <input
                        {...signupForm.register("name")}
                        id="signup-name"
                        type="text"
                        placeholder="Mike Thompson"
                        data-testid="input-name"
                        style={inputStyle}
                        autoFocus
                      />
                      {signupForm.formState.errors.name && (
                        <p style={errStyle}>{signupForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="signup-email">Email</label>
                      <input
                        {...signupForm.register("email")}
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        data-testid="input-email"
                        style={inputStyle}
                      />
                      {signupForm.formState.errors.email && (
                        <p style={errStyle}>{signupForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="signup-password">Password</label>
                      <input
                        {...signupForm.register("password")}
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        data-testid="input-password"
                        style={inputStyle}
                      />
                      {signupForm.formState.errors.password && (
                        <p style={errStyle}>{signupForm.formState.errors.password.message}</p>
                      )}
                      <p style={{ fontSize: "0.8rem", color: PB.mid, margin: "8px 0 0", lineHeight: 1.45 }}>
                        At least 6 characters — that&apos;s all we need to get started.
                      </p>
                    </div>

                    <span data-testid="button-signup-submit" style={{ display: "block", marginTop: 4 }}>
                      <PrimaryBtn type="submit" style={{ width: "100%" }}>
                        Create my account
                      </PrimaryBtn>
                    </span>
                  </form>

                  <p style={{
                    fontSize: "0.82rem",
                    color: PB.mid,
                    textAlign: "center",
                    margin: "20px 0 0",
                    lineHeight: 1.55,
                  }}>
                    Your information stays private. You control every card — nothing is sent without your approval.
                  </p>

                  <div style={{ marginTop: 20, textAlign: "center" }}>
                    <p style={{ fontSize: "0.9rem", color: PB.mid, margin: 0 }}>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signin")}
                        style={{
                          color: PB.sage, fontWeight: 600, textDecoration: "underline",
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: "inherit", fontFamily: sans, padding: 0,
                        }}
                        data-testid="link-goto-login"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{
                      fontFamily: serif,
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: PB.ink,
                      margin: "0 0 8px",
                      lineHeight: 1.25,
                    }}>
                      Welcome back
                    </h2>
                    <p style={{ fontSize: "0.92rem", color: PB.mid, margin: 0, lineHeight: 1.55 }}>
                      Your people are waiting. Pick up where you left off.
                    </p>
                  </div>

                  <form onSubmit={signinForm.handleSubmit(onSignin)} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div>
                      <label style={labelStyle} htmlFor="signin-email">Email</label>
                      <input
                        {...signinForm.register("email")}
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        data-testid="input-email"
                        style={inputStyle}
                        autoFocus
                      />
                      {signinForm.formState.errors.email && (
                        <p style={errStyle}>{signinForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="signin-password">Password</label>
                      <input
                        {...signinForm.register("password")}
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        data-testid="input-password"
                        style={inputStyle}
                      />
                      {signinForm.formState.errors.password && (
                        <p style={errStyle}>{signinForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <span data-testid="button-login-submit" style={{ display: "block", marginTop: 4 }}>
                      <PrimaryBtn type="submit" style={{ width: "100%" }}>
                        Sign in
                      </PrimaryBtn>
                    </span>
                  </form>

                  {import.meta.env.DEV && (
                    <p style={{
                      fontSize: "0.82rem",
                      color: PB.mid,
                      textAlign: "center",
                      margin: "16px 0 0",
                      lineHeight: 1.5,
                    }}>
                      Development build — any email and password will work.
                    </p>
                  )}

                  <div style={{ marginTop: 20, textAlign: "center" }}>
                    <p style={{ fontSize: "0.9rem", color: PB.mid, margin: 0 }}>
                      New here?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        style={{
                          color: PB.sage, fontWeight: 600, textDecoration: "underline",
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: "inherit", fontFamily: sans, padding: 0,
                        }}
                        data-testid="link-goto-signup"
                      >
                        Get started
                      </button>
                    </p>
                  </div>
                </>
              )}
            </SoftCard>

            <p style={{
              textAlign: "center",
              fontSize: "0.82rem",
              color: PB.mid,
              marginTop: 20,
              lineHeight: 1.5,
            }}>
              <Link href="/" style={{ color: PB.sage, fontWeight: 600, textDecoration: "none" }}>
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .auth-layout-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 56px !important;
            align-items: center !important;
          }
          .auth-pitch {
            display: block !important;
          }
          .auth-mobile-brand {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
