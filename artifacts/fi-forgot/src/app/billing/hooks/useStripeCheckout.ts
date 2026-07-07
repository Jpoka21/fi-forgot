import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";

import { billingService } from "@/app/api/services/billingService";
import { trackBillingEvent } from "@/app/billing/billingAnalytics";
import type { StripePlanRow } from "@/app/billing/billingDomain";
import { parseStripePlansPayload } from "@/app/billing/billingEngine";
import { useAuth } from "@/lib/auth-context";
import type { Plan } from "@/lib/plan";

export interface StripeCheckoutOptions {
  redirectOnDev?: string;
  onDevSuccess?: () => void;
}

export function useStripeCheckout() {
  const { user, upgradePlan } = useAuth();
  const [, setLocation] = useLocation();
  const [stripePlans, setStripePlans] = useState<StripePlanRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<Plan | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const devBypass = import.meta.env.DEV;

  const loadPlans = useCallback(async () => {
    if (devBypass) {
      setLoading(false);
      setLoadError(null);
      trackBillingEvent("billing_plans_loaded", { mode: "dev-bypass" });
      return;
    }

    setLoading(true);
    setLoadError(null);

    try {
      const result = await billingService.getStripePlans();
      if (!result.ok) {
        throw new Error(`${result.status}`);
      }
      const rows = parseStripePlansPayload(result.data);
      setStripePlans(rows);
      trackBillingEvent("billing_plans_loaded", { count: rows.length });
    } catch {
      setLoadError("We couldn't load plan details right now. Please try again in a moment.");
      trackBillingEvent("billing_checkout_error", { stage: "load-plans" });
    } finally {
      setLoading(false);
    }
  }, [devBypass]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const startCheckout = useCallback(
    async (planKey: Plan, options?: StripeCheckoutOptions) => {
      const email = user?.email;
      if (!email) {
        setLocation("/");
        return;
      }

      setCheckingOut(planKey);
      setCheckoutError(null);
      trackBillingEvent("billing_checkout_started", { planKey });

      if (devBypass) {
        upgradePlan(planKey);
        options?.onDevSuccess?.();
        setLocation(options?.redirectOnDev ?? "/dashboard");
        setCheckingOut(null);
        return;
      }

      const match = stripePlans.find((plan) => plan.planKey === planKey);
      if (!match) {
        setCheckoutError("This plan isn't available yet. Please try again shortly.");
        setCheckingOut(null);
        trackBillingEvent("billing_checkout_error", { stage: "missing-plan", planKey });
        return;
      }

      try {
        const result = await billingService.createCheckoutSession({
          email,
          name: user.name,
          priceId: match.priceId,
          planKey,
        });
        const data = result.data as { url?: string; error?: string } | null;
        if (!result.ok || !data?.url) {
          throw new Error(data?.error ?? "Checkout failed");
        }
        window.location.href = data.url;
      } catch (error: unknown) {
        setCheckoutError(error instanceof Error ? error.message : "Something went wrong. Try again.");
        setCheckingOut(null);
        trackBillingEvent("billing_checkout_error", { stage: "checkout", planKey });
        try {
          localStorage.setItem("fi_forgot_billing_attention", "1");
        } catch {
          /* ignore */
        }
      }
    },
    [devBypass, setLocation, stripePlans, upgradePlan, user],
  );

  const skipToFree = useCallback(
    (redirect = "/dashboard") => {
      upgradePlan("free");
      setLocation(redirect);
    },
    [setLocation, upgradePlan],
  );

  /** @deprecated Use skipToFree — kept for compatibility */
  const skipToBasic = skipToFree;

  return {
    stripePlans,
    loadError,
    loading,
    checkingOut,
    checkoutError,
    devBypass,
    loadPlans,
    startCheckout,
    skipToFree,
    skipToBasic,
    clearCheckoutError: () => setCheckoutError(null),
  };
}
