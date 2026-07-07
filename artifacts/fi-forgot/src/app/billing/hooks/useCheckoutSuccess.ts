import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

import { trackBillingEvent } from "@/app/billing/billingAnalytics";
import { billingDefaults } from "@/app/billing/billingDomain";
import { useAuth } from "@/lib/auth-context";
import type { Plan } from "@/lib/plan";

export function useCheckoutSuccess() {
  const [, setLocation] = useLocation();
  const { upgradePlan } = useAuth();
  const applied = useRef(false);

  useEffect(() => {
    trackBillingEvent("checkout_success_viewed");
  }, []);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;

    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan") as Plan | null;

    if (plan && ["basic", "standard", "premium", "concierge_member", "free"].includes(plan)) {
      upgradePlan(plan);
    }

    const timer = window.setTimeout(() => setLocation("/dashboard"), 2800);
    return () => window.clearTimeout(timer);
  }, [setLocation, upgradePlan]);

  return {
    defaults: billingDefaults,
    goToDashboard: () => setLocation("/dashboard"),
  };
}
