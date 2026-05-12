import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const perks = [
  "Cards written, mailed, and delivered on time",
  "Reminders before panic sets in",
  "Approval flow so you're always in control",
  "Cancel any time — no judgment",
];

export default function SignupPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  function onSubmit(data: FormData) {
    login(data.email);
    setLocation("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[hsl(221,47%,20%)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center">
        {/* Left column */}
        <div className="text-white">
          <Link href="/" className="inline-block mb-8">
            <div className="font-serif text-3xl font-bold text-[hsl(46,65%,52%)]">F.I. Forgot</div>
          </Link>
          <h1 className="font-serif text-4xl font-bold mb-4 leading-tight">
            Stop winging it.<br />Start looking good.
          </h1>
          <p className="text-white/60 text-lg mb-8 leading-relaxed">
            Join the men who stopped relying on last-minute gas station runs and started looking
            genuinely thoughtful — without doing any of the actual thinking.
          </p>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[hsl(46,65%,52%)] mt-0.5 shrink-0" />
                <span className="text-white/75 text-sm">{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-white/30 text-sm italic">
            Your future self owes us one.
          </p>
        </div>

        {/* Right column */}
        <div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="font-serif text-2xl font-bold text-[hsl(221,47%,20%)] mb-6">
              Create your account
            </h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mike Thompson" data-testid="input-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          data-testid="input-email"
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          data-testid="input-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-[hsl(6,64%,46%)] hover:bg-[hsl(6,64%,40%)] text-white font-bold py-3 rounded-xl text-base"
                  data-testid="button-signup-submit"
                >
                  Save Me From Myself
                </Button>
              </form>
            </Form>
            <p className="mt-4 text-xs text-[hsl(221,20%,60%)] text-center">
              By signing up, you agree that forgetting her birthday is not an option.
            </p>
            <div className="mt-4 text-center">
              <p className="text-sm text-[hsl(221,20%,50%)]">
                Already have an account?{" "}
                <Link href="/login" className="text-[hsl(221,47%,30%)] font-semibold hover:underline" data-testid="link-goto-login">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          <p className="text-center text-white/30 text-xs mt-4 italic">
            Demo mode — no real account is created.
          </p>
        </div>
      </div>
    </div>
  );
}
