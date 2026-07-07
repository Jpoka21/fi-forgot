import { Router as WouterRouter } from "wouter";
import { StampDistressFilter } from "@/components/brand";
import { FloatingTryButton } from "@/app/navigation/FloatingTryButton";
import { GlobalSearchHost } from "@/app/search/GlobalSearchHost";
import { NotificationCenterHost } from "@/app/notification/NotificationCenterHost";
import { AppRoutes } from "@/app/routes/AppRoutes";
import { RouteTransition } from "@/app/routes/RouteTransition";
import { ScrollRestoration } from "@/app/routes/ScrollRestoration";

export function RootNavigation() {
  return (
    <nav className="fi-root-navigation" data-testid="root-navigation" aria-label="Application">
      <StampDistressFilter />
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <ScrollRestoration />
        <RouteTransition>
          <AppRoutes />
        </RouteTransition>
        <FloatingTryButton />
        <GlobalSearchHost />
        <NotificationCenterHost />
      </WouterRouter>
    </nav>
  );
}
