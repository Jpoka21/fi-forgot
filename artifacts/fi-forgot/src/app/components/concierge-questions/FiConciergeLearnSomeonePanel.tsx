import { useMemo } from "react";

import { FiConciergeQuestionExperience } from "@/app/components/concierge-questions";
import type { ConciergeRelationshipInsight } from "@/app/ai-concierge/aiConciergeDomain";
import { useRecipientConciergeQuestion } from "@/app/question-intelligence/hooks/useRecipientConciergeQuestion";
import { getRecipients } from "@/lib/data";

export function FiConciergeLearnSomeonePanel({
  insights,
}: {
  insights: ConciergeRelationshipInsight[];
}) {
  const recipientId = useMemo(() => {
    const namedInsight = insights.find((insight) => insight.recipientName);
    if (!namedInsight?.recipientName) return null;
    const match = getRecipients().find(
      (recipient) => recipient.name.trim().toLowerCase() === namedInsight.recipientName!.trim().toLowerCase(),
    );
    return match?.id ?? getRecipients()[0]?.id ?? null;
  }, [insights]);

  const question = useRecipientConciergeQuestion(recipientId);

  if (!recipientId || !question.recipient || !question.nextQuestion || question.questionSkipped) {
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
        recipient={question.recipient}
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
