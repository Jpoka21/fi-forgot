import type { ComponentType } from "react";
import { Redirect } from "wouter";
import { ProtectedLayoutShell } from "@/app/layouts/layoutShells";
import { ErrorBoundary } from "@/app/providers/ErrorBoundary";
import { ROUTE_PATHS } from "@/app/routes/routePaths";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
  component: ComponentType;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { isLoggedIn, authReady, onboardingComplete } = useAuth();

  if (!authReady) {
    return null;
  }

  if (!isLoggedIn) {
    return <Redirect to={ROUTE_PATHS.login} />;
  }

  if (!onboardingComplete) {
    return <Redirect to={ROUTE_PATHS.onboarding} />;
  }

  return (
    <ErrorBoundary>
      <ProtectedLayoutShell>
        <Component />
      </ProtectedLayoutShell>
    </ErrorBoundary>
  );
}
