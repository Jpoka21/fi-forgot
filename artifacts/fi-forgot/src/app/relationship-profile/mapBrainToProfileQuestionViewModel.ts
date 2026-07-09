import type { ProductBrainDecision, FollowUpQuestionCategory } from "@/app/product-brain/productBrainDecisionTypes";
import type {
  ProfileQuestionSaveTriggerType,
  ProfileQuestionViewModel,
} from "@/app/relationship-profile/profileQuestionViewModel";

function saveTriggerTypeForCategory(
  category: FollowUpQuestionCategory,
): ProfileQuestionSaveTriggerType {
  if (category === "life_event_follow_up" || category === "accomplishment_follow_up") {
    return "follow_up";
  }
  return "fresh_update";
}

export function mapBrainToProfileQuestionViewModel(
  decision: ProductBrainDecision,
): ProfileQuestionViewModel {
  const selected = decision.selectedFollowUpQuestion;
  if (!selected) {
    throw new Error("mapBrainToProfileQuestionViewModel requires selectedFollowUpQuestion");
  }

  return {
    title: decision.display.title,
    explanation: decision.display.explanation,
    question: selected.questionText,
    category: selected.category,
    priority: decision.actionPlan.priority,
    source: "brain",
    saveFieldKey: selected.questionId,
    saveTriggerType: saveTriggerTypeForCategory(selected.category),
  };
}
