import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

import { relationshipProfileDefaults } from "@/app/relationship-profile/relationshipProfileDomain";

export function FiRelationshipProfileNavigation() {
  return (
    <nav className="fi-relationship-profile__nav" aria-label="Relationship profile navigation">
      <Link href={relationshipProfileDefaults.backHref} className="fi-relationship-profile__nav-link">
        <ArrowLeft size={16} aria-hidden />
        {relationshipProfileDefaults.backLabel}
      </Link>
      <Link href={relationshipProfileDefaults.homeHref} className="fi-relationship-profile__nav-link">
        {relationshipProfileDefaults.homeLabel}
      </Link>
    </nav>
  );
}
