import { useStripeCheckout } from "@/app/billing/hooks/useStripeCheckout";
import { FiButton } from "@/app/components/button/FiButton";
import {
  getCardSavingsCheckoutBody,
  getCardSavingsCheckoutHeadline,
  getCheckoutCardPrice,
  getFreeHandwrittenCardPrice,
  PRICING_MESSAGING,
} from "@/app/pricing";
import { hasConciergeMembership, type Plan } from "@/lib/plan";

export interface FiCardCheckoutPricingProps {
  plan: Plan;
  showUpgradeOffer?: boolean;
  onContinueFree?: () => void;
  compact?: boolean;
}

export function FiCardCheckoutPricing({
  plan,
  showUpgradeOffer = false,
  onContinueFree,
  compact = false,
}: FiCardCheckoutPricingProps) {
  const checkout = useStripeCheckout();
  const isMember = hasConciergeMembership(plan);
  const price = getCheckoutCardPrice(isMember);

  return (
    <div
      className="fi-card-checkout-pricing"
      role="region"
      aria-label="Handwritten card pricing"
    >
      <div className="fi-card-checkout-pricing__header">
        <p className="fi-card-checkout-pricing__label">Handwritten card</p>
        <p className="fi-card-checkout-pricing__price" aria-live="polite">
          {price}
        </p>
      </div>

      {isMember ? (
        <p className="fi-card-checkout-pricing__member-note">
          {PRICING_MESSAGING.membershipBrandLabel} pricing applied
        </p>
      ) : null}

      {showUpgradeOffer && !isMember ? (
        <div className="fi-card-checkout-pricing__savings">
          <p className="fi-card-checkout-pricing__savings-title">
            {getCardSavingsCheckoutHeadline()}
          </p>
          <p className="fi-card-checkout-pricing__savings-body">
            {getCardSavingsCheckoutBody()}
          </p>
          <div className="fi-card-checkout-pricing__actions">
            <FiButton
              size={compact ? "sm" : "md"}
              loading={checkout.checkingOut === "concierge_member"}
              disabled={checkout.checkingOut !== null}
              onClick={() => void checkout.startCheckout("concierge_member", { redirectOnDev: "/cards-review" })}
            >
              {PRICING_MESSAGING.upgradeToMemberTitle}
            </FiButton>
            {onContinueFree ? (
              <FiButton
                variant="secondary"
                size={compact ? "sm" : "md"}
                onClick={onContinueFree}
              >
                {PRICING_MESSAGING.continueAtFreeCardPrice(getFreeHandwrittenCardPrice())}
              </FiButton>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
