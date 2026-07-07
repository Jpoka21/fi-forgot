import { useCallback, useEffect, useMemo, useState } from "react";

import { trackDashboardEvent } from "@/app/dashboard/dashboardAnalytics";
import { dashboardDefaults, type FiDashboardSnapshot } from "@/app/dashboard/dashboardDomain";
import { buildDashboardSnapshot } from "@/app/dashboard/dashboardEngine";
import { useAuth } from "@/lib/auth-context";
import { Plan, PLANS, resolveUserPlan } from "@/lib/plan";

export function useDashboard() {
  const { user } = useAuth();
  const plan = resolveUserPlan(user?.plan);
  const planConfig = PLANS[plan];

  const [snapshot, setSnapshot] = useState<FiDashboardSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstTimeDismissed, setFirstTimeDismissed] = useState(
    () => !!localStorage.getItem("fi_forgot_first_time_seen"),
  );

  const cardsUsed = useMemo(
    () => snapshot?.cards.filter((card) => card.status === "Approved").length ?? 0,
    [snapshot?.cards],
  );

  const refresh = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (options.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const nextSnapshot = buildDashboardSnapshot({
          userName: user?.name,
          userEmail: user?.email,
          cardsUsed,
          cardsTotal: planConfig.maxCardsPerYear,
          firstTimeDismissed,
        });
        setSnapshot(nextSnapshot);
        setError(null);
        trackDashboardEvent(
          options.silent ? "dashboard_refreshed" : "dashboard_viewed",
        );
      } catch (refreshError) {
        setError(dashboardDefaults.errorLabel);
        trackDashboardEvent("dashboard_error");
        if (import.meta.env.DEV) {
          console.error(refreshError);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [cardsUsed, firstTimeDismissed, planConfig.maxCardsPerYear, user?.email, user?.name],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const dismissFirstTime = useCallback(() => {
    localStorage.setItem("fi_forgot_first_time_seen", "1");
    setFirstTimeDismissed(true);
    void refresh({ silent: true });
  }, [refresh]);

  return {
    snapshot,
    isLoading,
    isRefreshing,
    error,
    showEmpty: !isLoading && !error && Boolean(snapshot?.isEmpty),
    refresh,
    dismissFirstTime,
    plan,
    planConfig,
    cardsUsed,
    cardsLeft: Math.max(0, planConfig.maxCardsPerYear - cardsUsed),
  };
}

export type DashboardController = ReturnType<typeof useDashboard>;
