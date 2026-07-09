import { illustrationPaths } from "@/app/design/assets/illustrationPaths";
import { conciergeQuestionDefaults } from "@/app/question-intelligence/questionIntelligenceDomain";
import { FiButton } from "@/app/components/button/FiButton";
import type { ProfileQuestionViewModel } from "@/app/relationship-profile/profileQuestionViewModel";

export interface FiProfileQuestionCardProps {
  recipientName: string;
  question: ProfileQuestionViewModel;
  answerText: string;
  savingAnswer: boolean;
  answerSaved: boolean;
  onAnswerTextChange: (value: string) => void;
  onSaveAnswer: () => void;
  onSkip: () => void;
  onRememberLater: () => void;
}

export function FiProfileQuestionCard({
  recipientName,
  question,
  answerText,
  savingAnswer,
  answerSaved,
  onAnswerTextChange,
  onSaveAnswer,
  onSkip,
  onRememberLater,
}: FiProfileQuestionCardProps) {
  return (
    <section className="fi-concierge-question" aria-labelledby="fi-profile-question-title">
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
            <p className="fi-concierge-question__progress">{question.title}</p>
          </div>
        </div>

        <h2 id="fi-profile-question-title" className="fi-concierge-question__title">
          {question.question}
        </h2>
        <p className="fi-concierge-question__reason">{question.explanation}</p>

        {!answerSaved ? (
          <>
            <label htmlFor="fi-profile-question-answer" className="sr-only">
              Your answer about {recipientName}
            </label>
            <textarea
              id="fi-profile-question-answer"
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
              <FiButton variant="ghost" size="sm" onClick={onRememberLater} disabled={savingAnswer}>
                {conciergeQuestionDefaults.rememberLaterLabel}
              </FiButton>
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
            {conciergeQuestionDefaults.saveLabel} — thanks, that helps.
          </p>
        )}
      </div>
    </section>
  );
}
