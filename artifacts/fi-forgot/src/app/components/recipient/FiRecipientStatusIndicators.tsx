import { getFiRecipientSectionClassName, getFiRecipientStatusClassName } from "@/app/components/recipient/recipientVariants";
import { recipientDefaults, type FiRecipientStatusIndicator } from "@/app/recipient/recipientDomain";

export interface FiRecipientStatusIndicatorsProps {
  statuses: FiRecipientStatusIndicator[];
}

export function FiRecipientStatusIndicators({ statuses }: FiRecipientStatusIndicatorsProps) {
  return (
    <section className={getFiRecipientSectionClassName()} aria-labelledby="fi-recipient-status">
      <h3 id="fi-recipient-status" className="fi-recipient__section-title">
        {recipientDefaults.statusTitle}
      </h3>
      <ul className="fi-recipient__status-list">
        {statuses.map((status) => (
          <li key={status.id}>
            <div className={getFiRecipientStatusClassName({ tone: status.tone })}>
              <p className="fi-recipient__status-label">{status.label}</p>
              {status.detail ? <p className="fi-recipient__copy">{status.detail}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
