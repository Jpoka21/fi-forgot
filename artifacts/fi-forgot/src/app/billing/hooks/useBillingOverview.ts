import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

import { trackBillingEvent } from "@/app/billing/billingAnalytics";
import {
  billingDefaults,
  type PlanChangeIntent,
  type StripePlanRow,
} from "@/app/billing/billingDomain";
import {
  buildUsageSummary,
  comparePlans,
  formatRenewalEstimate,
  readBillingAttention,
  writeBillingAttention,
} from "@/app/billing/billingEngine";
import { useStripeCheckout } from "@/app/billing/hooks/useStripeCheckout";
import { useAppStateContext } from "@/app/state/AppStateProvider";
import { useAuth } from "@/lib/auth-context";
import { getCards, getRecipients } from "@/lib/data";
import { PLANS, resolveUserPlan, type Plan } from "@/lib/plan";

export function useBillingOverview() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { connectivity } = useAppStateContext();
  const checkout = useStripeCheckout();

  const [paymentAttention, setPaymentAttention] = useState(() => readBillingAttention());
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [pendingIntent, setPendingIntent] = useState<PlanChangeIntent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const currentPlan = user?.plan ? resolveUserPlan(user.plan) : "free";

  const usage = useMemo(() => {
    return buildUsageSummary(currentPlan, getRecipients(), getCards());
  }, [currentPlan]);

  const renewalLabel = useMemo(() => formatRenewalEstimate(), []);

  useEffect(() => {
    trackBillingEvent("billing_opened", { hasPlan: Boolean(currentPlan) });
  }, [currentPlan]);

  const openPlanChange = useCallback(
    (planKey: Plan) => {
      const intent = comparePlans(currentPlan, planKey);
      if (intent === "same") return;

      setPendingPlan(planKey);
      setPendingIntent(intent);
      setDialogOpen(true);
    },
    [currentPlan],
  );

  const confirmPlanChange = useCallback(async () => {
    if (!pendingPlan) return;
    trackBillingEvent("billing_plan_change_confirmed", {
      planKey: pendingPlan,
      intent: pendingIntent ?? "upgrade",
    });
    setDialogOpen(false);
    await checkout.startCheckout(pendingPlan, { redirectOnDev: "/settings/billing" });
    setPendingPlan(null);
    setPendingIntent(null);
  }, [checkout, pendingIntent, pendingPlan]);

  const retryPayment = useCallback(async () => {
    trackBillingEvent("billing_retry_payment");
    if (!currentPlan) {
      navigate("/subscribe");
      return;
    }
    await checkout.startCheckout(currentPlan, { redirectOnDev: "/settings/billing" });
  }, [checkout, currentPlan, navigate]);

  const dismissPaymentAttention = useCallback(() => {
    writeBillingAttention(false);
    setPaymentAttention(false);
    trackBillingEvent("billing_attention_dismissed");
  }, []);

  const markPaymentAttention = useCallback(() => {
    writeBillingAttention(true);
    setPaymentAttention(true);
  }, []);

  useEffect(() => {
    if (checkout.checkoutError) {
      markPaymentAttention();
    }
  }, [checkout.checkoutError, markPaymentAttention]);

  const openCancelReview = useCallback(() => {
    setCancelDialogOpen(true);
    trackBillingEvent("billing_cancel_reviewed");
  }, []);

  const confirmCancelReview = useCallback(() => {
    setCancelDialogOpen(false);
    if (currentPlan) {
      void checkout.startCheckout(currentPlan, { redirectOnDev: "/settings/billing" });
    }
  }, [checkout, currentPlan]);

  return {
    defaults: billingDefaults,
    currentPlan,
    planConfig: currentPlan ? PLANS[currentPlan] : null,
    usage,
    renewalLabel,
    paymentAttention,
    isOffline: !connectivity.isOnline,
    ...checkout,
    pendingPlan,
    pendingIntent,
    dialogOpen,
    setDialogOpen,
    cancelDialogOpen,
    setCancelDialogOpen,
    openPlanChange,
    confirmPlanChange,
    retryPayment,
    dismissPaymentAttention,
    markPaymentAttention,
    openCancelReview,
    confirmCancelReview,
    goToSubscribe: () => navigate("/subscribe"),
  };
}

export type BillingOverviewController = ReturnType<typeof useBillingOverview>;

export function getStripeVerificationState(input: {
  loading: boolean;
  loadError: string | null;
  stripePlans: StripePlanRow[];
  devBypass: boolean;
}): "loading" | "ready" | "error" | "empty" {
  if (input.loading) return "loading";
  if (input.loadError) return "error";
  if (input.devBypass || input.stripePlans.length > 0) return "ready";
  return "empty";
}
