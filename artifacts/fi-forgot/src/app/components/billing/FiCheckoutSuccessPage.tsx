import { Mail } from "lucide-react";

import { useCheckoutSuccess } from "@/app/billing/hooks/useCheckoutSuccess";
import { FiButton } from "@/app/components/button/FiButton";
import { FiBillingCard, FiCardContent } from "@/app/components/card/FiCard";

export function FiCheckoutSuccessPage() {
  const { defaults, goToDashboard } = useCheckoutSuccess();

  return (
    <div className="fi-checkout-success">
      <FiBillingCard className="fi-checkout-success__card">
        <FiCardContent>
          <div className="fi-checkout-success__icon" aria-hidden>
            <Mail size={32} />
          </div>
          <h1 className="fi-checkout-success__title">{defaults.checkoutSuccessTitle}</h1>
          <p className="fi-checkout-success__subtitle">{defaults.checkoutSuccessSubtitle}</p>
          <p className="fi-checkout-success__redirect">{defaults.checkoutSuccessRedirect}</p>
          <FiButton fullWidth onClick={goToDashboard} style={{ marginTop: "1.25rem" }}>
            {defaults.goToDashboardLabel}
          </FiButton>
        </FiCardContent>
      </FiBillingCard>
    </div>
  );
}
