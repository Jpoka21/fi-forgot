import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { getFiRecipientSectionClassName } from "@/app/components/recipient/recipientVariants";
import type { FiRecipientProfileSnapshot } from "@/app/recipient/recipientDomain";

export interface FiRecipientSuggestedImprovementsProps {
  profile: FiRecipientProfileSnapshot;
}

export function FiRecipientSuggestedImprovements({ profile }: FiRecipientSuggestedImprovementsProps) {
  const { recipient, health } = profile;
  const needsAttention = health.topGap !== "Profile looks great!";

  if (!needsAttention && !profile.activity.thinMemory) return null;

  const suggestions: Array<{ id: string; label: string; href: string }> = [];

  if (profile.activity.thinMemory || health.topGap.toLowerCase().includes("memory")) {
    suggestions.push({
      id: "memory",
      label: "Add a memory or recent update",
      href: `/recipients/${recipient.id}?action=add-memory`,
    });
  }

  if (health.topGap.toLowerCase().includes("occasion") || health.topGap.toLowerCase().includes("birthday")) {
    suggestions.push({
      id: "occasions",
      label: "Add important dates",
      href: `/recipients/${recipient.id}?edit=1`,
    });
  }

  if (health.topGap.toLowerCase().includes("address")) {
    suggestions.push({
      id: "address",
      label: "Confirm mailing address",
      href: `/recipients/${recipient.id}?edit=1`,
    });
  }

  if (suggestions.length === 0 && needsAttention) {
    suggestions.push({
      id: "profile",
      label: "Review profile details",
      href: `/recipients/${recipient.id}?edit=1`,
    });
  }

  return (
    <section className={getFiRecipientSectionClassName()} aria-labelledby="fi-recipient-suggestions">
      <h3 id="fi-recipient-suggestions" className="fi-recipient__section-title">
        Suggested improvements
      </h3>
      <p className="fi-recipient__copy">{health.topGap}</p>
      <ul className="fi-recipient__meta">
        {suggestions.map((item) => (
          <li key={item.id}>
            <FiButton asChild variant="ghost" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </FiButton>
          </li>
        ))}
      </ul>
    </section>
  );
}
