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
  onSaveEdit?: (id: string, value: string) => Promise<void>;
  onCancelEdit?: () => void;
}

export function FiTimelineItem({
  item,
  query = "",
  isEditing = false,
  onEdit,
  onArchive,
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
              <FiButton variant="ghost" size="sm" onClick={() => onArchive?.(item.id)}>
                {timelineUiDefaults.archiveActionLabel}
              </FiButton>
            ) : null}
          </div>
        ) : null}

        {item.isArchived ? (
          <p className="fi-timeline-item__footer">{timelineUiDefaults.archivedFooter}</p>
        ) : null}
      </FiTimelineCard>
    </article>
  );
}
