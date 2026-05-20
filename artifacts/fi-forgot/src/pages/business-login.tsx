import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";

const RED  = "#E23B2E";
const NAVY = "#0a1f3d";
const WHITE = "#FFFFFF";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function BusinessLoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: FormData) {
    login(data.email);
    try {
      const raw = localStorage.getItem("fi_forgot_workspaces");
      const ws = raw ? JSON.parse(raw) : [];
      const activeId = localStorage.getItem("fi_forgot_active_workspace");
      const active = ws.find((w: { id: string; type: string }) => w.id === activeId) ?? ws[0];
      if (active?.type === "business") {
        setLocation("/business/dashboard");
      } else if (ws.some((w: { type: string }) => w.type === "business")) {
        // Has a business workspace but it's not active — activate it
        const biz = ws.find((w: { type: string }) => w.type === "business");
        if (biz) {
          localStorage.setItem("fi_forgot_active_workspace", biz.id);
          setLocation("/business/dashboard");
        }
      } else {
        setLocation("/business/create-workspace");
      }
    } catch {
      setLocation("/business/create-workspace");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", fontSize: "1rem",
    border: "1.5px solid rgba(255,255,255,0.12)",
    borderRadius: 8, outline: "none",
    background: "rgba(255,255,255,0.07)",
    color: WHITE, boxSizing: "border-box",
    transition: "border-color 0.15s",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.75rem", fontWeight: 700,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: "rgba(255,255,255,0.5)", marginBottom: 7,
  };

  return (
    <div style={{ minHeight: "100vh", background: NAVY, display: "flex", flexDirection: "column" }}>

      {/* Nav */}
      <nav style={{ padding: "0 40px", height: 80, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/business" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 0 }}>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.4rem", color: RED, fontStyle: "italic", marginRight: 6 }}>F*</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.4rem", color: WHITE, letterSpacing: "0.05em" }}>I FORGOT</span>
          <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "0.85rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", marginLeft: 8, alignSelf: "flex-end", paddingBottom: 5 }}>BUSINESS</span>
        </Link>
        <Link href="/login" style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "1rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
          Personal sign in →
        </Link>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Header text */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: "2.8rem", letterSpacing: "0.06em", color: WHITE, margin: "0 0 8px", lineHeight: 1 }}>
              Welcome Back
            </h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.95rem", margin: 0 }}>
              Sign in to your business account
            </p>
          </div>

          {/* Form card */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1.5px solid rgba(255,255,255,0.09)",
            borderTop: `3px solid ${RED}`,
            borderRadius: 14,
            padding: "32px 32px 28px",
          }}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@yourcompany.com"
                  autoFocus
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
                {errors.email && <p style={{ color: RED, fontSize: "0.8rem", marginTop: 5 }}>{errors.email.message}</p>}
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={labelStyle}>Password</label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = "rgba(255,255,255,0.35)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
                {errors.password && <p style={{ color: RED, fontSize: "0.8rem", marginTop: 5 }}>{errors.password.message}</p>}
              </div>

              <button type="submit" style={{
                width: "100%", padding: "14px",
                background: RED, color: WHITE, border: "none", borderRadius: 8,
                fontFamily: "'Bebas Neue', cursive", fontSize: "1.15rem",
                letterSpacing: "0.12em", cursor: "pointer",
                boxShadow: `0 4px 16px ${RED}40`,
              }}>
                SIGN IN TO BUSINESS →
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20 }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.88rem" }}>
                Don't have an account?{" "}
                <Link href="/business/signup" style={{ color: RED, fontWeight: 700, textDecoration: "underline" }}>
                  Sign up free
                </Link>
              </p>
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, color: "rgba(255,255,255,0.2)", fontSize: "0.8rem", fontStyle: "italic" }}>
            Demo mode — any email and password will work.
          </p>
        </div>
      </main>
    </div>
  );
}
