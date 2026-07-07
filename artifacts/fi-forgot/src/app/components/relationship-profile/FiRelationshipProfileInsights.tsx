import { FiRelationshipHealthPanel } from "@/app/components/relationship-health/FiRelationshipHealthPanel";
import { FiBrowniePointsDisplay } from "@/app/components/brownie-points/FiBrowniePointsDisplay";
import { FiBrowniePointsSkeleton } from "@/app/components/brownie-points/FiBrowniePointsSkeleton";
import { useBrowniePointsAccount } from "@/app/brownie-points/hooks/useBrowniePointsAccount";
import { FiDashboardSuggestedActions } from "@/app/components/dashboard/FiDashboardSuggestedActions";
import { getFiRelationshipProfileSectionClassName } from "@/app/components/relationship-profile/relationshipProfileVariants";

export interface FiRelationshipProfileInsightsProps {
  recipientId: string;
}

export function FiRelationshipProfileInsights({ recipientId }: FiRelationshipProfileInsightsProps) {
  const brownie = useBrowniePointsAccount();

  return (
    <aside className="fi-relationship-profile__aside" aria-label="Relationship insights">
      <section className={getFiRelationshipProfileSectionClassName()}>
        <FiRelationshipHealthPanel recipientId={recipientId} />
      </section>

      <section className={getFiRelationshipProfileSectionClassName()} aria-labelledby="fi-profile-brownie">
        <h2 id="fi-profile-brownie" className="fi-relationship-profile__section-title">
          Brownie Points
        </h2>
        {brownie.isLoading ? (
          <FiBrowniePointsSkeleton />
        ) : (
          <div className="fi-relationship-profile__card">
            <FiBrowniePointsDisplay balance={brownie.balance} lifetime={brownie.lifetime} />
          </div>
        )}
      </section>

      <FiDashboardSuggestedActions />
    </aside>
  );
}
