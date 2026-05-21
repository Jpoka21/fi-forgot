import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { B } from "@/components/brand";

// ── Wrapping-paper background ─────────────────────────────────────────────────

const DAVE_IMAGES = [
  "sleeping_on_couch.png", "doghouse.png", "rain_dave.png", "missed_calls.png",
  "sad_dave.png", "broken_vase.png", "couch_sad.png", "wife_list.png",
  "fixing_chair.png", "flowers_store.png", "gas_station_flowers.png", "bbq_dave.png",
  "honey_can_we_talk.png", "pillow_dave.png", "forgot_to_mail.png", "sleeping_with_dog.png",
];

// Fixed rotations & offsets so the pattern looks hand-scattered but is deterministic
const TILE_META = [
   -8,  4, -3, 10,  -6,  2,  8, -12,
    5, -9,  7, -4,  12,  -2, -7,   6,
   -5,  9, -1,  8,  -10,  3,  6,  -8,
    4, -6, 11, -3,    7, -5,  2,  10,
];

function DaveBackground() {
  // Build a grid: 4 cols × 8 rows = 32 tiles, cycling through 16 images
  const tiles: { src: string; rot: number }[] = [];
  for (let i = 0; i < 32; i++) {
    tiles.push({ src: DAVE_IMAGES[i % DAVE_IMAGES.length], rot: TILE_META[i % TILE_META.length] });
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute", inset: 0,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridAutoRows: "1fr",
        gap: "0px",
        opacity: 0.12,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {tiles.map((t, i) => (
        <div
          key={i}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "8px",
          }}
        >
          <img
            src={`/dave/${t.src}`}
            alt=""
            draggable={false}
            style={{
              width: "90%", height: "90%", objectFit: "contain",
              transform: `rotate(${t.rot}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

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
  { icon: "✉", text: "Cards written, mailed, and delivered on time" },
  { icon: "⏰", text: "Reminders before panic sets in" },
  { icon: "✓", text: "Approval flow so you're always in control" },
  { icon: "♥", text: "Cancel any time — no judgment" },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  initialMode?: "signup" | "signin";
}

export default function PersonalAuthPage({ initialMode = "signup" }: Props) {
  const { signup, login } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);

  // Keep URL in sync with mode so direct links still work
  useEffect(() => {
    setLocation(mode === "signup" ? "/signup" : "/login", { replace: true });
  }, [mode]);

  // ── Sign-up form ──────────────────────────────────────────────────────────

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  function onSignup(data: SignupData) {
    signup(data.name, data.email);
    setLocation("/onboarding");
  }

  // ── Sign-in form ──────────────────────────────────────────────────────────

  const signinForm = useForm<SigninData>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSignin(data: SigninData) {
    login(data.email);
    try {
      const raw = localStorage.getItem("fi_forgot_workspaces");
      const ws = raw ? JSON.parse(raw) : [];
      const activeId = localStorage.getItem("fi_forgot_active_workspace");
      const active = ws.find((w: { id: string; type: string }) => w.id === activeId) ?? ws[0];
      setLocation(active?.type === "business" ? "/business/dashboard" : "/dashboard");
    } catch {
      setLocation("/dashboard");
    }
  }

  // ── Shared input style ────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    borderColor: `${B.black}22`,
    background: B.beige,
    fontSize: "1.17rem",
    padding: "12px 16px",
    height: "auto",
    width: "100%",
    borderRadius: 6,
    border: `1.5px solid ${B.black}22`,
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "'Bebas Neue', cursive",
    fontSize: "1.1rem",
    letterSpacing: "0.14em",
    color: B.black,
    textTransform: "uppercase",
    marginBottom: 6,
  };

  const errStyle: React.CSSProperties = {
    fontSize: "0.82rem",
    color: B.red,
    marginTop: 4,
  };

  const isSignup = mode === "signup";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: B.beige }}
    >
      <DaveBackground />

      <div className="w-full max-w-7xl relative z-10">
        <div className="grid md:grid-cols-2 gap-14 items-start">

          {/* ── Left: Brand pitch ─────────────────────────────────────────── */}
          <div className="pt-2">
            <Link href="/" className="inline-block mb-10">
              <img src="/logo.png" alt="F* I Forgot" style={{ height: 90, width: "auto" }} />
            </Link>

            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(3.06rem, 7vw, 5rem)",
                letterSpacing: "0.04em",
                color: B.black,
                lineHeight: 1,
                marginBottom: 17,
              }}
            >
              Stop Winging It.<br />
              <span style={{ color: B.red }}>Start Looking Good.</span>
            </h1>

            <p
              style={{
                fontSize: "1.4rem", color: B.gray,
                lineHeight: 1.7, marginBottom: 40, maxWidth: 562,
              }}
            >
              Join the men who stopped relying on last-minute gas station runs
              and started looking genuinely thoughtful — without doing any of
              the actual thinking.
            </p>

            <ul className="space-y-4 mb-10">
              {perks.map((p) => (
                <li key={p.text} className="flex items-start gap-4">
                  <span
                    style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: B.red, color: B.white,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem", fontWeight: 900, flexShrink: 0, marginTop: 1,
                    }}
                  >
                    {p.icon}
                  </span>
                  <span style={{ fontSize: "1.26rem", color: "#333", lineHeight: 1.5 }}>{p.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-end gap-5 flex-wrap">
              <img src="/stamp-disaster-averted.png" alt="Disaster Averted" style={{ height: 126, width: "auto" }} />
              <img src="/stamp-date-locked-in.png" alt="Important Date Locked In" style={{ height: 126, width: "auto" }} />
              <img src="/sticky-note.png" alt="You forgot again, didn't you?" style={{ height: 232, width: "auto", transform: "rotate(-3deg)" }} />
            </div>
          </div>

          {/* ── Right: Form card ──────────────────────────────────────────── */}
          <div>
            <div
              className="rounded-md shadow-lg"
              style={{
                background: B.white,
                border: `1.5px solid ${B.black}12`,
                borderTop: `4px solid ${B.red}`,
                padding: "clamp(34px, 7vw, 50px)",
              }}
            >
              {/* Mode toggle tabs */}
              <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: `2px solid ${B.black}10` }}>
                {(["signup", "signin"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      flex: 1, padding: "10px 0",
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "1.1rem", letterSpacing: "0.12em",
                      background: "none", border: "none", cursor: "pointer",
                      color: mode === m ? B.red : `${B.black}40`,
                      borderBottom: mode === m ? `2.5px solid ${B.red}` : "2.5px solid transparent",
                      marginBottom: -2,
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                  >
                    {m === "signup" ? "Create Account" : "Sign In"}
                  </button>
                ))}
              </div>

              {/* ── Sign-up form ── */}
              {isSignup && (
                <>
                  <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-5" noValidate>
                    <div>
                      <label style={labelStyle}>Your Name</label>
                      <input
                        {...signupForm.register("name")}
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
                      <label style={labelStyle}>Email</label>
                      <input
                        {...signupForm.register("email")}
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
                      <label style={labelStyle}>Password</label>
                      <input
                        {...signupForm.register("password")}
                        type="password"
                        placeholder="••••••••"
                        data-testid="input-password"
                        style={inputStyle}
                      />
                      {signupForm.formState.errors.password && (
                        <p style={errStyle}>{signupForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-md font-bold transition-all hover:opacity-90 active:translate-y-0.5"
                      style={{
                        background: B.red, color: B.white,
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: "1.4rem", letterSpacing: "0.16em",
                        border: "none", cursor: "pointer",
                        padding: "17px 0",
                        boxShadow: `0 3px 0 ${B.redDark}, 0 6px 16px ${B.red}30`,
                      }}
                      data-testid="button-signup-submit"
                    >
                      Save Me From Myself
                    </button>
                  </form>

                  <p
                    className="mt-5 text-center italic"
                    style={{ color: B.black, fontFamily: "'Caveat', cursive", fontSize: "1.46rem" }}
                  >
                    By signing up, you agree that forgetting her birthday is not an option.
                  </p>

                  <div className="mt-5 text-center">
                    <p style={{ fontSize: "1.125rem", color: B.gray }}>
                      Already have an account?{" "}
                      <button
                        onClick={() => setMode("signin")}
                        style={{ color: B.red, fontWeight: 700, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontSize: "inherit" }}
                        data-testid="link-goto-login"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </>
              )}

              {/* ── Sign-in form ── */}
              {!isSignup && (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <h2
                      style={{
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: "2rem", letterSpacing: "0.06em",
                        color: B.black, margin: "0 0 4px", lineHeight: 1,
                      }}
                    >
                      Welcome Back
                    </h2>
                    <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: B.gray, margin: 0 }}>
                      You actually remembered to sign in. Impressive.
                    </p>
                  </div>

                  <form onSubmit={signinForm.handleSubmit(onSignin)} className="space-y-5" noValidate>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input
                        {...signinForm.register("email")}
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
                      <label style={labelStyle}>Password</label>
                      <input
                        {...signinForm.register("password")}
                        type="password"
                        placeholder="••••••••"
                        data-testid="input-password"
                        style={inputStyle}
                      />
                      {signinForm.formState.errors.password && (
                        <p style={errStyle}>{signinForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-md font-bold transition-all hover:opacity-90 active:translate-y-0.5"
                      style={{
                        background: B.red, color: B.white,
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: "1rem", letterSpacing: "0.16em",
                        border: "none", cursor: "pointer",
                        boxShadow: `0 3px 0 ${B.redDark}, 0 6px 16px ${B.red}30`,
                      }}
                      data-testid="button-login-submit"
                    >
                      Sign In
                    </button>
                  </form>

                  <p
                    className="mt-5 text-center italic"
                    style={{ color: B.gray, fontFamily: "'Caveat', cursive", fontSize: "1rem" }}
                  >
                    Demo mode — any email and password will work.
                  </p>

                  <div className="mt-4 text-center">
                    <p style={{ fontSize: "1.125rem", color: B.gray }}>
                      Don't have an account?{" "}
                      <button
                        onClick={() => setMode("signup")}
                        style={{ color: B.red, fontWeight: 700, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontSize: "inherit" }}
                        data-testid="link-goto-signup"
                      >
                        Get started
                      </button>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Stamp badge below form */}
            <div className="mt-5 flex items-center px-1">
              <img src="/stamp-disaster-avoided.png" alt="Another Disaster Avoided" style={{ height: 124, width: "auto", transform: "rotate(-1deg)" }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
