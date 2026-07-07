import { FiRelationshipHealthBadge } from "@/app/components/badge/FiBadge";
import { resolveRelationshipHealthLevel } from "@/app/components/badge/badgeDomain";
import { FiRelationshipHealthRing } from "@/app/components/progress/FiCircularProgress";
import type { OverallHealth, RecipientHealth } from "@/lib/relationship-health";

export interface FiRelationshipHealthSummaryProps {
  overall?: OverallHealth | null;
  recipient?: RecipientHealth | null;
  recipientName?: string;
}

export function FiRelationshipHealthSummary({
  overall,
  recipient,
  recipientName,
}: FiRelationshipHealthSummaryProps) {
  const score = recipient?.score ?? overall?.score ?? 0;
  const label = recipient ? recipientName ?? recipient.name : overall?.label ?? "Relationship Health";
  const tagline = recipient
    ? recipient.topGap === "Profile looks great!"
      ? "This profile is in strong shape."
      : recipient.topGap
    : overall?.tagline ?? "";
  const level = resolveRelationshipHealthLevel(score);

  return (
    <div className="fi-relationship-health__hero">
      <FiRelationshipHealthRing score={score} showScore size="lg" />
      <div className="fi-relationship-health__summary">
        <p className="fi-relationship-health__summary-label">Relationship confidence</p>
        <h3 className="fi-relationship-health__summary-title">{label}</h3>
        {tagline ? <p className="fi-relationship-health__summary-tagline">{tagline}</p> : null}
        <FiRelationshipHealthBadge level={level} />
      </div>
    </div>
  );
}
