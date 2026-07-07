import { Link } from "wouter";

import type { useStripeCheckout } from "@/app/billing/hooks/useStripeCheckout";
import { FiButton } from "@/app/components/button/FiButton";
import {
  getLaunchPricingCards,
  getPricingCopy,
  type LaunchPricingCard,
} from "@/app/pricing";

type StripeCheckoutController = ReturnType<typeof useStripeCheckout>;

export interface FiPricingPlansProps {
  variant?: "landing" | "subscribe" | "billing";
  currentPlanId?: string;
  checkout?: StripeCheckoutController;
  showIntro?: boolean;
  showDisclaimer?: boolean;
  onContinueFree?: () => void;
  className?: string;
}

function PricingPlanCard({
  plan,
  variant,
  isCurrent,
  checkout,
  onContinueFree,
}: {
  plan: LaunchPricingCard;
  variant: FiPricingPlansProps["variant"];
  isCurrent: boolean;
  checkout?: StripeCheckoutController;
  onContinueFree?: () => void;
}) {
  const isMember = plan.id === "concierge_member";
  const isChecking = checkout?.checkingOut === "concierge_member";

  const cta = (() => {
    if (variant === "landing") {
      return (
        <FiButton fullWidth asChild>
          <Link href="/signup" data-testid={`link-plan-${plan.id}`}>
            {isMember ? "Start with membership" : "Get started free"}
          </Link>
        </FiButton>
      );
    }

    if (isCurrent) {
      return (
        <FiButton fullWidth variant="secondary" disabled>
          Current plan
        </FiButton>
      );
    }

    if (isMember && checkout) {
      return (
        <FiButton
          fullWidth
          loading={isChecking}
          disabled={checkout.checkingOut !== null}
          onClick={() => void checkout.startCheckout("concierge_member")}
        >
          {getPricingCopy("pricing.upgradeToMemberTitle")}
        </FiButton>
      );
    }

    if (!isMember && onContinueFree) {
      return (
        <FiButton fullWidth variant="secondary" onClick={onContinueFree}>
          Continue with Free
        </FiButton>
      );
    }

    return null;
  })();

  return (
    <article
      className={`fi-pricing-plan${plan.highlight ? " fi-pricing-plan--featured" : ""}${isCurrent ? " fi-pricing-plan--current" : ""}`}
      aria-label={`${plan.name} plan`}
      data-testid={`card-plan-${plan.id}`}
    >
      {plan.badge && isMember ? (
        <span className="fi-pricing-plan__badge">{plan.badge}</span>
      ) : null}

      {isCurrent ? <p className="fi-pricing-plan__current-label">Your current plan</p> : null}

      <h3 className="fi-pricing-plan__name">{plan.name}</h3>
      <p className="fi-pricing-plan__tagline">{plan.tagline}</p>

      <div className="fi-pricing-plan__price-block">
        <div className="fi-pricing-plan__price-row">
          <p className="fi-pricing-plan__price">{plan.priceAmount}</p>
          {plan.pricePeriod ? (
            <span className="fi-pricing-plan__period">{plan.pricePeriod}</span>
          ) : null}
        </div>
        {plan.annualPrice ? (
          <p className="fi-pricing-plan__annual">
            <span className="fi-pricing-plan__annual-or">or</span>
            {plan.annualPrice}
          </p>
        ) : null}
      </div>

      <p className="fi-pricing-plan__includes">Includes:</p>
      <ul className="fi-pricing-plan__perks" aria-label={`${plan.name} includes`}>
        {plan.perks.map((perk) => (
          <li key={perk} className="fi-pricing-plan__perk">
            <span className="fi-pricing-plan__perk-mark" aria-hidden>✓</span>
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      <p className="fi-pricing-plan__card-price">{plan.handwrittenCardLine}</p>

      {cta ? <div className="fi-pricing-plan__cta">{cta}</div> : null}
    </article>
  );
}

export function FiPricingPlans({
  variant = "subscribe",
  currentPlanId,
  checkout,
  showIntro = variant !== "billing",
  showDisclaimer = variant === "landing",
  onContinueFree,
  className = "",
}: FiPricingPlansProps) {
  const plans = getLaunchPricingCards();

  return (
    <section
      className={`fi-pricing-plans fi-pricing-plans--two-col ${className}`.trim()}
      aria-labelledby={showIntro ? "fi-pricing-plans-title" : undefined}
    >
      {showIntro ? (
        <header className="fi-pricing-plans__intro" style={{ gridColumn: "1 / -1" }}>
          <p className="fi-pricing-plans__eyebrow">{getPricingCopy("pricing.landingEyebrow")}</p>
          <h2 id="fi-pricing-plans-title" className="fi-pricing-plans__title">
            {getPricingCopy("pricing.landingTitle")}
          </h2>
          <p className="fi-pricing-plans__subtitle">{getPricingCopy("pricing.landingSubtitle")}</p>
        </header>
      ) : null}

      {plans.map((plan) => (
        <PricingPlanCard
          key={plan.id}
          plan={plan}
          variant={variant}
          isCurrent={currentPlanId === plan.id}
          checkout={checkout}
          onContinueFree={onContinueFree}
        />
      ))}

      {showDisclaimer ? (
        <p className="fi-pricing-plans__disclaimer" style={{ gridColumn: "1 / -1" }}>
          {getPricingCopy("pricing.pricingDisclaimer")}
        </p>
      ) : null}
    </section>
  );
}
