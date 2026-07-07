import { FiCalendarBadge } from "@/app/components/badge/FiBadge";
import { getFiRecipientSectionClassName } from "@/app/components/recipient/recipientVariants";
import { recipientDefaults, type FiRecipientCardHistoryItem } from "@/app/recipient/recipientDomain";

export interface FiRecipientCardHistoryProps {
  items: FiRecipientCardHistoryItem[];
}

export function FiRecipientCardHistory({ items }: FiRecipientCardHistoryProps) {
  return (
    <section className={getFiRecipientSectionClassName()} aria-labelledby="fi-recipient-card-history">
      <h3 id="fi-recipient-card-history" className="fi-recipient__section-title">
        {recipientDefaults.cardHistoryTitle}
      </h3>

      {items.length === 0 ? (
        <p className="fi-recipient__copy">Card history will appear after the first draft or send.</p>
      ) : (
        <ul className="fi-recipient__card-history">
          {items.map((item) => (
            <li key={item.id} className="fi-recipient__card-item">
              <div>
                <p className="fi-recipient__status-label">{item.holiday}</p>
                <p className="fi-recipient__meta">Due {item.dueDate}</p>
              </div>
              <FiCalendarBadge status={item.badgeStatus} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
