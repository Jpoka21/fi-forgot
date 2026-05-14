import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { B } from "@/components/brand";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const perks = [
  { icon: "✉", text: "Cards written, mailed, and delivered on time" },
  { icon: "⏰", text: "Reminders before panic sets in" },
  { icon: "✓", text: "Approval flow so you're always in control" },
  { icon: "♥", text: "Cancel any time — no judgment" },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  function onSubmit(data: FormData) {
    signup(data.name, data.email);
    setLocation("/onboarding");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: B.beige }}
    >
      {/* Background watermark */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "5%",
          right: "-3%",
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "20vw",
          color: B.red,
          opacity: 0.025,
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
          transform: "rotate(8deg)",
        }}
      >
        SEND IT
      </div>

      <div className="w-full max-w-7xl relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* ── Left: Brand pitch ──────────────────────────────────────────── */}
          <div className="pt-2">
            <Link href="/" className="inline-block mb-12">
              <img src="/logo.png" alt="F* I Forgot" style={{ height: 100, width: "auto" }} />
            </Link>

            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "clamp(3.4rem, 7.8vw, 5.6rem)",
                letterSpacing: "0.04em",
                color: B.black,
                lineHeight: 1,
                marginBottom: 19,
              }}
            >
              Stop Winging It.<br />
              <span style={{ color: B.red }}>Start Looking Good.</span>
            </h1>

            <p
              style={{
                fontSize: "1.5625rem",
                color: B.gray,
                lineHeight: 1.7,
                marginBottom: 44,
                maxWidth: 625,
              }}
            >
              Join the men who stopped relying on last-minute gas station runs
              and started looking genuinely thoughtful — without doing any of
              the actual thinking.
            </p>

            <ul className="space-y-5 mb-12">
              {perks.map((p) => (
                <li key={p.text} className="flex items-start gap-4">
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: B.red,
                      color: B.white,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      fontWeight: 900,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {p.icon}
                  </span>
                  <span style={{ fontSize: "1.4rem", color: "#333", lineHeight: 1.5 }}>{p.text}</span>
                </li>
              ))}
            </ul>

            {/* Stamps decorations */}
            <div className="flex items-end gap-5 flex-wrap">
              <img src="/stamp-disaster-averted.png" alt="Disaster Averted" style={{ height: 140, width: "auto" }} />
              <img src="/stamp-date-locked-in.png" alt="Important Date Locked In" style={{ height: 140, width: "auto" }} />
              <img src="/sticky-note.png" alt="You forgot again, didn't you?" style={{ height: 258, width: "auto", transform: "rotate(-3deg)" }} />
            </div>
          </div>

          {/* ── Right: Form ────────────────────────────────────────────────── */}
          <div>
            <div
              className="rounded-md shadow-lg"
              style={{
                background: B.white,
                border: `1.5px solid ${B.black}12`,
                borderTop: `4px solid ${B.red}`,
                padding: "clamp(38px, 7.8vw, 56px)",
              }}
            >
              <h2
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "2.8rem",
                  letterSpacing: "0.06em",
                  color: B.black,
                  marginBottom: 31,
                  textTransform: "uppercase",
                }}
              >
                Create Your Account
              </h2>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
                  {[
                    { name: "name" as const,     type: "text",     placeholder: "Mike Thompson",     label: "Your Name" },
                    { name: "email" as const,    type: "email",    placeholder: "you@example.com",   label: "Email" },
                    { name: "password" as const, type: "password", placeholder: "••••••••",          label: "Password" },
                  ].map(({ name, type, placeholder, label }) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            style={{
                              fontFamily: "'Bebas Neue', cursive",
                              fontSize: "1.22rem",
                              letterSpacing: "0.14em",
                              color: B.black,
                              textTransform: "uppercase",
                            }}
                          >
                            {label}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type={type}
                              placeholder={placeholder}
                              data-testid={`input-${name}`}
                              style={{
                                borderColor: `${B.black}22`,
                                background: B.beige,
                                fontSize: "1.3rem",
                                padding: "13px 18px",
                                height: "auto",
                              }}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  <button
                    type="submit"
                    className="w-full rounded-md font-bold transition-all hover:opacity-90 active:translate-y-0.5"
                    style={{
                      background: B.red,
                      color: B.white,
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: "1.5625rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      border: "none",
                      cursor: "pointer",
                      padding: "19px 0",
                      boxShadow: `0 3px 0 ${B.redDark}, 0 6px 16px ${B.red}30`,
                    }}
                    data-testid="button-signup-submit"
                  >
                    Save Me From Myself
                  </button>
                </form>
              </Form>

              <p
                className="mt-6 text-center italic"
                style={{ color: B.black, fontFamily: "'Caveat', cursive", fontSize: "1.625rem" }}
              >
                By signing up, you agree that forgetting her birthday is not an option.
              </p>

              <div className="mt-6 text-center">
                <p style={{ fontSize: "1.25rem", color: B.gray }}>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    style={{ color: B.red, fontWeight: 700, textDecoration: "underline" }}
                    data-testid="link-goto-login"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Stamp badge below form */}
            <div className="mt-6 flex items-center px-1">
              <img src="/stamp-disaster-avoided.png" alt="Another Disaster Avoided" style={{ height: 138, width: "auto", transform: "rotate(-1deg)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
