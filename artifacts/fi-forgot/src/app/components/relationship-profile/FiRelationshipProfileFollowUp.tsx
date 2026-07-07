import type { NextQuestion } from "@/app/relationship-profile/relationshipProfileDomain";
import { FiButton } from "@/app/components/button/FiButton";
import { getFiRelationshipProfileSectionClassName } from "@/app/components/relationship-profile/relationshipProfileVariants";

export interface FiRelationshipProfileFollowUpProps {
  firstName: string;
  nextQuestion: NextQuestion;
  questionModeLabel: string;
  answerText: string;
  savingAnswer: boolean;
  answerSaved: boolean;
  onAnswerTextChange: (value: string) => void;
  onSaveAnswer: () => void;
  onSkip: () => void;
}

export function FiRelationshipProfileFollowUp({
  firstName,
  nextQuestion,
  questionModeLabel,
  answerText,
  savingAnswer,
  answerSaved,
  onAnswerTextChange,
  onSaveAnswer,
  onSkip,
}: FiRelationshipProfileFollowUpProps) {
  return (
    <section className={getFiRelationshipProfileSectionClassName()} aria-labelledby="fi-profile-follow-up">
      <div className="fi-relationship-profile__section-header">
        <div>
          <h2 id="fi-profile-follow-up" className="fi-relationship-profile__section-title">
            Improve future cards
          </h2>
          <p className="fi-relationship-profile__section-subtitle">
            One thoughtful question — only when it helps.
          </p>
        </div>
        <FiButton variant="ghost" size="sm" onClick={onSkip}>
          Skip for now
        </FiButton>
      </div>

      <div className="fi-relationship-profile__card">
        <p className="fi-relationship-profile__meta">{questionModeLabel}</p>
        {nextQuestion.mode === "follow_up" && nextQuestion.followUp ? (
          <p className="fi-relationship-profile__copy">
            You mentioned: "{nextQuestion.followUp.originalAnswer.slice(0, 80)}
            {nextQuestion.followUp.originalAnswer.length > 80 ? "…" : ""}"
          </p>
        ) : null}
        <h3 className="fi-relationship-profile__section-title">{nextQuestion.question}</h3>
        <p className="fi-relationship-profile__copy">{nextQuestion.reason}</p>
        {!answerSaved ? (
          <>
            <textarea
              className="fi-relationship-profile__answer-input"
              value={answerText}
              onChange={(event) => onAnswerTextChange(event.target.value)}
              placeholder="Your answer…"
              rows={3}
            />
            <div className="fi-relationship-profile__actions">
              <FiButton variant="ghost" size="sm" onClick={onSkip}>
                Not now
              </FiButton>
              <FiButton
                variant="primary"
                size="sm"
                disabled={savingAnswer || !answerText.trim()}
                onClick={onSaveAnswer}
              >
                {savingAnswer ? "Saving…" : "Save answer"}
              </FiButton>
            </div>
          </>
        ) : (
          <p className="fi-relationship-profile__copy">
            Saved — this will make {firstName}'s next card feel more like you.
          </p>
        )}
      </div>
    </section>
  );
}
