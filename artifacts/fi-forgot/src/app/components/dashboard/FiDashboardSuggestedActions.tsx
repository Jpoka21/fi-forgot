import { loadConciergeSuggestions } from "@/app/concierge-suggestions/conciergeSuggestionsEngine";
import { useAuth } from "@/lib/auth-context";
import { FiConciergeSuggestionCard } from "@/app/components/concierge-suggestions/FiConciergeSuggestionCard";
import { FiDashboardCard } from "@/app/components/card/FiCard";
import { getFiDashboardSectionClassName } from "@/app/components/dashboard/dashboardVariants";

export function FiDashboardSuggestedActions() {
  const { user } = useAuth();
  const suggestions = loadConciergeSuggestions(user?.email).slice(0, 3);

  return (
    <section
      className={getFiDashboardSectionClassName()}
      aria-labelledby="fi-dashboard-suggestions"
    >
      <div className="fi-dashboard__section-header">
        <div>
          <h2 id="fi-dashboard-suggestions" className="fi-dashboard__section-title">
            Suggested actions
          </h2>
          <p className="fi-dashboard__section-subtitle">Thoughtful next steps from your concierge.</p>
        </div>
      </div>

      {suggestions.length > 0 ? (
        <ul className="fi-dashboard__list">
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.id}>
              <FiConciergeSuggestionCard suggestion={suggestion} index={index} />
            </li>
          ))}
        </ul>
      ) : (
        <FiDashboardCard className="fi-dashboard__summary-card">
          <p className="fi-dashboard__section-copy">
            You're all caught up. We'll surface recommendations when something meaningful appears.
          </p>
        </FiDashboardCard>
      )}
    </section>
  );
}
