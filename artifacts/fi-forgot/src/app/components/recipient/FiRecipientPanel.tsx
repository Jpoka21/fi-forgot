import { cn } from "@/lib/utils";
import { FiButton } from "@/app/components/button/FiButton";
import { buildRecipientRegionLabel } from "@/app/components/recipient/accessibility";
import { FiRecipientActivitySummaryPanel } from "@/app/components/recipient/FiRecipientActivitySummary";
import { FiRecipientCardHistory } from "@/app/components/recipient/FiRecipientCardHistory";
import { FiRecipientPanelEmptyState } from "@/app/components/recipient/FiRecipientEmptyState";
import { FiRecipientErrorState } from "@/app/components/recipient/FiRecipientErrorState";
import { FiRecipientMemoryPreview } from "@/app/components/recipient/FiRecipientMemoryPreview";
import { FiRecipientMilestones } from "@/app/components/recipient/FiRecipientMilestones";
import { FiRecipientQuickActions } from "@/app/components/recipient/FiRecipientQuickActions";
import { FiRecipientRelationshipOverview } from "@/app/components/recipient/FiRecipientRelationshipOverview";
import { FiRecipientLoadingSkeleton } from "@/app/components/recipient/FiRecipientSkeleton";
import { FiRecipientStatusIndicators } from "@/app/components/recipient/FiRecipientStatusIndicators";
import { FiRecipientSummary } from "@/app/components/recipient/FiRecipientSummary";
import { FiRecipientSuggestedImprovements } from "@/app/components/recipient/FiRecipientSuggestedImprovements";
import { FiRecipientConciergeActions } from "@/app/components/recipient/FiRecipientConciergeActions";
import { getFiRecipientContainerClassName } from "@/app/components/recipient/recipientVariants";
import { useRecipientProfile } from "@/app/recipient/hooks/useRecipientProfile";
import { recipientDefaults } from "@/app/recipient/recipientDomain";

export interface FiRecipientPanelProps {
  recipientId: string;
  className?: string;
  onAddPerson?: () => void;
}

export function FiRecipientPanel({
  recipientId,
  className,
  onAddPerson,
}: FiRecipientPanelProps) {
  const recipient = useRecipientProfile({ recipientId });

  const statusMessage = recipient.isLoading
    ? "Loading recipient profile"
    : recipient.isRefreshing
      ? "Refreshing recipient profile"
      : recipient.showEmpty
        ? "Recipient not found"
        : recipient.profile
          ? `Recipient profile for ${recipient.profile.recipient.name}`
          : "Recipient profile";

  return (
    <section
      className={cn(getFiRecipientContainerClassName(className))}
      aria-label={buildRecipientRegionLabel(recipient.profile?.recipient.name)}
    >
      <header className="fi-recipient__header">
        <h2 className="fi-recipient__title">{recipientDefaults.title}</h2>
        <p className="fi-recipient__description">{recipientDefaults.description}</p>
      </header>

      <div className="fi-recipient__toolbar">
        <FiButton
          variant="ghost"
          size="sm"
          loading={recipient.isRefreshing}
          onClick={() => void recipient.refresh({ silent: true })}
        >
          {recipientDefaults.refreshLabel}
        </FiButton>
      </div>

      <p className="fi-recipient__status" aria-live="polite">
        {statusMessage}
      </p>

      {recipient.error ? (
        <FiRecipientErrorState message={recipient.error} onRetry={() => void recipient.refresh()} />
      ) : null}

      {recipient.isLoading ? <FiRecipientLoadingSkeleton /> : null}

      {recipient.showEmpty && !recipient.error && !recipient.isLoading ? (
        <FiRecipientPanelEmptyState onAddPerson={onAddPerson} />
      ) : null}

      {recipient.profile && !recipient.isLoading && !recipient.error ? (
        <div className="fi-recipient__layout">
          <div>
            <FiRecipientSummary profile={recipient.profile} />
            <FiRecipientRelationshipOverview profile={recipient.profile} />
            <FiRecipientQuickActions actions={recipient.profile.quickActions} />
            <FiRecipientMemoryPreview
              items={recipient.profile.memoryPreview}
              timelinePreview={recipient.timelinePreview}
            />
          </div>
          <div>
            <FiRecipientStatusIndicators statuses={recipient.profile.statuses} />
            <FiRecipientMilestones milestones={recipient.profile.milestones} />
            <FiRecipientActivitySummaryPanel activity={recipient.profile.activity} />
            <FiRecipientCardHistory items={recipient.profile.cardHistory} />
            <FiRecipientSuggestedImprovements profile={recipient.profile} />
            <FiRecipientConciergeActions recipient={recipient.profile.recipient} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
