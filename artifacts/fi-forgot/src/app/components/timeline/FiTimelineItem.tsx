import { FiButton } from "@/app/components/button/FiButton";
import { FiTimelineCard } from "@/app/components/card/FiCard";
import { FiSearchHighlight } from "@/app/components/search/FiSearchHighlight";
import { FiTimelineInlineEdit } from "@/app/components/timeline/FiTimelineInlineEdit";
import { timelineUiDefaults } from "@/app/components/timeline/timelineDomain";
import { getFiTimelineItemClassName } from "@/app/components/timeline/timelineVariants";
import {
  formatTimelineDate,
  resolveTimelineImpactBadge,
  resolveTimelineTypeTone,
} from "@/app/timeline/timelineEngine";
import {
  timelineTypeLabels,
  type FiTimelineItem,
} from "@/app/timeline/timelineDomain";

const impactLabels = {
  used_in_cards: timelineUiDefaults.usedInCardsLabel,
  reference_only: timelineUiDefaults.referenceOnlyLabel,
  not_used_for_cards: timelineUiDefaults.notUsedForCardsLabel,
} as const;

const impactClasses = {
  used_in_cards: "fi-timeline-item__impact--used",
  reference_only: "fi-timeline-item__impact--reference",
  not_used_for_cards: "fi-timeline-item__impact--archived",
} as const;

export interface FiTimelineItemProps {
  item: FiTimelineItem;
  query?: string;
  isEditing?: boolean;
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onInterpretationAction?: (id:string,action:"confirm"|"withdraw"|"reject"|"archive"|"restore")=>void;
  onHypothesisAction?: (id:string,action:"confirm"|"disagree"|"withdraw"|"reverse")=>void;
  onSaveEdit?: (id: string, value: string) => Promise<void>;
  onCancelEdit?: () => void;
}

