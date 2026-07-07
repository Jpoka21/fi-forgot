import { useCallback, useEffect, useMemo, useState } from "react";

import { trackBrowniePointsEvent } from "@/app/brownie-points/browniePointsAnalytics";
import { browniePointsDefaults } from "@/app/brownie-points/browniePointsDomain";
import {
  resolveMilestoneProgress,
  resolveNextMilestone,
  type FiBrownieMilestone,
  type FiBrowniePointTransaction,
} from "@/app/brownie-points/browniePointsDomain";
import { fetchBrowniePointsAccount } from "@/app/brownie-points/browniePointsEngine";
import {
  BROWNIE_AWARD_EVENT,
  useBrowniePoints,
  type BrownieAwardDetail,
} from "@/lib/brownie-points-context";

export interface UseBrowniePointsAccountOptions {
  enabled?: boolean;
}

export function useBrowniePointsAccount(options: UseBrowniePointsAccountOptions = {}) {
  const { enabled = true } = options;
  const { balance, lifetime, loading: contextLoading, refetch } = useBrowniePoints();

  const [recent, setRecent] = useState<FiBrowniePointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (optionsArg: { silent?: boolean } = {}) => {
      if (!enabled) return;

      if (optionsArg.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const account = await fetchBrowniePointsAccount();
        setRecent(account.recent);
        await refetch();
        setError(null);
        trackBrowniePointsEvent(
          optionsArg.silent ? "brownie_points_refreshed" : "brownie_points_loaded",
          { balance: account.balance },
        );
      } catch (refreshError) {
        setError(browniePointsDefaults.errorLabel);
        trackBrowniePointsEvent("brownie_points_error");
        if (import.meta.env.DEV) {
          console.error(refreshError);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [enabled, refetch],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<BrownieAwardDetail>).detail;
      if (!detail) return;
      void refresh({ silent: true });
    };

    window.addEventListener(BROWNIE_AWARD_EVENT, handler);
    return () => window.removeEventListener(BROWNIE_AWARD_EVENT, handler);
  }, [refresh]);

  const nextMilestone: FiBrownieMilestone | null = useMemo(
    () => resolveNextMilestone(lifetime),
    [lifetime],
  );
  const milestoneProgress = useMemo(
    () => resolveMilestoneProgress(lifetime, nextMilestone),
    [lifetime, nextMilestone],
  );

  const showHistoryEmpty = !isLoading && !error && recent.length === 0;
  const loading = isLoading || contextLoading;

  return {
    balance,
    lifetime,
    recent,
    nextMilestone,
    milestoneProgress,
    isLoading: loading,
    isRefreshing,
    error,
    showHistoryEmpty,
    refresh,
  };
}

export type BrowniePointsAccountController = ReturnType<typeof useBrowniePointsAccount>;
