import { Link } from "wouter";
import { Plus } from "lucide-react";

import { FiButton } from "@/app/components/button/FiButton";
import { recipientsListDefaults } from "@/app/recipients/recipientsListDomain";

export function FiRecipientsHeader() {
  return (
    <header className="fi-recipients__header">
      <div>
        <h1 className="fi-recipients__title">{recipientsListDefaults.title}</h1>
        <p className="fi-recipients__subtitle">{recipientsListDefaults.description}</p>
      </div>
      <FiButton asChild variant="primary">
        <Link href="/recipients/new" data-testid="link-add-recipient">
          <Plus size={16} aria-hidden="true" />
          {recipientsListDefaults.addLabel}
        </Link>
      </FiButton>
    </header>
  );
}
