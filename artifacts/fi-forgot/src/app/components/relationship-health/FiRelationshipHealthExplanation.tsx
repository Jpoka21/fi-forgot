import { CAT_DESCRIPTIONS, CAT_LABELS, type OverallHealth, type RecipientHealth } from "@/lib/relationship-health";
import { relationshipHealthUiCopy } from "@/app/components/relationship-health/relationshipHealthDomain";

export interface FiRelationshipHealthExplanationProps {
  overall?: OverallHealth | null;
  recipient?: RecipientHealth | null;
}

export function FiRelationshipHealthExplanation({
  overall,
  recipient,
}: FiRelationshipHealthExplanationProps) {
  const explanation = recipient ? null : overall?.explanation;
  const categories = recipient?.categories;

  return (
    <section className="fi-relationship-health__explanation" aria-labelledby="fi-relationship-health-explanation">
      <h3 id="fi-relationship-health-explanation" className="fi-relationship-health__section-title">
        {relationshipHealthUiCopy.explanationTitle}
      </h3>

      {explanation ? (
        <p className="fi-relationship-health__explanation-copy">{explanation}</p>
      ) : null}

      {categories ? (
        <>
          <p className="fi-relationship-health__explanation-copy">
            {relationshipHealthUiCopy.categoriesTitle}
          </p>
          <ul className="fi-relationship-health__category-list" aria-label="Profile confidence by area">
            {Object.entries(categories).map(([key, value]) => {
              const pct = value.max > 0 ? Math.round((value.score / value.max) * 100) : 0;

              return (
                <li key={key} className="fi-relationship-health__category-item">
                  <div className="fi-relationship-health__category-header">
                    <span>{CAT_LABELS[key] ?? key}</span>
                    <span>{pct}%</span>
                  </div>
                  <div
                    className="fi-relationship-health__category-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                    aria-label={`${CAT_LABELS[key] ?? key}: ${pct}%`}
                  >
                    <div
                      className="fi-relationship-health__category-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="fi-relationship-health__explanation-copy">
                    {CAT_DESCRIPTIONS[key] ?? ""}
                  </p>
                  {value.gaps.length > 0 ? (
                    <p className="fi-relationship-health__explanation-copy">{value.gaps[0]}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </section>
  );
}
