import type { ProfileQuestionViewModel } from "@/app/relationship-profile/profileQuestionViewModel";
import { FiProfileQuestionCard } from "@/app/components/relationship-profile/FiProfileQuestionCard";

export interface FiProfileQuestionExperienceProps {
  recipientName: string;
  profileQuestion: ProfileQuestionViewModel;
  answerText: string;
  savingAnswer: boolean;
  answerSaved: boolean;
  onAnswerTextChange: (value: string) => void;
  onSaveAnswer: () => void;
  onSkip: () => void;
  onRememberLater: () => void;
}

export function FiProfileQuestionExperience({
  recipientName,
  profileQuestion,
  answerText,
  savingAnswer,
  answerSaved,
  onAnswerTextChange,
  onSaveAnswer,
  onSkip,
  onRememberLater,
}: FiProfileQuestionExperienceProps) {
  return (
    <FiProfileQuestionCard
      recipientName={recipientName}
      question={profileQuestion}
      answerText={answerText}
      savingAnswer={savingAnswer}
      answerSaved={answerSaved}
      onAnswerTextChange={onAnswerTextChange}
      onSaveAnswer={onSaveAnswer}
      onSkip={onSkip}
      onRememberLater={onRememberLater}
    />
  );
}