export function FiTimelineItem({
  item,
  query = "",
  isEditing = false,
  onEdit,
  onArchive,
  onRestore,
  onInterpretationAction,
  onHypothesisAction,
  onSaveEdit,
  onCancelEdit,
}: FiTimelineItemProps) {
  const impact = resolveTimelineImpactBadge(item);
  const isFreshUpdate = item.type === "fresh_update" && !item.isArchived;

  return (
    <article aria-labelledby={`timeline-item-${item.id}`}>
      <FiTimelineCard
        className={getFiTimelineItemClassName({
          archived: item.isArchived,
          typeToneClass: resolveTimelineTypeTone(item.type),
        })}
      >
        <div className="fi-timeline-item__meta">
          <span className="fi-timeline-item__badge">{timelineTypeLabels[item.type]}</span>
          <span className="fi-timeline-item__date">{formatTimelineDate(item.date)}</span>
          <span className={`fi-timeline-item__impact ${impactClasses[impact]}`}>
            {impactLabels[impact]}
          </span>
        </div>

        <div className="fi-timeline-item__label-row">
          <h4 id={`timeline-item-${item.id}`} className="fi-timeline-item__label">
            {query ? <FiSearchHighlight text={item.label} query={query} /> : item.label}
          </h4>
          {isFreshUpdate ? (
            <span className="fi-timeline-item__sub-label">{timelineUiDefaults.freshUpdateSubLabel}</span>
          ) : null}
        </div>

        {item.type==="interpretation" ? <p className="fi-timeline-item__sub-label">User-authored interpretation - uncertain{item.confirmedAt && !item.endorsementWithdrawnAt ? " - endorsed by you" : ""}</p> : null}
        {item.type==="hypothesis" ? <p className="fi-timeline-item__sub-label">Server-owned Brain hypothesis - uncertain - your response: {item.responseState}</p> : null}
        {item.lifecycleState ? <p className="fi-timeline-item__sub-label">Status: {item.lifecycleState.replace(/_/g, " ")}</p> : null}
        {item.dependencyVersionIds.length ? <p className="fi-timeline-item__sub-label">Based on exact observation {item.dependencyVersionIds.join(", ")}</p> : null}
        {item.type==="hypothesis"?<div><p>{item.explanation}</p><p>Uncertainty: {item.uncertainty}</p><p>Evidence: {item.evidenceState}; independent support {item.support.length}; conflict {item.conflict.length}; confidence {item.confidence??"unknown"}.</p>{item.evidenceLinks.some(link=>link.interpretationId)?<p>Exact interpretation revisions: {item.evidenceLinks.filter(link=>link.interpretationId).map(link=>`${link.interpretationId}@${link.interpretationRevision}`).join(", ")}</p>:null}</div>:null}

        {isEditing ? (
          <FiTimelineInlineEdit
            initialValue={item.summary}
            onSave={(value) => onSaveEdit?.(item.id, value) ?? Promise.resolve()}
            onCancel={() => onCancelEdit?.()}
          />
        ) : item.summary ? (
          <p className="fi-timeline-item__summary">
            {query ? <FiSearchHighlight text={item.summary} query={query} /> : item.summary}
          </p>
        ) : null}

        {!isEditing && !item.isArchived ? (
          <div className="fi-timeline-item__actions">
            {item.canEdit ? (
              <FiButton variant="ghost" size="sm" onClick={() => onEdit?.(item.id)}>
                {timelineUiDefaults.editActionLabel}
              </FiButton>
            ) : null}
            {item.canArchive ? (
              <FiButton variant="ghost" size="sm" onClick={() => item.type==="interpretation"?onInterpretationAction?.(item.id,"archive"):onArchive?.(item.id)}>
                {timelineUiDefaults.archiveActionLabel}
              </FiButton>
            ) : null}
            {item.type==="interpretation"&&!item.confirmedAt?<FiButton variant="ghost" size="sm" onClick={()=>onInterpretationAction?.(item.id,"confirm")}>Endorse interpretation</FiButton>:null}
            {item.type==="interpretation"&&item.confirmedAt&&!item.endorsementWithdrawnAt?<FiButton variant="ghost" size="sm" onClick={()=>onInterpretationAction?.(item.id,"withdraw")}>Withdraw endorsement</FiButton>:null}
            {item.type==="interpretation"?<FiButton variant="ghost" size="sm" onClick={()=>onInterpretationAction?.(item.id,"reject")}>Reject interpretation</FiButton>:null}
            {item.type==="hypothesis"&&item.responseState==="none"?<><FiButton variant="ghost" size="sm" onClick={()=>onHypothesisAction?.(item.id,"confirm")}>Confirm as helpful</FiButton><FiButton variant="ghost" size="sm" onClick={()=>onHypothesisAction?.(item.id,"disagree")}>Disagree</FiButton></>:null}
            {item.type==="hypothesis"&&item.responseState==="confirmed"?<FiButton variant="ghost" size="sm" onClick={()=>onHypothesisAction?.(item.id,"withdraw")}>Withdraw response</FiButton>:null}
            {item.type==="hypothesis"&&item.responseState==="disagreed"?<><FiButton variant="ghost" size="sm" onClick={()=>onHypothesisAction?.(item.id,"withdraw")}>Withdraw response</FiButton>{item.evidenceState!=="unknown"?<FiButton variant="ghost" size="sm" onClick={()=>onHypothesisAction?.(item.id,"reverse")}>Deliberately reverse</FiButton>:null}</>:null}
            {item.type==="hypothesis"&&item.responseState==="withdrawn"&&item.evidenceState!=="unknown"?<FiButton variant="ghost" size="sm" onClick={()=>onHypothesisAction?.(item.id,"reverse")}>Deliberately reverse withdrawal</FiButton>:null}
          </div>
        ) : null}

        {item.isArchived ? (
          <div className="fi-timeline-item__footer">
            <p>{timelineUiDefaults.archivedFooter}</p>
            {item.canRestore ? <FiButton variant="ghost" size="sm" onClick={() => item.type==="interpretation"?onInterpretationAction?.(item.id,"restore"):onRestore?.(item.id)}>Restore {item.type==="interpretation"?"interpretation":"report"}</FiButton> : null}
          </div>
        ) : null}
        {item.history.length > 1 ? <details><summary>Version history ({item.history.length})</summary><ol>{item.history.map(version=><li key={version.id}>Version {version.version}: {version.text} ({version.lifecycleState})</li>)}</ol></details> : null}
        {item.actionHistory.length ? <details><summary>Interpretation history ({item.actionHistory.length})</summary><ol>{item.actionHistory.map(action=><li key={action.operationId}>{action.action} by you at {action.actedAt} (revision {action.newRevision})</li>)}</ol></details>:null}
      </FiTimelineCard>
    </article>
  );
}
