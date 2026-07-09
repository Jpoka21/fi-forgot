import { useMemo, useState } from "react";
import { Link } from "wouter";

import { useDashboard } from "@/app/dashboard/hooks/useDashboard";
import {
  buildUpcomingCardById,
  buildUpcomingCardKeys,
} from "@/app/dashboard/dashboardEngine";
import { getPersonalSettings, type PersonalSettings } from "@/lib/data";
import { FiButton } from "@/app/components/button/FiButton";
import { FiDashboardAttentionItems } from "@/app/components/dashboard/FiDashboardAttentionItems";
import { FiDashboardBrowniePointsSummary } from "@/app/components/dashboard/FiDashboardBrowniePointsSummary";
import { FiDashboardPanelEmptyState } from "@/app/components/dashboard/FiDashboardEmptyState";
import { FiDashboardErrorState } from "@/app/components/dashboard/FiDashboardErrorState";
import { FiDashboardFirstTimeExperience } from "@/app/components/dashboard/FiDashboardFirstTimeExperience";
import { FiDashboardFooter } from "@/app/components/dashboard/FiDashboardFooter";
import { FiDashboardHero } from "@/app/components/dashboard/FiDashboardHero";
import { FiDashboardLoadingState } from "@/app/components/dashboard/FiDashboardLoadingState";
import { FiDashboardModals } from "@/app/components/dashboard/FiDashboardModals";
import { FiDashboardPendingReview } from "@/app/components/dashboard/FiDashboardPendingReview";
import { FiDashboardQuickActions } from "@/app/components/dashboard/FiDashboardQuickActions";
import { FiDashboardRecentActivity } from "@/app/components/dashboard/FiDashboardRecentActivity";
import { FiDashboardRelationshipHealthSummary } from "@/app/components/dashboard/FiDashboardRelationshipHealthSummary";
import { FiDashboardRelationshipSpotlight } from "@/app/components/dashboard/FiDashboardRelationshipSpotlight";
import { FiDashboardShell } from "@/app/components/dashboard/FiDashboardShell";
import { FiDashboardSuggestedActions } from "@/app/components/dashboard/FiDashboardSuggestedActions";
import { FiDashboardUpcomingCards } from "@/app/components/dashboard/FiDashboardUpcomingCards";
import { dashboardDefaults } from "@/app/dashboard/dashboardDomain";

