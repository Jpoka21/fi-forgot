import { illustrationPaths } from "@/app/design/assets/illustrationPaths";
import type { ConciergeQuestion } from "@/app/question-intelligence/questionIntelligenceDomain";
import { conciergeQuestionDefaults } from "@/app/question-intelligence/questionIntelligenceDomain";
import { FiButton } from "@/app/components/button/FiButton";

export interface FiConciergeQuestionCardProps {
  recipientName: string;
  question: ConciergeQuestion;
  answerText: string;
  savingAnswer: boolean;
  answerSaved: boolean;
  savedAffirmation?: string;
  onAnswerTextChange: (value: string) => void;
  onSaveAnswer: () => void;
  onSkip: () => void;
  onAskSomethingElse?: () => void;
  onRememberLater?: () => void;
}

export function FiConciergeQuestionCard({
  recipientName,
  question,
  answerText,
  savingAnswer,
  answerSaved,
  savedAffirmation,
  onAnswerTextChange,
  onSaveAnswer,
  onSkip,
  onAskSomethingElse,
  onRememberLater,
}: FiConciergeQuestionCardProps) {
  if (!question.shouldAskNow && question.maturityMessage) {
    return (
      <section className="fi-concierge-question" aria-labelledby="fi-concierge-question-title">
        <div className="fi-concierge-question__paper fi-concierge-question__paper--mature">
          <img
            src={illustrationPaths.loading.success}
            alt=""
            aria-hidden
            className="fi-concierge-question__illustration"
          />
          <p className="fi-concierge-question__eyebrow">{conciergeQuestionDefaults.sectionEyebrow}</p>
          <h2 id="fi-concierge-question-title" className="fi-concierge-question__title">
            {conciergeQuestionDefaults.matureTitle}
          </h2>
          {question.confidenceScore !== undefined ? (
            <p className="fi-concierge-question__confidence" aria-label={`Relationship confidence ${question.confidenceScore} percent`}>
              {question.confidenceScore}% confidence
            </p>
          ) : null}
          <p className="fi-concierge-question__reason">{question.maturityMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="fi-concierge-question" aria-labelledby="fi-concierge-question-title">
      <div className="fi-concierge-question__paper">
        <div className="fi-concierge-question__header">
          <img
            src={illustrationPaths.onboarding.daveWelcome}
            alt=""
            aria-hidden
            className="fi-concierge-question__illustration"
          />
          <div>
            <p className="fi-concierge-question__eyebrow">{conciergeQuestionDefaults.sectionEyebrow}</p>
            {question.progressLabel ? (
              <p className="fi-concierge-question__progress">{question.progressLabel}</p>
            ) : null}
            {question.confidenceScore !== undefined ? (
              <p className="fi-concierge-question__confidence" aria-label={`Relationship confidence ${question.confidenceScore} percent`}>
                {question.confidenceScore}% confidence
              </p>
            ) : null}
          </div>
        </div>

        {question.contextNote ? (
          <p className="fi-concierge-question__context">{question.contextNote}</p>
        ) : null}

        <h2 id="fi-concierge-question-title" className="fi-concierge-question__title">
          {question.question}
        </h2>
        <p className="fi-concierge-question__reason">{question.reason}</p>

        {!answerSaved ? (
          <>
            <label htmlFor="fi-concierge-question-answer" className="sr-only">
              Your answer about {recipientName}
            </label>
            <textarea
              id="fi-concierge-question-answer"
              className="fi-concierge-question__textarea"
              value={answerText}
              onChange={(event) => onAnswerTextChange(event.target.value)}
              placeholder={conciergeQuestionDefaults.placeholder}
              rows={4}
              disabled={savingAnswer}
            />

            <div className="fi-concierge-question__actions" role="group" aria-label="Question actions">
              <FiButton variant="ghost" size="sm" onClick={onSkip} disabled={savingAnswer}>
                {conciergeQuestionDefaults.skipLabel}
              </FiButton>
              {onAskSomethingElse ? (
                <FiButton variant="ghost" size="sm" onClick={onAskSomethingElse} disabled={savingAnswer}>
                  {conciergeQuestionDefaults.alternateLabel}
                </FiButton>
              ) : null}
              {onRememberLater ? (
                <FiButton variant="ghost" size="sm" onClick={onRememberLater} disabled={savingAnswer}>
                  {conciergeQuestionDefaults.rememberLaterLabel}
                </FiButton>
              ) : null}
              <FiButton
                variant="primary"
                size="sm"
                onClick={onSaveAnswer}
                disabled={savingAnswer || !answerText.trim()}
                loading={savingAnswer}
              >
                {savingAnswer ? conciergeQuestionDefaults.savingLabel : conciergeQuestionDefaults.saveLabel}
              </FiButton>
            </div>
          </>
        ) : (
          <p className="fi-concierge-question__affirmation" role="status">
            {savedAffirmation ?? question.affirmationOnSave}
          </p>
        )}
      </div>
    </section>
  );
}
