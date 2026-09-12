import { FiConciergeQuestionExperience } from "@/app/components/concierge-questions";
import { selectConciergeInsightRecipientId, type ConciergeRelationshipInsight } from "@/app/ai-concierge/aiConciergeDomain";
import { useRecipientConciergeQuestion } from "@/app/question-intelligence/hooks/useRecipientConciergeQuestion";

export function FiConciergeLearnSomeonePanel({
  insights,
}: {
  insights: ConciergeRelationshipInsight[];
}) {
  const recipientId = selectConciergeInsightRecipientId(insights);

  const question = useRecipientConciergeQuestion(recipientId);

  const recipient = question.recipient;
  if (!recipientId || !recipient || String(recipient.id) !== String(recipientId) || !question.nextQuestion || question.questionSkipped) {
    return null;
  }

  return (
    <section className="fi-ai-concierge-page__panel" aria-labelledby="concierge-learn-title">
      <h2 id="concierge-learn-title" className="fi-ai-concierge-page__section-title">
        One thoughtful question
      </h2>
      <p className="fi-ai-concierge-page__section-copy">
        A calm check-in — only when it helps future cards feel more personal.
      </p>
      <FiConciergeQuestionExperience
        recipient={recipient}
        serverQuestion={question.nextQuestion}
        freshUpdates={question.freshUpdates}
        healthScore={question.healthScore}
        upcomingEvents={question.upcomingEvents}
        profileComplete={question.profileComplete}
        profileScore={question.profileScore}
        cards={question.cards}
        answerText={question.answerText}
        savingAnswer={question.savingAnswer}
        answerSaved={question.answerSaved}
        onAnswerTextChange={question.setAnswerText}
        onSaveAnswer={(payload) => void question.handleSaveAnswer(payload)}
        onSkip={() => question.setQuestionSkipped(true)}
        onRememberLater={() => question.setQuestionSkipped(true)}
      />
    </section>
  );
}
