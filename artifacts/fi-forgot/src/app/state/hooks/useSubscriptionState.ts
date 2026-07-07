import { useMemo } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { hasConciergeMembership, resolveUserPlan, type Plan } from "@/lib/plan";
import type { SubscriptionState } from "@/app/state/types";

export function useSubscriptionState(): SubscriptionState & {
  upgradePlan: (plan: Plan) => void;
  isFreePlan: boolean;
} {
  const { user, upgradePlan } = useAuth();
  const resolvedPlan = resolveUserPlan(user?.plan);

  return useMemo(
    () => ({
      plan: user?.plan ?? "free",
      hasActivePlan: hasConciergeMembership(resolvedPlan),
      isFreePlan: resolvedPlan === "free",
      upgradePlan,
    }),
    [resolvedPlan, upgradePlan, user?.plan],
  );
}
