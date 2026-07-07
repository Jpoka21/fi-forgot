import { FiAiPanelLoadingSkeleton } from "@/app/components/ai/FiAiPanelLoadingSkeleton";
import { useCardCreation } from "@/app/card-creation/hooks/useCardCreation";
import { FiCardCreationConfirmStep } from "@/app/components/card-creation/FiCardCreationConfirmStep";
import { FiCardCreationDraftsStep } from "@/app/components/card-creation/FiCardCreationDraftsStep";
import { FiCardCreationEmptyState } from "@/app/components/card-creation/FiCardCreationRecipientStep";
import { FiCardCreationGenerateStep } from "@/app/components/card-creation/FiCardCreationGenerateStep";
import { FiCardCreationHeader } from "@/app/components/card-creation/FiCardCreationHeader";
import { FiCardCreationOccasionStep } from "@/app/components/card-creation/FiCardCreationOccasionStep";
import { FiCardCreationRecipientStep } from "@/app/components/card-creation/FiCardCreationRecipientStep";
import { FiCardCreationReviewStep } from "@/app/components/card-creation/FiCardCreationReviewStep";
import { FiCardCreationShell } from "@/app/components/card-creation/FiCardCreationShell";
import { FiCardCreationStepProgress } from "@/app/components/card-creation/FiCardCreationStepProgress";

export function FiCardCreationPage() {
  const creation = useCardCreation();

  if (creation.isEmpty) {
    return (
      <FiCardCreationShell>
        <FiCardCreationHeader />
        <FiCardCreationEmptyState onCancel={creation.cancel} />
      </FiCardCreationShell>
    );
  }

  return (
    <FiCardCreationShell>
      <FiCardCreationHeader />
      <FiCardCreationStepProgress currentStep={creation.step} />

      {creation.step === "recipient" ? (
        <FiCardCreationRecipientStep
          recipients={creation.recipients}
          selectedRecipientId={creation.selectedRecipientId}
          onSelectRecipient={creation.setSelectedRecipientId}
          onNext={creation.goNext}
          onCancel={creation.cancel}
        />
      ) : null}

      {creation.step === "occasion" ? (
        <FiCardCreationOccasionStep
          occasions={creation.occasions}
          selectedOccasion={creation.selectedOccasion}
          selectedRecipient={creation.selectedRecipient}
          generating={creation.generating}
          generateError={creation.generateError}
          onSelectOccasion={creation.setSelectedOccasion}
          onBack={creation.goBack}
          onGenerate={() => void creation.generate()}
          onRetry={creation.retryGeneration}
          onCancel={creation.cancel}
        />
      ) : null}

      {creation.step === "generate" ? (
        creation.isLoading ? (
          <FiCardCreationGenerateStep selectedRecipient={creation.selectedRecipient} />
        ) : (
          <FiAiPanelLoadingSkeleton />
        )
      ) : null}

      {creation.step === "drafts" ? (
        <FiCardCreationDraftsStep
          recipient={creation.selectedRecipient}
          occasion={creation.selectedOccasion}
          cards={creation.cards}
          editedTexts={creation.editedTexts}
          selectedTone={creation.selectedTone}
          onSelectTone={creation.selectTone}
          onEditText={creation.setEditedText}
          onSaveDraft={creation.saveDraft}
          onContinue={creation.goNext}
          onBack={creation.goBack}
          onStartOver={creation.startOver}
        />
      ) : null}

      {creation.step === "review" && creation.reviewSummary && creation.selectedTone ? (
        <FiCardCreationReviewStep
          review={creation.reviewSummary}
          selectedTone={creation.selectedTone}
          draftText={creation.selectedDraftText}
          onBack={creation.goBack}
          onApprove={creation.approve}
        />
      ) : null}

      {creation.step === "confirm" && creation.approvedTone ? (
        <FiCardCreationConfirmStep
          recipient={creation.selectedRecipient}
          approvedTone={creation.approvedTone}
          onStartOver={creation.startOver}
        />
      ) : null}
    </FiCardCreationShell>
  );
}
