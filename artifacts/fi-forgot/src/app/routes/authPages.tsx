import { PersonalAuthPage } from "@/app/routes/lazyPages";
import { PublicRoute } from "@/app/routes/PublicRoute";

export function SignInPage() {
  return (
    <PublicRoute>
      <PersonalAuthPage initialMode="signin" />
    </PublicRoute>
  );
}

export function SignUpPage() {
  return (
    <PublicRoute>
      <PersonalAuthPage initialMode="signup" />
    </PublicRoute>
  );
}
