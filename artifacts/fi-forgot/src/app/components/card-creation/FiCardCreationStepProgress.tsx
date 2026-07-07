import { FiStepProgress } from "@/app/components/progress/FiStepProgress";
import { cardCreationSteps, type FiCardCreationStepId } from "@/app/card-creation/cardCreationDomain";

const VISIBLE_STEPS = cardCreationSteps.filter((item) => item.id !== "generate");

export interface FiCardCreationStepProgressProps {
  currentStep: FiCardCreationStepId;
}

function resolveVisibleIndex(step: FiCardCreationStepId): number {
  if (step === "generate") return VISIBLE_STEPS.findIndex((item) => item.id === "occasion");
  const index = VISIBLE_STEPS.findIndex((item) => item.id === step);
  return index >= 0 ? index : 0;
}

export function FiCardCreationStepProgress({ currentStep }: FiCardCreationStepProgressProps) {
  const currentIndex = resolveVisibleIndex(currentStep);

  return (
    <FiStepProgress
      steps={VISIBLE_STEPS.map((item) => ({ id: item.id, label: item.label }))}
      currentIndex={currentIndex}
      aria-label="Card creation progress"
    />
  );
}
