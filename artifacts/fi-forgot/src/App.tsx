import { ComponentType } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard";
import RecipientsPage from "@/pages/recipients";
import RecipientProfilePage from "@/pages/recipient-profile";
import CardGeneratorPage from "@/pages/card-generator";
import ReminderSettingsPage from "@/pages/reminder-settings";
import AdminPage from "@/pages/admin";
import BriefingPage from "@/pages/briefing";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: ComponentType }) {
  const { isLoggedIn, onboardingComplete } = useAuth();
  if (!isLoggedIn) return <Redirect to="/login" />;
  if (!onboardingComplete) return <Redirect to="/onboarding" />;
  return <Component />;
}

function OnboardingRoute() {
  const { isLoggedIn, onboardingComplete } = useAuth();
  if (!isLoggedIn) return <Redirect to="/signup" />;
  if (onboardingComplete) return <Redirect to="/dashboard" />;
  return <OnboardingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/onboarding" component={OnboardingRoute} />
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/recipients">
        <ProtectedRoute component={RecipientsPage} />
      </Route>
      <Route path="/recipients/:id">
        <ProtectedRoute component={RecipientProfilePage} />
      </Route>
      <Route path="/briefings/:recipientId/:event">
        <ProtectedRoute component={BriefingPage} />
      </Route>
      <Route path="/briefings/:recipientId/:event/:briefingId">
        <ProtectedRoute component={BriefingPage} />
      </Route>
      <Route path="/cards/generate">
        <ProtectedRoute component={CardGeneratorPage} />
      </Route>
      <Route path="/settings/reminders">
        <ProtectedRoute component={ReminderSettingsPage} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={AdminPage} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
