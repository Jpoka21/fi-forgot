import { useEffect, useState } from "react";

import { FiOnboardingLegacyFlow } from "@/app/components/onboarding/FiOnboardingLegacyFlow";
import { FiOnboardingWelcome } from "@/app/components/onboarding/FiOnboardingWelcome";
import { getFiOnboardingShellClassName } from "@/app/components/onboarding/onboardingVariants";
import { readOnboardingSession } from "@/app/onboarding/onboardingEngine";
import AppShell from "@/components/layout/AppShell";
import { AUTH_PAGE_MAX_WIDTH } from "@/components/layout/PageShell";

export function FiOnboardingPage() {
  const [welcomeComplete, setWelcomeComplete] = useState(
    () => readOnboardingSession()?.welcomeComplete ?? false,
  );

  useEffect(() => {
    const main = document.getElementById("onboarding-main");
    main?.focus();
  }, [welcomeComplete]);

  return (
    <AppShell>
      <div className={getFiOnboardingShellClassName()}>
        <div
          id="onboarding-main"
          tabIndex={-1}
          style={{ maxWidth: AUTH_PAGE_MAX_WIDTH, margin: "0 auto", width: "100%", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
        >
          {welcomeComplete ? (
            <FiOnboardingLegacyFlow />
          ) : (
            <FiOnboardingWelcome onComplete={() => setWelcomeComplete(true)} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
