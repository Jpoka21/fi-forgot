import { useState } from "react";
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
import type { RelationshipTimelineController } from "@/app/timeline/hooks/useRelationshipTimeline";

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
  const [interpretationText,setInterpretationText]=useState("");
  const [dependencyVersionId,setDependencyVersionId]=useState("");

  return <FiRelationshipTimelineView timeline={timeline} onLogMemory={onLogMemory} className={className} interpretationText={interpretationText} dependencyVersionId={dependencyVersionId} onInterpretationTextChange={setInterpretationText} onDependencyVersionChange={setDependencyVersionId} onInterpretationSaved={()=>setInterpretationText("")} />;
}

interface FiRelationshipTimelineViewProps extends Omit<FiRelationshipTimelineProps,"recipientId"> {
  timeline:RelationshipTimelineController;
  interpretationText?:string;
  dependencyVersionId?:string;
  onInterpretationTextChange?:(value:string)=>void;
  onDependencyVersionChange?:(value:string)=>void;
  onInterpretationSaved?:()=>void;
}

export function FiRelationshipTimelineView({
  timeline,
  className,
  onLogMemory,
  interpretationText="",
  dependencyVersionId="",
  onInterpretationTextChange=()=>{},
  onDependencyVersionChange=()=>{},
  onInterpretationSaved=()=>{},
}: FiRelationshipTimelineViewProps) {
  const availableVersions=timeline.items.filter(item=>item.version&&item.lifecycleState==="active"&&item.type!=="interpretation");

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
      {availableVersions.length?<form onSubmit={event=>{event.preventDefault();if(interpretationText.trim()&&dependencyVersionId)void timeline.createInterpretation(interpretationText,[dependencyVersionId]).then(ok=>{if(ok)onInterpretationSaved();});}}><label>Uncertain interpretation<textarea aria-label="Uncertain interpretation" value={interpretationText} onChange={event=>onInterpretationTextChange(event.target.value)} /></label><label>Exact source observation<select aria-label="Exact source observation" value={dependencyVersionId} onChange={event=>onDependencyVersionChange(event.target.value)}><option value="">Choose an observation</option>{availableVersions.map(item=><option key={item.history.at(-1)?.id} value={item.history.at(-1)?.id}>{item.label} version {item.version}</option>)}</select></label><FiButton type="submit" variant="secondary">Save uncertain interpretation</FiButton></form>:null}

      <p className="fi-timeline__status" aria-live="polite">
        {statusMessage}
      </p>

      {timeline.error ? (
        <FiTimelineErrorState onRetry={() => void timeline.refresh()} />
      ) : null}

      {timeline.mutationError ? (
        <p className="fi-timeline__mutation-error" role="alert">{timeline.mutationError}</p>
      ) : null}

      {timeline.isLoading ? <FiTimelineSkeleton itemCount={4} /> : null}

      {timeline.showEmpty && !timeline.error && !timeline.debouncedQuery.trim() ? (
        <FiTimelineEmptyState contained={false} onPrimaryAction={onLogMemory} />
      ) : null}

      {showSearchEmpty && !timeline.error ? <FiTimelineSearchEmptyState /> : null}

      {timeline.showResults ? (
        <>
          <FiTimelineList
            groups={timeline.groupedItems}
            query={timeline.debouncedQuery}
            editingId={timeline.editingId}
            onEdit={timeline.setEditingId}
            onArchive={timeline.setConfirmArchiveId}
            onRestore={(id) => void timeline.restoreItem(id)}
            onInterpretationAction={(id,action)=>void timeline.changeInterpretation(id,action)}
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
