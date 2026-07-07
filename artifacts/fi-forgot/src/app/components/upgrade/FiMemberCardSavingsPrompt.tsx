import { FiCardCheckoutPricing } from "@/app/components/pricing";
import { FiButton } from "@/app/components/button/FiButton";
import type { Plan } from "@/lib/plan";

export interface FiMemberCardSavingsPromptProps {
  plan: Plan;
  onContinue: () => void;
  onDismiss: () => void;
}

export function FiMemberCardSavingsPrompt({ plan, onContinue, onDismiss }: FiMemberCardSavingsPromptProps) {
  return (
    <div className="fi-upgrade-prompt" role="dialog" aria-modal="true" aria-label="Member savings at checkout">
      <FiCardCheckoutPricing plan={plan} showUpgradeOffer onContinueFree={onContinue} compact />
      <div style={{ marginTop: "0.75rem" }}>
        <FiButton variant="ghost" size="sm" onClick={onDismiss}>
          Not now
        </FiButton>
      </div>
    </div>
  );
}

/** Inline banner variant for card review surfaces */
export function FiMemberCardSavingsBanner({ plan, onUpgrade }: { plan: Plan; onUpgrade: () => void }) {
  return (
    <div className="fi-upgrade-banner">
      <FiCardCheckoutPricing plan={plan} showUpgradeOffer compact />
      <FiButton size="sm" variant="secondary" onClick={onUpgrade}>
        View Relationship Membership
      </FiButton>
    </div>
  );
}
