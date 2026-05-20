import { Component, ComponentType, ReactNode } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { StampDistressFilter } from "@/components/brand";
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
import TryPage from "@/pages/try";
import DemoPreviewPage from "@/pages/demo-preview";
import BusinessPage from "@/pages/business";

const queryClient = new QueryClient();

// ── Error boundary ──────────────────────────────────────────────────────────
interface ErrorBoundaryState { hasError: boolean; error: Error | null }

class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 480, margin: "4rem auto", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "#071A33", marginBottom: "0.5rem" }}>Something went wrong</h2>
          <p style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{ background: "#E23B2E", color: "#fff", border: "none", borderRadius: 8, padding: "0.625rem 1.5rem", fontWeight: 700, cursor: "pointer" }}>
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Route guards ────────────────────────────────────────────────────────────
function ProtectedRoute({ component: Component }: { component: ComponentType }) {
  const { isLoggedIn, onboardingComplete } = useAuth();
  if (!isLoggedIn) return <Redirect to="/login" />;
  if (!onboardingComplete) return <Redirect to="/onboarding" />;
  return (
    <ErrorBoundary>
      <Component />
    </ErrorBoundary>
  );
}

function OnboardingRoute() {
  const { isLoggedIn, onboardingComplete } = useAuth();
  if (!isLoggedIn) return <Redirect to="/signup" />;
  if (onboardingComplete) return <Redirect to="/dashboard" />;
  return <OnboardingPage />;
}

// ── Router ──────────────────────────────────────────────────────────────────
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
      <Route path="/try" component={TryPage} />
      <Route path="/demo/:id" component={DemoPreviewPage} />
      <Route path="/business" component={BusinessPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// ── Floating "Try it free" button ───────────────────────────────────────────
const HIDE_TRY_BUTTON_ON = ["/try", "/demo", "/dashboard", "/recipients", "/onboarding", "/cards", "/settings", "/admin", "/briefings", "/business"];

function FloatingTryButton() {
  const [location] = useLocation();

  const hide = HIDE_TRY_BUTTON_ON.some(p => location === p || location.startsWith(p + "/"));
  if (hide) return null;

  return (
    <a
      href="/try"
      className="fi-try-btn"
      style={{
        position: "fixed",
        bottom: "max(28px, calc(env(safe-area-inset-bottom, 0px) + 18px))",
        right: 20,
        zIndex: 1000,
        background: "#E23B2E",
        color: "#ffffff",
        textDecoration: "none",
        borderRadius: 50,
        padding: "14px 26px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        whiteSpace: "nowrap",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        cursor: "pointer",
      }}
    >
      <span style={{
        fontFamily: "'Bebas Neue', cursive",
        fontSize: "1.25rem",
        letterSpacing: "0.14em",
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
        gap: 7,
      }}>
        ✉ DEMO FOR FREE
      </span>
      <span style={{
        fontSize: "0.6rem",
        letterSpacing: "0.1em",
        opacity: 0.82,
        fontFamily: "'Inter', sans-serif",
        textTransform: "uppercase",
        lineHeight: 1,
      }}>
        takes 2 min · no card needed
      </span>
    </a>
  );
}

// ── App root ────────────────────────────────────────────────────────────────
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {/* Stamp SVG distress filter — injected once, referenced by all stamp components */}
          <StampDistressFilter />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
            <FloatingTryButton />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
