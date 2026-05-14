import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { B, BrandLogo, RectStamp, StickyNote } from "@/components/brand";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: FormData) {
    login(data.email);
    setLocation("/dashboard");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: B.beige }}
    >
      {/* Background stamp watermarks */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "10%",
          left: "-2%",
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "18vw",
          color: B.red,
          opacity: 0.03,
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
          transform: "rotate(-8deg)",
        }}
      >
        "F"
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "8%",
          right: "-2%",
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "14vw",
          color: B.black,
          opacity: 0.03,
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
          transform: "rotate(6deg)",
        }}
      >
        FORGOT
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <BrandLogo size="md" variant="stamp" />
          </Link>
          <div className="mt-5 flex flex-col items-center gap-1">
            <h1
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "2rem",
                letterSpacing: "0.06em",
                color: B.black,
                lineHeight: 1,
              }}
            >
              Welcome Back
            </h1>
            <p
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "1rem",
                color: B.gray,
              }}
            >
              You actually remembered to sign in. Impressive.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div
          className="rounded-md shadow-lg"
          style={{
            background: B.white,
            border: `1.5px solid ${B.black}12`,
            borderTop: `4px solid ${B.red}`,
            padding: "clamp(24px, 5vw, 36px)",
          }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      style={{
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: "0.8rem",
                        letterSpacing: "0.14em",
                        color: B.black,
                        textTransform: "uppercase",
                      }}
                    >
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        data-testid="input-email"
                        style={{ borderColor: `${B.black}22`, background: B.beige }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      style={{
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: "0.8rem",
                        letterSpacing: "0.14em",
                        color: B.black,
                        textTransform: "uppercase",
                      }}
                    >
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        data-testid="input-password"
                        style={{ borderColor: `${B.black}22`, background: B.beige }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                className="w-full py-3 rounded-md font-bold transition-all hover:opacity-90 active:translate-y-0.5"
                style={{
                  background: B.red,
                  color: B.white,
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "1rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: `0 3px 0 ${B.redDark}, 0 6px 16px ${B.red}30`,
                }}
                data-testid="button-login-submit"
              >
                Sign In
              </button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: B.gray }}>
              Don't have an account?{" "}
              <Link
                href="/signup"
                style={{ color: B.red, fontWeight: 700, textDecoration: "underline" }}
                data-testid="link-goto-signup"
              >
                Get started
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom stamps + note */}
        <div className="mt-8 flex items-end justify-between px-2">
          <div className="flex flex-col gap-2">
            <RectStamp size="sm" rotate={-2}>Crisis Averted</RectStamp>
          </div>
          <StickyNote rotate={3} className="">
            Don't Forget<br />
            <span style={{ fontSize: "0.85rem" }}>(Again)</span>
          </StickyNote>
        </div>

        <p
          className="text-center text-xs mt-6 italic"
          style={{ color: `${B.black}35`, fontFamily: "'Caveat', cursive", fontSize: "0.9rem" }}
        >
          Demo mode — any email and password will work.
        </p>
      </div>
    </div>
  );
}
