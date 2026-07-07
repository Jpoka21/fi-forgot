import { Check, Loader2 } from "lucide-react";

import { billingDefaults, PLAN_ORDER } from "@/app/billing/billingDomain";
import { isStripePlanReady } from "@/app/billing/billingEngine";
import type { BillingOverviewController } from "@/app/billing/hooks/useBillingOverview";
import type { useStripeCheckout } from "@/app/billing/hooks/useStripeCheckout";
import { FiButton } from "@/app/components/button/FiButton";
import { FiBillingCard } from "@/app/components/card/FiCard";
import { resolvePlanDisplayPrice } from "@/app/pricing";
import { PLANS, type Plan } from "@/lib/plan";

type StripeCheckoutController = ReturnType<typeof useStripeCheckout>;

export interface FiPlanCardProps {
  planKey: Plan;
  checkout: StripeCheckoutController | BillingOverviewController;
  featured?: boolean;
  currentPlan?: Plan | null;
  onSelect?: (planKey: Plan) => void;
  compact?: boolean;
}

export function FiPlanCard({
  planKey,
  checkout,
  featured = planKey === "standard",
  currentPlan = null,
  onSelect,
  compact = false,
}: FiPlanCardProps) {
  const plan = PLANS[planKey];
  const displayPrice = resolvePlanDisplayPrice(planKey, checkout.stripePlans);
  const isChecking = checkout.checkingOut === planKey;
  const isCurrent = currentPlan === planKey;
  const stripeReady = isStripePlanReady(planKey, checkout.stripePlans, checkout.devBypass);

  const handleClick = () => {
    if (onSelect) {
      onSelect(planKey);
      return;
    }
    void checkout.startCheckout(planKey);
  };

  return (
    <FiBillingCard
      className={`fi-plan-card${featured ? " fi-plan-card--featured" : ""}`}
      aria-label={`${plan.label} plan`}
    >
      {featured ? <span className="fi-plan-card__badge">Most chosen</span> : null}
      <span className="fi-plan-card__label">{plan.label}</span>
      <p className="fi-plan-card__price">{displayPrice}</p>
      {!compact ? <p className="fi-plan-card__tagline">{plan.tagline}</p> : null}
      {!compact ? (
        <ul className="fi-plan-card__perks">
          {plan.perks.map((perk) => (
            <li key={perk} className="fi-plan-card__perk">
              <Check className="fi-plan-card__perk-icon" size={16} strokeWidth={2.5} aria-hidden />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {checkout.loading ? (
        <div className="fi-plan-card__loading" aria-busy="true" aria-label="Loading plan">
          <Loader2 size={20} className="animate-spin" aria-hidden />
        </div>
      ) : (
        <FiButton
          fullWidth
          onClick={handleClick}
          disabled={isChecking || checkout.checkingOut !== null || !stripeReady || isCurrent}
          loading={isChecking}
        >
          {isCurrent
            ? "Current plan"
            : isChecking
              ? billingDefaults.checkingOutLabel
              : stripeReady
                ? billingDefaults.choosePlanLabel(plan.label)
                : billingDefaults.comingSoonLabel}
        </FiButton>
      )}
    </FiBillingCard>
  );
}

export function FiPlanGrid({
  checkout,
  currentPlan,
  onSelect,
  compact = false,
}: {
  checkout: StripeCheckoutController | BillingOverviewController;
  currentPlan?: Plan | null;
  onSelect?: (planKey: Plan) => void;
  compact?: boolean;
}) {
  return (
    <div className="fi-billing__plan-grid">
      {PLAN_ORDER.map((planKey) => (
        <FiPlanCard
          key={planKey}
          planKey={planKey}
          checkout={checkout}
          currentPlan={currentPlan}
          onSelect={onSelect}
          compact={compact}
        />
      ))}
    </div>
  );
}
