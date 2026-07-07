import { useParams } from "wouter";

import { useRelationshipProfilePage } from "@/app/relationship-profile/hooks/useRelationshipProfilePage";
import { FiRelationshipProfileCards } from "@/app/components/relationship-profile/FiRelationshipProfileCards";
import { FiRelationshipProfileComingUp } from "@/app/components/relationship-profile/FiRelationshipProfileComingUp";
import { FiConciergeQuestionExperience } from "@/app/components/concierge-questions";
import { FiRelationshipProfileHeader } from "@/app/components/relationship-profile/FiRelationshipProfileHeader";
import { FiRelationshipProfileHealthBar } from "@/app/components/relationship-profile/FiRelationshipProfileHealthBar";
import { FiRelationshipProfileInsights } from "@/app/components/relationship-profile/FiRelationshipProfileInsights";
import { FiRelationshipProfileLoadingState } from "@/app/components/relationship-profile/FiRelationshipProfileLoadingState";
import { FiRelationshipProfileMemories } from "@/app/components/relationship-profile/FiRelationshipProfileMemories";
import { FiRelationshipProfileNavigation } from "@/app/components/relationship-profile/FiRelationshipProfileNavigation";
import { FiRelationshipProfileOccasions } from "@/app/components/relationship-profile/FiRelationshipProfileOccasions";
import { FiRelationshipProfileProfileFields } from "@/app/components/relationship-profile/FiRelationshipProfileProfileFields";
import { FiRelationshipProfileShell } from "@/app/components/relationship-profile/FiRelationshipProfileShell";
import { FiRelationshipProfileTimelineSection } from "@/app/components/relationship-profile/FiRelationshipProfileTimelineSection";
import { getFiRelationshipProfileSectionClassName } from "@/app/components/relationship-profile/relationshipProfileVariants";

export function FiRelationshipProfilePage() {
  const params = useParams<{ id: string }>();
  const recipientId = params?.id ?? "";
  const profile = useRelationshipProfilePage(recipientId);

  const focusMemoryInput = () => {
    const element = document.getElementById("memory-input");
    element?.focus();
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (!profile.recipient) {
    return (
      <FiRelationshipProfileShell>
        <FiRelationshipProfileLoadingState />
      </FiRelationshipProfileShell>
    );
  }

  return (
    <FiRelationshipProfileShell recipientName={profile.recipient.name}>
      <FiRelationshipProfileNavigation />

      <FiRelationshipProfileHeader
        recipient={profile.recipient}
        recipientId={recipientId}
        nextEvent={profile.nextEvent}
        cardByEvent={profile.cardByEvent}
        onFocusMemory={focusMemoryInput}
      />

      <div className="fi-relationship-profile__layout">
        <div>
          <FiRelationshipProfileOccasions
            recipient={profile.recipient}
            showAddEvent={profile.showAddEvent}
            selectedEventChip={profile.selectedEventChip}
            newEventDate={profile.newEventDate}
            savingEvent={profile.savingEvent}
            onToggleAddEvent={() => {
              profile.setShowAddEvent((value) => !value);
              profile.setSelectedEventChip(null);
              profile.setNewEventDate("");
            }}
            onSelectEventChip={profile.setSelectedEventChip}
            onNewEventDateChange={profile.setNewEventDate}
            onAddHolidayEvent={profile.handleAddHolidayEvent}
            onRemoveEvent={profile.handleRemoveEvent}
            onAddDateEvent={profile.handleAddDateEvent}
          />

          <FiRelationshipProfileComingUp
            recipientId={recipientId}
            firstName={profile.firstName}
            upcomingEvents={profile.upcomingEvents}
            futureEvents={profile.futureEvents}
            eventsNeedingDate={profile.eventsNeedingDate}
            cardByEvent={profile.cardByEvent}
            onRequestDate={(event) => {
              profile.setShowAddEvent(true);
              profile.setSelectedEventChip(event);
              profile.setNewEventDate("");
            }}
          />

          <FiRelationshipProfileTimelineSection
            recipientId={recipientId}
            showTimeline={profile.showTimeline}
            onToggleTimeline={() => profile.setShowTimeline((value) => !value)}
            onLogMemory={focusMemoryInput}
          />

          <FiRelationshipProfileMemories
            firstName={profile.firstName}
            memoryText={profile.memoryText}
            savingMemory={profile.savingMemory}
            memorySaved={profile.memorySaved}
            freshLoading={profile.freshLoading}
            displayedMemories={profile.displayedMemories}
            freshUpdatesCount={profile.freshUpdates.length}
            showAllMemories={profile.showAllMemories}
            onMemoryTextChange={profile.setMemoryText}
            onSaveMemory={() => void profile.handleSaveMemory()}
            onToggleShowAll={() => profile.setShowAllMemories((value) => !value)}
          />

          {profile.nextQuestion && !profile.questionSkipped && profile.recipient ? (
            <FiConciergeQuestionExperience
              recipient={profile.recipient}
              serverQuestion={profile.nextQuestion}
              freshUpdates={profile.freshUpdates}
              healthScore={profile.healthScore}
              upcomingEvents={profile.upcomingEvents}
              profileComplete={profile.profileComplete}
              profileScore={profile.profileScore}
              cards={profile.cards}
              answerText={profile.answerText}
              savingAnswer={profile.savingAnswer}
              answerSaved={profile.answerSaved}
              onAnswerTextChange={profile.setAnswerText}
              onSaveAnswer={(question) => void profile.handleSaveAnswer(question)}
              onSkip={() => profile.setQuestionSkipped(true)}
              onRememberLater={() => profile.setQuestionSkipped(true)}
            />
          ) : null}

          <FiRelationshipProfileProfileFields
            recipient={profile.recipient}
            recipientId={recipientId}
            profileFields={profile.profileFields}
          />

          {profile.recipient.thingsToAvoid ? (
            <section className={getFiRelationshipProfileSectionClassName()} aria-labelledby="fi-profile-sensitive">
              <h2 id="fi-profile-sensitive" className="fi-relationship-profile__section-title">
                Handle with care
              </h2>
              <div className="fi-relationship-profile__card">
                <p className="fi-relationship-profile__copy">{profile.recipient.thingsToAvoid}</p>
              </div>
            </section>
          ) : null}

          <FiRelationshipProfileCards cards={profile.cards} />

          {profile.healthScore ? (
            <FiRelationshipProfileHealthBar healthScore={profile.healthScore} />
          ) : null}
        </div>

        <FiRelationshipProfileInsights recipientId={recipientId} />
      </div>
    </FiRelationshipProfileShell>
  );
}
