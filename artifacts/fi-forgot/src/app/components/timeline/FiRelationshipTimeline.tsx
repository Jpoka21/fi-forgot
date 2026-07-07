import { cn } from "@/lib/utils";
import { FiButton } from "@/app/components/button/FiButton";
import { FiTimelineEmptyState } from "@/app/components/empty-state/FiEmptyStatePresets";
import { FiTimelineSkeleton } from "@/app/components/loading/FiLoadingPresets";
import { FiTimelineArchiveConfirm } from "@/app/components/timeline/FiTimelineArchiveConfirm";
import {
  FiTimelineErrorState,
  FiTimelineSearchEmptyState,
} from "@/app/components/timeline/FiTimelineErrorState";
import { FiTimelineFilters } from "@/app/components/timeline/FiTimelineFilters";
import { FiTimelineList } from "@/app/components/timeline/FiTimelineList";
import { FiTimelineSearch } from "@/app/components/timeline/FiTimelineSearch";
import { buildTimelineRegionLabel } from "@/app/components/timeline/accessibility";
import { getFiTimelineContainerClassName } from "@/app/components/timeline/timelineVariants";
import { useRelationshipTimeline } from "@/app/timeline/hooks/useRelationshipTimeline";
import { timelineDefaults } from "@/app/timeline/timelineDomain";

export interface FiRelationshipTimelineProps {
  recipientId: string;
  className?: string;
  onLogMemory?: () => void;
}

export function FiRelationshipTimeline({
  recipientId,
  className,
  onLogMemory,
}: FiRelationshipTimelineProps) {
  const timeline = useRelationshipTimeline({ recipientId });

  const statusMessage = timeline.isLoading
    ? "Loading timeline"
    : timeline.isRefreshing
      ? "Refreshing timeline"
      : timeline.showEmpty
        ? "No timeline memories"
        : `${timeline.filteredItems.length} memories`;

  const showSearchEmpty =
    !timeline.isLoading
    && !timeline.error
    && timeline.filteredItems.length === 0
    && timeline.debouncedQuery.trim().length > 0;

  return (
    <section
      className={cn(getFiTimelineContainerClassName(className))}
      aria-label={buildTimelineRegionLabel(timeline.filteredItems.length)}
    >
      <header className="fi-timeline__header">
        <h2 className="fi-timeline__title">{timelineDefaults.title}</h2>
        <p className="fi-timeline__description">{timelineDefaults.description}</p>
      </header>

      <div className="fi-timeline__toolbar">
        <FiTimelineSearch value={timeline.query} onChange={timeline.setQuery} />
        <FiButton
          variant="ghost"
          size="sm"
          loading={timeline.isRefreshing}
          onClick={() => void timeline.refresh({ silent: true })}
        >
          {timelineDefaults.refreshLabel}
        </FiButton>
      </div>

      <FiTimelineFilters filter={timeline.filter} onFilterChange={timeline.setFilter} />

      <p className="fi-timeline__status" aria-live="polite">
        {statusMessage}
      </p>

      {timeline.error ? (
        <FiTimelineErrorState onRetry={() => void timeline.refresh()} />
      ) : null}

      {timeline.isLoading ? <FiTimelineSkeleton itemCount={4} /> : null}

      {timeline.showEmpty && !timeline.error && !timeline.debouncedQuery.trim() ? (
        <FiTimelineEmptyState contained={false} onPrimaryAction={onLogMemory} />
      ) : null}

      {showSearchEmpty && !timeline.error ? <FiTimelineSearchEmptyState /> : null}

      {timeline.showResults && !timeline.error ? (
        <>
          <FiTimelineList
            groups={timeline.groupedItems}
            query={timeline.debouncedQuery}
            editingId={timeline.editingId}
            onEdit={timeline.setEditingId}
            onArchive={timeline.setConfirmArchiveId}
            onSaveEdit={timeline.saveEdit}
            onCancelEdit={() => timeline.setEditingId(null)}
          />

          <footer className="fi-timeline__footer">
            {timeline.hasMore ? (
              <FiButton variant="secondary" onClick={timeline.loadMore}>
                {timelineDefaults.loadMoreLabel}
              </FiButton>
            ) : null}
          </footer>
        </>
      ) : null}

      <FiTimelineArchiveConfirm
        open={Boolean(timeline.confirmArchiveId)}
        onOpenChange={(open) => {
          if (!open) timeline.setConfirmArchiveId(null);
        }}
        onConfirm={() => {
          if (timeline.confirmArchiveId) {
            void timeline.archiveItem(timeline.confirmArchiveId);
          }
        }}
      />
    </section>
  );
}
