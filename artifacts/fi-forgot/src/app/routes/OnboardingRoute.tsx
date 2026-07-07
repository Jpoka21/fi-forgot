import { Redirect } from "wouter";
import { OnboardingPage } from "@/app/routes/lazyPages";
import { useAuth } from "@/lib/auth-context";
import { ROUTE_PATHS } from "@/app/routes/routePaths";

export function OnboardingRoute() {
  const { isLoggedIn, onboardingComplete } = useAuth();

  if (!isLoggedIn) {
    return <Redirect to={ROUTE_PATHS.signup} />;
  }

  if (onboardingComplete) {
    return <Redirect to={ROUTE_PATHS.dashboard} />;
  }

  return <OnboardingPage />;
}
