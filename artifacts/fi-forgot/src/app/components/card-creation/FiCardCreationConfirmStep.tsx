import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { cardCreationDefaults } from "@/app/card-creation/cardCreationDomain";
import { getFiCardCreationPanelClassName } from "@/app/components/card-creation/cardCreationVariants";
import type { Recipient, Tone } from "@/lib/data";

export interface FiCardCreationConfirmStepProps {
  recipient?: Recipient;
  approvedTone: Tone;
  onStartOver: () => void;
}

export function FiCardCreationConfirmStep({
  recipient,
  approvedTone,
  onStartOver,
}: FiCardCreationConfirmStepProps) {
  return (
    <section className={getFiCardCreationPanelClassName()} aria-labelledby="card-creation-confirm-title">
      <div className="fi-card-creation__success-banner" role="status">
        <CheckCircle2 size={20} aria-hidden="true" />
        <div>
          <h2 id="card-creation-confirm-title" className="fi-card-creation__success-title">
            Card approved.
          </h2>
          <p className="fi-card-creation__success-copy">
            We&apos;ll get it printed and out the door for {recipient?.name ?? "your recipient"}.
            Your {approvedTone.toLowerCase()} version is locked in.
          </p>
        </div>
      </div>

      <div className="fi-card-creation__actions">
        <FiButton asChild variant="primary">
          <Link href="/dashboard">Back to dashboard</Link>
        </FiButton>
        <FiButton asChild variant="secondary">
          <Link href="/cards/review">View approval queue</Link>
        </FiButton>
        <FiButton variant="ghost" onClick={onStartOver}>
          {cardCreationDefaults.startOverLabel}
        </FiButton>
      </div>
    </section>
  );
}
