import { Redirect, Route, Switch } from "wouter";
import { SignInPage, SignUpPage } from "@/app/routes/authPages";
import {
  AdminPage,
  AccountSettingsPage,
  BillingSettingsPage,
  RelationshipPreferencesPage,
  NotificationsPage,
  SearchPage,
  ConciergePage,
  SystemVerificationPage,
  BrainPlaygroundPage,
  LaunchReadinessPage,
  StudioCollectionsPage,
  StudioCollectionDetailPage,
  BriefingPage,
  BusinessApprovePage,
  BusinessDashboardPage,
  BusinessDemoPage,
  BusinessLoginPage,
  BusinessPage,
  BusinessSignupPage,
  CardFlowV2Page,
  CardGeneratorPage,
  CardPreviewPage,
  CardsReviewPage,
  CheckoutSuccessPage,
  CreateBusinessWorkspacePage,
  DashboardPage,
  DemoPreviewPage,
  LandingPage,
  MomentsPage,
  AutopilotPage,
  NotFoundPage,
  PeoplePage,
  QuickCardPage,
  RelationshipPage,
  ReminderSettingsPage,
  SampleCardsPage,
  SubscribePage,
} from "@/app/routes/lazyPages";
import { OnboardingRoute } from "@/app/routes/OnboardingRoute";
import { ProtectedRoute } from "@/app/routes/ProtectedRoute";
import { PublicRoute } from "@/app/routes/PublicRoute";
import { RecipientProfileGate } from "@/app/routes/RecipientProfileGate";
import { RouteErrorPage } from "@/app/routes/RouteErrorPage";
import { ROUTE_PATHS, ROUTE_REDIRECTS } from "@/app/routes/routePaths";

function RecipientsIndexRedirect() {
  return <Redirect to={ROUTE_REDIRECTS.recipientsToPeople.to} />;
}

