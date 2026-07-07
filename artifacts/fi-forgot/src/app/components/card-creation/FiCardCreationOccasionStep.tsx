import { Sparkles } from "lucide-react";

import { FiButton } from "@/app/components/button/FiButton";
import { FiAiDraftingProgress } from "@/app/components/ai/FiAiDraftingProgress";
import { FiAiRetryExperience } from "@/app/components/ai/FiAiRetryExperience";
import { cardCreationDefaults } from "@/app/card-creation/cardCreationDomain";
import { getFiCardCreationPanelClassName } from "@/app/components/card-creation/cardCreationVariants";
import type { Recipient } from "@/lib/data";

export interface FiCardCreationOccasionStepProps {
  occasions: readonly string[];
  selectedOccasion: string;
  selectedRecipient?: Recipient;
  generating: boolean;
  generateError: string;
  onSelectOccasion: (occasion: string) => void;
  onBack: () => void;
  onGenerate: () => void;
  onRetry: () => void;
  onCancel: () => void;
}

export function FiCardCreationOccasionStep({
  occasions,
  selectedOccasion,
  selectedRecipient,
  generating,
  generateError,
  onSelectOccasion,
  onBack,
  onGenerate,
  onRetry,
  onCancel,
}: FiCardCreationOccasionStepProps) {
  return (
    <section className={getFiCardCreationPanelClassName()} aria-labelledby="card-creation-occasion-title">
      <div>
        <h2 id="card-creation-occasion-title" className="fi-card-creation__panel-title">
          {cardCreationDefaults.occasionStepTitle}
        </h2>
        <p className="fi-card-creation__panel-copy">{cardCreationDefaults.occasionStepDescription}</p>
      </div>

      {selectedRecipient?.tonePreference ? (
        <p className="fi-card-creation__tone-note">
          Preferred tone for {selectedRecipient.name}: <strong>{selectedRecipient.tonePreference}</strong>
        </p>
      ) : null}

      <div className="fi-card-creation__occasion-grid" role="listbox" aria-label="Occasions">
        {occasions.map((occasion) => {
          const selected = selectedOccasion === occasion;
          return (
            <button
              key={occasion}
              type="button"
              role="option"
              aria-selected={selected}
              className={`fi-card-creation__occasion-option${selected ? " fi-card-creation__occasion-option--selected" : ""}`}
              onClick={() => onSelectOccasion(occasion)}
              data-testid={`button-holiday-${occasion.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {occasion}
            </button>
          );
        })}
      </div>

      {generating ? (
        <FiAiDraftingProgress
          headline="ChatGPT is writing 3 personalized versions…"
          supportText={
            selectedRecipient
              ? `Using everything we know about ${selectedRecipient.name} to craft cards that actually sound like you wrote them.`
              : cardCreationDefaults.description
          }
        />
      ) : null}

      {generateError ? <FiAiRetryExperience description={generateError} onRetry={onRetry} /> : null}

      <div className="fi-card-creation__actions">
        <FiButton variant="secondary" onClick={onBack} disabled={generating} data-testid="button-step2-back">
          Back
        </FiButton>
        <FiButton
          variant="primary"
          onClick={onGenerate}
          disabled={!selectedOccasion || generating}
          loading={generating}
          leftIcon={generating ? undefined : <Sparkles size={16} />}
          data-testid="button-generate"
        >
          {generating ? cardCreationDefaults.generatingLabel : cardCreationDefaults.generateLabel}
        </FiButton>
        <FiButton variant="ghost" onClick={onCancel} disabled={generating}>
          {cardCreationDefaults.cancelLabel}
        </FiButton>
      </div>
    </section>
  );
}
