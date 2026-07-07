import { Link } from "wouter";

import { recipientHasThinMemory } from "@/lib/personal-brand";
import type { Recipient } from "@/lib/data";
import type { ProfileField } from "@/app/relationship-profile/relationshipProfileDomain";
import { FiButton } from "@/app/components/button/FiButton";
import { getFiRelationshipProfileSectionClassName } from "@/app/components/relationship-profile/relationshipProfileVariants";

export interface FiRelationshipProfileProfileFieldsProps {
  recipient: Recipient;
  recipientId: string;
  profileFields: ProfileField[];
}

export function FiRelationshipProfileProfileFields({
  recipient,
  recipientId,
  profileFields,
}: FiRelationshipProfileProfileFieldsProps) {
  return (
    <section className={getFiRelationshipProfileSectionClassName()} aria-labelledby="fi-profile-fields">
      <div className="fi-relationship-profile__section-header">
        <div>
          <h2 id="fi-profile-fields" className="fi-relationship-profile__section-title">
            What we know about them
          </h2>
          <p className="fi-relationship-profile__section-subtitle">
            Thoughtful notes that shape future cards.
          </p>
        </div>
        <FiButton asChild variant="ghost" size="sm">
          <Link href={`/recipients/${recipientId}?edit=1`}>Edit details</Link>
        </FiButton>
      </div>

      <div className="fi-relationship-profile__card">
        {profileFields.length === 0 ? (
          <>
            <p className="fi-relationship-profile__copy">
              {recipientHasThinMemory(recipient)
                ? "A memory or two helps us write cards that sound like you."
                : "Tell us what makes them tick — we'll remember for you."}
            </p>
            <FiButton asChild variant="secondary" size="sm">
              <Link href={`/recipients/${recipientId}?edit=1`}>Add details</Link>
            </FiButton>
          </>
        ) : (
          <ul className="fi-relationship-profile__list">
            {profileFields.map((field) => (
              <li key={field.key}>
                <p className="fi-relationship-profile__meta">{field.key}</p>
                <p className="fi-relationship-profile__copy">{field.value}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
