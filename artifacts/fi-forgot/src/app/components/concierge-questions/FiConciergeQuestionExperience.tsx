import type { CardOrder, Recipient } from "@/lib/data";
import type {
  FreshUpdate,
  HealthScore,
  NextQuestion,
  TrackedEventData,
} from "@/app/relationship-profile/relationshipProfileDomain";
import { useQuestionIntelligence } from "@/app/question-intelligence/hooks/useQuestionIntelligence";
import { FiConciergePositiveSurprise } from "@/app/components/concierge-questions/FiConciergePositiveSurprise";
import { FiConciergeQuestionCard } from "@/app/components/concierge-questions/FiConciergeQuestionCard";

export interface FiConciergeQuestionExperienceProps {
  recipient: Recipient;
  serverQuestion: NextQuestion;
  freshUpdates: FreshUpdate[];
  healthScore: HealthScore | null;
  upcomingEvents: TrackedEventData[];
  profileComplete: boolean;
  profileScore?: number;
  cards: CardOrder[];
  answerText: string;
  savingAnswer: boolean;
  answerSaved: boolean;
  onAnswerTextChange: (value: string) => void;
  onSaveAnswer: (question: { fieldKey: string; question: string; mode: NextQuestion["mode"]; followUp?: NextQuestion["followUp"] }) => void;
  onSkip: () => void;
  onRememberLater: () => void;
}

export function FiConciergeQuestionExperience({
  recipient,
  serverQuestion,
  freshUpdates,
  healthScore,
  upcomingEvents,
  profileComplete,
  profileScore,
  cards,
  answerText,
  savingAnswer,
  answerSaved,
  onAnswerTextChange,
  onSaveAnswer,
  onSkip,
  onRememberLater,
}: FiConciergeQuestionExperienceProps) {
  const intelligence = useQuestionIntelligence({
    serverQuestion,
    recipient,
    freshUpdates,
    healthScore,
    upcomingEvents,
    profileComplete,
    profileScore,
    cards,
  });

  const active = intelligence.activeQuestion;
  if (!active) return null;

  const showSurprise =
    intelligence.orchestration?.positiveSurprise
    && (!active.shouldAskNow || intelligence.orchestration.confidence.stage === "mature");

  return (
    <>
      {showSurprise && intelligence.orchestration?.positiveSurprise ? (
        <FiConciergePositiveSurprise surprise={intelligence.orchestration.positiveSurprise} />
      ) : null}
      <FiConciergeQuestionCard
      recipientName={recipient.name}
      question={active}
      answerText={answerText}
      savingAnswer={savingAnswer}
      answerSaved={answerSaved}
      savedAffirmation={active.affirmationOnSave}
      onAnswerTextChange={onAnswerTextChange}
      onSaveAnswer={() =>
        onSaveAnswer({
          fieldKey: active.fieldKey,
          question: active.question,
          mode: active.mode,
          followUp: active.followUp,
        })}
      onSkip={onSkip}
      onAskSomethingElse={intelligence.askSomethingElse}
      onRememberLater={onRememberLater}
    />
    </>
  );
}
