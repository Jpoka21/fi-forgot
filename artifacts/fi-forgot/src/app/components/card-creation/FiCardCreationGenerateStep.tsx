import { FiAiDraftingProgress } from "@/app/components/ai/FiAiDraftingProgress";
import { cardCreationDefaults } from "@/app/card-creation/cardCreationDomain";
import { getFiCardCreationPanelClassName } from "@/app/components/card-creation/cardCreationVariants";
import type { Recipient } from "@/lib/data";

export interface FiCardCreationGenerateStepProps {
  selectedRecipient?: Recipient;
}

export function FiCardCreationGenerateStep({ selectedRecipient }: FiCardCreationGenerateStepProps) {
  return (
    <section className={getFiCardCreationPanelClassName()} aria-busy="true" aria-live="polite">
      <FiAiDraftingProgress
        headline="ChatGPT is writing 3 personalized versions…"
        supportText={
          selectedRecipient
            ? `Using everything we know about ${selectedRecipient.name} to craft cards that actually sound like you wrote them.`
            : cardCreationDefaults.description
        }
      />
    </section>
  );
}
