import { Link } from "wouter";

import { FiButton } from "@/app/components/button/FiButton";
import { cardCreationDefaults, type CardCreationReviewSummary } from "@/app/card-creation/cardCreationDomain";
import { getFiCardCreationPanelClassName } from "@/app/components/card-creation/cardCreationVariants";
import type { Tone } from "@/lib/data";

export interface FiCardCreationReviewStepProps {
  review: CardCreationReviewSummary;
  selectedTone: Tone;
  draftText: string;
  onBack: () => void;
  onApprove: () => void;
}

export function FiCardCreationReviewStep({
  review,
  selectedTone,
  draftText,
  onBack,
  onApprove,
}: FiCardCreationReviewStepProps) {
  const { recipient } = review;
  const addressLine = recipient.mailingAddress?.line1
    ? [
        recipient.mailingAddress.line1,
        recipient.mailingAddress.line2,
        recipient.mailingAddress.city,
        recipient.mailingAddress.state,
        recipient.mailingAddress.zip,
      ]
        .filter(Boolean)
        .join(", ")
    : "No mailing address on file";

  return (
    <section className={getFiCardCreationPanelClassName()} aria-labelledby="card-creation-review-title">
      <div>
        <h2 id="card-creation-review-title" className="fi-card-creation__panel-title">
          {cardCreationDefaults.reviewStepTitle}
        </h2>
        <p className="fi-card-creation__panel-copy">{cardCreationDefaults.reviewStepDescription}</p>
      </div>

      <div className="fi-card-creation__review-grid">
        <div className="fi-card-creation__review-item">
          <span className="fi-card-creation__review-label">Card selection</span>
          <span className="fi-card-creation__review-value">{selectedTone} · {review.occasion}</span>
        </div>
        <div className="fi-card-creation__review-item">
          <span className="fi-card-creation__review-label">Envelope</span>
          <span className="fi-card-creation__review-value">{review.envelopeLabel}</span>
        </div>
        <div className="fi-card-creation__review-item">
          <span className="fi-card-creation__review-label">Handwriting</span>
          <span className="fi-card-creation__review-value">
            {review.handwritingLabel}
            {" · "}
            <Link href="/settings/reminders">Update in settings</Link>
          </span>
        </div>
        <div className="fi-card-creation__review-item">
          <span className="fi-card-creation__review-label">Address confirmation</span>
          <span className="fi-card-creation__review-value">
            {addressLine}
            {!review.hasMailingAddress ? (
              <>
                {" · "}
                <Link href={`/recipients/${recipient.id}`}>Add address</Link>
              </>
            ) : null}
          </span>
        </div>
        <div className="fi-card-creation__review-item">
          <span className="fi-card-creation__review-label">Delivery</span>
          <span className="fi-card-creation__review-value">{review.deliveryPreference}</span>
        </div>
      </div>

      <blockquote className="fi-card-creation__draft-text">{draftText}</blockquote>

      <div className="fi-card-creation__actions">
        <FiButton variant="secondary" onClick={onBack}>
          Back
        </FiButton>
        <FiButton
          variant="primary"
          onClick={onApprove}
          data-testid={`button-approve-${selectedTone.toLowerCase()}`}
        >
          {cardCreationDefaults.confirmLabel}
        </FiButton>
      </div>
    </section>
  );
}
