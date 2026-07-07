import { FiButton } from "@/app/components/button/FiButton";
import { relationshipHealthDefaults } from "@/app/relationship-health/relationshipHealthDomain";

export interface FiRelationshipHealthEmptyStateProps {
  onAddPerson?: () => void;
}

export function FiRelationshipHealthEmptyState({ onAddPerson }: FiRelationshipHealthEmptyStateProps) {
  return (
    <div className="fi-relationship-health__empty" role="status">
      <h3 className="fi-relationship-health__section-title">{relationshipHealthDefaults.emptyTitle}</h3>
      <p className="fi-relationship-health__explanation-copy">
        {relationshipHealthDefaults.emptyDescription}
      </p>
      {onAddPerson ? (
        <FiButton variant="primary" size="sm" onClick={onAddPerson}>
          {relationshipHealthDefaults.addPersonLabel}
        </FiButton>
      ) : null}
    </div>
  );
}
