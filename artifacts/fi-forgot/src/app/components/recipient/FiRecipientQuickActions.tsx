import { trackRecipientEvent } from "@/app/recipient/recipientAnalytics";
import { recipientDefaults, type FiRecipientQuickAction } from "@/app/recipient/recipientDomain";
import { getFiRecipientQuickActionClassName, getFiRecipientSectionClassName } from "@/app/components/recipient/recipientVariants";

export interface FiRecipientQuickActionsProps {
  actions: FiRecipientQuickAction[];
}

export function FiRecipientQuickActions({ actions }: FiRecipientQuickActionsProps) {
  return (
    <section className={getFiRecipientSectionClassName()} aria-labelledby="fi-recipient-quick-actions">
      <h3 id="fi-recipient-quick-actions" className="fi-recipient__section-title">
        {recipientDefaults.quickActionsTitle}
      </h3>
      <ul className="fi-recipient__quick-actions">
        {actions.map((action) => (
          <li key={action.id}>
            <a
              href={action.href}
              className={getFiRecipientQuickActionClassName()}
              onClick={() =>
                trackRecipientEvent("recipient_action_selected", {
                  actionId: action.id,
                })
              }
            >
              <p className="fi-recipient__quick-action-title">{action.label}</p>
              <p className="fi-recipient__copy">{action.description}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
