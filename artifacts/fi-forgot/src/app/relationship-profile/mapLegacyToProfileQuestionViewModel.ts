import type { NextQuestion } from "@/app/relationship-profile/relationshipProfileDomain";
import type { ProfileQuestionViewModel } from "@/app/relationship-profile/profileQuestionViewModel";
import {
  CONVERSATIONAL_TEMPLATES,
  applyPhrase,
  getRelationshipPhrase,
  pickStableVariant,
} from "@/app/question-intelligence/questionIntelligenceDomain";
import type { Recipient } from "@/lib/data";

export function mapLegacyToProfileQuestionViewModel(
  nextQuestion: NextQuestion,
  recipient?: Recipient,
): ProfileQuestionViewModel {
  if (nextQuestion.mode !== "profile_gap") {
    throw new Error("mapLegacyToProfileQuestionViewModel requires profile_gap mode");
  }

  let question = nextQuestion.question;
  let explanation = nextQuestion.reason;

  if (recipient) {
    const template = CONVERSATIONAL_TEMPLATES.find(
      (entry) => entry.fieldKey === nextQuestion.fieldKey,
    );
    if (template) {
      const phrase = getRelationshipPhrase(recipient);
      const firstName = recipient.name.split(" ")[0] ?? "them";
      const seed = `${recipient.id}:${nextQuestion.fieldKey}:${nextQuestion.mode}`;
      question = applyPhrase(pickStableVariant(template.templates, seed), phrase, firstName);
      explanation = applyPhrase(template.reason, phrase, firstName);
    }
  }

  return {
    title: nextQuestion.fieldLabel,
    explanation,
    question,
    category: nextQuestion.category,
    priority: nextQuestion.priority,
    source: "profile_gap",
    saveFieldKey: nextQuestion.fieldKey,
    saveTriggerType: "profile_gap",
    followUpId: nextQuestion.followUp?.id,
  };
}
