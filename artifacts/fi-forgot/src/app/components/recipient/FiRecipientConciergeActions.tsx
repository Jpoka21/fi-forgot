import { loadConciergeSuggestions } from "@/app/concierge-suggestions/conciergeSuggestionsEngine";
import { FiConciergeSuggestionCard } from "@/app/components/concierge-suggestions/FiConciergeSuggestionCard";
import { getFiRecipientSectionClassName } from "@/app/components/recipient/recipientVariants";
import { useAuth } from "@/lib/auth-context";
import type { Recipient } from "@/lib/data";

export interface FiRecipientConciergeActionsProps {
  recipient: Recipient;
}

export function FiRecipientConciergeActions({ recipient }: FiRecipientConciergeActionsProps) {
  const { user } = useAuth();
  const suggestions = loadConciergeSuggestions(user?.email)
    .filter((item) => !item.recipientName || item.recipientName === recipient.name)
    .slice(0, 3);

  if (suggestions.length === 0) return null;

  return (
    <section className={getFiRecipientSectionClassName()} aria-labelledby="fi-recipient-concierge">
      <h3 id="fi-recipient-concierge" className="fi-recipient__section-title">
        Concierge actions
      </h3>
      <ul className="fi-recipient__meta">
        {suggestions.map((suggestion, index) => (
          <li key={suggestion.id}>
            <FiConciergeSuggestionCard suggestion={suggestion} index={index} />
          </li>
        ))}
      </ul>
    </section>
  );
}
