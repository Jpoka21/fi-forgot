import type { FiTimelineMonthGroup } from "@/app/timeline/timelineDomain";
import type { FiTimelineItem as FiTimelineItemType } from "@/app/timeline/timelineDomain";
import { FiTimelineGroup } from "@/app/components/timeline/FiTimelineGroup";
import { FiTimelineItem } from "@/app/components/timeline/FiTimelineItem";

export interface FiTimelineListProps {
  groups: FiTimelineMonthGroup[];
  query?: string;
  editingId?: string | null;
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
  onSaveEdit?: (id: string, value: string) => Promise<void>;
  onCancelEdit?: () => void;
}

export function FiTimelineList({
  groups,
  query = "",
  editingId = null,
  onEdit,
  onArchive,
  onSaveEdit,
  onCancelEdit,
}: FiTimelineListProps) {
  return (
    <div className="fi-timeline-list" role="feed" aria-label="Timeline memories">
      {groups.map((group) => (
        <FiTimelineGroup key={group.key} title={group.label}>
          {group.items.map((item: FiTimelineItemType) => (
            <FiTimelineItem
              key={item.id}
              item={item}
              query={query}
              isEditing={editingId === item.id}
              onEdit={onEdit}
              onArchive={onArchive}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
            />
          ))}
        </FiTimelineGroup>
      ))}
    </div>
  );
}
