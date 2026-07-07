import { useEffect } from "react";

import { useBillingOverview } from "@/app/billing/hooks/useBillingOverview";
import { FiBillingSections } from "@/app/components/billing/FiBillingSections";
import { getFiBillingClassName } from "@/app/components/billing/billingVariants";
import { FiSettingsShell } from "@/app/components/settings";

export function FiBillingPage() {
  const billing = useBillingOverview();

  useEffect(() => {
    const main = document.getElementById("billing-main");
    main?.focus();
  }, [billing.loading]);

  return (
    <FiSettingsShell offline={billing.isOffline}>
      <div id="billing-main" className={getFiBillingClassName()} tabIndex={-1}>
        <header className="fi-billing__header">
          <h1 className="fi-billing__title">{billing.defaults.title}</h1>
          <p className="fi-billing__subtitle">{billing.defaults.description}</p>
        </header>

        <div className="fi-billing__layout">
          <FiBillingSections billing={billing} />
        </div>
      </div>
    </FiSettingsShell>
  );
}
