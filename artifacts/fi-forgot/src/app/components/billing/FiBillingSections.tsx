import type { BillingOverviewController } from "@/app/billing/hooks/useBillingOverview";
import { getStripeVerificationState } from "@/app/billing/hooks/useBillingOverview";
import { FiButton } from "@/app/components/button/FiButton";
import { FiBillingEmptyState } from "@/app/components/empty-state/FiEmptyStatePresets";
import { FiBillingCard, FiCardContent, FiCardDescription, FiCardHeader, FiCardTitle } from "@/app/components/card/FiCard";
import { FiPlanGrid } from "@/app/components/billing/FiPlanCard";
import { FiPricingPlans } from "@/app/components/pricing";
import { FiSubscriptionBadge } from "@/app/components/badge/FiBadge";
import { FiConfirmationDialog } from "@/app/components/dialog/FiDialogPresets";
import { getHandwrittenCardPriceLabel, resolvePlanDisplayPrice } from "@/app/pricing";
import { hasConciergeMembership, isLegacyPlan, PLANS } from "@/lib/plan";

export function FiBillingSections({ billing }: { billing: BillingOverviewController }) {
  const {
    defaults,
    currentPlan,
    planConfig,
    usage,
    renewalLabel,
    paymentAttention,
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
    openCancelReview,
    confirmCancelReview,
    goToSubscribe,
    loadError,
    loading,
    checkoutError,
    stripePlans,
    devBypass,
    loadPlans,
  } = billing;

  const stripeState = getStripeVerificationState({
    loading,
    loadError,
    stripePlans,
    devBypass,
  });

  const dialogTitle =
    pendingIntent === "downgrade"
      ? defaults.downgradeDialogTitle
      : defaults.upgradeDialogTitle;

  return (
    <>
      {paymentAttention ? (
        <output className="fi-billing__notice" aria-live="polite">
          <p className="fi-billing__notice-title">{defaults.paymentAttentionTitle}</p>
          <p className="fi-billing__notice-copy">{defaults.paymentAttentionDescription}</p>
          <div className="fi-billing__notice-actions">
            <FiButton variant="primary" onClick={() => void retryPayment()}>
              {defaults.retryPaymentLabel}
            </FiButton>
            <FiButton variant="ghost" onClick={dismissPaymentAttention}>
              {defaults.dismissNoticeLabel}
            </FiButton>
          </div>
        </output>
      ) : null}

      <FiBillingCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.currentPlanTitle}</FiCardTitle>
          <FiCardDescription>
            {planConfig
              ? `${planConfig.label} — ${resolvePlanDisplayPrice(currentPlan, stripePlans)}`
              : defaults.noPlanDescription}
          </FiCardDescription>
        </FiCardHeader>
        <FiCardContent>
          {currentPlan && planConfig ? (
            <div className="fi-billing__plan-actions">
              <FiSubscriptionBadge status="active">{planConfig.label}</FiSubscriptionBadge>
              <p className="fi-billing__section-copy">{planConfig.tagline}</p>
              {!isLegacyPlan(currentPlan) ? (
                <p className="fi-billing__section-copy">
                  {getHandwrittenCardPriceLabel(hasConciergeMembership(currentPlan))}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="fi-billing__plan-actions">
              <FiButton variant="primary" onClick={goToSubscribe}>
                {defaults.viewPlansLabel}
              </FiButton>
            </div>
          )}
        </FiCardContent>
      </FiBillingCard>

      <FiBillingCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.usageTitle}</FiCardTitle>
        </FiCardHeader>
        <FiCardContent>
          <div className="fi-billing__metrics">
            <div className="fi-billing__metric">
              <p className="fi-billing__metric-label">People covered</p>
              <p className="fi-billing__metric-value">
                {usage.activeRecipients}
                {usage.recipientLimit !== null ? ` / ${usage.recipientLimit}` : ""}
              </p>
            </div>
            <div className="fi-billing__metric">
              <p className="fi-billing__metric-label">Cards this year</p>
              <p className="fi-billing__metric-value">
                {usage.cardsUsedThisYear}
                {usage.cardLimit ? ` / ${usage.cardLimit}` : ""}
              </p>
            </div>
          </div>
        </FiCardContent>
      </FiBillingCard>

      {!isLegacyPlan(currentPlan) ? (
        <section className="fi-billing__section" aria-labelledby="billing-membership-pricing-title">
          <h2 id="billing-membership-pricing-title" className="fi-billing__section-title">
            Relationship Membership
          </h2>
          <FiPricingPlans
            variant="billing"
            currentPlanId={currentPlan}
            checkout={billing}
            showIntro={false}
          />
        </section>
      ) : null}

      <FiBillingCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.renewalTitle}</FiCardTitle>
          <FiCardDescription>{defaults.renewalEstimateNote}</FiCardDescription>
        </FiCardHeader>
        <FiCardContent>
          <p className="fi-billing__metric-value">{currentPlan ? renewalLabel : "—"}</p>
        </FiCardContent>
      </FiBillingCard>

      <FiBillingCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.paymentMethodTitle}</FiCardTitle>
        </FiCardHeader>
        <FiCardContent>
          <p className="fi-billing__section-copy">{defaults.paymentMethodEmpty}</p>
          <p className="fi-billing__section-copy">{defaults.paymentMethodEmptyHint}</p>
          {currentPlan ? (
            <div className="fi-billing__plan-actions">
              <FiButton variant="secondary" onClick={() => void retryPayment()}>
                {defaults.updatePaymentLabel}
              </FiButton>
            </div>
          ) : null}
        </FiCardContent>
      </FiBillingCard>

      <FiBillingCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.billingHistoryTitle}</FiCardTitle>
          <FiCardDescription>{defaults.invoiceHistoryTitle}</FiCardDescription>
        </FiCardHeader>
        <FiCardContent>
          <FiBillingEmptyState
            title={defaults.historyEmpty}
            description=""
            onPrimaryAction={goToSubscribe}
          />
        </FiCardContent>
      </FiBillingCard>

      <section className="fi-billing__section" aria-labelledby="billing-plan-change-title">
        <h2 id="billing-plan-change-title" className="fi-billing__section-title">
          {defaults.planChangeTitle}
        </h2>
        <FiPlanGrid checkout={billing} currentPlan={currentPlan} onSelect={openPlanChange} compact />
      </section>

      <FiBillingCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.cancelTitle}</FiCardTitle>
          <FiCardDescription>{defaults.cancelDescription}</FiCardDescription>
        </FiCardHeader>
        <FiCardContent>
          <FiButton variant="ghost" onClick={openCancelReview}>
            {defaults.cancelCtaLabel}
          </FiButton>
        </FiCardContent>
      </FiBillingCard>

      <FiBillingCard>
        <FiCardHeader>
          <FiCardTitle>{defaults.stripeVerifyTitle}</FiCardTitle>
        </FiCardHeader>
        <FiCardContent>
          <p
            className={`fi-billing__stripe-status${
              stripeState === "ready"
                ? " fi-billing__stripe-status--ready"
                : stripeState === "error"
                  ? " fi-billing__stripe-status--error"
                  : ""
            }`}
            role="status"
          >
            {stripeState === "loading"
              ? defaults.stripeVerifyLoading
              : stripeState === "error"
                ? loadError ?? defaults.stripeVerifyError
                : stripeState === "empty"
                  ? defaults.stripeVerifyEmpty
                  : defaults.stripeVerifyReady}
          </p>
          {devBypass ? <p className="fi-billing__section-copy">{defaults.devBypassHint}</p> : null}
          {stripeState === "error" ? (
            <FiButton variant="secondary" size="sm" onClick={() => void loadPlans()}>
              Try again
            </FiButton>
          ) : null}
        </FiCardContent>
      </FiBillingCard>

      {(loadError || checkoutError) && stripeState !== "error" ? (
        <p className="fi-billing__stripe-status fi-billing__stripe-status--error" role="alert">
          {loadError ?? checkoutError}
        </p>
      ) : null}

      <FiConfirmationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogTitle}
        description={
          pendingPlan
            ? `You'll move to ${PLANS[pendingPlan].label} (${resolvePlanDisplayPrice(pendingPlan, stripePlans)}). Changes take effect through your existing checkout flow.`
            : undefined
        }
        confirmLabel={defaults.confirmChangeLabel}
        onConfirm={() => void confirmPlanChange()}
      />

      <FiConfirmationDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title={defaults.cancelDialogTitle}
        description={defaults.cancelDialogDescription}
        confirmLabel={defaults.confirmCancelLabel}
        onConfirm={confirmCancelReview}
      />
    </>
  );
}
