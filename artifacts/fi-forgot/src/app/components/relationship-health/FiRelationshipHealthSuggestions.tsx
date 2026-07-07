import { trackRelationshipHealthEvent } from "@/app/relationship-health/relationshipHealthAnalytics";
import { relationshipHealthDefaults } from "@/app/relationship-health/relationshipHealthDomain";
import { relationshipHealthUiCopy } from "@/app/components/relationship-health/relationshipHealthDomain";
import { getFiRelationshipHealthSuggestionClassName } from "@/app/components/relationship-health/relationshipHealthVariants";

export interface FiRelationshipHealthSuggestion {
  id: string;
  title: string;
  description: string;
  href: string;
  pointsGain?: number;
}

export interface FiRelationshipHealthSuggestionsProps {
  suggestions: FiRelationshipHealthSuggestion[];
}

export function FiRelationshipHealthSuggestions({ suggestions }: FiRelationshipHealthSuggestionsProps) {
  return (
    <section className="fi-relationship-health__suggestions" aria-labelledby="fi-relationship-health-suggestions">
      <h3 id="fi-relationship-health-suggestions" className="fi-relationship-health__section-title">
        {relationshipHealthDefaults.suggestionsTitle}
      </h3>

      {suggestions.length === 0 ? (
        <p className="fi-relationship-health__explanation-copy">
          {relationshipHealthUiCopy.suggestionsEmpty}
        </p>
      ) : (
        <ul className="fi-relationship-health__suggestions-list">
          {suggestions.map((suggestion) => (
            <li key={suggestion.id}>
              <article className={getFiRelationshipHealthSuggestionClassName()}>
                <a
                  href={suggestion.href}
                  className="fi-relationship-health__suggestion-link"
                  onClick={() =>
                    trackRelationshipHealthEvent("relationship_health_suggestion_selected", {
                      suggestionId: suggestion.id,
                    })
                  }
                >
                  <h4 className="fi-relationship-health__suggestion-title">{suggestion.title}</h4>
                  <p className="fi-relationship-health__suggestion-copy">{suggestion.description}</p>
                  {typeof suggestion.pointsGain === "number" && suggestion.pointsGain > 0 ? (
                    <p className="fi-relationship-health__suggestion-meta">
                      Up to +{suggestion.pointsGain} confidence
                    </p>
                  ) : null}
                </a>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