export function FiDashboardPage() {
  const dashboard = useDashboard();
  const [personalSettings, setPersonalSettings] = useState<PersonalSettings>(() => getPersonalSettings());
  const [viewingCardId, setViewingCardId] = useState<string | null>(null);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const snapshot = dashboard.snapshot;
  const upcomingWithCardKeys = useMemo(
    () => (snapshot ? buildUpcomingCardKeys(snapshot.cards) : new Set<string>()),
    [snapshot],
  );
  const upcomingCardById = useMemo(
    () => (snapshot ? buildUpcomingCardById(snapshot.cards) : new Map<string, string>()),
    [snapshot],
  );

  const statusMessage = dashboard.isLoading
    ? "Loading dashboard"
    : dashboard.isRefreshing
      ? "Refreshing dashboard"
      : snapshot?.isEmpty
        ? "Dashboard empty"
        : "Dashboard loaded";

  if (dashboard.isLoading) {
    return (
      <FiDashboardShell statusMessage={statusMessage}>
        <FiDashboardLoadingState />
      </FiDashboardShell>
    );
  }

  if (dashboard.error) {
    return (
      <FiDashboardShell statusMessage={statusMessage}>
        <FiDashboardErrorState
          message={dashboard.error}
          onRetry={() => void dashboard.refresh()}
        />
      </FiDashboardShell>
    );
  }

  if (!snapshot) {
    return null;
  }

  if (snapshot.isEmpty) {
    return (
      <FiDashboardShell statusMessage={statusMessage}>
        <FiDashboardPanelEmptyState />
        {typeof window !== "undefined" && window.innerWidth < 768 ? (
          <Link href="/recipients/new" data-testid="link-add-recipient" className="fi-dashboard__mobile-fab">
            Add someone
          </Link>
        ) : null}
      </FiDashboardShell>
    );
  }

  if (snapshot.isFirstTime) {
    const recipient = snapshot.recipients[0];
    const card = snapshot.cards.find((item) => item.recipientId === recipient?.id);
    return (
      <FiDashboardShell statusMessage={statusMessage}>
        <FiDashboardFirstTimeExperience
          recipient={recipient}
          card={card}
          onViewCard={setViewingCardId}
          onDismiss={dashboard.dismissFirstTime}
        />
        <FiDashboardModals
          cards={snapshot.cards}
          viewingCardId={viewingCardId}
          onCloseCard={() => setViewingCardId(null)}
          fontPickerOpen={fontPickerOpen}
          onCloseFontPicker={() => setFontPickerOpen(false)}
          personalSettings={personalSettings}
          onSettingsChange={setPersonalSettings}
          upgradeOpen={upgradeOpen}
          onCloseUpgrade={() => setUpgradeOpen(false)}
          plan={dashboard.plan}
          cardsUsed={dashboard.cardsUsed}
          cardsTotal={dashboard.planConfig.maxCardsPerYear}
        />
      </FiDashboardShell>
    );
  }

  return (
    <FiDashboardShell statusMessage={statusMessage}>
      <div className="fi-dashboard__toolbar" style={{ display: "flex", justifyContent: "flex-end" }}>
        <FiButton
          variant="ghost"
          size="sm"
          loading={dashboard.isRefreshing}
          onClick={() => void dashboard.refresh({ silent: true })}
        >
          {dashboardDefaults.refreshLabel}
        </FiButton>
      </div>

      <FiDashboardHero welcome={snapshot.welcome} />

      <div className="fi-dashboard__main-grid">
        <div>
          <FiDashboardUpcomingCards
            moments={snapshot.upcomingMoments}
            totalUpcoming={snapshot.upcomingEvents.filter((event) => event.daysAway <= 60).length}
            cards={snapshot.cards}
            upcomingWithCardKeys={upcomingWithCardKeys}
            upcomingCardById={upcomingCardById}
          />
          <FiDashboardPendingReview pendingReviewCount={snapshot.pendingReviewCount} />
          <FiDashboardSuggestedActions suggestedActions={snapshot.suggestedActions} />
          <FiDashboardQuickActions actions={snapshot.quickActions} />
          <FiDashboardRecentActivity items={snapshot.recentActivity} />
        </div>

        <aside className="fi-dashboard__aside">
          <FiDashboardRelationshipSpotlight spotlight={snapshot.spotlight} />
          <FiDashboardRelationshipHealthSummary />
          <FiDashboardBrowniePointsSummary />
        </aside>
      </div>

      <FiDashboardAttentionItems
        items={snapshot.attentionItems}
        onUpgrade={() => setUpgradeOpen(true)}
      />

      <FiDashboardFooter
        personalSettings={personalSettings}
        onOpenFontPicker={() => setFontPickerOpen(true)}
      />

      <FiDashboardModals
        cards={snapshot.cards}
        viewingCardId={viewingCardId}
        onCloseCard={() => setViewingCardId(null)}
        fontPickerOpen={fontPickerOpen}
        onCloseFontPicker={() => setFontPickerOpen(false)}
        personalSettings={personalSettings}
        onSettingsChange={setPersonalSettings}
        upgradeOpen={upgradeOpen}
        onCloseUpgrade={() => setUpgradeOpen(false)}
        plan={dashboard.plan}
        cardsUsed={dashboard.cardsUsed}
        cardsTotal={dashboard.planConfig.maxCardsPerYear}
      />
    </FiDashboardShell>
  );
}
