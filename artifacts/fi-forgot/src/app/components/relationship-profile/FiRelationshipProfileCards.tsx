import type { CardOrder } from "@/lib/data";
import { cardPreviewMessage, cardStatusLabel } from "@/app/relationship-profile/relationshipProfileDomain";
import { getFiRelationshipProfileSectionClassName } from "@/app/components/relationship-profile/relationshipProfileVariants";

export interface FiRelationshipProfileCardsProps {
  cards: CardOrder[];
}

export function FiRelationshipProfileCards({ cards }: FiRelationshipProfileCardsProps) {
  if (cards.length === 0) return null;

  return (
    <section className={getFiRelationshipProfileSectionClassName()} aria-labelledby="fi-profile-cards">
      <div>
        <h2 id="fi-profile-cards" className="fi-relationship-profile__section-title">
          Cards you've sent
        </h2>
        <p className="fi-relationship-profile__section-subtitle">
          Your relationship history — not a transaction log.
        </p>
      </div>

      <ul className="fi-relationship-profile__list">
        {cards.slice(0, 5).map((card) => {
          const message = cardPreviewMessage(card);
          return (
            <li key={card.id} className="fi-relationship-profile__card">
              <div className="fi-relationship-profile__section-header">
                <h3 className="fi-relationship-profile__section-title">{card.holiday}</h3>
                <span className="fi-relationship-profile__meta">{cardStatusLabel(card.status)}</span>
              </div>
              {message ? (
                <p className="fi-relationship-profile__copy" style={{ fontStyle: "italic" }}>
                  {message.slice(0, 140)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