export function AppRoutes() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={ROUTE_PATHS.home}>
        <PublicRoute component={LandingPage} />
      </Route>
      <Route path={ROUTE_PATHS.login} component={SignInPage} />
      <Route path={ROUTE_PATHS.signup} component={SignUpPage} />
      <Route path={ROUTE_PATHS.try}>
        <PublicRoute component={CardFlowV2Page} />
      </Route>
      <Route path={ROUTE_PATHS.subscribe}>
        <PublicRoute component={SubscribePage} />
      </Route>
      <Route path={ROUTE_PATHS.checkoutSuccess}>
        <PublicRoute component={CheckoutSuccessPage} />
      </Route>
      <Route path={ROUTE_PATHS.demo}>
        <PublicRoute component={DemoPreviewPage} />
      </Route>
      <Route path={ROUTE_PATHS.business}>
        <PublicRoute component={BusinessPage} />
      </Route>
      <Route path={ROUTE_PATHS.businessDemo}>
        <PublicRoute component={BusinessDemoPage} />
      </Route>
      <Route path={ROUTE_PATHS.businessSampleCards}>
        <PublicRoute component={SampleCardsPage} />
      </Route>
      <Route path={ROUTE_PATHS.businessSignup}>
        <PublicRoute component={BusinessSignupPage} />
      </Route>
      <Route path={ROUTE_PATHS.businessLogin}>
        <PublicRoute component={BusinessLoginPage} />
      </Route>
      <Route path={ROUTE_PATHS.businessCreateWorkspace}>
        <PublicRoute component={CreateBusinessWorkspacePage} />
      </Route>
      <Route path={ROUTE_PATHS.businessDashboard}>
        <PublicRoute component={BusinessDashboardPage} />
      </Route>
      <Route path={ROUTE_PATHS.businessApprove}>
        <PublicRoute component={BusinessApprovePage} />
      </Route>
      <Route path={ROUTE_PATHS.cardPreview}>
        <PublicRoute component={CardPreviewPage} />
      </Route>

      {/* Onboarding */}
      <Route path={ROUTE_PATHS.onboarding} component={OnboardingRoute} />

      {/* Protected routes */}
      <Route path={ROUTE_PATHS.dashboard}>
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path={ROUTE_PATHS.recipients}>
        <ProtectedRoute component={RecipientsIndexRedirect} />
      </Route>
      <Route path={ROUTE_PATHS.recipientProfile}>
        <ProtectedRoute component={RecipientProfileGate} />
      </Route>
      <Route path={ROUTE_PATHS.relationship}>
        <ProtectedRoute component={RelationshipPage} />
      </Route>
      <Route path={ROUTE_PATHS.briefing}>
        <ProtectedRoute component={BriefingPage} />
      </Route>
      <Route path={ROUTE_PATHS.briefingDetail}>
        <ProtectedRoute component={BriefingPage} />
      </Route>
      <Route path={ROUTE_PATHS.cardsGenerate}>
        <ProtectedRoute component={CardGeneratorPage} />
      </Route>
      <Route path={ROUTE_PATHS.cardsReview}>
        <ProtectedRoute component={CardsReviewPage} />
      </Route>
      <Route path={ROUTE_PATHS.people}>
        <ProtectedRoute component={PeoplePage} />
      </Route>
      <Route path={ROUTE_PATHS.moments}>
        <ProtectedRoute component={MomentsPage} />
      </Route>
      <Route path={ROUTE_PATHS.autopilot}>
        <ProtectedRoute component={AutopilotPage} />
      </Route>
      <Route path={ROUTE_PATHS.quickCard}>
        <ProtectedRoute component={QuickCardPage} />
      </Route>
      <Route path={ROUTE_PATHS.settingsReminders}>
        <ProtectedRoute component={ReminderSettingsPage} />
      </Route>
      <Route path={ROUTE_PATHS.settingsAccount}>
        <ProtectedRoute component={AccountSettingsPage} />
      </Route>
      <Route path={ROUTE_PATHS.settingsRelationship}>
        <ProtectedRoute component={RelationshipPreferencesPage} />
      </Route>
      <Route path={ROUTE_PATHS.settingsBilling}>
        <ProtectedRoute component={BillingSettingsPage} />
      </Route>
      <Route path={ROUTE_PATHS.notifications}>
        <ProtectedRoute component={NotificationsPage} />
      </Route>
      <Route path={ROUTE_PATHS.search}>
        <ProtectedRoute component={SearchPage} />
      </Route>
      <Route path={ROUTE_PATHS.concierge}>
        <ProtectedRoute component={ConciergePage} />
      </Route>
      <Route path={ROUTE_PATHS.systemVerification}>
        <ProtectedRoute component={SystemVerificationPage} />
      </Route>
      <Route path={ROUTE_PATHS.brainPlayground}>
        <ProtectedRoute component={BrainPlaygroundPage} />
      </Route>
      <Route path={ROUTE_PATHS.launchReadiness}>
        <ProtectedRoute component={LaunchReadinessPage} />
      </Route>
      <Route path={ROUTE_PATHS.admin}>
        <ProtectedRoute component={AdminPage} />
      </Route>
      <Route path={ROUTE_PATHS.studio.collections}>
        <ProtectedRoute component={StudioCollectionsPage} />
      </Route>
      <Route path="/studio/collections/:id">
        <ProtectedRoute component={StudioCollectionDetailPage} />
      </Route>

      {/* Redirects */}
      <Route path={ROUTE_REDIRECTS.browniePointsToDashboard.from}>
        <Redirect to={ROUTE_REDIRECTS.browniePointsToDashboard.to} />
      </Route>
      <Route path={ROUTE_REDIRECTS.tryLegacyToTry.from}>
        <Redirect to={ROUTE_REDIRECTS.tryLegacyToTry.to} />
      </Route>

      {/* Error route */}
      <Route path={ROUTE_PATHS.error} component={RouteErrorPage} />

      {/* Not found */}
      <Route>
        <PublicRoute component={NotFoundPage} />
      </Route>
    </Switch>
  );
}
