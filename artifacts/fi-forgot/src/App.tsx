import { Component, ComponentType, ReactNode, useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation, useRoute } from "wouter";
import { StampDistressFilter } from "@/components/brand";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import PersonalAuthPage from "@/pages/personal-auth";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard";
import RecipientsPage from "@/pages/recipients";
import RecipientProfilePage from "@/pages/recipient-profile";
import CardGeneratorPage from "@/pages/card-generator";
import ReminderSettingsPage from "@/pages/reminder-settings";
import AdminPage from "@/pages/admin";
import BriefingPage from "@/pages/briefing";
import TryPage from "@/pages/try";
import SubscribePage from "@/pages/subscribe";
import CheckoutSuccessPage from "@/pages/checkout-success";
import DemoPreviewPage from "@/pages/demo-preview";
import BusinessPage from "@/pages/business";
import BusinessDemoPage from "@/pages/business-demo";
import SampleCardsPage from "@/pages/sample-cards";
import BusinessSignupPage from "@/pages/business-signup";
import BusinessLoginPage from "@/pages/business-login";
import BusinessDashboardPage from "@/pages/business-dashboard";
import CreateBusinessWorkspacePage from "@/pages/create-business-workspace";
import BusinessApprovePage from "@/pages/business-approve";
import CardPreviewPage from "@/pages/card-preview";
import CardFlowV2Page from "@/pages/card-flow-v2";
import CardsReviewPage from "@/pages/cards-review";
import BrowniePointsPage from "@/pages/brownie-points";
import PeoplePage from "@/pages/people";
import MomentsPage from "@/pages/moments";
import QuickCardPage from "@/pages/quick-card";
import RelationshipPage from "@/pages/relationship";
import { BrowniePointsProvider } from "@/lib/brownie-points-context";
import { BrowniePointsToast } from "@/components/BrowniePointsToast";

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

// ── Redirect /recipients/:id → /relationship/:id (keep ?edit=1 for edit form) ──
function RecipientProfileGate() {
  const [, params] = useRoute("/recipients/:id");
  const isEdit = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("edit") === "1";
  if (!isEdit && params?.id) return <Redirect to={`/relationship/${params.id}`} />;
  return <RecipientProfilePage />;
}

// ── Route guards ────────────────────────────────────────────────────────────
function ProtectedRoute({ component: Component }: { component: ComponentType }) {
  const { isLoggedIn, authReady, onboardingComplete } = useAuth();
  if (!authReady) return null;
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
      <Route path="/login">{() => <PersonalAuthPage initialMode="signin" />}</Route>
      <Route path="/signup">{() => <PersonalAuthPage initialMode="signup" />}</Route>
      <Route path="/onboarding" component={OnboardingRoute} />
      <Route path="/dashboard">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/recipients">
        <ProtectedRoute component={() => <Redirect to="/people" />} />
      </Route>
      <Route path="/recipients/:id">
        <ProtectedRoute component={RecipientProfileGate} />
      </Route>
      <Route path="/relationship/:id">
        <ProtectedRoute component={RelationshipPage} />
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
      <Route path="/cards/review">
        <ProtectedRoute component={CardsReviewPage} />
      </Route>
      <Route path="/brownie-points">
        <ProtectedRoute component={BrowniePointsPage} />
      </Route>
      <Route path="/people">
        <ProtectedRoute component={PeoplePage} />
      </Route>
      <Route path="/moments">
        <ProtectedRoute component={MomentsPage} />
      </Route>
      <Route path="/quick-card">
        <ProtectedRoute component={QuickCardPage} />
      </Route>
      <Route path="/settings/reminders">
        <ProtectedRoute component={ReminderSettingsPage} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={AdminPage} />
      </Route>
      <Route path="/try" component={CardFlowV2Page} />
      <Route path="/v2"><Redirect to="/try" /></Route>
      <Route path="/subscribe" component={SubscribePage} />
      <Route path="/checkout/success" component={CheckoutSuccessPage} />
      <Route path="/demo/:id" component={DemoPreviewPage} />
      <Route path="/business" component={BusinessPage} />
      <Route path="/business-demo" component={BusinessDemoPage} />
      <Route path="/business/sample-cards" component={SampleCardsPage} />
      <Route path="/business/signup" component={BusinessSignupPage} />
      <Route path="/business/login" component={BusinessLoginPage} />
      <Route path="/business/create-workspace" component={CreateBusinessWorkspacePage} />
      <Route path="/business/dashboard" component={BusinessDashboardPage} />
      <Route path="/business/approve/:token" component={BusinessApprovePage} />
      <Route path="/preview/:token" component={CardPreviewPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// ── Floating "Try it free" button ───────────────────────────────────────────
const HIDE_TRY_BUTTON_ON = ["/try", "/v2", "/subscribe", "/checkout", "/demo", "/dashboard", "/recipients", "/onboarding", "/cards", "/settings", "/admin", "/briefings", "/business", "/business-demo", "/brownie-points", "/people", "/moments", "/quick-card"];

function FloatingTryButton() {
  const [location] = useLocation();
  const [revealed, setRevealed] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768);

  useEffect(() => {
    if (typeof window === "undefined" || window.innerWidth >= 768) return;

    const onScroll = () => {
      setRevealed(window.scrollY >= 75);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(80px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        pointerEvents: revealed ? "auto" : "none",
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
        ✉ SEE HOW IT WORKS — FOR FREE
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
        <BrowniePointsProvider>
          <TooltipProvider>
            {/* Stamp SVG distress filter — injected once, referenced by all stamp components */}
            <StampDistressFilter />
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
              <FloatingTryButton />
            </WouterRouter>
            <Toaster />
            <BrowniePointsToast />
          </TooltipProvider>
        </BrowniePointsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
