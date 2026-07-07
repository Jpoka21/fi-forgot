import { useEffect } from "react";
import { Link } from "wouter";
import { Heart } from "lucide-react";

import { trackBillingEvent } from "@/app/billing/billingAnalytics";
import { billingDefaults } from "@/app/billing/billingDomain";
import { useStripeCheckout } from "@/app/billing/hooks/useStripeCheckout";
import { FiPlanGrid } from "@/app/components/billing/FiPlanCard";
import { getFiSubscribeShellClassName } from "@/app/components/billing/billingVariants";
import { FiButton } from "@/app/components/button/FiButton";
import { FiPricingPlans } from "@/app/components/pricing";
import { isLegacyPlan, resolveUserPlan } from "@/lib/plan";
import { useAuth } from "@/lib/auth-context";

export function FiSubscribePage() {
  const checkout = useStripeCheckout();
  const { user } = useAuth();
  const plan = resolveUserPlan(user?.plan);
  const showLegacyPlans = isLegacyPlan(plan);

  useEffect(() => {
    trackBillingEvent("subscribe_opened");
  }, []);

  return (
    <div className={getFiSubscribeShellClassName()}>
      <header className="fi-subscribe-shell__header">
        <Link href="/">
          <p className="fi-subscribe-shell__brand-title">F.I. FORGOT</p>
          <p className="fi-subscribe-shell__brand-subtitle">RELATIONSHIP CONCIERGE</p>
        </Link>
        <h1 className="fi-subscribe-shell__title">{billingDefaults.subscribeTitle}</h1>
        <p className="fi-subscribe-shell__subtitle">{billingDefaults.subscribeSubtitle}</p>
      </header>

      <div className="fi-subscribe-shell__grid-wrap">
        <FiPricingPlans
          variant="subscribe"
          currentPlanId={plan}
          checkout={checkout}
          showIntro={false}
          onContinueFree={() => checkout.skipToFree()}
        />

        {showLegacyPlans ? (
          <section aria-labelledby="legacy-plans-title" style={{ marginTop: "2rem" }}>
            <h2 id="legacy-plans-title" className="fi-billing__section-title" style={{ textAlign: "center", marginBottom: "1rem" }}>
              Your existing plan options
            </h2>
            <FiPlanGrid checkout={checkout} currentPlan={plan} />
          </section>
        ) : null}
      </div>

      {(checkout.loadError || checkout.checkoutError) && (
        <p className="fi-billing__stripe-status fi-billing__stripe-status--error" role="alert" style={{ textAlign: "center", maxWidth: "30rem", margin: "0 auto 1rem" }}>
          {checkout.loadError ?? checkout.checkoutError}
        </p>
      )}

      <div className="fi-subscribe-shell__footer">
        <FiButton variant="secondary" onClick={() => checkout.skipToFree()}>
          {billingDefaults.exploreFirstLabel}
        </FiButton>
        <p className="fi-subscribe-shell__footer-note">
          <Heart size={14} aria-hidden />
          {billingDefaults.changePlanNote}
        </p>
      </div>
    </div>
  );
}
