import { buildTrendDirectionLabel } from "@/app/components/relationship-health/accessibility";
import { relationshipHealthUiCopy } from "@/app/components/relationship-health/relationshipHealthDomain";
import { getFiRelationshipHealthTrendBarClassName } from "@/app/components/relationship-health/relationshipHealthVariants";
import type { ScoreSnapshot } from "@/lib/relationship-health";

export interface FiRelationshipHealthTrendProps {
  history: ScoreSnapshot[];
  direction: "up" | "down" | "steady";
  recipientScoped?: boolean;
}

export function FiRelationshipHealthTrend({
  history,
  direction,
  recipientScoped = false,
}: FiRelationshipHealthTrendProps) {
  const maxScore = Math.max(...history.map((item) => item.score), 100);
  const note = recipientScoped
    ? relationshipHealthUiCopy.recipientTrendNote
    : relationshipHealthUiCopy.overallTrendNote;
  const directionCopy =
    direction === "up"
      ? relationshipHealthUiCopy.trendUp
      : direction === "down"
        ? relationshipHealthUiCopy.trendDown
        : relationshipHealthUiCopy.trendSteady;

  return (
    <section className="fi-relationship-health__trend" aria-labelledby="fi-relationship-health-trend">
      <h3 id="fi-relationship-health-trend" className="fi-relationship-health__section-title">
        Recent confidence
      </h3>
      <p className="fi-relationship-health__trend-note">{note}</p>
      <p className="fi-relationship-health__trend-note">
        {buildTrendDirectionLabel(direction)}. {directionCopy}
      </p>

      {history.length === 0 ? (
        <p className="fi-relationship-health__trend-note">{relationshipHealthUiCopy.trendEmpty}</p>
      ) : (
        <>
          <div
            className="fi-relationship-health__trend-bars"
            role="img"
            aria-label={`Recent confidence trend, ${history.length} snapshots`}
          >
            {history.map((item, index) => {
              const height = Math.max(12, Math.round((item.score / maxScore) * 100));
              const isLatest = index === history.length - 1;

              return (
                <div
                  key={`${item.date}-${index}`}
                  className={getFiRelationshipHealthTrendBarClassName({ active: isLatest })}
                  style={{ height: `${height}%` }}
                  title={`${item.date}: ${item.score}`}
                />
              );
            })}
          </div>

          <ul className="fi-relationship-health__trend-list" aria-label="Recent confidence scores">
            {history
              .slice()
              .reverse()
              .map((item) => (
                <li key={item.date} className="fi-relationship-health__trend-list-item">
                  <span>{item.date}</span>
                  <span>{item.score}</span>
                </li>
              ))}
          </ul>
        </>
      )}
    </section>
  );
}
