import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-[hsl(221,47%,20%)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="font-serif text-3xl font-bold text-[hsl(46,65%,52%)]">F.I. Forgot</div>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-white mt-4 mb-2">Welcome back</h1>
          <p className="text-white/50 text-sm">You actually remembered to sign in. Impressive.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                data-testid="button-login-submit"
              >
                Sign in
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[hsl(221,20%,50%)]">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[hsl(221,47%,30%)] font-semibold hover:underline" data-testid="link-goto-signup">
                Get started
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-6 italic">
          Demo mode — any email and password will work.
        </p>
      </div>
    </div>
  );
}
