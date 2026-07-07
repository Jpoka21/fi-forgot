import { FiRelationshipTimeline } from "@/app/components/timeline/FiRelationshipTimeline";
import { FiButton } from "@/app/components/button/FiButton";
import { getFiRelationshipProfileSectionClassName } from "@/app/components/relationship-profile/relationshipProfileVariants";

export interface FiRelationshipProfileTimelineSectionProps {
  recipientId: string;
  showTimeline: boolean;
  onToggleTimeline: () => void;
  onLogMemory: () => void;
}

export function FiRelationshipProfileTimelineSection({
  recipientId,
  showTimeline,
  onToggleTimeline,
  onLogMemory,
}: FiRelationshipProfileTimelineSectionProps) {
  return (
    <section className={getFiRelationshipProfileSectionClassName()} aria-labelledby="fi-profile-timeline">
      <div>
        <h2 id="fi-profile-timeline" className="fi-relationship-profile__section-title">
          Your story together
        </h2>
        <p className="fi-relationship-profile__section-subtitle">
          Memories, cards, and moments over time.
        </p>
      </div>

      <FiButton variant="secondary" size="sm" onClick={onToggleTimeline}>
        {showTimeline ? "Hide timeline" : "View full timeline"}
      </FiButton>

      {showTimeline ? (
        <FiRelationshipTimeline recipientId={recipientId} onLogMemory={onLogMemory} />
      ) : null}
    </section>
  );
}
