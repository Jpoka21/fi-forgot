import { Link } from "wouter";
import { Heart, Users } from "lucide-react";

import { useStripeCheckout } from "@/app/billing/hooks/useStripeCheckout";
import { FiButton } from "@/app/components/button/FiButton";
import {
  getLaunchPricingCards,
  getMemberAnnualPrice,
  getMemberMonthlyPrice,
  getPricingCopy,
  PRICING_MESSAGING,
} from "@/app/pricing";

export interface FiRelationshipUpgradeModalProps {
  onClose: () => void;
}

export function FiRelationshipUpgradeModal({ onClose }: FiRelationshipUpgradeModalProps) {
  const checkout = useStripeCheckout();
  const monthly = getMemberMonthlyPrice();
  const annual = getMemberAnnualPrice();
  const memberPlan = getLaunchPricingCards().find((card) => card.id === "concierge_member");

  return (
    <div
      className="fi-upgrade-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="relationship-upgrade-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="fi-upgrade-modal__panel">
        <button type="button" className="fi-upgrade-modal__close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="fi-upgrade-modal__icon" aria-hidden>
          <Users size={28} />
        </div>

        <p className="fi-upgrade-modal__eyebrow">{PRICING_MESSAGING.conciergeBrandLabel}</p>
        <h2 id="relationship-upgrade-title" className="fi-upgrade-modal__title">
          {getPricingCopy("pricing.relationshipUpgradeTitle")}
        </h2>
        <p className="fi-upgrade-modal__body">
          {getPricingCopy("pricing.relationshipUpgradeBody")}
        </p>
        <p className="fi-upgrade-modal__cta-copy">
          {getPricingCopy("pricing.relationshipUpgradeCta")}
        </p>

        <ul className="fi-upgrade-modal__perks" aria-label="Concierge Membership includes">
          {(memberPlan?.perks ?? []).map((perk) => (
            <li key={perk}>{perk}</li>
          ))}
          {memberPlan ? <li>{memberPlan.handwrittenCardLine}</li> : null}
        </ul>

        <p className="fi-upgrade-modal__price-note">
          {monthly} · or {annual}
        </p>

        <div className="fi-upgrade-modal__actions">
          <FiButton
            fullWidth
            loading={checkout.checkingOut === "concierge_member"}
            disabled={checkout.checkingOut !== null}
            onClick={() => void checkout.startCheckout("concierge_member", { redirectOnDev: "/recipients/new" })}
          >
            Upgrade to Concierge Membership
          </FiButton>
          <FiButton variant="secondary" fullWidth asChild>
            <Link href="/subscribe">View Relationship Membership</Link>
          </FiButton>
          <FiButton variant="ghost" fullWidth onClick={onClose}>
            Not right now
          </FiButton>
        </div>

        <p className="fi-upgrade-modal__footer">
          <Heart size={14} aria-hidden />
          Helping you remember the people who matter — not a card bundle.
        </p>
      </div>
    </div>
  );
}
